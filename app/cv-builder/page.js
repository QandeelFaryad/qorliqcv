"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const colorPalettes = [
  { name: "Gold", value: "#B88A2C" },
  { name: "Blue", value: "#2563EB" },
  { name: "Black", value: "#111827" },
  { name: "Green", value: "#059669" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Red", value: "#DC2626" },
  { name: "Teal", value: "#0F766E" },
  { name: "Brown", value: "#92400E" },
];

const cvTemplates = [
  {
    id: "executive-gold",
    name: "Executive Gold",
    category: "Professional",
    style: "executive",
    photo: false,
    accent: "#B88A2C",
    ats: 92,
    tag: "Executive",
  },
  {
    id: "modern-black",
    name: "Modern Black",
    category: "Modern",
    style: "sidebar",
    photo: true,
    accent: "#111827",
    ats: 90,
    tag: "Photo",
  },
  {
    id: "clean-ats",
    name: "Clean ATS",
    category: "ATS",
    style: "clean",
    photo: false,
    accent: "#2563EB",
    ats: 98,
    tag: "ATS",
  },
  {
    id: "creative-edge",
    name: "Creative Edge",
    category: "Creative",
    style: "creative",
    photo: true,
    accent: "#7C3AED",
    ats: 88,
    tag: "Creative",
  },
  {
    id: "classic-pro",
    name: "Classic Pro",
    category: "Simple",
    style: "classic",
    photo: false,
    accent: "#374151",
    ats: 95,
    tag: "Classic",
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    category: "Professional",
    style: "sidebar",
    photo: true,
    accent: "#1D4ED8",
    ats: 94,
    tag: "Corporate",
  },
  {
    id: "tech-minimal",
    name: "Tech Minimal",
    category: "Modern",
    style: "clean",
    photo: false,
    accent: "#0891B2",
    ats: 93,
    tag: "Tech",
  },
  {
    id: "luxury-ivory",
    name: "Luxury Ivory",
    category: "Professional",
    style: "luxury",
    photo: true,
    accent: "#A16207",
    ats: 91,
    tag: "Premium",
  },
  {
    id: "graduate-fresh",
    name: "Graduate Fresh",
    category: "Simple",
    style: "creative",
    photo: true,
    accent: "#059669",
    ats: 96,
    tag: "Graduate",
  },
  {
    id: "formal-uk",
    name: "Formal UK",
    category: "ATS",
    style: "classic",
    photo: false,
    accent: "#1F2937",
    ats: 97,
    tag: "UK",
  },
  {
    id: "senior-director",
    name: "Senior Director",
    category: "Professional",
    style: "executive",
    photo: false,
    accent: "#92400E",
    ats: 93,
    tag: "Director",
  },
  {
    id: "admin-professional",
    name: "Admin Professional",
    category: "Simple",
    style: "clean",
    photo: false,
    accent: "#475569",
    ats: 96,
    tag: "Admin",
  },
  {
    id: "healthcare-clinical",
    name: "Healthcare Clinical",
    category: "ATS",
    style: "medical",
    photo: true,
    accent: "#0F766E",
    ats: 94,
    tag: "Healthcare",
  },
  {
    id: "sales-leader",
    name: "Sales Leader",
    category: "Modern",
    style: "sidebar",
    photo: true,
    accent: "#DC2626",
    ats: 91,
    tag: "Sales",
  },
  {
    id: "finance-analyst",
    name: "Finance Analyst",
    category: "Professional",
    style: "classic",
    photo: false,
    accent: "#0E7490",
    ats: 95,
    tag: "Finance",
  },

  {
    id: "europass-photo",
    name: "European Photo CV",
    category: "Photo",
    style: "europass",
    photo: true,
    accent: "#1D4ED8",
    ats: 91,
    tag: "EU Photo",
  },
  {
    id: "global-professional",
    name: "Global Professional",
    category: "Professional",
    style: "photo-left",
    photo: true,
    accent: "#334155",
    ats: 93,
    tag: "Global",
  },
  {
    id: "modern-photo",
    name: "Modern Photo",
    category: "Photo",
    style: "photo-top",
    photo: true,
    accent: "#4F46E5",
    ats: 90,
    tag: "Photo",
  },
  {
    id: "premium-photo",
    name: "Premium Photo",
    category: "Photo",
    style: "luxury",
    photo: true,
    accent: "#B45309",
    ats: 89,
    tag: "Premium",
  },
  {
    id: "one-column-ats",
    name: "One Column ATS",
    category: "ATS",
    style: "clean",
    photo: false,
    accent: "#111827",
    ats: 99,
    tag: "ATS",
  },
  {
    id: "minimal-gray",
    name: "Minimal Gray",
    category: "Simple",
    style: "minimal",
    photo: false,
    accent: "#6B7280",
    ats: 96,
    tag: "Minimal",
  },
  {
    id: "timeline-pro",
    name: "Timeline Pro",
    category: "Modern",
    style: "timeline",
    photo: false,
    accent: "#2563EB",
    ats: 92,
    tag: "Timeline",
  },
  {
    id: "consultant-pro",
    name: "Consultant Pro",
    category: "Professional",
    style: "executive",
    photo: false,
    accent: "#0F172A",
    ats: 93,
    tag: "Consultant",
  },
  {
    id: "manager-photo",
    name: "Manager Photo",
    category: "Photo",
    style: "sidebar",
    photo: true,
    accent: "#0E7490",
    ats: 90,
    tag: "Manager",
  },
  {
    id: "academic-formal",
    name: "Academic Formal",
    category: "Simple",
    style: "classic",
    photo: false,
    accent: "#4338CA",
    ats: 94,
    tag: "Academic",
  },
  {
    id: "hospitality-photo",
    name: "Hospitality Photo",
    category: "Photo",
    style: "photo-left",
    photo: true,
    accent: "#EA580C",
    ats: 88,
    tag: "Hospitality",
  },
  {
    id: "developer-clean",
    name: "Developer Clean",
    category: "Modern",
    style: "minimal",
    photo: false,
    accent: "#0891B2",
    ats: 95,
    tag: "Developer",
  },
  {
    id: "hr-professional",
    name: "HR Professional",
    category: "Professional",
    style: "photo-top",
    photo: true,
    accent: "#BE185D",
    ats: 91,
    tag: "HR",
  },
  {
    id: "legal-formal",
    name: "Legal Formal",
    category: "Simple",
    style: "classic",
    photo: false,
    accent: "#44403C",
    ats: 96,
    tag: "Legal",
  },
  {
    id: "marketing-creative",
    name: "Marketing Creative",
    category: "Creative",
    style: "creative",
    photo: true,
    accent: "#DB2777",
    ats: 87,
    tag: "Marketing",
  },
];

const filters = [
  "All Templates",
  "Simple",
  "Modern",
  "Professional",
  "ATS",
  "Creative",
  "Photo",
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

function getRoleByTemplate(template) {
  if (template.name.includes("Finance")) return "Finance Analyst";
  if (template.name.includes("Sales")) return "Sales Team Leader";
  if (template.name.includes("Healthcare")) return "Registered Nurse";
  if (template.name.includes("Tech") || template.name.includes("Developer"))
    return "Full Stack Developer";
  if (template.name.includes("Graduate")) return "Graduate Trainee";
  if (template.name.includes("Executive") || template.name.includes("Director"))
    return "Senior Operations Director";
  if (template.name.includes("Admin")) return "Executive Assistant";
  if (template.name.includes("Marketing")) return "Marketing Specialist";
  if (template.name.includes("Legal")) return "Legal Assistant";
  return cvContent.title;
}

function getNameByTemplate(template) {
  if (template.name.includes("Finance")) return "Noah Edwards";
  if (template.name.includes("Healthcare")) return "Sarah Ahmed";
  if (template.name.includes("Graduate")) return "Adam Khan";
  if (template.name.includes("Creative") || template.name.includes("Marketing"))
    return "Sofia Miller";
  if (template.name.includes("Executive") || template.name.includes("Director"))
    return "James Carter";
  if (template.name.includes("Photo") || template.name.includes("European"))
    return "Maria Laurent";
  return cvContent.name;
}

function PhotoBadge({ accent, shape = "circle" }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-white text-[10px] font-black shadow-md ring-2 ring-white/70 ${
        shape === "square"
          ? "h-12 w-12 rounded-xl"
          : shape === "soft"
          ? "h-14 w-12 rounded-[1rem]"
          : "h-12 w-12 rounded-full"
      }`}
      style={{ color: accent }}
    >
      CV
    </div>
  );
}

function Stepper() {
  return (
    <div className="mx-auto mb-10 grid max-w-3xl grid-cols-3 rounded-2xl border border-white/10 bg-white/[0.045] p-2 shadow-sm backdrop-blur">
      {[
        ["1", "Choose template"],
        ["2", "Enter your details"],
        ["3", "Download CV"],
      ].map(([number, label], index) => (
        <div
          key={label}
          className={`flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-center text-xs font-bold transition ${
            index === 0
              ? "bg-qorliqGold text-black"
              : "bg-transparent text-white/45"
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
              index === 0
                ? "bg-black text-white"
                : "bg-white/10 text-white/50"
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

function CVTemplatePreview({ template, selectedColor }) {
  const accent = selectedColor || template.accent;
  const name = getNameByTemplate(template);
  const role = getRoleByTemplate(template);

  if (template.style === "sidebar") {
    return (
      <div className="h-[330px] overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid h-full grid-cols-[34%_66%]">
          <aside className="p-3 text-white" style={{ backgroundColor: accent }}>
            {template.photo && (
              <div className="mb-3">
                <PhotoBadge accent={accent} />
              </div>
            )}

            <h3 className="text-[10px] font-black leading-tight">{name}</h3>
            <p className="mt-1 text-[7px] leading-3 text-white/75">{role}</p>

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
          <h3 className="mt-1 text-[15px] font-black leading-tight">{name}</h3>
          <p className="mt-1 text-[7px] font-semibold text-white/70">{role}</p>
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
          className="mb-3 flex items-center gap-3 rounded-xl p-3"
          style={{ backgroundColor: `${accent}14` }}
        >
          {template.photo && <PhotoBadge accent={accent} shape="square" />}

          <div>
            <p
              className="text-[6px] font-black uppercase tracking-[0.25em]"
              style={{ color: accent }}
            >
              Creative CV
            </p>
            <h3 className="mt-1 text-[15px] font-black leading-tight text-slate-950">
              {name}
            </h3>
            <p className="mt-1 text-[7px] font-bold" style={{ color: accent }}>
              {role}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            ["Profile", cvContent.summary],
            [
              "Experience",
              "Brand Designer — Studio Nova\n• Designed brand systems for 20+ client campaigns.",
            ],
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
          {template.photo && (
            <div className="mb-2 flex justify-center">
              <PhotoBadge accent={accent} shape="soft" />
            </div>
          )}

          <p
            className="text-[6px] font-black uppercase tracking-[0.28em]"
            style={{ color: accent }}
          >
            Premium CV
          </p>

          <h3 className="mt-2 font-serif text-[17px] font-bold text-slate-950">
            {name}
          </h3>

          <p className="mt-1 text-[7px] font-semibold text-slate-600">
            {role}
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

  if (template.style === "europass") {
    return (
      <div className="h-[330px] overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="grid h-full grid-cols-[36%_64%]">
          <aside className="bg-[#F1F5F9] p-3">
            <div className="mb-3 flex justify-center">
              <PhotoBadge accent={accent} shape="soft" />
            </div>

            <p
              className="text-center text-[6px] font-black uppercase tracking-widest"
              style={{ color: accent }}
            >
              Europass Style
            </p>

            <h3 className="mt-1 text-center text-[11px] font-black text-slate-950">
              {name}
            </h3>

            <p className="mt-1 text-center text-[7px] font-semibold text-slate-500">
              {role}
            </p>

            <div className="mt-4 space-y-2 text-[6.3px] text-slate-500">
              <p>{cvContent.email}</p>
              <p>{cvContent.phone}</p>
              <p>{cvContent.location}</p>
            </div>

            <div className="mt-4">
              <SectionTitle accent={accent}>Languages</SectionTitle>
              <p className="text-[6.5px] leading-3 text-slate-600">
                English C2
                <br />
                French B2
                <br />
                German B1
              </p>
            </div>
          </aside>

          <main className="space-y-3 p-3">
            <section>
              <SectionTitle accent={accent}>Profile</SectionTitle>
              <p className="text-[6.7px] leading-[1.4] text-slate-600">
                International professional experienced in project coordination,
                reporting, documentation and cross-border communication.
              </p>
            </section>

            <section>
              <SectionTitle accent={accent}>Work Experience</SectionTitle>
              <ExperienceBlock />
            </section>

            <section>
              <SectionTitle accent={accent}>Education</SectionTitle>
              <p className="text-[6.7px] leading-[1.4] text-slate-600">
                MA International Relations — European Business School
              </p>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (template.style === "photo-left") {
    return (
      <div className="h-[330px] overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <header className="flex items-center gap-3 border-b pb-3">
          <PhotoBadge accent={accent} />
          <div>
            <h3 className="text-[14px] font-black leading-tight text-slate-950">
              {name}
            </h3>
            <p className="text-[7px] font-bold" style={{ color: accent }}>
              {role}
            </p>
            <p className="mt-1 text-[6px] text-slate-400">
              {cvContent.email} · {cvContent.phone}
            </p>
          </div>
        </header>

        <main className="mt-3 grid grid-cols-[40%_60%] gap-3">
          <aside className="space-y-3">
            <section>
              <SectionTitle accent={accent}>Skills</SectionTitle>
              <SkillsList />
            </section>
            <section>
              <SectionTitle accent={accent}>Education</SectionTitle>
              <p className="text-[6.7px] text-slate-600">
                {cvContent.education}
              </p>
            </section>
          </aside>

          <div className="space-y-3">
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
          </div>
        </main>
      </div>
    );
  }

  if (template.style === "photo-top") {
    return (
      <div className="h-[330px] overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <header
          className="flex items-center gap-3 p-4 text-white"
          style={{ backgroundColor: accent }}
        >
          <PhotoBadge accent={accent} shape="square" />
          <div>
            <h3 className="text-[14px] font-black leading-tight">{name}</h3>
            <p className="text-[7px] font-semibold text-white/80">{role}</p>
            <p className="mt-1 text-[6px] text-white/60">
              {cvContent.email} · {cvContent.phone}
            </p>
          </div>
        </header>

        <main className="space-y-3 p-4">
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
            <SectionTitle accent={accent}>Skills</SectionTitle>
            <SkillsList />
          </section>
        </main>
      </div>
    );
  }

  if (template.style === "timeline") {
    return (
      <div className="h-[330px] overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <header>
          <h3 className="text-[15px] font-black leading-tight text-slate-950">
            {name}
          </h3>
          <p className="mt-1 text-[7px] font-bold" style={{ color: accent }}>
            {role}
          </p>
        </header>

        <main className="mt-4 space-y-3">
          <section>
            <SectionTitle accent={accent}>Profile</SectionTitle>
            <p className="text-[6.7px] leading-[1.4] text-slate-600">
              {cvContent.summary}
            </p>
          </section>

          <section>
            <SectionTitle accent={accent}>Career Timeline</SectionTitle>
            <div className="space-y-2 border-l-2 pl-3" style={{ borderColor: accent }}>
              {cvContent.experience.map((job) => (
                <div key={job.role} className="relative">
                  <span
                    className="absolute -left-[17px] top-1 h-2 w-2 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <p className="text-[7px] font-black text-slate-900">
                    {job.role}
                  </p>
                  <p className="text-[6.5px] text-slate-500">
                    {job.company} · {job.date}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle accent={accent}>Skills</SectionTitle>
            <SkillsList />
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="h-[330px] overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <header className="border-b pb-3" style={{ borderColor: accent }}>
        <h3 className="text-center text-[15px] font-black leading-tight text-slate-950">
          {name}
        </h3>

        <p
          className="mt-1 text-center text-[7px] font-bold uppercase tracking-[0.18em]"
          style={{ color: accent }}
        >
          {role}
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

function TemplateCard({ template, selected, onSelect, selectedColor }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group rounded-2xl border p-3 text-left transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        selected
          ? "border-qorliqGold bg-qorliqGold/10 shadow-xl shadow-qorliqGold/10"
          : "border-white/10 bg-white/[0.045] shadow-sm hover:border-white/25 hover:bg-white/[0.07]"
      }`}
    >
      <div className="relative overflow-hidden rounded-xl">
        <div className="transition duration-500 group-hover:scale-[1.025]">
          <CVTemplatePreview template={template} selectedColor={selectedColor} />
        </div>

        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-black text-slate-700 shadow">
          {template.tag}
        </span>

        {template.photo && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/80 px-3 py-1 text-[10px] font-black text-white shadow">
            Photo
          </span>
        )}

        {selected && (
          <span className="absolute right-3 top-3 rounded-full bg-qorliqGold px-3 py-1 text-[10px] font-black text-black shadow">
            Selected
          </span>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-white">{template.name}</h3>
          <p className="mt-1 text-xs font-medium text-white/45">
            {template.category} CV template
          </p>
        </div>

        <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-black text-emerald-300">
          {template.ats}% ATS
        </span>
      </div>
    </button>
  );
}

function OldCVPopup({ template, selectedColor, onClose }) {
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
        selectedColor,
        ...result.data,
      };

      localStorage.setItem("qorliq-old-cv-data", JSON.stringify(oldCVData));
      router.push(
        `/cv-builder/create?template=${template.id}&color=${encodeURIComponent(
          selectedColor || template.accent
        )}&oldcv=yes`
      );
    } catch (error) {
      console.error("Old CV upload error:", error);
      alert("Unable to upload or extract this CV.");
    } finally {
      setUploading(false);
    }
  };

  const goEmptyCreate = () => {
    localStorage.removeItem("qorliq-old-cv-data");
    router.push(
      `/cv-builder/create?template=${template.id}&color=${encodeURIComponent(
        selectedColor || template.accent
      )}`
    );
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/65 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#17181D] p-5 text-white shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
              Selected Template
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              {template.name}
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/55">
              Upload your old CV to prepare the new CV faster, or start with an
              empty professional template.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-white/70 hover:bg-white/10"
          >
            ×
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-qorliqGold/30 bg-qorliqGold/10 p-5">
            <h3 className="text-xl font-black">Yes, I have old CV</h3>

            <p className="mt-2 text-sm leading-6 text-white/55">
              Upload PDF, DOC, DOCX or TXT. Your details will be extracted and
              prepared inside the selected template.
            </p>

            <label className="mt-5 block cursor-pointer rounded-full bg-qorliqGold px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-black transition hover:bg-white">
              {uploading ? "Reading CV..." : "Upload Old CV"}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleOldCVUpload}
                className="hidden"
              />
            </label>

            {uploadedFileName && (
              <p className="mt-3 text-xs font-semibold text-white/45">
                Uploaded: {uploadedFileName}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-xl font-black">No, start empty</h3>

            <p className="mt-2 text-sm leading-6 text-white/55">
              Open the selected CV template with an empty form and fill your
              details manually.
            </p>

            <button
              type="button"
              onClick={goEmptyCreate}
              className="mt-5 w-full rounded-full border border-white/10 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition hover:bg-qorliqGold"
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
  const [selectedColor, setSelectedColor] = useState("");

  const [showOldCVPopup, setShowOldCVPopup] = useState(false);

  const filteredTemplates = useMemo(() => {
    if (activeFilter === "All Templates") return cvTemplates;
    return cvTemplates.filter((template) => template.category === activeFilter);
  }, [activeFilter]);

  const activeTemplate =
    cvTemplates.find((template) => template.id === selectedTemplateId) ||
    cvTemplates[0];

  const finalColor = selectedColor || activeTemplate.accent;

  return (
    <main className="min-h-screen overflow-hidden bg-[#101116] pb-24 text-white md:pb-0">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-12%] top-[-10%] h-[34rem] w-[34rem] animate-pulse rounded-full bg-qorliqGold/[0.07] blur-[140px]" />
        <div className="absolute right-[-12%] top-[25%] h-[38rem] w-[38rem] rounded-full bg-blue-600/[0.06] blur-[160px]" />
        <div className="absolute bottom-[-20%] left-[30%] h-[30rem] w-[30rem] rounded-full bg-emerald-500/[0.035] blur-[140px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
        <Stepper />

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
            Resume Templates
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Choose your professional CV template
          </h1>

          <p className="mt-4 text-base leading-7 text-white/55">
            Select from 30 professional CV templates, including modern photo CV,
            Europass-style photo CV, ATS CV, executive CV and creative CV
            layouts.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">
                Choose Template Color
              </p>
              <p className="mt-1 text-sm text-white/55">
                User can select template color according to choice.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {colorPalettes.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black transition ${
                    finalColor === color.value
                      ? "border-qorliqGold bg-qorliqGold text-black"
                      : "border-white/10 bg-white/[0.04] text-white/60 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-white/30"
                    style={{ backgroundColor: color.value }}
                  />
                  {color.name}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setSelectedColor("")}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/60 hover:border-white/25 hover:text-white"
              >
                Default
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center md:overflow-visible">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-xs font-black transition ${
                activeFilter === filter
                  ? "border-qorliqGold bg-qorliqGold text-black"
                  : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white"
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
              selectedColor={finalColor}
              onSelect={() => setSelectedTemplateId(template.id)}
            />
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-white/10 bg-[#17181D]/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setShowOldCVPopup(true)}
          className="w-full rounded-full bg-qorliqGold px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-black shadow-xl shadow-qorliqGold/[0.15] transition active:scale-[0.98]"
        >
          Use This Template
        </button>

        <p className="mt-1 text-center text-[10px] font-semibold text-white/45">
          Selected: {activeTemplate.name} · Color:{" "}
          {colorPalettes.find((c) => c.value === finalColor)?.name || "Default"}
        </p>
      </div>

      <div className="hidden border-t border-white/10 bg-[#17181D]/95 px-6 py-5 backdrop-blur md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <div>
            <p className="text-sm font-black text-white">
              Selected: {activeTemplate.name}
            </p>
            <p className="text-xs text-white/45">
              ATS score {activeTemplate.ats}% · {activeTemplate.category} ·{" "}
              {activeTemplate.photo ? "Photo CV" : "No Photo CV"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowOldCVPopup(true)}
            className="rounded-full bg-qorliqGold px-8 py-3 text-xs font-black uppercase tracking-widest text-black transition hover:bg-white"
          >
            Use This Template
          </button>
        </div>
      </div>

      {showOldCVPopup && (
        <OldCVPopup
          template={activeTemplate}
          selectedColor={finalColor}
          onClose={() => setShowOldCVPopup(false)}
        />
      )}
    </main>
  );
}