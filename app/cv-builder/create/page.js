"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const colorSets = {
  blue: ["#2563EB", "#1D4ED8", "#0F172A", "#60A5FA", "#DBEAFE"],
  gold: ["#B88A2C", "#A16207", "#111827", "#FACC15", "#FEF3C7"],
  black: ["#111827", "#020617", "#374151", "#94A3B8", "#F1F5F9"],
  purple: ["#7C3AED", "#5B21B6", "#312E81", "#A78BFA", "#EDE9FE"],
  green: ["#059669", "#047857", "#064E3B", "#34D399", "#D1FAE5"],
  teal: ["#0F766E", "#115E59", "#134E4A", "#5EEAD4", "#CCFBF1"],
  red: ["#DC2626", "#B91C1C", "#7F1D1D", "#F87171", "#FEE2E2"],
  cyan: ["#0891B2", "#0E7490", "#164E63", "#67E8F9", "#CFFAFE"],
  rose: ["#DB2777", "#BE123C", "#831843", "#FDA4AF", "#FFE4E6"],
  slate: ["#475569", "#334155", "#0F172A", "#CBD5E1", "#F8FAFC"],
  orange: ["#EA580C", "#C2410C", "#7C2D12", "#FDBA74", "#FFEDD5"],
};

const cvTemplates = [
  { id: "eu-photo-document", name: "EU Photo Document", category: "With photo", layout: "eu-photo-document", photo: true, photoShape: "eu", photoType: "female", colors: colorSets.blue, ats: 96, tag: "EU Photo" },
  { id: "berlin-side-photo", name: "Berlin Side Photo", category: "With photo", layout: "berlin-side-photo", photo: true, photoShape: "square", photoType: "male", colors: colorSets.black, ats: 92, tag: "Photo" },
  { id: "corporate-circle-photo", name: "Corporate Circle Photo", category: "With photo", layout: "corporate-circle-photo", photo: true, photoShape: "circle-ring", photoType: "male-2", colors: colorSets.blue, ats: 95, tag: "Photo" },
  { id: "creative-blob-photo", name: "Creative Blob Photo", category: "With photo", layout: "creative-blob-photo", photo: true, photoShape: "blob", photoType: "female-2", colors: colorSets.purple, ats: 88, tag: "Photo" },
  { id: "luxury-oval-photo", name: "Luxury Oval Photo", category: "With photo", layout: "luxury-oval-photo", photo: true, photoShape: "oval", photoType: "female-3", colors: colorSets.gold, ats: 93, tag: "Photo" },
  { id: "london-executive", name: "London Executive", category: "Professional", layout: "london-executive", photo: false, colors: colorSets.gold, ats: 96, tag: "Executive" },
  { id: "clean-ats", name: "Clean ATS", category: "ATS", layout: "clean-ats", photo: false, colors: colorSets.blue, ats: 99, tag: "ATS" },
  { id: "classic-pro", name: "Classic Pro", category: "Simple", layout: "classic-pro", photo: false, colors: colorSets.slate, ats: 97, tag: "Classic" },
  { id: "tech-minimal", name: "Tech Minimal", category: "Modern", layout: "tech-minimal", photo: false, colors: colorSets.cyan, ats: 95, tag: "Tech" },
  { id: "graduate-fresh", name: "Graduate Fresh", category: "Simple", layout: "graduate-fresh", photo: false, colors: colorSets.green, ats: 96, tag: "Graduate" },
  { id: "formal-uk", name: "Formal UK", category: "ATS", layout: "formal-uk", photo: false, colors: colorSets.black, ats: 98, tag: "UK" },
  { id: "senior-director", name: "Senior Director", category: "Professional", layout: "senior-director", photo: false, colors: colorSets.orange, ats: 94, tag: "Director" },
  { id: "admin-professional", name: "Admin Professional", category: "Simple", layout: "admin-professional", photo: false, colors: colorSets.slate, ats: 97, tag: "Admin" },
  { id: "healthcare-clinical", name: "Healthcare Clinical", category: "ATS", layout: "healthcare-clinical", photo: false, colors: colorSets.teal, ats: 95, tag: "Health" },
  { id: "sales-leader", name: "Sales Leader", category: "Modern", layout: "sales-leader", photo: false, colors: colorSets.red, ats: 92, tag: "Sales" },
  { id: "finance-analyst", name: "Finance Analyst", category: "Professional", layout: "finance-analyst", photo: false, colors: colorSets.cyan, ats: 96, tag: "Finance" },
  { id: "stockholm-clean", name: "Stockholm Clean", category: "International", layout: "stockholm-clean", photo: false, colors: colorSets.blue, ats: 94, tag: "Nordic" },
  { id: "dubai-corporate", name: "Dubai Corporate", category: "International", layout: "dubai-corporate", photo: false, colors: colorSets.teal, ats: 93, tag: "Gulf" },
  { id: "canada-simple", name: "Canada Simple", category: "International", layout: "canada-simple", photo: false, colors: colorSets.red, ats: 98, tag: "Canada" },
  { id: "academic-scholar", name: "Academic Scholar", category: "ATS", layout: "academic-scholar", photo: false, colors: colorSets.purple, ats: 97, tag: "Academic" },
  { id: "legal-advisor", name: "Legal Advisor", category: "Professional", layout: "legal-advisor", photo: false, colors: colorSets.slate, ats: 95, tag: "Legal" },
  { id: "hospitality-premium", name: "Hospitality Premium", category: "Creative", layout: "hospitality-premium", photo: false, colors: colorSets.rose, ats: 89, tag: "Hotel" },
  { id: "engineer-grid", name: "Engineer Grid", category: "Modern", layout: "engineer-grid", photo: false, colors: colorSets.orange, ats: 94, tag: "Engineer" },
  { id: "teacher-friendly", name: "Teacher Friendly", category: "Simple", layout: "teacher-friendly", photo: false, colors: colorSets.green, ats: 95, tag: "Teacher" },
  { id: "project-manager", name: "Project Manager", category: "Professional", layout: "project-manager", photo: false, colors: colorSets.purple, ats: 96, tag: "PM" },
  { id: "customer-service", name: "Customer Service", category: "Simple", layout: "customer-service", photo: false, colors: colorSets.blue, ats: 94, tag: "Service" },
  { id: "marketing-bold", name: "Marketing Bold", category: "Creative", layout: "marketing-bold", photo: false, colors: colorSets.rose, ats: 88, tag: "Marketing" },
  { id: "hr-professional", name: "HR Professional", category: "Professional", layout: "hr-professional", photo: false, colors: colorSets.slate, ats: 97, tag: "HR" },
  { id: "data-analyst", name: "Data Analyst", category: "Modern", layout: "data-analyst", photo: false, colors: colorSets.cyan, ats: 96, tag: "Data" },
  { id: "premium-monogram", name: "Premium Monogram", category: "Professional", layout: "premium-monogram", photo: false, colors: colorSets.gold, ats: 93, tag: "Luxury" },
];


const templateConfig = cvTemplates.reduce((acc, template) => {
  acc[template.id] = {
    layout: template.layout,
    name: template.name,
    accent: template.colors?.[0] || "#2563EB",
    colors: template.colors || colorSets.blue,
    photo: template.photo,
    photoShape: template.photoShape || "circle",
    photoType: template.photoType || "male",
    ats: template.ats || 95,
    tag: template.tag || "CV",
    category: template.category || "Professional",
  };
  return acc;
}, {});

const emptyExperience = {
  jobTitle: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
};

const emptyEducation = {
  degree: "",
  institution: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
};

const emptyProject = {
  title: "",
  role: "",
  technologies: "",
  date: "",
  description: "",
};

const emptyCertification = {
  name: "",
  issuer: "",
  date: "",
};

const emptyAdditionalSection = {
  title: "",
  description: "",
};

const emptyForm = {
  template: "clean-ats",
  selectedColor: "#2563EB",

  fullName: "",
  jobTitle: "",
  email: "",
  phone: "",
  location: "",
  linkedIn: "",
  github: "",
  portfolio: "",
  website: "",

  photo: "",
  photoZoom: 1,
  photoPositionX: 50,
  photoPositionY: 50,

  summary: "",

  experiences: [{ ...emptyExperience }],
  educations: [{ ...emptyEducation }],
  projectsList: [],
  certificationsList: [],

  skills: [],
  skillLevels: [],
  languages: [],
  languageLevels: [],
  strengths: [],
  achievements: [],
  hobbies: [],
  references: "",
  additionalSections: [],

  experience: "",
  education: "",
  projects: "",
  certifications: [],
};

const steps = [
  {
    title: "Personal Details",
    desc: "Add contact details, choose template and upload photo.",
  },
  {
    title: "Professional Summary",
    desc: "Write your summary or choose a suggested professional description.",
  },
  {
    title: "Work Experience",
    desc: "Add jobs, companies, dates and suggested responsibilities.",
  },
  {
    title: "Education",
    desc: "Add qualifications, institutions and education details.",
  },
  {
    title: "Skills & Languages",
    desc: "Add skills with levels and languages with proficiency.",
  },
  {
    title: "Projects & Achievements",
    desc: "Add projects, career highlights and achievements.",
  },
  {
    title: "Certifications & Extra",
    desc: "Add certificates, hobbies, references and additional fields.",
  },
];



const experienceSuggestions = [
  "Improved reporting accuracy by 38% through better workflow controls and clear documentation.",
  "Managed daily operations, internal communication, schedules, records and stakeholder updates.",
  "Supported senior management with reporting, data entry, meeting preparation and process improvement.",
  "Handled customer queries professionally while maintaining accurate records and service standards.",
  "Coordinated team tasks, tracked deadlines and improved overall operational efficiency.",
];

const skillSuggestions = [
  "Microsoft Excel",
  "Customer Service",
  "Team Coordination",
  "Operations Management",
  "Administration",
  "Data Entry",
  "Leadership",
  "Communication",
  "Problem Solving",
  "Reporting",
  "CRM Management",
  "Project Coordination",
];

const languageSuggestions = [
  "English",
  "Arabic",
  "Urdu",
  "Hindi",
  "French",
  "German",
  "Spanish",
];

const levelOptions = ["Basic", "Good", "Very Good", "Excellent", "Expert"];
const proficiencyOptions = [
  "Beginner",
  "Intermediate",
  "Professional",
  "Fluent",
  "Native",
];

export default function CreateCVPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#101116] text-white">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-qorliqGold">
            Loading Builder...
          </p>
        </main>
      }
    >
      <CreateCVContent />
    </Suspense>
  );
}


function stripHtmlText(value) {
  return String(value || "").replace(/<[^>]*>/g, "").trim();
}

function getPageCompletionScores(form) {
  const exp = Array.isArray(form.experiences) ? form.experiences : [];
  const edu = Array.isArray(form.educations) ? form.educations : [];

  const groups = [
    [form.fullName, form.jobTitle, form.email, form.phone, form.location],
    [stripHtmlText(form.summary)],
    exp.length ? exp.flatMap((item) => [item.jobTitle, item.company, item.startDate, item.endDate, stripHtmlText(item.description)]) : [],
    edu.length ? edu.flatMap((item) => [item.degree, item.institution, item.startDate || item.endDate || item.description]) : [],
    [Array.isArray(form.skills) && form.skills.length ? "skills" : "", Array.isArray(form.languages) && form.languages.length ? "languages" : ""],
    [Array.isArray(form.projectsList) && form.projectsList.length ? "projects" : "", Array.isArray(form.achievements) && form.achievements.length ? "achievements" : ""],
    [Array.isArray(form.certificationsList) && form.certificationsList.length ? "certifications" : "", form.references, Array.isArray(form.hobbies) && form.hobbies.length ? "hobbies" : ""],
  ];

  return groups.map((fields) => {
    const total = fields.length || 1;
    const filled = fields.filter((value) => String(value || "").trim()).length;
    return Math.round((filled / total) * 100);
  });
}

function getTotalCompletionScore(scores) {
  if (!Array.isArray(scores) || !scores.length) return 0;
  return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
}


async function generateCvAiContent({ type, cv }) {
  const response = await fetch("/api/ai/cv-generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, cv }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.error || "Failed to generate AI content.");
  }

  return data.html;
}

function CreateCVContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [currentStep, setCurrentStep] = useState(0);
  const [mobileMode, setMobileMode] = useState("edit");

  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [strengthInput, setStrengthInput] = useState("");
  const [achievementInput, setAchievementInput] = useState("");
  const [hobbyInput, setHobbyInput] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [cvId, setCvId] = useState(null);

  const baseConfig = templateConfig[form.template] || templateConfig["clean-ats"];

  const config = {
    ...baseConfig,
    accent: form.selectedColor || baseConfig.accent,
    selectedColor: form.selectedColor || baseConfig.accent,
  };

  const templateSupportsPhoto = Boolean(config.photo);

  const livePreviewCV = useMemo(
    () => ({
      ...form,
      atsScore: calculateATSScore(form),
      experience: formatExperience(form.experiences),
      education: formatEducation(form.educations),
      projects: formatProjects(form.projectsList),
      certifications: formatCertifications(form.certificationsList),
    }),
    [form]
  );

  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);
  const pageScores = useMemo(() => getPageCompletionScores(form), [form]);
  const totalCvScore = useMemo(() => getTotalCompletionScore(pageScores), [pageScores]);
  const currentPageScore = pageScores[currentStep] || 0;

  useEffect(() => {
    const template = searchParams.get("template") || "clean-ats";
    const color = searchParams.get("color");
    const editId = searchParams.get("edit");
    const hasOldCV = searchParams.get("oldcv") === "yes";

    if (editId) {
      setIsEditMode(true);
      setCvId(editId);
      loadCVData(editId);
      return;
    }

    setIsEditMode(false);
    setCvId(null);

    let oldCVData = null;

    if (hasOldCV) {
      const oldCV = localStorage.getItem("qorliq-old-cv-data");

      if (oldCV) {
        try {
          oldCVData = JSON.parse(oldCV);
        } catch (error) {
          console.error("Unable to parse old CV data:", error);
        }
      }
    }

    setForm((prev) => ({
      ...prev,
      template: templateConfig[template] ? template : "clean-ats",
      selectedColor:
        color ||
        oldCVData?.selectedColor ||
        templateConfig[template]?.accent ||
        prev.selectedColor,

      fullName: oldCVData?.fullName || prev.fullName,
      jobTitle: oldCVData?.jobTitle || prev.jobTitle,
      email: oldCVData?.email || prev.email,
      phone: oldCVData?.phone || prev.phone,
      location: oldCVData?.location || prev.location,
      summary: oldCVData?.summary || prev.summary,

      experience: oldCVData?.experience || prev.experience,
      education: oldCVData?.education || prev.education,

      skills: Array.isArray(oldCVData?.skills) ? oldCVData.skills : prev.skills,
      languages: Array.isArray(oldCVData?.languages)
        ? oldCVData.languages
        : prev.languages,
      certifications: Array.isArray(oldCVData?.certifications)
        ? oldCVData.certifications
        : prev.certifications,

      experiences: oldCVData?.experience
        ? [
            {
              ...emptyExperience,
              jobTitle: oldCVData?.jobTitle || "",
              location: oldCVData?.location || "",
              description: oldCVData.experience,
            },
          ]
        : prev.experiences,

      educations: oldCVData?.education
        ? [
            {
              ...emptyEducation,
              description: oldCVData.education,
            },
          ]
        : prev.educations,
    }));
  }, [searchParams]);

  const loadCVData = async (id) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/cv/${id}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || "Unable to load CV.");
        return;
      }

      const cvData = data.data || data.cv;

      if (!cvData) {
        alert("CV data response me nahi mili.");
        return;
      }
setForm({
  ...emptyForm,
  template: templateConfig[cvData.template] ? cvData.template : "clean-ats",
  selectedColor:
    cvData.selectedColor ||
    templateConfig[cvData.template]?.accent ||
    "#2563EB",

  fullName: cvData.fullName || "",
  jobTitle: cvData.jobTitle || "",
  email: cvData.email || "",
  phone: cvData.phone || "",
  location: cvData.location || "",
  linkedIn: cvData.linkedIn || "",
  github: cvData.github || "",
  portfolio: cvData.portfolio || "",
  website: cvData.website || "",

  photo: cvData.photo || "",
  photoZoom: cvData.photoZoom || 1,
  photoPositionX: cvData.photoPositionX || 50,
  photoPositionY: cvData.photoPositionY || 50,

  summary: cvData.summary || "",

  skills: Array.isArray(cvData.skills) ? cvData.skills : [],
  skillLevels: Array.isArray(cvData.skillLevels) ? cvData.skillLevels : [],
  languages: Array.isArray(cvData.languages) ? cvData.languages : [],
  languageLevels: Array.isArray(cvData.languageLevels)
    ? cvData.languageLevels
    : [],
  strengths: Array.isArray(cvData.strengths) ? cvData.strengths : [],
  achievements: Array.isArray(cvData.achievements)
    ? cvData.achievements
    : [],
  hobbies: Array.isArray(cvData.hobbies) ? cvData.hobbies : [],
  references: cvData.references || "",
  additionalSections: Array.isArray(cvData.additionalSections)
    ? cvData.additionalSections
    : [],

  certifications: Array.isArray(cvData.certifications)
    ? cvData.certifications
    : [],

  experience: cvData.experience || "",
  education: cvData.education || "",
  projects: cvData.projects || "",

  experiences:
    Array.isArray(cvData.experiences) && cvData.experiences.length
      ? cvData.experiences
      : [{ ...emptyExperience }],

  educations:
    Array.isArray(cvData.educations) && cvData.educations.length
      ? cvData.educations
      : [{ ...emptyEducation }],

  projectsList:
    Array.isArray(cvData.projectsList) && cvData.projectsList.length
      ? cvData.projectsList
      : [],

  certificationsList:
    Array.isArray(cvData.certificationsList) && cvData.certificationsList.length
      ? cvData.certificationsList
      : [],
});
    } catch (error) {
      console.error("Load CV error:", error);
      alert("Failed to load CV data.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateArrayItem = (arrayName, index, field, value) => {
    setForm((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName, emptyItem) => {
    setForm((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { ...emptyItem }],
    }));
  };

  const removeArrayItem = (arrayName, index, fallbackItem = null) => {
    setForm((prev) => {
      const updated = prev[arrayName].filter((_, i) => i !== index);

      return {
        ...prev,
        [arrayName]: updated.length
          ? updated
          : fallbackItem
          ? [{ ...fallbackItem }]
          : [],
      };
    });
  };

  const addSimpleItem = (key, value, setInput) => {
    const clean = value.trim();

    if (!clean) return;

    setForm((prev) => ({
      ...prev,
      [key]: [...prev[key], clean],
    }));

    setInput("");
  };

  const removeSimpleItem = (key, index) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const addSkill = (skillName, level = "Excellent") => {
    const clean = skillName.trim();

    if (!clean) return;

    setForm((prev) => ({
      ...prev,
      skills: [...prev.skills, clean],
      skillLevels: [...(prev.skillLevels || []), level],
    }));

    setSkillInput("");
  };

  const removeSkill = (index) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
      skillLevels: (prev.skillLevels || []).filter((_, i) => i !== index),
    }));
  };

  const updateSkillLevel = (index, value) => {
    setForm((prev) => {
      const levels = [...(prev.skillLevels || [])];
      levels[index] = value;

      return {
        ...prev,
        skillLevels: levels,
      };
    });
  };

  const addLanguage = (languageName, level = "Fluent") => {
    const clean = languageName.trim();

    if (!clean) return;

    setForm((prev) => ({
      ...prev,
      languages: [...prev.languages, clean],
      languageLevels: [...(prev.languageLevels || []), level],
    }));

    setLanguageInput("");
  };

  const removeLanguage = (index) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
      languageLevels: (prev.languageLevels || []).filter((_, i) => i !== index),
    }));
  };

  const updateLanguageLevel = (index, value) => {
    setForm((prev) => {
      const levels = [...(prev.languageLevels || [])];
      levels[index] = value;

      return {
        ...prev,
        languageLevels: levels,
      };
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      alert("Please upload JPG, PNG or WEBP image only.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.");
      return;
    }

    setUploadingPhoto(true);

    try {
      const reader = new FileReader();

      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          photo: reader.result,
          photoZoom: 1,
          photoPositionX: 50,
          photoPositionY: 50,
        }));

        setUploadingPhoto(false);
      };

      reader.onerror = () => {
        alert("Failed to read image.");
        updateField("photo", "");
        setUploadingPhoto(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image read error:", error);
      alert("Failed to upload image.");
      updateField("photo", "");
      setUploadingPhoto(false);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({
      ...prev,
      photo: "",
      photoZoom: 1,
      photoPositionX: 50,
      photoPositionY: 50,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateBeforeSubmit = () => {
    if (!form.fullName.trim()) {
      alert("Full name is required.");
      setCurrentStep(0);
      setMobileMode("edit");
      return false;
    }

    if (!form.jobTitle.trim()) {
      alert("Job title is required.");
      setCurrentStep(0);
      setMobileMode("edit");
      return false;
    }

    if (!form.email.trim()) {
      alert("Email address is required.");
      setCurrentStep(0);
      setMobileMode("edit");
      return false;
    }

    const validExperience = form.experiences.some(
      (item) => item.jobTitle && item.company && item.startDate
    );

    const validEducation = form.educations.some(
      (item) => item.degree && item.institution && item.startDate
    );

    if (!validExperience) {
      alert("Please add at least one work experience with title, company and start date.");
      setCurrentStep(2);
      setMobileMode("edit");
      return false;
    }

    if (!validEducation) {
      alert("Please add at least one education record with degree, institution and start date.");
      setCurrentStep(3);
      setMobileMode("edit");
      return false;
    }

    return true;
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();

    if (saving) return;
    if (!validateBeforeSubmit()) return;

    try {
      setSaving(true);

      const payload = {
        template: form.template,
        selectedColor: form.selectedColor || config.accent,

        fullName: form.fullName,
        jobTitle: form.jobTitle,
        email: form.email,
        phone: form.phone,
        location: form.location,
        linkedIn: form.linkedIn,
        github: form.github,
        portfolio: form.portfolio,
        website: form.website,

        photo: form.photo,
        photoZoom: form.photoZoom,
        photoPositionX: form.photoPositionX,
        photoPositionY: form.photoPositionY,

        summary: form.summary,

        skills: form.skills,
        skillLevels: form.skillLevels,
        languages: form.languages,
        languageLevels: form.languageLevels,
        strengths: form.strengths,
        achievements: form.achievements,
        hobbies: form.hobbies,
        references: form.references,
        additionalSections: form.additionalSections,

        atsScore: calculateATSScore(form),

        experience: formatExperience(form.experiences),
        education: formatEducation(form.educations),
        projects: formatProjects(form.projectsList),
        certifications: formatCertifications(form.certificationsList),

        experiences: form.experiences,
        educations: form.educations,
        projectsList: form.projectsList,
        certificationsList: form.certificationsList,
      };

      const url = isEditMode && cvId ? `/api/cv/${cvId}` : "/api/cv";
      const method = isEditMode && cvId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Unable to save CV.");
        return;
      }

      const savedCvId =
        data.cvId ||
        data.id ||
        data._id ||
        data.data?._id ||
        data.cv?._id ||
        cvId;

      if (!savedCvId) {
        alert("CV save/update ho gaya lekin CV ID response me nahi mili.");
        return;
      }

      router.push(`/cv-builder/preview/${savedCvId}`);
    } catch (error) {
      console.error("Save CV error:", error);
      alert("Something went wrong while saving CV.");
    } finally {
      setSaving(false);
    }
  };

  const clearForm = () => {
    const resetTemplate = searchParams.get("template") || "clean-ats";
    const safeTemplate = templateConfig[resetTemplate] ? resetTemplate : "clean-ats";

    setForm({
      ...emptyForm,
      template: safeTemplate,
      selectedColor: templateConfig[safeTemplate]?.accent || "#2563EB",
    });

    localStorage.removeItem("qorliq-old-cv-data");

    setSkillInput("");
    setLanguageInput("");
    setStrengthInput("");
    setAchievementInput("");
    setHobbyInput("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsEditMode(false);
    setCvId(null);
    setCurrentStep(0);
    setMobileMode("edit");
  };

  const goNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#101116] text-white">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-qorliqGold">
          Loading CV Data...
        </p>
      </main>
    );
  }

return (
  <main className="h-[100dvh] overflow-hidden bg-[#101116] text-white">
    <header className="flex h-[72px] items-center justify-between border-b border-white/10 bg-[#17181D] px-4 shadow-lg sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-qorliqGold text-sm font-black text-black">
          Q
        </div>

        <div>
          <p className="text-sm font-black text-white">
            {isEditMode ? "Edit CV" : "Create CV"}
          </p>
          <p className="text-[11px] font-semibold text-white/40">
            Qorliq CV Builder
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-3 lg:flex">
        {["Choose template", "Enter details", "Download CV"].map((item, index) => {
          const active =
            (currentStep <= 0 && index === 0) ||
            (currentStep > 0 && currentStep < 6 && index === 1) ||
            (currentStep === 6 && index === 2);

          return (
            <div key={item} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                  active
                    ? "bg-qorliqGold text-black"
                    : "bg-white/10 text-white/40"
                }`}
              >
                {index + 1}
              </div>

              <span
                className={`text-xs font-bold ${
                  active ? "text-white" : "text-white/40"
                }`}
              >
                {item}
              </span>

              {index < 2 && <div className="h-px w-10 bg-white/10" />}
            </div>
          );
        })}
      </div>

      <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-12 rounded-full bg-qorliqGold px-8 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-white disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : isEditMode
                    ? "Update CV"
                    : "Save"}
                </button>
    </header>

    <div className="sticky top-0 z-40 border-b border-white/10 bg-[#101116]/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="grid grid-cols-2 rounded-full bg-[#17181D] p-1">
        <button
          type="button"
          onClick={() => setMobileMode("edit")}
          className={`h-11 rounded-full text-xs font-black uppercase tracking-[0.14em] transition ${
            mobileMode === "edit"
              ? "bg-qorliqGold text-black shadow-sm"
              : "text-white/50"
          }`}
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => setMobileMode("preview")}
          className={`h-11 rounded-full text-xs font-black uppercase tracking-[0.14em] transition ${
            mobileMode === "preview"
              ? "bg-qorliqGold text-black shadow-sm"
              : "text-white/50"
          }`}
        >
          Preview
        </button>
      </div>
    </div>

   <section className="grid h-[calc(100dvh-72px-70px)] grid-cols-1 overflow-hidden lg:h-[calc(100dvh-72px)] lg:grid-cols-[46%_54%]">
      <form
        onSubmit={handleSave}
     onKeyDown={(e) => {
  if (e.key !== "Enter") return;

  const target = e.target;

  if (
    target.tagName === "TEXTAREA" ||
    target.isContentEditable ||
    target.closest?.("[contenteditable='true']")
  ) {
    return;
  }

  e.preventDefault();
}}
        className={`h-full overflow-y-auto bg-[#101116] px-4 py-5 sm:px-6 lg:block lg:border-r lg:border-white/10 lg:px-8 ${
          mobileMode === "edit" ? "block" : "hidden"
        }`}
      >
        <div className="mx-auto max-w-[680px]">
          <div className="mb-5 rounded-2xl border border-white/10 bg-[#17181D] p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-qorliqGold">
                  Step {currentStep + 1} of {steps.length}
                </p>

                <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-white">
                  {steps[currentStep].title}
                </h1>

                <p className="mt-1 text-sm leading-6 text-white/45">
                  {steps[currentStep].desc}
                </p>
              </div>

              <div className="hidden rounded-xl bg-black/25 px-4 py-3 text-right sm:block">
                <p className="text-[10px] font-black uppercase text-white/40">
                  ATS
                </p>
                <p className="text-xl font-black text-qorliqGold">
                  {livePreviewCV.atsScore}%
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-qorliqGold transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>

            <CVScoreCard
              pageScores={pageScores}
              totalCvScore={totalCvScore}
              currentPageScore={currentPageScore}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {steps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`h-9 min-w-9 shrink-0 rounded-full px-3 text-[10px] font-black transition ${
                    currentStep === index
                      ? "bg-qorliqGold text-black"
                      : "bg-white/10 text-white/40 hover:bg-white/15"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#17181D] p-4 shadow-lg sm:p-5">
            {/* Yahan aapke existing steps same rahenge */}
            {currentStep === 0 && (
              <BasicInfoStep
                form={form}
                updateField={updateField}
                cvTemplates={cvTemplates}
                fileInputRef={fileInputRef}
                templateSupportsPhoto={templateSupportsPhoto}
                uploadingPhoto={uploadingPhoto}
                handlePhotoUpload={handlePhotoUpload}
                handleRemoveImage={handleRemoveImage}
              />
            )}

            {currentStep === 1 && (
              <PureSummaryStep form={form} updateField={updateField} />
            )}

            {currentStep === 2 && (
              <ExperienceStep
                form={form}
                updateArrayItem={updateArrayItem}
                addArrayItem={addArrayItem}
                removeArrayItem={removeArrayItem}
              />
            )}

            {currentStep === 3 && (
              <EducationStep
                form={form}
                updateArrayItem={updateArrayItem}
                addArrayItem={addArrayItem}
                removeArrayItem={removeArrayItem}
              />
            )}

            {currentStep === 4 && (
              <SkillsStep
                form={form}
                skillInput={skillInput}
                setSkillInput={setSkillInput}
                languageInput={languageInput}
                setLanguageInput={setLanguageInput}
                strengthInput={strengthInput}
                setStrengthInput={setStrengthInput}
                addSimpleItem={addSimpleItem}
                removeSimpleItem={removeSimpleItem}
                addSkill={addSkill}
                removeSkill={removeSkill}
                updateSkillLevel={updateSkillLevel}
                addLanguage={addLanguage}
                removeLanguage={removeLanguage}
                updateLanguageLevel={updateLanguageLevel}
              />
            )}

            {currentStep === 5 && (
              <ProjectsAchievementsStep
                form={form}
                updateArrayItem={updateArrayItem}
                addArrayItem={addArrayItem}
                removeArrayItem={removeArrayItem}
                achievementInput={achievementInput}
                setAchievementInput={setAchievementInput}
                addSimpleItem={addSimpleItem}
                removeSimpleItem={removeSimpleItem}
              />
            )}

            {currentStep === 6 && (
              <CertificationsExtraStep
                form={form}
                updateField={updateField}
                updateArrayItem={updateArrayItem}
                addArrayItem={addArrayItem}
                removeArrayItem={removeArrayItem}
                hobbyInput={hobbyInput}
                setHobbyInput={setHobbyInput}
                addSimpleItem={addSimpleItem}
                removeSimpleItem={removeSimpleItem}
              />
            )}
          </div>

          <div className="sticky bottom-0 mt-5 flex  gap-3 border-t border-white/10 bg-[#101116] py-4 flex-row items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 0 || saving}
              onClick={goBack}
              className="h-12 rounded-full border border-white/15 px-6 text-xs font-black uppercase tracking-[0.14em] text-white/60 transition hover:border-qorliqGold hover:text-qorliqGold disabled:opacity-40"
            >
              Back
            </button>

            <div className="flex  gap-3 flex-row">
              <button
                type="button"
                onClick={clearForm}
                disabled={saving}
                className="h-12 hidden md:block rounded-full border border-white/15 px-6 text-xs font-black uppercase tracking-[0.14em] text-white/60 transition hover:border-red-300 hover:text-red-200 disabled:opacity-50"
              >
                Clear
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={saving}
                  className="h-12 rounded-full bg-qorliqGold px-8 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-white disabled:opacity-50"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-12 rounded-full bg-qorliqGold px-8 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-white disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : isEditMode
                    ? "Update CV"
                    : "Save & Preview"}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
<aside
  className={`h-full min-h-0 overflow-hidden bg-[#17181D] p-3 sm:p-5 lg:block ${
    mobileMode === "preview" ? "block" : "hidden"
  }`}
>
  <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101116] shadow-inner">
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-qorliqGold">
          Preview
        </p>

        <p className="text-[11px] font-semibold text-white/40">
          {config.name}
        </p>
      </div>

      <span className="rounded-full bg-[#17181D] px-3 py-1.5 text-xs font-black text-white/70 shadow-sm">
        {livePreviewCV.atsScore}%
      </span>
    </div>

    <div className="preview-viewport">
      <div className="preview-page-holder">
        <div className="preview-page-scale">
          <TemplateRenderer cv={livePreviewCV} config={config} />
        </div>
      </div>
    </div>
  </div>

  <style jsx>{`
    .preview-viewport {
      flex: 1;
      min-height: 0;
      width: 100%;
      overflow-y: auto;
      overflow-x: auto;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 18px 8px 42px;
      scroll-padding-top: 18px;
    }

    .preview-page-holder {
      --scale: 0.39;

      width: calc(794px * var(--scale));
      min-width: calc(794px * var(--scale));
      height: calc(1123px * var(--scale));
      min-height: calc(1123px * var(--scale));
      flex: 0 0 auto;
      position: relative;
      overflow: visible;
      margin: 0 auto;
    }

    .preview-page-scale {
      width: 794px;
      min-width: 794px;
      height: 1123px;
      min-height: 1123px;
      transform: scale(var(--scale));
      transform-origin: top left;
      overflow: visible;
    }

    @media (min-width: 390px) {
      .preview-page-holder {
        --scale: 0.44;
      }
    }

    @media (min-width: 480px) {
      .preview-page-holder {
        --scale: 0.52;
      }
    }

    @media (min-width: 640px) {
      .preview-page-holder {
        --scale: 0.62;
      }
    }

    @media (min-width: 768px) {
      .preview-page-holder {
        --scale: 0.72;
      }
    }

   @media (min-width: 1024px) {
  .preview-viewport {
    align-items: flex-start;
    justify-content: center;
    padding: 16px 10px 42px;
    overflow-y: auto;
    overflow-x: auto;
  }

  .preview-page-holder {
    --scale: 0.56;
  }
}

@media (min-width: 1280px) {
  .preview-page-holder {
    --scale: 0.66;
  }
}

@media (min-width: 1536px) {
  .preview-page-holder {
    --scale: 0.78;
  }
}

@media (min-width: 1800px) {
  .preview-page-holder {
    --scale: 0.9;
  }
}
  `}</style>
</aside>
    </section>
  </main>
);
}











function PureSummaryStep({ form, updateField }) {
  return (
    <div className="space-y-5">
     <RichTextEditor
  label="Professional Summary"
  value={form.summary}
  onChange={(value) => updateField("summary", value)}
  placeholder="Write your professional summary..."
  rows={8}
  showAI
  aiType="summary"
  targetRole={form.jobTitle}
  cvContext={{
    ...form,
    requestedSection: "summary",
    professionalTitle: form.jobTitle,
    targetTitle: form.jobTitle,
    currentSummary: form.summary,
  }}
/>

      <div className="rounded-3xl ">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-qorliqGold">
          Writing Tips
        </p>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-white/55">
          <li>• Keep the summary between 3 and 5 lines.</li>
          <li>• Use bold only for important keywords.</li>
          <li>• Avoid very long paragraphs so CV remains clean.</li>
        </ul>
      </div>
    </div>
  );
}
function BasicInfoStep({
  form,
  updateField,
  cvTemplates,
  fileInputRef,
  templateSupportsPhoto,
  uploadingPhoto,
  handlePhotoUpload,
  handleRemoveImage,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="Full Name"
          value={form.fullName}
          onChange={(value) => updateField("fullName", value)}
          placeholder="e.g. Qandeel Faryad"
          required
        />

        <Input
          label="Job Title"
          value={form.jobTitle}
          onChange={(value) => updateField("jobTitle", value)}
          placeholder="e.g. Operations Manager"
          required
        />

        <Input
          label="Email Address"
          value={form.email}
          onChange={(value) => updateField("email", value)}
          placeholder="name@email.com"
          type="email"
          required
        />

        <Input
          label="Phone Number"
          value={form.phone}
          onChange={(value) => updateField("phone", value)}
          placeholder="+44 7000 000000"
        />

        <Input
          label="Location"
          value={form.location}
          onChange={(value) => updateField("location", value)}
          placeholder="London, United Kingdom"
        />

        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/50">
            CV Template
          </label>

          <select
            value={form.template}
            onChange={(e) => {
              const nextTemplate = e.target.value;
              const selected = cvTemplates.find(
                (item) => item.id === nextTemplate
              );

              updateField("template", nextTemplate);
              updateField("selectedColor", selected?.colors?.[0] || "#2563EB");
            }}
            className="h-14 w-full rounded-2xl border border-white/10 bg-black/45 px-4 text-sm text-white outline-none transition focus:border-qorliqGold"
          >
            {cvTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="LinkedIn Profile"
          value={form.linkedIn}
          onChange={(value) => updateField("linkedIn", value)}
          placeholder="https://linkedin.com/in/yourname"
        />

        <Input
          label="Portfolio / Website"
          value={form.website}
          onChange={(value) => updateField("website", value)}
          placeholder="https://yourwebsite.com"
        />

        <Input
          label="GitHub Profile"
          value={form.github}
          onChange={(value) => updateField("github", value)}
          placeholder="https://github.com/yourusername"
        />

        <Input
          label="Portfolio Link"
          value={form.portfolio}
          onChange={(value) => updateField("portfolio", value)}
          placeholder="https://portfolio.com"
        />

        <div className="md:col-span-2">
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/50">
            Profile Photo
          </label>

          <div className="grid gap-5 rounded-3xl border border-white/10 bg-black/30 p-5 md:grid-cols-[160px_1fr]">
            <div className="flex justify-center">
              <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/50">
                {form.photo ? (
                  <img
                    src={form.photo}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                    style={{
                      transform: `scale(${form.photoZoom || 1})`,
                      objectPosition: `${form.photoPositionX || 50}% ${
                        form.photoPositionY || 50
                      }%`,
                    }}
                  />
                ) : (
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-white/30">
                    Photo
                  </span>
                )}
              </div>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingPhoto || !templateSupportsPhoto}
                onChange={handlePhotoUpload}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-qorliqGold file:px-5 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.12em] file:text-black hover:file:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              />

              {templateSupportsPhoto ? (
                <p className="mt-3 text-xs leading-6 text-white/45">
                  Upload JPG, PNG or WEBP. Use zoom and position controls to fit
                  the image properly.
                </p>
              ) : (
                <p className="mt-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-xs font-bold leading-6 text-yellow-100">
                  This selected template does not support profile image.
                </p>
              )}

              {form.photo ? (
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <RangeInput
                    label="Zoom"
                    min="1"
                    max="2"
                    step="0.05"
                    value={form.photoZoom || 1}
                    onChange={(value) =>
                      updateField("photoZoom", Number(value))
                    }
                  />

                  <RangeInput
                    label="Move X"
                    min="0"
                    max="100"
                    step="1"
                    value={form.photoPositionX || 50}
                    onChange={(value) =>
                      updateField("photoPositionX", Number(value))
                    }
                  />

                  <RangeInput
                    label="Move Y"
                    min="0"
                    max="100"
                    step="1"
                    value={form.photoPositionY || 50}
                    onChange={(value) =>
                      updateField("photoPositionY", Number(value))
                    }
                  />

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={uploadingPhoto}
                    className="text-left text-xs font-black uppercase tracking-[0.16em] text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-3"
                  >
                    Remove Image
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}















function ExperienceStep({
  form,
  updateArrayItem,
  addArrayItem,
  removeArrayItem,
}) {
  return (
    <div className="space-y-5">
      {form.experiences.map((item, index) => (
       <ExperienceCard
  key={index}
  index={index}
  item={item}
  form={form}
  onChange={(field, value) =>
    updateArrayItem("experiences", index, field, value)
  }
  onRemove={() =>
    removeArrayItem("experiences", index, emptyExperience)
  }
/>
      ))}

      <AddButton
        text="Add Another Experience"
        onClick={() => addArrayItem("experiences", emptyExperience)}
      />
    </div>
  );
}

function EducationStep({ form, updateArrayItem, addArrayItem, removeArrayItem }) {
  return (
    <div className="space-y-5">
      {form.educations.map((item, index) => (
        <EducationCard
          key={index}
          index={index}
          item={item}
          onChange={(field, value) =>
            updateArrayItem("educations", index, field, value)
          }
          onRemove={() => removeArrayItem("educations", index, emptyEducation)}
        />
      ))}

      <AddButton
        text="Add Another Education"
        onClick={() => addArrayItem("educations", emptyEducation)}
      />
    </div>
  );
}

function SkillsStep({
  form,
  skillInput,
  setSkillInput,
  languageInput,
  setLanguageInput,
  strengthInput,
  setStrengthInput,
  addSimpleItem,
  removeSimpleItem,
  addSkill,
  removeSkill,
  updateSkillLevel,
  addLanguage,
  removeLanguage,
  updateLanguageLevel,
}) {
  return (
    <div className="grid gap-5">
      <div className="rounded-3xl">
        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/50">
          Skills & Levels
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="e.g. Microsoft Excel"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(skillInput);
              }
            }}
            className="py-4  flex-1 rounded-2xl border border-white/10 bg-black/45 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-qorliqGold"
          />

          <button
            type="button"
            onClick={() => addSkill(skillInput)}
            className="rounded-2xl bg-qorliqGold px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-white"
          >
            Add Skill
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {skillSuggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white/65 hover:border-qorliqGold hover:text-qorliqGold"
            >
              + {skill}
            </button>
          ))}
        </div>

        {form.skills?.length ? (
          <div className="mt-5 space-y-3">
            {form.skills.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:grid-cols-[1fr_160px_auto]"
              >
                <p className="text-sm font-bold text-white/80">{item}</p>

                <select
                  value={form.skillLevels?.[index] || "Excellent"}
                  onChange={(e) => updateSkillLevel(index, e.target.value)}
                  className="h-10 rounded-xl border border-white/10 bg-black/45 px-3 text-xs font-bold text-white outline-none focus:border-qorliqGold"
                >
                  {levelOptions.map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="rounded-xl border border-red-300/20 px-3 py-2 text-xs font-black text-red-200 hover:bg-red-300 hover:text-black"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl ">
        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/50">
          Languages & Proficiency
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            placeholder="e.g. English"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLanguage(languageInput);
              }
            }}
            className="py-4 flex-1 rounded-2xl border border-white/10 bg-black/45 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-qorliqGold"
          />

          <button
            type="button"
            onClick={() => addLanguage(languageInput)}
            className="rounded-2xl bg-qorliqGold px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-white"
          >
            Add Language
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {languageSuggestions.map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => addLanguage(language)}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white/65 hover:border-qorliqGold hover:text-qorliqGold"
            >
              + {language}
            </button>
          ))}
        </div>

        {form.languages?.length ? (
          <div className="mt-5 space-y-3">
            {form.languages.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:grid-cols-[1fr_160px_auto]"
              >
                <p className="text-sm font-bold text-white/80">{item}</p>

                <select
                  value={form.languageLevels?.[index] || "Fluent"}
                  onChange={(e) => updateLanguageLevel(index, e.target.value)}
                  className="h-10 rounded-xl border border-white/10 bg-black/45 px-3 text-xs font-bold text-white outline-none focus:border-qorliqGold"
                >
                  {proficiencyOptions.map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="rounded-xl border border-red-300/20 px-3 py-2 text-xs font-black text-red-200 hover:bg-red-300 hover:text-black"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <DynamicListInput
        label="Key Strengths"
        value={strengthInput}
        onChange={setStrengthInput}
        onAdd={() =>
          addSimpleItem("strengths", strengthInput, setStrengthInput)
        }
        onRemove={(index) => removeSimpleItem("strengths", index)}
        items={form.strengths}
        placeholder="e.g. Leadership, Problem Solving, Communication"
        buttonText="Add Strength"
      />
    </div>
  );
}

function ProjectsAchievementsStep({
  form,
  updateArrayItem,
  addArrayItem,
  removeArrayItem,
  achievementInput,
  setAchievementInput,
  addSimpleItem,
  removeSimpleItem,
}) {
  return (
    <div className="space-y-5">
      {form.projectsList.map((item, index) => (
        <ProjectCard
          key={index}
          index={index}
          item={item}
          onChange={(field, value) =>
            updateArrayItem("projectsList", index, field, value)
          }
          onRemove={() => removeArrayItem("projectsList", index)}
        />
      ))}

      <AddButton
        text="Add Project"
        onClick={() => addArrayItem("projectsList", emptyProject)}
      />

      <DynamicListInput
        label="Career Achievements"
        value={achievementInput}
        onChange={setAchievementInput}
        onAdd={() =>
          addSimpleItem("achievements", achievementInput, setAchievementInput)
        }
        onRemove={(index) => removeSimpleItem("achievements", index)}
        items={form.achievements}
        placeholder="e.g. Improved reporting accuracy by 38%"
        buttonText="Add Achievement"
      />
    </div>
  );
}

function CertificationsExtraStep({
  form,
  updateField,
  updateArrayItem,
  addArrayItem,
  removeArrayItem,
  hobbyInput,
  setHobbyInput,
  addSimpleItem,
  removeSimpleItem,
}) {
  return (
    <div className="space-y-5">
      {form.certificationsList.map((item, index) => (
        <CertificationCard
          key={index}
          index={index}
          item={item}
          onChange={(field, value) =>
            updateArrayItem("certificationsList", index, field, value)
          }
          onRemove={() => removeArrayItem("certificationsList", index)}
        />
      ))}

      <AddButton
        text="Add Certification"
        onClick={() => addArrayItem("certificationsList", emptyCertification)}
      />

      <DynamicListInput
        label="Hobbies / Interests"
        value={hobbyInput}
        onChange={setHobbyInput}
        onAdd={() => addSimpleItem("hobbies", hobbyInput, setHobbyInput)}
        onRemove={(index) => removeSimpleItem("hobbies", index)}
        items={form.hobbies}
        placeholder="e.g. Reading, volunteering, travelling"
        buttonText="Add Hobby"
      />

      <div className="rounded-3xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-black">Additional Sections</p>
            <p className="mt-1 text-xs text-white/45">
              Add awards, publications, volunteering, memberships or any custom CV section.
            </p>
          </div>

          <AddButton
            text="Add Section"
            onClick={() => addArrayItem("additionalSections", emptyAdditionalSection)}
          />
        </div>

        <div className="mt-5 space-y-4">
          {form.additionalSections.map((item, index) => (
            <AdditionalSectionCard
              key={index}
              index={index}
              item={item}
              onChange={(field, value) =>
                updateArrayItem("additionalSections", index, field, value)
              }
              onRemove={() => removeArrayItem("additionalSections", index)}
            />
          ))}
        </div>
      </div>

      <Textarea
        label="References"
        value={form.references}
        onChange={(value) => updateField("references", value)}
        placeholder="Available upon request, or add referee details..."
        rows={4}
      />
    </div>
  );
}

function AdditionalSectionCard({ index, item, onChange, onRemove }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <CardTop title={`Additional Section ${index + 1}`} onRemove={onRemove} />

      <div className="mt-4 grid gap-4">
        <Input
          label="Section Title"
          value={item.title}
          onChange={(value) => onChange("title", value)}
          placeholder="e.g. Awards, Publications, Volunteering"
        />

        <Textarea
          label="Section Details"
          value={item.description}
          onChange={(value) => onChange("description", value)}
          placeholder={`Example:
• Volunteer Coordinator — Local Community Centre
• Supported event planning, communication and documentation`}
          rows={4}
        />
      </div>
    </div>
  );
}

function ExperienceCard({ index, item, form, onChange, onRemove }) {
  return (
    <div className="rounded-3xl ">
      <CardTop title={`Experience ${index + 1}`} onRemove={onRemove} />

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Input
          label="Job Title"
          value={item.jobTitle}
          onChange={(value) => onChange("jobTitle", value)}
          placeholder="e.g. Operations Manager"
          required
        />

        <Input
          label="Company"
          value={item.company}
          onChange={(value) => onChange("company", value)}
          placeholder="e.g. Brightline Services"
          required
        />

        <Input
          label="Location"
          value={item.location}
          onChange={(value) => onChange("location", value)}
          placeholder="e.g. London, UK"
        />

        <Input
          label="Start Date"
          value={item.startDate}
          onChange={(value) => onChange("startDate", value)}
          placeholder="e.g. Jan 2021"
          required
        />

        <Input
          label="End Date"
          value={item.endDate}
          onChange={(value) => onChange("endDate", value)}
          placeholder="e.g. Dec 2024"
          disabled={item.current}
        />

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
          <input
            type="checkbox"
            checked={Boolean(item.current)}
            onChange={(e) => onChange("current", e.target.checked)}
            className="h-4 w-4 accent-[#C8A24A]"
          />
          <span className="text-sm font-bold text-white/70">
            I currently work here
          </span>
        </label>

        <div className="md:col-span-2">
    <RichTextEditor
  label="Achievements / Responsibilities"
  value={item.description}
  onChange={(value) => onChange("description", value)}
  placeholder={`Example:
• Improved reporting accuracy by 38%
• Managed supplier communication and internal workflows
• Reduced operational delays through process improvement`}
  rows={6}
  showAI
  aiType="responsibilities"
  targetRole={item.jobTitle || form?.jobTitle}
  cvContext={{
    ...form,
    expTitle: item.jobTitle,
    company: item.company,
    startDate: item.startDate,
    endDate: item.current ? "Present" : item.endDate,
    responsibilities: item.description,
  }}
/>

          <SuggestionPanel title="Suggested Descriptions">
            {experienceSuggestions.map((suggestion) => (
            <SuggestionButton
  key={suggestion}
  text={suggestion}
  onClick={() => {
    const next = item.description
      ? `${item.description}<ul><li>${suggestion}</li></ul>`
      : `<ul><li>${suggestion}</li></ul>`;

    onChange("description", next);
  }}
/>
            ))}
          </SuggestionPanel>
        </div>
      </div>
    </div>
  );
}

function EducationCard({ index, item, onChange, onRemove }) {
  return (
    <div className="rounded-3xl ">
      <CardTop title={`Education ${index + 1}`} onRemove={onRemove} />

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Input
          label="Degree / Qualification"
          value={item.degree}
          onChange={(value) => onChange("degree", value)}
          placeholder="e.g. BA Business Management"
          required
        />

        <Input
          label="Institution"
          value={item.institution}
          onChange={(value) => onChange("institution", value)}
          placeholder="e.g. University of Manchester"
          required
        />

        <Input
          label="Location"
          value={item.location}
          onChange={(value) => onChange("location", value)}
          placeholder="e.g. Manchester, UK"
        />

        <Input
          label="Start Date"
          value={item.startDate}
          onChange={(value) => onChange("startDate", value)}
          placeholder="e.g. 2018"
          required
        />

        <Input
          label="End Date"
          value={item.endDate}
          onChange={(value) => onChange("endDate", value)}
          placeholder="e.g. 2021"
        />

        <div className="md:col-span-2">
          <Textarea
            label="Additional Details"
            value={item.description}
            onChange={(value) => onChange("description", value)}
            placeholder="Optional: modules, final project, grade, honours or achievements..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ index, item, onChange, onRemove }) {
  return (
    <div className="rounded-3xl">
      <CardTop title={`Project ${index + 1}`} onRemove={onRemove} />

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Input
          label="Project Title"
          value={item.title}
          onChange={(value) => onChange("title", value)}
          placeholder="e.g. CV Builder Platform"
        />

        <Input
          label="Role"
          value={item.role}
          onChange={(value) => onChange("role", value)}
          placeholder="e.g. Full Stack Developer"
        />

        <Input
          label="Technologies / Tools"
          value={item.technologies}
          onChange={(value) => onChange("technologies", value)}
          placeholder="e.g. Next.js, MongoDB, Stripe"
        />

        <Input
          label="Date / Year"
          value={item.date}
          onChange={(value) => onChange("date", value)}
          placeholder="e.g. 2026"
        />

        <div className="md:col-span-2">
          <Textarea
            label="Project Description"
            value={item.description}
            onChange={(value) => onChange("description", value)}
            placeholder="Explain what you built, your contribution and measurable result..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

function CertificationCard({ index, item, onChange, onRemove }) {
  return (
    <div className="rounded-3xl ">
      <CardTop title={`Certification ${index + 1}`} onRemove={onRemove} />

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <Input
          label="Certificate Name"
          value={item.name}
          onChange={(value) => onChange("name", value)}
          placeholder="e.g. AWS Cloud Practitioner"
        />

        <Input
          label="Issuer"
          value={item.issuer}
          onChange={(value) => onChange("issuer", value)}
          placeholder="e.g. Amazon Web Services"
        />

        <Input
          label="Date / Year"
          value={item.date}
          onChange={(value) => onChange("date", value)}
          placeholder="e.g. 2025"
        />
      </div>
    </div>
  );
}

function CardTop({ title, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h4 className="text-sm font-black uppercase tracking-[0.18em] text-white/75">
        {title}
      </h4>

      <button
        type="button"
        onClick={onRemove}
        className="rounded-full border border-red-300/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-red-200 transition hover:bg-red-300 hover:text-black"
      >
        Remove
      </button>
    </div>
  );
}
function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/50">
        {label} {required ? <span className="text-qorliqGold">*</span> : null}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-white/10 bg-black/45 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-qorliqGold focus:bg-black/55 focus:ring-4 focus:ring-qorliqGold/15 disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-white/30"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  required = false,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/50">
        {label} {required ? <span className="text-qorliqGold">*</span> : null}
      </label>

      <textarea
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-2xl border border-white/10 bg-black/45 px-4 py-4 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-qorliqGold focus:bg-black/55 focus:ring-4 focus:ring-qorliqGold/15 disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-white/30"
      />
    </div>
  );
}
function ToolbarDivider() {
  return <span className="hidden h-8 w-px shrink-0 bg-slate-200 md:block" />;
}

function ToolbarButton({
  title,
  onClick,
  active = false,
  children,
  className = "",
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={`inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border text-[15px] font-black transition-all duration-150 active:scale-[0.97] ${
        active
          ? "border-[#18227C] bg-[#18227C] text-white shadow-[0_8px_18px_rgba(24,34,124,0.22)]"
          : "border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function AIStars() {
  return (
    <span className="relative flex h-5 w-5 items-center justify-center">
      <span className="absolute left-[1px] top-[7px] text-[10px] leading-none">✦</span>
      <span className="absolute left-[8px] top-[1px] text-[8px] leading-none">✦</span>
      <span className="absolute left-[11px] top-[10px] text-[6px] leading-none">✦</span>
    </span>
  );
}

function CVScoreCard({ pageScores, totalCvScore, currentPageScore, currentStep, setCurrentStep }) {
  const stepEmojis = ["👤", "📝", "💼", "🎓", "🛠️", "🏆", "📄"];
  const moodEmoji = totalCvScore >= 90 ? "😍" : totalCvScore >= 75 ? "😊" : totalCvScore >= 50 ? "🙂" : totalCvScore >= 25 ? "😐" : "💧";

  return (
    <div className="mt-3 rounded-2xl border border-cyan-300/20 bg-gradient-to-r from-cyan-950/80 via-[#10283b] to-[#17181D] px-3 py-2 shadow-lg shadow-cyan-950/20">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-lg">{stepEmojis[currentStep] || "✨"}</span>
        <p className="shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
          Your CV Score
        </p>
        <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10 shadow-inner">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 transition-all duration-700 ease-out"
            style={{ width: `${totalCvScore}%` }}
          />
        </div>
        <span className="text-sm">{moodEmoji}</span>
        <span className="text-sm font-black text-white">{totalCvScore}%</span>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {pageScores.map((value, index) => (
          <button
            key={`score-step-${index}`}
            type="button"
            onClick={() => setCurrentStep(index)}
            className={`h-1.5 rounded-full transition-all ${
              currentStep === index
                ? "bg-white"
                : value >= 80
                ? "bg-cyan-300"
                : value > 0
                ? "bg-cyan-300/45"
                : "bg-white/15"
            }`}
            title={`Page ${index + 1}: ${value}% | Current page: ${currentPageScore}%`}
          />
        ))}
      </div>
    </div>
  );
}

function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Type or paste your text here...",
  rows = 7,
  showAI = false,
  aiType = "summary",
  cvContext = {},
  targetRole = "",
}) {
  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAlign, setActiveAlign] = useState("left");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const nextValue = value || "";

    if (document.activeElement !== editor && editor.innerHTML !== nextValue) {
      editor.innerHTML = nextValue;
    }
  }, [value]);

  const updateValue = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const saveSelection = () => {
    if (typeof window === "undefined") return;

    const selection = window.getSelection();
    const editor = editorRef.current;

    if (!selection || !editor || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (editor.contains(range.commonAncestorContainer)) {
      savedSelectionRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    if (typeof window === "undefined") return;

    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection) return;

    editor.focus();

    if (savedSelectionRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }
  };

const runCommand = (command, commandValue = null) => {
  restoreSelection();

  setTimeout(() => {
    if (
      typeof document !== "undefined" &&
      typeof document.execCommand === "function"
    ) {
      document.execCommand(command, false, commandValue);
    }

    const html = editorRef.current?.innerHTML || "";
    onChange(html);
    saveSelection();
  }, 0);
};

  const runAlign = (command, alignName) => {
    setActiveAlign(alignName);
    runCommand(command);
  };

  const addLink = () => {
    restoreSelection();

    let url = window.prompt("Enter URL");
    if (!url) return;

    url = url.trim();

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    runCommand("createLink", url);

    setTimeout(() => {
      editorRef.current?.querySelectorAll("a").forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });

      updateValue();
    }, 10);
  };

  const handleGenerateAI = async () => {
    if (aiLoading) return;

    try {
      setAiLoading(true);

      const role =
        targetRole ||
        cvContext?.professionalTitle ||
        cvContext?.targetTitle ||
        cvContext?.expTitle ||
        cvContext?.jobTitle ||
        "";

      const safeCvContext = {
        ...cvContext,
        requestedSection: aiType,
        aiType,
        professionalTitle: role,
        targetTitle: role,
        jobTitle:
          aiType === "responsibilities" ? cvContext?.jobTitle || role : role,
        expTitle:
          aiType === "responsibilities" ? role : cvContext?.expTitle || "",
        currentEditorValue: editorRef.current?.innerHTML || value || "",
      };

      const html = await generateCvAiContent({
        type: aiType,
        cv: safeCvContext,
      });

      if (editorRef.current) {
        editorRef.current.innerHTML = html;
      }

      onChange(html);
      saveSelection();
    } catch (error) {
      console.error("Generate AI error:", error);
      alert(error?.message || "AI generation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="block text-xs font-black uppercase tracking-[0.16em] text-white/50">
          {label}
        </label>

        {showAI ? (
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={aiLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-qorliqGold px-5 text-[11px] font-black uppercase tracking-[0.14em] text-black shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <AIStars />
            {aiLoading ? "Writing..." : "Generate AI"}
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
        <div className="flex items-center gap-3 overflow-x-auto border-b border-slate-200 bg-white px-4 py-4">
          <ToolbarButton
            title="Paragraph"
            onClick={() => runCommand("formatBlock", "p")}
            className="min-w-[100px] gap-2 px-4"
          >
            <span>Tt</span>
            <span className="text-[10px] text-slate-500">▼</span>
          </ToolbarButton>

          <ToolbarButton title="Bold" onClick={() => runCommand("bold")}>
            B
          </ToolbarButton>

          <ToolbarButton title="Italic" onClick={() => runCommand("italic")}>
            <span className="italic">I</span>
          </ToolbarButton>

          <ToolbarButton title="Underline" onClick={() => runCommand("underline")}>
            <span className="underline underline-offset-4">U</span>
          </ToolbarButton>

          <ToolbarButton
            title="Strikethrough"
            onClick={() => runCommand("strikeThrough")}
          >
            <span className="line-through">S</span>
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="Bullet list"
            onClick={() => runCommand("insertUnorderedList")}
          >
            <span className="text-lg leading-none">.≡</span>
          </ToolbarButton>

          <ToolbarButton
            title="Numbered list"
            onClick={() => runCommand("insertOrderedList")}
          >
            <span className="text-sm leading-none">1≡</span>
          </ToolbarButton>

          <ToolbarDivider />

         <ToolbarButton
  title="Quote"
  onClick={() => runCommand("formatBlock", "<blockquote>")}
>
  <span className="text-lg leading-none">❞</span>
</ToolbarButton>

          <ToolbarButton title="Add link" onClick={addLink}>
            <span className="text-lg leading-none">↗</span>
          </ToolbarButton>

          <ToolbarDivider />

          <div className="flex shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <ToolbarButton
              title="Align left"
              active={activeAlign === "left"}
              onClick={() => runAlign("justifyLeft", "left")}
              className="rounded-none border-0 shadow-none"
            >
              <span className="text-lg leading-none">☰</span>
            </ToolbarButton>

            <ToolbarButton
              title="Align center"
              active={activeAlign === "center"}
              onClick={() => runAlign("justifyCenter", "center")}
              className="rounded-none border-0 border-l border-slate-200 shadow-none"
            >
              <span className="text-lg leading-none">≡</span>
            </ToolbarButton>

            <ToolbarButton
              title="Align right"
              active={activeAlign === "right"}
              onClick={() => runAlign("justifyRight", "right")}
              className="rounded-none border-0 border-l border-slate-200 shadow-none"
            >
              <span className="text-lg leading-none">☷</span>
            </ToolbarButton>

            <ToolbarButton
              title="Justify"
              active={activeAlign === "justify"}
              onClick={() => runAlign("justifyFull", "justify")}
              className="rounded-none border-0 border-l border-slate-200 shadow-none"
            >
              <span className="text-lg leading-none">▤</span>
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          <ToolbarButton title="Undo" onClick={() => runCommand("undo")}>
            <span className="text-xl leading-none">↶</span>
          </ToolbarButton>

          <ToolbarButton title="Redo" onClick={() => runCommand("redo")}>
            <span className="text-xl leading-none text-slate-400">↷</span>
          </ToolbarButton>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={updateValue}
          onBlur={() => {
            updateValue();
            saveSelection();
          }}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          data-placeholder={placeholder}
          className="rich-editor-area w-full overflow-y-auto bg-white px-6 py-6 text-[17px] font-normal leading-8 text-slate-800 outline-none"
          style={{
            minHeight: `${Math.max(rows * 34, 170)}px`,
          }}
        />
      </div>

      <style jsx global>{`
        .rich-editor-area:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          font-weight: 400;
        }

        .rich-editor-area p {
          margin: 0 0 10px;
        }

        .rich-editor-area ul {
          list-style-type: disc;
          padding-left: 24px;
          margin: 10px 0;
        }

        .rich-editor-area ol {
          list-style-type: decimal;
          padding-left: 24px;
          margin: 10px 0;
        }

        .rich-editor-area li {
          margin: 5px 0;
        }

        .rich-editor-area blockquote {
          margin: 12px 0;
          border-left: 4px solid #18227c;
          background: #f8fafc;
          padding: 12px 16px;
          color: #334155;
          border-radius: 12px;
        }

        .rich-editor-area a {
          color: #18227c;
          text-decoration: underline;
          font-weight: 700;
        }

        .rich-editor-area::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .rich-editor-area::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        .rich-editor-area::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
function RangeInput({ label, value, onChange, min, max, step }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
          {label}
        </label>
        <span className="text-[10px] font-bold text-white/40">{value}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full accent-[#C8A24A]"
      />
    </div>
  );
}

function DynamicListInput({
  label,
  value,
  onChange,
  onAdd,
  onRemove,
  items,
  placeholder,
  buttonText,
}) {
  return (
    <div className="rounded-3xl ">
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/50">
        {label}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          className="py-4 flex-1 rounded-2xl border border-white/10 bg-black/45 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-qorliqGold"
        />

        <button
          type="button"
          onClick={onAdd}
          className="rounded-2xl bg-qorliqGold px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-white"
        >
          {buttonText}
        </button>
      </div>

      {items?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white/80"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-200 hover:text-red-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AddButton({ text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-3xl border border-dashed border-qorliqGold/40 bg-qorliqGold/10 px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-qorliqGold transition hover:bg-qorliqGold hover:text-black"
    >
      + {text}
    </button>
  );
}

function SuggestionPanel({ title, children }) {
  return (
    <div className="mt-4 rounded-3xl mb-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-qorliqGold">
        {title}
      </p>

      <div className="mt-4 grid gap-3">{children}</div>
    </div>
  );
}

function SuggestionButton({ text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm leading-7 text-white/65 transition hover:border-qorliqGold hover:text-white"
    >
      {text}
    </button>
  );
}
function decodeAllowedHtmlTags(value = "") {
  return String(value)
    .replace(/&lt;(b|strong)&gt;/gi, "<strong>")
    .replace(/&lt;(i|em)&gt;/gi, "<em>")
    .replace(/&lt;u&gt;/gi, "<u>")
    .replace(/&lt;(s|strike|del)&gt;/gi, "<s>")
    .replace(/&lt;p&gt;/gi, "<p>")
    .replace(/&lt;br\s*\/?&gt;/gi, "<br>")
    .replace(/&lt;ul&gt;/gi, "<ul>")
    .replace(/&lt;ol&gt;/gi, "<ol>")
    .replace(/&lt;li&gt;/gi, "<li>")
    .replace(/&lt;blockquote&gt;/gi, "<blockquote>")
    .replace(/&lt;\/(b|strong)&gt;/gi, "</strong>")
    .replace(/&lt;\/(i|em)&gt;/gi, "</em>")
    .replace(/&lt;\/u&gt;/gi, "</u>")
    .replace(/&lt;\/(s|strike|del)&gt;/gi, "</s>")
    .replace(/&lt;\/p&gt;/gi, "</p>")
    .replace(/&lt;\/ul&gt;/gi, "</ul>")
    .replace(/&lt;\/ol&gt;/gi, "</ol>")
    .replace(/&lt;\/li&gt;/gi, "</li>")
    .replace(/&lt;\/blockquote&gt;/gi, "</blockquote>");
}

function sanitizeHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\sjavascript:/gi, "");
}

function HtmlText({ html, className = "" }) {
  if (!html) return null;

  const safeHtml = sanitizeHtml(decodeAllowedHtmlTags(html));

  return (
    <>
      <div
        className={`cv-html-text ${className}`}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />

      <style jsx global>{`
        .cv-html-text p {
          margin: 0 0 6px !important;
        }

        .cv-html-text ul {
          list-style-type: disc !important;
          padding-left: 20px !important;
          margin: 6px 0 !important;
        }

        .cv-html-text ol {
          list-style-type: decimal !important;
          padding-left: 20px !important;
          margin: 6px 0 !important;
        }

        .cv-html-text li {
          display: list-item !important;
          margin: 3px 0 !important;
        }

        .cv-html-text strong,
        .cv-html-text b {
          font-weight: 800 !important;
        }

        .cv-html-text em,
        .cv-html-text i {
          font-style: italic !important;
        }

        .cv-html-text u {
          text-decoration: underline !important;
        }

        .cv-html-text s,
        .cv-html-text strike,
        .cv-html-text del {
          text-decoration: line-through !important;
        }

        .cv-html-text a {
          color: #2563eb !important;
          text-decoration: underline !important;
          font-weight: 700 !important;
        }
          .cv-html-text blockquote {
  margin: 8px 0 !important;
  border-left: 4px solid #18227c !important;
  background: #f8fafc !important;
  padding: 8px 12px !important;
  color: #334155 !important;
  border-radius: 10px !important;
  font-style: italic !important;
}
      `}</style>
    </>
  );
}

function TemplateRenderer({ cv, config }) {
  return <ExactTemplateRenderer cv={cv} config={config} />;
}

function ExactTemplateRenderer({ cv, config }) {
  const layout = config.layout || "clean-ats";

  if (layout === "berlin-side-photo") return <BerlinSidePhotoCV cv={cv} config={config} />;
  if (layout === "eu-photo-document") return <EUPhotoDocumentCV cv={cv} config={config} />;
  if (layout === "corporate-circle-photo") return <CorporateCirclePhotoCV cv={cv} config={config} />;
  if (layout === "creative-blob-photo") return <CreativeBlobPhotoCV cv={cv} config={config} />;
  if (layout === "luxury-oval-photo") return <LuxuryOvalPhotoCV cv={cv} config={config} />;
  if (layout === "london-executive") return <LondonExecutiveCV cv={cv} config={config} />;
  if (layout === "classic-pro") return <ClassicProExactCV cv={cv} config={config} />;
  if (layout === "tech-minimal") return <TechMinimalCV cv={cv} config={config} />;
  if (layout === "graduate-fresh") return <GraduateFreshCV cv={cv} config={config} />;
  if (layout === "formal-uk") return <FormalUKCV cv={cv} config={config} />;
  if (layout === "senior-director") return <SeniorDirectorCV cv={cv} config={config} />;
  if (layout === "admin-professional") return <AdminProfessionalCV cv={cv} config={config} />;
  if (layout === "healthcare-clinical") return <HealthcareClinicalCV cv={cv} config={config} />;
  if (layout === "sales-leader") return <SalesLeaderCV cv={cv} config={config} />;
  if (layout === "finance-analyst") return <FinanceAnalystCV cv={cv} config={config} />;
  if (layout === "stockholm-clean") return <StockholmCleanCV cv={cv} config={config} />;
  if (layout === "dubai-corporate") return <DubaiCorporateCV cv={cv} config={config} />;
  if (layout === "canada-simple") return <CanadaSimpleCV cv={cv} config={config} />;
  if (layout === "academic-scholar") return <AcademicScholarCV cv={cv} config={config} />;
  if (layout === "legal-advisor") return <LegalAdvisorCV cv={cv} config={config} />;
  if (layout === "hospitality-premium") return <HospitalityPremiumCV cv={cv} config={config} />;
  if (layout === "engineer-grid") return <EngineerGridCV cv={cv} config={config} />;
  if (layout === "teacher-friendly") return <TeacherFriendlyCV cv={cv} config={config} />;
  if (layout === "project-manager") return <ProjectManagerCV cv={cv} config={config} />;
  if (layout === "customer-service") return <CustomerServiceCV cv={cv} config={config} />;
  if (layout === "marketing-bold") return <MarketingBoldCV cv={cv} config={config} />;
  if (layout === "hr-professional") return <HRProfessionalCV cv={cv} config={config} />;
  if (layout === "data-analyst") return <DataAnalystCV cv={cv} config={config} />;
  if (layout === "premium-monogram") return <PremiumMonogramCV cv={cv} config={config} />;

  return <CleanATSExactCV cv={cv} config={config} />;
}

function exactDark(config) {
  return config.colors?.find((color) => color !== config.accent) || config.colors?.[1] || "#111827";
}

function ExactPhoto({ cv, config, large = false, light = false }) {
  if (!config.photo) return null;

  const shape = {
    eu: "rounded-md",
    square: "rounded-xl",
    "circle-ring": "rounded-full ring-4 ring-white",
    blob: "rounded-[42%_58%_55%_45%/48%_42%_58%_52%]",
    oval: "rounded-[45%]",
  }[config.photoShape] || "rounded-full";

  return (
    <div
      className={`${large ? "h-32 w-32" : "h-24 w-24"} ${shape} flex shrink-0 items-center justify-center overflow-hidden shadow-sm ring-1 ${light ? "bg-white/15 ring-white/30" : "bg-slate-100 ring-black/10"}`}
      style={{ border: `2px solid ${config.accent}` }}
    >
      {cv.photo ? (
        <img
          src={cv.photo}
          alt={cv.fullName || "Profile"}
          className="h-full w-full object-cover"
          style={{
            transform: `scale(${cv.photoZoom || 1})`,
            objectPosition: `${cv.photoPositionX || 50}% ${cv.photoPositionY || 50}%`,
          }}
        />
      ) : (
        <span className={`text-3xl font-black ${light ? "text-white" : "text-slate-700"}`}>
          {getInitials(cv.fullName)}
        </span>
      )}
    </div>
  );
}

function ExactTitle({ title, accent, light = false }) {
  return (
    <h2
      className="mb-3 border-b pb-2 text-xs font-black uppercase tracking-[0.18em]"
      style={{ color: light ? "#fff" : accent, borderColor: light ? "rgba(255,255,255,.28)" : `${accent}55` }}
    >
      {title}
    </h2>
  );
}


function ExactHeader({ cv, config, label = "Professional CV", centered = false }) {
  return (
    <header className={centered ? "text-center" : ""}>
      <p className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: config.accent }}>{label}</p>
      <h1 className="mt-2 text-5xl font-black leading-tight tracking-[-0.055em] text-black">{cv.fullName || "Your Name"}</h1>
      <p className="mt-2 text-xl font-bold" style={{ color: config.accent }}>{cv.jobTitle || "Professional Title"}</p>
      <ContactLine cv={cv} />
      <ATSBadge cv={cv} accent={config.accent} />
    </header>
  );
}

function ExactSideBlock({ cv, config, light = false }) {
  return (
    <>
      <div>
        <ExactTitle title="Contact" accent={config.accent} light={light} />
        <ContactStack cv={cv} dark={light} />
      </div>
      <SideCVSections cv={cv} accent={config.accent} dark={light} />
    </>
  );
}

function CleanATSExactCV({ cv, config }) {
  return (
    <CVPage>
      <ExactHeader cv={cv} config={config} label="ATS Optimised" />

      <main className="mt-8 space-y-8">
        <MainCVSections cv={cv} accent={config.accent} />
        <SideCVSections cv={cv} accent={config.accent} />
      </main>
    </CVPage>
  );
}

function EUPhotoDocumentCV({ cv, config }) {
  const accent = config?.accent || "#2563EB";

  return (
    <div
      className="cv-a4-template bg-white text-black shadow-2xl font-sans"
      style={{
        width: "794px",
        minHeight: "1123px",
        padding: "32px",
      }}
    >
      <header
        className="mb-5 flex gap-4 border-b pb-4"
        style={{ borderColor: `${accent}55` }}
      >
        <div className="shrink-0">
          <ExactPhoto cv={cv} config={config} large />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="mb-1 text-[10px] font-black uppercase tracking-widest"
            style={{ color: accent }}
          >
            European CV
          </p>

          <h1 className="break-words text-3xl font-black leading-tight text-slate-900">
            {cv?.fullName || "Your Name"}
          </h1>

          <p className="mt-1 text-sm font-bold" style={{ color: accent }}>
            {cv?.jobTitle || "Professional Title"}
          </p>

          <ContactLine cv={cv} />
        </div>
      </header>

      <main className="grid grid-cols-[30%_70%] items-start gap-8">
      <aside className="space-y-5">
  {hasList(cv.skills) ? (
    <CVSection title="Skills" accent={accent}>
      <SkillPills items={cv.skills} levels={cv.skillLevels} />
    </CVSection>
  ) : null}

  {hasList(cv.languages) ? (
    <CVSection title="Languages" accent={accent}>
      <LanguageList items={cv.languages} levels={cv.languageLevels} />
    </CVSection>
  ) : null}

  {hasList(cv.certifications) ? (
    <CVSection title="Certifications" accent={accent}>
      <BulletList items={cv.certifications} />
    </CVSection>
  ) : null}

  {hasList(cv.hobbies) ? (
    <CVSection title="Hobbies" accent={accent}>
      <BulletList items={cv.hobbies} />
    </CVSection>
  ) : null}
</aside>

        <section className="space-y-6">
          {hasText(cv.summary) ? (
            <CVSection title="Professional Summary" accent={accent}>
              <HtmlText html={cv.summary} />
            </CVSection>
          ) : null}

          {hasValidExperience(cv) ? (
            <CVSection title="Work Experience" accent={accent}>
              <ExperienceContent cv={cv} />
            </CVSection>
          ) : null}

          {hasValidEducation(cv) ? (
            <CVSection title="Education" accent={accent}>
              <EducationContent cv={cv} />
            </CVSection>
          ) : null}

          {hasValidProjects(cv) ? (
            <CVSection title="Projects" accent={accent}>
              <ProjectsContent cv={cv} />
            </CVSection>
          ) : null}

          {hasList(cv.achievements) ? (
            <CVSection title="Achievements" accent={accent}>
              <BulletList items={cv.achievements} />
            </CVSection>
          ) : null}

          {hasList(cv.strengths) ? (
            <CVSection title="Strengths" accent={accent}>
              <BulletList items={cv.strengths} />
            </CVSection>
          ) : null}

          {hasText(cv.references) ? (
            <CVSection title="References" accent={accent}>
              <Paragraph text={cv.references} />
            </CVSection>
          ) : null}

          {Array.isArray(cv.additionalSections)
            ? cv.additionalSections.map((section, index) =>
                section?.title || section?.description ? (
                  <CVSection
                    key={index}
                    title={section.title || "Additional Information"}
                    accent={accent}
                  >
                    <HtmlText html={section.description || ""} />
                  </CVSection>
                ) : null
              )
            : null}
        </section>
      </main>
    </div>
  );
}
function BerlinSidePhotoCV({ cv, config }) {
  const dark = exactDark(config);
  return (
    <div id="cv-download" className="grid bg-white text-black shadow-2xl" style={{ width: "794px", minHeight: "1123px", gridTemplateColumns: "285px 509px" }}>
      <aside className="px-8 py-10 text-white" style={{ background: `linear-gradient(180deg, ${dark}, ${config.accent})` }}>
        <ExactPhoto cv={cv} config={config} large light />
        <h1 className="mt-6 text-3xl font-black leading-tight">{cv.fullName || "Your Name"}</h1>
        <p className="mt-2 text-sm font-semibold text-white/75">{cv.jobTitle || "Professional Title"}</p>
        <div className="mt-8 space-y-8"><ExactSideBlock cv={cv} config={config} light /></div>
      </aside>
      <main className="space-y-8 px-10 py-10">
        <section className="rounded-[1.5rem] p-6" style={{ backgroundColor: `${config.accent}12` }}>
          <ExactTitle title="Profile" accent={config.accent} />
          <Paragraph text={cv.summary} />
        </section>
        <MainCVSections cv={cv} accent={config.accent} skipSummary />
      </main>
    </div>
  );
}

function CorporateCirclePhotoCV({ cv, config }) {
  return (
    <CVPage>
      <header className="flex items-center gap-6 border-b pb-7" style={{ borderColor: `${config.accent}45` }}>
        <ExactPhoto cv={cv} config={config} large />
        <div><h1 className="text-5xl font-black tracking-[-0.055em]">{cv.fullName || "Your Name"}</h1><p className="mt-2 text-xl font-bold" style={{ color: config.accent }}>{cv.jobTitle || "Professional Title"}</p><ContactLine cv={cv} /><ATSBadge cv={cv} accent={config.accent} /></div>
      </header>
      <main className="mt-9 grid gap-9 grid-cols-[0.62fr_0.38fr]"><div className="space-y-8"><MainCVSections cv={cv} accent={config.accent} /></div><aside className="rounded-[1.7rem] p-6" style={{ backgroundColor: `${config.accent}10` }}><SideCVSections cv={cv} accent={config.accent} /></aside></main>
    </CVPage>
  );
}

function CreativeBlobPhotoCV({ cv, config }) {
  return (
    <CVPage>
      <header className="rounded-[2rem] p-7" style={{ background: `linear-gradient(135deg, ${config.accent}22, #fff)`, border: `1px solid ${config.accent}25` }}>
        <div className="flex items-center gap-6"><ExactPhoto cv={cv} config={config} large /><div><ExactHeader cv={cv} config={config} label="Creative CV" /></div></div>
      </header>
      <main className="mt-8 grid gap-6 grid-cols-2">
        <section className="rounded-[1.5rem] bg-slate-50 p-6 col-span-2"><MainCVSections cv={cv} accent={config.accent} /></section>
        <section className="rounded-[1.5rem] bg-slate-50 p-6"><SideCVSections cv={cv} accent={config.accent} /></section>
        <section className="rounded-[1.5rem] bg-slate-50 p-6"><MainCVSections cv={cv} accent={config.accent} skipSummary skipExperience /></section>
      </main>
    </CVPage>
  );
}

function LuxuryOvalPhotoCV({ cv, config }) {
  return (
    <CVPage ivory>
      <header className="text-center">
        <div className="flex justify-center">
          <ExactPhoto cv={cv} config={config} large />
        </div>

        <p
          className="mt-4 text-xs font-black uppercase tracking-[0.3em]"
          style={{ color: config.accent }}
        >
          Premium CV
        </p>

        <h1 className="mt-2 font-serif text-5xl font-bold">
          {cv.fullName || "Your Name"}
        </h1>

        <p className="mt-2 text-lg text-black/60">
          {cv.jobTitle || "Professional Title"}
        </p>

        <ContactLine cv={cv} center />

        <div
          className="mx-auto mt-5 h-1 w-24 rounded-full"
          style={{ backgroundColor: config.accent }}
        />
      </header>

      <main className="mt-10 grid gap-10 grid-cols-[0.36fr_0.64fr]">
        <aside className="space-y-8">
          {hasList(cv.skills) ? (
            <CVSection title="Skills" accent={config.accent}>
              <SkillPills items={cv.skills} levels={cv.skillLevels} />
            </CVSection>
          ) : null}

          {hasList(cv.languages) ? (
            <CVSection title="Languages" accent={config.accent}>
              <LanguageList items={cv.languages} levels={cv.languageLevels} />
            </CVSection>
          ) : null}

          {hasList(cv.strengths) ? (
            <CVSection title="Strengths" accent={config.accent}>
              <BulletList items={cv.strengths} />
            </CVSection>
          ) : null}

          {hasList(cv.hobbies) ? (
            <CVSection title="Interests" accent={config.accent}>
              <BulletList items={cv.hobbies} />
            </CVSection>
          ) : null}

          {hasText(cv.references) ? (
            <CVSection title="References" accent={config.accent}>
              <Paragraph text={cv.references} />
            </CVSection>
          ) : null}
        </aside>

        <section className="space-y-8">
          <MainCVSections cv={cv} accent={config.accent} />
        </section>
      </main>
    </CVPage>
  );
}
function GraduateFreshCV({ cv, config }) {
  const accent = config?.accent || "#111827";

  const educationItems = Array.isArray(cv.education) ? cv.education : [];
  const experienceItems = Array.isArray(cv.experience) ? cv.experience : [];

  const hasEducationArray = educationItems.length > 0;
  const hasEducationText =
    typeof cv.education === "string" && cv.education.trim().length > 0;

  const hasExperienceArray = experienceItems.length > 0;
  const hasExperienceText =
    typeof cv.experience === "string" && cv.experience.trim().length > 0;

  const achievements =
    cv.achievements || cv.achievement || cv.awards || cv.accomplishments;

  const certificates =
    cv.certifications ||
    cv.certificates ||
    cv.certificate ||
    cv.courses ||
    cv.training;

  const additionalSections =
    cv.additionalSections ||
    cv.customSections ||
    cv.extraSections ||
    cv.additional ||
    cv.extras;

  return (
    <CVPage>
      {/* 1. Header Section */}
      <header
        className="rounded-[32px] p-8"
        style={{ backgroundColor: `${accent}14` }}
      >
        <h1 className="text-4xl sm:text-5xl font-black tracking-[-0.055em] text-black">
          {cv.fullName || "Your Name"}
        </h1>

        <p className="mt-2 text-lg font-bold" style={{ color: accent }}>
          {cv.jobTitle || "Graduate / Entry Level"}
        </p>

        <div className="mt-4">
          <ContactLine cv={cv} />
        </div>
      </header>

      {/* 2. Main Content Grid (4 Controlled Boxes Structure - Exact Length & Design) */}
      <main className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* ==================== BOX 1: PROFILE, SKILLS & LANGUAGES ==================== */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <CVSection title="Profile" accent={accent}>
            {(hasText(cv.summary) || hasText(cv.profile)) && (
              <Paragraph text={cv.summary || cv.profile} />
            )}

            {hasList(cv.skills) && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                  Skills
                </p>
                <SkillPills items={cv.skills} levels={cv.skillLevels} />
              </div>
            )}

            {hasList(cv.languages) && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                  Languages
                </p>
                <LanguageList
                  items={cv.languages}
                  levels={cv.languageLevels}
                />
              </div>
            )}

            {hasList(cv.strengths) && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                  Strengths
                </p>
                <BulletList items={cv.strengths} />
              </div>
            )}
          </CVSection>
        </section>

        {/* ==================== BOX 2: EDUCATION & CERTIFICATIONS ==================== */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <CVSection title="Education" accent={accent}>
            {(hasEducationArray || hasEducationText) && (
              <>
                {hasEducationArray ? (
                  <div className="relative border-l border-slate-200 ml-2 pl-4 space-y-5 pt-1">
                    {educationItems.map((item, index) => {
                      const eduTitle = item.degree || item.title || item.course || item.qualification || "";
                      const eduPlace = item.school || item.institution || item.university || item.college || "";
                      const eduDate = item.year || item.date || item.period || "";

                      return (
                        <div key={index} className="relative group">
                          {/* Timeline Dot with Accent Color */}
                          <span 
                            className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white transition-transform group-hover:scale-125"
                            style={{ backgroundColor: accent }}
                          />

                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="space-y-0.5">
                              {eduTitle && (
                                <h4 className="text-sm font-black text-slate-950 tracking-tight leading-snug uppercase">
                                  {eduTitle}
                                </h4>
                              )}
                              {eduPlace && (
                                <p className="text-xs font-bold text-slate-600">
                                  {eduPlace}
                                </p>
                              )}
                            </div>

                            {eduDate && (
                              <div className="shrink-0">
                                <span className="inline-block text-[11px] font-black tracking-wide text-slate-800 bg-slate-100/90 border border-slate-200 px-3 py-1 rounded-md shadow-sm">
                                  {eduDate}
                                </span>
                              </div>
                            )}
                          </div>

                          {item.description && (
                            <p className="mt-2 text-xs leading-relaxed text-slate-500 whitespace-pre-line font-medium">
                              {item.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Paragraph text={cv.education} />
                )}
              </>
            )}

            {hasList(certificates) && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                  Certifications
                </p>
                <BulletList items={certificates} />
              </div>
            )}

            {hasText(certificates) && !hasList(certificates) && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                  Certifications
                </p>
                <Paragraph text={certificates} />
              </div>
            )}
          </CVSection>
        </section>

        {/* ==================== BOX 3: WORK EXPERIENCE ==================== */}
        <section className="col-span-1 sm:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <CVSection title="Work Experience" accent={accent}>
            {(hasExperienceArray || hasExperienceText) && (
              <>
                {hasExperienceArray ? (
                  <div className="relative border-l border-slate-200 ml-2 pl-4 space-y-6 pt-1">
                    {experienceItems.map((item, index) => {
                      const expTitle = item.role || item.position || item.title || item.jobTitle || "";
                      const expCompany = item.company || item.employer || item.organization || "";
                      const expDate = item.period || item.date || item.year || "";

                      return (
                        <div key={index} className="relative group">
                          {/* Timeline Dot with Accent Color */}
                          <span 
                            className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white transition-transform group-hover:scale-125"
                            style={{ backgroundColor: accent }}
                          />

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
                            <div className="space-y-0.5">
                              {expTitle && (
                                <h4 className="text-sm font-black text-slate-950 tracking-tight leading-snug uppercase">
                                  {expTitle}
                                </h4>
                              )}
                              {expCompany && (
                                <p className="text-xs font-bold text-slate-600">
                                  {expCompany}
                                </p>
                              )}
                            </div>

                            {expDate && (
                              <div className="shrink-0 sm:text-right">
                                <span className="inline-block text-[11px] font-black tracking-wide text-slate-800 bg-slate-100/90 border border-slate-200 px-3 py-1 rounded-md shadow-sm">
                                  {expDate}
                                </span>
                              </div>
                            )}
                          </div>

                          {item.description && (
                            <p className="mt-2 text-xs leading-relaxed text-slate-500 whitespace-pre-line font-medium pl-0.5">
                              {item.description}
                            </p>
                          )}

                          {Array.isArray(item.bullets) && item.bullets.length > 0 ? (
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-600 font-medium">
                              {item.bullets.map((bullet, bulletIndex) => (
                                <li key={bulletIndex}>{bullet}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Paragraph text={cv.experience} />
                )}
              </>
            )}
          </CVSection>
        </section>

        {/* ==================== BOX 4: ACHIEVEMENTS, HOBBIES & REFERENCES ==================== */}
        <section className="col-span-1 sm:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Left Column: Achievements & Hobbies */}
            <div className="space-y-5">
              {hasList(achievements) && (
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                    Achievements
                  </p>
                  <BulletList items={achievements} />
                </div>
              )}

              {hasText(achievements) && !hasList(achievements) && (
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                    Achievements
                  </p>
                  <Paragraph text={achievements} />
                </div>
              )}

              {hasList(cv.hobbies) && (
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                    Hobbies & Interests
                  </p>
                  <BulletList items={cv.hobbies} />
                </div>
              )}

              {hasList(cv.interests) && !hasList(cv.hobbies) && (
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                    Interests
                  </p>
                  <BulletList items={cv.interests} />
                </div>
              )}
            </div>

            {/* Right Column: References & Additional Sections */}
            <div className="space-y-5">
              {hasText(cv.references) && (
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                    References
                  </p>
                  <Paragraph text={cv.references} />
                </div>
              )}

              {Array.isArray(additionalSections) && additionalSections.length > 0 && 
                additionalSections.map((section, index) => {
                  const sectionTitle = section?.title || section?.heading || "Additional Information";
                  const sectionContent = section?.content || section?.description || section?.text || section?.items || "";

                  return (
                    <div key={index}>
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                        {sectionTitle}
                      </p>
                      {Array.isArray(sectionContent) ? (
                        <BulletList items={sectionContent} />
                      ) : (
                        <Paragraph text={String(sectionContent || "")} />
                      )}
                    </div>
                  );
              })}

              {!Array.isArray(additionalSections) && additionalSections && typeof additionalSections === "object" && (
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                    {additionalSections.title || additionalSections.heading || "Additional Information"}
                  </p>
                  <Paragraph text={String(additionalSections.content || additionalSections.description || additionalSections.text || "")} />
                </div>
              )}

              {typeof additionalSections === "string" && additionalSections.trim().length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                    Additional Information
                  </p>
                  <Paragraph text={additionalSections} />
                </div>
              )}
            </div>

          </div>
        </section>

      </main>
    </CVPage>
  );
}
function LondonExecutiveCV({ cv, config }) {
  return (
    <div className="overflow-hidden bg-white text-black shadow-2xl" style={{ width: "794px", minHeight: "1123px" }}>
      <header className="px-10 py-12 text-white" style={{ background: `linear-gradient(135deg, ${exactDark(config)}, #020617)` }}><p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: config.accent }}>Executive Profile</p><h1 className="mt-3 text-5xl font-black tracking-[-0.055em]">{cv.fullName || "Your Name"}</h1><p className="mt-3 text-xl font-semibold text-white/70">{cv.jobTitle || "Professional Title"}</p><ContactLine cv={cv} dark /><div className="mt-6 h-1.5 w-24 rounded-full" style={{ backgroundColor: config.accent }} /></header>
      <main className="grid gap-10 px-10 py-10 grid-cols-[0.36fr_0.64fr]"><aside className="space-y-8"><SideCVSections cv={cv} accent={config.accent} /></aside><section className="space-y-8"><MainCVSections cv={cv} accent={config.accent} /></section></main>
    </div>
  );
}

function ClassicProExactCV({ cv, config }) {
  return (
    <CVPage>
      <header className="text-center">
        <h1 className="font-serif text-5xl font-bold">
          {cv.fullName || "Your Name"}
        </h1>

        <p
          className="mt-2 text-sm font-black uppercase tracking-[0.22em]"
          style={{ color: config.accent }}
        >
          {cv.jobTitle || "Professional Title"}
        </p>

        <ContactLine cv={cv} />
      </header>

      <div
        className="my-8 h-px"
        style={{ backgroundColor: config.accent }}
      />

      <main className="space-y-8">
        <MainCVSections cv={cv} accent={config.accent} />
        <SideCVSections cv={cv} accent={config.accent} />
      </main>
    </CVPage>
  );
}

function TechMinimalCV({ cv, config }) {
  return <CVPage><header className="rounded-[1.7rem] bg-slate-950 p-8 text-white"><p className="font-mono text-xs" style={{ color: config.accent }}>const candidate =</p><h1 className="mt-2 font-mono text-5xl font-black tracking-[-0.055em]">{cv.fullName || "Your Name"}</h1><p className="mt-2 text-lg text-white/65">{cv.jobTitle || "Professional Title"}</p><ContactLine cv={cv} dark /></header><main className="mt-9 grid gap-9 grid-cols-[0.58fr_0.42fr]"><section className="space-y-8"><MainCVSections cv={cv} accent={config.accent} /></section><aside className="space-y-8"><SideCVSections cv={cv} accent={config.accent} /></aside></main></CVPage>;
}


function FormalUKCV({ cv, config }) {
  return (
    <CVPage>
      <header
        className="border-4 p-7 text-center"
        style={{ borderColor: config.accent }}
      >
        <h1 className="text-4xl font-bold uppercase tracking-[0.12em]">
          {cv.fullName || "Your Name"}
        </h1>

        <p className="mt-2 text-base text-black/60">
          {cv.jobTitle || "Professional Title"}
        </p>

        <ContactLine cv={cv} center />
      </header>

      <main className="mt-9 grid grid-cols-[0.34fr_0.66fr] gap-8">
        <aside className="space-y-7">
          {hasList(cv.skills) ? (
            <CVSection title="Skills" accent={config.accent}>
              <SkillPills items={cv.skills} levels={cv.skillLevels} />
            </CVSection>
          ) : null}

          {hasList(cv.languages) ? (
            <CVSection title="Languages" accent={config.accent}>
              <LanguageList
                items={cv.languages}
                levels={cv.languageLevels}
              />
            </CVSection>
          ) : null}

          {hasList(cv.strengths) ? (
            <CVSection title="Strengths" accent={config.accent}>
              <BulletList items={cv.strengths} />
            </CVSection>
          ) : null}

          {hasList(cv.hobbies) ? (
            <CVSection title="Hobbies & Interests" accent={config.accent}>
              <BulletList items={cv.hobbies} />
            </CVSection>
          ) : null}

          {hasText(cv.references) ? (
            <CVSection title="References" accent={config.accent}>
              <Paragraph text={cv.references} />
            </CVSection>
          ) : null}
        </aside>

        <section className="space-y-8">
          <MainCVSections cv={cv} accent={config.accent} />
        </section>
      </main>
    </CVPage>
  );
}

function SeniorDirectorCV({ cv, config }) {
  return <div className="overflow-hidden bg-white text-black shadow-2xl" style={{ width: "794px", minHeight: "1123px" }}><div className="h-5" style={{ backgroundColor: config.accent }} /><div className="p-12"><h1 className="text-6xl font-black tracking-[-0.06em]">{cv.fullName || "Your Name"}</h1><p className="mt-2 text-sm font-black uppercase tracking-[0.22em]" style={{ color: config.accent }}>{cv.jobTitle || "Professional Title"}</p><ContactLine cv={cv} /><main className="mt-10 grid gap-10 grid-cols-[0.40fr_0.60fr]"><aside><SideCVSections cv={cv} accent={config.accent} /></aside><section className="space-y-8"><MainCVSections cv={cv} accent={config.accent} /></section></main></div></div>;
}

function AdminProfessionalCV({ cv, config }) {
  return <CVPage><header className="flex items-stretch"><div className="w-3 rounded-full" style={{ backgroundColor: config.accent }} /><div className="pl-6"><h1 className="text-5xl font-black tracking-[-0.055em]">{cv.fullName || "Your Name"}</h1><p className="mt-2 text-lg text-black/60">{cv.jobTitle || "Professional Title"}</p><ContactLine cv={cv} /></div></header><main className="mt-9 space-y-8"><section className="border-l-4 pl-6" style={{ borderColor: config.accent }}><MainCVSections cv={cv} accent={config.accent} /></section><SideCVSections cv={cv} accent={config.accent} /></main></CVPage>;
}

function HealthcareClinicalCV({ cv, config }) {
  return <CVPage><header className="flex items-center justify-between border-b pb-7" style={{ borderColor: `${config.accent}40` }}><div><ExactHeader cv={cv} config={config} label="Clinical CV" /></div><div className="flex h-20 w-20 items-center justify-center rounded-full text-4xl font-black text-white" style={{ backgroundColor: config.accent }}>+</div></header><main className="mt-9 grid gap-9 grid-cols-[0.60fr_0.40fr]"><section className="space-y-8"><MainCVSections cv={cv} accent={config.accent} /></section><aside className="rounded-[1.7rem] p-6" style={{ backgroundColor: `${config.accent}12` }}><SideCVSections cv={cv} accent={config.accent} /></aside></main></CVPage>;
}

function SalesLeaderCV({ cv, config }) {
  return (
    <CVPage>
      <header
        className="rounded-[1.8rem] p-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${config.accent}, ${exactDark(config)})`,
        }}
      >
        <h1 className="text-5xl font-black tracking-[-0.055em]">
          {cv.fullName || "Your Name"}
        </h1>

        <p className="mt-2 text-lg text-white/75">
          {cv.jobTitle || "Professional Title"}
        </p>

        <ContactLine cv={cv} dark />
      </header>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="rounded-xl bg-slate-50 p-4">
          <b className="text-2xl">128%</b>
          <p className="text-xs">Target</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <b className="text-2xl">42</b>
          <p className="text-xs">Clients</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <b className="text-2xl">£2M</b>
          <p className="text-xs">Pipeline</p>
        </div>
      </div>

      <main className="mt-8 space-y-8">
        <MainCVSections cv={cv} accent={config.accent} />

        <SideCVSections cv={cv} accent={config.accent} />
      </main>
    </CVPage>
  );
}

function FinanceAnalystCV({ cv, config }) {
  return <CVPage><ExactHeader cv={cv} config={config} label="Finance CV" /><div className="mt-8 grid h-28 grid-cols-5 items-end gap-2">{[35,55,45,70,60].map((height, index) => <div key={index} className="rounded-t" style={{ height: `${height}%`, backgroundColor: config.accent }} />)}</div><main className="mt-9 grid gap-9 grid-cols-[0.58fr_0.42fr]"><section className="space-y-8"><MainCVSections cv={cv} accent={config.accent} /></section><aside><SideCVSections cv={cv} accent={config.accent} /></aside></main></CVPage>;
}

function StockholmCleanCV({ cv, config }) {
  return (
    <CVPage>
      <header className="flex justify-between">
        <div>
          <h1 className="text-5xl font-light tracking-[-0.055em]">
            {cv.fullName || "Your Name"}
          </h1>

          <p
            className="mt-2 text-lg font-bold"
            style={{ color: config.accent }}
          >
            {cv.jobTitle || "Professional Title"}
          </p>

          <ContactLine cv={cv} />
        </div>

        <div
          className="h-24 w-24 rounded-full"
          style={{ backgroundColor: `${config.accent}18` }}
        />
      </header>

      <main className="mt-10 space-y-8">
        <MainCVSections cv={cv} accent={config.accent} />

        <SideCVSections cv={cv} accent={config.accent} />
      </main>
    </CVPage>
  );
}

function DubaiCorporateCV({ cv, config }) {
  return <div className="overflow-hidden bg-white text-black shadow-2xl" style={{ width: "794px", minHeight: "1123px" }}><header className="p-10 text-right text-white" style={{ backgroundColor: exactDark(config) }}><p className="text-xs uppercase tracking-[0.3em]" style={{ color: config.accent }}>Corporate Profile</p><h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">{cv.fullName || "Your Name"}</h1><p className="mt-2 text-lg text-white/70">{cv.jobTitle || "Professional Title"}</p><ContactLine cv={cv} dark /></header><main className="grid gap-10 p-10 grid-cols-[0.34fr_0.66fr]"><aside><SideCVSections cv={cv} accent={config.accent} /></aside><section className="space-y-8"><MainCVSections cv={cv} accent={config.accent} /></section></main></div>;
}

function CanadaSimpleCV({ cv, config }) {
  return <CVPage><header className="border-l-[14px] pl-6" style={{ borderColor: config.accent }}><h1 className="text-5xl font-black tracking-[-0.055em]">{cv.fullName || "Your Name"}</h1><p className="mt-2 text-lg text-black/60">{cv.jobTitle || "Professional Title"}</p><ContactLine cv={cv} /></header><main className="mt-9 space-y-8"><MainCVSections cv={cv} accent={config.accent} /><SideCVSections cv={cv} accent={config.accent} /></main></CVPage>;
}
function AcademicScholarCV({ cv, config }) {
  return (
    <CVPage>
      <header>
        <p
          className="text-xs uppercase tracking-[0.3em]"
          style={{ color: config.accent }}
        >
          Curriculum Vitae
        </p>

        <h1 className="mt-2 font-serif text-5xl font-bold">
          {cv.fullName || "Your Name"}
        </h1>

        <p className="mt-2 text-lg text-black/60">
          {cv.jobTitle || "Professional Title"}
        </p>

        <ContactLine cv={cv} />
      </header>

      <main className="mt-9 space-y-8">
        <MainCVSections cv={cv} accent={config.accent} />

        <SideCVSections cv={cv} accent={config.accent} />

        <CVSection title="Publications" accent={config.accent}>
          <Paragraph text="Add publications, conference talks or research outputs in Additional Sections." />
        </CVSection>
      </main>
    </CVPage>
  );
}

function LegalAdvisorCV({ cv, config }) {
  return (
    <CVPage>
      <header className="text-center">
        <div
          className="mx-auto mb-4 h-20 w-20 rounded-full border-4"
          style={{ borderColor: config.accent }}
        />

        <h1 className="font-serif text-5xl font-bold">
          {cv.fullName || "Your Name"}
        </h1>

        <p
          className="mt-2 text-sm uppercase tracking-[0.22em]"
          style={{ color: config.accent }}
        >
          {cv.jobTitle || "Professional Title"}
        </p>

        <ContactLine cv={cv} />
      </header>

      <main className="mt-9 space-y-8">
        <MainCVSections cv={cv} accent={config.accent} />

        <SideCVSections cv={cv} accent={config.accent} />
      </main>
    </CVPage>
  );
}
function HospitalityPremiumCV({ cv, config }) {
  return <CVPage ivory><header className="rounded-t-[2rem] p-8 text-white" style={{ backgroundColor: config.accent }}><h1 className="text-5xl font-black tracking-[-0.055em]">{cv.fullName || "Your Name"}</h1><p className="mt-2 text-lg text-white/80">{cv.jobTitle || "Professional Title"}</p><ContactLine cv={cv} dark /></header><main className="mt-9 grid gap-9 grid-cols-[0.58fr_0.42fr]"><section className="space-y-8"><MainCVSections cv={cv} accent={config.accent} /></section><aside><SideCVSections cv={cv} accent={config.accent} /></aside></main></CVPage>;
}
function EngineerGridCV({ cv, config }) {
  return (
    <CVPage>
      <header className="grid grid-cols-[0.70fr_0.30fr] gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-[-0.055em]">
            {cv.fullName || "Your Name"}
          </h1>

          <p className="mt-2 text-lg" style={{ color: config.accent }}>
            {cv.jobTitle || "Professional Title"}
          </p>

          <ContactLine cv={cv} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <span
              key={index}
              className="rounded-xl"
              style={{
                backgroundColor: `${config.accent}${index % 2 ? "22" : "55"}`,
              }}
            />
          ))}
        </div>
      </header>

      <main className="mt-9 grid gap-6 grid-cols-2">
        {/* Block 1: Main content only */}
        <section className="rounded-2xl border p-6 col-span-2">
          <div className="space-y-8">
            {hasText(cv.summary) ? (
              <CVSection title="Professional Summary" accent={config.accent}>
                <Paragraph text={cv.summary} />
              </CVSection>
            ) : null}

            {hasValidExperience(cv) ? (
              <CVSection title="Work Experience" accent={config.accent}>
                <ExperienceContent cv={cv} />
              </CVSection>
            ) : null}
          </div>
        </section>

        {/* Block 2: Side content */}
        <aside className="rounded-2xl border p-6">
          <SideCVSections cv={cv} accent={config.accent} />
        </aside>

        {/* Block 3: Extra main content only, no duplicate summary/experience */}
        <section className="rounded-2xl border p-6">
          <div className="space-y-8">
            {hasValidEducation(cv) ? (
              <CVSection title="Education" accent={config.accent}>
                <EducationContent cv={cv} />
              </CVSection>
            ) : null}

            {hasValidProjects(cv) ? (
              <CVSection title="Projects" accent={config.accent}>
                <ProjectsContent cv={cv} />
              </CVSection>
            ) : null}

            {hasList(cv.achievements) ? (
              <CVSection title="Achievements" accent={config.accent}>
                <BulletList items={cv.achievements} />
              </CVSection>
            ) : null}

            {hasValidCertifications(cv) ? (
              <CVSection title="Certifications" accent={config.accent}>
                <CertificationContent cv={cv} />
              </CVSection>
            ) : null}

            <AdditionalSectionsContent cv={cv} accent={config.accent} />
          </div>
        </section>
      </main>
    </CVPage>
  );
}

function TeacherFriendlyCV({ cv, config }) {
  return <CVPage><header className="rounded-[1.8rem] p-8" style={{ backgroundColor: `${config.accent}16` }}><ExactHeader cv={cv} config={config} label="Education CV" /></header><main className="mt-9"><section className="rounded-[1.5rem] border-l-8 p-7" style={{ borderColor: config.accent }}><MainCVSections cv={cv} accent={config.accent} /></section><aside className="mt-8"><SideCVSections cv={cv} accent={config.accent} /></aside></main></CVPage>;
}

function ProjectManagerCV({ cv, config }) {
  return <CVPage><ExactHeader cv={cv} config={config} label="Project CV" /><main className="mt-9 grid gap-9 grid-cols-[0.30fr_0.70fr]"><aside>{["Plan", "Build", "Lead"].map((item) => <div key={item} className="mb-3 rounded-xl p-4 text-sm font-black text-white" style={{ backgroundColor: config.accent }}>{item}</div>)}<SideCVSections cv={cv} accent={config.accent} /></aside><section className="space-y-8"><MainCVSections cv={cv} accent={config.accent} /></section></main></CVPage>;
}

function CustomerServiceCV({ cv, config }) {
  return <CVPage><header className="flex items-center gap-6"><div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] text-4xl text-white" style={{ backgroundColor: config.accent }}>★</div><div><h1 className="text-5xl font-black tracking-[-0.055em]">{cv.fullName || "Your Name"}</h1><p className="mt-2 text-lg text-black/60">{cv.jobTitle || "Professional Title"}</p><ContactLine cv={cv} /></div></header><main className="mt-9"><section className="rounded-[1.7rem] bg-slate-50 p-7"><MainCVSections cv={cv} accent={config.accent} /></section><aside className="mt-8"><SideCVSections cv={cv} accent={config.accent} /></aside></main></CVPage>;
}

function MarketingBoldCV({ cv, config }) {
  return <div className="overflow-hidden bg-white text-black shadow-2xl" style={{ width: "794px", minHeight: "1123px" }}><header className="p-10 text-white" style={{ background: `linear-gradient(135deg, ${config.accent}, #fff)` }}><p className="text-xs font-black uppercase tracking-[0.3em]">Marketing</p><h1 className="mt-2 text-6xl font-black tracking-[-0.06em]">{cv.fullName || "Your Name"}</h1><p className="mt-2 text-lg text-white/80">{cv.jobTitle || "Professional Title"}</p><ContactLine cv={cv} dark /></header><main className="grid gap-9 p-10 grid-cols-[0.62fr_0.38fr]"><section className="space-y-8"><MainCVSections cv={cv} accent={config.accent} /></section><aside><SideCVSections cv={cv} accent={config.accent} /></aside></main></div>;
}

function HRProfessionalCV({ cv, config }) {
  return <CVPage><header className="rounded-[1.5rem] border-2 p-7" style={{ borderColor: config.accent }}><h1 className="text-5xl font-black tracking-[-0.055em]">{cv.fullName || "Your Name"}</h1><p className="mt-2 text-lg" style={{ color: config.accent }}>{cv.jobTitle || "Professional Title"}</p><ContactLine cv={cv} /></header><main className="mt-9 grid gap-9 grid-cols-[0.45fr_0.55fr]"><aside><SideCVSections cv={cv} accent={config.accent} /></aside><section className="space-y-8"><MainCVSections cv={cv} accent={config.accent} /></section></main></CVPage>;
}

function DataAnalystCV({ cv, config }) {
  return <CVPage><ExactHeader cv={cv} config={config} label="Data CV" /><div className="mt-7 grid grid-cols-4 gap-3">{["SQL", "BI", "KPI", "ETL"].map((item) => <div key={item} className="rounded-xl p-4 text-center text-sm font-black" style={{ backgroundColor: `${config.accent}18`, color: config.accent }}>{item}</div>)}</div><main className="mt-9 space-y-8"><MainCVSections cv={cv} accent={config.accent} /><SideCVSections cv={cv} accent={config.accent} /></main></CVPage>;
}

function PremiumMonogramCV({ cv, config }) {
  const initials = getInitials(cv.fullName) || "CV";
  return <CVPage ivory><header className="text-center"><div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 font-serif text-4xl font-bold" style={{ borderColor: config.accent, color: config.accent }}>{initials}</div><h1 className="mt-5 font-serif text-5xl font-bold">{cv.fullName || "Your Name"}</h1><p className="mt-2 text-lg text-black/60">{cv.jobTitle || "Professional Title"}</p><ContactLine cv={cv} /></header><main className="mt-10 grid gap-10 grid-cols-[0.36fr_0.64fr]"><aside><SideCVSections cv={cv} accent={config.accent} /></aside><section className="space-y-8"><MainCVSections cv={cv} accent={config.accent} /></section></main></CVPage>;
}

function ATSTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <CVPage>
      <header className="border-b pb-6" style={{ borderColor: `${accent}55` }}>
        <h1 className="text-5xl font-black tracking-[-0.05em]">
          {cv.fullName || "Your Name"}
        </h1>

        <p className="mt-2 text-xl font-bold" style={{ color: accent }}>
          {cv.jobTitle || "Professional Title"}
        </p>

        <ContactLine cv={cv} />
        <ATSBadge cv={cv} accent={accent} />
      </header>

      <main className="mt-8 space-y-8">
        <MainCVSections cv={cv} accent={accent} />
      </main>
    </CVPage>
  );
}

function ModernTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <div
      id="cv-download"
      className="grid shrink-0 bg-white text-black shadow-2xl"
      style={{
        width: "794px",
        minHeight: "1123px",
        gridTemplateColumns: "270px 524px",
      }}
    >
      <aside
        className="flex flex-col px-8 py-10 text-white"
        style={{ backgroundColor: accent }}
      >
        <ProfilePhoto cv={cv} accent={accent} dark />

        <h1 className="mt-6 text-3xl font-black leading-tight">
          {cv.fullName || "Your Name"}
        </h1>

        <p className="mt-2 text-sm font-semibold text-white/75">
          {cv.jobTitle || "Professional Title"}
        </p>

        <div className="mt-8">
          <SmallTitle title="Contact" dark />
          <ContactStack cv={cv} dark />
        </div>

        <SideCVSections cv={cv} dark accent={accent} />
      </aside>

      <main className="space-y-8 px-10 py-10">
        <MainCVSections cv={cv} accent={accent} />
      </main>
    </div>
  );
}

function ExecutiveTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <div
      className="overflow-hidden bg-white text-black shadow-2xl"
      style={{ width: "794px", minHeight: "1123px" }}
    >
      <div className="bg-neutral-950 px-10 py-12 text-white">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-white/45">
          Executive CV
        </p>

        <h1 className="mt-3 text-5xl font-black tracking-[-0.055em]">
          {cv.fullName || "Your Name"}
        </h1>

        <p className="mt-3 text-xl font-semibold text-white/70">
          {cv.jobTitle || "Professional Title"}
        </p>

        <ContactLine cv={cv} dark />

        <div
          className="mt-6 h-1.5 w-24 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </div>

      <div className="grid gap-10 px-10 py-10 grid-cols-[0.36fr_0.64fr]">
        <aside className="space-y-8">
          <SideCVSections cv={cv} accent={accent} />
        </aside>

        <main className="space-y-8">
          <MainCVSections cv={cv} accent={accent} />
        </main>
      </div>
    </div>
  );
}

function CreativeTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <CVPage>
      <header
        className="flex gap-6 rounded-[2rem] p-7"
        style={{ backgroundColor: `${accent}15` }}
      >
        <ProfilePhoto cv={cv} accent={accent} rounded />

        <div className="min-w-0">
          <p
            className="text-xs font-black uppercase tracking-[0.25em]"
            style={{ color: accent }}
          >
            Creative Portfolio CV
          </p>

          <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
            {cv.fullName || "Your Name"}
          </h1>

          <p className="mt-2 text-xl font-bold" style={{ color: accent }}>
            {cv.jobTitle || "Professional Title"}
          </p>

          <ContactLine cv={cv} />
        </div>
      </header>

      <main className="mt-10 grid gap-9 grid-cols-[0.62fr_0.38fr]">
        <div className="space-y-8">
          <MainCVSections cv={cv} accent={accent} />
        </div>

        <aside className="space-y-8 rounded-[1.8rem] border border-black/5 bg-black/[0.025] p-6">
          <SideCVSections cv={cv} accent={accent} />
        </aside>
      </main>
    </CVPage>
  );
}

function PhotoHeaderTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <CVPage>
      <header
        className="flex gap-6 border-b pb-8"
        style={{ borderColor: `${accent}40` }}
      >
        <ProfilePhoto cv={cv} accent={accent} />

        <div className="min-w-0">
          <p
            className="text-xs font-black uppercase tracking-[0.25em]"
            style={{ color: accent }}
          >
            Professional CV
          </p>

          <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
            {cv.fullName || "Your Name"}
          </h1>

          <p className="mt-2 text-xl font-bold" style={{ color: accent }}>
            {cv.jobTitle || "Professional Title"}
          </p>

          <ContactLine cv={cv} />
        </div>
      </header>

      <main className="mt-9 space-y-8">
        <MainCVSections cv={cv} accent={accent} />
      </main>
    </CVPage>
  );
}

function EuropassTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <div
      className="grid bg-white text-black shadow-2xl"
      style={{
        width: "794px",
        minHeight: "1123px",
        gridTemplateColumns: "260px 534px",
      }}
    >
      <aside className="bg-slate-100 px-7 py-10">
        <ProfilePhoto cv={cv} accent={accent} square />

        <h1 className="mt-6 text-3xl font-black leading-tight">
          {cv.fullName || "Your Name"}
        </h1>

        <p className="mt-2 text-sm font-bold" style={{ color: accent }}>
          {cv.jobTitle || "Professional Title"}
        </p>

        <div className="mt-8">
          <SmallTitle title="Contact" />
          <ContactStack cv={cv} />
        </div>

        <SideCVSections cv={cv} accent={accent} />
      </aside>

      <main className="space-y-8 px-10 py-10">
        <p
          className="text-xs font-black uppercase tracking-[0.25em]"
          style={{ color: accent }}
        >
          European / International CV Format
        </p>
        <MainCVSections cv={cv} accent={accent} />
      </main>
    </div>
  );
}

function LuxuryTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <CVPage ivory>
      <header className="text-center">
        <div className="flex justify-center">
          <ProfilePhoto cv={cv} accent={accent} rounded />
        </div>

        <p
          className="mt-5 text-xs font-black uppercase tracking-[0.3em]"
          style={{ color: accent }}
        >
          Premium CV
        </p>

        <h1 className="mt-3 font-serif text-5xl font-bold">
          {cv.fullName || "Your Name"}
        </h1>

        <p className="mt-3 text-xl font-semibold text-black/65">
          {cv.jobTitle || "Professional Title"}
        </p>

        <ContactLine cv={cv} />

        <div
          className="mx-auto mt-5 h-1 w-24 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </header>

      <main className="mt-10 space-y-8">
        <MainCVSections cv={cv} accent={accent} />
      </main>
    </CVPage>
  );
}

function ClassicTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <CVPage>
      <header className="text-center">
        <h1 className="font-serif text-5xl font-bold">
          {cv.fullName || "Your Name"}
        </h1>

        <p
          className="mt-2 text-lg font-bold uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          {cv.jobTitle || "Professional Title"}
        </p>

        <ContactLine cv={cv} />

        <div
          className="mx-auto mt-5 h-px w-full"
          style={{ backgroundColor: `${accent}55` }}
        />
      </header>

      <main className="mt-8 space-y-8">
        <MainCVSections cv={cv} accent={accent} />
      </main>
    </CVPage>
  );
}

function TimelineTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <CVPage>
      <header>
        <h1 className="text-5xl font-black tracking-[-0.05em]">
          {cv.fullName || "Your Name"}
        </h1>
        <p className="mt-2 text-xl font-bold" style={{ color: accent }}>
          {cv.jobTitle || "Professional Title"}
        </p>
        <ContactLine cv={cv} />
      </header>

      <main className="mt-9 space-y-8">
        {hasText(cv.summary) ? (
          <CVSection title="Professional Summary" accent={accent}>
            <Paragraph text={cv.summary} />
          </CVSection>
        ) : null}

        {hasValidExperience(cv) ? (
          <CVSection title="Career Timeline" accent={accent}>
            <div className="space-y-6 border-l-2 pl-6" style={{ borderColor: accent }}>
              <ExperienceContent cv={cv} timeline accent={accent} />
            </div>
          </CVSection>
        ) : null}

        <MainCVSections cv={cv} accent={accent} skipSummary skipExperience />
      </main>
    </CVPage>
  );
}

function CVPage({ children, ivory = false }) {
  return (
    <div
      className={`px-12 py-12 text-black shadow-2xl ${
        ivory ? "bg-[#FBF7EF]" : "bg-white"
      }`}
      style={{ width: "794px", minHeight: "1123px" }}
    >
      {children}
    </div>
  );
}

function MainCVSections({
  cv,
  accent,
  skipSummary = false,
  skipExperience = false,
}) {
  return (
    <>
      {!skipSummary && hasText(cv.summary) ? (
        <CVSection title="Professional Summary" accent={accent}>
          <HtmlText html={cv.summary} />
        </CVSection>
      ) : null}

      {!skipExperience && hasValidExperience(cv) ? (
        <CVSection title="Work Experience" accent={accent}>
          <ExperienceContent cv={cv} />
        </CVSection>
      ) : null}

      {hasValidEducation(cv) ? (
        <CVSection title="Education" accent={accent}>
          <EducationContent cv={cv} />
        </CVSection>
      ) : null}

      {hasValidProjects(cv) ? (
        <CVSection title="Projects" accent={accent}>
          <ProjectsContent cv={cv} />
        </CVSection>
      ) : null}

      {hasList(cv.achievements) ? (
        <CVSection title="Achievements" accent={accent}>
          <BulletList items={cv.achievements} />
        </CVSection>
      ) : null}

      {hasValidCertifications(cv) ? (
        <CVSection title="Certifications" accent={accent}>
          <CertificationContent cv={cv} />
        </CVSection>
      ) : null}

      {hasValidAdditionalSections(cv) ? (
        <AdditionalSectionsContent cv={cv} accent={accent} />
      ) : null}
    </>
  );
}

function AdditionalSectionsContent({ cv, accent }) {
  const items = Array.isArray(cv.additionalSections)
    ? cv.additionalSections.filter(
        (item) => hasText(item.title) || hasText(item.description)
      )
    : [];

  return (
    <>
      {items.map((item, index) => (
        <CVSection
          key={`${item.title || "section"}-${index}`}
          title={item.title || "Additional Information"}
          accent={accent}
        >
          <Paragraph text={item.description} />
        </CVSection>
      ))}
    </>
  );
}
function SideCVSections({ cv, accent = "#111827", dark = false }) {
  return (
    <>
      {hasList(cv.skills) ? (
        <SideSection title="Skills" accent={accent} dark={dark}>
          <SkillPills
            items={cv.skills}
            levels={cv.skillLevels}
            dark={dark}
            accent={accent}
          />
        </SideSection>
      ) : null}

      {hasList(cv.languages) ? (
        <SideSection title="Languages" accent={accent} dark={dark}>
          <LanguageList
            items={cv.languages}
            levels={cv.languageLevels}
            dark={dark}
          />
        </SideSection>
      ) : null}

      {hasList(cv.strengths) ? (
        <SideSection title="Strengths" accent={accent} dark={dark}>
          <BulletList items={cv.strengths} dark={dark} />
        </SideSection>
      ) : null}

      {hasList(cv.hobbies) ? (
        <SideSection title="Interests" accent={accent} dark={dark}>
          <BulletList items={cv.hobbies} dark={dark} />
        </SideSection>
      ) : null}

      {hasText(cv.references) ? (
        <SideSection title="References" accent={accent} dark={dark}>
          <Paragraph text={cv.references} dark={dark} />
        </SideSection>
      ) : null}
    </>
  );
}

function CVSection({ title, children, accent }) {
  return (
    <section>
      <h2
        className="text-sm font-black uppercase tracking-[0.22em]"
        style={{ color: accent }}
      >
        {title}
      </h2>

      <div
        className="mt-3 h-px w-full"
        style={{ backgroundColor: `${accent}35` }}
      />

      <div className="mt-4">{children}</div>
    </section>
  );
}

function ExperienceContent({ cv, timeline = false, accent = "#111827" }) {
  const items = Array.isArray(cv.experiences)
    ? cv.experiences.filter(
        (item) =>
          hasText(item.jobTitle) ||
          hasText(item.company) ||
          hasText(item.location) ||
          hasText(item.description)
      )
    : [];

  if (!items.length) {
    return hasText(cv.experience) ? <Paragraph text={cv.experience} /> : null;
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index} className="relative">
          {timeline ? (
            <span
              className="absolute -left-[31px] top-2 h-3 w-3 rounded-full"
              style={{ backgroundColor: accent }}
            />
          ) : null}

          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-black">
                {item.jobTitle || "Job Title"}
              </h3>

              <p className="text-sm font-semibold text-black/55">
                {[item.company, item.location].filter(Boolean).join(", ")}
              </p>
            </div>

            {formatDateRange(item.startDate, item.endDate, item.current) ? (
              <p className="whitespace-nowrap text-sm font-bold text-black/45">
                {formatDateRange(item.startDate, item.endDate, item.current)}
              </p>
            ) : null}
          </div>

          {hasText(item.description) ? (
     <HtmlText
  html={item.description}
  className="mt-3 text-sm leading-6 text-slate-700"
/>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function EducationContent({ cv }) {
  const items = Array.isArray(cv.educations)
    ? cv.educations.filter(
        (item) =>
          hasText(item.degree) ||
          hasText(item.institution) ||
          hasText(item.description)
      )
    : [];

  if (!items.length) {
    return hasText(cv.education) ? <Paragraph text={cv.education} /> : null;
  }

  return (
    <div className="space-y-5">
      {items.map((item, index) => (
        <div key={index}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-black">
                {item.degree || "Degree"}
              </h3>

              <p className="text-sm font-semibold text-black/55">
                {[item.institution, item.location].filter(Boolean).join(", ")}
              </p>
            </div>

            {[item.startDate, item.endDate].filter(Boolean).length > 0 ? (
              <p className="whitespace-nowrap text-sm font-bold text-black/45">
                {[item.startDate, item.endDate].filter(Boolean).join(" — ")}
              </p>
            ) : null}
          </div>

          {hasText(item.description) ? (
            <Paragraph text={item.description} className="mt-2" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ProjectsContent({ cv }) {
  const items = Array.isArray(cv.projectsList)
    ? cv.projectsList.filter(
        (item) => hasText(item.title) || hasText(item.description)
      )
    : [];

  if (!items.length) {
    return hasText(cv.projects) ? <Paragraph text={cv.projects} /> : null;
  }

  return (
    <div className="space-y-5">
      {items.map((item, index) => (
        <div key={index}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-black">
                {item.title || "Project"}
              </h3>

              <p className="text-sm font-semibold text-black/55">
                {[item.role, item.technologies].filter(Boolean).join(" · ")}
              </p>
            </div>

            {hasText(item.date) ? (
              <p className="whitespace-nowrap text-sm font-bold text-black/45">
                {item.date}
              </p>
            ) : null}
          </div>

          {hasText(item.description) ? (
            <Paragraph text={item.description} className="mt-2" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function CertificationContent({ cv }) {
  const items = Array.isArray(cv.certificationsList)
    ? cv.certificationsList.filter(
        (item) => hasText(item.name) || hasText(item.issuer) || hasText(item.date)
      )
    : [];

  if (!items.length) {
    return hasList(cv.certifications) ? (
      <BulletList items={cv.certifications} />
    ) : null;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index}>
          <h3 className="text-sm font-black text-black">
            {item.name || "Certification"}
          </h3>

          <p className="text-sm leading-7 text-black/60">
            {[item.issuer, item.date].filter(Boolean).join(" · ")}
          </p>
        </div>
      ))}
    </div>
  );
}

function Paragraph({ text, dark = false, className = "" }) {
  if (!hasText(text)) return null;

  return (
    <HtmlText
      html={text}
      className={`text-sm leading-8 ${
        dark ? "text-white/75" : "text-black/70"
      } ${className}`}
    />
  );
}

function BulletList({ items, dark = false }) {
  const list = normalizeList(items);

  if (!list.length) return null;

  return (
    <ul
      className={`space-y-2 text-sm leading-7 ${
        dark ? "text-white/78" : "text-black/70"
      }`}
    >
      {list.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-3">
          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
function SkillPills({ items, levels = [], dark = false, accent = "#2563EB" }) {
  const list = normalizeList(items);
  if (!list.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full px-3 py-1.5 text-[10.5px] font-bold"
          style={{
            backgroundColor: dark ? "rgba(255,255,255,0.16)" : accent,
            color: "#ffffff",
            border: dark
              ? "1px solid rgba(255,255,255,0.22)"
              : `1px solid ${accent}`,
          }}
        >
          {item}
          {levels?.[index] ? ` · ${levels[index]}` : ""}
        </span>
      ))}
    </div>
  );
}

function LanguageList({ items, levels = [], dark = false }) {
  const list = normalizeList(items);

  if (!list.length) return null;

  return (
    <ul
      className={`space-y-2 text-sm leading-7 ${
        dark ? "text-white/78" : "text-black/70"
      }`}
    >
      {list.map((item, index) => (
        <li key={`${item}-${index}`} className="flex justify-between gap-3">
          <span>{item}</span>
          <span className={dark ? "text-white/50" : "text-black/45"}>
            {levels?.[index] || "Fluent"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function SmallTitle({ title, dark = false }) {
  return (
    <p
      className={`mb-3 text-xs font-black uppercase tracking-[0.22em] ${
        dark ? "text-white" : "text-black"
      }`}
    >
      {title}
    </p>
  );
}
function SideSection({ title, children, accent = "#111827", dark = false }) {
  return (
    <section className="mt-8 first:mt-0">
      <h3
        className={`text-xs font-black uppercase tracking-[0.2em] ${
          dark ? "text-white" : ""
        }`}
        style={!dark ? { color: accent } : undefined}
      >
        {title}
      </h3>

      <div
        className="mt-2 h-px w-full"
        style={{
          backgroundColor: dark ? "rgba(255,255,255,0.22)" : `${accent}35`,
        }}
      />

      <div className="mt-3">{children}</div>
    </section>
  );
}

function ATSBadge({ cv, accent }) {
  return (
    <div className="mt-4 inline-flex rounded-full px-4 py-2 text-xs font-black text-white" style={{ backgroundColor: accent }}>
      ATS Score: {cv.atsScore || 0}%
    </div>
  );
}

function ContactLine({ cv, dark = false }) {
  const baseClass = dark
    ? "text-white/65 hover:text-white"
    : "text-black/55 hover:text-black";

  return (
    <div
      className={`mt-5 flex flex-wrap gap-x-3 gap-y-2 text-sm ${
        dark ? "text-white/65" : "text-black/55"
      }`}
    >
      {hasText(cv.email) ? (
        <a className={baseClass} href={`mailto:${cv.email}`}>
          {cv.email}
        </a>
      ) : null}

      {hasText(cv.phone) ? <span>{cv.phone}</span> : null}
      {hasText(cv.location) ? <span>{cv.location}</span> : null}

      <ClickableUrl value={cv.linkedIn} className={baseClass} />
      <ClickableUrl value={cv.github} className={baseClass} />
      <ClickableUrl value={cv.portfolio} className={baseClass} />
      <ClickableUrl value={cv.website} className={baseClass} />
    </div>
  );
}

function ContactStack({ cv, dark = false }) {
  const baseClass = dark
    ? "text-white/75 hover:text-white"
    : "text-black/60 hover:text-black";

  return (
    <div className="space-y-2 text-sm leading-6">
      {hasText(cv.email) ? (
        <a className={`block break-all ${baseClass}`} href={`mailto:${cv.email}`}>
          {cv.email}
        </a>
      ) : null}

      {hasText(cv.phone) ? (
        <p className={dark ? "text-white/75" : "text-black/60"}>{cv.phone}</p>
      ) : null}

      {hasText(cv.location) ? (
        <p className={dark ? "text-white/75" : "text-black/60"}>
          {cv.location}
        </p>
      ) : null}

      <ClickableUrl value={cv.linkedIn} className={`block break-all ${baseClass}`} />
      <ClickableUrl value={cv.github} className={`block break-all ${baseClass}`} />
      <ClickableUrl value={cv.portfolio} className={`block break-all ${baseClass}`} />
      <ClickableUrl value={cv.website} className={`block break-all ${baseClass}`} />
    </div>
  );
}

function ClickableUrl({ value, className = "" }) {
  if (!hasText(value)) return null;

  const clean = String(value).trim();

  const href =
    clean.startsWith("http://") || clean.startsWith("https://")
      ? clean
      : `https://${clean}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline-offset-4 hover:underline ${className}`}
    >
      {clean}
    </a>
  );
}

function ProfilePhoto({ cv, accent, dark = false, rounded = false, square = false }) {
  const initials = getInitials(cv.fullName);

  const shape = square
    ? "rounded-2xl"
    : rounded
    ? "rounded-[2rem]"
    : "rounded-full";

  return (
    <div
      className={`flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden ${shape} ${
        dark ? "bg-white/15 ring-white/30" : "bg-black/5 ring-black/10"
      } ring-1`}
    >
      {cv.photo ? (
        <img
          src={cv.photo}
          alt={cv.fullName || "Profile"}
          className="h-full w-full object-cover"
          style={{
            transform: `scale(${cv.photoZoom || 1})`,
            objectPosition: `${cv.photoPositionX || 50}% ${
              cv.photoPositionY || 50
            }%`,
          }}
        />
      ) : (
        <span
          className={`text-3xl font-black ${
            dark ? "text-white" : "text-white"
          }`}
          style={{ color: dark ? "#fff" : accent }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

function calculateATSScore(cv) {
  let score = 35;

  if (hasText(cv.fullName)) score += 8;
  if (hasText(cv.jobTitle)) score += 8;
  if (hasText(cv.email)) score += 8;
  if (hasText(cv.phone)) score += 5;
  if (hasText(cv.location)) score += 5;
  if (hasText(cv.summary) && cv.summary.length >= 80) score += 10;

  const validExperience = Array.isArray(cv.experiences)
    ? cv.experiences.filter(
        (item) => item.jobTitle && item.company && item.startDate
      )
    : [];

  const validEducation = Array.isArray(cv.educations)
    ? cv.educations.filter((item) => item.degree && item.institution)
    : [];

  if (validExperience.length) score += 10;
  if (validEducation.length) score += 6;
  if (Array.isArray(cv.skills) && cv.skills.length >= 4) score += 5;
  if (Array.isArray(cv.languages) && cv.languages.length >= 1) score += 3;
  if (Array.isArray(cv.certificationsList) && cv.certificationsList.length)
    score += 2;

  return Math.min(score, 99);
}

function formatExperience(items = []) {
  return items
    .filter(
      (item) =>
        hasText(item.jobTitle) ||
        hasText(item.company) ||
        hasText(item.description)
    )
    .map((item) => {
      const date = formatDateRange(item.startDate, item.endDate, item.current);

      return [
        item.jobTitle,
        [item.company, item.location].filter(Boolean).join(", "),
        date,
        item.description,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function formatEducation(items = []) {
  return items
    .filter(
      (item) =>
        hasText(item.degree) ||
        hasText(item.institution) ||
        hasText(item.description)
    )
    .map((item) => {
      const date = [item.startDate, item.endDate].filter(Boolean).join(" — ");

      return [
        item.degree,
        [item.institution, item.location].filter(Boolean).join(", "),
        date,
        item.description,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function formatProjects(items = []) {
  return items
    .filter((item) => hasText(item.title) || hasText(item.description))
    .map((item) =>
      [
        item.title,
        [item.role, item.technologies].filter(Boolean).join(" · "),
        item.date,
        item.description,
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n\n");
}

function formatCertifications(items = []) {
  return items
    .filter((item) => hasText(item.name) || hasText(item.issuer))
    .map((item) => [item.name, item.issuer, item.date].filter(Boolean).join(" · "))
    .join("\n");
}

function formatDateRange(startDate, endDate, current) {
  if (!startDate && !endDate && !current) return "";

  return [startDate, current ? "Present" : endDate].filter(Boolean).join(" — ");
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/,|\n|·/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasList(value) {
  return normalizeList(value).length > 0;
}

function hasValidExperience(cv) {
  if (Array.isArray(cv.experiences)) {
    const validItems = cv.experiences.filter(
      (item) =>
        hasText(item.jobTitle) ||
        hasText(item.company) ||
        hasText(item.location) ||
        hasText(item.startDate) ||
        hasText(item.endDate) ||
        hasText(item.description)
    );

    if (validItems.length > 0) return true;
  }

  return hasText(cv.experience);
}

function hasValidEducation(cv) {
  if (Array.isArray(cv.educations)) {
    const validItems = cv.educations.filter(
      (item) =>
        hasText(item.degree) ||
        hasText(item.institution) ||
        hasText(item.location) ||
        hasText(item.startDate) ||
        hasText(item.endDate) ||
        hasText(item.description)
    );

    if (validItems.length > 0) return true;
  }

  return hasText(cv.education);
}

function hasValidProjects(cv) {
  if (Array.isArray(cv.projectsList)) {
    const validItems = cv.projectsList.filter(
      (item) =>
        hasText(item.title) ||
        hasText(item.role) ||
        hasText(item.technologies) ||
        hasText(item.date) ||
        hasText(item.description)
    );

    if (validItems.length > 0) return true;
  }

  return hasText(cv.projects);
}

function hasValidCertifications(cv) {
  if (Array.isArray(cv.certificationsList)) {
    const validItems = cv.certificationsList.filter(
      (item) => hasText(item.name) || hasText(item.issuer) || hasText(item.date)
    );

    if (validItems.length > 0) return true;
  }

  return hasList(cv.certifications);
}
function hasValidAdditionalSections(cv) {
  return (
    Array.isArray(cv.additionalSections) &&
    cv.additionalSections.some(
      (item) => hasText(item.title) || hasText(item.description)
    )
  );
}


function getInitials(name = "") {
  const clean = String(name || "").trim();

  if (!clean) return "CV";

  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}