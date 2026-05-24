import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getSubscriptionDates(subscription) {
  let subscriptionStartDate = null;
  let subscriptionEndDate = null;

  // 1. Subscription direct fields
  if (subscription.current_period_start) {
    subscriptionStartDate = new Date(subscription.current_period_start * 1000);
  }

  if (subscription.current_period_end) {
    subscriptionEndDate = new Date(subscription.current_period_end * 1000);
  }

  // 2. Subscription item fallback
  const item = subscription.items?.data?.[0];

  if (!subscriptionStartDate && item?.current_period_start) {
    subscriptionStartDate = new Date(item.current_period_start * 1000);
  }

  if (!subscriptionEndDate && item?.current_period_end) {
    subscriptionEndDate = new Date(item.current_period_end * 1000);
  }

  // 3. Latest invoice line fallback
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
  if (!subscriptionStartDate && subscription.status === "active") {
    subscriptionStartDate = new Date();
  }

  return {
    subscriptionStartDate,
    subscriptionEndDate,
  };
}

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
  const now = new Date();

  const stripeActive =
    subscriptionStatus === "active" || subscriptionStatus === "trialing";

  const isExpired =
    subscriptionEndDate && new Date(subscriptionEndDate) <= now;

  const isActive = stripeActive && !isExpired;

  const updateData = {
    plan: isActive ? plan : "free",
    subscriptionStatus: isActive
      ? "active"
      : isExpired
      ? "inactive"
      : subscriptionStatus,
    stripeCustomerId: customerId || "",
    stripeSubscriptionId: subscriptionId || "",
    subscriptionStartDate: subscriptionStartDate || null,
    subscriptionEndDate: subscriptionEndDate || null,
    hasActiveSubscription: isActive,
    updatedAt: new Date(),
  };

  let updatedUser = null;

  // 1. Try userId from Stripe metadata
  if (userId) {
    updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
  }

  // 2. Try Stripe customer ID
  if (!updatedUser && customerId) {
    updatedUser = await User.findOneAndUpdate(
      { stripeCustomerId: customerId },
      updateData,
      { new: true }
    );
  }

  // 3. Try email fallback
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
    plan: updateData.plan,
    subscriptionStatus: updateData.subscriptionStatus,
    subscriptionStartDate: updateData.subscriptionStartDate,
    subscriptionEndDate: updateData.subscriptionEndDate,
    hasActiveSubscription: updateData.hasActiveSubscription,
  });

  return updatedUser;
}

async function syncSubscriptionById(subscriptionId) {
  if (!subscriptionId) return null;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price", "latest_invoice"],
  });

  const userId = subscription.metadata?.userId || "";
  const email = subscription.metadata?.email || "";
  const plan =
    subscription.metadata?.planId ||
    subscription.metadata?.plan ||
    "paid";

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id || "";

  const { subscriptionStartDate, subscriptionEndDate } =
    await getSubscriptionDates(subscription);

  return await updateUserSubscription({
    userId,
    customerId,
    email,
    plan,
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status || "inactive",
    subscriptionStartDate,
    subscriptionEndDate,
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
      const eventSubscription = event.data.object;

      await syncSubscriptionById(eventSubscription.id);
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
        await syncSubscriptionById(subscriptionId);
      } else {
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id || "";

        if (customerId) {
          await User.findOneAndUpdate(
            { stripeCustomerId: customerId },
            {
              subscriptionStatus: "active",
              hasActiveSubscription: true,
              lastPaymentStatus: "paid",
              updatedAt: new Date(),
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
          plan: "free",
          subscriptionStatus: "past_due",
          hasActiveSubscription: false,
          lastPaymentStatus: "failed",
          updatedAt: new Date(),
        },
        { new: true }
      );
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id || "";

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
          updatedAt: new Date(),
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