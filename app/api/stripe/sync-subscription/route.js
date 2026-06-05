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

function makePhone(countryCode, number) {
  const code = cleanText(countryCode);
  const mobile = cleanText(number);

  if (!code && !mobile) return "";

  return `${code}${mobile}`.replace(/\s+/g, "");
}

function isOneTimePlanId(planId) {
  const value = cleanText(planId).toLowerCase();

  return (
    value === "one-time" ||
    value === "one_time" ||
    value === "onetime" ||
    value === "one time"
  );
}

function isSubscriptionPlanId(planId) {
  const value = cleanText(planId).toLowerCase();

  return (
    value === "3-months" ||
    value === "3-month" ||
    value === "6-months" ||
    value === "6-month" ||
    value === "annual" ||
    value === "yearly" ||
    value === "1-year"
  );
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

    const subscriptionId = cleanText(body.subscriptionId);
    const planId = cleanText(body.planId);
    const customerForm = body.customerForm || {};

    /*
      Important:
      This API is only for Stripe subscription plans.
      One-time CV Builder payment must go to:
      /api/stripe/verify-one-time
    */
    if (isOneTimePlanId(planId)) {
      return NextResponse.json(
        {
          success: false,
          error: "One-time plan must be verified through verify-one-time API.",
          correctApi: "/api/stripe/verify-one-time",
        },
        { status: 400 }
      );
    }

    if (!subscriptionId) {
      return NextResponse.json(
        {
          success: false,
          databaseStatus: "inactive",
          hasActiveSubscription: false,
          hasOneTimeAccess: false,
          error: "Subscription ID is missing.",
        },
        { status: 400 }
      );
    }

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

    const customerDetails = {
      firstName: cleanText(customerForm.firstName),
      lastName: cleanText(customerForm.lastName),
      email: cleanText(customerForm.email).toLowerCase(),

      mobileCountryCode: cleanText(customerForm.mobileCountryCode),
      mobileCountryFlag: cleanText(customerForm.mobileCountryFlag),
      mobileNumber: cleanText(customerForm.mobileNumber),
      phone: makePhone(
        customerForm.mobileCountryCode,
        customerForm.mobileNumber
      ),

      country: cleanText(customerForm.country).toUpperCase(),
      countryName: cleanText(customerForm.countryName),
      countryFlag: cleanText(customerForm.countryFlag),

      postalCode: cleanText(customerForm.postalCode),
      addressLine1: cleanText(customerForm.addressLine1),
      addressLine2: cleanText(customerForm.addressLine2),
      city: cleanText(customerForm.city),
    };

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price", "latest_invoice", "customer"],
    });

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

      const invoiceLine = invoice?.lines?.data?.[0];

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
      subscriptionStartDate = now;
    }

    const metadataPlan =
      cleanText(subscription.metadata?.planId) ||
      cleanText(subscription.metadata?.plan);

    const finalPlan = metadataPlan || planId || "paid";

    /*
      Safety:
      Do not let a one-time value enter this subscription update.
    */
    if (isOneTimePlanId(finalPlan)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid subscription plan. One-time plan detected.",
          correctApi: "/api/stripe/verify-one-time",
        },
        { status: 400 }
      );
    }

    if (planId && !isSubscriptionPlanId(planId)) {
      console.log("Unknown subscription planId received:", planId);
    }

    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id || user.stripeCustomerId || "";

    const stripeCustomer =
      typeof subscription.customer === "object" ? subscription.customer : null;

    const stripeName = stripeCustomer?.name || "";
    const stripeEmail = stripeCustomer?.email || "";
    const stripeAddress = stripeCustomer?.address || {};

    const billingDetails = {
      firstName:
        customerDetails.firstName || user.billingDetails?.firstName || "",

      lastName:
        customerDetails.lastName || user.billingDetails?.lastName || "",

      email:
        customerDetails.email ||
        user.billingDetails?.email ||
        stripeEmail ||
        session.user.email.toLowerCase().trim(),

      mobileCountryCode:
        customerDetails.mobileCountryCode ||
        user.billingDetails?.mobileCountryCode ||
        "",

      mobileCountryFlag:
        customerDetails.mobileCountryFlag ||
        user.billingDetails?.mobileCountryFlag ||
        "",

      mobileNumber:
        customerDetails.mobileNumber || user.billingDetails?.mobileNumber || "",

      phone:
        customerDetails.phone ||
        user.billingDetails?.phone ||
        stripeCustomer?.phone ||
        "",

      country:
        customerDetails.country ||
        user.billingDetails?.country ||
        stripeAddress?.country ||
        "",

      countryName:
        customerDetails.countryName || user.billingDetails?.countryName || "",

      countryFlag:
        customerDetails.countryFlag || user.billingDetails?.countryFlag || "",

      postalCode:
        customerDetails.postalCode ||
        user.billingDetails?.postalCode ||
        stripeAddress?.postal_code ||
        "",

      addressLine1:
        customerDetails.addressLine1 ||
        user.billingDetails?.addressLine1 ||
        stripeAddress?.line1 ||
        "",

      addressLine2:
        customerDetails.addressLine2 ||
        user.billingDetails?.addressLine2 ||
        stripeAddress?.line2 ||
        "",

      city:
        customerDetails.city ||
        user.billingDetails?.city ||
        stripeAddress?.city ||
        "",

      stripeName,
    };

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          plan: isActive ? finalPlan : "free",
          planType: isActive ? "subscription" : "",
          accessType: isActive ? "subscription" : "",

          paymentStatus: isActive ? "paid" : "",
          lastPaymentStatus: isActive ? "paid" : "",

          /*
            Important:
            Since this is subscription API, active subscription should clear
            one-time access fields.
          */
          oneTimeAccessStatus: "",
          accessExpiresAt: null,

          subscriptionStatus: isActive
            ? "active"
            : isExpired
              ? "inactive"
              : subscription.status,

          hasActiveSubscription: isActive,

          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePaymentIntentId: "",

          subscriptionStartDate,
          subscriptionEndDate,

          cvBuilderOfferStartedAt: user.cvBuilderOfferStartedAt || null,

          billingDetails,

          updatedAt: now,
        },

        $unset: {
          billingFirstName: "",
          billingLastName: "",
          billingEmail: "",
          billingAddress: "",
        },
      },
      { new: true }
    );

    console.log("Sync subscription updated DB:", {
      email: updatedUser.email,
      stripeStatus: subscription.status,
      plan: updatedUser.plan,
      subscriptionStartDate: updatedUser.subscriptionStartDate,
      subscriptionEndDate: updatedUser.subscriptionEndDate,
      billingDetails: updatedUser.billingDetails,
      cvBuilderOfferStartedAt: updatedUser.cvBuilderOfferStartedAt,
    });

    return NextResponse.json({
      success: true,
      type: "subscription",
      stripeStatus: subscription.status,
      databaseStatus: updatedUser.subscriptionStatus,

      plan: updatedUser.plan,
      planType: updatedUser.planType,
      accessType: updatedUser.accessType || "subscription",

      subscriptionStartDate: updatedUser.subscriptionStartDate,
      subscriptionEndDate: updatedUser.subscriptionEndDate,

      hasActiveSubscription: updatedUser.hasActiveSubscription,
      hasOneTimeAccess: false,

      paymentStatus: updatedUser.paymentStatus,
      billingDetails: updatedUser.billingDetails || null,

      cvBuilderOfferStartedAt: updatedUser.cvBuilderOfferStartedAt || null,
    });
  } catch (error) {
    console.error("Sync subscription error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to sync subscription.",
      },
      { status: 500 }
    );
  }
}