import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongodb";
import { authOptions } from "@/lib/authOptions";
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

async function updateUserServiceOrderStatus(userId, paymentIntentId, status) {
  if (!userId || !paymentIntentId) return;

  try {
    await User.updateOne(
      {
        _id: userId,
        "serviceOrders.stripePaymentIntentId": paymentIntentId,
      },
      {
        $set: {
          "serviceOrders.$.paymentStatus": status,
          "serviceOrders.$.updatedAt": new Date(),
        },
      }
    );
  } catch (error) {
    console.log("User service order status update skipped:", error.message);
  }
}

function buildCustomerDetails({ customerForm = {}, metadata = {}, paymentIntent = {}, sessionEmail = "" }) {
  const fallbackEmail =
    cleanText(customerForm.email).toLowerCase() ||
    cleanText(metadata.billingEmail).toLowerCase() ||
    cleanText(paymentIntent.receipt_email).toLowerCase() ||
    cleanText(sessionEmail).toLowerCase();

  const customerDetails = {
    firstName:
      cleanText(customerForm.firstName) ||
      cleanText(metadata.billingFirstName),

    lastName:
      cleanText(customerForm.lastName) ||
      cleanText(metadata.billingLastName),

    email: fallbackEmail,

    mobileCountryCode:
      cleanText(customerForm.mobileCountryCode) ||
      cleanText(metadata.billingMobileCountryCode),

    mobileCountryFlag:
      cleanText(customerForm.mobileCountryFlag) ||
      cleanText(metadata.billingMobileCountryFlag),

    mobileNumber:
      cleanText(customerForm.mobileNumber) ||
      cleanText(metadata.billingMobileNumber),

    country:
      cleanText(customerForm.country).toUpperCase() ||
      cleanText(metadata.billingCountry).toUpperCase() ||
      "GB",

    countryName:
      cleanText(customerForm.countryName) ||
      cleanText(metadata.billingCountryName),

    countryFlag:
      cleanText(customerForm.countryFlag) ||
      cleanText(metadata.billingCountryFlag),

    postalCode:
      cleanText(customerForm.postalCode) ||
      cleanText(metadata.billingPostalCode),

    addressLine1:
      cleanText(customerForm.addressLine1) ||
      cleanText(metadata.billingAddressLine1),

    addressLine2:
      cleanText(customerForm.addressLine2) ||
      cleanText(metadata.billingAddressLine2),

    city:
      cleanText(customerForm.city) ||
      cleanText(metadata.billingCity),
  };

  customerDetails.phone = makePhone(
    customerDetails.mobileCountryCode,
    customerDetails.mobileNumber
  );

  customerDetails.fullName = `${customerDetails.firstName} ${customerDetails.lastName}`
    .trim()
    .replace(/\s+/g, " ");

  return customerDetails;
}

export async function POST(req) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          hasAccess: false,
          error: "Stripe secret key is missing.",
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const paymentIntentId = cleanText(body.paymentIntentId);
    const requestedPlanId = cleanText(body.planId);
    const customerForm = body.customerForm || {};

    if (!paymentIntentId) {
      return NextResponse.json(
        {
          success: false,
          hasAccess: false,
          error: "Payment Intent ID is missing.",
        },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const metadata = paymentIntent.metadata || {};

    const serviceId = cleanText(metadata.serviceId) || "cv-builder";

    const serviceName =
      cleanText(metadata.serviceName) ||
      (serviceId === "logo-design"
        ? "Logo Design"
        : serviceId === "ads"
          ? "Ads Service"
          : "CV Builder");

    const finalPlanId =
      requestedPlanId ||
      cleanText(metadata.planId) ||
      cleanText(metadata.plan) ||
      "";

    const finalPlanName = cleanText(metadata.planName);
    const finalPlanType = cleanText(metadata.planType) || "payment";
    const serviceOrderId = cleanText(metadata.serviceOrderId);

    const isCvBuilderPlan = serviceId === "cv-builder";
    const isLogoPlan = serviceId === "logo-design";
    const isAdsPlan = serviceId === "ads";
    const isGuestServicePlan = isLogoPlan || isAdsPlan;

    const session = await getServerSession(authOptions);

    /*
      Login rule:
      - CV Builder: login required
      - Logo Design: no login required
      - Ads: no login required
    */
    if (isCvBuilderPlan && !session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          hasAccess: false,
          error: "Please login first.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    let user = null;

    if (session?.user?.email) {
      user = await User.findOne({
        email: session.user.email.toLowerCase().trim(),
      });
    }

    if (isCvBuilderPlan && !user) {
      return NextResponse.json(
        {
          success: false,
          hasAccess: false,
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    const customerDetails = buildCustomerDetails({
      customerForm,
      metadata,
      paymentIntent,
      sessionEmail: session?.user?.email || "",
    });

    if (!customerDetails.email) {
      return NextResponse.json(
        {
          success: false,
          hasAccess: false,
          error: "Customer email is required.",
        },
        { status: 400 }
      );
    }

    const billingDetails = {
      firstName: customerDetails.firstName,
      lastName: customerDetails.lastName,
      email: customerDetails.email,

      mobileCountryCode: customerDetails.mobileCountryCode,
      mobileCountryFlag: customerDetails.mobileCountryFlag,
      mobileNumber: customerDetails.mobileNumber,
      phone: customerDetails.phone,

      country: customerDetails.country,
      countryName: customerDetails.countryName,
      countryFlag: customerDetails.countryFlag,

      postalCode: customerDetails.postalCode,
      addressLine1: customerDetails.addressLine1,
      addressLine2: customerDetails.addressLine2,
      city: customerDetails.city,
    };

    const stripeCustomerId =
      typeof paymentIntent.customer === "string"
        ? paymentIntent.customer
        : paymentIntent.customer?.id || user?.stripeCustomerId || "";

    /*
      If payment is not completed:
      - Do not mark paid
      - Do not create paid order
      - Only update paymentStatus safely
    */
    if (paymentIntent.status !== "succeeded") {
      if (user) {
        await updateUserServiceOrderStatus(
          user._id,
          paymentIntent.id,
          paymentIntent.status || "pending"
        );
      }

      if (serviceOrderId) {
        const updatePayload = {
          paymentStatus: paymentIntent.status || "pending",
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId,
        };

        if (paymentIntent.status === "canceled") {
          updatePayload.orderStatus = "cancelled";
        }

        await ServiceOrder.findByIdAndUpdate(serviceOrderId, {
          $set: updatePayload,
        });
      }

      return NextResponse.json(
        {
          success: false,
          hasAccess: false,
          error: "Payment is not completed yet.",
          stripeStatus: paymentIntent.status,
          serviceId,
          serviceName,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    /*
      Stripe amount is always in minor unit:
      GBP 15000 = £150.00
    */
    const totalAmount = Number(paymentIntent.amount || 0);
    const taxAmount = Number(metadata.taxAmount || 0);
    const baseAmount = Number(metadata.baseAmount || totalAmount - taxAmount || totalAmount);

    /*
      CV Builder one-time:
      - Login required
      - 3 days access
    */
if (isCvBuilderPlan) {
  const offerActive = metadata.offerActive === "true";

  const offerStartedAt = metadata.offerStartedAt
    ? new Date(metadata.offerStartedAt)
    : user?.cvBuilderOfferStartedAt || null;

  const paidAt = paymentIntent.created
    ? new Date(paymentIntent.created * 1000)
    : new Date();

  const accessExpiresAt = addDays(paidAt, 3);

  if (user?.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (error) {
      console.log("Old subscription cancel skipped:", error.message);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        stripeCustomerId,

        plan: "one-time",
        planType: "one-time",
        accessType: "one-time",

        paymentStatus: "paid",
        lastPaymentStatus: "paid",
        oneTimeAccessStatus: "active",

        subscriptionStatus: "active",
        hasActiveSubscription: true,

        subscriptionStartDate: paidAt,
        subscriptionEndDate: accessExpiresAt,
        accessExpiresAt,

        stripePaymentIntentId: paymentIntent.id,
        stripeSubscriptionId: "",

        billingDetails,
        cvBuilderOfferStartedAt: offerStartedAt,

        updatedAt: new Date(),
      },
    },
    { new: true }
  );

  await updateUserServiceOrderStatus(user._id, paymentIntent.id, "paid");

  if (serviceOrderId) {
    await ServiceOrder.findByIdAndUpdate(serviceOrderId, {
      $set: {
        paymentStatus: "paid",
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId,
        baseAmount,
        taxAmount,
        totalAmount,
        currency: paymentIntent.currency || "gbp",
        orderStatus: "new",
        updatedAt: new Date(),
      },
    });
  }

  return NextResponse.json({
    success: true,
    type: "one-time",
    hasAccess: true,
    hasOneTimeAccess: true,
    orderConfirmed: true,
    guestCheckout: false,

    accessType: "one-time",
    serviceId,
    serviceName,
    message: "CV Builder access activated.",

    paymentStatus: "paid",
    stripeStatus: paymentIntent.status,
    plan: updatedUser.plan,

    subscriptionStatus: updatedUser.subscriptionStatus,
    subscriptionStartDate: updatedUser.subscriptionStartDate,
    subscriptionEndDate: updatedUser.subscriptionEndDate,
    accessExpiresAt: updatedUser.accessExpiresAt,
    hasActiveSubscription: updatedUser.hasActiveSubscription,

    billingDetails: updatedUser.billingDetails || billingDetails,

    offerActive,
    offerStartedAt,
    offerExpiresAt: metadata.offerExpiresAt || null,
    priceEnvUsed: metadata.priceEnvUsed || "",
    cvBuilderOfferStartedAt: updatedUser.cvBuilderOfferStartedAt || null,
  });
}
    /*
      Logo Design / Ads:
      - Guest checkout allowed
      - ServiceOrder saved/updated after successful payment
    */
    if (isGuestServicePlan) {
      const orderUpdate = {
        serviceId,
        serviceName,

        planId: finalPlanId,
        planName: finalPlanName,
        planType: finalPlanType,

        customer: {
          firstName: customerDetails.firstName,
          lastName: customerDetails.lastName,
          fullName: customerDetails.fullName,
          email: customerDetails.email,

          mobileCountryCode: customerDetails.mobileCountryCode,
          mobileCountryFlag: customerDetails.mobileCountryFlag,
          mobileNumber: customerDetails.mobileNumber,
          phone: customerDetails.phone,

          country: customerDetails.country,
          countryName: customerDetails.countryName,
          countryFlag: customerDetails.countryFlag,

          postalCode: customerDetails.postalCode,
          addressLine1: customerDetails.addressLine1,
          addressLine2: customerDetails.addressLine2,
          city: customerDetails.city,
        },

        stripeCustomerId,
        stripePaymentIntentId: paymentIntent.id,

        paymentStatus: "paid",

        baseAmount,
        taxAmount,
        totalAmount,
        currency: paymentIntent.currency || "gbp",

        orderStatus: "new",
        source: "checkout",

        metadata: {
          planId: finalPlanId,
          planName: finalPlanName,
          planType: finalPlanType,
          serviceId,
          serviceName,
          stripeStatus: paymentIntent.status,
          guestCheckout: user ? false : true,
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
          {
            stripePaymentIntentId: paymentIntent.id,
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
            setDefaultsOnInsert: true,
          }
        );
      }

      return NextResponse.json({
        success: true,
        hasAccess: true,
        hasOneTimeAccess: false,
        orderConfirmed: true,

        guestCheckout: user ? false : true,

        accessType: serviceId,
        serviceId,
        serviceName,

        message:
          serviceId === "logo-design"
            ? "Logo Design order confirmed."
            : "Ads Service order confirmed.",

        paymentStatus: "paid",
        stripeStatus: paymentIntent.status,
        plan: finalPlanId,

        logoDesignStatus: serviceId === "logo-design" ? "paid" : "",
        adsServiceStatus: serviceId === "ads" ? "paid" : "",

        billingDetails,
      });
    }

    return NextResponse.json(
      {
        success: false,
        hasAccess: false,
        error: "Unsupported service type.",
        serviceId,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Verify one-time payment error:", error);

    return NextResponse.json(
      {
        success: false,
        hasAccess: false,
        error: error.message || "Unable to verify one-time payment.",
      },
      { status: 500 }
    );
  }
}