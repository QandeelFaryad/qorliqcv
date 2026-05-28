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

const shortCV = {
  email: "candidate@email.com",
  phone: "+44 7700 123456",
  location: "London, UK",
  summary: "Results-driven professional with experience improving operations, reporting and team performance.",
  skills: ["Operations", "Excel", "Reporting", "Planning", "Communication", "Leadership"],
  education: "BA Business Management — University of Manchester",
  experience: [
    ["Operations Manager", "Brightline Services", "2021 — Present", "Improved reporting accuracy and workflow controls."],
    ["Senior Coordinator", "Apex Group", "2018 — 2021", "Managed records, reporting and department communication."],
  ],
};

const fullPreviewCV = {
  email: "candidate@email.com",
  phone: "+44 7700 123456",
  location: "London, UK",
  linkedin: "linkedin.com/in/candidate",
  summary:
    "Results-driven professional with 7+ years of experience supporting operations, executive reporting, stakeholder communication, documentation control and service improvement in fast-paced business environments.",
  experience: [
    {
      role: "Operations Manager",
      company: "Brightline Services",
      date: "2021 — Present",
      points: [
        "Improved reporting accuracy by 38% through redesigned workflows and quality controls.",
        "Managed daily operations, supplier coordination, internal documentation and reporting packs.",
        "Reduced service request turnaround time by 22% through structured process improvements.",
      ],
    },
    {
      role: "Senior Coordinator",
      company: "Apex Group",
      date: "2018 — 2021",
      points: [
        "Coordinated internal records, communication, scheduling and department administration.",
        "Supported monthly management reports, budget summaries and meeting documentation.",
        "Maintained structured filing systems and compliance with company procedures.",
      ],
    },
    {
      role: "Administrative Officer",
      company: "Northfield Business Support",
      date: "2015 — 2018",
      points: [
        "Handled client queries, scheduling, document preparation and office support activities.",
        "Prepared spreadsheets, workflow trackers and internal reporting documents.",
      ],
    },
  ],
  skills: [
    "Operations Management",
    "Business Administration",
    "Executive Support",
    "Reporting",
    "Microsoft Excel",
    "Process Improvement",
    "Stakeholder Communication",
    "Team Coordination",
    "Data Management",
    "Customer Service",
  ],
  education: "BA Business Management — University of Manchester",
  certifications: ["PRINCE2 Foundation", "Advanced Microsoft Excel", "Business Administration Certificate"],
  languages: ["English — Native", "Arabic — Professional", "Urdu — Conversational"],
  achievements: [
    "Recognised for improving reporting efficiency and reducing internal process delays.",
    "Supported executive team in delivering monthly operational reports across multiple departments.",
    "Maintained documentation accuracy in high-volume environments.",
  ],
};

function getProfile(template) {
  const [name, title] = names[template.id] || ["Emma Williams", "Operations Manager"];
  return { ...shortCV, name, title };
}

function getFullProfile(template) {
  const [name, title] = names[template.id] || ["Emma Williams", "Operations Manager"];
  return { ...fullPreviewCV, name, title };
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
      className={`${large ? "h-28 w-28" : "h-14 w-14"} ${shape} shrink-0 overflow-hidden bg-slate-100 shadow`}
      style={{ border: `2px solid ${accent}` }}
    >
      <img src={photos[template.photoType]} alt="Dummy CV profile" className="h-full w-full object-cover" />
    </div>
  );
}

function MiniTitle({ children, accent }) {
  return (
    <p className="mb-1 border-b pb-1 text-[6.5px] font-black uppercase tracking-[0.15em]" style={{ color: accent, borderColor: `${accent}55` }}>
      {children}
    </p>
  );
}
function MiniExp({ data = shortCV, light = false }) {
  const items = Array.isArray(data.experience) ? data.experience : [];

  return (
    <div className="space-y-1.5">
      {items.map((job, index) => {
        const isArrayJob = Array.isArray(job);

        const role = isArrayJob ? job[0] : job.role;
        const company = isArrayJob ? job[1] : job.company;
        const date = isArrayJob ? job[2] : job.date;
        const points = isArrayJob ? [job[3]] : job.points || [];

        return (
          <div key={`${role}-${index}`}>
            <div className="flex justify-between gap-2">
              <p
                className={`text-[6.8px] font-black ${
                  light ? "text-white" : "text-slate-900"
                }`}
              >
                {role}
              </p>

              <p
                className={`text-[5.7px] font-bold ${
                  light ? "text-white/60" : "text-slate-400"
                }`}
              >
                {date}
              </p>
            </div>

            <p
              className={`text-[6.2px] ${
                light ? "text-white/70" : "text-slate-500"
              }`}
            >
              {company}
            </p>

            <div className="mt-1 space-y-0.5">
              {points.map((point) => (
                <p
                  key={point}
                  className={`text-[6.2px] leading-[1.3] ${
                    light ? "text-white/65" : "text-slate-600"
                  }`}
                >
                  • {point}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniSkills({ data = shortCV, light = false }) {
  const items = data.skills || [];

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((skill) => (
        <span
          key={skill}
          className={`rounded-full px-1.5 py-0.5 text-[5.5px] font-bold ${
            light ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
function MiniPreview({ template, selectedColor, modalPreview = false }) {
  const p = modalPreview ? getFullProfile(template) : getProfile(template);
  const accent = selectedColor || template.colors[0];
  const dark =
    template.colors.find((color) => color !== accent) ||
    template.colors[1] ||
    template.colors[0];

  const layout = template.layout;

  const shellClass = (extra = "") =>
    `${
      modalPreview
        ? "min-h-[620px] overflow-visible"
        : "h-[360px] overflow-hidden"
    } rounded-[1.35rem] bg-white shadow-sm ring-1 ring-slate-200 ${extra}`;

  const creamShellClass = (extra = "") =>
    `${
      modalPreview
        ? "min-h-[620px] overflow-visible"
        : "h-[360px] overflow-hidden"
    } rounded-[1.35rem] bg-[#FBF7EF] shadow-sm ring-1 ring-slate-200 ${extra}`;

  const previewSummary = p.summary;

  const profileBlock = (
    <>
      <MiniTitle accent={accent}>Profile</MiniTitle>
      <p className="text-[6.5px] leading-[1.38] text-slate-600">
        {previewSummary}
      </p>
    </>
  );

  const contactBlock = (
    <p className="text-[6px] text-slate-500">
      {p.email} · {p.phone}
      {modalPreview && p.linkedin ? (
        <>
          <br />
          {p.location} · {p.linkedin}
        </>
      ) : null}
    </p>
  );

  const extraPreviewSections = modalPreview ? (
    <>
      <div className="mt-3">
        <MiniTitle accent={accent}>Achievements</MiniTitle>
        <p className="text-[6px] leading-[1.35] text-slate-600">
          {p.achievements?.slice(0, 2).join(" • ")}
        </p>
      </div>

      <div className="mt-3">
        <MiniTitle accent={accent}>Certifications</MiniTitle>
        <p className="text-[6px] leading-[1.35] text-slate-600">
          {p.certifications?.join(" · ")}
        </p>
      </div>

      <div className="mt-3">
        <MiniTitle accent={accent}>Languages</MiniTitle>
        <p className="text-[6px] leading-[1.35] text-slate-600">
          {p.languages?.join(" · ")}
        </p>
      </div>
    </>
  ) : null;

  const headerBasic = (
    <header className="border-b pb-3" style={{ borderColor: `${accent}55` }}>
      <h3 className="text-[15px] font-black leading-tight text-slate-950">
        {p.name}
      </h3>

      <p
        className="mt-1 text-[7px] font-bold uppercase tracking-[0.16em]"
        style={{ color: accent }}
      >
        {p.title}
      </p>

      <div className="mt-1">{contactBlock}</div>
    </header>
  );

  const layoutMap = {
    "eu-photo-document": (
      <div className={shellClass("p-4")}>
        <header
          className="flex gap-3 border-b pb-3"
          style={{ borderColor: `${accent}55` }}
        >
          <Photo template={template} accent={accent} />

          <div>
            <p
              className="text-[6px] font-black uppercase tracking-[.22em]"
              style={{ color: accent }}
            >
              European CV
            </p>

            <h3 className="mt-1 text-[14px] font-black">{p.name}</h3>

            <p className="text-[7px] font-bold" style={{ color: accent }}>
              {p.title}
            </p>

            <div className="mt-1">{contactBlock}</div>
          </div>
        </header>

        <main className="mt-3 grid grid-cols-[35%_65%] gap-3">
          <aside>
            <MiniTitle accent={accent}>Details</MiniTitle>
            <p className="text-[6px] text-slate-500">
              {p.location}
              <br />
              {p.phone}
              <br />
              {p.email}
            </p>

            <div className="mt-3">
              <MiniTitle accent={accent}>Skills</MiniTitle>
              <MiniSkills data={p} />
            </div>

            {modalPreview && (
              <>
                <div className="mt-3">
                  <MiniTitle accent={accent}>Languages</MiniTitle>
                  <p className="text-[6px] leading-[1.35] text-slate-600">
                    {p.languages?.join(" · ")}
                  </p>
                </div>

                <div className="mt-3">
                  <MiniTitle accent={accent}>Education</MiniTitle>
                  <p className="text-[6px] leading-[1.35] text-slate-600">
                    {p.education}
                  </p>
                </div>
              </>
            )}
          </aside>

          <section>
            {profileBlock}

            <div className="mt-3">
              <MiniTitle accent={accent}>Experience</MiniTitle>
              <MiniExp data={p} />
            </div>

            {extraPreviewSections}
          </section>
        </main>
      </div>
    ),

 "berlin-side-photo": (
  <div className={shellClass()}>
    <div
      className={
        modalPreview
          ? "grid min-h-[620px] grid-cols-[36%_64%] items-stretch"
          : "grid min-h-full grid-cols-[36%_64%] items-stretch"
      }
    >
      <aside
        className="h-full min-h-full p-4 text-white"
        style={{ background: dark }}
      >
        <Photo template={template} accent={accent} />

        <h3 className="mt-4 text-[13px] font-black">{p.name}</h3>

        <p className="text-[7px] text-white/70">{p.title}</p>

        <div className="mt-5">
          <MiniTitle accent="#fff">Contact</MiniTitle>
          <p className="text-[6px] leading-[1.4] text-white/70">
            {p.email}
            <br />
            {p.phone}
            <br />
            {p.location}
            {modalPreview && p.linkedin ? (
              <>
                <br />
                {p.linkedin}
              </>
            ) : null}
          </p>
        </div>

        <div className="mt-4">
          <MiniTitle accent="#fff">Skills</MiniTitle>
          <MiniSkills data={p} light />
        </div>

        {modalPreview && (
          <div className="mt-4">
            <MiniTitle accent="#fff">Languages</MiniTitle>
            <p className="text-[6px] leading-[1.4] text-white/70">
              {p.languages?.join(" · ")}
            </p>
          </div>
        )}
      </aside>

      <main className="h-full min-h-full p-4">
        <div
          className="rounded-xl p-3"
          style={{ backgroundColor: `${accent}12` }}
        >
          {profileBlock}
        </div>

        <div className="mt-4">
          <MiniTitle accent={accent}>Work History</MiniTitle>
          <MiniExp data={p} />
        </div>

        {extraPreviewSections}
      </main>
    </div>
  </div>
),

    "corporate-circle-photo": (
      <div className={shellClass("p-4")}>
        <div className="flex items-center gap-3">
          <Photo template={template} accent={accent} />

          <div>
            <h3 className="text-[15px] font-black">{p.name}</h3>
            <p className="text-[7px] font-bold" style={{ color: accent }}>
              {p.title}
            </p>
            <div className="mt-1">{contactBlock}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[62%_38%] gap-3">
          <main className="space-y-3">
            <section>{profileBlock}</section>

            <section>
              <MiniTitle accent={accent}>Experience</MiniTitle>
              <MiniExp data={p} />
            </section>

            {modalPreview && (
              <section>
                <MiniTitle accent={accent}>Achievements</MiniTitle>
                <p className="text-[6px] leading-[1.35] text-slate-600">
                  {p.achievements?.join(" • ")}
                </p>
              </section>
            )}
          </main>

          <aside
            className="rounded-2xl p-3"
            style={{ backgroundColor: `${accent}10` }}
          >
            <MiniTitle accent={accent}>Core</MiniTitle>
            <MiniSkills data={p} />

            <div className="mt-3">
              <MiniTitle accent={accent}>Education</MiniTitle>
              <p className="text-[6px] text-slate-600">{p.education}</p>
            </div>

            {modalPreview && (
              <>
                <div className="mt-3">
                  <MiniTitle accent={accent}>Certifications</MiniTitle>
                  <p className="text-[6px] leading-[1.35] text-slate-600">
                    {p.certifications?.join(" · ")}
                  </p>
                </div>

                <div className="mt-3">
                  <MiniTitle accent={accent}>Languages</MiniTitle>
                  <p className="text-[6px] leading-[1.35] text-slate-600">
                    {p.languages?.join(" · ")}
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    ),

    "creative-blob-photo": (
      <div className={shellClass("p-4")}>
        <div
          className="rounded-[1.4rem] p-4"
          style={{ background: `linear-gradient(135deg, ${accent}22, #fff)` }}
        >
          <div className="flex items-center gap-3">
            <Photo template={template} accent={accent} />

            <div>
              <p
                className="text-[6px] font-black uppercase tracking-[.22em]"
                style={{ color: accent }}
              >
                Creative
              </p>

              <h3 className="text-[15px] font-black">{p.name}</h3>

              <p className="text-[7px] font-bold" style={{ color: accent }}>
                {p.title}
              </p>

              <div className="mt-1">{contactBlock}</div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <section className="rounded-xl bg-slate-50 p-2">
            <MiniTitle accent={accent}>Profile</MiniTitle>
            <p className="text-[6px] leading-[1.3] text-slate-600">
              {p.summary}
            </p>
          </section>

          <section className="rounded-xl bg-slate-50 p-2">
            <MiniTitle accent={accent}>Skills</MiniTitle>
            <p className="text-[6px] leading-[1.3] text-slate-600">
              {p.skills.join(" · ")}
            </p>
          </section>

          <section className="rounded-xl bg-slate-50 p-2">
            <MiniTitle accent={accent}>Experience</MiniTitle>
            <MiniExp data={p} />
          </section>

          <section className="rounded-xl bg-slate-50 p-2">
            <MiniTitle accent={accent}>Education</MiniTitle>
            <p className="text-[6px] leading-[1.3] text-slate-600">
              {p.education}
            </p>

            {modalPreview && (
              <div className="mt-3">
                <MiniTitle accent={accent}>Languages</MiniTitle>
                <p className="text-[6px] leading-[1.3] text-slate-600">
                  {p.languages?.join(" · ")}
                </p>
              </div>
            )}
          </section>
        </div>

        {modalPreview && extraPreviewSections}
      </div>
    ),

    "luxury-oval-photo": (
      <div className={creamShellClass("p-4")}>
        <div className="text-center">
          <div className="flex justify-center">
            <Photo template={template} accent={accent} />
          </div>

          <p
            className="mt-2 text-[6px] font-black uppercase tracking-[.28em]"
            style={{ color: accent }}
          >
            Premium CV
          </p>

          <h3 className="mt-1 font-serif text-[16px] font-bold">{p.name}</h3>

          <p className="text-[7px] text-slate-600">{p.title}</p>

          <div
            className="mx-auto mt-2 h-[2px] w-16"
            style={{ backgroundColor: accent }}
          />
        </div>

        <main className="mt-4 grid grid-cols-[40%_60%] gap-3">
          <aside>
            <MiniTitle accent={accent}>Skills</MiniTitle>
            <MiniSkills data={p} />

            {modalPreview && (
              <>
                <div className="mt-3">
                  <MiniTitle accent={accent}>Education</MiniTitle>
                  <p className="text-[6px] leading-[1.35] text-slate-600">
                    {p.education}
                  </p>
                </div>

                <div className="mt-3">
                  <MiniTitle accent={accent}>Languages</MiniTitle>
                  <p className="text-[6px] leading-[1.35] text-slate-600">
                    {p.languages?.join(" · ")}
                  </p>
                </div>
              </>
            )}
          </aside>

          <section>
            <MiniTitle accent={accent}>Profile</MiniTitle>
            <p className="text-[6.5px] leading-[1.4] text-slate-600">
              {p.summary}
            </p>

            <div className="mt-3">
              <MiniTitle accent={accent}>Experience</MiniTitle>
              <MiniExp data={p} />
            </div>

            {extraPreviewSections}
          </section>
        </main>
      </div>
    ),

    "london-executive": (
      <div className={shellClass()}>
        <header
          className="p-5 text-white"
          style={{ background: `linear-gradient(135deg, ${dark}, #020617)` }}
        >
          <p
            className="text-[6px] font-black uppercase tracking-[.28em]"
            style={{ color: accent }}
          >
            Executive Profile
          </p>

          <h3 className="mt-1 text-[16px] font-black">{p.name}</h3>

          <p className="text-[7px] text-white/70">{p.title}</p>
        </header>

        <div className="grid grid-cols-[35%_65%] gap-3 p-4">
          <aside>
            <MiniTitle accent={accent}>Leadership</MiniTitle>
            <MiniSkills data={p} />

            {modalPreview && (
              <div className="mt-3">
                <MiniTitle accent={accent}>Contact</MiniTitle>
                <p className="text-[6px] leading-[1.35] text-slate-600">
                  {p.email}
                  <br />
                  {p.phone}
                  <br />
                  {p.location}
                </p>
              </div>
            )}
          </aside>

          <main>
            <MiniTitle accent={accent}>Career Profile</MiniTitle>
            <p className="text-[6.5px] text-slate-600">{p.summary}</p>

            <div className="mt-3">
              <MiniTitle accent={accent}>Experience</MiniTitle>
              <MiniExp data={p} />
            </div>

            {extraPreviewSections}
          </main>
        </div>
      </div>
    ),

    "clean-ats": (
      <div className={shellClass("p-5")}>
        {headerBasic}

        <main className="mt-4 space-y-3">
          <section>{profileBlock}</section>

          <section>
            <MiniTitle accent={accent}>Professional Experience</MiniTitle>
            <MiniExp data={p} />
          </section>

          <section>
            <MiniTitle accent={accent}>Skills</MiniTitle>
            <p className="text-[6.5px] text-slate-600">
              {p.skills.join(" | ")}
            </p>
          </section>

          {modalPreview && (
            <>
              <section>
                <MiniTitle accent={accent}>Education</MiniTitle>
                <p className="text-[6.5px] text-slate-600">{p.education}</p>
              </section>

              <section>
                <MiniTitle accent={accent}>Certifications</MiniTitle>
                <p className="text-[6.5px] text-slate-600">
                  {p.certifications?.join(" | ")}
                </p>
              </section>

              <section>
                <MiniTitle accent={accent}>Languages</MiniTitle>
                <p className="text-[6.5px] text-slate-600">
                  {p.languages?.join(" | ")}
                </p>
              </section>
            </>
          )}
        </main>
      </div>
    ),

    "classic-pro": (
      <div className={shellClass("p-5")}>
        <header className="text-center">
          <h3 className="text-[16px] font-serif font-bold">{p.name}</h3>

          <p
            className="mt-1 text-[7px] uppercase tracking-[.18em]"
            style={{ color: accent }}
          >
            {p.title}
          </p>

          <div className="mt-1">{contactBlock}</div>
        </header>

        <div className="my-3 h-px" style={{ backgroundColor: accent }} />

        <main className="space-y-3">
          <section>{profileBlock}</section>

          <section>
            <MiniTitle accent={accent}>Employment</MiniTitle>
            <MiniExp data={p} />
          </section>

          {modalPreview && (
            <>
              <section>
                <MiniTitle accent={accent}>Skills</MiniTitle>
                <MiniSkills data={p} />
              </section>

              <section>
                <MiniTitle accent={accent}>Education</MiniTitle>
                <p className="text-[6px] text-slate-600">{p.education}</p>
              </section>

              {extraPreviewSections}
            </>
          )}
        </main>
      </div>
    ),

    "tech-minimal": (
      <div className={shellClass("p-4")}>
        <header className="rounded-2xl bg-slate-950 p-4 text-white">
          <p className="text-[6px] font-mono" style={{ color: accent }}>
            const candidate =
          </p>

          <h3 className="font-mono text-[15px] font-black">{p.name}</h3>

          <p className="text-[7px] text-white/60">{p.title}</p>
        </header>

        <main className="mt-4 grid grid-cols-[55%_45%] gap-3">
          <section>
            {profileBlock}

            <div className="mt-3">
              <MiniTitle accent={accent}>Experience</MiniTitle>
              <MiniExp data={p} />
            </div>

            {extraPreviewSections}
          </section>

          <aside>
            <MiniTitle accent={accent}>Stack</MiniTitle>
            <MiniSkills data={p} />

            {modalPreview && (
              <div className="mt-3">
                <MiniTitle accent={accent}>Education</MiniTitle>
                <p className="text-[6px] text-slate-600">{p.education}</p>
              </div>
            )}
          </aside>
        </main>
      </div>
    ),

    "graduate-fresh": (
      <div className={shellClass("p-4")}>
        <header
          className="rounded-2xl p-4"
          style={{ backgroundColor: `${accent}14` }}
        >
          <h3 className="text-[16px] font-black">{p.name}</h3>

          <p className="text-[7px] font-bold" style={{ color: accent }}>
            {p.title}
          </p>

          <div className="mt-1">{contactBlock}</div>
        </header>

        <main className="mt-3 grid grid-cols-2 gap-2">
          <section className="rounded-xl border p-2">
            <MiniTitle accent={accent}>Profile</MiniTitle>
            <p className="text-[6px] text-slate-600">{p.summary}</p>
          </section>

          <section className="rounded-xl border p-2">
            <MiniTitle accent={accent}>Education</MiniTitle>
            <p className="text-[6px] text-slate-600">{p.education}</p>
          </section>

          <section className="col-span-2 rounded-xl border p-2">
            <MiniTitle accent={accent}>Experience</MiniTitle>
            <MiniExp data={p} />
          </section>

          {modalPreview && (
            <>
              <section className="rounded-xl border p-2">
                <MiniTitle accent={accent}>Skills</MiniTitle>
                <MiniSkills data={p} />
              </section>

              <section className="rounded-xl border p-2">
                <MiniTitle accent={accent}>Certifications</MiniTitle>
                <p className="text-[6px] leading-[1.35] text-slate-600">
                  {p.certifications?.join(" · ")}
                </p>
              </section>
            </>
          )}
        </main>
      </div>
    ),

    default: (
      <div className={shellClass("p-5")}>
        {headerBasic}

        <main className="mt-4 space-y-3">
          <section>{profileBlock}</section>

          <section>
            <MiniTitle accent={accent}>Experience</MiniTitle>
            <MiniExp data={p} />
          </section>

          <section>
            <MiniTitle accent={accent}>Skills</MiniTitle>
            <MiniSkills data={p} />
          </section>

          {modalPreview && (
            <>
              <section>
                <MiniTitle accent={accent}>Education</MiniTitle>
                <p className="text-[6px] text-slate-600">{p.education}</p>
              </section>

              {extraPreviewSections}
            </>
          )}
        </main>
      </div>
    ),
  };

  return layoutMap[layout] || layoutMap.default;
}

function FullTitle({ children, accent, light = false }) {
  return (
    <p className="mb-2 border-b pb-1 text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: light ? "#fff" : accent, borderColor: light ? "rgba(255,255,255,.25)" : `${accent}55` }}>
      {children}
    </p>
  );
}

function FullExperience({ data, light = false }) {
  return (
    <div className="space-y-4">
      {data.experience.map((job) => (
        <div key={job.role}>
          <div className="flex justify-between gap-3">
            <div>
              <p className={`text-[12px] font-black ${light ? "text-white" : "text-slate-950"}`}>{job.role}</p>
              <p className={`text-[11px] ${light ? "text-white/70" : "text-slate-500"}`}>{job.company}</p>
            </div>
            <p className={`text-[10px] font-bold ${light ? "text-white/55" : "text-slate-400"}`}>{job.date}</p>
          </div>
          <ul className="mt-2 space-y-1">
            {job.points.map((point) => (
              <li key={point} className={`text-[10.5px] leading-[1.55] ${light ? "text-white/75" : "text-slate-600"}`}>• {point}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function FullSkills({ data, light = false }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {data.skills.map((skill) => (
        <span key={skill} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${light ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700"}`}>
          {skill}
        </span>
      ))}
    </div>
  );
}

function List({ items, light = false }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className={`text-[10.5px] leading-[1.55] ${light ? "text-white/75" : "text-slate-600"}`}>• {item}</li>
      ))}
    </ul>
  );
}

function FullReadyCVPage({ template, selectedColor }) {
  const p = getFullProfile(template);
  const accent = selectedColor || template.colors[0];
  const dark = template.colors.find((color) => color !== accent) || template.colors[1] || template.colors[0];

  const twoColumnLayouts = [
    "berlin-side-photo",
    "corporate-circle-photo",
    "dubai-corporate",
    "hr-professional",
    "premium-monogram",
    "luxury-oval-photo",
    "finance-analyst",
    "project-manager",
  ];

  const creativeLayouts = [
    "creative-blob-photo",
    "marketing-bold",
    "hospitality-premium",
    "engineer-grid",
    "teacher-friendly",
    "data-analyst",
  ];

if (twoColumnLayouts.includes(template.layout)) {
  return (
    <div className="grid min-h-[1123px] w-full grid-cols-[32%_68%] bg-white text-slate-950">
      <aside
        className="min-h-[1123px] p-8 text-white"
        style={{ background: `linear-gradient(180deg, ${dark}, ${accent})` }}
      >
        {template.photo && (
          <div className="mb-5">
            <Photo template={template} accent={accent} large />
          </div>
        )}

        <h2 className="text-[25px] font-black leading-tight">
          {p.name}
        </h2>

        <p className="mt-2 text-[12px] font-semibold text-white/75">
          {p.title}
        </p>

        <div className="mt-7 space-y-2 text-[10px] leading-5 text-white/75">
          <p>{p.email}</p>
          <p>{p.phone}</p>
          <p>{p.location}</p>
          <p>{p.linkedin}</p>
        </div>

        <div className="mt-8">
          <FullTitle accent={accent} light>
            Skills
          </FullTitle>
          <FullSkills data={p} light />
        </div>

        <div className="mt-8">
          <FullTitle accent={accent} light>
            Languages
          </FullTitle>
          <List items={p.languages} light />
        </div>

        <div className="mt-8">
          <FullTitle accent={accent} light>
            Certifications
          </FullTitle>
          <List items={p.certifications} light />
        </div>
      </aside>

      <main className="min-h-[1123px] p-9">
        <section>
          <FullTitle accent={accent}>Profile</FullTitle>
          <p className="text-[11px] leading-[1.65] text-slate-600">
            {p.summary}
          </p>
        </section>

        <section className="mt-6">
          <FullTitle accent={accent}>Employment History</FullTitle>
          <FullExperience data={p} />
        </section>

        <section className="mt-6">
          <FullTitle accent={accent}>Key Achievements</FullTitle>
          <List items={p.achievements} />
        </section>

        <section className="mt-6">
          <FullTitle accent={accent}>Education</FullTitle>
          <p className="text-[11px] text-slate-600">
            {p.education}
          </p>
        </section>
      </main>
    </div>
  );
}
  if (creativeLayouts.includes(template.layout)) {
    return (
      <div className="h-full w-full bg-white p-9 text-slate-950">
        <header className="rounded-[1.4rem] p-7" style={{ background: `linear-gradient(135deg, ${accent}18, #ffffff)`, border: `1px solid ${accent}25` }}>
          <div className="flex items-center gap-5">
            {template.photo && <Photo template={template} accent={accent} large />}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: accent }}>{template.name}</p>
              <h2 className="mt-2 text-[32px] font-black leading-tight">{p.name}</h2>
              <p className="mt-1 text-[13px] font-bold" style={{ color: accent }}>{p.title}</p>
              <p className="mt-2 text-[10.5px] text-slate-500">{p.email} · {p.phone} · {p.location}</p>
            </div>
          </div>
        </header>
        <main className="mt-7 grid grid-cols-[58%_42%] gap-7">
          <div className="space-y-6">
            <section><FullTitle accent={accent}>Profile</FullTitle><p className="text-[11px] leading-[1.65] text-slate-600">{p.summary}</p></section>
            <section><FullTitle accent={accent}>Experience</FullTitle><FullExperience data={p} /></section>
            <section><FullTitle accent={accent}>Achievements</FullTitle><List items={p.achievements} /></section>
          </div>
          <aside className="space-y-6">
            <section><FullTitle accent={accent}>Skills</FullTitle><FullSkills data={p} /></section>
            <section><FullTitle accent={accent}>Education</FullTitle><p className="text-[11px] text-slate-600">{p.education}</p></section>
            <section><FullTitle accent={accent}>Certifications</FullTitle><List items={p.certifications} /></section>
            <section><FullTitle accent={accent}>Languages</FullTitle><List items={p.languages} /></section>
          </aside>
        </main>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white p-10 text-slate-950">
      <header className="border-b pb-5" style={{ borderColor: `${accent}55` }}>
        <div className="flex items-center gap-5">
          {template.photo && <Photo template={template} accent={accent} large />}
          <div>
            <h2 className="text-[34px] font-black leading-tight">{p.name}</h2>
            <p className="mt-1 text-[12px] font-black uppercase tracking-[0.18em]" style={{ color: accent }}>{p.title}</p>
            <p className="mt-2 text-[10.5px] text-slate-500">{p.email} · {p.phone} · {p.location}</p>
            <p className="mt-1 text-[10.5px] text-slate-500">{p.linkedin}</p>
          </div>
        </div>
      </header>
      <main className="mt-6 space-y-5">
        <section><FullTitle accent={accent}>Professional Summary</FullTitle><p className="text-[11px] leading-[1.65] text-slate-600">{p.summary}</p></section>
        <section><FullTitle accent={accent}>Employment History</FullTitle><FullExperience data={p} /></section>
        <section><FullTitle accent={accent}>Key Achievements</FullTitle><List items={p.achievements} /></section>
        <section><FullTitle accent={accent}>Skills</FullTitle><FullSkills data={p} /></section>
        <section className="grid grid-cols-2 gap-8">
          <div><FullTitle accent={accent}>Education</FullTitle><p className="text-[11px] text-slate-600">{p.education}</p></div>
          <div><FullTitle accent={accent}>Certifications</FullTitle><List items={p.certifications} /></div>
        </section>
        <section className="grid grid-cols-2 gap-8">
          <div><FullTitle accent={accent}>Languages</FullTitle><List items={p.languages} /></div>
          <div><FullTitle accent={accent}>References</FullTitle><p className="text-[10.5px] text-slate-600">References available on request.</p></div>
        </section>
      </main>
    </div>
  );
}

function CVPreview({ template, selectedColor, large = false }) {
  return (
    <MiniPreview
      template={template}
      selectedColor={selectedColor}
      modalPreview={large}
    />
  );
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
  onUse,
}) {
  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-[1.7rem] border bg-white p-3 transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.16)] ${
        selected
          ? "border-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.16)]"
          : "border-slate-200 shadow-sm"
      }`}
    >
      <div className="relative overflow-hidden rounded-[1.35rem] bg-slate-100">
        <CVPreview template={template} selectedColor={selectedColor} />

        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black text-slate-700 shadow-sm">
          {template.tag}
        </span>

        {selected && (
          <span className="absolute right-3 top-3 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black text-white shadow-sm">
            Selected
          </span>
        )}

        {/* Desktop hover buttons */}
        <div className="absolute inset-0 hidden items-center justify-center gap-2 bg-slate-950/0 opacity-0 transition group-hover:bg-slate-950/45 group-hover:opacity-100 md:flex">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onPreview();
            }}
            className="rounded-full bg-white px-4 py-2 text-[11px] font-black text-slate-950 shadow-lg"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onUse();
            }}
            className="rounded-full bg-slate-950 px-4 py-2 text-[11px] font-black text-white shadow-lg"
          >
            Use
          </button>
        </div>

        {/* Mobile always visible buttons */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 md:hidden">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onPreview();
            }}
            className="flex-1 rounded-full bg-white px-3 py-2 text-[10px] font-black text-slate-950 shadow-lg"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onUse();
            }}
            className="flex-1 rounded-full bg-slate-950 px-3 py-2 text-[10px] font-black text-white shadow-lg"
          >
            Use
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3 px-1 pb-1">
        <div>
          <h3 className="text-sm font-black text-slate-950">
            {template.name}
          </h3>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            {template.category} CV template
          </p>

          <ColorPicker
            template={template}
            selectedColor={selectedColor}
            onChange={onColorChange}
          />
        </div>

        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
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
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/85 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <div className="relative z-[100000] mx-auto w-full max-w-6xl rounded-[1.5rem] bg-white p-4 shadow-2xl sm:rounded-[2rem] sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-4 sm:mb-5 sm:flex-row sm:items-center">
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

        <div className="mx-auto h-[78vh] min-h-[620px] w-full max-w-[820px] overflow-y-auto overflow-x-hidden rounded-[1.4rem] bg-slate-100 p-4 shadow-[0_25px_80px_rgba(15,23,42,0.18)] ring-1 ring-slate-200 sm:min-h-[720px] sm:p-6">
          <div className="flex w-full justify-center">
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
  .preview-scale-holder {
    width: 360px;
    min-height: calc(1123px * 0.45);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow: visible;
  }

  .preview-scale-inner {
    width: 320px;
    min-width: 320px;
    min-height: 1123px;
    transform: scale(1);
    transform-origin: top center;
  }

  @media (max-width: 380px) {
    .preview-scale-holder {
      width: 340px;
    }

    .preview-scale-inner {
      transform: scale(0.95);
    }
  }

  @media (min-width: 640px) {
    .preview-scale-holder {
      width: 560px;
      min-height: calc(1123px * 1.55);
    }

    .preview-scale-inner {
      transform: scale(1.55);
    }
  }

  @media (min-width: 768px) {
    .preview-scale-holder {
      width: 620px;
      min-height: calc(1123px * 1.65);
    }

    .preview-scale-inner {
      transform: scale(1.65);
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
    router.push(`/cv-builder/create?template=${template.id}&color=${encodeURIComponent(selectedColor || template.colors[0])}`);
  };

  const handleOldCVUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt"];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((extension) => fileName.endsWith(extension));

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
      router.push(`/cv-builder/create?template=${template.id}&color=${encodeURIComponent(selectedColor || template.colors[0])}&oldcv=yes`);
    } catch (error) {
      console.error("Old CV upload error:", error);
      alert("Unable to upload or extract this CV.");
    } finally {
      setUploading(false);
    }
  };

 return (
  <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-slate-950/70 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
    <div className="w-full max-w-[92vw] rounded-[1.4rem] bg-white p-4 text-slate-950 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 sm:text-xs">
            Selected Template
          </p>

          <h2 className="mt-1 text-xl font-black sm:mt-2 sm:text-3xl">
            {template.name}
          </h2>

          <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
            Upload your old CV to prepare the new CV faster, or start with the selected professional template.
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

      <div className="mt-5 grid gap-3 sm:mt-8 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <h3 className="text-lg font-black sm:text-xl">
            Yes, I have old CV
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
            Upload PDF, DOC, DOCX or TXT. Your details will be extracted and prepared inside the selected template.
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
            <p className="mt-3 break-all text-xs font-semibold text-slate-500">
              Uploaded: {uploadedFileName}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="text-lg font-black sm:text-xl">
            No, start empty
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
            Open the selected CV template with an empty form and fill your details manually.
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
  onPreview={() => {
    setSelectedTemplateId(template.id);
    setPreviewTemplate(template);
  }}
  onUse={() => {
    setSelectedTemplateId(template.id);
    setShowOldCVPopup(true);
  }}
/>
          ))}
        </div>
      </section>
<div className="fixed inset-x-0 bottom-0 z-[80] border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden">
  <button
    type="button"
    onClick={() => {
      setSelectedTemplateId(activeTemplate.id);
      setShowOldCVPopup(true);
    }}
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
