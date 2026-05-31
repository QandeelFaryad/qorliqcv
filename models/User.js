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

    planType: {
      type: String,
      default: "",
    },

    accessType: {
      type: String,
      default: "",
    },

    subscriptionStatus: {
      type: String,
      default: "inactive",
    },

    hasActiveSubscription: {
      type: Boolean,
      default: false,
    },

    stripeCustomerId: {
      type: String,
      default: "",
    },

    stripeSubscriptionId: {
      type: String,
      default: "",
    },

    stripePaymentIntentId: {
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

    accessExpiresAt: {
      type: Date,
      default: null,
    },

    paymentStatus: {
      type: String,
      default: "",
    },

    lastPaymentStatus: {
      type: String,
      default: "",
    },

    oneTimeAccessStatus: {
      type: String,
      default: "",
    },

    

    billingFirstName: {
      type: String,
      default: "",
      trim: true,
    },

    billingLastName: {
      type: String,
      default: "",
      trim: true,
    },

    billingEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    billingAddress: {
      type: String,
      default: "",
      trim: true,
    },

    billingDetails: {
      firstName: {
        type: String,
        default: "",
        trim: true,
      },
      lastName: {
        type: String,
        default: "",
        trim: true,
      },
      email: {
        type: String,
        default: "",
        lowercase: true,
        trim: true,
      },
      address: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  { timestamps: true }
);

delete mongoose.models.User;

export default mongoose.model("User", userSchema);