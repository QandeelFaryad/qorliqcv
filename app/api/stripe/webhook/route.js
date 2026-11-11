import { NextResponse } from "next/server";
import Stripe from "stripe";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ServiceOrder from "@/models/ServiceOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   BASIC HELPERS
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

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getServiceName(serviceId, metadata = {}) {
  const metadataName = cleanText(metadata.serviceName);

  if (metadataName) {
    return metadataName;
  }

  if (serviceId === "logo-design") {
    return "Logo Design";
  }

  if (serviceId === "ads") {
    return "Ads Service";
  }

  return "CV Builder";
}

function getCustomerIdFromStripeObject(stripeObject) {
  if (!stripeObject) {
    return "";
  }

  return typeof stripeObject.customer === "string"
    ? stripeObject.customer
    : stripeObject.customer?.id || "";
}

function getInvoiceSubscriptionId(invoice) {
  if (!invoice) {
    return "";
  }

  if (typeof invoice.subscription === "string") {
    return invoice.subscription;
  }

  if (invoice.subscription?.id) {
    return invoice.subscription.id;
  }

  const parentSubscription =
    invoice.parent?.subscription_details?.subscription;

  if (typeof parentSubscription === "string") {
    return parentSubscription;
  }

  return parentSubscription?.id || "";
}

function getPaymentIntentInvoiceId(paymentIntent) {
  if (!paymentIntent?.invoice) {
    return "";
  }

  return typeof paymentIntent.invoice === "string"
    ? paymentIntent.invoice
    : paymentIntent.invoice?.id || "";
}

function getPaymentAmounts(paymentIntent) {
  const metadata = paymentIntent.metadata || {};

  const totalAmount = Number(paymentIntent.amount || 0);
  const taxAmountValue = Number(metadata.taxAmount);
  const baseAmountValue = Number(metadata.baseAmount);

  const taxAmount = Number.isFinite(taxAmountValue)
    ? taxAmountValue
    : 0;

  const calculatedBaseAmount = Math.max(
    totalAmount - taxAmount,
    0
  );

  const baseAmount = Number.isFinite(baseAmountValue)
    ? baseAmountValue
    : calculatedBaseAmount;

  return {
    baseAmount,
    taxAmount,
    totalAmount,
  };
}

/* =========================================================
   CUSTOMER DETAILS
========================================================= */

function buildCustomerDetails(metadata = {}, email = "") {
  const firstName = cleanText(metadata.billingFirstName);
  const lastName = cleanText(metadata.billingLastName);

  return {
    firstName,
    lastName,

    fullName: `${firstName} ${lastName}`
      .trim()
      .replace(/\s+/g, " "),

    email: cleanText(
      email || metadata.billingEmail
    ).toLowerCase(),

    mobileCountryCode: cleanText(
      metadata.billingMobileCountryCode
    ),

    mobileCountryFlag: cleanText(
      metadata.billingMobileCountryFlag
    ),

    mobileNumber: cleanText(
      metadata.billingMobileNumber
    ),

    phone: makePhone(
      metadata.billingMobileCountryCode,
      metadata.billingMobileNumber
    ),

    country:
      cleanText(metadata.billingCountry).toUpperCase() ||
      "GB",

    countryName: cleanText(
      metadata.billingCountryName
    ),

    countryFlag: cleanText(
      metadata.billingCountryFlag
    ),

    postalCode: cleanText(
      metadata.billingPostalCode
    ),

    addressLine1: cleanText(
      metadata.billingAddressLine1
    ),

    addressLine2: cleanText(
      metadata.billingAddressLine2
    ),

    city: cleanText(metadata.billingCity),
  };
}

function buildBillingDetails(metadata = {}, fallbackEmail = "") {
  return {
    firstName: cleanText(metadata.billingFirstName),
    lastName: cleanText(metadata.billingLastName),

    email: cleanText(
      metadata.billingEmail || fallbackEmail
    ).toLowerCase(),

    mobileCountryCode: cleanText(
      metadata.billingMobileCountryCode
    ),

    mobileCountryFlag: cleanText(
      metadata.billingMobileCountryFlag
    ),

    mobileNumber: cleanText(
      metadata.billingMobileNumber
    ),

    phone: makePhone(
      metadata.billingMobileCountryCode,
      metadata.billingMobileNumber
    ),

    country: cleanText(
      metadata.billingCountry
    ).toUpperCase(),

    countryName: cleanText(
      metadata.billingCountryName
    ),

    countryFlag: cleanText(
      metadata.billingCountryFlag
    ),

    postalCode: cleanText(
      metadata.billingPostalCode
    ),

    addressLine1: cleanText(
      metadata.billingAddressLine1
    ),

    addressLine2: cleanText(
      metadata.billingAddressLine2
    ),

    city: cleanText(metadata.billingCity),
  };
}

/* =========================================================
   USER LOOKUP AND UPDATE HELPERS
========================================================= */

async function findUserByIdentifiers({
  userId = "",
  customerId = "",
  email = "",
}) {
  let user = null;

  if (userId) {
    try {
      user = await User.findById(userId);
    } catch (error) {
      console.warn(
        "User lookup by ID skipped:",
        error?.message
      );
    }
  }

  if (!user && customerId) {
    user = await User.findOne({
      stripeCustomerId: customerId,
    });
  }

  if (!user && email) {
    user = await User.findOne({
      email: email.toLowerCase().trim(),
    });
  }

  return user;
}

async function updateUserByIdentifiers({
  userId = "",
  customerId = "",
  email = "",
  update,
}) {
  const options = {
    new: true,
    runValidators: true,
  };

  let updatedUser = null;

  if (userId) {
    try {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        update,
        options
      );
    } catch (error) {
      console.warn(
        "User update by ID skipped:",
        error?.message
      );
    }
  }

  if (!updatedUser && customerId) {
    updatedUser = await User.findOneAndUpdate(
      {
        stripeCustomerId: customerId,
      },
      update,
      options
    );
  }

  if (!updatedUser && email) {
    updatedUser = await User.findOneAndUpdate(
      {
        email: email.toLowerCase().trim(),
      },
      update,
      options
    );
  }

  return updatedUser;
}

async function updateUserServiceOrderArray(
  paymentIntent,
  status
) {
  const metadata = paymentIntent.metadata || {};

  const userId = cleanText(metadata.userId);
  const email = cleanText(metadata.email);
  const customerId =
    getCustomerIdFromStripeObject(paymentIntent);

  const update = {
    $set: {
      "serviceOrders.$[order].paymentStatus": status,
      "serviceOrders.$[order].updatedAt": new Date(),
    },
  };

  const options = {
    new: true,

    arrayFilters: [
      {
        "order.stripePaymentIntentId":
          paymentIntent.id,
      },
    ],
  };

  let updatedUser = null;

  try {
    if (userId) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        update,
        options
      );
    }

    if (!updatedUser && customerId) {
      updatedUser = await User.findOneAndUpdate(
        {
          stripeCustomerId: customerId,
        },
        update,
        options
      );
    }

    if (!updatedUser && email) {
      updatedUser = await User.findOneAndUpdate(
        {
          email: email.toLowerCase().trim(),
        },
        update,
        options
      );
    }
  } catch (error) {
    console.log(
      "User serviceOrders array update skipped:",
      error?.message
    );
  }

  return updatedUser;
}

/* =========================================================
   SUBSCRIPTION HELPERS
========================================================= */

async function getSubscriptionDates(
  stripe,
  subscription
) {
  let subscriptionStartDate = null;
  let subscriptionEndDate = null;

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

  const subscriptionItem =
    subscription.items?.data?.[0];

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

  if (
    (!subscriptionStartDate ||
      !subscriptionEndDate) &&
    subscription.latest_invoice
  ) {
    let invoice = subscription.latest_invoice;

    if (typeof invoice === "string") {
      invoice = await stripe.invoices.retrieve(invoice);
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

  if (
    !subscriptionStartDate &&
    (subscription.status === "active" ||
      subscription.status === "trialing")
  ) {
    subscriptionStartDate = new Date();
  }

  return {
    subscriptionStartDate,
    subscriptionEndDate,
  };
}

async function syncSubscriptionObject(
  stripe,
  subscription
) {
  const metadata = subscription.metadata || {};

  const userId = cleanText(metadata.userId);
  const email = cleanText(metadata.email);

  const customerId =
    getCustomerIdFromStripeObject(subscription);

  const plan =
    cleanText(metadata.planId) ||
    cleanText(metadata.plan) ||
    "paid";

  const {
    subscriptionStartDate,
    subscriptionEndDate,
  } = await getSubscriptionDates(
    stripe,
    subscription
  );

  const now = new Date();

  const stripeActive =
    subscription.status === "active" ||
    subscription.status === "trialing";

  const isExpired = Boolean(
    subscriptionEndDate &&
      subscriptionEndDate <= now
  );

  const isActive =
    stripeActive && !isExpired;

  const failedStatuses = [
    "past_due",
    "unpaid",
    "incomplete_expired",
    "canceled",
  ];

  const lastPaymentStatus = isActive
    ? "paid"
    : failedStatuses.includes(subscription.status)
      ? "failed"
      : "";

  const updateSet = {
    plan: isActive ? plan : "free",

    planType: isActive
      ? "subscription"
      : "",

    accessType: isActive
      ? "subscription"
      : "",

    subscriptionStatus: isActive
      ? "active"
      : isExpired
        ? "inactive"
        : subscription.status || "inactive",

    stripeCustomerId: customerId,
    stripeSubscriptionId:
      subscription.id || "",

    stripePaymentIntentId: "",

    subscriptionStartDate:
      subscriptionStartDate || null,

    subscriptionEndDate:
      subscriptionEndDate || null,

    hasActiveSubscription: isActive,

    paymentStatus: isActive ? "paid" : "",
    lastPaymentStatus,

    oneTimeAccessStatus: "",
    accessExpiresAt: null,

    updatedAt: now,
  };

  if (metadata.billingEmail) {
    updateSet.billingDetails =
      buildBillingDetails(metadata, email);
  }

  const updatedUser =
    await updateUserByIdentifiers({
      userId,
      customerId,
      email,

      update: {
        $set: updateSet,

        $unset: {
          cvBuilderOfferStartedAt: "",
        },
      },
    });

  console.log(
    "Stripe subscription synchronized:",
    {
      foundUser: Boolean(updatedUser),

      email:
        updatedUser?.email ||
        email ||
        "",

      customerId,
      subscriptionId:
        subscription.id,

      plan:
        updatedUser?.plan ||
        updateSet.plan,

      subscriptionStatus:
        updatedUser?.subscriptionStatus ||
        updateSet.subscriptionStatus,

      subscriptionStartDate:
        updateSet.subscriptionStartDate,

      subscriptionEndDate:
        updateSet.subscriptionEndDate,

      hasActiveSubscription:
        updateSet.hasActiveSubscription,
    }
  );

  return updatedUser;
}

async function syncSubscriptionById(
  stripe,
  subscriptionId
) {
  if (!subscriptionId) {
    return null;
  }

  const subscription =
    await stripe.subscriptions.retrieve(
      subscriptionId,
      {
        expand: [
          "items.data.price",
          "latest_invoice",
        ],
      }
    );

  return syncSubscriptionObject(
    stripe,
    subscription
  );
}

/* =========================================================
   ONE-TIME PAYMENT SUCCESS
========================================================= */

async function updateOneTimePayment(
  stripe,
  paymentIntent
) {
  const metadata = paymentIntent.metadata || {};

  const userId = cleanText(metadata.userId);
  const email = cleanText(metadata.email);

  const customerId =
    getCustomerIdFromStripeObject(paymentIntent);

  const serviceId =
    cleanText(metadata.serviceId) ||
    "cv-builder";

  const serviceName =
    getServiceName(serviceId, metadata);

  const planId =
    cleanText(metadata.planId) ||
    cleanText(metadata.plan) ||
    (serviceId === "cv-builder"
      ? "one-time"
      : "");

  const planName = cleanText(metadata.planName);

  const planType =
    cleanText(metadata.planType) ||
    "payment";

  const serviceOrderId =
    cleanText(metadata.serviceOrderId);

  const now = new Date();

  const paidAt = paymentIntent.created
    ? new Date(paymentIntent.created * 1000)
    : now;

  let updatedUser = null;

  /* =====================================================
     CV BUILDER ONE-TIME ACCESS
  ===================================================== */

  if (serviceId === "cv-builder") {
    const existingUser =
      await findUserByIdentifiers({
        userId,
        customerId,
        email,
      });

    /*
      A later one-time purchase replaces an existing
      subscription. Cancel it to prevent future renewal.
    */
    if (existingUser?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(
          existingUser.stripeSubscriptionId
        );
      } catch (error) {
        console.log(
          "Previous subscription cancellation skipped:",
          error?.message
        );
      }
    }

    const accessExpiresAt =
      addDays(paidAt, 3);

    const billingDetails =
      buildBillingDetails(metadata, email);

    updatedUser =
      await updateUserByIdentifiers({
        userId,
        customerId,
        email,

        update: {
          $set: {
            stripeCustomerId: customerId,

            plan: "one-time",
            planType: "one-time",
            accessType: "one-time",

            paymentStatus: "paid",
            lastPaymentStatus: "paid",
            oneTimeAccessStatus: "active",

            /*
              Kept active for compatibility with current
              access checks in the application.
            */
            subscriptionStatus: "active",
            hasActiveSubscription: true,

            subscriptionStartDate: paidAt,
            subscriptionEndDate:
              accessExpiresAt,

            accessExpiresAt,

            stripePaymentIntentId:
              paymentIntent.id,

            stripeSubscriptionId: "",

            billingDetails,

            updatedAt: now,
          },

          $unset: {
            cvBuilderOfferStartedAt: "",
          },
        },
      });

    await updateUserServiceOrderArray(
      paymentIntent,
      "paid"
    );
  }

  /* =====================================================
     LOGO DESIGN / ADS USER FLAGS
  ===================================================== */

  if (
    serviceId === "logo-design" ||
    serviceId === "ads"
  ) {
    const serviceUpdate = {
      stripeCustomerId: customerId,
      lastPaymentStatus: "paid",
      updatedAt: now,
    };

    if (serviceId === "logo-design") {
      serviceUpdate.logoDesignStatus = "paid";
      serviceUpdate.logoDesignPlan = planId;

      serviceUpdate.logoDesignPaymentIntentId =
        paymentIntent.id;

      serviceUpdate.logoDesignPurchasedAt = paidAt;
    }

    if (serviceId === "ads") {
      serviceUpdate.adsServiceStatus = "paid";
      serviceUpdate.adsServicePlan = planId;

      serviceUpdate.adsServicePaymentIntentId =
        paymentIntent.id;

      serviceUpdate.adsServicePurchasedAt = paidAt;
    }

    updatedUser =
      await updateUserByIdentifiers({
        userId,
        customerId,
        email,

        update: {
          $set: serviceUpdate,

          $unset: {
            cvBuilderOfferStartedAt: "",
          },
        },
      });
  }

  /* =====================================================
     SERVICE ORDER
  ===================================================== */

  try {
    const {
      baseAmount,
      taxAmount,
      totalAmount,
    } = getPaymentAmounts(paymentIntent);

    const customerDetails =
      buildCustomerDetails(metadata, email);

    const orderUpdate = {
      serviceId,
      serviceName,

      planId,
      planName,
      planType,

      customer: customerDetails,

      stripeCustomerId: customerId,

      stripePaymentIntentId:
        paymentIntent.id,

      paymentStatus: "paid",

      baseAmount,
      taxAmount,
      totalAmount,

      currency:
        paymentIntent.currency ||
        "gbp",

      orderStatus: "new",
      source: "checkout",

      metadata: {
        serviceId,
        serviceName,

        planId,
        planName,
        planType,

        stripeStatus:
          paymentIntent.status,

        guestCheckout:
          updatedUser ? false : true,

        paidAt:
          paidAt.toISOString(),

        paymentIntentMetadata:
          metadata,
      },
    };

    if (serviceOrderId) {
      await ServiceOrder.findByIdAndUpdate(
        serviceOrderId,
        {
          $set: orderUpdate,
        },
        {
          new: true,
          runValidators: true,
        }
      );
    } else if (
      serviceId === "logo-design" ||
      serviceId === "ads"
    ) {
      await ServiceOrder.findOneAndUpdate(
        {
          stripePaymentIntentId:
            paymentIntent.id,
        },
        {
          $set: orderUpdate,

          $setOnInsert: {
            createdAt: now,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    }
  } catch (error) {
    console.error(
      "ServiceOrder webhook update failed:",
      error
    );
  }

  console.log(
    "Stripe one-time payment synchronized:",
    {
      foundUser: Boolean(updatedUser),

      email:
        updatedUser?.email ||
        email ||
        "",

      userId,
      customerId,

      serviceId,
      serviceName,

      planId,
      planName,

      paymentIntentId:
        paymentIntent.id,
    }
  );

  return updatedUser;
}

/* =========================================================
   ONE-TIME PAYMENT FAILED
========================================================= */

async function markOneTimePaymentFailed(
  paymentIntent
) {
  const metadata = paymentIntent.metadata || {};

  const userId = cleanText(metadata.userId);
  const email = cleanText(metadata.email);

  const customerId =
    getCustomerIdFromStripeObject(paymentIntent);

  const serviceId =
    cleanText(metadata.serviceId) ||
    "cv-builder";

  const planId =
    cleanText(metadata.planId) ||
    cleanText(metadata.plan) ||
    "";

  const serviceOrderId =
    cleanText(metadata.serviceOrderId);

  const now = new Date();

  const updateSet = {
    lastPaymentStatus: "failed",
    updatedAt: now,
  };

  /*
    Do not revoke existing CV access because a new
    payment attempt failed.
  */
  if (serviceId === "logo-design") {
    updateSet.logoDesignStatus = "failed";
    updateSet.logoDesignPlan = planId;
  }

  if (serviceId === "ads") {
    updateSet.adsServiceStatus = "failed";
    updateSet.adsServicePlan = planId;
  }

  const updatedUser =
    await updateUserByIdentifiers({
      userId,
      customerId,
      email,

      update: {
        $set: updateSet,

        $unset: {
          cvBuilderOfferStartedAt: "",
        },
      },
    });

  await updateUserServiceOrderArray(
    paymentIntent,
    "failed"
  );

  try {
    const serviceOrderUpdate = {
      paymentStatus: "failed",
      updatedAt: now,
    };

    if (serviceOrderId) {
      await ServiceOrder.findByIdAndUpdate(
        serviceOrderId,
        {
          $set: serviceOrderUpdate,
        }
      );
    } else {
      await ServiceOrder.findOneAndUpdate(
        {
          stripePaymentIntentId:
            paymentIntent.id,
        },
        {
          $set: serviceOrderUpdate,
        }
      );
    }
  } catch (error) {
    console.error(
      "ServiceOrder failed-payment update failed:",
      error
    );
  }

  return updatedUser;
}

/* =========================================================
   PAYMENT INTENT EVENT ROUTING
========================================================= */

async function getSubscriptionIdFromPaymentIntent(
  stripe,
  paymentIntent
) {
  const invoiceId =
    getPaymentIntentInvoiceId(paymentIntent);

  if (!invoiceId) {
    return "";
  }

  try {
    const invoice =
      await stripe.invoices.retrieve(invoiceId);

    return getInvoiceSubscriptionId(invoice);
  } catch (error) {
    console.error(
      "Unable to inspect PaymentIntent invoice:",
      error?.message
    );

    return "";
  }
}

async function handleSuccessfulPaymentIntent(
  stripe,
  paymentIntent
) {
  /*
    Subscription invoice PaymentIntents must never
    be treated as one-time CV payments.
  */
  const subscriptionId =
    await getSubscriptionIdFromPaymentIntent(
      stripe,
      paymentIntent
    );

  if (subscriptionId) {
    await syncSubscriptionById(
      stripe,
      subscriptionId
    );

    return;
  }

  await updateOneTimePayment(
    stripe,
    paymentIntent
  );
}

async function handleFailedPaymentIntent(
  stripe,
  paymentIntent
) {
  const subscriptionId =
    await getSubscriptionIdFromPaymentIntent(
      stripe,
      paymentIntent
    );

  if (subscriptionId) {
    await syncSubscriptionById(
      stripe,
      subscriptionId
    );

    return;
  }

  await markOneTimePaymentFailed(
    paymentIntent
  );
}

/* =========================================================
   WEBHOOK ROUTE
========================================================= */

export async function POST(req) {
  const stripe = getStripeClient();

  if (!stripe) {
    return NextResponse.json(
      {
        success: false,
        error: "Stripe secret key is missing.",
      },
      { status: 500 }
    );
  }

  const webhookSecret = cleanText(
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (!webhookSecret) {
    return NextResponse.json(
      {
        success: false,
        error: "Stripe webhook secret is missing.",
      },
      { status: 500 }
    );
  }

  const rawBody = await req.text();

  const signature =
    req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        success: false,
        error: "Stripe signature is missing.",
      },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature error:",
      error?.message
    );

    return NextResponse.json(
      {
        success: false,
        error: "Invalid webhook signature.",
      },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    console.log(
      "Stripe webhook received:",
      {
        id: event.id,
        type: event.type,
      }
    );

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription =
          event.data.object;

        await syncSubscriptionObject(
          stripe,
          subscription
        );

        break;
      }

      case "customer.subscription.deleted": {
        const subscription =
          event.data.object;

        await syncSubscriptionObject(
          stripe,
          subscription
        );

        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.paid": {
        const invoice =
          event.data.object;

        const subscriptionId =
          getInvoiceSubscriptionId(invoice);

        if (subscriptionId) {
          await syncSubscriptionById(
            stripe,
            subscriptionId
          );
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice =
          event.data.object;

        const subscriptionId =
          getInvoiceSubscriptionId(invoice);

        if (subscriptionId) {
          await syncSubscriptionById(
            stripe,
            subscriptionId
          );
        }

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent =
          event.data.object;

        await handleSuccessfulPaymentIntent(
          stripe,
          paymentIntent
        );

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent =
          event.data.object;

        await handleFailedPaymentIntent(
          stripe,
          paymentIntent
        );

        break;
      }

      default: {
        console.log(
          "Stripe webhook event ignored:",
          event.type
        );
      }
    }

    return NextResponse.json({
      success: true,
      received: true,
      eventId: event.id,
      eventType: event.type,
    });
  } catch (error) {
    console.error(
      "Stripe webhook handler error:",
      {
        name: error?.name,
        type: error?.type,
        message: error?.message,

        rawMessage:
          error?.raw?.message,

        code:
          error?.raw?.code ||
          error?.code,

        requestId:
          error?.requestId,

        stack: error?.stack,
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: "Webhook handler failed.",
        message:
          error?.raw?.message ||
          error?.message ||
          "Unknown webhook error.",
      },
      { status: 500 }
    );
  }
}