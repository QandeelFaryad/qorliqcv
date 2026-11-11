import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";

const RESET_ACCESS = {
  plan: "free",
  planType: "",
  accessType: "",

  subscriptionStatus: "inactive",
  hasActiveSubscription: false,

  stripeSubscriptionId: "",
  stripePaymentIntentId: "",

  subscriptionStartDate: null,
  subscriptionEndDate: null,
  accessExpiresAt: null,

  paymentStatus: "",
  lastPaymentStatus: "",
  oneTimeAccessStatus: "",
};

const ACCESS_FIELDS = Object.keys(RESET_ACCESS).join(" ");

function reply(message, status) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

function success(user) {
  return NextResponse.json({
    success: true,
    message: "Plan cancelled. Your account is now on the free plan.",
    hasAccess: false,
    access: { ...RESET_ACCESS },
    user,
  });
}

function isReset(user) {
  return (
    user &&
    Object.entries(RESET_ACCESS).every(
      ([field, value]) => user[field] === value
    )
  );
}

export async function POST(request) {
  let stripeCancelled = false;

  try {
    const origin = request.headers.get("origin");

    const allowedOrigin = new URL(
      process.env.NEXTAUTH_URL || request.url
    ).origin;

    if (origin && origin !== allowedOrigin) {
      return reply("Invalid request origin.", 403);
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (
      typeof userId !== "string" ||
      !/^[a-fA-F0-9]{24}$/.test(userId)
    ) {
      return reply("Please login first.", 401);
    }

    await connectDB();

    const user = await User.findById(userId)
      .select(`${ACCESS_FIELDS} stripeCustomerId`)
      .lean();

    if (!user) {
      return reply("User not found.", 404);
    }

    const subscriptionId = user.stripeSubscriptionId || "";

    const isOneTime = [
      user.plan,
      user.planType,
      user.accessType,
    ].some((value) =>
      ["one-time", "one_time", "onetime"].includes(
        String(value || "").trim().toLowerCase()
      )
    );

    const isFree =
      user.plan === "free" &&
      !user.hasActiveSubscription &&
      user.subscriptionStatus === "inactive";

    /*
     * A recurring subscription must be cancelled on Stripe first.
     * One-time access does not require a Stripe subscription call.
     */
    if (subscriptionId) {
      if (!process.env.STRIPE_SECRET_KEY) {
        return reply(
          "Subscription cancellation is unavailable.",
          503
        );
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      try {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (
          !user.stripeCustomerId ||
          customerId !== user.stripeCustomerId
        ) {
          return reply(
            "Subscription ownership could not be verified.",
            409
          );
        }

        if (
          !["canceled", "incomplete_expired"].includes(
            subscription.status
          )
        ) {
          await stripe.subscriptions.cancel(subscriptionId, {
            invoice_now: false,
            prorate: false,
          });
        }

        stripeCancelled = true;
      } catch (error) {
        console.error(
          "Stripe cancellation failed:",
          error.type || error.name
        );

        return reply(
          "Unable to cancel your Stripe subscription. Please retry.",
          502
        );
      }
    } else if (!isOneTime && !isFree) {
      // Avoid claiming cancellation when a recurring
      // subscription cannot be located.
      return reply(
        "Subscription ID is missing. Please contact support.",
        409
      );
    }

    /*
     * Compare the access fields we read before updating.
     * This prevents clearing a different plan purchased
     * while cancellation was being processed.
     */
    const filter = { _id: userId };

    for (const field of Object.keys(RESET_ACCESS)) {
      filter[field] =
        user[field] === undefined
          ? { $exists: false }
          : user[field];
    }

    const updatedUser = await User.findOneAndUpdate(
      filter,
      {
        $set: RESET_ACCESS,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select(ACCESS_FIELDS)
      .lean();

    if (!updatedUser) {
      const currentUser = await User.findById(userId)
        .select(ACCESS_FIELDS)
        .lean();

      if (!currentUser) {
        return reply("User not found.", 404);
      }

      // Another request or webhook may have completed the reset.
      if (isReset(currentUser)) {
        return success(currentUser);
      }

      return reply(
        stripeCancelled
          ? "Stripe subscription is cancelled, but your account changed. Refresh and retry to update your account."
          : "Your plan changed. Please refresh and try again.",
        409
      );
    }

    return success(updatedUser);
  } catch (error) {
    console.error("Cancellation failed:", error.name);

    return reply(
      stripeCancelled
        ? "Stripe subscription is cancelled, but the account reset failed. Please retry."
        : "Unable to cancel your plan. Please retry.",
      500
    );
  }
}