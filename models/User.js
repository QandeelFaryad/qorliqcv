import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    provider: {
      type: String,
      default: "credentials",
    },

    role: {
      type: String,
      default: "user",
    },

    plan: {
      type: String,
      default: "free",
    },

    subscriptionStatus: {
      type: String,
      default: "inactive",
    },

    stripeCustomerId: {
      type: String,
      default: "",
    },

    stripeSubscriptionId: {
      type: String,
      default: "",
    },

    subscriptionStartDate: {
      type: Date,
      default: null,
    },

    subscriptionEndDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);