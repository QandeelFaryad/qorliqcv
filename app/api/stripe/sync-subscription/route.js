import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Please login first." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: session.user.email.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    if (!user.stripeSubscriptionId) {
      return NextResponse.json(
        { success: false, error: "No subscription found for this user." },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    const isActive =
      subscription.status === "active" ||
      subscription.status === "trialing";

    user.subscriptionStatus = isActive ? "active" : subscription.status;
    user.plan =
      isActive
        ? subscription.metadata?.planId || subscription.metadata?.plan || "paid"
        : "free";

    user.subscriptionStartDate = subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000)
      : null;

    user.subscriptionEndDate = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : null;

    user.hasActiveSubscription = isActive;

    await user.save();

    return NextResponse.json({
      success: true,
      stripeStatus: subscription.status,
      databaseStatus: user.subscriptionStatus,
      plan: user.plan,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
    });
  } catch (error) {
    console.error("Verify subscription error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}