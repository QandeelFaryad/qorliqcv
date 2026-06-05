import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          loggedIn: false,
          hasAccess: false,
        },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: session.user.email.toLowerCase(),
    }).lean();

    if (!user) {
      return NextResponse.json({
        success: true,
        loggedIn: true,
        hasAccess: false,
      });
    }

    const activeStatuses = ["active", "trialing", "paid"];

    const hasAccess =
      activeStatuses.includes(user.subscriptionStatus) ||
      user.plan === "one-time";

    return NextResponse.json({
      success: true,
      loggedIn: true,
      hasAccess,
      plan: user.plan || "",
      subscriptionStatus: user.subscriptionStatus || "inactive",
      billingDetails: user.billingDetails || null,
    });
  } catch (error) {
    console.error("Access check error:", error);

    return NextResponse.json(
      {
        success: false,
        loggedIn: false,
        hasAccess: false,
        error: "Unable to check access.",
      },
      { status: 500 }
    );
  }
}