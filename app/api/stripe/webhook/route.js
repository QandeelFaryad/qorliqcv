import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan || "monthly";

      const customerId = session.customer;
      const subscriptionId = session.subscription;

      let subscriptionEndDate = null;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        subscriptionEndDate = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null;
      }

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          plan,
          subscriptionStatus: "active",
          stripeCustomerId: customerId || "",
          stripeSubscriptionId: subscriptionId || "",
          subscriptionStartDate: new Date(),
          subscriptionEndDate,
        });
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;

      const userId = subscription.metadata?.userId;
      const plan = subscription.metadata?.plan || "monthly";

      const isActive =
        subscription.status === "active" ||
        subscription.status === "trialing";

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          plan: isActive ? plan : "free",
          subscriptionStatus: isActive ? "active" : subscription.status,
          stripeCustomerId: subscription.customer || "",
          stripeSubscriptionId: subscription.id || "",
          subscriptionEndDate: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null,
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;

      const userId = subscription.metadata?.userId;

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          plan: "free",
          subscriptionStatus: "inactive",
          stripeSubscriptionId: "",
          subscriptionEndDate: new Date(),
        });
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;

      if (subscriptionId) {
        await User.findOneAndUpdate(
          { stripeSubscriptionId: subscriptionId },
          {
            subscriptionStatus: "past_due",
          }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.log("Stripe webhook handler error:", error);

    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}