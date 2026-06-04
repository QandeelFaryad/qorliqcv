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

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function updateServiceOrderStatus(userId, paymentIntentId, status) {
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
    console.log("Service order status update skipped:", error.message);
  }
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

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
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

    const body = await req.json().catch(() => ({}));
    const { paymentIntentId, planId, customerForm = {} } = body;

    const user = await User.findOne({
      email: session.user.email.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          hasAccess: false,
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    const customerDetails = {
      firstName: cleanText(customerForm?.firstName),
      lastName: cleanText(customerForm?.lastName),
      email:
        cleanText(customerForm?.email).toLowerCase() ||
        session.user.email.toLowerCase().trim(),

      mobileCountryCode: cleanText(customerForm?.mobileCountryCode),
      mobileCountryFlag: cleanText(customerForm?.mobileCountryFlag),
      mobileNumber: cleanText(customerForm?.mobileNumber),
      phone: makePhone(
        customerForm?.mobileCountryCode,
        customerForm?.mobileNumber
      ),

      country: cleanText(customerForm?.country).toUpperCase() || "GB",
      countryName: cleanText(customerForm?.countryName),
      countryFlag: cleanText(customerForm?.countryFlag),

      postalCode: cleanText(customerForm?.postalCode),
      addressLine1: cleanText(customerForm?.addressLine1),
      addressLine2: cleanText(customerForm?.addressLine2),
      city: cleanText(customerForm?.city),
    };

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

    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (paymentIntent.status !== "succeeded") {
        await updateServiceOrderStatus(
          user._id,
          paymentIntent.id,
          paymentIntent.status || "pending"
        );

        return NextResponse.json(
          {
            success: false,
            hasAccess: false,
            error: "Payment is not completed yet.",
            stripeStatus: paymentIntent.status,
          },
          { status: 400 }
        );
      }

      const metadata = paymentIntent.metadata || {};

      const offerActive = metadata.offerActive === "true";
      const offerStartedAt = metadata.offerStartedAt
        ? new Date(metadata.offerStartedAt)
        : user.cvBuilderOfferStartedAt || null;

      const offerExpiresAt = metadata.offerExpiresAt
        ? new Date(metadata.offerExpiresAt)
        : null;

      const priceEnvUsed = metadata.priceEnvUsed || "";

      const serviceId = metadata.serviceId || "cv-builder";
      const serviceName = metadata.serviceName || "CV Builder";
      const finalPlanId = planId || metadata.planId || metadata.plan || "";

      const stripeCustomerId =
        typeof paymentIntent.customer === "string"
          ? paymentIntent.customer
          : paymentIntent.customer?.id || user.stripeCustomerId || "";

      const now = new Date();

      const updatePayload = {
        stripeCustomerId,
        lastPaymentStatus: "paid",
        billingDetails,
        cvBuilderOfferStartedAt: offerStartedAt,
        updatedAt: now,
      };

      let hasAccess = false;
      let accessType = "service";
      let message = "Payment verified successfully.";

      if (serviceId === "cv-builder") {
        const accessExpiresAt = addDays(now, 3);

        updatePayload.plan = finalPlanId || "one-time";
        updatePayload.planType = "one-time";
        updatePayload.accessType = "one-time";

        updatePayload.paymentStatus = "paid";
        updatePayload.oneTimeAccessStatus = "active";

        updatePayload.subscriptionStatus = "active";
        updatePayload.hasActiveSubscription = true;

        updatePayload.subscriptionStartDate = now;
        updatePayload.subscriptionEndDate = accessExpiresAt;
        updatePayload.accessExpiresAt = accessExpiresAt;

        updatePayload.stripePaymentIntentId = paymentIntent.id;
        updatePayload.stripeSubscriptionId = "";

        hasAccess = true;
        accessType = "one-time";
        message = "CV Builder access activated.";
      }

      if (serviceId === "logo-design") {
        updatePayload.logoDesignStatus = "paid";
        updatePayload.logoDesignPlan = finalPlanId;
        updatePayload.logoDesignPaymentIntentId = paymentIntent.id;
        updatePayload.logoDesignPurchasedAt = now;

        updatePayload.paymentStatus = "paid";
        updatePayload.oneTimeAccessStatus = "active";

        hasAccess = true;
        accessType = "logo-design";
        message = "Logo Design order confirmed.";
      }

      if (serviceId === "ads") {
        updatePayload.adsServiceStatus = "paid";
        updatePayload.adsServicePlan = finalPlanId;
        updatePayload.adsServicePaymentIntentId = paymentIntent.id;
        updatePayload.adsServicePurchasedAt = now;

        updatePayload.paymentStatus = "paid";
        updatePayload.oneTimeAccessStatus = "active";

        hasAccess = true;
        accessType = "ads";
        message = "Ads Service order confirmed.";
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $set: updatePayload,
        },
        { new: true }
      );

      await updateServiceOrderStatus(user._id, paymentIntent.id, "paid");

      return NextResponse.json({
        success: true,
        hasAccess,
        hasOneTimeAccess: accessType === "one-time",
        orderConfirmed: true,
        accessType,
        serviceId,
        serviceName,
        message,
        paymentStatus: "paid",
        plan: finalPlanId,
        subscriptionStatus: updatedUser?.subscriptionStatus || "",
        subscriptionStartDate: updatedUser?.subscriptionStartDate || null,
        subscriptionEndDate: updatedUser?.subscriptionEndDate || null,
        accessExpiresAt: updatedUser?.accessExpiresAt || null,
        hasActiveSubscription: updatedUser?.hasActiveSubscription || false,
        logoDesignStatus: updatedUser?.logoDesignStatus || "",
        adsServiceStatus: updatedUser?.adsServiceStatus || "",
        billingDetails: updatedUser?.billingDetails || null,

        offerActive,
        offerStartedAt,
        offerExpiresAt,
        priceEnvUsed,
        cvBuilderOfferStartedAt:
          updatedUser?.cvBuilderOfferStartedAt || null,
      });
    }

    const now = new Date();
    const endDate = user.accessExpiresAt || user.subscriptionEndDate || null;

    const hasOneTimePlan =
      user.accessType === "one-time" ||
      user.planType === "one-time" ||
      user.plan === "one-time";

    const isPaid =
      user.paymentStatus === "paid" ||
      user.lastPaymentStatus === "paid" ||
      user.oneTimeAccessStatus === "active";

    const notExpired = endDate && new Date(endDate) > now;

    if (hasOneTimePlan && isPaid && notExpired) {
      return NextResponse.json({
        success: true,
        hasAccess: true,
        accessType: "one-time",
        serviceId: "cv-builder",
        paymentStatus: "paid",
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        accessExpiresAt: user.accessExpiresAt,
        hasActiveSubscription: true,
        billingDetails: user.billingDetails || null,
        cvBuilderOfferStartedAt: user.cvBuilderOfferStartedAt || null,
      });
    }

    return NextResponse.json(
      {
        success: false,
        hasAccess: false,
        error: "One-time access is inactive or expired.",
      },
      { status: 403 }
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