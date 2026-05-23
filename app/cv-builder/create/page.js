"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const cvTemplates = [
  { id: "ats-professional", name: "ATS Professional" },
  { id: "modern-corporate", name: "Modern Corporate" },
  { id: "executive-leadership", name: "Executive Leadership" },
  { id: "creative-portfolio", name: "Creative Portfolio" },
  { id: "graduate-entry", name: "Graduate Entry" },
  { id: "technical-it", name: "Technical IT" },
  { id: "academic-research", name: "Academic Research" },
  { id: "healthcare-clinical", name: "Healthcare Clinical" },
  { id: "skilled-trade", name: "Skilled Trade" },
  { id: "international-europass", name: "International Europass" },
];

const templateConfig = {
  "ats-professional": {
    layout: "ats",
    name: "ATS Professional",
    accent: "#111827",
    photo: false,
  },
  "modern-corporate": {
    layout: "modern",
    name: "Modern Corporate",
    accent: "#2563EB",
    photo: true,
  },
  "executive-leadership": {
    layout: "executive",
    name: "Executive Leadership",
    accent: "#B88A2C",
    photo: false,
  },
  "creative-portfolio": {
    layout: "creative",
    name: "Creative Portfolio",
    accent: "#7C3AED",
    photo: true,
  },
  "graduate-entry": {
    layout: "student",
    name: "Graduate Entry",
    accent: "#059669",
    photo: true,
  },
  "technical-it": {
    layout: "technical",
    name: "Technical IT",
    accent: "#0891B2",
    photo: false,
  },
  "academic-research": {
    layout: "academic",
    name: "Academic Research",
    accent: "#4338CA",
    photo: false,
  },
  "healthcare-clinical": {
    layout: "healthcare",
    name: "Healthcare Clinical",
    accent: "#0F766E",
    photo: true,
  },
  "skilled-trade": {
    layout: "trade",
    name: "Skilled Trade",
    accent: "#EA580C",
    photo: true,
  },
  "international-europass": {
    layout: "europass",
    name: "International Europass",
    accent: "#1D4ED8",
    photo: true,
  },
};

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

const emptyForm = {
  template: "ats-professional",

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

  summary: "",

  experiences: [{ ...emptyExperience }],
  educations: [{ ...emptyEducation }],
  projectsList: [],
  skills: [],
  languages: [],
  certificationsList: [],
  strengths: [],

  experience: "",
  education: "",
  projects: "",
  certifications: [],
};

const steps = [
  {
    title: "Basic Information",
    desc: "Name, contact details, template and profile image.",
  },
  {
    title: "Professional Summary",
    desc: "Short profile summary shown near the top of the CV.",
  },
  {
    title: "Work Experience",
    desc: "Add job title, company, dates and responsibilities.",
  },
  {
    title: "Education",
    desc: "Add qualification, institution, location and dates.",
  },
  {
    title: "Skills & Languages",
    desc: "Add skills, languages and key strengths.",
  },
  {
    title: "Projects",
    desc: "Optional project details for stronger CV presentation.",
  },
  {
    title: "Certifications",
    desc: "Optional certificates, issuer and year.",
  },
];

export default function CreateCVPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
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

function CreateCVContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [currentStep, setCurrentStep] = useState(0);

  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [strengthInput, setStrengthInput] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [cvId, setCvId] = useState(null);

  const config =
    templateConfig[form.template] || templateConfig["ats-professional"];

  const templateSupportsPhoto = config.photo;

  useEffect(() => {
    const template = searchParams.get("template") || "ats-professional";
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
      template,

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

  const livePreviewCV = useMemo(
    () => ({
      ...form,
      experience: formatExperience(form.experiences),
      education: formatEducation(form.educations),
      projects: formatProjects(form.projectsList),
      certifications: formatCertifications(form.certificationsList),
    }),
    [form]
  );

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
        template: cvData.template || "ats-professional",
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
        summary: cvData.summary || "",

        skills: Array.isArray(cvData.skills) ? cvData.skills : [],
        languages: Array.isArray(cvData.languages) ? cvData.languages : [],
        strengths: Array.isArray(cvData.strengths) ? cvData.strengths : [],

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
          Array.isArray(cvData.certificationsList) &&
          cvData.certificationsList.length
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
        updateField("photo", reader.result);
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
    updateField("photo", "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateBeforeSubmit = () => {
    if (!form.fullName.trim()) {
      alert("Full name is required.");
      setCurrentStep(0);
      return false;
    }

    if (!form.jobTitle.trim()) {
      alert("Job title is required.");
      setCurrentStep(0);
      return false;
    }

    if (!form.email.trim()) {
      alert("Email address is required.");
      setCurrentStep(0);
      return false;
    }

    const validExperience = form.experiences.some(
      (item) => item.jobTitle && item.company && item.startDate
    );

    const validEducation = form.educations.some(
      (item) => item.degree && item.institution && item.startDate
    );

    if (!validExperience) {
      alert(
        "Please add at least one work experience with title, company and start date."
      );
      setCurrentStep(2);
      return false;
    }

    if (!validEducation) {
      alert(
        "Please add at least one education record with degree, institution and start date."
      );
      setCurrentStep(3);
      return false;
    }

    return true;
  };

  const handlePreview = async (e) => {
    e.preventDefault();

    if (saving) return;
    if (!validateBeforeSubmit()) return;

    try {
      setSaving(true);

      const payload = {
        template: form.template,
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
        summary: form.summary,

        skills: form.skills,
        languages: form.languages,
        strengths: form.strengths,

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
    setForm({
      ...emptyForm,
      template: searchParams.get("template") || "ats-professional",
    });

    localStorage.removeItem("qorliq-old-cv-data");

    setSkillInput("");
    setLanguageInput("");
    setStrengthInput("");
    handleRemoveImage();
    setIsEditMode(false);
    setCvId(null);
    setCurrentStep(0);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-qorliqGold">
          Loading CV Data...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] px-4 py-8 text-white md:px-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-qorliqGold/20 blur-[120px]" />
        <div className="absolute right-[-160px] top-[25%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-[-180px] left-[35%] h-[420px] w-[420px] rounded-full bg-white/5 blur-[120px]" />
      </div>

      <section className="relative mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-qorliqGold" />
              <span className="text-xs font-black uppercase tracking-[0.22em] text-white/70">
                Qorliq CV Builder
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.05em] md:text-6xl">
              {isEditMode
                ? "Edit your professional CV"
                : "Create your professional CV"}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              Fill your CV step by step. The preview updates automatically on
              the right side.
            </p>
          </div>

          <div className="rounded-full border border-qorliqGold/30 bg-qorliqGold/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-qorliqGold">
            {isEditMode ? "Edit Mode" : "Create Mode"}
          </div>
        </div>

 <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)]">
       <form
  onSubmit={handlePreview}
  className="min-w-0 rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl backdrop-blur-xl sm:rounded-[2rem] sm:p-5 md:p-6"
>
            <StepHeader
              steps={steps}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />

            <div className="mt-7">
              {currentStep === 0 ? (
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
              ) : null}

              {currentStep === 1 ? (
                <SummaryStep form={form} updateField={updateField} />
              ) : null}

              {currentStep === 2 ? (
                <ExperienceStep
                  form={form}
                  updateArrayItem={updateArrayItem}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                />
              ) : null}

              {currentStep === 3 ? (
                <EducationStep
                  form={form}
                  updateArrayItem={updateArrayItem}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                />
              ) : null}

              {currentStep === 4 ? (
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
                />
              ) : null}

              {currentStep === 5 ? (
                <ProjectsStep
                  form={form}
                  updateArrayItem={updateArrayItem}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                />
              ) : null}

              {currentStep === 6 ? (
                <CertificationsStep
                  form={form}
                  updateArrayItem={updateArrayItem}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                />
              ) : null}
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={currentStep === 0 || saving}
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                className="rounded-full border border-white/15 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/70 transition hover:border-qorliqGold hover:text-qorliqGold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={clearForm}
                  disabled={saving}
                  className="rounded-full border border-white/15 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/70 transition hover:border-red-300 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentStep((prev) =>
                        Math.min(prev + 1, steps.length - 1)
                      )
                    }
                    className="rounded-full bg-qorliqGold px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-qorliqGold px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
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
          </form>

      <aside className="min-w-0 h-fit rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-3 shadow-2xl backdrop-blur-xl sm:rounded-[2rem] sm:p-4 lg:sticky lg:top-6">
            <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-qorliqGold">
                  Live Preview
                </p>
                <p className="mt-1 text-xs text-white/45">{config.name}</p>
              </div>

              <p className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
                Auto Updating
              </p>
            </div>
<div className="w-full overflow-hidden rounded-2xl bg-white/5 p-2 sm:p-3 lg:max-h-[calc(100vh-145px)] lg:overflow-auto">
  <div className="relative mx-auto h-[470px] w-full overflow-hidden sm:h-[620px] md:h-[720px] lg:h-[760px] xl:h-[880px]">
    <div className="absolute left-1/2 top-0 origin-top -translate-x-1/2 scale-[0.40] sm:scale-[0.52] md:scale-[0.62] lg:scale-[0.66] xl:scale-[0.76]">
      <TemplateRenderer cv={livePreviewCV} config={config} />
    </div>
  </div>
</div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function StepHeader({ steps, currentStep, setCurrentStep }) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-qorliqGold">
        Step {String(currentStep + 1).padStart(2, "0")} of{" "}
        {String(steps.length).padStart(2, "0")}
      </p>

      <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
        {steps[currentStep].title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-white/45">
        {steps[currentStep].desc}
      </p>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-qorliqGold transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <button
            key={step.title}
            type="button"
            onClick={() => setCurrentStep(index)}
            className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition ${
              currentStep === index
                ? "bg-qorliqGold text-black"
                : "border border-white/10 text-white/45 hover:border-qorliqGold hover:text-qorliqGold"
            }`}
          >
            {index + 1}
          </button>
        ))}
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
          onChange={(e) => updateField("template", e.target.value)}
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
        label="GitHub Profile"
        value={form.github}
        onChange={(value) => updateField("github", value)}
        placeholder="https://github.com/yourusername"
      />

      <Input
        label="Portfolio"
        value={form.portfolio}
        onChange={(value) => updateField("portfolio", value)}
        placeholder="https://yourportfolio.com"
      />

      <Input
        label="Website"
        value={form.website}
        onChange={(value) => updateField("website", value)}
        placeholder="https://yourwebsite.com"
      />

      <div className="md:col-span-2">
        <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/50">
          Profile Image
        </label>

        <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-black/30 p-5 sm:flex-row sm:items-center">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/50">
            {form.photo ? (
              <img
                src={form.photo}
                alt="Profile preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-black uppercase tracking-[0.16em] text-white/30">
                Optional
              </span>
            )}
          </div>

          <div className="flex-1">
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
                Upload JPG, PNG or WEBP. Recommended square image under 2MB.
              </p>
            ) : (
              <p className="mt-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-xs font-bold leading-6 text-yellow-100">
                This selected template does not support profile image.
              </p>
            )}

            {form.photo ? (
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={uploadingPhoto}
                className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remove Image
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryStep({ form, updateField }) {
  return (
    <Textarea
      label="Professional Summary"
      value={form.summary}
      onChange={(value) => updateField("summary", value)}
      placeholder="Example: Results-driven operations professional with 8+ years of experience improving workflows, reporting and business performance..."
      rows={9}
    />
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
}) {
  return (
    <div className="grid gap-5">
      <DynamicListInput
        label="Skills"
        value={skillInput}
        onChange={setSkillInput}
        onAdd={() => addSimpleItem("skills", skillInput, setSkillInput)}
        onRemove={(index) => removeSimpleItem("skills", index)}
        items={form.skills}
        placeholder="e.g. Microsoft Excel, React, Customer Service"
        buttonText="Add Skill"
      />

      <DynamicListInput
        label="Languages"
        value={languageInput}
        onChange={setLanguageInput}
        onAdd={() =>
          addSimpleItem("languages", languageInput, setLanguageInput)
        }
        onRemove={(index) => removeSimpleItem("languages", index)}
        items={form.languages}
        placeholder="e.g. English - Fluent"
        buttonText="Add Language"
      />

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

function ProjectsStep({ form, updateArrayItem, addArrayItem, removeArrayItem }) {
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
    </div>
  );
}

function CertificationsStep({
  form,
  updateArrayItem,
  addArrayItem,
  removeArrayItem,
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
        onClick={() =>
          addArrayItem("certificationsList", emptyCertification)
        }
      />
    </div>
  );
}

function ExperienceCard({ index, item, onChange, onRemove }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
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
          <Textarea
            label="Achievements / Responsibilities"
            value={item.description}
            onChange={(value) => onChange("description", value)}
            placeholder={`Example:
• Improved reporting accuracy by 38%
• Managed supplier communication and internal workflows
• Reduced operational delays through process improvement`}
            rows={5}
          />
        </div>
      </div>
    </div>
  );
}

function EducationCard({ index, item, onChange, onRemove }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
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
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
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
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
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
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-white/10 bg-black/45 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-qorliqGold disabled:cursor-not-allowed disabled:opacity-40"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/50">
        {label}
      </label>

      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-2xl border border-white/10 bg-black/45 px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-qorliqGold"
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
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
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
          className="h-14 flex-1 rounded-2xl border border-white/10 bg-black/45 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-qorliqGold"
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

function TemplateRenderer({ cv, config }) {
  if (config.layout === "modern" || config.layout === "healthcare") {
    return <ModernTemplate cv={cv} config={config} />;
  }

  if (config.layout === "executive") {
    return <ExecutiveTemplate cv={cv} config={config} />;
  }

  if (config.layout === "creative") {
    return <CreativeTemplate cv={cv} config={config} />;
  }

  if (
    config.layout === "student" ||
    config.layout === "trade" ||
    config.layout === "europass"
  ) {
    return <PhotoHeaderTemplate cv={cv} config={config} />;
  }

  return <ATSTemplate cv={cv} config={config} />;
}

function ATSTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <div
      className="bg-white px-12 py-12 text-black shadow-2xl"
      style={{ width: "794px", minHeight: "1123px" }}
    >
      <header className="border-b pb-6" style={{ borderColor: `${accent}55` }}>
        <h1 className="text-5xl font-black tracking-[-0.05em]">
          {cv.fullName || "Your Name"}
        </h1>

        <p className="mt-2 text-xl font-bold" style={{ color: accent }}>
          {cv.jobTitle || "Professional Title"}
        </p>

        <ContactLine cv={cv} />
      </header>

      <main className="mt-8 space-y-8">
        {hasText(cv.summary) ? (
          <CVSection title="Professional Summary" accent={accent}>
            <Paragraph text={cv.summary} />
          </CVSection>
        ) : null}

        {hasValidExperience(cv) ? (
          <CVSection title="Work Experience" accent={accent}>
            <ExperienceContent cv={cv} />
          </CVSection>
        ) : null}

        <div className="grid gap-8 grid-cols-[0.58fr_0.42fr]">
          <div className="space-y-8">
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
          </div>

          <aside className="space-y-8">
            {hasList(cv.skills) ? (
              <CVSection title="Skills" accent={accent}>
                <SkillPills items={cv.skills} accent={accent} />
              </CVSection>
            ) : null}

            {hasList(cv.languages) ? (
              <CVSection title="Languages" accent={accent}>
                <BulletList items={cv.languages} />
              </CVSection>
            ) : null}

            {hasValidCertifications(cv) ? (
              <CVSection title="Certifications" accent={accent}>
                <CertificationContent cv={cv} />
              </CVSection>
            ) : null}

            {hasList(cv.strengths) ? (
              <CVSection title="Key Strengths" accent={accent}>
                <BulletList items={cv.strengths} />
              </CVSection>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
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

        {hasList(cv.skills) ? (
          <div className="mt-8">
            <SmallTitle title="Skills" dark />
            <SkillPills items={cv.skills} dark />
          </div>
        ) : null}

        {hasList(cv.languages) ? (
          <div className="mt-8">
            <SmallTitle title="Languages" dark />
            <BulletList items={cv.languages} dark />
          </div>
        ) : null}

        {hasList(cv.strengths) ? (
          <div className="mt-8">
            <SmallTitle title="Strengths" dark />
            <BulletList items={cv.strengths} dark />
          </div>
        ) : null}
      </aside>

      <main className="space-y-8 px-10 py-10">
        {hasText(cv.summary) ? (
          <CVSection title="Professional Summary" accent={accent}>
            <Paragraph text={cv.summary} />
          </CVSection>
        ) : null}

        {hasValidExperience(cv) ? (
          <CVSection title="Employment History" accent={accent}>
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

        {hasValidCertifications(cv) ? (
          <CVSection title="Certifications" accent={accent}>
            <CertificationContent cv={cv} />
          </CVSection>
        ) : null}
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
          {hasList(cv.skills) ? (
            <CVSection title="Core Skills" accent={accent}>
              <SkillPills items={cv.skills} accent={accent} />
            </CVSection>
          ) : null}

          {hasValidEducation(cv) ? (
            <CVSection title="Education" accent={accent}>
              <EducationContent cv={cv} compact />
            </CVSection>
          ) : null}

          {hasList(cv.languages) ? (
            <CVSection title="Languages" accent={accent}>
              <BulletList items={cv.languages} />
            </CVSection>
          ) : null}
        </aside>

        <main className="space-y-8">
          {hasText(cv.summary) ? (
            <CVSection title="Professional Profile" accent={accent}>
              <Paragraph text={cv.summary} />
            </CVSection>
          ) : null}

          {hasValidExperience(cv) ? (
            <CVSection title="Leadership Experience" accent={accent}>
              <ExperienceContent cv={cv} />
            </CVSection>
          ) : null}

          {hasValidProjects(cv) ? (
            <CVSection title="Projects" accent={accent}>
              <ProjectsContent cv={cv} />
            </CVSection>
          ) : null}

          {hasValidCertifications(cv) ? (
            <CVSection title="Certifications" accent={accent}>
              <CertificationContent cv={cv} />
            </CVSection>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function CreativeTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <div
      className="bg-white px-10 py-10 text-black shadow-2xl"
      style={{ width: "794px", minHeight: "1123px" }}
    >
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
          {hasText(cv.summary) ? (
            <CVSection title="Creative Profile" accent={accent}>
              <Paragraph text={cv.summary} />
            </CVSection>
          ) : null}

          {hasValidExperience(cv) ? (
            <CVSection title="Experience" accent={accent}>
              <ExperienceContent cv={cv} />
            </CVSection>
          ) : null}

          {hasValidProjects(cv) ? (
            <CVSection title="Projects" accent={accent}>
              <ProjectsContent cv={cv} />
            </CVSection>
          ) : null}
        </div>

        <aside className="space-y-8 rounded-[1.8rem] border border-black/5 bg-black/[0.025] p-6">
          {hasList(cv.skills) ? (
            <CVSection title="Skills" accent={accent}>
              <SkillPills items={cv.skills} accent={accent} />
            </CVSection>
          ) : null}

          {hasValidEducation(cv) ? (
            <CVSection title="Education" accent={accent}>
              <EducationContent cv={cv} compact />
            </CVSection>
          ) : null}

          {hasList(cv.languages) ? (
            <CVSection title="Languages" accent={accent}>
              <BulletList items={cv.languages} />
            </CVSection>
          ) : null}

          {hasValidCertifications(cv) ? (
            <CVSection title="Certifications" accent={accent}>
              <CertificationContent cv={cv} compact />
            </CVSection>
          ) : null}
        </aside>
      </main>
    </div>
  );
}

function PhotoHeaderTemplate({ cv, config }) {
  const accent = config.accent;

  const label =
    config.layout === "europass"
      ? "European / International CV Format"
      : config.layout === "student"
      ? "Graduate CV"
      : config.layout === "trade"
      ? "Skilled Trade CV"
      : "Professional CV";

  return (
    <div
      className="bg-white px-10 py-10 text-black shadow-2xl"
      style={{ width: "794px", minHeight: "1123px" }}
    >
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
            {label}
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
        {hasText(cv.summary) ? (
          <CVSection title="Profile" accent={accent}>
            <Paragraph text={cv.summary} />
          </CVSection>
        ) : null}

        {hasValidExperience(cv) ? (
          <CVSection title="Employment History" accent={accent}>
            <ExperienceContent cv={cv} />
          </CVSection>
        ) : null}

        <div className="grid gap-9 grid-cols-2">
          {hasValidEducation(cv) ? (
            <CVSection title="Education" accent={accent}>
              <EducationContent cv={cv} />
            </CVSection>
          ) : null}

          {hasList(cv.skills) ? (
            <CVSection title="Skills" accent={accent}>
              <SkillPills items={cv.skills} accent={accent} />
            </CVSection>
          ) : null}
        </div>

        <div className="grid gap-9 grid-cols-2">
          {hasValidProjects(cv) ? (
            <CVSection title="Projects" accent={accent}>
              <ProjectsContent cv={cv} />
            </CVSection>
          ) : null}

          <div className="space-y-8">
            {hasList(cv.languages) ? (
              <CVSection title="Languages" accent={accent}>
                <BulletList items={cv.languages} />
              </CVSection>
            ) : null}

            {hasValidCertifications(cv) ? (
              <CVSection title="Certifications" accent={accent}>
                <CertificationContent cv={cv} />
              </CVSection>
            ) : null}
          </div>
        </div>
      </main>
    </div>
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

function ExperienceContent({ cv }) {
  const items = Array.isArray(cv.experiences)
    ? cv.experiences.filter(
        (item) =>
          hasText(item.jobTitle) ||
          hasText(item.company) ||
          hasText(item.description)
      )
    : [];

  if (!items.length) {
    return hasText(cv.experience) ? <Paragraph text={cv.experience} /> : null;
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index}>
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
            <Paragraph text={item.description} className="mt-3" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function EducationContent({ cv, compact = false }) {
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
    <div className={compact ? "space-y-4" : "space-y-5"}>
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
    ? cv.projectsList.filter((item) => hasText(item.title) || hasText(item.description))
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

function CertificationContent({ cv, compact = false }) {
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
    <div className={compact ? "space-y-3" : "space-y-4"}>
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
    <p
      className={`whitespace-pre-line text-sm leading-8 ${
        dark ? "text-white/75" : "text-black/70"
      } ${className}`}
    >
      {text}
    </p>
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

function SkillPills({ items, accent = "#111827", dark = false }) {
  const list = normalizeList(items);

  if (!list.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
            dark ? "bg-white/15 text-white" : "text-white"
          }`}
          style={dark ? undefined : { backgroundColor: accent }}
        >
          {item}
        </span>
      ))}
    </div>
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

function ProfilePhoto({ cv, accent, dark = false, rounded = false }) {
  return (
    <div
      className={`flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden border ${
        rounded ? "rounded-[1.8rem]" : "rounded-full"
      } ${dark ? "border-white/25 bg-white/10" : "border-black/5 bg-black/5"}`}
      style={{ boxShadow: `0 18px 45px ${accent}25` }}
    >
      {hasText(cv.photo) ? (
        <img
          src={cv.photo}
          alt={cv.fullName || "Profile"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className={`text-4xl font-black ${
            dark ? "text-white/50" : "text-black/35"
          }`}
        >
          {getInitials(cv.fullName)}
        </span>
      )}
    </div>
  );
}

function formatExperience(items) {
  return items
    .filter((item) => item.jobTitle || item.company || item.description)
    .map((item) => {
      const date = `${item.startDate || ""} - ${
        item.current ? "Present" : item.endDate || ""
      }`;

      return `${item.jobTitle || "Job Title"} | ${item.company || "Company"} | ${
        item.location || "Location"
      } | ${date}\n${item.description || ""}`;
    })
    .join("\n\n");
}

function formatEducation(items) {
  return items
    .filter((item) => item.degree || item.institution || item.description)
    .map((item) => {
      const date = `${item.startDate || ""} - ${item.endDate || ""}`;

      return `${item.degree || "Degree"} | ${
        item.institution || "Institution"
      } | ${item.location || "Location"} | ${date}\n${
        item.description || ""
      }`;
    })
    .join("\n\n");
}

function formatProjects(items) {
  return items
    .filter((item) => item.title || item.description)
    .map((item) => {
      return `${item.title || "Project"} | ${item.role || ""} | ${
        item.date || ""
      }\nTechnologies: ${item.technologies || ""}\n${item.description || ""}`;
    })
    .join("\n\n");
}

function formatCertifications(items) {
  return items
    .filter((item) => item.name || item.issuer)
    .map((item) => {
      const parts = [item.name, item.issuer, item.date].filter(Boolean);
      return parts.join(" | ");
    });
}

function formatDateRange(startDate, endDate, current) {
  const start = hasText(startDate) ? startDate : "";
  const end = current ? "Present" : hasText(endDate) ? endDate : "";

  if (!start && !end) return "";
  if (start && end) return `${start} — ${end}`;
  return start || end;
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

function getInitials(name = "") {
  const clean = String(name || "").trim();

  if (!clean) return "CV";

  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}