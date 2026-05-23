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

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const checkoutData = {
      mode: selectedPlan.type === "subscription" ? "subscription" : "payment",

      payment_method_types: ["card"],

      customer_email: user.email,

      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],

      success_url: `${siteUrl}/cv-builder/success?cvId=${cvId || ""}&template=${
        template || ""
      }&session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${siteUrl}/checkout?plan=${planId}&cvId=${
        cvId || ""
      }&template=${template || ""}`,

      metadata: {
        userId: user._id.toString(),
        email: user.email,
        planId,
        planName: selectedPlan.name || "",
        planType: selectedPlan.type || "",
        cvId: cvId || "",
        template: template || "",
      },
    };

    if (selectedPlan.type === "subscription") {
      checkoutData.subscription_data = {
        metadata: {
          userId: user._id.toString(),
          email: user.email,
          planId,
          planName: selectedPlan.name || "",
          planType: selectedPlan.type || "",
          cvId: cvId || "",
          template: template || "",
        },
      };
    }

    const session = await stripe.checkout.sessions.create(checkoutData);

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout session error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to create checkout session.",
      },
      { status: 500 }
    );
  }
}