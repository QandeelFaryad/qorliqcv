"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
} from "lucide-react";

/* =========================================================
   TEMPLATE DATA
   Selected from the existing CV Builder collection
========================================================= */

const templates = [
  {
    id: "clean-ats",
    name: "Clean ATS",
    category: "ATS",
    description:
      "A refined, single-column layout built around clarity.",
    colors: [
      "#2563EB",
      "#1D4ED8",
      "#0F172A",
      "#60A5FA",
      "#DBEAFE",
    ],
    nameText: "Oliver Smith",
    role: "Operations Manager",
    layout: "clean",
    photo: false,
  },
  {
    id: "london-executive",
    name: "London Executive",
    category: "Executive",
    description:
      "A confident executive design with a premium header.",
    colors: [
      "#B88A2C",
      "#A16207",
      "#111827",
      "#FACC15",
      "#FEF3C7",
    ],
    nameText: "James Carter",
    role: "Head of Operations",
    layout: "executive",
    photo: false,
  },
  {
    id: "berlin-side-photo",
    name: "Berlin Side Photo",
    category: "Photo",
    description:
      "A structured European CV with a full-height sidebar.",
    colors: [
      "#111827",
      "#020617",
      "#374151",
      "#94A3B8",
      "#F1F5F9",
    ],
    nameText: "Daniel Carter",
    role: "Product Designer",
    layout: "sidebar",
    photo: "male",
  },
  {
    id: "eu-photo-document",
    name: "EU Photo Document",
    category: "European",
    description:
      "A balanced European document with a professional photo.",
    colors: [
      "#2563EB",
      "#1D4ED8",
      "#0F172A",
      "#60A5FA",
      "#DBEAFE",
    ],
    nameText: "Marta Rossi",
    role: "EU Project Coordinator",
    layout: "european",
    photo: "female",
  },
  {
    id: "corporate-circle-photo",
    name: "Corporate Circle Photo",
    category: "Corporate",
    description:
      "A contemporary corporate CV with a circular portrait.",
    colors: [
      "#2563EB",
      "#1D4ED8",
      "#0F172A",
      "#60A5FA",
      "#DBEAFE",
    ],
    nameText: "James Brown",
    role: "Corporate Manager",
    layout: "corporate",
    photo: "male2",
  },
  {
    id: "classic-pro",
    name: "Classic Pro",
    category: "Classic",
    description:
      "Traditional typography with a timeless professional feel.",
    colors: [
      "#475569",
      "#334155",
      "#0F172A",
      "#CBD5E1",
      "#F8FAFC",
    ],
    nameText: "George Wilson",
    role: "Business Administrator",
    layout: "classic",
    photo: false,
  },
  {
    id: "tech-minimal",
    name: "Tech Minimal",
    category: "Technology",
    description:
      "A focused developer resume with modern visual details.",
    colors: [
      "#0891B2",
      "#0E7490",
      "#164E63",
      "#67E8F9",
      "#CFFAFE",
    ],
    nameText: "Noah Edwards",
    role: "Full Stack Developer",
    layout: "tech",
    photo: false,
  },
  {
    id: "luxury-oval-photo",
    name: "Luxury Oval Photo",
    category: "Premium",
    description:
      "An elegant editorial layout with understated luxury.",
    colors: [
      "#B88A2C",
      "#A16207",
      "#111827",
      "#FACC15",
      "#FEF3C7",
    ],
    nameText: "Amelia Grant",
    role: "Client Relationship Manager",
    layout: "luxury",
    photo: "female2",
  },
  {
    id: "dubai-corporate",
    name: "Dubai Corporate",
    category: "International",
    description:
      "A bold, professional CV for international careers.",
    colors: [
      "#0F766E",
      "#115E59",
      "#134E4A",
      "#5EEAD4",
      "#CCFBF1",
    ],
    nameText: "Omar Hassan",
    role: "Business Development Manager",
    layout: "dubai",
    photo: false,
  },
  {
    id: "graduate-fresh",
    name: "Graduate Fresh",
    category: "Graduate",
    description:
      "A fresh, approachable layout for emerging professionals.",
    colors: [
      "#059669",
      "#047857",
      "#064E3B",
      "#34D399",
      "#D1FAE5",
    ],
    nameText: "Adam Khan",
    role: "Computer Science Graduate",
    layout: "graduate",
    photo: false,
  },
];

/* =========================================================
   SAMPLE CV CONTENT
========================================================= */

const cvData = {
  email: "candidate@email.com",
  phone: "+44 7700 123456",
  location: "London, United Kingdom",

  summary:
    "Results-driven professional with over seven years of experience in business operations, project delivery and cross-functional collaboration. Skilled in improving workflows, managing stakeholder relationships and delivering measurable business outcomes.",

  experience: [
    {
      title: "Senior Operations Manager",
      company: "Brightline Services",
      date: "2021 — Present",
      points: [
        "Improved operational efficiency by 38% through redesigned processes and reporting systems.",
        "Managed cross-functional teams and coordinated business operations across multiple departments.",
        "Introduced performance dashboards that improved leadership visibility and decision-making.",
      ],
    },
    {
      title: "Operations Coordinator",
      company: "Apex Group",
      date: "2018 — 2021",
      points: [
        "Coordinated operational planning, reporting and stakeholder communications.",
        "Reduced administrative processing time by 22% through workflow improvements.",
      ],
    },
    {
      title: "Administrative Officer",
      company: "Northfield Business Support",
      date: "2015 — 2018",
      points: [
        "Maintained business documentation and supported executive operations.",
        "Improved internal reporting accuracy and document control procedures.",
      ],
    },
  ],

  education: [
    {
      degree: "BA Business Management",
      school: "University of Manchester",
      date: "2012 — 2015",
    },
  ],

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

  certifications: [
    "PRINCE2 Project Management",
    "Advanced Microsoft Excel",
    "Business Administration",
  ],

  languages: [
    "English — Fluent",
    "Arabic — Professional",
  ],

  projects: [
    {
      title: "Operations Reporting Dashboard",
      detail:
        "Designed a KPI reporting system that improved performance visibility.",
    },
    {
      title: "Workflow Improvement Project",
      detail:
        "Streamlined internal processes and reduced manual administration.",
    },
  ],
};

/* =========================================================
   PROFILE PHOTOS
========================================================= */

const photos = {
  male:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85",

  male2:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85",

  female:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=85",

  female2:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=85",
};

/* =========================================================
   A4 SCALE HOOK

   Always renders the complete 794 × 1123 document.
   Only the visual scale changes.
========================================================= */

function useA4Scale() {
  const containerRef = useRef(null);

  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    const updateScale = () => {
      const width = element.clientWidth;

      if (!width) return;

      const nextScale = Math.min(
        width / 794,
        1
      );

      setScale(nextScale);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return {
    containerRef,
    scale,
  };
}

/* =========================================================
   CV SECTION TITLE
========================================================= */

function CVTitle({ children, color }) {
  return (
    <h4
      className="
        mb-3
        border-b
        pb-2
        text-[12px]
        font-extrabold
        uppercase
        tracking-[0.13em]
      "
      style={{
        color,
        borderColor: `${color}40`,
      }}
    >
      {children}
    </h4>
  );
}

/* =========================================================
   CV EXPERIENCE
========================================================= */

function Experience({ color, compact = false }) {
  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {cvData.experience.map((job) => (
        <div key={job.title}>
          <div className="flex items-start justify-between gap-4">
            <h5 className="text-[12px] font-bold text-slate-900">
              {job.title}
            </h5>

            <span className="shrink-0 text-[10px] text-slate-500">
              {job.date}
            </span>
          </div>

          <p
            className="mt-1 text-[11px] font-semibold"
            style={{ color }}
          >
            {job.company}
          </p>

          <ul className="mt-2 space-y-1.5">
            {job.points.map((point, index) => (
              <li
                key={index}
                className="flex gap-2 text-[10.5px] leading-[1.6] text-slate-600"
              >
                <span style={{ color }}>•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   CV SKILLS
========================================================= */

function Skills({ color, dark = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {cvData.skills.map((skill) => (
        <span
          key={skill}
          className={`
            rounded
            px-2.5
            py-1.5
            text-[10px]
            font-medium

            ${
              dark
                ? "bg-white/10 text-white"
                : "bg-slate-100 text-slate-700"
            }
          `}
          style={
            dark
              ? {}
              : {
                  borderLeft: `2px solid ${color}`,
                }
          }
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

/* =========================================================
   CV PHOTO
========================================================= */

function CVPhoto({
  type,
  shape = "circle",
  size = 100,
}) {
  if (!type) return null;

  return (
    <div
      className={`
        shrink-0
        overflow-hidden
        bg-slate-100

        ${
          shape === "oval"
            ? "rounded-[45%]"
            : shape === "square"
              ? "rounded-xl"
              : "rounded-full"
        }
      `}
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src={photos[type]}
        alt="Sample CV profile"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/* =========================================================
   CONTACT DETAILS
========================================================= */

function ContactDetails({
  dark = false,
  vertical = false,
}) {
  return (
    <div
      className={`
        text-[10px]
        leading-[1.8]

        ${dark ? "text-white/75" : "text-slate-500"}

        ${
          vertical
            ? "space-y-1"
            : "flex flex-wrap gap-x-3"
        }
      `}
    >
      <span>{cvData.email}</span>
      <span>{cvData.phone}</span>
      <span>{cvData.location}</span>
    </div>
  );
}

/* =========================================================
   STANDARD CONTENT
========================================================= */

function StandardContent({
  color,
  compact = false,
}) {
  return (
    <div className={compact ? "space-y-6" : "space-y-8"}>
      <section>
        <CVTitle color={color}>
          Professional Summary
        </CVTitle>

        <p className="text-[11px] leading-[1.75] text-slate-600">
          {cvData.summary}
        </p>
      </section>

      <section>
        <CVTitle color={color}>
          Professional Experience
        </CVTitle>

        <Experience color={color} compact={compact} />
      </section>

      <section>
        <CVTitle color={color}>
          Education
        </CVTitle>

        {cvData.education.map((item) => (
          <div
            key={item.degree}
            className="flex justify-between gap-4"
          >
            <div>
              <p className="text-[12px] font-bold text-slate-900">
                {item.degree}
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                {item.school}
              </p>
            </div>

            <span className="text-[10px] text-slate-500">
              {item.date}
            </span>
          </div>
        ))}
      </section>

      <section>
        <CVTitle color={color}>
          Core Competencies
        </CVTitle>

        <Skills color={color} />
      </section>
    </div>
  );
}

/* =========================================================
   FULL CV TEMPLATE ENGINE

   Renders a complete A4 preview immediately.
========================================================= */

function FullCVTemplate({ template, color }) {
  const layout = template.layout;

  const isSidebar = layout === "sidebar";

  const isEuropean = layout === "european";

  const isCorporate = layout === "corporate";

  const isLuxury = layout === "luxury";

  const isExecutive = layout === "executive";

  const isDubai = layout === "dubai";

  const isTech = layout === "tech";

  const isClassic = layout === "classic";

  const isGraduate = layout === "graduate";

  const isClean = layout === "clean";

  /* ========================================
     SIDEBAR LAYOUT
  ======================================== */

  if (isSidebar) {
    return (
      <div className="grid h-full grid-cols-[32%_68%] bg-white">
        <aside
          className="flex h-full flex-col gap-8 p-7 text-white"
          style={{
            background: color,
          }}
        >
          <CVPhoto
            type={template.photo}
            shape="square"
            size={135}
          />

          <div>
            <h2 className="text-[24px] font-bold leading-tight">
              {template.nameText}
            </h2>

            <p className="mt-2 text-[12px] text-white/75">
              {template.role}
            </p>
          </div>

          <section>
            <h4 className="mb-3 border-b border-white/25 pb-2 text-xs font-bold uppercase tracking-widest">
              Contact
            </h4>

            <ContactDetails dark vertical />
          </section>

          <section>
            <h4 className="mb-3 border-b border-white/25 pb-2 text-xs font-bold uppercase tracking-widest">
              Expertise
            </h4>

            <Skills color={color} dark />
          </section>

          <section>
            <h4 className="mb-3 border-b border-white/25 pb-2 text-xs font-bold uppercase tracking-widest">
              Certifications
            </h4>

            {cvData.certifications.map((item) => (
              <p
                key={item}
                className="mb-2 text-[10px] leading-relaxed text-white/80"
              >
                {item}
              </p>
            ))}
          </section>
        </aside>

        <main className="p-9">
          <StandardContent color={color} compact />
        </main>
      </div>
    );
  }

  /* ========================================
     EUROPEAN PHOTO LAYOUT
  ======================================== */

  if (isEuropean) {
    return (
      <div className="h-full bg-white p-10">
        <header
          className="flex items-center gap-7 border-b pb-7"
          style={{
            borderColor: color,
          }}
        >
          <CVPhoto
            type={template.photo}
            shape="square"
            size={110}
          />

          <div>
            <p
              className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color }}
            >
              European CV
            </p>

            <h2 className="text-[32px] font-bold tracking-tight text-slate-950">
              {template.nameText}
            </h2>

            <p className="mt-1 text-sm" style={{ color }}>
              {template.role}
            </p>
          </div>
        </header>

        <div className="mt-9 grid grid-cols-[28%_72%] gap-6">
          <aside className="space-y-8">
            <section>
              <CVTitle color={color}>Contact</CVTitle>
              <ContactDetails vertical />
            </section>

            <section>
              <CVTitle color={color}>Skills</CVTitle>
              <Skills color={color} />
            </section>

            <section>
              <CVTitle color={color}>Languages</CVTitle>
              {cvData.languages.map((item) => (
                <p
                  key={item}
                  className="mb-2 text-[10px] text-slate-600"
                >
                  {item}
                </p>
              ))}
            </section>
          </aside>

          <main>
            <StandardContent color={color} compact />
          </main>
        </div>
      </div>
    );
  }

  /* ========================================
     CORPORATE PHOTO LAYOUT
  ======================================== */

  if (isCorporate) {
    return (
      <div className="h-full bg-white p-10">
        <header className="flex items-center gap-7 border-b border-slate-200 pb-8">
          <CVPhoto
            type={template.photo}
            size={125}
          />

          <div>
            <h2 className="text-[34px] font-bold text-slate-950">
              {template.nameText}
            </h2>

            <p className="mt-1 text-sm" style={{ color }}>
              {template.role}
            </p>

            <div className="mt-4">
              <ContactDetails />
            </div>
          </div>
        </header>

        <div className="mt-9 grid grid-cols-[64%_36%] gap-6">
          <main>
            <StandardContent color={color} compact />
          </main>

          <aside
            className="h-fit space-y-8 rounded-xl p-6"
            style={{
              backgroundColor: `${color}10`,
            }}
          >
            <section>
              <CVTitle color={color}>Expertise</CVTitle>
              <Skills color={color} />
            </section>

            <section>
              <CVTitle color={color}>Languages</CVTitle>

              {cvData.languages.map((item) => (
                <p
                  key={item}
                  className="mb-2 text-[10px] text-slate-600"
                >
                  {item}
                </p>
              ))}
            </section>
          </aside>
        </div>
      </div>
    );
  }

  /* ========================================
     LUXURY PHOTO LAYOUT
  ======================================== */

  if (isLuxury) {
    return (
      <div className="h-full bg-[#FBF7EF] p-11">
        <header className="text-center">
          <div className="flex justify-center">
            <CVPhoto
              type={template.photo}
              shape="oval"
              size={125}
            />
          </div>

          <h2 className="mt-5 font-serif text-[35px] font-bold text-slate-950">
            {template.nameText}
          </h2>

          <p
            className="mt-2 text-[12px] uppercase tracking-[0.2em]"
            style={{ color }}
          >
            {template.role}
          </p>

          <div
            className="mx-auto mt-5 h-px w-24"
            style={{ backgroundColor: color }}
          />
        </header>

        <div className="mt-10 grid grid-cols-[30%_70%] gap-7">
          <aside className="space-y-8">
            <section>
              <CVTitle color={color}>Contact</CVTitle>
              <ContactDetails vertical />
            </section>

            <section>
              <CVTitle color={color}>Skills</CVTitle>
              <Skills color={color} />
            </section>
          </aside>

          <main>
            <StandardContent color={color} compact />
          </main>
        </div>
      </div>
    );
  }

  /* ========================================
     EXECUTIVE / DUBAI LAYOUT
  ======================================== */

  if (isExecutive || isDubai) {
    return (
      <div className="h-full bg-white">
        <header
          className={`
            px-11
            py-11
            text-white

            ${isDubai ? "text-right" : ""}
          `}
          style={{
            backgroundColor: color,
          }}
        >
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/60">
            Professional Curriculum Vitae
          </p>

          <h2 className="text-[36px] font-bold tracking-tight">
            {template.nameText}
          </h2>

          <p className="mt-2 text-sm text-white/80">
            {template.role}
          </p>

          <div
            className={`
              mt-5

              ${isDubai ? "flex justify-end" : ""}
            `}
          >
            <ContactDetails dark />
          </div>
        </header>

        <div className="grid grid-cols-[29%_71%] gap-8 p-10">
          <aside className="space-y-9">
            <section>
              <CVTitle color={color}>
                Core Skills
              </CVTitle>

              <Skills color={color} />
            </section>

            <section>
              <CVTitle color={color}>
                Languages
              </CVTitle>

              {cvData.languages.map((item) => (
                <p
                  key={item}
                  className="mb-2 text-[10px] text-slate-600"
                >
                  {item}
                </p>
              ))}
            </section>
          </aside>

          <main>
            <StandardContent color={color} compact />
          </main>
        </div>
      </div>
    );
  }

  /* ========================================
     TECH LAYOUT
  ======================================== */

  if (isTech) {
    return (
      <div className="h-full bg-white p-10">
        <header className="rounded-xl bg-[#0f172a] p-8 text-white">
          <p className="font-mono text-[11px] text-cyan-400">
            const candidate = () =&gt; {"{"}
          </p>

          <h2 className="mt-3 font-mono text-[30px] font-bold">
            {template.nameText}
          </h2>

          <p className="mt-2 font-mono text-[12px] text-cyan-300">
            {template.role}
          </p>

          <p className="mt-3 font-mono text-[10px] text-slate-400">
            {"}"}
          </p>
        </header>

        <div className="mt-9 grid grid-cols-[65%_35%] gap-7">
          <main>
            <StandardContent color={color} compact />
          </main>

          <aside className="space-y-8">
            <section>
              <CVTitle color={color}>
                Tech Stack
              </CVTitle>

              <Skills color={color} />
            </section>

            <section>
              <CVTitle color={color}>
                Contact
              </CVTitle>

              <ContactDetails vertical />
            </section>
          </aside>
        </div>
      </div>
    );
  }

  /* ========================================
     CLASSIC / GRADUATE / CLEAN LAYOUT
  ======================================== */

  return (
    <div className="h-full bg-white p-11">
      <header
        className={`
          pb-7

          ${
            isClassic
              ? "text-center"
              : "text-left"
          }

          ${
            isGraduate
              ? "rounded-xl bg-emerald-50 p-7"
              : "border-b border-slate-200"
          }
        `}
      >
        <h2
          className={`
            text-[36px]
            font-bold
            tracking-tight
            text-slate-950

            ${isClassic ? "font-serif" : ""}
          `}
        >
          {template.nameText}
        </h2>

        <p
          className="mt-2 text-[13px] font-semibold"
          style={{ color }}
        >
          {template.role}
        </p>

        <div className="mt-4">
          <ContactDetails />
        </div>
      </header>

      <main className="mt-9">
        <StandardContent color={color} />
      </main>
    </div>
  );
}

/* =========================================================
   FULL A4 PREVIEW

   IMPORTANT:
   - Never cuts document to 410px
   - No preview modal required
   - Maintains actual A4 ratio
========================================================= */

function A4Preview({ template, color }) {
  const { containerRef, scale } = useA4Scale();

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      <div
        className="relative mx-auto"
        style={{
          width: 794 * scale,
          height: 1123 * scale,
        }}
      >
        <div
          className="
            absolute
            left-0
            top-0
            origin-top-left
            overflow-hidden
            bg-white
            shadow-[0_20px_65px_rgba(0,0,0,0.11)]
          "
          style={{
            width: 794,
            height: 1123,
            transform: `scale(${scale})`,
          }}
        >
          <FullCVTemplate
            template={template}
            color={color}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TEMPLATE SELECTOR
========================================================= */

function TemplateSelector({
  template,
  active,
  index,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        group
        relative
        flex
        w-full
        items-start
        gap-4
        border-b
        border-border
        px-5
        py-5
        text-left
        transition-all
        duration-300

        ${
          active
            ? "bg-background-muted"
            : "hover:bg-background-soft"
        }
      `}
    >
      {active && (
        <motion.span
          layoutId="active-template-line"
          className="
            absolute
            inset-y-0
            left-0
            w-[3px]
            bg-accent
          "
        />
      )}

      <span
        className="
          mt-1
          font-mono
          text-[11px]
          text-text-muted
        "
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3
            className={`
              text-[19px]
              font-semibold
              tracking-[-0.035em]
              transition-colors

              ${
                active
                  ? "text-text-primary"
                  : "text-text-secondary group-hover:text-text-primary"
              }
            `}
          >
            {template.name}
          </h3>

          <ArrowUpRight
            size={17}
            className={`
              shrink-0
              transition-all
              duration-300

              ${
                active
                  ? "text-accent"
                  : "text-text-muted opacity-0 group-hover:opacity-100"
              }
            `}
          />
        </div>

        <p
          className="
            mt-2
            text-[12px]
            leading-[1.7]
            text-text-secondary
          "
        >
          {template.description}
        </p>

        {active && (
          <span
            className="
              mt-3
              inline-block
              font-mono
              text-[10px]
              uppercase
              tracking-[0.15em]
              text-text-muted
            "
          >
            {template.category}
          </span>
        )}
      </div>
    </button>
  );
}

/* =========================================================
   COLOR SELECTOR
========================================================= */

function ColorSelector({
  template,
  selectedColor,
  onChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {template.colors.map((color, index) => (
        <button
          key={`${template.id}-${color}-${index}`}
          type="button"
          onClick={() => onChange(color)}
          aria-label={`Select color ${index + 1}`}
          aria-pressed={selectedColor === color}
          className={`
            relative
            h-7
            w-7
            rounded-full
            border-2
            transition-all
            duration-200
            hover:scale-110

            ${
              selectedColor === color
                ? "scale-110 border-text-primary ring-2 ring-border-strong"
                : "border-surface"
            }
          `}
          style={{
            backgroundColor: color,
          }}
        >
          {selectedColor === color && (
            <Check
              size={13}
              className="absolute inset-0 m-auto text-white"
            />
          )}
        </button>
      ))}
    </div>
  );
}

/* =========================================================
   MAIN LAYOUTS SECTION
========================================================= */

export default function LayoutsSection() {
  const reduceMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);

  const [selectedColors, setSelectedColors] =
    useState(() =>
      Object.fromEntries(
        templates.map((template) => [
          template.id,
          template.colors[0],
        ])
      )
    );

  const activeTemplate = templates[activeIndex];

  const activeColor =
    selectedColors[activeTemplate.id] ||
    activeTemplate.colors[0];

  const handleColorChange = (color) => {
    setSelectedColors((previous) => ({
      ...previous,
      [activeTemplate.id]: color,
    }));
  };

  const changeTemplate = (direction) => {
    setActiveIndex((previous) =>
      (previous + direction + templates.length) %
      templates.length
    );
  };

  const templateURL =
    `/cv-builder/create?template=${activeTemplate.id}` +
    `&color=${encodeURIComponent(activeColor)}`;

  return (
    <section
      id="layouts"
      aria-labelledby="layouts-heading"
      className="
        relative
        overflow-hidden
        bg-background
        py-24
        sm:py-28
        lg:py-36
      "
    >
      <div
        className="
          mx-auto
          max-w-[1440px]
          px-5
          sm:px-8
          lg:px-12
          xl:px-16
        "
      >
        {/* ============================================
            SECTION INTRODUCTION
        ============================================ */}

        <div
          className="
            grid
            grid-cols-1
            items-end
            gap-10
            lg:grid-cols-[1.3fr_0.7fr]
          "
        >
          <div>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="
                mb-8
                font-mono
                text-[10px]
                uppercase
                tracking-[0.2em]
                text-text-muted
              "
            >
              03 — LAYOUTS
            </motion.p>

            <h2
              id="layouts-heading"
              className="
                max-w-[850px]
                text-[clamp(3rem,6vw,6.5rem)]
                font-semibold
                leading-[1.03]
                tracking-[-0.075em]
                text-text-primary
              "
            >
              <motion.span
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="block"
              >
                A few layouts.
              </motion.span>

              <motion.span
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: 0.15,
                }}
                className="block"
              >
                Each one{" "}
                <span className="relative inline-block">
                  <span
                    className="
                      relative
                      z-10
                      font-editorial
                      font-normal
                      italic
                    "
                  >
                    considered.
                  </span>

                  <motion.span
                    aria-hidden="true"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: 0.65,
                    }}
                    style={{
                      transformOrigin: "left",
                    }}
                    className="
                      absolute
                      bottom-[0.06em]
                      left-0
                      h-[0.27em]
                      w-full
                      bg-accent
                    "
                  />
                </span>
              </motion.span>
            </h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.75,
              delay: 0.2,
            }}
            className="
              max-w-[390px]
              text-[16px]
              leading-[1.85]
              text-text-secondary
              lg:ml-auto
              lg:pb-2
            "
          >
            Pick a layout and watch your CV transform.
            Ten carefully considered designs, each
            created to present your experience with
            confidence and clarity.
          </motion.p>
        </div>

        {/* ============================================
            TEMPLATE INTERACTIVE AREA
        ============================================ */}

        <div
          className="
            mt-16
            grid
            grid-cols-1
            items-start
            gap-8
            lg:mt-20
            lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]
            lg:gap-10
            xl:gap-16
          "
        >
          {/* ========================================
              LEFT TEMPLATE LIST
          ======================================== */}

          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="
              min-w-0
              border-t
              border-border-strong
            "
          >
            {templates.map((template, index) => (
              <TemplateSelector
                key={template.id}
                template={template}
                index={index}
                active={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </motion.div>

          {/* ========================================
              RIGHT TEMPLATE PREVIEW
          ======================================== */}

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="
              relative
              min-w-0
              rounded-[20px]
              bg-background-soft
              p-4
              sm:p-6
              lg:sticky
              lg:top-[105px]
              lg:p-8
            "
          >
            {/* PREVIEW HEADER */}

            <div
              className="
                mb-6
                flex
                flex-wrap
                items-center
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    font-mono
                    text-[10px]
                    uppercase
                    tracking-[0.17em]
                    text-text-muted
                  "
                >
                  Selected Layout
                </p>

                <h3
                  className="
                    mt-1
                    text-[20px]
                    font-semibold
                    tracking-[-0.04em]
                    text-text-primary
                  "
                >
                  {activeTemplate.name}
                </h3>
              </div>

              {/* NAVIGATION ARROWS */}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeTemplate(-1)}
                  aria-label="Previous template"
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-border
                    bg-surface
                    text-text-primary
                    transition-colors
                    hover:border-accent
                  "
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => changeTemplate(1)}
                  aria-label="Next template"
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-border
                    bg-surface
                    text-text-primary
                    transition-colors
                    hover:border-accent
                  "
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* ====================================
                FULL CV PREVIEW
            ==================================== */}

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTemplate.id}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 18,
                          scale: 0.985,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={
                    reduceMotion
                      ? undefined
                      : {
                          opacity: 0,
                          y: -12,
                          scale: 0.99,
                        }
                  }
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <A4Preview
                    template={activeTemplate}
                    color={activeColor}
                  />
                </motion.div>
              </AnimatePresence>

              {/* =================================
                  CENTER FLOATING ACTION
              ================================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  z-20
                  flex
                  items-center
                  justify-center
                "
              >
                <motion.div
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          y: [0, -6, 0],
                        }
                  }
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="pointer-events-auto"
                >
                  <Link
                    href={templateURL}
                    className="
                      group
                      inline-flex
                      min-h-12
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      border
                      border-white/20
                      bg-[#07183f]
                      px-5
                      py-3
                      text-[12px]
                      font-semibold
                      text-white
                      shadow-[0_10px_35px_rgba(0,0,0,0.24)]
                      transition-all
                      duration-300
                      hover:scale-105
                      hover:bg-[#102b66]

                      sm:px-7
                      sm:text-[13px]
                    "
                  >
                    <Sparkles
                      size={16}
                      className="text-accent"
                    />

                    Use This Template

                    <ArrowUpRight
                      size={16}
                      className="
                        transition-transform
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* ====================================
                PREVIEW FOOTER
            ==================================== */}

            <div
              className="
                mt-6
                flex
                flex-col
                gap-5
                border-t
                border-border
                pt-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <p
                  className="
                    mb-3
                    font-mono
                    text-[10px]
                    uppercase
                    tracking-[0.14em]
                    text-text-muted
                  "
                >
                  Choose Your Colour
                </p>

                <ColorSelector
                  template={activeTemplate}
                  selectedColor={activeColor}
                  onChange={handleColorChange}
                />
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[12px]
                  text-text-secondary
                "
              >
                <FileText
                  size={16}
                  className="text-accent"
                />

                Full A4 Preview
              </div>
            </div>
          </motion.div>
        </div>

        {/* ============================================
            BOTTOM CTA
        ============================================ */}

        <div
          className="
            mt-12
            flex
            flex-wrap
            items-center
            justify-between
            gap-5
            border-t
            border-border
            pt-7
          "
        >
          <p className="text-[14px] text-text-secondary">
            Looking for something different?
            Explore our complete collection of
            professional CV templates.
          </p>

          <Link
            href="/cv-builder"
            className="
              group
              inline-flex
              items-center
              gap-2
              text-[13px]
              font-semibold
              text-text-primary
              transition-colors
              hover:text-accent
            "
          >
            Explore All Templates

            <ArrowRight
              size={17}
              className="
                transition-transform
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>
      </div>
    </section>
  );
}