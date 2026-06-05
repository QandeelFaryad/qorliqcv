import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";

import { pricingPlans } from "@/lib/pricingPlans";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ServiceOrder from "@/models/ServiceOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function makePhone(countryCode, number) {
  const code = cleanText(countryCode);
  const mobile = cleanText(number);

  if (!code && !mobile) return "";

  return `${code}${mobile}`.replace(/\s+/g, "");
}

function getAmountInPence(plan) {
  if (typeof plan.amount === "number") return plan.amount;
  if (typeof plan.amountPence === "number") return plan.amountPence;
  if (typeof plan.priceInPence === "number") return plan.priceInPence;

  const priceText = cleanText(plan.price);
  const numericPrice = Number(priceText.replace(/[^\d.]/g, ""));

  if (!numericPrice || Number.isNaN(numericPrice)) return 0;

  return Math.round(numericPrice * 100);
}

function getStripePriceId(plan, useOfferPrice = false) {
  const directPriceId =
    cleanText(plan.stripePriceId) ||
    cleanText(plan.priceId) ||
    cleanText(plan.stripe_price_id);

  if (directPriceId) return directPriceId;

  const envKey =
    useOfferPrice && cleanText(plan.stripeOfferPriceEnv)
      ? cleanText(plan.stripeOfferPriceEnv)
      : cleanText(plan.stripeStandardPriceEnv) ||
        cleanText(plan.stripePriceEnv);

  if (!envKey) return "";

  return cleanText(process.env[envKey]);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(email));
}

function buildAddress(customerDetails) {
  return {
    line1: customerDetails.addressLine1,
    line2: customerDetails.addressLine2 || undefined,
    city: customerDetails.city,
    postal_code: customerDetails.postalCode,
    country: customerDetails.country,
  };
}

function buildCustomerDetails(customerForm = {}) {
  return {
    firstName: cleanText(customerForm.firstName),
    lastName: cleanText(customerForm.lastName),
    email: cleanText(customerForm.email).toLowerCase(),

    mobileCountryCode: cleanText(customerForm.mobileCountryCode),
    mobileCountryFlag: cleanText(customerForm.mobileCountryFlag),
    mobileNumber: cleanText(customerForm.mobileNumber),

    country: cleanText(customerForm.country).toUpperCase(),
    countryName: cleanText(customerForm.countryName),
    countryFlag: cleanText(customerForm.countryFlag),

    postalCode: cleanText(customerForm.postalCode),
    addressLine1: cleanText(customerForm.addressLine1),
    addressLine2: cleanText(customerForm.addressLine2),
    city: cleanText(customerForm.city),
  };
}

function hasMissingBillingDetails(customerDetails) {
  return (
    !customerDetails.firstName ||
    !customerDetails.lastName ||
    !customerDetails.email ||
    !customerDetails.mobileNumber ||
    !customerDetails.country ||
    !customerDetails.postalCode ||
    !customerDetails.addressLine1 ||
    !customerDetails.city
  );
}

export async function POST(req) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Stripe secret key is missing.",
        },
        { status: 500 }
      );
    }

    await connectDB();

    const body = await req.json();

    const planId = cleanText(body.planId);
    const cvId = cleanText(body.cvId);
    const template = cleanText(body.template);

    if (!planId) {
      return NextResponse.json(
        {
          success: false,
          error: "Package is required.",
        },
        { status: 400 }
      );
    }

    const selectedPlan = pricingPlans.find((plan) => plan.id === planId);

    if (!selectedPlan) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid package selected.",
        },
        { status: 400 }
      );
    }

    const serviceId = cleanText(selectedPlan.serviceId) || "cv-builder";

    const isCvBuilderPlan = serviceId === "cv-builder";
    const isLogoPlan = serviceId === "logo-design";
    const isAdsPlan = serviceId === "ads";
    const isGuestServicePlan = isLogoPlan || isAdsPlan;
    const isSubscription = selectedPlan.type === "subscription";

    const customerDetails = buildCustomerDetails(body.customerForm || {});

    if (hasMissingBillingDetails(customerDetails)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please complete all required billing details.",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(customerDetails.email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (isCvBuilderPlan && !session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Login required for CV Builder.",
        },
        { status: 401 }
      );
    }

    const customerEmail = isCvBuilderPlan
      ? cleanText(session.user.email).toLowerCase()
      : customerDetails.email;

    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer email is required.",
        },
        { status: 400 }
      );
    }

    let user = null;
    let stripeCustomerId = "";

    if (isCvBuilderPlan) {
      user = await User.findOne({ email: customerEmail });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found.",
          },
          { status: 404 }
        );
      }

      stripeCustomerId = cleanText(user.stripeCustomerId);
    }

    const fullName = `${customerDetails.firstName} ${customerDetails.lastName}`.trim();

    const phone = makePhone(
      customerDetails.mobileCountryCode,
      customerDetails.mobileNumber
    );

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: fullName,
        phone,
        address: buildAddress(customerDetails),
        metadata: {
          serviceId,
          planId,
          cvId,
          template,
          checkoutType: isGuestServicePlan ? "guest" : "logged-in",
        },
      });

      stripeCustomerId = customer.id;

      if (isCvBuilderPlan && user) {
        user.stripeCustomerId = stripeCustomerId;
        await user.save();
      }
    } else {
      await stripe.customers.update(stripeCustomerId, {
        email: customerEmail,
        name: fullName,
        phone,
        address: buildAddress(customerDetails),
      });
    }

    if (isCvBuilderPlan && user) {
      user.billingDetails = {
        firstName: customerDetails.firstName,
        lastName: customerDetails.lastName,
        email: customerDetails.email,

        mobileCountryCode: customerDetails.mobileCountryCode,
        mobileCountryFlag: customerDetails.mobileCountryFlag,
        mobileNumber: customerDetails.mobileNumber,
        phone,

        country: customerDetails.country,
        countryName: customerDetails.countryName,
        countryFlag: customerDetails.countryFlag,

        postalCode: customerDetails.postalCode,
        addressLine1: customerDetails.addressLine1,
        addressLine2: customerDetails.addressLine2,
        city: customerDetails.city,
      };

      await user.save();
    }

    const metadata = {
      userId: user?._id?.toString() || "",
      email: customerEmail,

      serviceId,
      planId,
      plan: planId,
      planName: cleanText(selectedPlan.name),
      planType: cleanText(selectedPlan.type),

      cvId,
      template,

      billingFirstName: customerDetails.firstName,
      billingLastName: customerDetails.lastName,
      billingEmail: customerDetails.email,
      billingMobileCountryCode: customerDetails.mobileCountryCode,
      billingMobileNumber: customerDetails.mobileNumber,
      billingCountry: customerDetails.country,
      billingCountryName: customerDetails.countryName,
      billingPostalCode: customerDetails.postalCode,
      billingAddressLine1: customerDetails.addressLine1,
      billingAddressLine2: customerDetails.addressLine2,
      billingCity: customerDetails.city,

      checkoutType: isGuestServicePlan ? "guest" : "logged-in",
    };

    /*
      Subscription:
      - Only CV Builder subscription allowed
      - Stripe price ID required
    */
    if (isSubscription) {
      if (!isCvBuilderPlan) {
        return NextResponse.json(
          {
            success: false,
            error: "Subscriptions are only allowed for CV Builder.",
          },
          { status: 400 }
        );
      }

      const stripePriceId = getStripePriceId(selectedPlan);

      if (!stripePriceId) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Stripe subscription price ID is missing. Add stripePriceId in pricingPlans for this subscription package.",
          },
          { status: 500 }
        );
      }

      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],

        automatic_tax: {
          enabled: true,
        },

        payment_behavior: "default_incomplete",

        payment_settings: {
          save_default_payment_method: "on_subscription",
        },

        metadata,

        expand: [
          "latest_invoice.confirmation_secret",
          "latest_invoice.payment_intent",
          "pending_setup_intent",
        ],
      });

      const latestInvoice = subscription.latest_invoice;

      const paymentIntent =
        latestInvoice && typeof latestInvoice !== "string"
          ? latestInvoice.payment_intent
          : null;

      const confirmationSecret =
        latestInvoice && typeof latestInvoice !== "string"
          ? latestInvoice.confirmation_secret
          : null;

      const pendingSetupIntent = subscription.pending_setup_intent;

      const clientSecret =
        paymentIntent?.client_secret ||
        confirmationSecret?.client_secret ||
        pendingSetupIntent?.client_secret ||
        "";

      const secretType = paymentIntent?.client_secret
        ? "payment_intent"
        : confirmationSecret?.client_secret
          ? "confirmation_secret"
          : pendingSetupIntent?.client_secret
            ? "setup_intent"
            : "";

      if (!clientSecret) {
        console.error("Stripe subscription created but no client secret found:", {
          subscriptionId: subscription.id,
          status: subscription.status,
          latestInvoice,
          pendingSetupIntent,
        });

        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to create subscription payment. Please check Stripe recurring price, tax settings, and invoice status.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        type: "subscription",
        clientSecret,
        secretType,
        subscriptionId: subscription.id,
        paymentIntentId: paymentIntent?.id || "",
        serviceId,
        planId,
      });
    }

    /*
      One-time payment:
      - CV Builder one-time allowed
      - Logo Design guest checkout allowed
      - Ads guest checkout allowed
    */
    const amount = getAmountInPence(selectedPlan);

    if (!amount || amount < 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment amount.",
        },
        { status: 400 }
      );
    }

    let serviceOrderId = "";

    if (isGuestServicePlan) {
      const serviceOrder = await ServiceOrder.create({
        serviceId,
        serviceName:
          cleanText(selectedPlan.serviceName) ||
          cleanText(selectedPlan.name) ||
          serviceId,

        planId,
        planName: cleanText(selectedPlan.name),
        planType: cleanText(selectedPlan.type) || "payment",

        baseAmount: amount,
        taxAmount: 0,
        totalAmount: amount,
        currency: "gbp",

        orderStatus: "new",
        paymentStatus: "pending",

        stripeCustomerId,
        stripePaymentIntentId: "",

        customer: {
          ...customerDetails,
          fullName,
          phone,
        },

        metadata: {
          cvId,
          template,
          checkoutType: "guest",
        },
      });

      serviceOrderId = serviceOrder._id.toString();
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "gbp",
      customer: stripeCustomerId,
      receipt_email: customerEmail,

      automatic_payment_methods: {
        enabled: true,
      },

      metadata: {
        ...metadata,
        serviceOrderId,
      },

      description: `${cleanText(selectedPlan.name) || "Service"} - ${serviceId}`,

      shipping: {
        name: fullName,
        phone,
        address: buildAddress(customerDetails),
      },
    });

    if (!paymentIntent.client_secret) {
      if (serviceOrderId) {
        await ServiceOrder.findByIdAndUpdate(serviceOrderId, {
          paymentStatus: "failed",
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: "Unable to create payment intent.",
        },
        { status: 500 }
      );
    }

    if (serviceOrderId) {
      await ServiceOrder.findByIdAndUpdate(serviceOrderId, {
        stripePaymentIntentId: paymentIntent.id,
      });
    }

    return NextResponse.json({
      success: true,
      type: "one-time",
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      serviceOrderId,
      serviceId,
      planId,
    });
  } catch (error) {
    console.error("Create checkout intent error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unable to load payment form.",
      },
      { status: 500 }
    );
  }
}