import mongoose from "mongoose";

const DownloadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    cvId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CV",
      required: true,
    },

    cvTitle: {
      type: String,
      required: true,
      trim: true,
      // Example: Senior Software Engineer
    },

    template: {
      type: String,
      required: true,
      trim: true,
      // Example: London Executive
    },

    format: {
      type: String,
      enum: ["PDF", "DOCX", "JPEG"],
      uppercase: true,
      trim: true,
      required: true,
    },

    fileSize: {
      type: String,
      trim: true,
      default: "",
      // Example: 684 KB
    },

    downloadedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "expired"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

DownloadSchema.index({ userId: 1, downloadedAt: -1 });

export default mongoose.models.Download ||
  mongoose.model("Download", DownloadSchema);