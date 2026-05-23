import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  session: {
    strategy: "jwt",
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
  try {
    await connectDB();

    if (account?.provider === "google") {
      const email = user.email?.toLowerCase()?.trim();

      if (!email) return false;

      const dbUser = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            name: user.name || "",
            image: user.image || "",
            provider: "google",
            plan: "free",
            subscriptionStatus: "inactive",
            stripeCustomerId: "",
            stripeSubscriptionId: "",
            subscriptionStartDate: null,
            subscriptionEndDate: null,
          },
          $setOnInsert: {
            email,
            password: "",
            role: "user",
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

      user.id = dbUser._id.toString();
      user.name = dbUser.name;
      user.email = dbUser.email;
      user.image = dbUser.image || "";
      user.plan = dbUser.plan || "free";
      user.subscriptionStatus = dbUser.subscriptionStatus || "inactive";
      user.provider = dbUser.provider || "google";
    }

    return true;
  } catch (error) {
    console.log("Google signIn DB save error:", error);
    return false;
  }
},

    async jwt({ token, user }) {
      if (user?.email) {
        await connectDB();

        const dbUser = await User.findOne({
          email: user.email.toLowerCase().trim(),
        });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.image = dbUser.image || "";
          token.plan = dbUser.plan || "free";
          token.subscriptionStatus = dbUser.subscriptionStatus || "inactive";
          token.provider = dbUser.provider || "credentials";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image || "";
        session.user.plan = token.plan || "free";
        session.user.subscriptionStatus =
          token.subscriptionStatus || "inactive";
        session.user.provider = token.provider || "credentials";
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};