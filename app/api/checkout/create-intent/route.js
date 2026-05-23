import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { pricingPlans } from "@/lib/pricingPlans";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    const body = await req.json();
    const { planId, cvId, template } = body;

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
      planId,
      planName: selectedPlan.name || "",
      planType: selectedPlan.type || "",
      cvId: cvId || "",
      template: template || "",
    };

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user._id.toString(),
        },
      });

      customerId = customer.id;

      user.stripeCustomerId = customerId;
      await user.save();
    }

    if (selectedPlan.type === "subscription") {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: stripePriceId,
          },
        ],
        payment_behavior: "default_incomplete",
        payment_settings: {
          save_default_payment_method: "on_subscription",
        },
        expand: ["latest_invoice.payment_intent"],
        metadata,
      });

      const paymentIntent = subscription.latest_invoice?.payment_intent;

      if (!paymentIntent?.client_secret) {
        return NextResponse.json(
          {
            success: false,
            error: "Unable to create subscription payment.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        type: "subscription",
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id,
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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency || "gbp",
      customer: customerId,
      receipt_email: user.email,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    });

    return NextResponse.json({
      success: true,
      type: "payment",
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
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