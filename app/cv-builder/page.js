"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check, FileText, Search, Sparkles, X, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import CVBuilderHeader from "@/components/CVBuilderHeader";
import CVBuilderFooter from "@/components/CVBuilderFooter";

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

const filters = ["All Templates", "Simple", "Modern", "One column", "With photo", "Professional", "ATS", "Creative", "International"];

const names = {
  "eu-photo-document": ["Marta Rossi", "EU Project Coordinator"],
  "berlin-side-photo": ["Daniel Carter", "Product Designer"],
  "corporate-circle-photo": ["James Brown", "Corporate Manager"],
  "creative-blob-photo": ["Sofia Miller", "Brand Designer"],
  "luxury-oval-photo": ["Amelia Grant", "Client Relationship Manager"],
  "london-executive": ["James Carter", "Head of Operations"],
  "clean-ats": ["Oliver Smith", "Operations Manager"],
  "classic-pro": ["George Wilson", "Business Administrator"],
  "tech-minimal": ["Noah Edwards", "Full Stack Developer"],
  "graduate-fresh": ["Adam Khan", "Computer Science Graduate"],
  "formal-uk": ["William Taylor", "Office Manager"],
  "senior-director": ["James Carter", "Senior Director"],
  "admin-professional": ["Aisha Khan", "Executive Assistant"],
  "healthcare-clinical": ["Sarah Ahmed", "Registered Nurse"],
  "sales-leader": ["Lucas Martin", "Sales Team Leader"],
  "finance-analyst": ["Noah Edwards", "Finance Analyst"],
  "stockholm-clean": ["Emma Williams", "Operations Manager"],
  "dubai-corporate": ["Omar Hassan", "Business Development Manager"],
  "canada-simple": ["Ethan Clark", "Administrative Officer"],
  "academic-scholar": ["Dr. Hannah Lewis", "Research Associate"],
  "legal-advisor": ["Arthur Bennett", "Legal Advisor"],
  "hospitality-premium": ["Lina Brooks", "Guest Relations Manager"],
  "engineer-grid": ["Ryan Cooper", "Mechanical Engineer"],
  "teacher-friendly": ["Mary Johnson", "Primary Teacher"],
  "project-manager": ["Hassan Ali", "Project Manager"],
  "customer-service": ["Emily Davis", "Customer Service Specialist"],
  "marketing-bold": ["Chloe Evans", "Marketing Executive"],
  "hr-professional": ["Grace Turner", "HR Coordinator"],
  "data-analyst": ["Ben Walker", "Data Analyst"],
  "premium-monogram": ["Isabella Moore", "Executive Consultant"],
};
const completeCVData = {
  email: "candidate@email.com",
  phone: "+44 7700 123456",
  location: "London, UK",
  linkedin: "linkedin.com/in/candidate",
  summary:
    "Results-driven professional with over seven years of experience in business operations, project delivery and cross-functional collaboration. Skilled in improving workflows, managing stakeholder relationships and delivering measurable business outcomes.",
  skills: [
    "Operations Management",
    "Project Coordination",
    "Strategic Planning",
    "Business Administration",
    "Stakeholder Relations",
    "Process Improvement",
    "Data Analysis",
    "Team Leadership",
  ],
  education:
    "BA Business Management — University of Manchester (2012 — 2015)",
  certifications: [
    "PRINCE2 Project Management",
    "Advanced Microsoft Excel",
    "Business Administration",
  ],
  languages: [
    "English — Fluent",
    "Arabic — Professional",
  ],
 achievements: [
  "Improved reporting accuracy by 38% through structural pipeline controls.",
  "Successfully managed high-volume client document systems with zero data leaks.",
  "Reduced workflow processing duration by 22% over 12 calendar months.",
],

strengths: [
  "Strong attention to detail",
  "Confident stakeholder communication",
  "Fast learner with ownership mindset",
  "Calm under pressure",
],

hobbies: [
  "Reading business case studies",
  "Community volunteering",
  "Travel and culture",
  "Productivity systems",
],

projects: [
  {
    title: "Operations Reporting Dashboard",
    description:
      "Designed a weekly KPI dashboard that improved management visibility and reduced manual reporting time.",
  },
  {
    title: "Document Control Improvement",
    description:
      "Rebuilt internal filing structure with clear naming rules, access controls, and review checkpoints.",
  },
],

references: [
  "Available upon request",
  "Professional references can be provided after interview stage",
],


  experience: [
    {
      role: "Senior Operations Manager",
      company: "Brightline Services",
      date: "2021 — Present",
      points: [
        "Improved operational efficiency by 38% through redesigned processes and reporting systems.",
        "Managed cross-functional teams and coordinated business operations across multiple departments.",
        "Introduced performance dashboards that improved leadership visibility and decision-making.",
      ],
    },
    {
      role: "Operations Coordinator",
      company: "Apex Group",
      date: "2018 — 2021",
      points: [
        "Coordinated operational planning, reporting and stakeholder communications.",
        "Reduced administrative processing time by 22% through workflow improvements.",
      ],
    },
    {
      role: "Administrative Officer",
      company: "Northfield Business Support",
      date: "2015 — 2018",
      points: [
        "Maintained business documentation and supported executive operations.",
        "Improved internal reporting accuracy and document control procedures.",
      ],
    },
  ]
};
function getProfile(templateId) {
  const [name, title] = names[templateId] || ["Emma Williams", "Operations Manager"];
  return { ...completeCVData, name, title };
}

function Photo({ template, accent, large = false }) {
  if (!template.photo) return null;

  const photos = {
    female: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
    male: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    "male-2": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
    "female-2": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80",
    "female-3": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&q=80",
  };

  const shape =
    {
      eu: "rounded-md",
      square: "rounded-xl",
      "circle-ring": "rounded-full ring-4 ring-white",
      blob: "rounded-[42%_58%_55%_45%/48%_42%_58%_52%]",
      oval: "rounded-[45%]",
    }[template.photoShape] || "rounded-full";

  return (
    <div
      className={`${large ? "h-24 w-24 md:h-28 md:w-28" : "h-14 w-14"} ${shape} shrink-0 overflow-hidden bg-slate-100 shadow`}
      style={{ border: `2px solid ${accent}` }}
    >
      <img src={photos[template.photoType]} alt="Dummy CV profile" className="h-full w-full object-cover" />
    </div>
  );
}

function UnifiedTemplateEngine({ template, selectedColor, large = false }) {
  const p = getProfile(template.id);
  const accent = selectedColor || template.colors[0];
  const dark = template.colors.find((color) => color !== accent) || template.colors[1] || template.colors[0];
  const layout = template.layout;

  const fTitle = large ? "text-[13px] font-black uppercase tracking-[0.12em] mb-2 border-b pb-1" : "text-[7px] font-black uppercase tracking-[0.15em] mb-1.5 border-b pb-1";
  const fName = large ? "text-3xl font-black leading-tight" : "text-[15px] font-black leading-tight";
  const fSub = large ? "text-sm font-bold uppercase tracking-[0.16em]" : "text-[7.5px] font-bold uppercase tracking-[0.14em]";
  const fMeta = large ? "text-[12px] text-slate-600 mt-2" : "text-[6.5px] text-slate-400 mt-1";
  const fBody = large ? "text-[12px] leading-[1.55] text-slate-700" : "text-[7px] leading-[1.4] text-slate-600";
  const fBold = large ? "text-[13px] font-black text-slate-950" : "text-[7.5px] font-black text-slate-900";
  const fDate = large ? "text-[11.5px] font-bold text-slate-600" : "text-[6.5px] font-bold text-slate-400";

  const blockSpace = large ? "space-y-2.5" : "space-y-2";
  const componentMargin = large ? "mt-3.5" : "mt-2.5";
  const paddingClass = large ? "p-8 md:p-10 min-h-[1123px]" : "p-4 h-[410px] overflow-hidden";

  const renderTitle = (text, customAccent = accent) => (
    <p className={fTitle} style={{ color: customAccent, borderColor: `${customAccent}55` }}>{text}</p>
  );

 const renderExperienceList = (light = false) => (
  <div className={blockSpace}>
    {p.experience.map((job) => (
      <div key={job.role}>
        <div className="flex justify-between gap-2">
          <p className={`${fBold} ${light ? "text-white" : ""}`}>
            {job.role}
          </p>

          <p className={`${fDate} ${light ? "text-white/60" : ""}`}>
            {job.date}
          </p>
        </div>

        <p
          className={`${fBody} font-medium ${
            light ? "text-white/70" : "text-slate-500"
          }`}
        >
          {job.company}
        </p>

        <ul className={large ? "mt-1.5 space-y-1 pl-1" : "space-y-0.5"}>
          {job.points.map((point, i) => (
            <li
              key={i}
              className={`${fBody} ${
                light ? "text-white/65" : "text-slate-600"
              }`}
            >
              • {point}
            </li>
          ))}
        </ul>
      </div>
    ))}

    {/* Detailed sections are placed in their original columns, not appended to Experience. */}
  </div>
);

  const renderSkills = (light = false) => (
    <div className="flex flex-wrap gap-1">
      {p.skills.map((skill) => (
        <span key={skill} className={`rounded-full px-1.5 py-0.5 font-bold ${large ? "text-[11px] px-2.5 py-1" : "text-[6px]"} ${light ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"}`}>
          {skill}
        </span>
      ))}
    </div>
  );

  const renderBulletList = (items, light = false) => (
    <ul className={large ? "space-y-0.5" : "space-y-0.5"}>
      {items.map((item, i) => (
        <li key={i} className={`${fBody} ${light ? "text-white/70" : "text-slate-600"}`}>• {item}</li>
      ))}
    </ul>
  );
  const renderProjectList = (light = false) => (
  <div className={large ? "space-y-2" : "space-y-1"}>
    {p.projects.map((project) => (
      <div key={project.title}>
        <p
          className={`${fBold} ${
            light ? "text-white" : "text-slate-900"
          }`}
        >
          {project.title}
        </p>

        <p
          className={`${fBody} ${
            light ? "text-white/70" : "text-slate-600"
          }`}
        >
          {project.description}
        </p>
      </div>
    ))}
  </div>
);
  // Homepage LayoutsSection content parity: these helpers insert only sections
  // absent from each original template. They never alter the original layout shell.
  const supplementary = (kind, light = false) => {
    if (kind === "summary") return (
      <section>{renderTitle("Professional Summary", light ? "#fff" : accent)}
        <p className={`${fBody} ${light ? "!text-white/90" : ""}`}>{p.summary}</p>
      </section>
    );
    if (kind === "experience") return (
      <section>{renderTitle("Experience", light ? "#fff" : accent)}{renderExperienceList(light)}</section>
    );
    if (kind === "education") return (
      <section>{renderTitle("Education", light ? "#fff" : accent)}
        <p className={`${fBody} whitespace-pre-line ${light ? "!text-white/90" : ""}`}>{p.education}</p>
      </section>
    );
    if (kind === "skills") return (
      <section>{renderTitle("Core Competencies", light ? "#fff" : accent)}{renderSkills(light)}</section>
    );
    if (kind === "languages") return (
      <section>{renderTitle("Languages", light ? "#fff" : accent)}{renderBulletList(p.languages, light)}</section>
    );
    if (kind === "certifications") return (
      <section>{renderTitle("Certifications", light ? "#fff" : accent)}{renderBulletList(p.certifications, light)}</section>
    );
    if (kind === "projects") return (
      <section>{renderTitle("Selected Projects", light ? "#fff" : accent)}{renderProjectList(light)}</section>
    );
    return null;
  };

  const headerBasic = (
    <header className="border-b pb-2" style={{ borderColor: `${accent}55` }}>
      <h3 className={fName}>{p.name}</h3>
      <p className="mt-0.5" style={{ color: accent }}>{p.title}</p>
      <p className={fMeta}>{p.email} · {p.phone} · {p.location}</p>
    </header>
  );

  const layouts = {
    "eu-photo-document": (
      <div className={`${paddingClass} bg-white ring-1 ring-slate-200`}>
        <header className="flex gap-3 border-b pb-3" style={{ borderColor: `${accent}55` }}>
          <Photo template={template} accent={accent} large={large} />
          <div>
            <p className={large ? "text-[9px] font-black tracking-widest text-slate-400 uppercase" : "text-[6px] font-black uppercase tracking-[.22em]"} style={{ color: accent }}>European CV</p>
            <h3 className={fName}>{p.name}</h3>
            <p className={fSub} style={{ color: accent }}>{p.title}</p>
          </div>
        </header>
        <main className={`grid ${large ? "grid-cols-[minmax(0,30fr)_minmax(0,70fr)] gap-6" : "grid-cols-[minmax(0,35fr)_minmax(0,65fr)] gap-3"} ${componentMargin}`}>
          <aside className={blockSpace}>
            <div>{renderTitle("Details")}<p className={fBody}>{p.location}<br />{p.phone}<br />{p.email}</p></div>
            <div>{renderTitle("Skills")}{renderSkills()}</div>
            <div>{renderTitle("Languages")}{renderBulletList(p.languages)}</div>
          
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("certifications", false)}</div>
          </aside>
          <section className={blockSpace}>
            <div>{renderTitle("Profile")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Experience")}{renderExperienceList()}</div>
            <div>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </section>
        
          </main>
      </div>
    ),
    "berlin-side-photo": (
      <div
        className={`cv-a4-template ${large ? "overflow-visible" : "overflow-hidden"} bg-white ring-1 ring-slate-200`}
        style={{
          width: large ? "794px" : "100%",
          minHeight: large ? "1123px" : "410px",
          height: large ? "auto" : "410px",
        }}
      >
        <div className={`${large ? "min-h-[1123px]" : "h-full"} grid grid-cols-[minmax(0,35fr)_minmax(0,65fr)] items-stretch`}>
          <aside
            data-full-height-sidebar="true"
            className={`${large ? "p-8" : "p-4"} h-full self-stretch text-white`}
            style={{ background: dark }}
          >
            <Photo template={template} accent={accent} large={large} />
            <h3 className={`${fName} ${componentMargin}`}>{p.name}</h3>
            <p className={`${fBody} text-white/70`}>{p.title}</p>
            <div className={componentMargin}>
              {renderTitle("Contact", "#fff")}
              <p className={`${fBody} text-white/70`}>{p.email}<br />{p.phone}<br />{p.location}</p>
            </div>
            <div className={componentMargin}>
              {renderTitle("Skills", "#fff")}
              {renderSkills(true)}
            </div>
            <div className={componentMargin}>
              {renderTitle("Certifications", "#fff")}
              {renderBulletList(p.certifications, true)}
            </div>
          
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("languages", true)}</div>
          </aside>
          <main className={`${large ? "p-8 md:p-10" : "p-4"} h-full`}>
            <div className={large ? "rounded-2xl p-5" : "rounded-xl p-2.5"} style={{ backgroundColor: `${accent}12` }}>
              {renderTitle("Profile")}
              <p className={fBody}>{p.summary}</p>
            </div>
            <div className={componentMargin}>
              {renderTitle("Work History")}
              {renderExperienceList()}
            </div>
            <div className={componentMargin}>
              {renderTitle("Education")}
              <p className={fBody}>{p.education}</p>
            </div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
        </div>
      </div>
    ),
    "corporate-circle-photo": (
      <div className={`${paddingClass} bg-white ring-1 ring-slate-200`}>
        <div className="flex items-center gap-4">
          <Photo template={template} accent={accent} large={large} />
          <div><h3 className={fName}>{p.name}</h3><p className={fSub} style={{ color: accent }}>{p.title}</p></div>
        </div>
        <div className={`grid ${large ? "grid-cols-[minmax(0,65fr)_minmax(0,35fr)] gap-6" : "grid-cols-[minmax(0,62fr)_minmax(0,38fr)] gap-3"} ${componentMargin}`}>
          <main className={blockSpace}>
            <section>{renderTitle("Profile")}<p className={fBody}>{p.summary}</p></section>
            <section>{renderTitle("Experience")}{renderExperienceList()}</section>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
          <aside className={`${large ? "rounded-2xl p-5" : "rounded-xl p-3"} h-fit`} style={{ backgroundColor: `${accent}10` }}>
            <div>{renderTitle("Contact")}<p className={fMeta}>{p.email}<br />{p.phone}</p></div>
            <div className={componentMargin}>{renderTitle("Expertise")}{renderSkills()}</div>
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
            <div className={componentMargin}>{renderTitle("Certificates")}{renderBulletList(p.certifications)}</div>
          
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("languages", false)}</div>
          </aside>
        </div>
      </div>
    ),
    "creative-blob-photo": (
      <div className={`${paddingClass} bg-white ring-1 ring-slate-200`}>
        <div className={`${large ? "rounded-[2rem] p-6" : "rounded-[1.4rem] p-3"}`} style={{ background: `linear-gradient(135deg, ${accent}22, #fff)` }}>
          <div className="flex items-center gap-3">
            <Photo template={template} accent={accent} large={large} />
            <div>
              <p className={fSub} style={{ color: accent }}>Creative Framework</p>
              <h3 className={fName}>{p.name}</h3>
              <p className={fBody} style={{ color: accent }}>{p.title}</p>
            </div>
          </div>
        </div>
        <div className={`grid grid-cols-2 ${large ? "gap-4 mt-6" : "gap-2 mt-3"}`}>
          <section className={`${large ? "rounded-2xl p-4" : "rounded-xl p-2"} bg-slate-50`}>
            {renderTitle("Profile")}<p className={fBody}>{p.summary}</p>
          </section>
          <section className={`${large ? "rounded-2xl p-4" : "rounded-xl p-2"} bg-slate-50`}>
            {renderTitle("Skills")}{renderSkills()}
          </section>
          <section className={`${large ? "rounded-2xl p-4" : "rounded-xl p-2"} bg-slate-50 col-span-2`}>
            {renderTitle("Experience")}{renderExperienceList()}
          
          </section>
          <section className="col-span-2"><div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div></section>
        </div>
      
            {/* Full homepage-equivalent CV content */}
            <div className={`${componentMargin} col-span-2`}>{supplementary("projects")}</div>
            <div className={`${componentMargin} col-span-2`}>{supplementary("languages")}</div>
            <div className={`${componentMargin} col-span-2`}>{supplementary("certifications")}</div>
          </div>
    ),
    "luxury-oval-photo": (
      <div className={`${paddingClass} bg-[#FBF7EF] ring-1 ring-slate-200`}>
        <div className="text-center">
          <div className="flex justify-center"><Photo template={template} accent={accent} large={large} /></div>
          <h3 className={`mt-1 font-serif font-bold ${large ? "text-3xl" : "text-[16px]"}`}>{p.name}</h3>
          <p className={fSub} style={{ color: accent }}>{p.title}</p>
          <div className="mx-auto mt-2 h-px w-16" style={{ backgroundColor: accent }} />
        </div>
        <main className={`grid grid-cols-[minmax(0,35fr)_minmax(0,65fr)] ${large ? "gap-6 mt-6" : "gap-3 mt-4"}`}>
          <aside className={blockSpace}>
            <div>{renderTitle("Contact")}<p className={fBody}>{p.email}<br />{p.phone}</p></div>
            <div>{renderTitle("Skills")}{renderSkills()}</div>
          
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("languages", false)}</div>
            <div className={componentMargin}>{supplementary("certifications", false)}</div>
          </aside>
          <section className={blockSpace}>
            <div>{renderTitle("Profile")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Experience")}{renderExperienceList()}</div>
          
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          </section>
        
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
      </div>
    ),
    "london-executive": (
      <div className={`${large ? "min-h-[1123px]" : "h-[410px]"} ${large ? "overflow-visible" : "overflow-hidden"} bg-white ring-1 ring-slate-200`}>
        <header className={large ? "p-8 text-white" : "p-4 text-white"} style={{ background: `linear-gradient(135deg, ${dark}, #020617)` }}>
          <h3 className={fName}>{p.name}</h3>
          <p className={`${fSub} text-white/70`}>{p.title}</p>
          <p className={fMeta} style={{ color: "#fff" }}>{p.email} · {p.phone} · {p.location}</p>
        </header>
        <div className={`grid grid-cols-[minmax(0,32fr)_minmax(0,68fr)] ${large ? "p-8 gap-6" : "p-4 gap-3"}`}>
          <aside className={blockSpace}>
            <div>{renderTitle("Leadership")}{renderSkills()}</div>
            <div>{renderTitle("Languages")}{renderBulletList(p.languages)}</div>
          
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("certifications", false)}</div>
          </aside>
          <main className={blockSpace}>
            <div>{renderTitle("Career Profile")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Experience")}{renderExperienceList()}</div>
          
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
        </div>
      </div>
    ),
    "clean-ats": (
      <div className={paddingClass}>
        {headerBasic}
        <main className={large ? "space-y-6 mt-6" : "space-y-2 mt-3"}>
          <section>{renderTitle("Professional Summary")}<p className={fBody}>{p.summary}</p></section>
          <section>{renderTitle("Professional Experience")}{renderExperienceList()}</section>
          <section>{renderTitle("Technical Expertise")}{renderSkills()}</section>
        
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
            <div className={componentMargin}>{supplementary("languages")}</div>
            <div className={componentMargin}>{supplementary("certifications")}</div>
          </main>
      </div>
    ),
    "classic-pro": (
      <div className={paddingClass}>
        <header className="text-center">
          <h3 className={`font-serif font-bold ${large ? "text-3xl" : "text-[16px]"}`}>{p.name}</h3>
          <p className={fSub} style={{ color: accent }}>{p.title}</p>
          <p className={fMeta}>{p.email} · {p.phone} · {p.location}</p>
        </header>
        <div className="my-2 h-px" style={{ backgroundColor: accent }} />
        <main className={large ? "space-y-5 mt-4" : "space-y-2 mt-2"}>
          <section>{renderTitle("Executive Profile")}<p className={fBody}>{p.summary}</p></section>
          <section>{renderTitle("Employment")}{renderExperienceList()}</section>
          <section>{renderTitle("Key Credentials")}{renderSkills()}</section>
        
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
            <div className={componentMargin}>{supplementary("languages")}</div>
            <div className={componentMargin}>{supplementary("certifications")}</div>
          </main>
      </div>
    ),
    "tech-minimal": (
      <div className={paddingClass}>
        <header className={`${large ? "p-6 rounded-2xl" : "p-3 rounded-xl"} bg-slate-950 text-white`}>
          <p className="font-mono text-cyan-400 text-[9px]">const candidate = () =&gt; &#123;</p>
          <h3 className={`font-mono ${large ? "text-2xl pl-2" : "text-[14px]"}`}>{p.name}</h3>
          <p className="text-slate-400 text-[10px] pl-2">{p.title}</p>
        </header>
        <main className={`grid grid-cols-[minmax(0,60fr)_minmax(0,40fr)] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <section className={blockSpace}>
            <div>{renderTitle("Summary")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Logs")}{renderExperienceList()}</div>
          
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          </section>
          <aside className={blockSpace}>
            <div>{renderTitle("Tech Stack")}{renderSkills()}</div>
            <div>{renderTitle("Contact Profile")}<p className={fMeta}>{p.email}<br />{p.phone}</p></div>
          
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("languages", false)}</div>
            <div className={componentMargin}>{supplementary("certifications", false)}</div>
          </aside>
        
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
      </div>
    ),
    "graduate-fresh": (
      <div className={paddingClass}>
        <header className={`${large ? "p-6 rounded-2xl" : "p-3 rounded-xl"}`} style={{ backgroundColor: `${accent}14` }}>
          <h3 className={fName}>{p.name}</h3>
          <p className={fSub} style={{ color: accent }}>{p.title}</p>
        </header>
        <main className={`grid grid-cols-2 ${large ? "gap-4 mt-4" : "gap-2 mt-2"}`}>
          <section className="rounded-xl border p-2">{renderTitle("Profile")}<p className={fBody}>{p.summary}</p></section>
          <section className="rounded-xl border p-2">{renderTitle("Education")}<p className={fBody}>{p.education}</p></section>
          <section className="col-span-2 rounded-xl border p-2">{renderTitle("Experience")}{renderExperienceList()}</section>
        
            <div className={componentMargin}>{renderTitle("Core Competencies")}{renderSkills()}</div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={`${componentMargin} col-span-2`}>{supplementary("projects")}</div>
            <div className={`${componentMargin} col-span-2`}>{supplementary("languages")}</div>
            <div className={`${componentMargin} col-span-2`}>{supplementary("certifications")}</div>
          </main>
      </div>
    ),
    "formal-uk": (
      <div className={paddingClass}>
        <header className="border-2 p-3 text-center" style={{ borderColor: accent }}>
          <h3 className={fName}>{p.name}</h3>
          <p className={fMeta}>{p.title}</p>
        </header>
        <main className={large ? "space-y-6 mt-6" : "space-y-2 mt-3"}>
          <section>{renderTitle("Professional Summary")}<p className={fBody}>{p.summary}</p></section>
          <section>{renderTitle("Career History")}{renderExperienceList()}</section>
          <section>{renderTitle("Education & Skills")}{renderSkills()}</section>
        
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
            <div className={componentMargin}>{supplementary("languages")}</div>
            <div className={componentMargin}>{supplementary("certifications")}</div>
          </main>
      </div>
    ),
    "senior-director": (
      <div className={`${large ? "min-h-[1123px]" : "h-[410px]"} ${large ? "overflow-visible" : "overflow-hidden"} bg-white ring-1 ring-slate-200`}>
        <div className="h-3" style={{ backgroundColor: accent }} />
        <div className={large ? "p-8" : "p-4"}>
          <h3 className={fName}>{p.name}</h3>
          <p className={fSub} style={{ color: accent }}>{p.title}</p>
          <div className={`grid grid-cols-[minmax(0,35fr)_minmax(0,65fr)] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
            <aside className={blockSpace}>
              <div>{renderTitle("Board Skills")}{renderSkills()}</div>
              <div>{renderTitle("Contact")}<p className={fMeta}>{p.email}<br />{p.phone}</p></div>
            
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("languages", false)}</div>
            <div className={componentMargin}>{supplementary("certifications", false)}</div>
          </aside>
            <main className={blockSpace}>
              <div>{renderTitle("Corporate Vision")}<p className={fBody}>{p.summary}</p></div>
              <div>{renderTitle("Track Record")}{renderExperienceList()}</div>
            
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
          </div>
        </div>
      </div>
    ),
    "admin-professional": (
      <div className={paddingClass}>
        <header className="flex items-stretch">
          <div className="w-2 rounded-full" style={{ backgroundColor: accent }} />
          <div className="pl-3"><h3 className={fName}>{p.name}</h3><p className={fMeta}>{p.title}</p></div>
        </header>
        <main className={large ? "space-y-6 mt-6" : "space-y-2 mt-3"}>
          <section className="border-l-4 pl-3" style={{ borderColor: accent }}>{renderTitle("Profile")}<p className={fBody}>{p.summary}</p></section>
          <section>{renderTitle("Admin Experience")}{renderExperienceList()}</section>
          <section>{renderSkills()}</section>
        
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
            <div className={componentMargin}>{supplementary("languages")}</div>
            <div className={componentMargin}>{supplementary("certifications")}</div>
          </main>
      </div>
    ),
    "healthcare-clinical": (
      <div className={paddingClass}>
        <header className="flex items-center justify-between">
          <div><h3 className={fName}>{p.name}</h3><p className={fSub} style={{ color: accent }}>{p.title}</p></div>
          <div className={`${large ? "h-14 w-14 text-xl" : "h-8 w-8 text-xs"} flex items-center justify-center rounded-full text-white`} style={{ backgroundColor: accent }}>+</div>
        </header>
        <main className={`grid grid-cols-[minmax(0,60fr)_minmax(0,40fr)] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <section className={blockSpace}>
            <div>{renderTitle("Bio Summary")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Clinical Framework")}{renderExperienceList()}</div>
          
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          </section>
          <aside className={`${large ? "p-5 rounded-2xl" : "p-2.5 rounded-xl"}`} style={{ backgroundColor: `${accent}12` }}>
            {renderTitle("Medical Skills")}{renderSkills()}
          
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("languages", false)}</div>
            <div className={componentMargin}>{supplementary("certifications", false)}</div>
          </aside>
        
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
      </div>
    ),
    "sales-leader": (
      <div className={paddingClass}>
        <header className={`${large ? "p-6 rounded-2xl" : "p-3 rounded-xl"} text-white`} style={{ background: `linear-gradient(135deg, ${accent}, ${dark})` }}>
          <h3 className={fName}>{p.name}</h3>
          <p className={fMeta} style={{ color: "#fff" }}>{p.title}</p>
        </header>
        <main className={componentMargin}>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-slate-50 p-1"><b className={large ? "text-sm" : "text-[10px]"}>128%</b><p className="text-[5px] md:text-[8px]">Target Achievement</p></div>
            <div className="rounded-lg bg-slate-50 p-1"><b className={large ? "text-sm" : "text-[10px]"}>42+</b><p className="text-[5px] md:text-[8px]">Corporate Clients</p></div>
            <div className="rounded-lg bg-slate-50 p-1"><b className={large ? "text-sm" : "text-[10px]"}>£2M</b><p className="text-[5px] md:text-[8px]">Revenue Generated</p></div>
          </div>
          <div className={componentMargin}>{renderTitle("Professional Summary")}<p className={fBody}>{p.summary}</p></div>
          <div className={componentMargin}>{renderTitle("Performance History")}{renderExperienceList()}</div>
        
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
            <div className={componentMargin}>{renderTitle("Core Competencies")}{renderSkills()}</div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
            <div className={componentMargin}>{supplementary("languages")}</div>
            <div className={componentMargin}>{supplementary("certifications")}</div>
          </main>
      </div>
    ),
    "finance-analyst": (
      <div className={paddingClass}>
        <header><h3 className={fName}>{p.name}</h3><p className={fSub} style={{ color: accent }}>{p.title}</p></header>
        <main className={`grid grid-cols-[minmax(0,60fr)_minmax(0,40fr)] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <section className={blockSpace}>
            <div>{renderTitle("Analysis Summary")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderExperienceList()}</div>
          </section>
          <aside className={blockSpace}>
            <div>{renderTitle("Quant Matrix")}{renderSkills()}</div>
            <div>{renderTitle("Education Details")}<p className={fBody}>{p.education}</p></div>
          
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("languages", false)}</div>
            <div className={componentMargin}>{supplementary("certifications", false)}</div>
          </aside>
        
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
      </div>
    ),
    "stockholm-clean": (
      <div className={paddingClass}>
        <header className="flex justify-between">
          <div><h3 className={fName}>{p.name}</h3><p className={fSub} style={{ color: accent }}>{p.title}</p></div>
          <div className={`${large ? "h-16 w-16" : "h-10 w-10"} rounded-full`} style={{ backgroundColor: `${accent}18` }} />
        </header>
        <main className={large ? "space-y-6 mt-8" : "space-y-2 mt-3"}>
          <section>{renderTitle("Profile Core")}<p className={fBody}>{p.summary}</p></section>
          <section>{renderTitle("Selected Experience")}{renderExperienceList()}</section>
        
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
            <div className={componentMargin}>{renderTitle("Core Competencies")}{renderSkills()}</div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
            <div className={componentMargin}>{supplementary("languages")}</div>
            <div className={componentMargin}>{supplementary("certifications")}</div>
          </main>
      </div>
    ),
    "dubai-corporate": (
      <div className={`${large ? "min-h-[1123px]" : "h-[410px]"} ${large ? "overflow-visible" : "overflow-hidden"} bg-white ring-1 ring-slate-200`}>
        <header className={`${large ? "p-8" : "p-4"} text-right text-white`} style={{ backgroundColor: dark }}>
          <h3 className={fName}>{p.name}</h3>
          <p className={fMeta} style={{ color: "#fff" }}>{p.title}</p>
        </header>
        <main className={`grid grid-cols-[minmax(0,30fr)_minmax(0,70fr)] ${large ? "p-8 gap-6" : "p-4 gap-3"}`}>
          <aside>{renderTitle("Expertise")}{renderSkills()}
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("languages", false)}</div>
            <div className={componentMargin}>{supplementary("certifications", false)}</div>
          </aside>
          <section className={blockSpace}>
            <div>{renderTitle("Summary")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Corporate Milestones")}{renderExperienceList()}</div>
          
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          </section>
        
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
      </div>
    ),
    "canada-simple": (
      <div className={paddingClass}>
        <header className="border-l-8 pl-3" style={{ borderColor: accent }}>
          <h3 className={fName}>{p.name}</h3>
          <p className={fMeta}>{p.title}</p>
        </header>
        <main className={large ? "space-y-5 mt-6" : "space-y-2 mt-3"}>
          <section>{renderTitle("Summary of Qualifications")}<p className={fBody}>{p.summary}</p></section>
          <section>{renderTitle("Relevant Experience")}{renderExperienceList()}</section>
          <section>{renderTitle("Core Competencies")}{renderSkills()}</section>
        
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
            <div className={componentMargin}>{supplementary("languages")}</div>
            <div className={componentMargin}>{supplementary("certifications")}</div>
          </main>
      </div>
    ),
    "academic-scholar": (
      <div className={paddingClass}>
        <header>
          <p className={fSub} style={{ color: accent }}>Curriculum Vitae</p>
          <h3 className={`font-serif font-bold ${large ? "text-3xl" : "text-[17px]"}`}>{p.name}</h3>
        </header>
        <main className={large ? "space-y-5 mt-6" : "space-y-2 mt-3"}>
          <section>{renderTitle("Research Profile")}<p className={fBody}>{p.summary}</p></section>
          <section>{renderTitle("Appointments")}{renderExperienceList()}</section>
          <section>{renderTitle("Publications & Credentials")}{renderBulletList(p.certifications)}</section>
        
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
            <div className={componentMargin}>{renderTitle("Core Competencies")}{renderSkills()}</div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
            <div className={componentMargin}>{supplementary("languages")}</div>
          </main>
      </div>
    ),
    "legal-advisor": (
      <div className={paddingClass}>
        <header className="text-center">
          <h3 className={`font-serif font-bold ${large ? "text-3xl" : "text-[16px]"}`}>{p.name}</h3>
          <p className={fSub} style={{ color: accent }}>{p.title}</p>
        </header>
        <main className={large ? "space-y-5 mt-6" : "space-y-2 mt-3"}>
          <section>{renderTitle("Legal Summary")}<p className={fBody}>{p.summary}</p></section>
          <section>{renderTitle("Practice History")}{renderExperienceList()}</section>
        
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
            <div className={componentMargin}>{renderTitle("Core Competencies")}{renderSkills()}</div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
            <div className={componentMargin}>{supplementary("languages")}</div>
            <div className={componentMargin}>{supplementary("certifications")}</div>
          </main>
      </div>
    ),
    "hospitality-premium": (
      <div className={`${paddingClass} bg-[#FFF7F3]`}>
        <header className={`${large ? "p-6 rounded-t-3xl" : "p-3 rounded-t-xl"} text-white`} style={{ backgroundColor: accent }}>
          <h3 className={fName}>{p.name}</h3>
          <p className={fMeta} style={{ color: "#fff" }}>{p.title}</p>
        </header>
        <main className={`grid grid-cols-[minmax(0,60fr)_minmax(0,40fr)] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <section className={blockSpace}>
            <div>{renderTitle("Bio Portfolio")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Guest Experience Log")}{renderExperienceList()}</div>
          
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          </section>
          <aside>{renderTitle("Relations Skills")}{renderSkills()}
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("languages", false)}</div>
            <div className={componentMargin}>{supplementary("certifications", false)}</div>
          </aside>
        
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
      </div>
    ),
    "engineer-grid": (
      <div className={paddingClass}>
        <header className="grid grid-cols-[minmax(0,70fr)_minmax(0,30fr)] gap-2">
          <div><h3 className={fName}>{p.name}</h3><p className={fMeta} style={{ color: accent }}>{p.title}</p></div>
        </header>
        <main className={`grid grid-cols-2 ${large ? "gap-4 mt-6" : "gap-2 mt-3"}`}>
          <section className="rounded-xl border p-2">{renderTitle("Profile Strategy")}<p className={fBody}>{p.summary}</p></section>
          <section className="rounded-xl border p-2">{renderTitle("Technical Stack")}{renderSkills()}</section>
          <section className="col-span-2 rounded-xl border p-2">{renderTitle("Projects Ecosystem")}{renderExperienceList()}</section>
          <section className="col-span-2"><div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div></section>
        
          
            {/* Full homepage-equivalent CV content */}
            <div className={`${componentMargin} col-span-2`}>{supplementary("projects")}</div>
            <div className={`${componentMargin} col-span-2`}>{supplementary("languages")}</div>
            <div className={`${componentMargin} col-span-2`}>{supplementary("certifications")}</div>
          </main>
      </div>
    ),
    "teacher-friendly": (
      <div className={paddingClass}>
        <header className={`${large ? "p-6 rounded-2xl" : "p-3 rounded-xl"}`} style={{ backgroundColor: `${accent}16` }}>
          <h3 className={fName}>{p.name}</h3>
          <p className={fMeta}>{p.title}</p>
        </header>
        <main className={componentMargin}>
          <section>{renderTitle("Pedagogy Core")}<p className={fBody}>{p.summary}</p></section>
          <div className={`rounded-xl border-l-4 ${large ? "p-4 mt-4" : "p-2 mt-2"}`} style={{ borderColor: accent }}>{renderExperienceList()}</div>
        
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
            <div className={componentMargin}>{renderTitle("Core Competencies")}{renderSkills()}</div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
            <div className={componentMargin}>{supplementary("languages")}</div>
            <div className={componentMargin}>{supplementary("certifications")}</div>
          </main>
      </div>
    ),
    "project-manager": (
      <div className={paddingClass}>
        <header><h3 className={fName}>{p.name}</h3><p className={fSub} style={{ color: accent }}>{p.title}</p></header>
        <main className={`grid grid-cols-[minmax(0,25fr)_minmax(0,75fr)] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <aside className="space-y-2">
            {["Plan", "Build", "Lead"].map((item) => (
              <div key={item} className="rounded-lg p-2 text-center font-black text-white text-[8px] md:text-[12px]" style={{ backgroundColor: accent }}>{item}</div>
            ))}
          
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("languages", false)}</div>
            <div className={componentMargin}>{supplementary("certifications", false)}</div>
          </aside>
          <section className={blockSpace}>
            <div>{renderTitle("Professional Summary")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Timeline Logs")}{renderExperienceList()}</div>
            <div>{renderSkills()}</div>
          
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          </section>
        
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
      </div>
    ),
    "customer-service": (
      <div className={paddingClass}>
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-white font-bold" style={{ backgroundColor: accent }}>★</div>
          <div><h3 className={fName}>{p.name}</h3><p className={fMeta}>{p.title}</p></div>
        </header>
        <main className={componentMargin}>
          <div className="rounded-2xl bg-slate-50 p-3">{renderTitle("Statement")}<p className={fBody}>{p.summary}</p></div>
          <div className={componentMargin}>{renderTitle("Service Record")}{renderExperienceList()}</div>
        
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
            <div className={componentMargin}>{renderTitle("Core Competencies")}{renderSkills()}</div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
            <div className={componentMargin}>{supplementary("languages")}</div>
            <div className={componentMargin}>{supplementary("certifications")}</div>
          </main>
      </div>
    ),
    "marketing-bold": (
      <div className={`${large ? "min-h-[1123px] p-8 md:p-10" : "p-4 h-[410px]"} ${large ? "overflow-visible" : "overflow-hidden"} bg-white ring-1 ring-slate-200`}>
        <header className={`${large ? "p-8 rounded-3xl" : "p-3.5 rounded-xl"} mb-4`} style={{ background: `linear-gradient(135deg, ${accent}22, #fff, ${accent}08)` }}>
          <h3 className={`${fName} text-slate-900 font-extrabold`}>{p.name}</h3>
          <p className={`${fSub} mt-1`} style={{ color: accent }}>{p.title}</p>
          <p className={fMeta}>{p.email} · {p.phone} · {p.location}</p>
        </header>
        <main className={`grid ${large ? "grid-cols-[minmax(0,65fr)_minmax(0,35fr)] gap-6" : "grid-cols-[minmax(0,60fr)_minmax(0,40fr)] gap-2.5"}`}>
          <div className={blockSpace}>
            <section className="bg-slate-50/60 rounded-xl p-2.5">
              {renderTitle("Impact Scope")}
              <p className={fBody}>{p.summary}</p>
            </section>
            <section className="bg-slate-50/60 rounded-xl p-2.5">
              {renderTitle("Professional Timeline")}
              {renderExperienceList()}
            </section>
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          </div>
          <aside className={blockSpace}>
            <section className="bg-slate-50/60 rounded-xl p-2.5">
              {renderTitle("Marketing Toolkit")}
              {renderSkills()}
            </section>
            <section className="bg-slate-50/60 rounded-xl p-2.5">
              {renderTitle("Credentials")}
              {renderBulletList(p.certifications)}
            </section>
          
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("languages", false)}</div>
          </aside>
        
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
      </div>
    ),
    "hr-professional": (
      <div className={paddingClass}>
        <header className="rounded-xl border p-3" style={{ borderColor: accent }}>
          <h3 className={fName}>{p.name}</h3>
          <p className={fMeta} style={{ color: accent }}>{p.title}</p>
        </header>
        <main className={`grid grid-cols-[minmax(0,40fr)_minmax(0,60fr)] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <aside>{renderTitle("People Framework")}{renderSkills()}
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("languages", false)}</div>
            <div className={componentMargin}>{supplementary("certifications", false)}</div>
          </aside>
          <section className={blockSpace}>
            <div>{renderTitle("Bio Profile")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderExperienceList()}</div>
          
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          </section>
        
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
      </div>
    ),
    "data-analyst": (
      <div className={paddingClass}>
        <header><h3 className={fName}>{p.name}</h3><p className={fMeta} style={{ color: accent }}>{p.title}</p></header>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {["SQL", "BI Tools", "KPI Matrix", "ETL Systems"].map((item) => (
            <div key={item} className="rounded-lg p-2 text-center text-[7px] md:text-[11px] font-black" style={{ backgroundColor: `${accent}18`, color: accent }}>{item}</div>
          ))}
        </div>
        <main className={componentMargin}>
          <section>{renderTitle("Data Portfolio")}<p className={fBody}>{p.summary}</p></section>
          <div className={componentMargin}>{renderTitle("Analytics Experience")}{renderExperienceList()}</div>
        
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
            <div className={componentMargin}>{renderTitle("Core Competencies")}{renderSkills()}</div>
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
            <div className={componentMargin}>{supplementary("languages")}</div>
            <div className={componentMargin}>{supplementary("certifications")}</div>
          </main>
      </div>
    ),
    "premium-monogram": (
      <div className={`${paddingClass} bg-[#FBF7EF]`}>
        <header className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border font-serif font-bold text-sm md:text-xl" style={{ borderColor: accent, color: accent }}>IM</div>
          <h3 className={fName}>{p.name}</h3>
          <p className={fMeta}>{p.title}</p>
        </header>
        <main className={`grid grid-cols-[minmax(0,35fr)_minmax(0,65fr)] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <aside>{renderTitle("Expertise Identity")}{renderSkills()}
            {/* Additional sample sections from homepage LayoutsSection */}
            <div className={componentMargin}>{supplementary("languages", false)}</div>
            <div className={componentMargin}>{supplementary("certifications", false)}</div>
          </aside>
          <section className={blockSpace}>
            <div>{renderTitle("Profile Architecture")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderExperienceList()}</div>
          
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          </section>
        
          
            {/* Full homepage-equivalent CV content */}
            <div className={componentMargin}>{supplementary("projects")}</div>
          </main>
      </div>
    ),
  };

  return layouts[layout] || (
    <div className={paddingClass}>
      {headerBasic}
      <main className="mt-3">{renderTitle("Summary")}<p className={fBody}>{p.summary}</p>{renderExperienceList()}</main>
    </div>
  );
}

function CVPreview({ template, selectedColor, large = false }) {
  return <UnifiedTemplateEngine template={template} selectedColor={selectedColor} large={large} />;
}


/* =========================================================
   A4 GALLERY PREVIEW
   The existing per-template JSX remains in place; only grid track sizing is corrected.
   We scale the original 794 x 1123 A4 canvas proportionally.
   A fixed viewport prevents card-height expansion.
========================================================= */
const PAPER_WIDTH = 794;
const PAPER_HEIGHT = 1123;
const smoothEase = [0.22, 1, 0.36, 1];

function FullDocument({ template, selectedColor }) {
  const frameRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;
    const measure = () => setWidth(element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale = width > 0 ? width / PAPER_WIDTH : 0;

  return (
    <div
      ref={frameRef}
      className="relative aspect-[794/1123] w-full min-w-0 overflow-hidden bg-white"
      aria-label={`${template.name} A4 template preview`}
    >
      {scale > 0 && (
        <div
          className="absolute left-0 top-0 h-[1123px] w-[794px] origin-top-left overflow-hidden bg-white text-slate-950 [&_main]:min-w-0 [&_aside]:min-w-0 [&_section]:min-w-0 [&_p]:[overflow-wrap:anywhere]"
          style={{ transform: `scale(${scale})` }}
        >
          <CVPreview template={template} selectedColor={selectedColor} large />
        </div>
      )}
    </div>
  );
}

function ColorPicker({ template, selectedColor, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={`${template.name} colour options`}>
      {template.colors.map((color, index) => {
        const selected = color === selectedColor;
        return (
          <button
            key={`${template.id}-${index}`}
            type="button"
            onClick={event => { event.preventDefault(); event.stopPropagation(); onChange(color); }}
            aria-label={`${template.name}: colour ${index + 1}`}
            aria-pressed={selected}
            title={`Colour ${index + 1}`}
            className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${selected ? "scale-110 border-text-primary ring-2 ring-border-strong" : "border-surface"}`}
            style={{ backgroundColor: color }}
          >
            {selected && <Check size={13} className={index === 3 || index === 4 ? "text-slate-900" : "text-white"} strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}

const descriptions = {
  "eu-photo-document": "European-style CV with a structured photo header and clear experience sections.",
  "berlin-side-photo": "Distinctive two-column layout with a prominent professional sidebar.",
  "corporate-circle-photo": "Balanced business layout with an elegant photo and focused career history.",
  "creative-blob-photo": "Expressive CV with modern visual accents and a fresh photo presentation.",
  "luxury-oval-photo": "Refined editorial style for client-facing and senior professional roles.",
  "london-executive": "Strong executive header and structured leadership credentials.",
  "clean-ats": "Traditional, easy-to-follow CV with a straightforward information hierarchy.",
  "classic-pro": "Timeless and formal CV with understated typography and spacing.",
  "tech-minimal": "Modern tech-focused resume with a distinctive developer-inspired header.",
  "graduate-fresh": "Clear, approachable design for recent graduates and early-career roles.",
  "formal-uk": "Conservative UK-style presentation with an orderly professional history.",
  "senior-director": "Executive-oriented layout that puts leadership experience first.",
  "admin-professional": "Practical, structured layout for administration and office professionals.",
  "healthcare-clinical": "Clean clinical layout for healthcare qualifications and career history.",
  "sales-leader": "Performance-focused design for sales and commercial professionals.",
  "finance-analyst": "Precise information hierarchy for analytical and finance roles.",
  "stockholm-clean": "Scandinavian-inspired minimalist layout emphasizing clarity.",
  "dubai-corporate": "Confident corporate presentation for Gulf-region professionals.",
  "canada-simple": "Professional Canadian-style format with a straightforward flow.",
  "academic-scholar": "Academic presentation focused on qualifications and research experience.",
  "legal-advisor": "Formal typographic style designed for legal professionals.",
  "hospitality-premium": "Polished, welcoming design for hospitality and service leaders.",
  "engineer-grid": "Technical grid layout suited to engineering and project-based roles.",
  "teacher-friendly": "Approachable educational resume with clearly organized history.",
  "project-manager": "Structured project leadership resume with focused career milestones.",
  "customer-service": "Friendly, professional layout for customer-facing positions.",
  "marketing-bold": "Confident visual style for creative marketing and campaign professionals.",
  "hr-professional": "Organized people-focused format for HR and recruitment roles.",
  "data-analyst": "Analytical presentation with prominent tools and technical expertise.",
  "premium-monogram": "Premium minimal design combining a monogram with refined typography.",
};

function TemplateCard({ template, selectedColor, onColorChange, onUse, index }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "80px 0px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.05, ease: smoothEase }}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-300 hover:border-accent/70 hover:shadow-[0_16px_42px_rgba(0,0,0,0.12)]"
    >
      <div className="relative w-full min-w-0 overflow-hidden bg-white">
        <FullDocument template={template} selectedColor={selectedColor} />
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-slate-950/0 transition-colors duration-300 group-hover:bg-slate-950/10 group-focus-within:bg-slate-950/10 max-lg:bg-transparent">
          <button
            type="button"
            onClick={() => onUse(template.id)}
            className="pointer-events-auto inline-flex min-h-11 translate-y-2 items-center justify-center gap-2 rounded-full bg-[#07183f] px-5 py-3 text-[13px] font-semibold text-white opacity-100 shadow-[0_9px_26px_rgba(0,0,0,0.2)] transition-[opacity,transform,background-color] duration-300 hover:bg-[#102b66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100"
          >
            Use Template <ArrowUpRight size={15} />
          </button>
        </div>
      </div>

      <div className="flex min-h-[142px] flex-1 flex-col px-4 pb-4 pt-3 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold leading-snug tracking-[-0.025em] text-text-primary">{template.name}</h3>
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.6] text-text-secondary">
              {descriptions[template.id]}
            </p>
          </div>
          <span className="shrink-0 rounded-md border border-border px-2 py-1 text-[10px] font-medium text-text-secondary">{template.tag}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <ColorPicker template={template} selectedColor={selectedColor} onChange={onColorChange} />
        </div>
      </div>
    </motion.article>
  );
}

function OldCVPopup({ template, selectedColor, onClose }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  const goEmptyCreate = () => {
    localStorage.removeItem("qorliq-old-cv-data");
    router.push(
      `/cv-builder/create?template=${template.id}&color=${encodeURIComponent(
        selectedColor || template.colors[0]
      )}`
    );
  };

  const handleOldCVUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt"];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

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

      router.push(
        `/cv-builder/create?template=${template.id}&color=${encodeURIComponent(
          selectedColor || template.colors[0]
        )}&oldcv=yes`
      );
    } catch (error) {
      console.error("Old CV upload error:", error);
      alert("Unable to upload or extract this CV.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.2}} className="fixed inset-0 z-[100001] flex items-center justify-center overflow-y-auto bg-slate-950/65 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{opacity: 0, y: 18, scale: 0.98}} animate={{opacity: 1, y: 0, scale: 1}} exit={{opacity: 0, y: 10, scale: 0.98}} transition={{duration: 0.28, ease: smoothEase}} role="dialog" aria-modal="true" aria-label={`Use ${template.name}`} className="w-full max-w-[420px] rounded-2xl bg-white p-4 text-slate-950 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:text-xs sm:tracking-[0.25em]">
              Selected Template
            </p>

            <h2 className="mt-1 text-xl font-black leading-tight sm:mt-2 sm:text-3xl">
              {template.name}
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              Upload your old CV to prepare the new CV faster, or start with the
              selected professional template.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            aria-label="Close template selection"
            className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-black text-slate-500 hover:bg-slate-50 sm:px-4 sm:py-2"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <h3 className="text-lg font-black sm:text-xl">
              Yes, I have old CV
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              Upload PDF, DOC, DOCX or TXT. Your details will be extracted and
              prepared inside the selected template.
            </p>

            <label className="mt-4 block cursor-pointer rounded-full bg-slate-900 px-4 py-3 text-center text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-slate-700 sm:mt-5 sm:px-5 sm:text-xs">
              {uploading ? "Reading CV..." : "Upload Old CV"}

              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleOldCVUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {uploadedFileName && (
              <p className="mt-3 break-words text-[11px] font-semibold text-slate-500 sm:text-xs">
                Uploaded: {uploadedFileName}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <h3 className="text-lg font-black sm:text-xl">
              No, start empty
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              Open the selected CV template with an empty form and fill your
              details manually.
            </p>

            <button
              type="button"
              onClick={goEmptyCreate}
              disabled={uploading}
              className="mt-4 w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-950 transition hover:bg-slate-50 sm:mt-5 sm:px-5 sm:text-xs"
            >
              Open Template
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


/* =========================================================
   TEMPLATE LIBRARY PAGE
========================================================= */
export default function CVBuilderPage() {
  const reduceMotion = useReducedMotion();
  const [selectedTemplateId, setSelectedTemplateId] = useState(cvTemplates[0].id);
  const [activeFilter, setActiveFilter] = useState("All Templates");
  const [search, setSearch] = useState("");
  const [showOldCVPopup, setShowOldCVPopup] = useState(false);
  const [selectedColors, setSelectedColors] = useState(() =>
    Object.fromEntries(cvTemplates.map(t => [t.id, t.colors[0]]))
  );

  const setTemplateColor = (id, color) => setSelectedColors(p => ({ ...p, [id]: color }));
  const filteredTemplates = useMemo(() => cvTemplates.filter(template => {
    const matchesSearch = `${template.name} ${template.category} ${template.tag}`.toLowerCase().includes(search.toLowerCase().trim());
    const matchesCategory = activeFilter === "All Templates" ||
      (activeFilter === "One column" && ["clean-ats", "classic-pro", "formal-uk", "admin-professional", "canada-simple"].includes(template.layout)) ||
      template.category === activeFilter;
    return matchesSearch && matchesCategory;
  }), [activeFilter, search]);

  const activeTemplate = cvTemplates.find(t => t.id === selectedTemplateId) || cvTemplates[0];
  const activeColor = selectedColors[activeTemplate.id] || activeTemplate.colors[0];

  const chooseAndUse = id => {
    setSelectedTemplateId(id);
    setShowOldCVPopup(true);
  };

  // Close the selection dialog with Escape without interfering with CV uploads.
  useEffect(() => {
    if (!showOldCVPopup) return;
    const onKeyDown = e => { if (e.key === "Escape") setShowOldCVPopup(false); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showOldCVPopup]);

  return (
    <>
    <CVBuilderHeader/>
    <div className="min-h-screen bg-background text-text-primary">
      <section className="mx-auto max-w-[1440px] px-5 pb-28 pt-12 sm:px-8 lg:px-12 lg:pt-20 xl:px-16">
        <div className="max-w-4xl">
          <motion.p initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
            QORLIQ CV / TEMPLATE LIBRARY
          </motion.p>
          <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: smoothEase }} className="text-[clamp(2.7rem,5vw,5.4rem)] font-semibold leading-[1.05] tracking-[-0.075em] text-text-primary">
            A better CV starts<br />with the <span className="font-editorial font-normal italic text-text-primary">right layout.</span>
          </motion.h1>
          <motion.p initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-6 max-w-[650px] text-[15px] leading-[1.85] text-text-secondary sm:text-[16px]">
            Explore 30 professional CV designs. Browse the original template layouts directly, without opening a preview popup. Choose a colour, select your layout, and start building.
          </motion.p>
        </div>

        <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            {filters.map(filter => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                aria-pressed={activeFilter === filter}
                className={`min-h-10 rounded-full border px-4 py-2 text-[12px] font-medium transition-colors duration-200 ${activeFilter === filter ? "border-[#07183f] bg-[#07183f] text-white dark:border-accent dark:bg-accent dark:text-[#061747]" : "border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary"}`}
              >{filter}</button>
            ))}
          </div>
          <label className="relative block w-full shrink-0 lg:w-[245px]">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <span className="sr-only">Search CV templates</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-[13px] text-text-primary outline-none placeholder:text-text-muted focus:border-accent" />
          </label>
        </div>

        <div className="mb-5 mt-9 flex items-center justify-between gap-3">
          <p className="text-[13px] font-medium text-text-secondary">Showing <strong className="text-text-primary">{filteredTemplates.length}</strong> templates</p>
          <p className="hidden text-[12px] text-text-muted sm:block">Original template design shown in every card</p>
        </div>

        {filteredTemplates.length ? (
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
                selectedColor={selectedColors[template.id] || template.colors[0]}
                onColorChange={color => setTemplateColor(template.id, color)}
                onUse={chooseAndUse}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface px-6 py-20 text-center">
            <FileText className="mx-auto text-text-muted" size={36} strokeWidth={1.4} />
            <h2 className="mt-4 text-xl font-semibold text-text-primary">No templates found</h2>
            <p className="mt-2 text-sm text-text-secondary">Try another category or a different search.</p>
            <button type="button" onClick={() => { setSearch(""); setActiveFilter("All Templates"); }} className="mt-5 rounded-lg bg-[#07183f] px-5 py-3 text-sm font-semibold text-white dark:bg-accent dark:text-[#061747]">Show all templates</button>
          </div>
        )}
      </section>

      <AnimatePresence>
        {showOldCVPopup && (
          <OldCVPopup
            template={activeTemplate}
            selectedColor={activeColor}
            onClose={() => setShowOldCVPopup(false)}
          />
        )}
      </AnimatePresence>
    </div>
    <CVBuilderFooter/>
    </>
  );
}
