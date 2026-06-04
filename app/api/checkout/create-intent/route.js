import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { pricingPlans } from "@/lib/pricingPlans";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

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

function getNumericAmountFromPrice(priceText) {
  const numeric = Number(String(priceText || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function getCvBuilderOfferInfo(user, selectedPlan) {
  const isCvBuilder = selectedPlan.serviceId === "cv-builder";

  const hasOffer =
    Boolean(selectedPlan.stripeOfferPriceEnv) &&
    Boolean(selectedPlan.stripeStandardPriceEnv) &&
    Boolean(selectedPlan.offerDurationMinutes);

  if (!isCvBuilder || !hasOffer) {
    return {
      isOfferPlan: false,
      offerActive: false,
      priceEnv: selectedPlan.stripePriceEnv,
      startedAt: null,
      expiresAt: null,
    };
  }

  const now = new Date();

  let startedAt = user.cvBuilderOfferStartedAt;

  if (!startedAt) {
    startedAt = now;
    user.cvBuilderOfferStartedAt = startedAt;
  }

  const durationMs = Number(selectedPlan.offerDurationMinutes || 10) * 60 * 1000;
  const expiresAt = new Date(new Date(startedAt).getTime() + durationMs);

  const offerActive = now.getTime() <= expiresAt.getTime();

  return {
    isOfferPlan: true,
    offerActive,
    priceEnv: offerActive
      ? selectedPlan.stripeOfferPriceEnv
      : selectedPlan.stripeStandardPriceEnv,
    startedAt,
    expiresAt,
  };
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

    const sessionUser = await getServerSession(authOptions);

    if (!sessionUser?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Please login first.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: sessionUser.user.email.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { planId, cvId, template, customerForm = {} } = body;

    if (!planId) {
      return NextResponse.json(
        {
          success: false,
          error: "Plan ID is missing.",
        },
        { status: 400 }
      );
    }

    const selectedPlan = pricingPlans.find((plan) => plan.id === planId);

    if (!selectedPlan) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid plan selected.",
        },
        { status: 400 }
      );
    }

    const serviceId = selectedPlan.serviceId || "cv-builder";
    const serviceName = selectedPlan.serviceName || "CV Builder";

    if (selectedPlan.type === "subscription" && serviceId !== "cv-builder") {
      return NextResponse.json(
        {
          success: false,
          error: "Only CV Builder plans can be subscription plans.",
        },
        { status: 400 }
      );
    }

    const offerInfo = getCvBuilderOfferInfo(user, selectedPlan);

    if (offerInfo.isOfferPlan && !user.cvBuilderOfferStartedAt) {
      await user.save();
    }

    const activeStripePriceEnv = offerInfo.priceEnv || selectedPlan.stripePriceEnv;
    const stripePriceId = process.env[activeStripePriceEnv];

    if (!stripePriceId) {
      return NextResponse.json(
        {
          success: false,
          error: `${activeStripePriceEnv} is missing in .env.local.`,
        },
        { status: 500 }
      );
    }

    if (!stripePriceId.startsWith("price_")) {
      return NextResponse.json(
        {
          success: false,
          error: `${activeStripePriceEnv} must be a Stripe Price ID starting with price_. You used ${stripePriceId}`,
        },
        { status: 400 }
      );
    }

    const customerDetails = {
      firstName: cleanText(customerForm?.firstName),
      lastName: cleanText(customerForm?.lastName),
      email:
        cleanText(customerForm?.email).toLowerCase() ||
        user.email.toLowerCase().trim(),

      mobileCountryCode: cleanText(customerForm?.mobileCountryCode),
      mobileCountryFlag: cleanText(customerForm?.mobileCountryFlag),
      mobileNumber: cleanText(customerForm?.mobileNumber),
      phone: makePhone(
        customerForm?.mobileCountryCode,
        customerForm?.mobileNumber
      ),

      country: cleanText(customerForm?.country).toUpperCase() || "GB",
      countryName: cleanText(customerForm?.countryName),
      countryFlag: cleanText(customerForm?.countryFlag),

      postalCode: cleanText(customerForm?.postalCode),
      addressLine1: cleanText(customerForm?.addressLine1),
      addressLine2: cleanText(customerForm?.addressLine2),
      city: cleanText(customerForm?.city),
    };

    const fullName = `${customerDetails.firstName} ${customerDetails.lastName}`
      .trim()
      .replace(/\s+/g, " ");

    const billingDetails = {
      firstName: customerDetails.firstName,
      lastName: customerDetails.lastName,
      email: customerDetails.email,

      mobileCountryCode: customerDetails.mobileCountryCode,
      mobileCountryFlag: customerDetails.mobileCountryFlag,
      mobileNumber: customerDetails.mobileNumber,
      phone: customerDetails.phone,

      country: customerDetails.country,
      countryName: customerDetails.countryName,
      countryFlag: customerDetails.countryFlag,

      postalCode: customerDetails.postalCode,
      addressLine1: customerDetails.addressLine1,
      addressLine2: customerDetails.addressLine2,
      city: customerDetails.city,
    };

    const metadata = {
      userId: user._id.toString(),
      email: user.email,

      serviceId,
      serviceName,

      plan: planId,
      planId,
      planName: selectedPlan.name || "",
      planType: selectedPlan.type || "",

      priceEnvUsed: activeStripePriceEnv,
      offerActive: String(offerInfo.offerActive),
      offerStartedAt: offerInfo.startedAt
        ? new Date(offerInfo.startedAt).toISOString()
        : "",
      offerExpiresAt: offerInfo.expiresAt
        ? new Date(offerInfo.expiresAt).toISOString()
        : "",

      cvId: cvId || "",
      template: template || "",

      billingFirstName: customerDetails.firstName || "",
      billingLastName: customerDetails.lastName || "",
      billingEmail: customerDetails.email || "",
      billingPhone: customerDetails.phone || "",
      billingCountry: customerDetails.country || "",
      billingPostalCode: customerDetails.postalCode || "",
      billingAddressLine1: customerDetails.addressLine1 || "",
      billingAddressLine2: customerDetails.addressLine2 || "",
      billingCity: customerDetails.city || "",
    };

    let customerId = user.stripeCustomerId;

    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch (error) {
        if (error.code === "resource_missing") {
          customerId = "";
          user.stripeCustomerId = "";
          await user.save();
        } else {
          throw error;
        }
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: customerDetails.email || user.email,
        name: fullName || user.name || undefined,
        phone: customerDetails.phone || undefined,
        address: {
          line1: customerDetails.addressLine1 || undefined,
          line2: customerDetails.addressLine2 || undefined,
          city: customerDetails.city || undefined,
          postal_code: customerDetails.postalCode || undefined,
          country: customerDetails.country || "GB",
        },
        metadata: {
          userId: user._id.toString(),
          email: user.email,
        },
      });

      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    } else {
      await stripe.customers.update(customerId, {
        email: customerDetails.email || user.email,
        name: fullName || user.name || undefined,
        phone: customerDetails.phone || undefined,
        address: {
          line1: customerDetails.addressLine1 || undefined,
          line2: customerDetails.addressLine2 || undefined,
          city: customerDetails.city || undefined,
          postal_code: customerDetails.postalCode || undefined,
          country: customerDetails.country || "GB",
        },
        metadata: {
          userId: user._id.toString(),
          email: user.email,
        },
      });
    }

    // =========================
    // SUBSCRIPTION: CV BUILDER ONLY
    // =========================
    if (selectedPlan.type === "subscription") {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
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
        expand: [
          "latest_invoice.confirmation_secret",
          "latest_invoice.payment_intent",
        ],
        metadata,
      });

      const invoice = subscription.latest_invoice;

      const clientSecret =
        invoice?.confirmation_secret?.client_secret ||
        invoice?.payment_intent?.client_secret ||
        null;

      if (!clientSecret) {
        return NextResponse.json(
          {
            success: false,
            error: "Unable to create subscription payment.",
            debug: {
              planId,
              serviceId,
              selectedPlanType: selectedPlan.type,
              stripePriceEnv: activeStripePriceEnv,
              stripePriceId,
              subscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              latestInvoiceId: typeof invoice === "object" ? invoice.id : invoice,
              invoiceStatus: typeof invoice === "object" ? invoice.status : null,
              hasConfirmationSecret: Boolean(invoice?.confirmation_secret),
              hasPaymentIntent: Boolean(invoice?.payment_intent),
            },
          },
          { status: 500 }
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            plan: planId,
            planType: "subscription",
            accessType: "subscription",

            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,

            subscriptionStatus: subscription.status || "incomplete",
            hasActiveSubscription: false,
            subscriptionStartDate: new Date(),
            subscriptionEndDate: null,

            cvBuilderOfferStartedAt: user.cvBuilderOfferStartedAt || null,

            billingDetails,

            updatedAt: new Date(),
          },
          $push: {
            serviceOrders: {
              serviceId,
              serviceName,
              planId,
              planName: selectedPlan.name || "",
              planType: selectedPlan.type || "subscription",
              stripeSubscriptionId: subscription.id,
              paymentStatus: subscription.status || "incomplete",
              amount: offerInfo.offerActive
                ? getNumericAmountFromPrice(selectedPlan.price)
                : getNumericAmountFromPrice(
                    selectedPlan.oldPrice || selectedPlan.price
                  ),
              currency: "gbp",
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        type: "subscription",
        serviceId,
        serviceName,
        planId,
        clientSecret,
        subscriptionId: subscription.id,
        dbUpdated: Boolean(updatedUser),
        offerActive: offerInfo.offerActive,
        offerExpiresAt: offerInfo.expiresAt,
        priceEnvUsed: activeStripePriceEnv,
      });
    }

    // =========================
    // ONE-TIME PAYMENT: CV / LOGO / ADS
    // =========================
    const price = await stripe.prices.retrieve(stripePriceId);

    if (!price.unit_amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Stripe price amount is missing.",
        },
        { status: 500 }
      );
    }

    const baseAmount = price.unit_amount;
    const isUkCustomer = customerDetails.country === "GB";
    const taxAmount = isUkCustomer ? Math.round(baseAmount * 0.2) : 0;
    const totalAmount = baseAmount + taxAmount;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: price.currency || "gbp",
      customer: customerId,
      receipt_email: customerDetails.email || user.email,

      automatic_payment_methods: {
        enabled: true,
      },

      metadata: {
        ...metadata,
        baseAmount: String(baseAmount),
        taxRate: isUkCustomer ? "20" : "0",
        taxAmount: String(taxAmount),
        totalAmount: String(totalAmount),
        taxCountry: customerDetails.country || "GB",
      },
    });

    let updatePayload = {
      $set: {
        stripeCustomerId: customerId,
        cvBuilderOfferStartedAt: user.cvBuilderOfferStartedAt || null,
        billingDetails,
        updatedAt: new Date(),
      },
      $push: {
        serviceOrders: {
          serviceId,
          serviceName,
          planId,
          planName: selectedPlan.name || "",
          planType: selectedPlan.type || "payment",
          stripePaymentIntentId: paymentIntent.id,
          paymentStatus: "pending",
          amount: totalAmount,
          baseAmount,
          taxAmount,
          currency: price.currency || "gbp",
          createdAt: new Date(),
        },
      },
    };

    if (serviceId === "cv-builder") {
      updatePayload.$set = {
        ...updatePayload.$set,

        plan: planId,
        planType: "one-time",
        accessType: "one-time",

        stripePaymentIntentId: paymentIntent.id,

        paymentStatus: "pending",
        oneTimeAccessStatus: "pending",

        subscriptionStatus: "inactive",
        stripeSubscriptionId: "",
        subscriptionEndDate: null,
      };
    }

    if (serviceId === "logo-design") {
      updatePayload.$set = {
        ...updatePayload.$set,

        logoDesignStatus: "pending",
        logoDesignPlan: planId,
        logoDesignPaymentIntentId: paymentIntent.id,
      };
    }

    if (serviceId === "ads") {
      updatePayload.$set = {
        ...updatePayload.$set,

        adsServiceStatus: "pending",
        adsServicePlan: planId,
        adsServicePaymentIntentId: paymentIntent.id,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updatePayload, {
      new: true,
    });

    return NextResponse.json({
      success: true,
      type: "payment",
      serviceId,
      serviceName,
      planId,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      dbUpdated: Boolean(updatedUser),
      offerActive: offerInfo.offerActive,
      offerExpiresAt: offerInfo.expiresAt,
      priceEnvUsed: activeStripePriceEnv,
    });
  } catch (error) {
    console.error("Stripe create intent error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to create payment.",
      },
      { status: 500 }
    );
  }
}