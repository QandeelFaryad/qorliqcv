import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function updateUserSubscription({
  userId = "",
  customerId = "",
  email = "",
  plan = "free",
  subscriptionId = "",
  subscriptionStatus = "inactive",
  subscriptionStartDate = null,
  subscriptionEndDate = null,
}) {
  const isActive =
    subscriptionStatus === "active" || subscriptionStatus === "trialing";

  const updateData = {
    plan: isActive ? plan : "free",
    subscriptionStatus: isActive ? "active" : subscriptionStatus,
    stripeCustomerId: customerId || "",
    stripeSubscriptionId: subscriptionId || "",
    subscriptionStartDate: subscriptionStartDate || new Date(),
    subscriptionEndDate: subscriptionEndDate || null,
    hasActiveSubscription: isActive,
  };

  let updatedUser = null;

  if (userId) {
    updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
  }

  if (!updatedUser && customerId) {
    updatedUser = await User.findOneAndUpdate(
      { stripeCustomerId: customerId },
      updateData,
      { new: true }
    );
  }

  if (!updatedUser && email) {
    updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      updateData,
      { new: true }
    );
  }

  console.log("Stripe user subscription sync:", {
    foundUser: Boolean(updatedUser),
    email: updatedUser?.email || email || "",
    userId,
    customerId,
    subscriptionId,
    plan,
    subscriptionStatus,
  });

  return updatedUser;
}

async function syncSubscription(subscription) {
  const userId = subscription.metadata?.userId || "";
  const email = subscription.metadata?.email || "";
  const plan =
    subscription.metadata?.planId ||
    subscription.metadata?.plan ||
    "monthly";

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : "";

  await updateUserSubscription({
    userId,
    customerId,
    email,
    plan,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status || "inactive",
    subscriptionStartDate: subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000)
      : new Date(),
    subscriptionEndDate: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : null,
  });
}

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log("Stripe webhook signature error:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: "Invalid webhook signature",
      },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    console.log("Stripe webhook received:", event.type);

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object;
      await syncSubscription(subscription);
    }

    if (
      event.type === "invoice.payment_succeeded" ||
      event.type === "invoice.paid"
    ) {
      const invoice = event.data.object;

      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id || "";

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );

        await syncSubscription(subscription);
      } else {
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : "";

        if (customerId) {
          await User.findOneAndUpdate(
            { stripeCustomerId: customerId },
            {
              subscriptionStatus: "active",
              hasActiveSubscription: true,
              lastPaymentStatus: "paid",
            },
            { new: true }
          );
        }
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;

      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id || "";

      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id || "";

      await User.findOneAndUpdate(
        {
          $or: [
            { stripeSubscriptionId: subscriptionId },
            { stripeCustomerId: customerId },
          ],
        },
        {
          subscriptionStatus: "past_due",
          hasActiveSubscription: false,
          lastPaymentStatus: "failed",
        },
        { new: true }
      );
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : "";

      await User.findOneAndUpdate(
        {
          $or: [
            { stripeSubscriptionId: subscription.id },
            { stripeCustomerId: customerId },
          ],
        },
        {
          plan: "free",
          subscriptionStatus: "inactive",
          stripeSubscriptionId: "",
          subscriptionEndDate: new Date(),
          hasActiveSubscription: false,
        },
        { new: true }
      );
    }

    return NextResponse.json({
      success: true,
      received: true,
    });
  } catch (error) {
    console.log("Stripe webhook handler error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Webhook handler failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}