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

    const body = await req.json().catch(() => ({}));
    const { subscriptionId, planId } = body;

    const user = await User.findOne({
      email: session.user.email.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const finalSubscriptionId = subscriptionId || user.stripeSubscriptionId;

    if (!finalSubscriptionId) {
      return NextResponse.json(
        { success: false, error: "No subscription found for this user." },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(
      finalSubscriptionId,
      {
        expand: ["items.data.price", "latest_invoice"],
      }
    );

  const stripeActive =
  subscription.status === "active" ||
  subscription.status === "trialing";

    let subscriptionStartDate = null;
    let subscriptionEndDate = null;

    // 1. Try subscription direct period fields
    if (subscription.current_period_start) {
      subscriptionStartDate = new Date(
        subscription.current_period_start * 1000
      );
    }

    if (subscription.current_period_end) {
      subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    }

    // 2. Try subscription item period fields
    const item = subscription.items?.data?.[0];

    if (!subscriptionStartDate && item?.current_period_start) {
      subscriptionStartDate = new Date(item.current_period_start * 1000);
    }

    if (!subscriptionEndDate && item?.current_period_end) {
      subscriptionEndDate = new Date(item.current_period_end * 1000);
    }

    // 3. Try latest invoice line period
    if ((!subscriptionStartDate || !subscriptionEndDate) && subscription.latest_invoice) {
      const invoice =
        typeof subscription.latest_invoice === "string"
          ? await stripe.invoices.retrieve(subscription.latest_invoice)
          : subscription.latest_invoice;

      const invoiceLine = invoice.lines?.data?.[0];

      if (!subscriptionStartDate && invoiceLine?.period?.start) {
        subscriptionStartDate = new Date(invoiceLine.period.start * 1000);
      }

      if (!subscriptionEndDate && invoiceLine?.period?.end) {
        subscriptionEndDate = new Date(invoiceLine.period.end * 1000);
      }
    }

    // 4. Final fallback
    if (!subscriptionStartDate && isActive) {
      subscriptionStartDate = new Date();
    }
    const now = new Date();

const isExpired =
  subscriptionEndDate && new Date(subscriptionEndDate) <= now;

const isActive = stripeActive && !isExpired;

    const finalPlan =
      subscription.metadata?.planId ||
      subscription.metadata?.plan ||
      planId ||
      user.plan ||
      "paid";

    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id || user.stripeCustomerId;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
     plan: isActive ? finalPlan : "free",
subscriptionStatus: isActive
  ? "active"
  : isExpired
  ? "inactive"
  : subscription.status,
hasActiveSubscription: isActive,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          subscriptionStartDate,
          subscriptionEndDate,
          hasActiveSubscription: isActive,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    console.log("Verify subscription updated DB:", {
      email: updatedUser.email,
      stripeStatus: subscription.status,
      plan: updatedUser.plan,
      subscriptionStartDate: updatedUser.subscriptionStartDate,
      subscriptionEndDate: updatedUser.subscriptionEndDate,
      directStart: subscription.current_period_start,
      directEnd: subscription.current_period_end,
      itemStart: item?.current_period_start,
      itemEnd: item?.current_period_end,
    });

    return NextResponse.json({
      success: true,
      stripeStatus: subscription.status,
      databaseStatus: updatedUser.subscriptionStatus,
      plan: updatedUser.plan,
      subscriptionStartDate: updatedUser.subscriptionStartDate,
      subscriptionEndDate: updatedUser.subscriptionEndDate,
      hasActiveSubscription: updatedUser.hasActiveSubscription,
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