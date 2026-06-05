import { NextResponse } from "next/server";
import Stripe from "stripe";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ServiceOrder from "@/models/ServiceOrder";

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

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getServiceName(serviceId, metadata = {}) {
  const fromMetadata = cleanText(metadata.serviceName);

  if (fromMetadata) return fromMetadata;

  if (serviceId === "logo-design") return "Logo Design";
  if (serviceId === "ads") return "Ads Service";

  return "CV Builder";
}

function getCustomerIdFromStripeObject(stripeObject) {
  return typeof stripeObject.customer === "string"
    ? stripeObject.customer
    : stripeObject.customer?.id || "";
}

function getPaymentAmounts(paymentIntent) {
  const metadata = paymentIntent.metadata || {};

  const totalAmount = Number(paymentIntent.amount || 0);
  const taxAmount = Number(metadata.taxAmount || 0);
  const baseAmount = Number(metadata.baseAmount || totalAmount - taxAmount || totalAmount);

  return {
    baseAmount,
    taxAmount,
    totalAmount,
  };
}

function buildCustomerDetails(metadata = {}, email = "") {
  const firstName = cleanText(metadata.billingFirstName);
  const lastName = cleanText(metadata.billingLastName);

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim().replace(/\s+/g, " "),
    email: cleanText(email || metadata.billingEmail).toLowerCase(),

    mobileCountryCode: cleanText(metadata.billingMobileCountryCode),
    mobileCountryFlag: cleanText(metadata.billingMobileCountryFlag),
    mobileNumber: cleanText(metadata.billingMobileNumber),
    phone: makePhone(
      metadata.billingMobileCountryCode,
      metadata.billingMobileNumber
    ),

    country: cleanText(metadata.billingCountry).toUpperCase() || "GB",
    countryName: cleanText(metadata.billingCountryName),
    countryFlag: cleanText(metadata.billingCountryFlag),

    postalCode: cleanText(metadata.billingPostalCode),
    addressLine1: cleanText(metadata.billingAddressLine1),
    addressLine2: cleanText(metadata.billingAddressLine2),
    city: cleanText(metadata.billingCity),
  };
}

async function getSubscriptionDates(subscription) {
  let subscriptionStartDate = null;
  let subscriptionEndDate = null;

  if (subscription.current_period_start) {
    subscriptionStartDate = new Date(subscription.current_period_start * 1000);
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
  metadata = {},
}) {
  const now = new Date();

  const stripeActive =
    subscriptionStatus === "active" || subscriptionStatus === "trialing";

  const isExpired =
    subscriptionEndDate && new Date(subscriptionEndDate) <= now;

  const isActive = stripeActive && !isExpired;

  const updateData = {
    plan: isActive ? plan : "free",
    planType: isActive ? "subscription" : "",
    accessType: isActive ? "subscription" : "",
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
    lastPaymentStatus: isActive ? "paid" : "",
    updatedAt: now,
  };

  if (isActive && metadata?.billingEmail) {
    updateData.billingDetails = {
      firstName: cleanText(metadata.billingFirstName),
      lastName: cleanText(metadata.billingLastName),
      email: cleanText(metadata.billingEmail).toLowerCase(),

      mobileCountryCode: cleanText(metadata.billingMobileCountryCode),
      mobileCountryFlag: cleanText(metadata.billingMobileCountryFlag),
      mobileNumber: cleanText(metadata.billingMobileNumber),
      phone: makePhone(
        metadata.billingMobileCountryCode,
        metadata.billingMobileNumber
      ),

      country: cleanText(metadata.billingCountry),
      countryName: cleanText(metadata.billingCountryName),
      countryFlag: cleanText(metadata.billingCountryFlag),

      postalCode: cleanText(metadata.billingPostalCode),
      addressLine1: cleanText(metadata.billingAddressLine1),
      addressLine2: cleanText(metadata.billingAddressLine2),
      city: cleanText(metadata.billingCity),
    };
  }

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

  const userId = cleanText(subscription.metadata?.userId);
  const email = cleanText(subscription.metadata?.email);
  const plan =
    cleanText(subscription.metadata?.planId) ||
    cleanText(subscription.metadata?.plan) ||
    "paid";

  const customerId = getCustomerIdFromStripeObject(subscription);

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
    metadata: subscription.metadata || {},
  });
}

async function updateUserServiceOrderArray(paymentIntent, status) {
  const metadata = paymentIntent.metadata || {};

  const userId = cleanText(metadata.userId);
  const email = cleanText(metadata.email);
  const customerId = getCustomerIdFromStripeObject(paymentIntent);
  const now = new Date();

  const updatePayload = {
    $set: {
      "serviceOrders.$[order].paymentStatus": status,
      "serviceOrders.$[order].updatedAt": now,
    },
  };

  const options = {
    new: true,
    arrayFilters: [{ "order.stripePaymentIntentId": paymentIntent.id }],
  };

  let updatedUser = null;

  try {
    if (userId) {
      updatedUser = await User.findByIdAndUpdate(userId, updatePayload, options);
    }

    if (!updatedUser && customerId) {
      updatedUser = await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        updatePayload,
        options
      );
    }

    if (!updatedUser && email) {
      updatedUser = await User.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        updatePayload,
        options
      );
    }
  } catch (error) {
    console.log("User serviceOrders array update skipped:", error.message);
  }

  return updatedUser;
}

async function updateOneTimePayment(paymentIntent) {
  const metadata = paymentIntent.metadata || {};

  const userId = cleanText(metadata.userId);
  const email = cleanText(metadata.email);
  const serviceId = cleanText(metadata.serviceId) || "cv-builder";
  const serviceName = getServiceName(serviceId, metadata);
  const planId =
    cleanText(metadata.planId) ||
    cleanText(metadata.plan) ||
    "";
  const planName = cleanText(metadata.planName);
  const planType = cleanText(metadata.planType) || "payment";
  const serviceOrderId = cleanText(metadata.serviceOrderId);

  const offerActive = metadata.offerActive === "true";

  const offerStartedAt = metadata.offerStartedAt
    ? new Date(metadata.offerStartedAt)
    : null;

  const offerExpiresAt = metadata.offerExpiresAt
    ? new Date(metadata.offerExpiresAt)
    : null;

  const priceEnvUsed = cleanText(metadata.priceEnvUsed);

  const customerId = getCustomerIdFromStripeObject(paymentIntent);
  const now = new Date();

  let updatedUser = null;

  /*
    CV Builder one-time:
    - Update user access for 3 days
  */
  if (serviceId === "cv-builder") {
    const accessExpiresAt = addDays(now, 3);

    const billingDetails = {
      firstName: cleanText(metadata.billingFirstName),
      lastName: cleanText(metadata.billingLastName),
      email: cleanText(metadata.billingEmail).toLowerCase(),

      mobileCountryCode: cleanText(metadata.billingMobileCountryCode),
      mobileCountryFlag: cleanText(metadata.billingMobileCountryFlag),
      mobileNumber: cleanText(metadata.billingMobileNumber),
      phone: makePhone(
        metadata.billingMobileCountryCode,
        metadata.billingMobileNumber
      ),

      country: cleanText(metadata.billingCountry),
      countryName: cleanText(metadata.billingCountryName),
      countryFlag: cleanText(metadata.billingCountryFlag),

      postalCode: cleanText(metadata.billingPostalCode),
      addressLine1: cleanText(metadata.billingAddressLine1),
      addressLine2: cleanText(metadata.billingAddressLine2),
      city: cleanText(metadata.billingCity),
    };

    const updatePayload = {
      $set: {
        stripeCustomerId: customerId,
        lastPaymentStatus: "paid",
        cvBuilderOfferStartedAt: offerStartedAt,
        updatedAt: now,

        plan: planId,
        planType: "one-time",
        accessType: "one-time",

        stripePaymentIntentId: paymentIntent.id,

        paymentStatus: "paid",
        oneTimeAccessStatus: "active",
        accessExpiresAt,

        subscriptionStatus: "inactive",
        stripeSubscriptionId: "",
        hasActiveSubscription: true,
        subscriptionStartDate: now,
        subscriptionEndDate: accessExpiresAt,

        billingDetails,
      },
    };

    if (userId) {
      updatedUser = await User.findByIdAndUpdate(userId, updatePayload, {
        new: true,
      });
    }

    if (!updatedUser && customerId) {
      updatedUser = await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        updatePayload,
        { new: true }
      );
    }

    if (!updatedUser && email) {
      updatedUser = await User.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        updatePayload,
        { new: true }
      );
    }

    await updateUserServiceOrderArray(paymentIntent, "paid");
  }

  /*
    Optional user flags for logged-in logo/ads users.
    Guest checkout does not require User update.
  */
  if (serviceId === "logo-design" || serviceId === "ads") {
    const serviceUserUpdate = {
      $set: {
        stripeCustomerId: customerId,
        lastPaymentStatus: "paid",
        updatedAt: now,
      },
    };

    if (serviceId === "logo-design") {
      serviceUserUpdate.$set.logoDesignStatus = "paid";
      serviceUserUpdate.$set.logoDesignPlan = planId;
      serviceUserUpdate.$set.logoDesignPaymentIntentId = paymentIntent.id;
      serviceUserUpdate.$set.logoDesignPurchasedAt = now;
    }

    if (serviceId === "ads") {
      serviceUserUpdate.$set.adsServiceStatus = "paid";
      serviceUserUpdate.$set.adsServicePlan = planId;
      serviceUserUpdate.$set.adsServicePaymentIntentId = paymentIntent.id;
      serviceUserUpdate.$set.adsServicePurchasedAt = now;
    }

    if (userId) {
      updatedUser = await User.findByIdAndUpdate(userId, serviceUserUpdate, {
        new: true,
      });
    }

    if (!updatedUser && customerId) {
      updatedUser = await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        serviceUserUpdate,
        { new: true }
      );
    }

    if (!updatedUser && email) {
      updatedUser = await User.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        serviceUserUpdate,
        { new: true }
      );
    }
  }

  /*
    Update ServiceOrder collection.
    This is the main order record for logo-design and ads.
  */
  try {
    const { baseAmount, taxAmount, totalAmount } = getPaymentAmounts(paymentIntent);

    const customerDetails = buildCustomerDetails(metadata, email);

    const orderUpdate = {
      serviceId,
      serviceName,

      planId,
      planName,
      planType,

      customer: customerDetails,

      stripeCustomerId: customerId,
      stripePaymentIntentId: paymentIntent.id,

      paymentStatus: "paid",

      baseAmount,
      taxAmount,
      totalAmount,
      currency: paymentIntent.currency || "gbp",

      orderStatus: "new",
      source: "checkout",

      metadata: {
        serviceId,
        serviceName,
        planId,
        planName,
        planType,

        stripeStatus: paymentIntent.status,
        offerActive,
        offerStartedAt: offerStartedAt ? offerStartedAt.toISOString() : "",
        offerExpiresAt: offerExpiresAt ? offerExpiresAt.toISOString() : "",
        priceEnvUsed,

        guestCheckout: updatedUser ? false : true,
        paidAt: now.toISOString(),
        paymentIntentMetadata: metadata,
      },
    };

    if (serviceOrderId) {
      await ServiceOrder.findByIdAndUpdate(serviceOrderId, {
        $set: orderUpdate,
      });
    } else {
      await ServiceOrder.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        {
          $set: orderUpdate,
          $setOnInsert: {
            createdAt: now,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }
  } catch (error) {
    console.error("ServiceOrder update in webhook failed:", error);
  }

  console.log("Stripe one-time payment sync:", {
    foundUser: Boolean(updatedUser),
    email: updatedUser?.email || email || "",
    userId,
    customerId,
    serviceId,
    serviceName,
    planId,
    planName,
    paymentIntentId: paymentIntent.id,
    offerActive,
    offerStartedAt,
    offerExpiresAt,
    priceEnvUsed,
  });

  return updatedUser;
}

async function markOneTimePaymentFailed(paymentIntent) {
  const metadata = paymentIntent.metadata || {};

  const userId = cleanText(metadata.userId);
  const email = cleanText(metadata.email);
  const serviceId = cleanText(metadata.serviceId) || "cv-builder";
  const planId =
    cleanText(metadata.planId) ||
    cleanText(metadata.plan) ||
    "";
  const serviceOrderId = cleanText(metadata.serviceOrderId);
  const customerId = getCustomerIdFromStripeObject(paymentIntent);
  const now = new Date();

  const updatePayload = {
    $set: {
      lastPaymentStatus: "failed",
      updatedAt: now,
    },
  };

  if (serviceId === "cv-builder") {
    updatePayload.$set.paymentStatus = "failed";
    updatePayload.$set.oneTimeAccessStatus = "failed";
    updatePayload.$set.hasActiveSubscription = false;
  }

  if (serviceId === "logo-design") {
    updatePayload.$set.logoDesignStatus = "failed";
    updatePayload.$set.logoDesignPlan = planId;
  }

  if (serviceId === "ads") {
    updatePayload.$set.adsServiceStatus = "failed";
    updatePayload.$set.adsServicePlan = planId;
  }

  let updatedUser = null;

  if (userId) {
    updatedUser = await User.findByIdAndUpdate(userId, updatePayload, {
      new: true,
    });
  }

  if (!updatedUser && customerId) {
    updatedUser = await User.findOneAndUpdate(
      { stripeCustomerId: customerId },
      updatePayload,
      { new: true }
    );
  }

  if (!updatedUser && email) {
    updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      updatePayload,
      { new: true }
    );
  }

  await updateUserServiceOrderArray(paymentIntent, "failed");

  try {
    const serviceOrderUpdate = {
      paymentStatus: "failed",
    };

    if (serviceOrderId) {
      await ServiceOrder.findByIdAndUpdate(serviceOrderId, {
        $set: serviceOrderUpdate,
      });
    } else {
      await ServiceOrder.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        {
          $set: serviceOrderUpdate,
        }
      );
    }
  } catch (error) {
    console.error("ServiceOrder update failed for failed intent:", error);
  }

  return updatedUser;
}

export async function POST(req) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        success: false,
        error: "Stripe secret key is missing.",
      },
      { status: 500 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      {
        success: false,
        error: "Stripe webhook secret is missing.",
      },
      { status: 500 }
    );
  }

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
      await syncSubscriptionById(subscription.id);
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
          planType: "",
          accessType: "",
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
          planType: "",
          accessType: "",
          subscriptionStatus: "inactive",
          stripeSubscriptionId: "",
          subscriptionEndDate: new Date(),
          hasActiveSubscription: false,
          updatedAt: new Date(),
        },
        { new: true }
      );
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      await updateOneTimePayment(paymentIntent);
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      await markOneTimePaymentFailed(paymentIntent);
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