"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const cvTemplates = [
  {
    id: "executive-gold",
    name: "Executive Gold",
    category: "Professional",
    style: "executive",
    accent: "#B88A2C",
    ats: 92,
    tag: "Executive",
  },
  {
    id: "modern-black",
    name: "Modern Black",
    category: "Modern",
    style: "sidebar",
    accent: "#111827",
    ats: 90,
    tag: "Modern",
  },
  {
    id: "clean-ats",
    name: "Clean ATS",
    category: "ATS",
    style: "clean",
    accent: "#2563EB",
    ats: 98,
    tag: "ATS",
  },
  {
    id: "creative-edge",
    name: "Creative Edge",
    category: "Creative",
    style: "creative",
    accent: "#7C3AED",
    ats: 88,
    tag: "Creative",
  },
  {
    id: "classic-pro",
    name: "Classic Pro",
    category: "Simple",
    style: "classic",
    accent: "#374151",
    ats: 95,
    tag: "Classic",
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    category: "Professional",
    style: "sidebar",
    accent: "#1D4ED8",
    ats: 94,
    tag: "Corporate",
  },
  {
    id: "tech-minimal",
    name: "Tech Minimal",
    category: "Modern",
    style: "clean",
    accent: "#0891B2",
    ats: 93,
    tag: "Tech",
  },
  {
    id: "luxury-ivory",
    name: "Luxury Ivory",
    category: "Professional",
    style: "luxury",
    accent: "#A16207",
    ats: 91,
    tag: "Premium",
  },
  {
    id: "graduate-fresh",
    name: "Graduate Fresh",
    category: "Simple",
    style: "creative",
    accent: "#059669",
    ats: 96,
    tag: "Graduate",
  },
  {
    id: "formal-uk",
    name: "Formal UK",
    category: "ATS",
    style: "classic",
    accent: "#1F2937",
    ats: 97,
    tag: "UK",
  },
  {
    id: "senior-director",
    name: "Senior Director",
    category: "Professional",
    style: "executive",
    accent: "#92400E",
    ats: 93,
    tag: "Director",
  },
  {
    id: "admin-professional",
    name: "Admin Professional",
    category: "Simple",
    style: "clean",
    accent: "#475569",
    ats: 96,
    tag: "Admin",
  },
  {
    id: "healthcare-clinical",
    name: "Healthcare Clinical",
    category: "ATS",
    style: "clean",
    accent: "#0F766E",
    ats: 94,
    tag: "Healthcare",
  },
  {
    id: "sales-leader",
    name: "Sales Leader",
    category: "Modern",
    style: "sidebar",
    accent: "#DC2626",
    ats: 91,
    tag: "Sales",
  },
  {
    id: "finance-analyst",
    name: "Finance Analyst",
    category: "Professional",
    style: "classic",
    accent: "#0E7490",
    ats: 95,
    tag: "Finance",
  },
];

const filters = [
  "All Templates",
  "Simple",
  "Modern",
  "Professional",
  "ATS",
  "Creative",
];

const cvContent = {
  name: "Emma Williams",
  title: "Operations Manager",
  email: "emma.williams@email.com",
  phone: "+44 7700 123456",
  location: "London, UK",
  summary:
    "Results-driven professional with strong experience improving operations, reporting, service delivery and team performance in fast-paced business environments.",
  experience: [
    {
      role: "Operations Manager",
      company: "Brightline Services",
      date: "2021 — Present",
      points: [
        "Improved reporting accuracy by 38% through better workflow controls.",
        "Managed suppliers, schedules, documentation and executive reports.",
      ],
    },
    {
      role: "Senior Coordinator",
      company: "Apex Group",
      date: "2018 — 2021",
      points: [
        "Coordinated internal operations, records and department communication.",
        "Supported KPI tracking, budget records and monthly reporting packs.",
      ],
    },
  ],
  skills: [
    "Operations Management",
    "Microsoft Excel",
    "Reporting",
    "Team Coordination",
    "Vendor Management",
    "Communication",
  ],
  education: "BA Business Management — University of Manchester",
};

function Stepper() {
  return (
    <div className="mx-auto mb-10 grid max-w-3xl grid-cols-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {[
        ["1", "Choose template"],
        ["2", "Enter your details"],
        ["3", "Download CV"],
      ].map(([number, label], index) => (
        <div
          key={label}
          className={`flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-center text-xs font-bold ${
            index === 0
              ? "bg-slate-900 text-white"
              : "bg-transparent text-slate-500"
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
              index === 0
                ? "bg-white text-slate-900"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {number}
          </span>
          <span className="hidden sm:inline">{label}</span>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children, accent }) {
  return (
    <p
      className="mb-1 border-b pb-1 text-[7px] font-black uppercase tracking-[0.16em]"
      style={{ color: accent, borderColor: `${accent}55` }}
    >
      {children}
    </p>
  );
}

function ExperienceBlock() {
  return (
    <div className="space-y-2">
      {cvContent.experience.map((job) => (
        <div key={job.role}>
          <div className="flex justify-between gap-2">
            <p className="text-[7px] font-black text-slate-900">{job.role}</p>
            <p className="whitespace-nowrap text-[6px] font-bold text-slate-400">
              {job.date}
            </p>
          </div>
          <p className="text-[6.5px] font-semibold text-slate-500">
            {job.company}
          </p>
          <ul className="mt-1 space-y-0.5">
            {job.points.map((point) => (
              <li
                key={point}
                className="text-[6.5px] leading-[1.35] text-slate-600"
              >
                • {point}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SkillsList({ dark = false }) {
  return (
    <div className="flex flex-wrap gap-1">
      {cvContent.skills.map((skill) => (
        <span
          key={skill}
          className={`rounded-full px-2 py-1 text-[5.8px] font-bold ${
            dark ? "bg-white/15 text-white/80" : "bg-slate-100 text-slate-600"
          }`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

function CVTemplatePreview({ template }) {
  const accent = template.accent;

  if (template.style === "sidebar") {
    return (
      <div className="h-[330px] overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid h-full grid-cols-[34%_66%]">
          <aside
            className="p-3 text-white"
            style={{ backgroundColor: accent }}
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[10px] font-black text-slate-900">
              CV
            </div>
            <h3 className="text-[10px] font-black leading-tight">
              {cvContent.name}
            </h3>
            <p className="mt-1 text-[7px] leading-3 text-white/75">
              {template.name === "Sales Leader"
                ? "Sales Team Leader"
                : template.name === "Tech Minimal"
                ? "Full Stack Developer"
                : cvContent.title}
            </p>

            <div className="mt-4 space-y-1.5 text-[6.2px] leading-3 text-white/70">
              <p>{cvContent.email}</p>
              <p>{cvContent.phone}</p>
              <p>{cvContent.location}</p>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[6.5px] font-black uppercase tracking-widest">
                Skills
              </p>
              <SkillsList dark />
            </div>
          </aside>

          <main className="space-y-3 p-3">
            <section>
              <SectionTitle accent={accent}>Profile</SectionTitle>
              <p className="text-[6.7px] leading-[1.4] text-slate-600">
                {cvContent.summary}
              </p>
            </section>

            <section>
              <SectionTitle accent={accent}>Experience</SectionTitle>
              <ExperienceBlock />
            </section>

            <section>
              <SectionTitle accent={accent}>Education</SectionTitle>
              <p className="text-[6.7px] leading-[1.4] text-slate-600">
                {cvContent.education}
              </p>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (template.style === "executive") {
    return (
      <div className="h-[330px] overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <header className="bg-slate-950 p-4 text-white">
          <p
            className="text-[6px] font-black uppercase tracking-[0.25em]"
            style={{ color: accent }}
          >
            Executive CV
          </p>
          <h3 className="mt-1 text-[15px] font-black leading-tight">
            {template.name === "Senior Director"
              ? "James Carter"
              : cvContent.name}
          </h3>
          <p className="mt-1 text-[7px] font-semibold text-white/70">
            {template.name === "Senior Director"
              ? "Senior Director"
              : "Head of Operations"}
          </p>
          <p className="mt-2 text-[6px] text-white/45">
            {cvContent.email} · {cvContent.phone}
          </p>
        </header>

        <div className="grid grid-cols-[38%_62%] gap-3 p-3">
          <aside className="space-y-3">
            <section>
              <SectionTitle accent={accent}>Core Skills</SectionTitle>
              <SkillsList />
            </section>

            <section>
              <SectionTitle accent={accent}>Education</SectionTitle>
              <p className="text-[6.7px] leading-[1.4] text-slate-600">
                MBA Executive Management
                <br />
                London Business School
              </p>
            </section>
          </aside>

          <main className="space-y-3">
            <section>
              <SectionTitle accent={accent}>Leadership Profile</SectionTitle>
              <p className="text-[6.7px] leading-[1.4] text-slate-600">
                Strategic senior leader with experience managing teams,
                budgets, suppliers and business transformation projects.
              </p>
            </section>

            <section>
              <SectionTitle accent={accent}>Experience</SectionTitle>
              <ExperienceBlock />
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (template.style === "creative") {
    return (
      <div className="h-[330px] overflow-hidden rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
        <div
          className="mb-3 rounded-xl p-3"
          style={{ backgroundColor: `${accent}14` }}
        >
          <p
            className="text-[6px] font-black uppercase tracking-[0.25em]"
            style={{ color: accent }}
          >
            Creative CV
          </p>
          <h3 className="mt-1 text-[15px] font-black leading-tight text-slate-950">
            {template.name === "Graduate Fresh" ? "Adam Khan" : "Sofia Miller"}
          </h3>
          <p className="mt-1 text-[7px] font-bold" style={{ color: accent }}>
            {template.name === "Graduate Fresh"
              ? "Computer Science Graduate"
              : "Brand Designer"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            ["Profile", cvContent.summary],
            ["Experience", "Brand Designer — Studio Nova\n• Designed brand systems for 20+ client campaigns."],
            ["Skills", cvContent.skills.join(" · ")],
            ["Education", cvContent.education],
          ].map(([title, text]) => (
            <section key={title} className="rounded-lg bg-slate-50 p-2">
              <SectionTitle accent={accent}>{title}</SectionTitle>
              <p className="whitespace-pre-line text-[6.4px] leading-[1.35] text-slate-600">
                {text}
              </p>
            </section>
          ))}
        </div>
      </div>
    );
  }

  if (template.style === "luxury") {
    return (
      <div className="h-[330px] overflow-hidden rounded-xl bg-[#FBF7EF] p-4 shadow-sm ring-1 ring-slate-200">
        <div className="text-center">
          <p
            className="text-[6px] font-black uppercase tracking-[0.28em]"
            style={{ color: accent }}
          >
            Premium CV
          </p>
          <h3 className="mt-2 font-serif text-[17px] font-bold text-slate-950">
            Amelia Grant
          </h3>
          <p className="mt-1 text-[7px] font-semibold text-slate-600">
            Client Relationship Manager
          </p>
          <div
            className="mx-auto mt-3 h-[2px] w-16 rounded-full"
            style={{ backgroundColor: accent }}
          />
        </div>

        <div className="mt-4 space-y-3">
          <section>
            <SectionTitle accent={accent}>Profile</SectionTitle>
            <p className="text-[6.7px] leading-[1.4] text-slate-600">
              Client-facing professional with premium service, account care and
              relationship management experience.
            </p>
          </section>

          <section>
            <SectionTitle accent={accent}>Experience</SectionTitle>
            <ExperienceBlock />
          </section>

          <section>
            <SectionTitle accent={accent}>Skills</SectionTitle>
            <SkillsList />
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[330px] overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <header className="border-b pb-3" style={{ borderColor: accent }}>
        <h3 className="text-center text-[15px] font-black leading-tight text-slate-950">
          {template.name === "Finance Analyst"
            ? "Noah Edwards"
            : template.name === "Healthcare Clinical"
            ? "Sarah Ahmed"
            : template.name === "Admin Professional"
            ? "Aisha Khan"
            : cvContent.name}
        </h3>

        <p
          className="mt-1 text-center text-[7px] font-bold uppercase tracking-[0.18em]"
          style={{ color: accent }}
        >
          {template.name === "Finance Analyst"
            ? "Finance Analyst"
            : template.name === "Healthcare Clinical"
            ? "Registered Nurse"
            : template.name === "Admin Professional"
            ? "Executive Assistant"
            : cvContent.title}
        </p>

        <p className="mt-1 text-center text-[6.3px] text-slate-400">
          {cvContent.email} · {cvContent.phone} · {cvContent.location}
        </p>
      </header>

      <main className="mt-3 space-y-3">
        <section>
          <SectionTitle accent={accent}>Professional Summary</SectionTitle>
          <p className="text-[6.7px] leading-[1.4] text-slate-600">
            {cvContent.summary}
          </p>
        </section>

        <section>
          <SectionTitle accent={accent}>Employment History</SectionTitle>
          <ExperienceBlock />
        </section>

        <section>
          <SectionTitle accent={accent}>Skills</SectionTitle>
          <SkillsList />
        </section>

        <section>
          <SectionTitle accent={accent}>Education</SectionTitle>
          <p className="text-[6.7px] leading-[1.4] text-slate-600">
            {cvContent.education}
          </p>
        </section>
      </main>
    </div>
  );
}

function TemplateCard({ template, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group rounded-2xl border bg-white p-3 text-left transition hover:-translate-y-1 hover:shadow-xl ${
        selected
          ? "border-slate-900 shadow-xl"
          : "border-slate-200 shadow-sm hover:border-slate-300"
      }`}
    >
      <div className="relative">
        <CVTemplatePreview template={template} />

        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-black text-slate-700 shadow">
          {template.tag}
        </span>

        {selected && (
          <span className="absolute right-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black text-white shadow">
            Selected
          </span>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-950">
            {template.name}
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {template.category} CV template
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
          {template.ats}% ATS
        </span>
      </div>
    </button>
  );
}

function OldCVPopup({ template, onClose }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const handleOldCVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt"];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isAllowed) {
      alert("Please upload PDF, DOC, DOCX or TXT file only.");
      return;
    }

    setUploading(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cv/extract", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.error || "Unable to extract CV data.");
        return;
      }

      const oldCVData = {
        uploaded: true,
        fileName: file.name,
        ...result.data,
      };

      localStorage.setItem("qorliq-old-cv-data", JSON.stringify(oldCVData));
      router.push(`/cv-builder/create?template=${template.id}&oldcv=yes`);
    } catch (error) {
      console.error("Old CV upload error:", error);
      alert("Unable to upload or extract this CV.");
    } finally {
      setUploading(false);
    }
  };

  const goEmptyCreate = () => {
    localStorage.removeItem("qorliq-old-cv-data");
    router.push(`/cv-builder/create?template=${template.id}`);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-5 text-slate-950 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
              Selected Template
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              {template.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Upload your old CV to prepare the new CV faster, or start with an
              empty professional template.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-500 hover:bg-slate-50"
          >
            ×
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-xl font-black">Yes, I have old CV</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Upload PDF, DOC, DOCX or TXT. Your details will be extracted and
              prepared inside the selected template.
            </p>

            <label className="mt-5 block cursor-pointer rounded-full bg-slate-900 px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-700">
              {uploading ? "Reading CV..." : "Upload Old CV"}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleOldCVUpload}
                className="hidden"
              />
            </label>

            {uploadedFileName && (
              <p className="mt-3 text-xs font-semibold text-slate-500">
                Uploaded: {uploadedFileName}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-xl font-black">No, start empty</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Open the selected CV template with an empty form and fill your
              details manually.
            </p>

            <button
              type="button"
              onClick={goEmptyCreate}
              className="mt-5 w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:bg-slate-50"
            >
              Open Empty Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CVBuilderPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    cvTemplates[0].id
  );
  const [activeFilter, setActiveFilter] = useState("All Templates");
  const [showOldCVPopup, setShowOldCVPopup] = useState(false);

  const filteredTemplates = useMemo(() => {
    if (activeFilter === "All Templates") return cvTemplates;
    return cvTemplates.filter((template) => template.category === activeFilter);
  }, [activeFilter]);

  const activeTemplate =
    cvTemplates.find((template) => template.id === selectedTemplateId) ||
    cvTemplates[0];

  return (
    <main className="min-h-screen bg-[#F6F7FB] pb-24 text-slate-950 md:pb-0">
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
        <Stepper />

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
            Resume Templates
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            Choose your professional CV template
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-500">
            Simple to use, recruiter-friendly and ready for PDF or Word
            download. Pick a design, enter your details and create a job-ready
            CV.
          </p>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center md:overflow-visible">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-xs font-black transition ${
                activeFilter === filter
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-950"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={selectedTemplateId === template.id}
              onSelect={() => setSelectedTemplateId(template.id)}
            />
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setShowOldCVPopup(true)}
          className="w-full rounded-full bg-slate-900 px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-white transition active:scale-[0.98]"
        >
          Use This Template
        </button>

        <p className="mt-1 text-center text-[10px] font-semibold text-slate-500">
          Selected: {activeTemplate.name}
        </p>
      </div>

      <div className="hidden border-t border-slate-200 bg-white px-6 py-5 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <div>
            <p className="text-sm font-black">Selected: {activeTemplate.name}</p>
            <p className="text-xs text-slate-500">
              ATS score {activeTemplate.ats}% · {activeTemplate.category}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowOldCVPopup(true)}
            className="rounded-full bg-slate-900 px-8 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-700"
          >
            Use This Template
          </button>
        </div>
      </div>

      {showOldCVPopup && (
        <OldCVPopup
          template={activeTemplate}
          onClose={() => setShowOldCVPopup(false)}
        />
      )}
    </main>
  );
}