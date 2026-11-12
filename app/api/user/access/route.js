import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";


import bcrypt from "bcryptjs";





export const runtime = "nodejs";

function respond(message, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
};

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: responseHeaders,
  });
}

function normalizeDate(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return json(
        {
          success: false,
          loggedIn: false,
          hasAccess: false,
          message: "Please log in first.",
        },
        401
      );
    }

    await connectDB();

    // Explicitly select dashboard fields.
    // Passwords and authentication tokens are not selected.
    const user = await User.findOne({
      email: session.user.email.trim().toLowerCase(),
    })
      .select(
        [
          "_id",
          "name",
          "email",
          "image",
          "phone",
          "role",
          "provider",
          "plan",
          "planName",
          "planType",
          "accessType",
          "subscriptionStatus",
          "hasActiveSubscription",
          "subscriptionStartDate",
          "subscriptionEndDate",
          "accessExpiresAt",
          "oneTimeAccessStatus",
          "paymentStatus",
          "lastPaymentStatus",
          "stripeCustomerId",
          "stripeSubscriptionId",
          "stripePaymentIntentId",
          "billingDetails",
          "downloadLimit",
          "downloadUsed",
          "createdAt",
          "updatedAt",
        ].join(" ")
      )
      .lean();

    if (!user) {
      return json(
        {
          success: false,
          loggedIn: true,
          hasAccess: false,
          message: "User account not found.",
        },
        404
      );
    }

    const plan = String(user.plan || "free");
    const subscriptionStatus = String(
      user.subscriptionStatus || "inactive"
    ).toLowerCase();

    const oneTimeAccessStatus = String(
      user.oneTimeAccessStatus || ""
    ).toLowerCase();

    const accessExpiresAt = normalizeDate(user.accessExpiresAt);
    const subscriptionEndDate = normalizeDate(
      user.subscriptionEndDate
    );

    const isOneTime = plan.toLowerCase() === "one-time";

    const expiresAt = isOneTime
      ? accessExpiresAt
      : subscriptionEndDate || accessExpiresAt;

    const hasFutureExpiry =
      Boolean(expiresAt) &&
      new Date(expiresAt).getTime() > Date.now();

    const isExpired =
      Boolean(expiresAt) &&
      new Date(expiresAt).getTime() <= Date.now();

    const activeStatuses = ["active", "trialing", "paid"];

    const blockedOneTimeStatuses = [
      "expired",
      "revoked",
      "refunded",
      "failed",
      "canceled",
      "cancelled",
    ];

    const hasAccess = isOneTime
      ? hasFutureExpiry &&
        !blockedOneTimeStatuses.includes(oneTimeAccessStatus)
      : activeStatuses.includes(subscriptionStatus) && !isExpired;

    const userData = {
      id: user._id.toString(),
      name: user.name || "",
      email: user.email || "",
      image: user.image || "",
      phone: user.phone || "",
      role: user.role || "user",
      provider: user.provider || "",

      plan,
      planName: user.planName || "",
      planType: user.planType || "",
      accessType: user.accessType || "",

      subscriptionStatus,
      hasActiveSubscription: !isOneTime && hasAccess,
      oneTimeAccessStatus,

      subscriptionStartDate: normalizeDate(
        user.subscriptionStartDate
      ),
      subscriptionEndDate,
      accessExpiresAt,
      expiresAt,
      isExpired,

      paymentStatus: user.paymentStatus || "",
      lastPaymentStatus: user.lastPaymentStatus || "",

      stripeCustomerId: user.stripeCustomerId || "",
      stripeSubscriptionId: user.stripeSubscriptionId || "",
      stripePaymentIntentId: user.stripePaymentIntentId || "",

      billingDetails: user.billingDetails || null,
     

downloadLimit: user.downloadLimit ?? 0,
downloadUsed: user.downloadUsed ?? 0,


      createdAt: normalizeDate(user.createdAt),
      updatedAt: normalizeDate(user.updatedAt),
    };

    return json({
      success: true,
      loggedIn: true,
      hasAccess,

      // Existing dashboard/sidebar code reads these top-level fields.
      ...userData,

      // Profile components can read data.user.
      user: userData,
    });
  } catch (error) {
    console.error("Access check error:", error);

    return json(
      {
        success: false,
        hasAccess: false,
        message: "Unable to load your account details.",
      },
      500
    );
  }
}


export async function PUT(request) {
  try {
    // Protect this cookie-authenticated mutation against cross-origin requests.
    const allowedOrigin = new URL(
      process.env.NEXTAUTH_URL || request.url
    ).origin;

    if (request.headers.get("origin") !== allowedOrigin) {
      return respond("Request origin is not allowed.", 403);
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || !/^[a-fA-F0-9]{24}$/.test(userId)) {
      return respond("Please login first.", 401);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return respond("Invalid JSON body.");
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return respond("Invalid request body.");
    }

    const {
      email = "",
      password = "",
      confirmPassword = "",
      currentPassword = "",
    } = body;

    if (
      [email, password, confirmPassword, currentPassword].some(
        (value) => typeof value !== "string"
      )
    ) {
      return respond("All fields must be text.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail && !password) {
      return respond("Enter an email or new password to update.");
    }

    if (
      normalizedEmail &&
      (normalizedEmail.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))
    ) {
      return respond("Enter a valid email address.");
    }

    if (password !== confirmPassword) {
      return respond("Passwords do not match.");
    }

    if (
      password &&
      (password.length < 6 || Buffer.byteLength(password, "utf8") > 72)
    ) {
      return respond(
        "Password must have at least 6 characters and at most 72 bytes."
      );
    }

    if (
      !currentPassword ||
      Buffer.byteLength(currentPassword, "utf8") > 72
    ) {
      return respond("Enter your valid current password.");
    }

    await connectDB();

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return respond("Account not found.", 404);
    }

    if (!user.password) {
      return respond(
        "This account has no password. Use a verified password setup flow first.",
        403
      );
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return respond("Current password is incorrect.", 403);
    }

    const changes = {};

    if (normalizedEmail && normalizedEmail !== user.email) {
      const emailExists = await User.exists({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (emailExists) {
        return respond("This email address is already in use.", 409);
      }

      changes.email = normalizedEmail;

      // Clear previous verification if your schema uses this field.
      if (User.schema.path("emailVerified")) {
        changes.emailVerified = null;
      }
    }

    if (password) {
      changes.password = await bcrypt.hash(password, 12);
    }

    if (!Object.keys(changes).length) {
      return respond("No changes to save.");
    }

    // Only explicitly allowed fields can be updated.
    // Matching the old hash also protects against concurrent password changes.
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, password: user.password },
      { $set: changes },
      { new: true, runValidators: true }
    ).select("_id email");

    if (!updatedUser) {
      return respond(
        "Account changed during this request. Please try again.",
        409
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account updated successfully. Please sign in again.",
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return respond("This email address is already in use.", 409);
    }

    if (error?.name === "ValidationError") {
      return respond("Account details do not meet validation requirements.");
    }

    return respond("Unable to update account. Please try again.", 500);
  }
}
