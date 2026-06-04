import mongoose from "mongoose";

const serviceOrderSchema = new mongoose.Schema(
  {
    serviceId: {
      type: String,
      default: "",
      trim: true,
    },

    serviceName: {
      type: String,
      default: "",
      trim: true,
    },

    planId: {
      type: String,
      default: "",
      trim: true,
    },

    planName: {
      type: String,
      default: "",
      trim: true,
    },

    planType: {
      type: String,
      default: "",
      trim: true,
    },

    stripePaymentIntentId: {
      type: String,
      default: "",
      trim: true,
    },

    stripeSubscriptionId: {
      type: String,
      default: "",
      trim: true,
    },

    paymentStatus: {
      type: String,
      default: "pending",
      trim: true,
    },

    amount: {
      type: Number,
      default: 0,
    },

    baseAmount: {
      type: Number,
      default: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "gbp",
      lowercase: true,
      trim: true,
    },

    priceEnvUsed: {
      type: String,
      default: "",
      trim: true,
    },

    offerActive: {
      type: Boolean,
      default: false,
    },

    offerStartedAt: {
      type: Date,
      default: null,
    },

    offerExpiresAt: {
      type: Date,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

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

    // =========================
    // CV BUILDER ACCESS
    // =========================
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

    cvBuilderOfferStartedAt: {
      type: Date,
      default: null,
    },

    // =========================
    // LOGO DESIGN SERVICE
    // =========================
    logoDesignStatus: {
      type: String,
      default: "",
    },

    logoDesignPlan: {
      type: String,
      default: "",
    },

    logoDesignPaymentIntentId: {
      type: String,
      default: "",
    },

    logoDesignPurchasedAt: {
      type: Date,
      default: null,
    },

    // =========================
    // ADS SERVICE
    // =========================
    adsServiceStatus: {
      type: String,
      default: "",
    },

    adsServicePlan: {
      type: String,
      default: "",
    },

    adsServicePaymentIntentId: {
      type: String,
      default: "",
    },

    adsServicePurchasedAt: {
      type: Date,
      default: null,
    },

    // =========================
    // ALL ORDERS HISTORY
    // =========================
    serviceOrders: {
      type: [serviceOrderSchema],
      default: [],
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

      mobileCountryCode: {
        type: String,
        default: "",
        trim: true,
      },

      mobileCountryFlag: {
        type: String,
        default: "",
        trim: true,
      },

      mobileNumber: {
        type: String,
        default: "",
        trim: true,
      },

      phone: {
        type: String,
        default: "",
        trim: true,
      },

      country: {
        type: String,
        default: "",
        uppercase: true,
        trim: true,
      },

      countryName: {
        type: String,
        default: "",
        trim: true,
      },

      countryFlag: {
        type: String,
        default: "",
        trim: true,
      },

      postalCode: {
        type: String,
        default: "",
        trim: true,
      },

      addressLine1: {
        type: String,
        default: "",
        trim: true,
      },

      addressLine2: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
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