import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/authOptions";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const confirmPassword = body.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required.",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Password and confirm password do not match.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Account already exists with this email.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,

      // default subscription values
      subscriptionStatus: "inactive",
      plan: "",
      stripeCustomerId: "",
      stripeSubscriptionId: "",
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
    });
  } catch (error) {
    console.error("Register error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create account.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          active: false,
          error: "Not logged in.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: session.user.email.toLowerCase().trim(),
    }).select(
      "name email subscriptionStatus plan stripeCustomerId stripeSubscriptionId subscription"
    );

    if (!user) {
      return NextResponse.json({
        success: false,
        active: false,
        error: "User not found.",
      });
    }

    const active =
      user.subscriptionStatus === "active" ||
      user.subscription?.status === "active";

    return NextResponse.json({
      success: true,
      active,
      user: {
        name: user.name,
        email: user.email,
        plan: user.plan || user.subscription?.plan || "",
        subscriptionStatus:
          user.subscriptionStatus || user.subscription?.status || "inactive",
      },
    });
  } catch (error) {
    console.error("Subscription check error:", error);

    return NextResponse.json(
      {
        success: false,
        active: false,
        error: "Unable to check subscription.",
      },
      { status: 500 }
    );
  }
}