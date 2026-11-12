import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/authOptions";

export async function POST(req) {
  try {
    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const password =
      typeof body?.password === "string" ? body.password : "";
    const confirmPassword =
      typeof body?.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
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

    await connectDB();

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

    const user = await User.create({
      name,
      email,
      password: hashedPassword,

      subscriptionStatus: "inactive",
      plan: "",
      stripeCustomerId: "",
      stripeSubscriptionId: "",

      // Set on the server for every new account.
      downloadLimit: 0,
      downloadUsed: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          subscriptionStatus: user.subscriptionStatus,
          downloadLimit: user.downloadLimit,
          downloadUsed: user.downloadUsed,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "Account already exists with this email.",
        },
        { status: 409 }
      );
    }

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
      "name email subscriptionStatus plan subscription downloadLimit downloadUsed"
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          active: false,
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    const active =
      user.subscriptionStatus === "active" ||
      user.subscription?.status === "active";

    return NextResponse.json({
      success: true,
      active,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan || user.subscription?.plan || "",
        subscriptionStatus:
          user.subscriptionStatus ||
          user.subscription?.status ||
          "inactive",
        downloadLimit: user.downloadLimit ?? 0,
        downloadUsed: user.downloadUsed ?? 0,
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