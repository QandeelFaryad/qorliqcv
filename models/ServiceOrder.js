import mongoose from "mongoose";

const ServiceOrderSchema = new mongoose.Schema(
  {
    serviceId: {
      type: String,
      required: true,
      enum: ["logo-design", "ads"],
      index: true,
    },

    serviceName: {
      type: String,
      required: true,
    },

    planId: {
      type: String,
      required: true,
      index: true,
    },

    planName: {
      type: String,
      default: "",
    },

    planType: {
      type: String,
      default: "payment",
    },

    customer: {
      firstName: { type: String, default: "" },
      lastName: { type: String, default: "" },
      fullName: { type: String, default: "" },
      email: { type: String, required: true, lowercase: true, trim: true, index: true },

      mobileCountryCode: { type: String, default: "" },
      mobileCountryFlag: { type: String, default: "" },
      mobileNumber: { type: String, default: "" },
      phone: { type: String, default: "" },

      country: { type: String, default: "GB" },
      countryName: { type: String, default: "" },
      countryFlag: { type: String, default: "" },

      postalCode: { type: String, default: "" },
      addressLine1: { type: String, default: "" },
      addressLine2: { type: String, default: "" },
      city: { type: String, default: "" },
    },

    stripeCustomerId: {
      type: String,
      default: "",
      index: true,
    },

    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

  paymentStatus: {
  type: String,
  default: "pending",
  enum: ["pending", "paid", "failed", "cancelled", "refunded"],
  index: true,
},

    baseAmount: {
      type: Number,
      default: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "gbp",
    },

    orderStatus: {
      type: String,
      default: "new",
      enum: ["new", "in-progress", "completed", "cancelled", "refunded"],
      index: true,
    },

    source: {
      type: String,
      default: "checkout",
    },

    notes: {
      type: String,
      default: "",
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ServiceOrder ||
  mongoose.model("ServiceOrder", ServiceOrderSchema);