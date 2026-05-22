"use client";

import { useEffect, useRef, useState, Suspense } from "react";
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

export default function CreateCVPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-qorliqGold uppercase text-sm tracking-widest font-black">Loading Builder...</div>}>
      <CreateCVContent />
    </Suspense>
  );
}

function CreateCVContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [strengthInput, setStrengthInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [cvId, setCvId] = useState(null);
  const noImageTemplates = [
  "ats-professional",
  "executive-leadership",
  "technical-it",
  "academic-research",
];

const templateSupportsPhoto = !noImageTemplates.includes(form.template);

  useEffect(() => {
    const template = searchParams.get("template") || "ats-professional";
    const editId = searchParams.get("edit");

    if (editId) {
      setIsEditMode(true);
      setCvId(editId);
      loadCVData(editId);
    } else {
      setIsEditMode(false);
      setCvId(null);
      setForm((prev) => ({
        ...prev,
        template,
      }));
    }
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

  const removeArrayItem = (arrayName, index, fallbackItem) => {
    setForm((prev) => {
      const updated = prev[arrayName].filter((_, i) => i !== index);

      return {
        ...prev,
        [arrayName]: updated.length ? updated : [{ ...fallbackItem }],
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

  const formatExperience = (items) => {
    return items
      .filter((item) => item.jobTitle || item.company || item.description)
      .map((item) => {
        const date = `${item.startDate || ""} - ${
          item.current ? "Present" : item.endDate || ""
        }`;

        return `${item.jobTitle || "Job Title"} | ${
          item.company || "Company"
        } | ${item.location || "Location"} | ${date}\n${item.description || ""}`;
      })
      .join("\n\n");
  };

  const formatEducation = (items) => {
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
  };

  const formatProjects = (items) => {
    return items
      .filter((item) => item.title || item.description)
      .map((item) => {
        return `${item.title || "Project"} | ${item.role || ""} | ${
          item.date || ""
        }\nTechnologies: ${item.technologies || ""}\n${item.description || ""}`;
      })
      .join("\n\n");
  };

  const formatCertifications = (items) => {
    return items
      .filter((item) => item.name || item.issuer)
      .map((item) => {
        const parts = [item.name, item.issuer, item.date].filter(Boolean);
        return parts.join(" | ");
      });
  };

  const validateBeforeSubmit = () => {
    if (!form.fullName.trim()) {
      alert("Full name is required.");
      return false;
    }

    if (!form.jobTitle.trim()) {
      alert("Job title is required.");
      return false;
    }

    if (!form.email.trim()) {
      alert("Email address is required.");
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
      return false;
    }

    if (!validEducation) {
      alert("Please add at least one education record with degree, institution and start date.");
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
    setSkillInput("");
    setLanguageInput("");
    setStrengthInput("");
    handleRemoveImage();
    setIsEditMode(false);
    setCvId(null);
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
    <main className="min-h-screen overflow-hidden bg-[#050505] px-6 py-14 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-qorliqGold/20 blur-[120px]" />
        <div className="absolute right-[-160px] top-[25%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-[-180px] left-[35%] h-[420px] w-[420px] rounded-full bg-white/5 blur-[120px]" />
      </div>

      <section className="relative mx-auto max-w-7xl">
        <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-qorliqGold" />
              <span className="text-xs font-black uppercase tracking-[0.22em] text-white/70">
                Qorliq CV Builder
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">
              {isEditMode
                ? "Edit your professional CV"
                : "Create your professional CV"}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
              Fill professional details with dates, experience, education,
              skills, languages and optional photo. Skill level is not required.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Stat number="10" label="Templates" />
            <Stat number="No" label="Skill Level" />
            <Stat number="PDF" label="Ready" />
          </div>
        </div>

        <form
          onSubmit={handlePreview}
          className="rounded-[2.4rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-xl md:p-8"
        >
          <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
                Step 01
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-4xl">
                CV Information
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">
                Required fields are marked. Dates are included for experience,
                education, projects and certificates.
              </p>
            </div>

            <div className="rounded-full border border-qorliqGold/30 bg-qorliqGold/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-qorliqGold">
              {isEditMode ? "Edit Mode" : "Create Mode"}
            </div>
          </div>

          <SectionHeading
            number="01"
            title="Personal Details"
            desc="Basic contact details and professional profile image."
          />

          <div className="mt-5 grid gap-5 md:grid-cols-2">
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
                <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/50">
                  {form.photo ? (
                    <img
                      src={form.photo}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-2xl text-white/40">
                        +
                      </div>
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/30">
                        Optional
                      </span>
                    </div>
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
    This template does not support image.
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

          <Divider />

          <SectionHeading
            number="02"
            title="Professional Summary"
            desc="Short profile summary shown near the top of the CV."
          />

          <div className="mt-5">
            <Textarea
              label="Professional Summary"
              value={form.summary}
              onChange={(value) => updateField("summary", value)}
              placeholder="Example: Results-driven operations professional with 8+ years of experience improving workflows, reporting and business performance..."
              rows={5}
            />
          </div>

          <Divider />

          <SectionHeading
            number="03"
            title="Work Experience"
            desc="Add role, company, dates and achievements. At least one experience is required."
          />

          <div className="mt-5 space-y-5">
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

          <Divider />

          <SectionHeading
            number="04"
            title="Education"
            desc="Add degree, institution and dates. At least one education record is required."
          />

          <div className="mt-5 space-y-5">
            {form.educations.map((item, index) => (
              <EducationCard
                key={index}
                index={index}
                item={item}
                onChange={(field, value) =>
                  updateArrayItem("educations", index, field, value)
                }
                onRemove={() =>
                  removeArrayItem("educations", index, emptyEducation)
                }
              />
            ))}

            <AddButton
              text="Add Another Education"
              onClick={() => addArrayItem("educations", emptyEducation)}
            />
          </div>

          <Divider />

          <SectionHeading
            number="05"
            title="Projects"
            desc="Optional but recommended for IT, graduate, creative and technical CVs."
          />

          <div className="mt-5 space-y-5">
            {form.projectsList.map((item, index) => (
              <ProjectCard
                key={index}
                index={index}
                item={item}
                onChange={(field, value) =>
                  updateArrayItem("projectsList", index, field, value)
                }
                onRemove={() =>
                  setForm((prev) => ({
                    ...prev,
                    projectsList: prev.projectsList.filter((_, i) => i !== index),
                  }))
                }
              />
            ))}

            <AddButton
              text="Add Project"
              onClick={() => addArrayItem("projectsList", emptyProject)}
            />
          </div>

          <Divider />

          <SectionHeading
            number="06"
            title="Skills, Languages & Strengths"
            desc="No skill level required. Add simple clean tags."
          />

          <div className="mt-5 grid gap-5">
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

          <Divider />

          <SectionHeading
            number="07"
            title="Certifications"
            desc="Optional certifications with issuer and date."
          />

          <div className="mt-5 space-y-5">
            {form.certificationsList.map((item, index) => (
              <CertificationCard
                key={index}
                index={index}
                item={item}
                onChange={(field, value) =>
                  updateArrayItem("certificationsList", index, field, value)
                }
                onRemove={() =>
                  setForm((prev) => ({
                    ...prev,
                    certificationsList: prev.certificationsList.filter(
                      (_, i) => i !== index
                    ),
                  }))
                }
              />
            ))}

            <AddButton
              text="Add Certification"
              onClick={() =>
                addArrayItem("certificationsList", emptyCertification)
              }
            />
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-7 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-qorliqGold px-8 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : isEditMode ? "Update CV" : "Preview CV"}
            </button>

            <button
              type="button"
              onClick={clearForm}
              disabled={saving}
              className="rounded-full border border-white/15 px-8 py-4 text-sm font-black uppercase tracking-[0.16em] text-white/70 transition hover:border-qorliqGold hover:text-qorliqGold disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear Form
            </button>
          </div>
        </form>
      </section>
    </main>
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
            checked={item.current}
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

function SectionHeading({ number, title, desc }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-qorliqGold">
          Section {number}
        </p>

        <h3 className="mt-2 text-2xl font-black tracking-[-0.035em] text-white">
          {title}
        </h3>

        {desc ? (
          <p className="mt-2 text-sm leading-6 text-white/45">{desc}</p>
        ) : null}
      </div>
    </div>
  );
}

function CardTop({ title, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h4 className="text-sm font-black uppercase tracking-[0.16em] text-white/65">
        {title}
      </h4>

      <button
        type="button"
        onClick={onRemove}
        className="rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-red-200 transition hover:bg-red-400/20"
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
  required,
  disabled,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/50">
        {label} {required ? <span className="text-qorliqGold">*</span> : null}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-white/10 bg-black/45 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-qorliqGold disabled:cursor-not-allowed disabled:opacity-45"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 5 }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/50">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-qorliqGold"
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
      <label className="mb-3 block text-xs font-black uppercase tracking-[0.16em] text-white/50">
        {label}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="h-14 flex-1 rounded-2xl border border-white/10 bg-black/45 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-qorliqGold"
        />

        <button
          type="button"
          onClick={onAdd}
          className="rounded-2xl bg-qorliqGold px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-white"
        >
          {buttonText}
        </button>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2"
            >
              <span className="text-sm font-semibold text-white/80">
                {item}
              </span>

              <button
                type="button"
                onClick={() => onRemove(index)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white/55 transition hover:bg-red-500/20 hover:text-red-200"
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs leading-6 text-white/35">
          No {label.toLowerCase()} added yet.
        </p>
      )}
    </div>
  );
}

function AddButton({ text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-qorliqGold/30 bg-qorliqGold/10 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-qorliqGold transition hover:bg-qorliqGold hover:text-black"
    >
      + {text}
    </button>
  );
}

function Divider() {
  return <div className="my-8 h-px bg-white/10" />;
}

function Stat({ number, label }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-2xl font-black tracking-[-0.04em] text-qorliqGold">
        {number}
      </p>

      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/45">
        {label}
      </p>
    </div>
  );
}