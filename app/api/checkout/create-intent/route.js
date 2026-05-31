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
    const { planId, cvId, template, customerForm } = body;

    const customerDetails = {
      firstName: cleanText(customerForm?.firstName),
      lastName: cleanText(customerForm?.lastName),
      email:
        cleanText(customerForm?.email).toLowerCase() ||
        user.email.toLowerCase().trim(),
      address: cleanText(customerForm?.address),
    };

    const fullName = `${customerDetails.firstName} ${customerDetails.lastName}`
      .trim()
      .replace(/\s+/g, " ");

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

    const stripePriceId = process.env[selectedPlan.stripePriceEnv];

    if (!stripePriceId) {
      return NextResponse.json(
        {
          success: false,
          error: `${selectedPlan.stripePriceEnv} is missing in .env.local.`,
        },
        { status: 500 }
      );
    }

    if (!stripePriceId.startsWith("price_")) {
      return NextResponse.json(
        {
          success: false,
          error: `${selectedPlan.stripePriceEnv} must be a Stripe Price ID starting with price_. You used ${stripePriceId}`,
        },
        { status: 400 }
      );
    }

    const metadata = {
      userId: user._id.toString(),
      email: user.email,
      plan: planId,
      planId,
      planName: selectedPlan.name || "",
      planType: selectedPlan.type || "",
      cvId: cvId || "",
      template: template || "",
      billingFirstName: customerDetails.firstName || "",
      billingLastName: customerDetails.lastName || "",
      billingEmail: customerDetails.email || "",
      billingAddress: customerDetails.address || "",
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
    address: {
      line1: customerDetails.address || undefined,
      country: "GB",
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
    address: {
      line1: customerDetails.address || undefined,
      country: "GB",
    },
    metadata: {
      userId: user._id.toString(),
      email: user.email,
    },
  });
}

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

      const confirmationSecret =
        invoice?.confirmation_secret?.client_secret || null;

      const paymentIntentSecret =
        invoice?.payment_intent?.client_secret || null;

      const clientSecret = confirmationSecret || paymentIntentSecret;

      if (!clientSecret) {
        return NextResponse.json(
          {
            success: false,
            error: "Unable to create subscription payment.",
            debug: {
              planId,
              selectedPlanType: selectedPlan.type,
              stripePriceEnv: selectedPlan.stripePriceEnv,
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

            billingFirstName: customerDetails.firstName,
            billingLastName: customerDetails.lastName,
            billingEmail: customerDetails.email,
            billingAddress: customerDetails.address,
            billingDetails: {
              firstName: customerDetails.firstName,
              lastName: customerDetails.lastName,
              email: customerDetails.email,
              address: customerDetails.address,
            },

            updatedAt: new Date(),
          },
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        type: "subscription",
        clientSecret,
        subscriptionId: subscription.id,
        dbUpdated: Boolean(updatedUser),
      });
    }

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
const taxAmount = Math.round(baseAmount * 0.2);
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
    taxRate: "20",
    taxAmount: String(taxAmount),
    totalAmount: String(totalAmount),
    taxCountry: "GB",
  },
});

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          plan: planId,
          planType: "one-time",
          accessType: "one-time",

          stripeCustomerId: customerId,
          stripePaymentIntentId: paymentIntent.id,

          paymentStatus: "pending",
          oneTimeAccessStatus: "pending",

          subscriptionStatus: "inactive",
          stripeSubscriptionId: "",
          subscriptionEndDate: null,

          billingFirstName: customerDetails.firstName,
          billingLastName: customerDetails.lastName,
          billingEmail: customerDetails.email,
          billingAddress: customerDetails.address,
          billingDetails: {
            firstName: customerDetails.firstName,
            lastName: customerDetails.lastName,
            email: customerDetails.email,
            address: customerDetails.address,
          },

          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      type: "payment",
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      dbUpdated: Boolean(updatedUser),
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