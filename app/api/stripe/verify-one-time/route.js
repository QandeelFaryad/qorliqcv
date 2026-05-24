import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Please login first." },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { paymentIntentId, planId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: "Payment Intent ID is missing." },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment is not completed yet.",
          stripeStatus: paymentIntent.status,
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: session.user.email.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          plan: planId || "one-time",
          subscriptionStatus: "active",
          hasActiveSubscription: true,
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate,
          lastPaymentStatus: "paid",
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      paymentStatus: paymentIntent.status,
      plan: updatedUser.plan,
      subscriptionStatus: updatedUser.subscriptionStatus,
      subscriptionStartDate: updatedUser.subscriptionStartDate,
      subscriptionEndDate: updatedUser.subscriptionEndDate,
      hasActiveSubscription: updatedUser.hasActiveSubscription,
    });
  } catch (error) {
    console.error("Verify one-time payment error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}