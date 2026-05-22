import mongoose from "mongoose";

const ExperienceSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const EducationSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      default: "",
    },
    institution: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "",
    },
    technologies: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const CertificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    issuer: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const CVSchema = new mongoose.Schema(
  {
    template: {
      type: String,
      default: "ats-professional",
    },

    fullName: {
      type: String,
      default: "",
      trim: true,
    },

    jobTitle: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    linkedIn: {
      type: String,
      default: "",
      trim: true,
    },

    github: {
      type: String,
      default: "",
      trim: true,
    },

    portfolio: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    photo: {
      type: String,
      default: "",
    },

    summary: {
      type: String,
      default: "",
    },

    experience: {
      type: String,
      default: "",
    },

    projects: {
      type: String,
      default: "",
    },

    education: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    languages: {
      type: [String],
      default: [],
    },

    certifications: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
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