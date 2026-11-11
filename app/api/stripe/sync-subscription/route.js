import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongodb";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getStripeClient() {
  const secretKey = cleanText(process.env.STRIPE_SECRET_KEY);

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}

function makePhone(countryCode, number) {
  const code = cleanText(countryCode);
  const mobile = cleanText(number);

  if (!code && !mobile) {
    return "";
  }

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

function errorResponse(error, status = 400, extra = {}) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...extra,
    },
    { status }
  );
}

/* =========================================================
   SUBSCRIPTION PERIOD HELPERS
========================================================= */

async function getSubscriptionPeriod(stripe, subscription) {
  let subscriptionStartDate = null;
  let subscriptionEndDate = null;

  /*
    Some Stripe API versions expose the subscription
    period directly on the subscription object.
  */
  if (subscription.current_period_start) {
    subscriptionStartDate = new Date(
      subscription.current_period_start * 1000
    );
  }

  if (subscription.current_period_end) {
    subscriptionEndDate = new Date(
      subscription.current_period_end * 1000
    );
  }

  /*
    Some Stripe API versions expose the period on the
    subscription item instead.
  */
  const subscriptionItem = subscription.items?.data?.[0];

  if (
    !subscriptionStartDate &&
    subscriptionItem?.current_period_start
  ) {
    subscriptionStartDate = new Date(
      subscriptionItem.current_period_start * 1000
    );
  }

  if (
    !subscriptionEndDate &&
    subscriptionItem?.current_period_end
  ) {
    subscriptionEndDate = new Date(
      subscriptionItem.current_period_end * 1000
    );
  }

  /*
    Final fallback: use the first invoice line period.
  */
  if (
    (!subscriptionStartDate || !subscriptionEndDate) &&
    subscription.latest_invoice
  ) {
    let invoice = subscription.latest_invoice;

    if (typeof invoice === "string") {
      invoice = await stripe.invoices.retrieve(invoice, {
        expand: ["lines.data"],
      });
    }

    const invoiceLine = invoice?.lines?.data?.[0];

    if (
      !subscriptionStartDate &&
      invoiceLine?.period?.start
    ) {
      subscriptionStartDate = new Date(
        invoiceLine.period.start * 1000
      );
    }

    if (
      !subscriptionEndDate &&
      invoiceLine?.period?.end
    ) {
      subscriptionEndDate = new Date(
        invoiceLine.period.end * 1000
      );
    }
  }

  return {
    subscriptionStartDate,
    subscriptionEndDate,
  };
}

/* =========================================================
   POST
========================================================= */

export async function POST(req) {
  try {
    const stripe = getStripeClient();

    if (!stripe) {
      return errorResponse(
        "Stripe secret key is missing.",
        500
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return errorResponse(
        "Please login first.",
        401
      );
    }

    await connectDB();

    const body = await req.json().catch(() => ({}));

    const subscriptionId = cleanText(body.subscriptionId);
    const planId = cleanText(body.planId);
    const customerForm = body.customerForm || {};

    /*
      This endpoint is only for recurring subscriptions.

      One-time CV Builder payments must be verified through:
      /api/stripe/verify-one-time
    */
    if (isOneTimePlanId(planId)) {
      return errorResponse(
        "One-time plan must be verified through verify-one-time API.",
        400,
        {
          correctApi: "/api/stripe/verify-one-time",
        }
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

    const userEmail = cleanText(
      session.user.email
    ).toLowerCase();

    const user = await User.findOne({
      email: userEmail,
    });

    if (!user) {
      return errorResponse(
        "User not found.",
        404
      );
    }

    const customerDetails = {
      firstName: cleanText(customerForm.firstName),
      lastName: cleanText(customerForm.lastName),

      email: cleanText(
        customerForm.email
      ).toLowerCase(),

      mobileCountryCode: cleanText(
        customerForm.mobileCountryCode
      ),

      mobileCountryFlag: cleanText(
        customerForm.mobileCountryFlag
      ),

      mobileNumber: cleanText(
        customerForm.mobileNumber
      ),

      phone: makePhone(
        customerForm.mobileCountryCode,
        customerForm.mobileNumber
      ),

      country: cleanText(
        customerForm.country
      ).toUpperCase(),

      countryName: cleanText(
        customerForm.countryName
      ),

      countryFlag: cleanText(
        customerForm.countryFlag
      ),

      postalCode: cleanText(
        customerForm.postalCode
      ),

      addressLine1: cleanText(
        customerForm.addressLine1
      ),

      addressLine2: cleanText(
        customerForm.addressLine2
      ),

      city: cleanText(customerForm.city),
    };

    /*
      Load the subscription from Stripe.
    */
    const subscription =
      await stripe.subscriptions.retrieve(
        subscriptionId,
        {
          expand: [
            "items.data.price",
            "latest_invoice.lines.data",
            "customer",
          ],
        }
      );

    /*
      Ensure this subscription belongs to the logged-in user.
    */
    const subscriptionCustomerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id || "";

    if (
      user.stripeCustomerId &&
      subscriptionCustomerId &&
      user.stripeCustomerId !== subscriptionCustomerId
    ) {
      return errorResponse(
        "This subscription does not belong to the logged-in user.",
        403
      );
    }

    const stripeActive =
      subscription.status === "active" ||
      subscription.status === "trialing";

    const {
      subscriptionStartDate: detectedStartDate,
      subscriptionEndDate: detectedEndDate,
    } = await getSubscriptionPeriod(
      stripe,
      subscription
    );

    const now = new Date();

    let subscriptionStartDate =
      detectedStartDate;

    const subscriptionEndDate =
      detectedEndDate;

    const isExpired = Boolean(
      subscriptionEndDate &&
        subscriptionEndDate <= now
    );

    const isActive =
      stripeActive && !isExpired;

    if (!subscriptionStartDate && isActive) {
      subscriptionStartDate = now;
    }

    /*
      Prefer the plan stored in Stripe metadata.
    */
    const metadataPlan =
      cleanText(subscription.metadata?.planId) ||
      cleanText(subscription.metadata?.plan);

    const finalPlan =
      metadataPlan ||
      planId ||
      "paid";

    /*
      Protect the subscription endpoint from accidentally
      saving a one-time plan.
    */
    if (isOneTimePlanId(finalPlan)) {
      return errorResponse(
        "Invalid subscription plan. One-time plan detected.",
        400,
        {
          correctApi: "/api/stripe/verify-one-time",
        }
      );
    }

    if (
      planId &&
      !isSubscriptionPlanId(planId)
    ) {
      console.warn(
        "Unknown subscription plan ID received:",
        planId
      );
    }

    const stripeCustomer =
      typeof subscription.customer === "object"
        ? subscription.customer
        : null;

    const customerId =
      subscriptionCustomerId ||
      cleanText(user.stripeCustomerId);

    const stripeName =
      cleanText(stripeCustomer?.name);

    const stripeEmail =
      cleanText(
        stripeCustomer?.email
      ).toLowerCase();

    const stripeAddress =
      stripeCustomer?.address || {};

    /*
      Use new checkout form data first.

      If unavailable, retain saved billing details or
      use Stripe customer details as fallback.
    */
    const billingDetails = {
      firstName:
        customerDetails.firstName ||
        user.billingDetails?.firstName ||
        "",

      lastName:
        customerDetails.lastName ||
        user.billingDetails?.lastName ||
        "",

      email:
        customerDetails.email ||
        user.billingDetails?.email ||
        stripeEmail ||
        userEmail,

      mobileCountryCode:
        customerDetails.mobileCountryCode ||
        user.billingDetails?.mobileCountryCode ||
        "",

      mobileCountryFlag:
        customerDetails.mobileCountryFlag ||
        user.billingDetails?.mobileCountryFlag ||
        "",

      mobileNumber:
        customerDetails.mobileNumber ||
        user.billingDetails?.mobileNumber ||
        "",

      phone:
        customerDetails.phone ||
        user.billingDetails?.phone ||
        cleanText(stripeCustomer?.phone),

      country:
        customerDetails.country ||
        user.billingDetails?.country ||
        cleanText(stripeAddress?.country),

      countryName:
        customerDetails.countryName ||
        user.billingDetails?.countryName ||
        "",

      countryFlag:
        customerDetails.countryFlag ||
        user.billingDetails?.countryFlag ||
        "",

      postalCode:
        customerDetails.postalCode ||
        user.billingDetails?.postalCode ||
        cleanText(stripeAddress?.postal_code),

      addressLine1:
        customerDetails.addressLine1 ||
        user.billingDetails?.addressLine1 ||
        cleanText(stripeAddress?.line1),

      addressLine2:
        customerDetails.addressLine2 ||
        user.billingDetails?.addressLine2 ||
        cleanText(stripeAddress?.line2),

      city:
        customerDetails.city ||
        user.billingDetails?.city ||
        cleanText(stripeAddress?.city),

      stripeName,
    };

    /*
      Save subscription status and access in MongoDB.

      The old countdown field is removed using $unset.
    */
    const updatedUser =
      await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            plan: isActive
              ? finalPlan
              : "free",

            planType: isActive
              ? "subscription"
              : "",

            accessType: isActive
              ? "subscription"
              : "",

            paymentStatus: isActive
              ? "paid"
              : "",

            lastPaymentStatus: isActive
              ? "paid"
              : "",

            /*
              An active subscription replaces any one-time access.
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

            stripeSubscriptionId:
              subscription.id,

            stripePaymentIntentId: "",

            subscriptionStartDate:
              subscriptionStartDate || null,

            subscriptionEndDate:
              subscriptionEndDate || null,

            billingDetails,

            updatedAt: now,
          },

          $unset: {
            /*
              Remove legacy billing fields.
            */
            billingFirstName: "",
            billingLastName: "",
            billingEmail: "",
            billingAddress: "",

            /*
              Remove old countdown/offer field from MongoDB.
            */
            cvBuilderOfferStartedAt: "",
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedUser) {
      return errorResponse(
        "Unable to update user subscription.",
        500
      );
    }

    console.log(
      "Subscription synced successfully:",
      {
        email: updatedUser.email,
        stripeStatus: subscription.status,
        databaseStatus:
          updatedUser.subscriptionStatus,
        plan: updatedUser.plan,
        subscriptionStartDate:
          updatedUser.subscriptionStartDate,
        subscriptionEndDate:
          updatedUser.subscriptionEndDate,
        hasActiveSubscription:
          updatedUser.hasActiveSubscription,
      }
    );

    return NextResponse.json({
      success: true,
      type: "subscription",

      stripeStatus:
        subscription.status,

      databaseStatus:
        updatedUser.subscriptionStatus,

      plan: updatedUser.plan,
      planType: updatedUser.planType,

      accessType:
        updatedUser.accessType ||
        (isActive ? "subscription" : ""),

      subscriptionStartDate:
        updatedUser.subscriptionStartDate,

      subscriptionEndDate:
        updatedUser.subscriptionEndDate,

      hasActiveSubscription:
        updatedUser.hasActiveSubscription,

      hasOneTimeAccess: false,

      paymentStatus:
        updatedUser.paymentStatus,

      billingDetails:
        updatedUser.billingDetails || null,
    });
  } catch (error) {
    const errorMessage =
      error?.raw?.message ||
      error?.message ||
      "Unable to sync subscription.";

    const statusCode =
      Number.isInteger(error?.statusCode) &&
      error.statusCode >= 400 &&
      error.statusCode < 600
        ? error.statusCode
        : 500;

    console.error(
      "Sync subscription error:",
      {
        name: error?.name,
        type: error?.type,
        message: error?.message,
        rawMessage: error?.raw?.message,
        code:
          error?.raw?.code ||
          error?.code,
        requestId:
          error?.requestId ||
          error?.raw?.requestId,
        statusCode,
        stack: error?.stack,
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}