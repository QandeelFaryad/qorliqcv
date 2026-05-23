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
    jobTitle: {
      type: String,
      default: "",
      set: cleanText,
    },
    company: {
      type: String,
      default: "",
      set: cleanText,
    },
    location: {
      type: String,
      default: "",
      set: cleanText,
    },
    startDate: {
      type: String,
      default: "",
      set: cleanText,
    },
    endDate: {
      type: String,
      default: "",
      set: cleanText,
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
      set: cleanText,
    },
  },
  { _id: false }
);

const EducationSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      default: "",
      set: cleanText,
    },
    institution: {
      type: String,
      default: "",
      set: cleanText,
    },
    location: {
      type: String,
      default: "",
      set: cleanText,
    },
    startDate: {
      type: String,
      default: "",
      set: cleanText,
    },
    endDate: {
      type: String,
      default: "",
      set: cleanText,
    },
    description: {
      type: String,
      default: "",
      set: cleanText,
    },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      set: cleanText,
    },
    role: {
      type: String,
      default: "",
      set: cleanText,
    },
    technologies: {
      type: String,
      default: "",
      set: cleanText,
    },
    date: {
      type: String,
      default: "",
      set: cleanText,
    },
    description: {
      type: String,
      default: "",
      set: cleanText,
    },
  },
  { _id: false }
);

const CertificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      set: cleanText,
    },
    issuer: {
      type: String,
      default: "",
      set: cleanText,
    },
    date: {
      type: String,
      default: "",
      set: cleanText,
    },
  },
  { _id: false }
);

const CVSchema = new mongoose.Schema(
  {
    template: {
      type: String,
      default: "ats-professional",
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

    projects: {
      type: String,
      default: "",
      set: cleanText,
    },

    education: {
      type: String,
      default: "",
      set: cleanText,
    },

    skills: {
      type: [String],
      default: [],
      set: cleanArray,
    },

    languages: {
      type: [String],
      default: [],
      set: cleanArray,
    },

    certifications: {
      type: [String],
      default: [],
      set: cleanArray,
    },

    strengths: {
      type: [String],
      default: [],
      set: cleanArray,
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CV || mongoose.model("CV", CVSchema);