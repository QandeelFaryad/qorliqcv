import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongodb";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
import ServiceOrder from "@/models/ServiceOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json(
    {
      success: false,
      hasAccess: false,
      error: message,
      ...extra,
    },
    { status }
  );
}

async function updateUserServiceOrderStatus(
  userId,
  paymentIntentId,
  status
) {
  if (!userId || !paymentIntentId) {
    return;
  }

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
    console.log(
      "User service order status update skipped:",
      error?.message
    );
  }
}

function buildCustomerDetails({
  customerForm = {},
  metadata = {},
  paymentIntent = {},
  sessionEmail = "",
}) {
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

  customerDetails.fullName =
    `${customerDetails.firstName} ${customerDetails.lastName}`
      .trim()
      .replace(/\s+/g, " ");

  return customerDetails;
}

export async function POST(req) {
  try {
    const stripe = getStripeClient();

    if (!stripe) {
      return jsonError(
        "Stripe secret key is missing.",
        500
      );
    }

    const body = await req.json().catch(() => ({}));

    const paymentIntentId = cleanText(body.paymentIntentId);
    const requestedPlanId = cleanText(body.planId);
    const customerForm = body.customerForm || {};

    if (!paymentIntentId) {
      return jsonError(
        "Payment Intent ID is missing.",
        400
      );
    }

    const paymentIntent =
      await stripe.paymentIntents.retrieve(paymentIntentId);

    const metadata = paymentIntent.metadata || {};

    const serviceId =
      cleanText(metadata.serviceId) || "cv-builder";

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

    const finalPlanName =
      cleanText(metadata.planName);

    const finalPlanType =
      cleanText(metadata.planType) || "payment";

    const serviceOrderId =
      cleanText(metadata.serviceOrderId);

    const isCvBuilderPlan =
      serviceId === "cv-builder";

    const isLogoPlan =
      serviceId === "logo-design";

    const isAdsPlan =
      serviceId === "ads";

    const isGuestServicePlan =
      isLogoPlan || isAdsPlan;

    const session =
      await getServerSession(authOptions);

    /*
      Login rules:
      - CV Builder requires login.
      - Logo Design and Ads allow guest checkout.
    */
    if (
      isCvBuilderPlan &&
      !session?.user?.email
    ) {
      return jsonError(
        "Please login first.",
        401
      );
    }

    await connectDB();

    let user = null;

    if (session?.user?.email) {
      user = await User.findOne({
        email: cleanText(
          session.user.email
        ).toLowerCase(),
      });
    }

    if (isCvBuilderPlan && !user) {
      return jsonError(
        "User not found.",
        404
      );
    }

    const customerDetails =
      buildCustomerDetails({
        customerForm,
        metadata,
        paymentIntent,
        sessionEmail:
          session?.user?.email || "",
      });

    if (!customerDetails.email) {
      return jsonError(
        "Customer email is required.",
        400
      );
    }

    const billingDetails = {
      firstName:
        customerDetails.firstName,

      lastName:
        customerDetails.lastName,

      email:
        customerDetails.email,

      mobileCountryCode:
        customerDetails.mobileCountryCode,

      mobileCountryFlag:
        customerDetails.mobileCountryFlag,

      mobileNumber:
        customerDetails.mobileNumber,

      phone:
        customerDetails.phone,

      country:
        customerDetails.country,

      countryName:
        customerDetails.countryName,

      countryFlag:
        customerDetails.countryFlag,

      postalCode:
        customerDetails.postalCode,

      addressLine1:
        customerDetails.addressLine1,

      addressLine2:
        customerDetails.addressLine2,

      city:
        customerDetails.city,
    };

    const stripeCustomerId =
      typeof paymentIntent.customer === "string"
        ? paymentIntent.customer
        : paymentIntent.customer?.id ||
          user?.stripeCustomerId ||
          "";

    /*
      Payment must be completed before access or order
      confirmation can be granted.
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
          paymentStatus:
            paymentIntent.status || "pending",

          stripePaymentIntentId:
            paymentIntent.id,

          stripeCustomerId,
        };

        if (
          paymentIntent.status === "canceled"
        ) {
          updatePayload.orderStatus =
            "cancelled";
        }

        await ServiceOrder.findByIdAndUpdate(
          serviceOrderId,
          {
            $set: updatePayload,
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          hasAccess: false,
          error:
            "Payment is not completed yet.",

          stripeStatus:
            paymentIntent.status,

          serviceId,
          serviceName,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    /*
      Stripe amounts use the smallest currency unit:
      2399 = £23.99
      15000 = £150.00
    */
    const totalAmount = Number(
      paymentIntent.amount || 0
    );

    const taxAmount = Number(
      metadata.taxAmount || 0
    );

    const baseAmount = Number(
      metadata.baseAmount ||
        totalAmount - taxAmount ||
        totalAmount
    );

    /* =====================================================
       CV BUILDER ONE-TIME PAYMENT
    ===================================================== */

    if (isCvBuilderPlan) {
      const paidAt = paymentIntent.created
        ? new Date(
            paymentIntent.created * 1000
          )
        : now;

      const accessExpiresAt =
        addDays(paidAt, 3);

      /*
        A later one-time purchase replaces an existing
        subscription and gives three days of access.
      */
      if (user?.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(
            user.stripeSubscriptionId
          );
        } catch (error) {
          console.log(
            "Old subscription cancellation skipped:",
            error?.message
          );
        }
      }

      const updatedUser =
        await User.findByIdAndUpdate(
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
                downloadLimit: 1,
  downloadUsed: 0,

              /*
                These values are retained for compatibility
                with existing access checks.
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

            /*
              Remove the old offer/countdown field
              from existing MongoDB records.
            */
            $unset: {
              cvBuilderOfferStartedAt: "",
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedUser) {
        return jsonError(
          "Unable to activate CV Builder access.",
          500
        );
      }

      await updateUserServiceOrderStatus(
        user._id,
        paymentIntent.id,
        "paid"
      );

      if (serviceOrderId) {
        await ServiceOrder.findByIdAndUpdate(
          serviceOrderId,
          {
            $set: {
              paymentStatus: "paid",

              stripePaymentIntentId:
                paymentIntent.id,

              stripeCustomerId,

              baseAmount,
              taxAmount,
              totalAmount,

              currency:
                paymentIntent.currency ||
                "gbp",

              orderStatus: "new",
              updatedAt: now,
            },
          }
        );
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

        message:
          "CV Builder access activated.",

        paymentStatus: "paid",
        stripeStatus:
          paymentIntent.status,

        plan: updatedUser.plan,

        subscriptionStatus:
          updatedUser.subscriptionStatus,

        subscriptionStartDate:
          updatedUser.subscriptionStartDate,

        subscriptionEndDate:
          updatedUser.subscriptionEndDate,

        accessExpiresAt:
          updatedUser.accessExpiresAt,

        hasActiveSubscription:
          updatedUser.hasActiveSubscription,

        billingDetails:
          updatedUser.billingDetails ||
          billingDetails,
      });
    }

    /* =====================================================
       LOGO DESIGN / ADS PAYMENT
    ===================================================== */

    if (isGuestServicePlan) {
      const orderUpdate = {
        serviceId,
        serviceName,

        planId: finalPlanId,
        planName: finalPlanName,
        planType: finalPlanType,

        customer: {
          firstName:
            customerDetails.firstName,

          lastName:
            customerDetails.lastName,

          fullName:
            customerDetails.fullName,

          email:
            customerDetails.email,

          mobileCountryCode:
            customerDetails.mobileCountryCode,

          mobileCountryFlag:
            customerDetails.mobileCountryFlag,

          mobileNumber:
            customerDetails.mobileNumber,

          phone:
            customerDetails.phone,

          country:
            customerDetails.country,

          countryName:
            customerDetails.countryName,

          countryFlag:
            customerDetails.countryFlag,

          postalCode:
            customerDetails.postalCode,

          addressLine1:
            customerDetails.addressLine1,

          addressLine2:
            customerDetails.addressLine2,

          city:
            customerDetails.city,
        },

        stripeCustomerId,

        stripePaymentIntentId:
          paymentIntent.id,

        paymentStatus: "paid",

        baseAmount,
        taxAmount,
        totalAmount,

        currency:
          paymentIntent.currency || "gbp",

        orderStatus: "new",
        source: "checkout",

        metadata: {
          planId: finalPlanId,
          planName: finalPlanName,
          planType: finalPlanType,
          serviceId,
          serviceName,

          stripeStatus:
            paymentIntent.status,

          guestCheckout: !user,

          paidAt: now.toISOString(),

          paymentIntentMetadata:
            metadata,
        },
      };

      if (serviceOrderId) {
        await ServiceOrder.findByIdAndUpdate(
          serviceOrderId,
          {
            $set: orderUpdate,
          }
        );
      } else {
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
            setDefaultsOnInsert: true,
          }
        );
      }

      return NextResponse.json({
        success: true,
        hasAccess: true,
        hasOneTimeAccess: false,
        orderConfirmed: true,

        guestCheckout: !user,

        accessType: serviceId,
        serviceId,
        serviceName,

        message:
          serviceId === "logo-design"
            ? "Logo Design order confirmed."
            : "Ads Service order confirmed.",

        paymentStatus: "paid",

        stripeStatus:
          paymentIntent.status,

        plan: finalPlanId,

        logoDesignStatus:
          serviceId === "logo-design"
            ? "paid"
            : "",

        adsServiceStatus:
          serviceId === "ads"
            ? "paid"
            : "",

        billingDetails,
      });
    }

    return jsonError(
      "Unsupported service type.",
      400,
      {
        serviceId,
      }
    );
  } catch (error) {
    const errorMessage =
      error?.raw?.message ||
      error?.message ||
      "Unable to verify one-time payment.";

    const statusCode =
      Number.isInteger(error?.statusCode) &&
      error.statusCode >= 400 &&
      error.statusCode < 600
        ? error.statusCode
        : 500;

    console.error(
      "Verify one-time payment error:",
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

        statusCode,
        stack: error?.stack,
      }
    );

    return NextResponse.json(
      {
        success: false,
        hasAccess: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}