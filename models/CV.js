import mongoose from "mongoose";

const cleanText = (value) => {
  if (typeof value !== "string") return value;

  return value
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n[ ]+/g, "\n")
    .replace(/[ ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const cleanArray = (value) => {
  if (!Array.isArray(value)) return [];

  return value.map((item) => cleanText(item)).filter(Boolean);
};

const ExperienceSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, default: "", set: cleanText },
    company: { type: String, default: "", set: cleanText },
    location: { type: String, default: "", set: cleanText },
    startDate: { type: String, default: "", set: cleanText },
    endDate: { type: String, default: "", set: cleanText },
    current: { type: Boolean, default: false },
    description: { type: String, default: "", set: cleanText },
  },
  { _id: false }
);

const EducationSchema = new mongoose.Schema(
  {
    degree: { type: String, default: "", set: cleanText },
    institution: { type: String, default: "", set: cleanText },
    location: { type: String, default: "", set: cleanText },
    startDate: { type: String, default: "", set: cleanText },
    endDate: { type: String, default: "", set: cleanText },
    description: { type: String, default: "", set: cleanText },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, default: "", set: cleanText },
    role: { type: String, default: "", set: cleanText },
    technologies: { type: String, default: "", set: cleanText },
    date: { type: String, default: "", set: cleanText },
    description: { type: String, default: "", set: cleanText },
  },
  { _id: false }
);

const CertificationSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", set: cleanText },
    issuer: { type: String, default: "", set: cleanText },
    date: { type: String, default: "", set: cleanText },
  },
  { _id: false }
);

const AdditionalSectionSchema = new mongoose.Schema(
  {
    title: { type: String, default: "", set: cleanText },
    description: { type: String, default: "", set: cleanText },
  },
  { _id: false }
);

const CVSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    template: {
      type: String,
      default: "clean-ats",
      set: cleanText,
      index: true,
    },

    selectedColor: {
      type: String,
      default: "",
      set: cleanText,
    },

    fullName: {
      type: String,
      default: "",
      set: cleanText,
    },

    jobTitle: {
      type: String,
      default: "",
      set: cleanText,
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      set: cleanText,
    },

    phone: {
      type: String,
      default: "",
      set: cleanText,
    },

    location: {
      type: String,
      default: "",
      set: cleanText,
    },

    linkedIn: {
      type: String,
      default: "",
      set: cleanText,
    },

    github: {
      type: String,
      default: "",
      set: cleanText,
    },

    portfolio: {
      type: String,
      default: "",
      set: cleanText,
    },

    website: {
      type: String,
      default: "",
      set: cleanText,
    },

    photo: {
      type: String,
      default: "",
    },

    photoZoom: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
    },

    photoPositionX: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    photoPositionY: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    summary: {
      type: String,
      default: "",
      set: cleanText,
    },

    experience: {
      type: String,
      default: "",
      set: cleanText,
    },

    education: {
      type: String,
      default: "",
      set: cleanText,
    },

    projects: {
      type: String,
      default: "",
      set: cleanText,
    },

    certifications: {
      type: [String],
      default: [],
      set: cleanArray,
    },

    skills: {
      type: [String],
      default: [],
      set: cleanArray,
    },

    skillLevels: {
      type: [String],
      default: [],
      set: cleanArray,
    },

    languages: {
      type: [String],
      default: [],
      set: cleanArray,
    },

    languageLevels: {
      type: [String],
      default: [],
      set: cleanArray,
    },

    strengths: {
      type: [String],
      default: [],
      set: cleanArray,
    },

    achievements: {
      type: [String],
      default: [],
      set: cleanArray,
    },

    hobbies: {
      type: [String],
      default: [],
      set: cleanArray,
    },

    references: {
      type: String,
      default: "",
      set: cleanText,
    },

    experiences: {
      type: [ExperienceSchema],
      default: [],
    },

    educations: {
      type: [EducationSchema],
      default: [],
    },

    projectsList: {
      type: [ProjectSchema],
      default: [],
    },

    certificationsList: {
      type: [CertificationSchema],
      default: [],
    },

    additionalSections: {
      type: [AdditionalSectionSchema],
      default: [],
    },

    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ["draft", "completed", "archived"],
      default: "draft",
      index: true,
    },

     isdownload: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },

    downloadCount: {
      type: Number,
      default: 0,
    },

    editCount: {
      type: Number,
      default: 0,
    },

    lastDownloadedAt: {
      type: Date,
      default: null,
    },

    lastEditedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

CVSchema.index({ user: 1, createdAt: -1 });
CVSchema.index({ user: 1, status: 1 });
CVSchema.index({ template: 1, createdAt: -1 });

// Sirf undownloaded CVs expiry ke baad delete hongi.
CVSchema.index(
  { expiresAt: 1 },
  {
    name: "delete_undownloaded_cvs_after_24h",
    expireAfterSeconds: 0,
    partialFilterExpression: {
      isdownload: false,
    },
  }
);

export default mongoose.models.CV ||
  mongoose.model("CV", CVSchema);

