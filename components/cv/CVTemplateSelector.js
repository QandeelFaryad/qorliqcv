"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
    "Results-driven professional with 7+ years of experience supporting corporate operations, strategic executive reporting, stakeholder communication, documentation control, and service improvement. Proven ability to optimize processes, increase reporting quality, and build strong cross-functional relationships across fast-paced, high-growth business environments. Adept at managing complex priorities while maintaining exceptional attention to detail.",
  skills: [
    "Operations Management",
    "Business Administration",
    "Executive Support",
    "Process Improvement",
    "Strategic Planning",
    "Data Reporting & Analysis",
    "Stakeholder Relations",
    "Team Leadership",
  ],
  education:
    "BA Business Management — University of Manchester (2012 — 2015)\nFirst Class Honours · Dissertation: Organisational Efficiency in SMEs",
  certifications: [
    "PRINCE2® Project Management",
    "Advanced Microsoft Excel Specialist",
    "Certified Business Administrator",
  ],
  languages: [
    "English (Native)",
    "Arabic (Professional)",
    "Urdu (Conversational)",
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
      role: "Operations Manager",
      company: "Brightline Services",
      date: "2021 — Present",
      points: [
        "Improved reporting accuracy by 38% through redesigned workflows and strict quality assurance checks across all operational departments.",
        "Managed daily administrative operations, cross-department supplier coordination, and core document logs for a team of 25+ staff members.",
        "Reduced service request turnaround time by 22% through implementation of structured workflow tools and digital tracking systems.",
        "Led quarterly performance reviews, developed KPI dashboards, and presented board-level operational summaries to senior leadership.",
      ],
    },
    {
      role: "Senior Coordinator",
      company: "Apex Group",
      date: "2018 — 2021",
      points: [
        "Coordinated internal records, executive meeting schedules, and multi-department operations across three regional offices.",
        "Supported monthly management report generation, asset forecasting, and financial overview trackers with 100% on-time delivery.",
        "Maintained corporate compliance standards across archiving systems and regional office databases serving 500+ clients.",
        "Trained and mentored a team of 6 junior coordinators, improving department output efficiency by 18% within first year.",
      ],
    },
    {
      role: "Administrative Officer",
      company: "Northfield Business Support",
      date: "2015 — 2018",
      points: [
        "Handled incoming client inquiries, team agendas, document formatting, and comprehensive executive assistance for C-suite leaders.",
        "Built internal trackers and process spreadsheets that lowered team operational delays by 15% and improved deadline adherence.",
        "Coordinated travel logistics, event scheduling, and vendor management for company-wide quarterly summits.",
      ],
    },
  ],
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

  const fTitle = large ? "text-xs font-black uppercase tracking-[0.16em] mb-2 border-b pb-1" : "text-[7px] font-black uppercase tracking-[0.15em] mb-1.5 border-b pb-1";
  const fName = large ? "text-3xl font-black leading-tight" : "text-[15px] font-black leading-tight";
  const fSub = large ? "text-sm font-bold uppercase tracking-[0.16em]" : "text-[7.5px] font-bold uppercase tracking-[0.14em]";
  const fMeta = large ? "text-xs text-slate-500 mt-2" : "text-[6.5px] text-slate-400 mt-1";
  const fBody = large ? "text-[11px] leading-[1.6] text-slate-600" : "text-[7px] leading-[1.4] text-slate-600";
  const fBold = large ? "text-[12px] font-black text-slate-950" : "text-[7.5px] font-black text-slate-900";
  const fDate = large ? "text-[10.5px] font-bold text-slate-400" : "text-[6.5px] font-bold text-slate-400";

  const blockSpace = large ? "space-y-4" : "space-y-2";
  const componentMargin = large ? "mt-5" : "mt-2.5";
  const paddingClass = large ? "p-8 md:p-10 h-full overflow-y-auto" : "p-4 h-[410px] overflow-hidden";

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
          {job.points.slice(0, large ? 4 : 2).map((point, i) => (
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

    {renderLargePreviewExtras(light)}
  </div>
);

  const renderSkills = (light = false) => (
    <div className="flex flex-wrap gap-1">
      {p.skills.slice(0, large ? undefined : 8).map((skill) => (
        <span key={skill} className={`rounded-full px-1.5 py-0.5 font-bold ${large ? "text-[10px] px-2.5 py-1" : "text-[6px]"} ${light ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"}`}>
          {skill}
        </span>
      ))}
    </div>
  );

  const renderBulletList = (items, light = false) => (
    <ul className={large ? "space-y-1" : "space-y-0.5"}>
      {items.slice(0, large ? undefined : 3).map((item, i) => (
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
const renderLargePreviewExtras = (light = false) => {
  if (!large) return null;

  const titleColor = light ? "#fff" : accent;

  return (
    <>
      <div>
        {renderTitle("Projects", titleColor)}
        {renderProjectList(light)}
      </div>

      <div>
        {renderTitle("Strengths", titleColor)}
        {renderBulletList(p.strengths, light)}
      </div>

      <div>
        {renderTitle("Certificates", titleColor)}
        {renderBulletList(p.certifications, light)}
      </div>

      <div>
        {renderTitle("Languages", titleColor)}
        {renderBulletList(p.languages, light)}
      </div>

      <div>
        {renderTitle("Hobbies", titleColor)}
        {renderBulletList(p.hobbies, light)}
      </div>

      <div>
        {renderTitle("References", titleColor)}
        {renderBulletList(p.references, light)}
      </div>
    </>
  );
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
        <main className={`grid ${large ? "grid-cols-[30%_70%] gap-6" : "grid-cols-[35%_65%] gap-3"} ${componentMargin}`}>
          <aside className={blockSpace}>
            <div>{renderTitle("Details")}<p className={fBody}>{p.location}<br />{p.phone}<br />{p.email}</p></div>
            <div>{renderTitle("Skills")}{renderSkills()}</div>
            <div>{renderTitle("Languages")}{renderBulletList(p.languages)}</div>
          </aside>
          <section className={blockSpace}>
            <div>{renderTitle("Profile")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Experience")}{renderExperienceList()}</div>
            <div>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
          </section>
        </main>
      </div>
    ),
    "berlin-side-photo": (
      <div
        className="cv-a4-template overflow-hidden bg-white ring-1 ring-slate-200"
        style={{
          width: large ? "794px" : "100%",
          minHeight: large ? "1123px" : "410px",
          height: large ? "1123px" : "410px",
        }}
      >
        <div className="grid h-full min-h-full grid-cols-[35%_65%] items-stretch">
          <aside
            data-full-height-sidebar="true"
            className={`${large ? "p-8" : "p-4"} h-full min-h-full self-stretch text-white`}
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
        <div className={`grid ${large ? "grid-cols-[65%_35%] gap-6" : "grid-cols-[62%_38%] gap-3"} ${componentMargin}`}>
          <main className={blockSpace}>
            <section>{renderTitle("Profile")}<p className={fBody}>{p.summary}</p></section>
            <section>{renderTitle("Experience")}{renderExperienceList()}</section>
          </main>
          <aside className={`${large ? "rounded-2xl p-5" : "rounded-xl p-3"} h-fit`} style={{ backgroundColor: `${accent}10` }}>
            <div>{renderTitle("Contact")}<p className={fMeta}>{p.email}<br />{p.phone}</p></div>
            <div className={componentMargin}>{renderTitle("Expertise")}{renderSkills()}</div>
            <div className={componentMargin}>{renderTitle("Education")}<p className={fBody}>{p.education}</p></div>
            <div className={componentMargin}>{renderTitle("Certificates")}{renderBulletList(p.certifications)}</div>
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
        </div>
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
        <main className={`grid grid-cols-[35%_65%] ${large ? "gap-6 mt-6" : "gap-3 mt-4"}`}>
          <aside className={blockSpace}>
            <div>{renderTitle("Contact")}<p className={fBody}>{p.email}<br />{p.phone}</p></div>
            <div>{renderTitle("Skills")}{renderSkills()}</div>
          </aside>
          <section className={blockSpace}>
            <div>{renderTitle("Profile")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Experience")}{renderExperienceList()}</div>
          </section>
        </main>
      </div>
    ),
    "london-executive": (
      <div className={`${large ? "h-full min-h-[842px]" : "h-[410px]"} overflow-hidden bg-white ring-1 ring-slate-200`}>
        <header className={large ? "p-8 text-white" : "p-4 text-white"} style={{ background: `linear-gradient(135deg, ${dark}, #020617)` }}>
          <h3 className={fName}>{p.name}</h3>
          <p className={`${fSub} text-white/70`}>{p.title}</p>
          <p className={fMeta} style={{ color: "#fff" }}>{p.email} · {p.phone} · {p.location}</p>
        </header>
        <div className={`grid grid-cols-[32%_68%] ${large ? "p-8 gap-6" : "p-4 gap-3"}`}>
          <aside className={blockSpace}>
            <div>{renderTitle("Leadership")}{renderSkills()}</div>
            <div>{renderTitle("Languages")}{renderBulletList(p.languages)}</div>
          </aside>
          <main className={blockSpace}>
            <div>{renderTitle("Career Profile")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Experience")}{renderExperienceList()}</div>
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
        <main className={`grid grid-cols-[60%_40%] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <section className={blockSpace}>
            <div>{renderTitle("Summary")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Logs")}{renderExperienceList()}</div>
          </section>
          <aside className={blockSpace}>
            <div>{renderTitle("Tech Stack")}{renderSkills()}</div>
            <div>{renderTitle("Contact Profile")}<p className={fMeta}>{p.email}<br />{p.phone}</p></div>
          </aside>
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
          <section>{renderTitle("Career History")}{renderExperienceList()}</section>
          <section>{renderTitle("Education & Skills")}{renderSkills()}</section>
        </main>
      </div>
    ),
    "senior-director": (
      <div className={`${large ? "h-full min-h-[842px]" : "h-[410px]"} overflow-hidden bg-white ring-1 ring-slate-200`}>
        <div className="h-3" style={{ backgroundColor: accent }} />
        <div className={large ? "p-8" : "p-4"}>
          <h3 className={fName}>{p.name}</h3>
          <p className={fSub} style={{ color: accent }}>{p.title}</p>
          <div className={`grid grid-cols-[35%_65%] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
            <aside className={blockSpace}>
              <div>{renderTitle("Board Skills")}{renderSkills()}</div>
              <div>{renderTitle("Contact")}<p className={fMeta}>{p.email}<br />{p.phone}</p></div>
            </aside>
            <main className={blockSpace}>
              <div>{renderTitle("Corporate Vision")}<p className={fBody}>{p.summary}</p></div>
              <div>{renderTitle("Track Record")}{renderExperienceList()}</div>
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
        </main>
      </div>
    ),
    "healthcare-clinical": (
      <div className={paddingClass}>
        <header className="flex items-center justify-between">
          <div><h3 className={fName}>{p.name}</h3><p className={fSub} style={{ color: accent }}>{p.title}</p></div>
          <div className={`${large ? "h-14 w-14 text-xl" : "h-8 w-8 text-xs"} flex items-center justify-center rounded-full text-white`} style={{ backgroundColor: accent }}>+</div>
        </header>
        <main className={`grid grid-cols-[60%_40%] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <section className={blockSpace}>
            <div>{renderTitle("Bio Summary")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Clinical Framework")}{renderExperienceList()}</div>
          </section>
          <aside className={`${large ? "p-5 rounded-2xl" : "p-2.5 rounded-xl"}`} style={{ backgroundColor: `${accent}12` }}>
            {renderTitle("Medical Skills")}{renderSkills()}
          </aside>
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
          <div className={componentMargin}>{renderTitle("Performance History")}{renderExperienceList()}</div>
        </main>
      </div>
    ),
    "finance-analyst": (
      <div className={paddingClass}>
        <header><h3 className={fName}>{p.name}</h3><p className={fSub} style={{ color: accent }}>{p.title}</p></header>
        <main className={`grid grid-cols-[60%_40%] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <section className={blockSpace}>
            <div>{renderTitle("Analysis Summary")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderExperienceList()}</div>
          </section>
          <aside className={blockSpace}>
            <div>{renderTitle("Quant Matrix")}{renderSkills()}</div>
            <div>{renderTitle("Education Details")}<p className={fBody}>{p.education}</p></div>
          </aside>
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
        </main>
      </div>
    ),
    "dubai-corporate": (
      <div className={`${large ? "h-full min-h-[842px]" : "h-[410px]"} overflow-hidden bg-white ring-1 ring-slate-200`}>
        <header className={`${large ? "p-8" : "p-4"} text-right text-white`} style={{ backgroundColor: dark }}>
          <h3 className={fName}>{p.name}</h3>
          <p className={fMeta} style={{ color: "#fff" }}>{p.title}</p>
        </header>
        <main className={`grid grid-cols-[30%_70%] ${large ? "p-8 gap-6" : "p-4 gap-3"}`}>
          <aside>{renderTitle("Expertise")}{renderSkills()}</aside>
          <section className={blockSpace}>
            <div>{renderTitle("Summary")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Corporate Milestones")}{renderExperienceList()}</div>
          </section>
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
        </main>
      </div>
    ),
    "hospitality-premium": (
      <div className={`${paddingClass} bg-[#FFF7F3]`}>
        <header className={`${large ? "p-6 rounded-t-3xl" : "p-3 rounded-t-xl"} text-white`} style={{ backgroundColor: accent }}>
          <h3 className={fName}>{p.name}</h3>
          <p className={fMeta} style={{ color: "#fff" }}>{p.title}</p>
        </header>
        <main className={`grid grid-cols-[60%_40%] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <section className={blockSpace}>
            <div>{renderTitle("Bio Portfolio")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderTitle("Guest Experience Log")}{renderExperienceList()}</div>
          </section>
          <aside>{renderTitle("Relations Skills")}{renderSkills()}</aside>
        </main>
      </div>
    ),
    "engineer-grid": (
      <div className={paddingClass}>
        <header className="grid grid-cols-[70%_30%] gap-2">
          <div><h3 className={fName}>{p.name}</h3><p className={fMeta} style={{ color: accent }}>{p.title}</p></div>
        </header>
        <main className={`grid grid-cols-2 ${large ? "gap-4 mt-6" : "gap-2 mt-3"}`}>
          <section className="rounded-xl border p-2">{renderTitle("Profile Strategy")}<p className={fBody}>{p.summary}</p></section>
          <section className="rounded-xl border p-2">{renderTitle("Technical Stack")}{renderSkills()}</section>
          <section className="col-span-2 rounded-xl border p-2">{renderTitle("Projects Ecosystem")}{renderExperienceList()}</section>
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
        </main>
      </div>
    ),
    "project-manager": (
      <div className={paddingClass}>
        <header><h3 className={fName}>{p.name}</h3><p className={fSub} style={{ color: accent }}>{p.title}</p></header>
        <main className={`grid grid-cols-[25%_75%] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <aside className="space-y-2">
            {["Plan", "Build", "Lead"].map((item) => (
              <div key={item} className="rounded-lg p-2 text-center font-black text-white text-[8px] md:text-[12px]" style={{ backgroundColor: accent }}>{item}</div>
            ))}
          </aside>
          <section className={blockSpace}>
            <div>{renderTitle("Timeline Logs")}{renderExperienceList()}</div>
            <div>{renderSkills()}</div>
          </section>
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
        </main>
      </div>
    ),
    "marketing-bold": (
      <div className={`${large ? "h-full min-h-[842px] p-8 md:p-10" : "p-4 h-[410px]"} overflow-y-auto bg-white ring-1 ring-slate-200`}>
        <header className={`${large ? "p-8 rounded-3xl" : "p-3.5 rounded-xl"} mb-4`} style={{ background: `linear-gradient(135deg, ${accent}22, #fff, ${accent}08)` }}>
          <h3 className={`${fName} text-slate-900 font-extrabold`}>{p.name}</h3>
          <p className={`${fSub} mt-1`} style={{ color: accent }}>{p.title}</p>
          <p className={fMeta}>{p.email} · {p.phone} · {p.location}</p>
        </header>
        <main className={`grid ${large ? "grid-cols-[65%_35%] gap-6" : "grid-cols-[60%_40%] gap-2.5"}`}>
          <div className={blockSpace}>
            <section className="bg-slate-50/60 rounded-xl p-2.5">
              {renderTitle("Impact Scope")}
              <p className={fBody}>{p.summary}</p>
            </section>
            <section className="bg-slate-50/60 rounded-xl p-2.5">
              {renderTitle("Professional Timeline")}
              {renderExperienceList()}
            </section>
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
          </aside>
        </main>
      </div>
    ),
    "hr-professional": (
      <div className={paddingClass}>
        <header className="rounded-xl border p-3" style={{ borderColor: accent }}>
          <h3 className={fName}>{p.name}</h3>
          <p className={fMeta} style={{ color: accent }}>{p.title}</p>
        </header>
        <main className={`grid grid-cols-[40%_60%] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <aside>{renderTitle("People Framework")}{renderSkills()}</aside>
          <section className={blockSpace}>
            <div>{renderTitle("Bio Profile")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderExperienceList()}</div>
          </section>
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
        <main className={`grid grid-cols-[35%_65%] ${large ? "gap-6 mt-6" : "gap-3 mt-3"}`}>
          <aside>{renderTitle("Expertise Identity")}{renderSkills()}</aside>
          <section className={blockSpace}>
            <div>{renderTitle("Profile Architecture")}<p className={fBody}>{p.summary}</p></div>
            <div>{renderExperienceList()}</div>
          </section>
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

function Stepper() {
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
      {[["1", "Choose template"], ["2", "Enter your details"], ["3", "Download resume"]].map(([number, label], index) => (
        <div key={label} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-extrabold ${index === 0 ? "bg-slate-900 text-white" : "text-slate-400"}`}>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${index === 0 ? "bg-white text-slate-900" : "bg-slate-100 text-slate-400"}`}>
            {number}
          </span>
          <span className="hidden sm:inline">{label}</span>
        </div>
      ))}
    </div>
  );
}

function ColorPicker({ template, selectedColor, onChange }) {
  return (
    <div className="mt-3 flex items-center gap-1.5">
      {template.colors.map((color, index) => (
        <button
          key={`${template.id}-${color}-${index}`}
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onChange(color);
          }}
          className={`h-5 w-5 rounded-full border-2 transition ${selectedColor === color ? "scale-110 border-slate-950 ring-2 ring-slate-300" : "border-white shadow"}`}
          style={{ backgroundColor: color }}
          aria-label={`Select ${template.name} colour ${index + 1}`}
        />
      ))}
    </div>
  );
}

function TemplateCard({
  template,
  selected,
  selectedColor,
  onColorChange,
  onSelect,
  onPreview,
}) {
  return (
    <div
      className={`group mx-auto flex w-full max-w-[360px] flex-col justify-between rounded-[1.45rem] border bg-white p-2.5 transition sm:max-w-none sm:rounded-[1.7rem] sm:p-3 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.16)] ${
        selected
          ? "border-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.16)]"
          : "border-slate-200 shadow-sm"
      }`}
    >
      <div className="relative h-[360px] w-full overflow-hidden rounded-[1.1rem] bg-white sm:rounded-[1.35rem]">
        <CVPreview
          template={template}
          selectedColor={selectedColor}
          large={false}
        />

        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-black text-slate-700 shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:text-[10px]">
          {template.tag}
        </span>

        <div className="absolute inset-0 z-10 flex items-end justify-center gap-2 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent p-3 opacity-100 transition sm:items-center sm:bg-slate-950/0 sm:p-0 sm:opacity-0 sm:group-hover:bg-slate-950/45 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={onPreview}
            className="rounded-full bg-white px-4 py-2 text-[11px] font-black text-slate-950 shadow-lg transition hover:scale-105"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={onSelect}
            className="rounded-full bg-slate-950 px-4 py-2 text-[11px] font-black text-white shadow-lg transition hover:scale-105"
          >
            Use
          </button>
        </div>

        {selected && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-slate-950 px-2.5 py-1 text-[9px] font-black text-white shadow-sm sm:right-3 sm:top-3 sm:px-3 sm:text-[10px]">
            Selected
          </span>
        )}
      </div>


      <div className="mt-3 flex items-start justify-between gap-2 px-1 pb-1 sm:mt-4 sm:gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-black text-slate-950">
            {template.name}
          </h3>

          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            {template.category} CV template
          </p>

          <ColorPicker
            template={template}
            selectedColor={selectedColor}
            onChange={onColorChange}
          />
        </div>

        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
          {template.ats}% ATS
        </span>
      </div>
    </div>
  );
}









function PreviewModal({
  template,
  selectedColor,
  onColorChange,
  onClose,
  onUse,
}) {
  if (!template) return null;

  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden bg-slate-950/85 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <div className="relative z-[100000] mx-auto flex h-full w-full max-w-6xl flex-col rounded-[1.5rem] bg-white p-4 shadow-2xl sm:rounded-[2rem] sm:p-6">
        <div className="mb-4 flex shrink-0 flex-col justify-between gap-4 sm:mb-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 sm:text-xs">
              Preview Template
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
              {template.name}
            </h2>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              Same template card design with more complete CV content.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 sm:mt-4">
              <ColorPicker
                template={template}
                selectedColor={selectedColor}
                onChange={onColorChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onUse}
              className="rounded-full bg-slate-950 px-4 py-3 text-xs font-black text-white transition hover:bg-slate-700 sm:px-6"
            >
              Use This Template
            </button>
          </div>
        </div>

        <div className="preview-modal-scroll mx-auto min-h-0 w-full max-w-[850px] flex-1 rounded-[1.4rem] bg-slate-100 p-2 shadow-[0_25px_80px_rgba(15,23,42,0.18)] ring-1 ring-slate-200 sm:p-4">
          <div className="preview-scroll-area">
            <div className="preview-scale-holder">
              <div className="preview-scale-inner">
                <CVPreview
                  template={template}
                  selectedColor={selectedColor}
                  large
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .preview-modal-scroll {
          -webkit-overflow-scrolling: touch;
          overflow: hidden;
        }

        .preview-scroll-area {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  overflow-x: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 8px 4px;

  /* Firefox */
  scrollbar-width: none;

  /* IE / old Edge */
  -ms-overflow-style: none;
}

/* Chrome, Safari, Edge */
.preview-scroll-area::-webkit-scrollbar {
  display: none;
}

        .preview-scale-holder {
          --preview-scale: 0.40;

          width: calc(794px * var(--preview-scale));
          min-width: calc(794px * var(--preview-scale));
          height: calc(1123px * var(--preview-scale));
          min-height: calc(1123px * var(--preview-scale));
          display: flex;
          justify-content: center;
          align-items: flex-start;
          overflow: visible;
          margin: 0 auto 16px auto;
          flex-shrink: 0;
        }

        .preview-scale-inner {
          width: 794px;
          min-width: 794px;
          height: 1123px;
          min-height: 1123px;
          transform: scale(var(--preview-scale));
          transform-origin: top center;
          overflow: visible;
          border-radius: 22px;
        }

        .preview-scale-inner :global(.cv-a4-template),
        .preview-scale-inner :global(#cv-download) {
          width: 794px !important;
          min-height: 1123px !important;
          height: 1123px !important;
          overflow: hidden !important;
          border-radius: 22px !important;
          box-shadow: 0 18px 55px rgba(15, 23, 42, 0.16) !important;
        }

        .preview-scale-inner :global(.cv-a4-template > div),
        .preview-scale-inner :global(#cv-download > div) {
          height: 100% !important;
          min-height: 1123px !important;
          align-items: stretch !important;
        }

        .preview-scale-inner :global(aside[data-full-height-sidebar="true"]) {
          height: 100% !important;
          min-height: 1123px !important;
          align-self: stretch !important;
        }

        @media (max-width: 360px) {
          .preview-scale-holder {
            --preview-scale: 0.36;
          }
        }

        @media (min-width: 361px) and (max-width: 389px) {
          .preview-scale-holder {
            --preview-scale: 0.38;
          }
        }

        @media (min-width: 390px) {
          .preview-scale-holder {
            --preview-scale: 0.42;
          }
        }

        @media (min-width: 430px) {
          .preview-scale-holder {
            --preview-scale: 0.46;
          }
        }

        @media (min-width: 480px) {
          .preview-scale-holder {
            --preview-scale: 0.52;
          }
        }

        @media (min-width: 640px) {
          .preview-scale-holder {
            --preview-scale: 0.72;
          }
        }

        @media (min-width: 768px) {
          .preview-scale-holder {
            --preview-scale: 0.86;
          }
        }

        @media (min-width: 1024px) {
          .preview-scale-holder {
            --preview-scale: 1;
          }
        }
      `}</style>
    </div>
  );
}

function OldCVPopup({ template, selectedColor, onClose }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

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
    <div className="fixed inset-0 z-[100001] flex items-center justify-center overflow-y-auto bg-slate-950/65 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-4 text-slate-950 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-7">
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
              className="mt-4 w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-950 transition hover:bg-slate-50 sm:mt-5 sm:px-5 sm:text-xs"
            >
              Open Template
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
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showOldCVPopup, setShowOldCVPopup] = useState(false);
  const [selectedColors, setSelectedColors] = useState(() => Object.fromEntries(cvTemplates.map((template) => [template.id, template.colors[0]])));

  const setTemplateColor = (templateId, color) => {
    setSelectedColors((previous) => ({ ...previous, [templateId]: color }));
  };

  const filteredTemplates = useMemo(() => {
    if (activeFilter === "All Templates") return cvTemplates;

    if (activeFilter === "One column") {
      return cvTemplates.filter((template) =>
        ["clean-ats", "classic-pro", "formal-uk", "tech-minimal", "admin-professional", "canada-simple"].includes(template.layout)
      );
    }

    return cvTemplates.filter((template) => template.category === activeFilter);
  }, [activeFilter]);

  const activeTemplate = cvTemplates.find((template) => template.id === selectedTemplateId) || cvTemplates[0];
  const activeColor = selectedColors[activeTemplate.id] || activeTemplate.colors[0];
  const photoCount = cvTemplates.filter((template) => template.photo).length;

  return (
    <main className="min-h-screen bg-[#F6F7FB] pb-28 text-slate-950">
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
        <Stepper />

        <div className="mx-auto mt-10 max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Resume Templates</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">Choose your professional CV template</h1>
          <p className="mt-5 text-base leading-7 text-slate-500">
            30 unique CV formats with separate layout identities. Exactly {photoCount} photo CV designs and 5 colour options per template.
          </p>
          <button type="button" className="mt-5 text-sm font-black text-slate-400 hover:text-slate-950">Choose later</button>
        </div>

        <div className="sticky top-0 z-30 -mx-4 mt-8 border-y border-slate-200 bg-[#F6F7FB]/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 md:static md:border-0 md:bg-transparent md:p-0">
          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:justify-center md:overflow-visible">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-full border px-5 py-2.5 text-xs font-black transition ${
                  activeFilter === filter
                    ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-950"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={selectedTemplateId === template.id}
              selectedColor={selectedColors[template.id] || template.colors[0]}
              onColorChange={(color) => setTemplateColor(template.id, color)}
              onSelect={() => setSelectedTemplateId(template.id)}
              onPreview={() => setPreviewTemplate(template)}
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
        <p className="mt-1 text-center text-[10px] font-semibold text-slate-500">Selected: {activeTemplate.name}</p>
      </div>

      <div className="hidden border-t border-slate-200 bg-white px-6 py-5 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <div>
            <p className="text-sm font-black text-slate-950">Selected: {activeTemplate.name}</p>
            <p className="text-xs text-slate-500">
              ATS score {activeTemplate.ats}% · {activeTemplate.category} · Colour{" "}
              {Math.max(1, activeTemplate.colors.findIndex((color) => color === activeColor) + 1)}/5
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPreviewTemplate(activeTemplate)}
              className="rounded-full border border-slate-200 bg-white px-7 py-3 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:bg-slate-50"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setShowOldCVPopup(true)}
              className="rounded-full bg-slate-900 px-8 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-700"
            >
              Use This Template
            </button>
          </div>
        </div>
      </div>

      <PreviewModal
        template={previewTemplate}
        selectedColor={previewTemplate ? selectedColors[previewTemplate.id] || previewTemplate.colors[0] : ""}
        onColorChange={(color) => previewTemplate && setTemplateColor(previewTemplate.id, color)}
        onClose={() => setPreviewTemplate(null)}
        onUse={() => {
          if (!previewTemplate) return;
          setSelectedTemplateId(previewTemplate.id);
          setPreviewTemplate(null);
          setShowOldCVPopup(true);
        }}
      />

      {showOldCVPopup && (
        <OldCVPopup
          template={activeTemplate}
          selectedColor={activeColor}
          onClose={() => setShowOldCVPopup(false)}
        />
      )}
    </main>
  );
}