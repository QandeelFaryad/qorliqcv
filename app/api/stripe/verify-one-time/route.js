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
    const { paymentIntentId, planId, customerForm } = body;

  const customerDetails = {
  firstName: cleanText(customerForm?.firstName),
  lastName: cleanText(customerForm?.lastName),
  email: cleanText(customerForm?.email).toLowerCase(),

  mobileCountryCode: cleanText(customerForm?.mobileCountryCode),
  mobileCountryFlag: cleanText(customerForm?.mobileCountryFlag),
  mobileNumber: cleanText(customerForm?.mobileNumber),
  phone: `${cleanText(customerForm?.mobileCountryCode)}${cleanText(
    customerForm?.mobileNumber
  )}`.replace(/\s+/g, ""),

  country: cleanText(customerForm?.country).toUpperCase(),
  countryName: cleanText(customerForm?.countryName),
  countryFlag: cleanText(customerForm?.countryFlag),

  postalCode: cleanText(customerForm?.postalCode),
  addressLine1: cleanText(customerForm?.addressLine1),
  addressLine2: cleanText(customerForm?.addressLine2),
  city: cleanText(customerForm?.city),
};
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

    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (paymentIntent.status !== "succeeded") {
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

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 3);

     const updatedUser = await User.findByIdAndUpdate(
  user._id,
  {
    $set: {
      plan: planId || paymentIntent.metadata?.planId || "one-time",
      planType: "one-time",
      accessType: "one-time",

      paymentStatus: "paid",
      lastPaymentStatus: "paid",
      oneTimeAccessStatus: "active",

      subscriptionStatus: "active",
      hasActiveSubscription: true,

      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      accessExpiresAt: endDate,

      stripePaymentIntentId: paymentIntent.id,

      billingDetails: {
        firstName: customerDetails.firstName,
        lastName: customerDetails.lastName,
        email:
          customerDetails.email ||
          paymentIntent.receipt_email ||
          session.user.email.toLowerCase().trim(),

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


      updatedAt: new Date(),
    },

  
  },
  { new: true }
);

      return NextResponse.json({
        success: true,
        hasAccess: true,
        accessType: "one-time",
        paymentStatus: "paid",
        plan: updatedUser.plan,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionStartDate: updatedUser.subscriptionStartDate,
        subscriptionEndDate: updatedUser.subscriptionEndDate,
        accessExpiresAt: updatedUser.accessExpiresAt,
        hasActiveSubscription: updatedUser.hasActiveSubscription,
        billingDetails: updatedUser.billingDetails || null,
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
        paymentStatus: "paid",
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        accessExpiresAt: user.accessExpiresAt,
        hasActiveSubscription: true,
        billingDetails: user.billingDetails || null,
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