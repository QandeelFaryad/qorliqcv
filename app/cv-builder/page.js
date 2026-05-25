"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const cvTemplates = [
  { id: "executive-gold-photo", name: "Executive Gold Photo", category: "Professional", layout: "executive", photo: true, photoStyle: "circle", accent: "#B88A2C", dark: "#111827", ats: 92, tag: "Executive" },
  { id: "modern-black-photo", name: "Modern Black Photo", category: "Modern", layout: "sidebar", photo: true, photoStyle: "square", accent: "#111827", dark: "#020617", ats: 90, tag: "Modern" },
  { id: "clean-ats", name: "Clean ATS", category: "ATS", layout: "clean", photo: false, photoStyle: "none", accent: "#2563EB", dark: "#0F172A", ats: 98, tag: "ATS" },
  { id: "creative-edge-photo", name: "Creative Edge Photo", category: "Creative", layout: "creative", photo: true, photoStyle: "blob", accent: "#7C3AED", dark: "#312E81", ats: 88, tag: "Creative" },
  { id: "classic-pro", name: "Classic Pro", category: "Simple", layout: "classic", photo: false, photoStyle: "none", accent: "#374151", dark: "#111827", ats: 95, tag: "Classic" },
  { id: "corporate-blue-photo", name: "Corporate Blue Photo", category: "Professional", layout: "sidebar", photo: true, photoStyle: "circle-ring", accent: "#1D4ED8", dark: "#1E3A8A", ats: 94, tag: "Corporate" },
  { id: "tech-minimal", name: "Tech Minimal", category: "Modern", layout: "minimal", photo: false, photoStyle: "none", accent: "#0891B2", dark: "#164E63", ats: 93, tag: "Tech" },
  { id: "luxury-ivory-photo", name: "Luxury Ivory Photo", category: "Professional", layout: "luxury", photo: true, photoStyle: "oval", accent: "#A16207", dark: "#422006", ats: 91, tag: "Premium" },
  { id: "graduate-fresh-photo", name: "Graduate Fresh Photo", category: "Simple", layout: "cards", photo: true, photoStyle: "soft", accent: "#059669", dark: "#064E3B", ats: 96, tag: "Graduate" },
  { id: "formal-uk", name: "Formal UK", category: "ATS", layout: "classic", photo: false, photoStyle: "none", accent: "#1F2937", dark: "#111827", ats: 97, tag: "UK" },
  { id: "senior-director", name: "Senior Director", category: "Professional", layout: "executive", photo: false, photoStyle: "none", accent: "#92400E", dark: "#111827", ats: 93, tag: "Director" },
  { id: "admin-professional-photo", name: "Admin Professional Photo", category: "Simple", layout: "clean", photo: true, photoStyle: "circle", accent: "#475569", dark: "#1E293B", ats: 96, tag: "Admin" },
  { id: "healthcare-clinical-photo", name: "Healthcare Clinical Photo", category: "ATS", layout: "leftline", photo: true, photoStyle: "rounded", accent: "#0F766E", dark: "#134E4A", ats: 94, tag: "Healthcare" },
  { id: "sales-leader-photo", name: "Sales Leader Photo", category: "Modern", layout: "split", photo: true, photoStyle: "circle-ring", accent: "#DC2626", dark: "#7F1D1D", ats: 91, tag: "Sales" },
  { id: "finance-analyst", name: "Finance Analyst", category: "Professional", layout: "clean", photo: false, photoStyle: "none", accent: "#0E7490", dark: "#164E63", ats: 95, tag: "Finance" },
  { id: "europass-clean-photo", name: "Europass Clean Photo", category: "International", layout: "eu", photo: true, photoStyle: "eu", accent: "#1E40AF", dark: "#172554", ats: 96, tag: "EU" },
  { id: "dubai-corporate-photo", name: "Dubai Corporate Photo", category: "International", layout: "sidebar", photo: true, photoStyle: "square", accent: "#0F766E", dark: "#022C22", ats: 92, tag: "Gulf" },
  { id: "canada-simple", name: "Canada Simple", category: "International", layout: "leftline", photo: false, photoStyle: "none", accent: "#B91C1C", dark: "#7F1D1D", ats: 97, tag: "Canada" },
  { id: "academic-scholar", name: "Academic Scholar", category: "ATS", layout: "academic", photo: false, photoStyle: "none", accent: "#4338CA", dark: "#312E81", ats: 96, tag: "Academic" },
  { id: "legal-advisor", name: "Legal Advisor", category: "Professional", layout: "classic", photo: false, photoStyle: "none", accent: "#4B5563", dark: "#111827", ats: 94, tag: "Legal" },
  { id: "hospitality-premium-photo", name: "Hospitality Premium Photo", category: "Creative", layout: "luxury", photo: true, photoStyle: "oval", accent: "#BE123C", dark: "#881337", ats: 89, tag: "Hospitality" },
  { id: "engineer-grid", name: "Engineer Grid", category: "Modern", layout: "grid", photo: false, photoStyle: "none", accent: "#EA580C", dark: "#7C2D12", ats: 93, tag: "Engineer" },
  { id: "teacher-friendly-photo", name: "Teacher Friendly Photo", category: "Simple", layout: "cards", photo: true, photoStyle: "soft", accent: "#16A34A", dark: "#14532D", ats: 94, tag: "Teacher" },
  { id: "project-manager", name: "Project Manager", category: "Professional", layout: "timeline", photo: false, photoStyle: "none", accent: "#9333EA", dark: "#581C87", ats: 95, tag: "PM" },
  { id: "customer-service-photo", name: "Customer Service Photo", category: "Simple", layout: "split", photo: true, photoStyle: "rounded", accent: "#0284C7", dark: "#075985", ats: 93, tag: "Service" },
  { id: "marketing-bold-photo", name: "Marketing Bold Photo", category: "Creative", layout: "creative", photo: true, photoStyle: "blob", accent: "#DB2777", dark: "#831843", ats: 88, tag: "Marketing" },
  { id: "hr-professional", name: "HR Professional", category: "Professional", layout: "leftline", photo: false, photoStyle: "none", accent: "#64748B", dark: "#334155", ats: 96, tag: "HR" },
  { id: "data-analyst", name: "Data Analyst", category: "Modern", layout: "minimal", photo: false, photoStyle: "none", accent: "#06B6D4", dark: "#155E75", ats: 95, tag: "Data" },
  { id: "personal-assistant-photo", name: "Personal Assistant Photo", category: "Simple", layout: "sidebar", photo: true, photoStyle: "circle", accent: "#4F46E5", dark: "#312E81", ats: 94, tag: "PA" },
  { id: "premium-monogram", name: "Premium Monogram", category: "Professional", layout: "monogram", photo: false, photoStyle: "none", accent: "#CA8A04", dark: "#422006", ats: 92, tag: "Luxury" },
];

const filters = [
  "All Templates",
  "Photo CV",
  "Simple",
  "Modern",
  "Professional",
  "ATS",
  "Creative",
  "International",
];

const sampleProfiles = {
  "executive-gold-photo": { name: "Emma Williams", title: "Head of Operations" },
  "modern-black-photo": { name: "Daniel Carter", title: "Product Designer" },
  "clean-ats": { name: "Oliver Smith", title: "Operations Manager" },
  "creative-edge-photo": { name: "Sofia Miller", title: "Brand Designer" },
  "classic-pro": { name: "George Wilson", title: "Business Administrator" },
  "corporate-blue-photo": { name: "James Brown", title: "Corporate Manager" },
  "tech-minimal": { name: "Noah Edwards", title: "Full Stack Developer" },
  "luxury-ivory-photo": { name: "Amelia Grant", title: "Client Relationship Manager" },
  "graduate-fresh-photo": { name: "Adam Khan", title: "Computer Science Graduate" },
  "formal-uk": { name: "William Taylor", title: "Office Manager" },
  "senior-director": { name: "James Carter", title: "Senior Director" },
  "admin-professional-photo": { name: "Aisha Khan", title: "Executive Assistant" },
  "healthcare-clinical-photo": { name: "Sarah Ahmed", title: "Registered Nurse" },
  "sales-leader-photo": { name: "Lucas Martin", title: "Sales Team Leader" },
  "finance-analyst": { name: "Noah Edwards", title: "Finance Analyst" },
  "europass-clean-photo": { name: "Marta Rossi", title: "EU Project Coordinator" },
  "dubai-corporate-photo": { name: "Omar Hassan", title: "Business Development Manager" },
  "canada-simple": { name: "Ethan Clark", title: "Administrative Officer" },
  "academic-scholar": { name: "Dr. Hannah Lewis", title: "Research Associate" },
  "legal-advisor": { name: "Arthur Bennett", title: "Legal Advisor" },
  "hospitality-premium-photo": { name: "Lina Brooks", title: "Guest Relations Manager" },
  "engineer-grid": { name: "Ryan Cooper", title: "Mechanical Engineer" },
  "teacher-friendly-photo": { name: "Mary Johnson", title: "Primary Teacher" },
  "project-manager": { name: "Hassan Ali", title: "Project Manager" },
  "customer-service-photo": { name: "Emily Davis", title: "Customer Service Specialist" },
  "marketing-bold-photo": { name: "Chloe Evans", title: "Marketing Executive" },
  "hr-professional": { name: "Grace Turner", title: "HR Coordinator" },
  "data-analyst": { name: "Ben Walker", title: "Data Analyst" },
  "personal-assistant-photo": { name: "Mia Thompson", title: "Personal Assistant" },
  "premium-monogram": { name: "Isabella Moore", title: "Executive Consultant" },
};

const baseContent = {
  email: "candidate@email.com",
  phone: "+44 7700 123456",
  location: "London, UK",
  summary:
    "Results-driven professional with strong experience improving operations, service delivery, reporting and team performance in fast-paced business environments.",
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
    "Operations",
    "Microsoft Excel",
    "Reporting",
    "Team Coordination",
    "Communication",
    "Planning",
  ],
  education: "BA Business Management — University of Manchester",
};

function getProfile(template) {
  return {
    ...baseContent,
    ...(sampleProfiles[template.id] || sampleProfiles["clean-ats"]),
  };
}

function Stepper() {
  return (
    <div className="mx-auto mb-10 grid max-w-3xl grid-cols-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {[["1", "Choose template"], ["2", "Enter your details"], ["3", "Download CV"]].map(
        ([number, label], index) => (
          <div
            key={label}
            className={`flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-center text-xs font-bold ${
              index === 0 ? "bg-slate-900 text-white" : "bg-transparent text-slate-500"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                index === 0 ? "bg-white text-slate-900" : "bg-slate-100 text-slate-500"
              }`}
            >
              {number}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        )
      )}
    </div>
  );
}

function PhotoMark({ template, large = false }) {
  if (!template.photo) return null;

  const size = large ? "h-24 w-24 text-3xl" : "h-12 w-12 text-sm";
  const common =
    "flex shrink-0 items-center justify-center bg-white font-black shadow-sm ring-2 ring-white/70";
  const shape =
    template.photoStyle === "square"
      ? "rounded-xl"
      : template.photoStyle === "rounded"
      ? "rounded-2xl"
      : template.photoStyle === "oval"
      ? "rounded-[45%]"
      : template.photoStyle === "blob"
      ? "rounded-[42%_58%_55%_45%/48%_42%_58%_52%]"
      : template.photoStyle === "eu"
      ? "rounded-md"
      : template.photoStyle === "soft"
      ? "rounded-[1.4rem]"
      : "rounded-full";

  return (
    <div
      className={`${common} ${shape} ${size}`}
      style={{
        color: template.accent,
        border: template.photoStyle === "circle-ring" ? `3px solid ${template.accent}` : "none",
      }}
    >
      {large ? "CV" : "CV"}
    </div>
  );
}

function SectionTitle({ children, accent, light = false }) {
  return (
    <p
      className={`mb-1 border-b pb-1 text-[7px] font-black uppercase tracking-[0.16em] ${
        light ? "text-white" : ""
      }`}
      style={{ color: light ? "white" : accent, borderColor: light ? "rgba(255,255,255,.25)" : `${accent}55` }}
    >
      {children}
    </p>
  );
}

function ExperienceBlock({ light = false }) {
  return (
    <div className="space-y-2">
      {baseContent.experience.map((job) => (
        <div key={job.role}>
          <div className="flex justify-between gap-2">
            <p className={`text-[7px] font-black ${light ? "text-white" : "text-slate-900"}`}>{job.role}</p>
            <p className={`whitespace-nowrap text-[6px] font-bold ${light ? "text-white/55" : "text-slate-400"}`}>
              {job.date}
            </p>
          </div>
          <p className={`text-[6.5px] font-semibold ${light ? "text-white/70" : "text-slate-500"}`}>{job.company}</p>
          <ul className="mt-1 space-y-0.5">
            {job.points.map((point) => (
              <li key={point} className={`text-[6.5px] leading-[1.35] ${light ? "text-white/70" : "text-slate-600"}`}>
                • {point}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SkillsList({ template, dark = false }) {
  return (
    <div className="flex flex-wrap gap-1">
      {baseContent.skills.map((skill) => (
        <span
          key={skill}
          className={`rounded-full px-2 py-1 text-[5.8px] font-bold ${
            dark ? "bg-white/15 text-white/80" : "bg-slate-100 text-slate-600"
          }`}
          style={!dark ? { backgroundColor: `${template.accent}12` } : undefined}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

function HeaderLine({ template, profile, centered = false }) {
  return (
    <header className={`${centered ? "text-center" : ""} border-b pb-3`} style={{ borderColor: template.accent }}>
      <div className={`flex gap-3 ${centered ? "flex-col items-center" : "items-center"}`}>
        <PhotoMark template={template} />
        <div>
          <h3 className="text-[15px] font-black leading-tight text-slate-950">{profile.name}</h3>
          <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.18em]" style={{ color: template.accent }}>
            {profile.title}
          </p>
          <p className="mt-1 text-[6.3px] text-slate-400">
            {profile.email} · {profile.phone} · {profile.location}
          </p>
        </div>
      </div>
    </header>
  );
}

function CVTemplatePreview({ template, full = false }) {
  const profile = getProfile(template);
  const h = full ? "min-h-[760px]" : "h-[330px]";
  const scaleText = full ? "text-[12px]" : "text-[6.7px]";

  if (template.layout === "sidebar") {
    return (
      <div className={`${h} overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200`}>
        <div className="grid h-full grid-cols-[35%_65%]">
          <aside className="p-3 text-white" style={{ backgroundColor: template.accent }}>
            <PhotoMark template={template} large={full} />
            <h3 className={`${full ? "mt-5 text-3xl" : "mt-3 text-[10px]"} font-black leading-tight`}>{profile.name}</h3>
            <p className={`${full ? "mt-2 text-sm" : "mt-1 text-[7px]"} leading-3 text-white/75`}>{profile.title}</p>
            <div className={`${full ? "mt-8 text-xs leading-6" : "mt-4 text-[6.2px] leading-3"} space-y-1.5 text-white/70`}>
              <p>{profile.email}</p>
              <p>{profile.phone}</p>
              <p>{profile.location}</p>
            </div>
            <div className={full ? "mt-8" : "mt-4"}>
              <SectionTitle accent={template.accent} light>Skills</SectionTitle>
              <SkillsList template={template} dark />
            </div>
          </aside>
          <main className={`${full ? "space-y-7 p-8" : "space-y-3 p-3"}`}>
            <section>
              <SectionTitle accent={template.accent}>Profile</SectionTitle>
              <p className={`${scaleText} leading-[1.55] text-slate-600`}>{profile.summary}</p>
            </section>
            <section>
              <SectionTitle accent={template.accent}>Experience</SectionTitle>
              <ExperienceBlock />
            </section>
            <section>
              <SectionTitle accent={template.accent}>Education</SectionTitle>
              <p className={`${scaleText} leading-[1.55] text-slate-600`}>{profile.education}</p>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (template.layout === "executive") {
    return (
      <div className={`${h} overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200`}>
        <header className={`${full ? "p-8" : "p-4"} text-white`} style={{ backgroundColor: template.dark }}>
          <div className="flex items-center gap-4">
            <PhotoMark template={template} large={full} />
            <div>
              <p className={`${full ? "text-xs" : "text-[6px]"} font-black uppercase tracking-[0.25em]`} style={{ color: template.accent }}>
                Executive CV
              </p>
              <h3 className={`${full ? "mt-2 text-4xl" : "mt-1 text-[15px]"} font-black leading-tight`}>{profile.name}</h3>
              <p className={`${full ? "mt-2 text-base" : "mt-1 text-[7px]"} font-semibold text-white/70`}>{profile.title}</p>
            </div>
          </div>
        </header>
        <div className={`${full ? "grid-cols-[35%_65%] gap-8 p-8" : "grid-cols-[38%_62%] gap-3 p-3"} grid`}>
          <aside className="space-y-3">
            <section><SectionTitle accent={template.accent}>Core Skills</SectionTitle><SkillsList template={template} /></section>
            <section><SectionTitle accent={template.accent}>Education</SectionTitle><p className={`${scaleText} leading-[1.45] text-slate-600`}>{profile.education}</p></section>
          </aside>
          <main className="space-y-3">
            <section><SectionTitle accent={template.accent}>Leadership Profile</SectionTitle><p className={`${scaleText} leading-[1.45] text-slate-600`}>{profile.summary}</p></section>
            <section><SectionTitle accent={template.accent}>Experience</SectionTitle><ExperienceBlock /></section>
          </main>
        </div>
      </div>
    );
  }

  if (template.layout === "creative") {
    return (
      <div className={`${h} overflow-hidden rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200`}>
        <div className={`${full ? "p-7" : "p-3"} mb-3 rounded-xl`} style={{ backgroundColor: `${template.accent}14` }}>
          <div className="flex items-center gap-4">
            <PhotoMark template={template} large={full} />
            <div>
              <p className={`${full ? "text-xs" : "text-[6px]"} font-black uppercase tracking-[0.25em]`} style={{ color: template.accent }}>Creative CV</p>
              <h3 className={`${full ? "mt-2 text-4xl" : "mt-1 text-[15px]"} font-black leading-tight text-slate-950`}>{profile.name}</h3>
              <p className={`${full ? "mt-2 text-base" : "mt-1 text-[7px]"} font-bold`} style={{ color: template.accent }}>{profile.title}</p>
            </div>
          </div>
        </div>
        <div className={`${full ? "grid-cols-2 gap-5 p-3" : "grid-cols-2 gap-2"} grid`}>
          {[["Profile", profile.summary], ["Experience", "Brand Designer — Studio Nova\n• Designed brand systems for 20+ client campaigns."], ["Skills", profile.skills.join(" · ")], ["Education", profile.education]].map(([title, text]) => (
            <section key={title} className={`${full ? "p-5" : "p-2"} rounded-lg bg-slate-50`}>
              <SectionTitle accent={template.accent}>{title}</SectionTitle>
              <p className={`${scaleText} whitespace-pre-line leading-[1.45] text-slate-600`}>{text}</p>
            </section>
          ))}
        </div>
      </div>
    );
  }

  if (template.layout === "luxury" || template.layout === "monogram") {
    return (
      <div className={`${h} overflow-hidden rounded-xl bg-[#FBF7EF] ${full ? "p-8" : "p-4"} shadow-sm ring-1 ring-slate-200`}>
        <div className="text-center">
          <div className="flex justify-center"><PhotoMark template={template} large={full} /></div>
          {!template.photo && (
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white font-serif text-xl font-black shadow-sm" style={{ color: template.accent }}>
              {profile.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}
            </div>
          )}
          <p className={`${full ? "mt-5 text-xs" : "mt-2 text-[6px]"} font-black uppercase tracking-[0.28em]`} style={{ color: template.accent }}>Premium CV</p>
          <h3 className={`${full ? "mt-3 text-4xl" : "mt-2 text-[17px]"} font-serif font-bold text-slate-950`}>{profile.name}</h3>
          <p className={`${full ? "mt-2 text-base" : "mt-1 text-[7px]"} font-semibold text-slate-600`}>{profile.title}</p>
          <div className="mx-auto mt-3 h-[2px] w-16 rounded-full" style={{ backgroundColor: template.accent }} />
        </div>
        <div className={`${full ? "mt-8 space-y-7" : "mt-4 space-y-3"}`}>
          <section><SectionTitle accent={template.accent}>Profile</SectionTitle><p className={`${scaleText} leading-[1.45] text-slate-600`}>{profile.summary}</p></section>
          <section><SectionTitle accent={template.accent}>Experience</SectionTitle><ExperienceBlock /></section>
          <section><SectionTitle accent={template.accent}>Skills</SectionTitle><SkillsList template={template} /></section>
        </div>
      </div>
    );
  }

  if (template.layout === "split") {
    return (
      <div className={`${h} overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200`}>
        <div className="grid h-full grid-rows-[38%_62%]">
          <header className="flex items-center gap-4 p-4 text-white" style={{ backgroundColor: template.accent }}>
            <PhotoMark template={template} large={full} />
            <div>
              <h3 className={`${full ? "text-4xl" : "text-[15px]"} font-black leading-tight`}>{profile.name}</h3>
              <p className={`${full ? "text-base" : "text-[7px]"} mt-1 text-white/75`}>{profile.title}</p>
            </div>
          </header>
          <main className={`${full ? "grid grid-cols-2 gap-6 p-8" : "grid grid-cols-2 gap-2 p-3"}`}>
            <section><SectionTitle accent={template.accent}>Profile</SectionTitle><p className={`${scaleText} leading-[1.4] text-slate-600`}>{profile.summary}</p></section>
            <section><SectionTitle accent={template.accent}>Experience</SectionTitle><ExperienceBlock /></section>
          </main>
        </div>
      </div>
    );
  }

  if (template.layout === "grid") {
    return (
      <div className={`${h} overflow-hidden rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200`}>
        <HeaderLine template={template} profile={profile} />
        <div className={`${full ? "mt-7 grid-cols-2 gap-5" : "mt-3 grid-cols-2 gap-2"} grid`}>
          {["Profile", "Experience", "Skills", "Education"].map((title) => (
            <section key={title} className={`${full ? "p-5" : "p-2"} rounded-lg border border-slate-200`}>
              <SectionTitle accent={template.accent}>{title}</SectionTitle>
              {title === "Experience" ? <ExperienceBlock /> : title === "Skills" ? <SkillsList template={template} /> : <p className={`${scaleText} leading-[1.4] text-slate-600`}>{title === "Profile" ? profile.summary : profile.education}</p>}
            </section>
          ))}
        </div>
      </div>
    );
  }

  if (template.layout === "timeline") {
    return (
      <div className={`${h} overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200`}>
        <HeaderLine template={template} profile={profile} />
        <main className={`${full ? "mt-8 space-y-8" : "mt-4 space-y-3"} border-l-2 pl-4`} style={{ borderColor: template.accent }}>
          <section><SectionTitle accent={template.accent}>Profile</SectionTitle><p className={`${scaleText} text-slate-600`}>{profile.summary}</p></section>
          <section><SectionTitle accent={template.accent}>Project Experience</SectionTitle><ExperienceBlock /></section>
          <section><SectionTitle accent={template.accent}>Skills</SectionTitle><SkillsList template={template} /></section>
        </main>
      </div>
    );
  }

  if (template.layout === "eu") {
    return (
      <div className={`${h} overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200`}>
        <header className={`${full ? "p-7" : "p-3"} flex items-center gap-4 border-b-4`} style={{ borderColor: template.accent }}>
          <PhotoMark template={template} large={full} />
          <div>
            <p className={`${full ? "text-xs" : "text-[6px]"} font-black uppercase tracking-widest`} style={{ color: template.accent }}>European Format</p>
            <h3 className={`${full ? "text-4xl" : "text-[15px]"} font-black text-slate-950`}>{profile.name}</h3>
            <p className={`${full ? "text-base" : "text-[7px]"} font-semibold text-slate-500`}>{profile.title}</p>
          </div>
        </header>
        <main className={`${full ? "space-y-7 p-8" : "space-y-3 p-3"}`}>
          <section><SectionTitle accent={template.accent}>Personal Statement</SectionTitle><p className={`${scaleText} text-slate-600`}>{profile.summary}</p></section>
          <section><SectionTitle accent={template.accent}>Work Experience</SectionTitle><ExperienceBlock /></section>
          <section><SectionTitle accent={template.accent}>Competencies</SectionTitle><SkillsList template={template} /></section>
        </main>
      </div>
    );
  }

  if (template.layout === "academic") {
    return (
      <div className={`${h} overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200`}>
        <h3 className={`${full ? "text-4xl" : "text-[15px]"} text-center font-serif font-black text-slate-950`}>{profile.name}</h3>
        <p className={`${full ? "text-base" : "text-[7px]"} mt-1 text-center font-bold`} style={{ color: template.accent }}>{profile.title}</p>
        <main className={`${full ? "mt-8 space-y-7" : "mt-4 space-y-3"}`}>
          <section><SectionTitle accent={template.accent}>Research Profile</SectionTitle><p className={`${scaleText} text-slate-600`}>{profile.summary}</p></section>
          <section><SectionTitle accent={template.accent}>Academic Experience</SectionTitle><ExperienceBlock /></section>
          <section><SectionTitle accent={template.accent}>Education</SectionTitle><p className={`${scaleText} text-slate-600`}>{profile.education}</p></section>
        </main>
      </div>
    );
  }

  return (
    <div className={`${h} overflow-hidden rounded-xl bg-white ${full ? "p-8" : "p-4"} shadow-sm ring-1 ring-slate-200`}>
      <HeaderLine template={template} profile={profile} centered={template.layout === "classic"} />
      <main className={`${full ? "mt-8 space-y-7" : "mt-3 space-y-3"}`}>
        <section><SectionTitle accent={template.accent}>Professional Summary</SectionTitle><p className={`${scaleText} leading-[1.4] text-slate-600`}>{profile.summary}</p></section>
        <section><SectionTitle accent={template.accent}>Employment History</SectionTitle><ExperienceBlock /></section>
        <section><SectionTitle accent={template.accent}>Skills</SectionTitle><SkillsList template={template} /></section>
        <section><SectionTitle accent={template.accent}>Education</SectionTitle><p className={`${scaleText} leading-[1.4] text-slate-600`}>{profile.education}</p></section>
      </main>
    </div>
  );
}

function TemplateCard({ template, selected, onSelect, onPreview }) {
  return (
    <div className={`group rounded-2xl border bg-white p-3 text-left transition hover:-translate-y-1 hover:shadow-xl ${selected ? "border-slate-900 shadow-xl" : "border-slate-200 shadow-sm hover:border-slate-300"}`}>
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div className="relative">
          <CVTemplatePreview template={template} />
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-black text-slate-700 shadow">{template.tag}</span>
          {template.photo && <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-[10px] font-black text-slate-700 shadow">Photo CV</span>}
          {selected && <span className="absolute right-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black text-white shadow">Selected</span>}
        </div>
      </button>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-950">{template.name}</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">{template.category} CV template</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">{template.ats}% ATS</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={onPreview} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50">
          Preview
        </button>
        <button type="button" onClick={onSelect} className="rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: template.accent }}>
          Select
        </button>
      </div>
    </div>
  );
}

function PreviewModal({ template, onClose, onUse }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-3xl bg-white p-4 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Template Preview</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{template.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{template.category} · {template.ats}% ATS · {template.photo ? "Photo CV" : "No photo CV"}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-500 hover:bg-slate-50">×</button>
        </div>

        <div className="max-h-[72vh] overflow-auto rounded-2xl bg-slate-100 p-4">
          <div className="mx-auto max-w-[720px]">
            <CVTemplatePreview template={template} full />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50">
            Close Preview
          </button>
          <button type="button" onClick={onUse} className="rounded-full bg-slate-900 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-700">
            Use This Template
          </button>
        </div>
      </div>
    </div>
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
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Selected Template</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">{template.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Upload your old CV to prepare the new CV faster, or start with a ready professional sample template.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-500 hover:bg-slate-50">×</button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-xl font-black">Yes, I have old CV</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Upload PDF, DOC, DOCX or TXT. Your details will be extracted and prepared inside the selected template.
            </p>

            <label className="mt-5 block cursor-pointer rounded-full bg-slate-900 px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-700">
              {uploading ? "Reading CV..." : "Upload Old CV"}
              <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleOldCVUpload} className="hidden" />
            </label>

            {uploadedFileName && <p className="mt-3 text-xs font-semibold text-slate-500">Uploaded: {uploadedFileName}</p>}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-xl font-black">No, start with sample</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Open this selected template with ready CV structure and replace the sample details with your own.
            </p>

            <button type="button" onClick={goEmptyCreate} className="mt-5 w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:bg-slate-50">
              Open Selected Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CVBuilderPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(cvTemplates[0].id);
  const [activeFilter, setActiveFilter] = useState("All Templates");
  const [showOldCVPopup, setShowOldCVPopup] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const filteredTemplates = useMemo(() => {
    if (activeFilter === "All Templates") return cvTemplates;
    if (activeFilter === "Photo CV") return cvTemplates.filter((template) => template.photo);
    return cvTemplates.filter((template) => template.category === activeFilter);
  }, [activeFilter]);

  const activeTemplate = cvTemplates.find((template) => template.id === selectedTemplateId) || cvTemplates[0];

  const useTemplateFromPreview = () => {
    if (previewTemplate) {
      setSelectedTemplateId(previewTemplate.id);
      setPreviewTemplate(null);
      setShowOldCVPopup(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#F3F5FA] pb-24 text-slate-950 md:pb-0">
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
        <Stepper />

        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Resume Templates</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            Choose from 30 ready professional CV templates
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-500">
            Every template is already filled with a realistic CV preview, has its own colour style and layout, and includes photo CV options for international applications.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-black">30</p>
            <p className="text-xs font-bold text-slate-500">Ready templates</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-black">{cvTemplates.filter((x) => x.photo).length}</p>
            <p className="text-xs font-bold text-slate-500">Photo CV styles</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-black">ATS</p>
            <p className="text-xs font-bold text-slate-500">Recruiter friendly</p>
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
              onPreview={() => setPreviewTemplate(template)}
            />
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden">
        <button type="button" onClick={() => setShowOldCVPopup(true)} className="w-full rounded-full bg-slate-900 px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-white transition active:scale-[0.98]">
          Use This Template
        </button>
        <p className="mt-1 text-center text-[10px] font-semibold text-slate-500">Selected: {activeTemplate.name}</p>
      </div>

      <div className="hidden border-t border-slate-200 bg-white px-6 py-5 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <div>
            <p className="text-sm font-black">Selected: {activeTemplate.name}</p>
            <p className="text-xs text-slate-500">
              ATS score {activeTemplate.ats}% · {activeTemplate.category} · {activeTemplate.photo ? "Photo CV" : "No photo"}
            </p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setPreviewTemplate(activeTemplate)} className="rounded-full border border-slate-200 bg-white px-8 py-3 text-xs font-black uppercase tracking-widest text-slate-700 transition hover:bg-slate-50">
              Preview
            </button>
            <button type="button" onClick={() => setShowOldCVPopup(true)} className="rounded-full bg-slate-900 px-8 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-700">
              Use This Template
            </button>
          </div>
        </div>
      </div>

      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={useTemplateFromPreview}
        />
      )}

      {showOldCVPopup && (
        <OldCVPopup
          template={activeTemplate}
          onClose={() => setShowOldCVPopup(false)}
        />
      )}
    </main>
  );
}
