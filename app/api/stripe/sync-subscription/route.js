import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import { authOptions } from "@/lib/authOptions";
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

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Please login first.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { subscriptionId, planId, customerForm } = body;

    const customerDetails = {
      firstName: cleanText(customerForm?.firstName),
      lastName: cleanText(customerForm?.lastName),
      email: cleanText(customerForm?.email).toLowerCase(),
      address: cleanText(customerForm?.address),
    };

    const user = await User.findOne({
      email: session.user.email.toLowerCase().trim(),
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

    const now = new Date();

    const isOneTimePlan =
      user.plan === "one-time" ||
      user.plan === "one_time" ||
      user.plan === "onetime" ||
      user.planType === "one-time" ||
      user.accessType === "one-time";

    const isOneTimePaid =
      user.paymentStatus === "paid" ||
      user.lastPaymentStatus === "paid" ||
      user.oneTimeAccessStatus === "active";

    const oneTimeEndDate =
      user.accessExpiresAt || user.subscriptionEndDate || null;

    const isOneTimeExpired = oneTimeEndDate
      ? new Date(oneTimeEndDate) <= now
      : false;

    if (isOneTimePlan && isOneTimePaid && !isOneTimeExpired) {
      return NextResponse.json({
        success: true,
        type: "one-time",
        stripeStatus: "paid",
        databaseStatus: "active",
        plan: user.plan || "one-time",
        subscriptionStartDate: user.subscriptionStartDate || null,
        subscriptionEndDate: oneTimeEndDate,
        hasActiveSubscription: true,
        hasOneTimeAccess: true,
        accessType: "one-time",
        paymentStatus: "paid",
        billingDetails: user.billingDetails || null,
      });
    }

    const finalSubscriptionId = subscriptionId || user.stripeSubscriptionId;

    if (!finalSubscriptionId) {
      return NextResponse.json(
        {
          success: false,
          databaseStatus: "inactive",
          hasActiveSubscription: false,
          hasOneTimeAccess: false,
          error: "No active subscription or one-time access found for this user.",
        },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(
      finalSubscriptionId,
      {
        expand: ["items.data.price", "latest_invoice", "customer"],
      }
    );

    const stripeActive =
      subscription.status === "active" || subscription.status === "trialing";

    let subscriptionStartDate = null;
    let subscriptionEndDate = null;

    if (subscription.current_period_start) {
      subscriptionStartDate = new Date(
        subscription.current_period_start * 1000
      );
    }

    if (subscription.current_period_end) {
      subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    }

    const item = subscription.items?.data?.[0];

    if (!subscriptionStartDate && item?.current_period_start) {
      subscriptionStartDate = new Date(item.current_period_start * 1000);
    }

    if (!subscriptionEndDate && item?.current_period_end) {
      subscriptionEndDate = new Date(item.current_period_end * 1000);
    }

    if (
      (!subscriptionStartDate || !subscriptionEndDate) &&
      subscription.latest_invoice
    ) {
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

    const isExpired =
      subscriptionEndDate && new Date(subscriptionEndDate) <= now;

    const isActive = stripeActive && !isExpired;

    if (!subscriptionStartDate && isActive) {
      subscriptionStartDate = new Date();
    }

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

    const stripeCustomer =
      typeof subscription.customer === "object" ? subscription.customer : null;

    const stripeName = stripeCustomer?.name || "";
    const stripeEmail = stripeCustomer?.email || "";
    const stripeAddress = stripeCustomer?.address?.line1 || "";

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          plan: isActive ? finalPlan : "free",
          planType: isActive ? "subscription" : "",
          accessType: isActive ? "subscription" : "",

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

          billingFirstName:
            customerDetails.firstName || user.billingFirstName || "",
          billingLastName:
            customerDetails.lastName || user.billingLastName || "",
          billingEmail:
            customerDetails.email ||
            user.billingEmail ||
            stripeEmail ||
            session.user.email.toLowerCase().trim(),
          billingAddress:
            customerDetails.address ||
            user.billingAddress ||
            stripeAddress ||
            "",

          billingDetails: {
            firstName:
              customerDetails.firstName ||
              user.billingDetails?.firstName ||
              user.billingFirstName ||
              "",
            lastName:
              customerDetails.lastName ||
              user.billingDetails?.lastName ||
              user.billingLastName ||
              "",
            email:
              customerDetails.email ||
              user.billingDetails?.email ||
              user.billingEmail ||
              stripeEmail ||
              session.user.email.toLowerCase().trim(),
            address:
              customerDetails.address ||
              user.billingDetails?.address ||
              user.billingAddress ||
              stripeAddress ||
              "",
            stripeName,
          },

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
    });

    return NextResponse.json({
      success: true,
      type: "subscription",
      stripeStatus: subscription.status,
      databaseStatus: updatedUser.subscriptionStatus,
      plan: updatedUser.plan,
      subscriptionStartDate: updatedUser.subscriptionStartDate,
      subscriptionEndDate: updatedUser.subscriptionEndDate,
      hasActiveSubscription: updatedUser.hasActiveSubscription,
      hasOneTimeAccess: false,
      accessType: updatedUser.accessType || "subscription",
      billingDetails: updatedUser.billingDetails || null,
    });
  } catch (error) {
    console.error("Verify subscription error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to verify access.",
      },
      { status: 500 }
    );
  }
}