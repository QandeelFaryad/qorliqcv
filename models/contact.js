import mongoose from "mongoose";

/* =========================================================
   CONTACT MESSAGE SCHEMA
========================================================= */

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 254,
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: 10,
      maxlength: 3000,
    },

    /* =====================================================
       MESSAGE STATUS
    ===================================================== */

    status: {
      type: String,
      enum: ["new", "read", "replied", "closed"],
      default: "new",
      index: true,
    },

    /* =====================================================
       EMAIL NOTIFICATION STATUS
    ===================================================== */

    notificationStatus: {
      type: String,
      enum: ["pending", "sent", "failed", "not_configured"],
      default: "pending",
    },

    notificationSentAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       ADMIN MANAGEMENT
    ===================================================== */

    adminNotes: {
      type: String,
      default: "",
      maxlength: 5000,
    },

    repliedAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       SECURITY / SPAM PROTECTION
    ===================================================== */

    ipHash: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =========================================================
   INDEXES
========================================================= */

ContactSchema.index({
  createdAt: -1,
});

ContactSchema.index({
  ipHash: 1,
  createdAt: -1,
});

/* =========================================================
   MODEL EXPORT
========================================================= */

const Contact =
  mongoose.models.Contact ||
  mongoose.model("Contact", ContactSchema);

export default Contact;