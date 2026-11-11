import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        await connectDB();

        const email = credentials?.email?.toLowerCase()?.trim();
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("Email and password are required.");
        }

        const user = await User.findOne({ email });

        if (!user || !user.password) {
          throw new Error("Invalid email or password.");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          throw new Error("Invalid email or password.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image || "",
          provider: user.provider || "credentials",
          plan: user.plan || "free",
          subscriptionStatus: user.subscriptionStatus || "inactive",
        };
      },
    }),
  ],

callbacks: {
  async signIn({ user, account }) {
    await connectDB();

    if (account?.provider === "google") {
      const email = String(user.email || "").trim().toLowerCase();

      if (!email) return false;

      await User.findOneAndUpdate(
        { email },
        {
          $set: {
            name: user.name || "",
            image: user.image || "",
            provider: "google",
            updatedAt: new Date(),
          },

          // Important: ye sirf NEW user ke liye set hoga.
          // Existing paid user ke plan/payment fields overwrite nahi honge.
          $setOnInsert: {
            email,
            role: "user",
            plan: "free",
            subscriptionStatus: "inactive",
            hasActiveSubscription: false,
            accessType: "",
            paymentStatus: "",
            lastPaymentStatus: "",
            stripeCustomerId: "",
            stripeSubscriptionId: "",
            stripePaymentIntentId: "",
            oneTimeAccessStatus: "",
            createdAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      return true;
    }

    return true;
  },

  async jwt({ token, user }) {
    await connectDB();

    const email = String(user?.email || token?.email || "")
      .trim()
      .toLowerCase();

    if (!email) return token;

    const dbUser = await User.findOne({ email }).lean();

    if (!dbUser) return token;

    token.id = dbUser._id.toString();
    token.name = dbUser.name || token.name || "";
    token.email = dbUser.email || email;
    token.image = dbUser.image || token.picture || "";
    token.role = dbUser.role || "user";

    token.plan = dbUser.plan || "free";
    token.accessType = dbUser.accessType || "";
    token.subscriptionStatus = dbUser.subscriptionStatus || "inactive";
    token.hasActiveSubscription = dbUser.hasActiveSubscription === true;

    token.stripeCustomerId = dbUser.stripeCustomerId || "";
    token.stripeSubscriptionId = dbUser.stripeSubscriptionId || "";
    token.stripePaymentIntentId = dbUser.stripePaymentIntentId || "";

    token.accessExpiresAt = dbUser.accessExpiresAt || null;
    token.subscriptionEndDate = dbUser.subscriptionEndDate || null;

    token.paymentStatus = dbUser.paymentStatus || "";
    token.lastPaymentStatus = dbUser.lastPaymentStatus || "";
    token.oneTimeAccessStatus = dbUser.oneTimeAccessStatus || "";

    return token;
  },

  async session({ session, token }) {
    if (!session.user) session.user = {};

    session.user.id = token.id || "";
    session.user.name = token.name || "";
    session.user.email = token.email || "";
    session.user.image = token.image || "";

    session.user.role = token.role || "user";
    session.user.plan = token.plan || "free";
    session.user.accessType = token.accessType || "";
    session.user.subscriptionStatus = token.subscriptionStatus || "inactive";
    session.user.hasActiveSubscription = token.hasActiveSubscription === true;

    session.user.stripeCustomerId = token.stripeCustomerId || "";
    session.user.stripeSubscriptionId = token.stripeSubscriptionId || "";
    session.user.stripePaymentIntentId = token.stripePaymentIntentId || "";

    session.user.accessExpiresAt = token.accessExpiresAt || null;
    session.user.subscriptionEndDate = token.subscriptionEndDate || null;

    session.user.paymentStatus = token.paymentStatus || "";
    session.user.lastPaymentStatus = token.lastPaymentStatus || "";
    session.user.oneTimeAccessStatus = token.oneTimeAccessStatus || "";

    return session;
  },
},

  secret: process.env.NEXTAUTH_SECRET,
};