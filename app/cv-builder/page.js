"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const cvTemplates = [
  {
    id: "ats-professional",
    name: "ATS Professional",
    layout: "ats",
    category: "ats",
    industry: "All Industries",
    bestFor: "Online applications, recruiter portals and corporate roles",
    accent: "#111827",
    score: 98,
    description:
      "A clean ATS-friendly CV designed for applicant tracking systems and professional job applications.",
  },
  {
    id: "modern-corporate",
    name: "Modern Corporate",
    layout: "modern",
    category: "corporate",
    industry: "Office, Sales, Admin, HR, Marketing",
    bestFor: "Business, admin, operations and sales professionals",
    accent: "#2563EB",
    score: 95,
    description:
      "A polished modern layout with strong section hierarchy and a premium business feel.",
  },
  {
    id: "executive-leadership",
    name: "Executive Leadership",
    layout: "executive",
    category: "executive",
    industry: "Directors, Managers, Senior Professionals",
    bestFor: "Leadership, management and senior-level applications",
    accent: "#B88A2C",
    score: 94,
    description:
      "A refined executive CV built for decision-makers, senior managers and leadership profiles.",
  },
  {
    id: "creative-portfolio",
    name: "Creative Portfolio",
    layout: "creative",
    category: "creative",
    industry: "Design, Media, Content, Branding",
    bestFor: "Creative professionals who need style with structure",
    accent: "#7C3AED",
    score: 90,
    description:
      "A stylish but professional CV for designers, content creators, marketers and creative talent.",
  },
  {
    id: "graduate-entry",
    name: "Graduate Entry",
    layout: "student",
    category: "student",
    industry: "Students, Interns, Fresh Graduates",
    bestFor: "Fresh graduates, interns and first-job applicants",
    accent: "#059669",
    score: 96,
    description:
      "A smart graduate CV focused on education, projects, skills and career potential.",
  },
  {
    id: "technical-it",
    name: "Technical IT",
    layout: "technical",
    category: "technical",
    industry: "Developers, IT Support, Data, Cybersecurity",
    bestFor: "Software, IT, data and technical professionals",
    accent: "#0891B2",
    score: 95,
    description:
      "A technical CV layout built to highlight tech stack, projects, systems and measurable impact.",
  },
  {
    id: "academic-research",
    name: "Academic Research",
    layout: "academic",
    category: "academic",
    industry: "Teachers, Lecturers, Researchers",
    bestFor: "Academic, education and research-based applications",
    accent: "#4338CA",
    score: 93,
    description:
      "A formal academic CV for teaching, research, publications and higher education roles.",
  },
  {
    id: "healthcare-clinical",
    name: "Healthcare Clinical",
    layout: "healthcare",
    category: "healthcare",
    industry: "Nurses, Doctors, Pharmacists, Care Workers",
    bestFor: "Healthcare, nursing, care and clinical professionals",
    accent: "#0F766E",
    score: 94,
    description:
      "A trusted healthcare CV designed for clinical experience, certifications and patient-care skills.",
  },
  {
    id: "skilled-trade",
    name: "Skilled Trade",
    layout: "trade",
    category: "trade",
    industry: "Driver, Electrician, Warehouse, Mechanic, Chef",
    bestFor: "Practical, skilled, warehouse and trade-based roles",
    accent: "#EA580C",
    score: 96,
    description:
      "A strong practical CV for skilled workers, highlighting experience, licences and reliability.",
  },
  {
    id: "international-europass",
    name: "International Europass",
    layout: "europass",
    category: "international",
    industry: "EU Jobs, Scholarships, International Applications",
    bestFor: "European, international and scholarship applications",
    accent: "#1D4ED8",
    score: 97,
    description:
      "A structured international-style CV suitable for EU jobs, study applications and global roles.",
  },
];

const filters = [
  { id: "all", label: "All Templates" },
  { id: "ats", label: "ATS" },
  { id: "corporate", label: "Corporate" },
  { id: "executive", label: "Executive" },
  { id: "technical", label: "Technical" },
  { id: "student", label: "Graduate" },
  { id: "healthcare", label: "Healthcare" },
  { id: "creative", label: "Creative" },
  { id: "trade", label: "Trade" },
  { id: "international", label: "International" },
];

function CVSection({ title, children, accent }) {
  return (
    <section className="mb-3">
      <h4
        className="mb-1.5 border-b pb-1 text-[7px] font-black uppercase tracking-[0.18em]"
        style={{ color: accent, borderColor: `${accent}55` }}
      >
        {title}
      </h4>
      {children}
    </section>
  );
}

function CVRole({ title, company, date, bullets = [] }) {
  return (
    <div className="mb-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[7.5px] font-black leading-tight text-black">
            {title}
          </p>
          <p className="text-[6.5px] font-semibold text-black/50">
            {company}
          </p>
        </div>

        <p className="whitespace-nowrap text-[6px] font-bold text-black/45">
          {date}
        </p>
      </div>

      <ul className="mt-1 space-y-0.5">
        {bullets.map((bullet, index) => (
          <li key={index} className="text-[6.5px] leading-[1.35] text-black/65">
            • {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CVSkillBar({ skill, level = 85, accent, dark = false }) {
  return (
    <div className="mb-1.5">
      <div className="mb-0.5 flex items-center justify-between gap-2">
        <p
          className={`truncate text-[6px] font-semibold ${
            dark ? "text-white/75" : "text-black/65"
          }`}
        >
          {skill}
        </p>

        <p
          className={`text-[5px] font-semibold ${
            dark ? "text-white/45" : "text-black/35"
          }`}
        >
          {level}%
        </p>
      </div>

      <div
        className={`h-[3px] overflow-hidden rounded-full ${
          dark ? "bg-white/20" : "bg-black/10"
        }`}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${level}%`,
            backgroundColor: dark ? "#ffffff" : accent,
          }}
        />
      </div>
    </div>
  );
}

function CVPhoto({ accent, size = "md", square = false }) {
  const sizes = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={`${sizes[size]} shrink-0 overflow-hidden ${
        square ? "rounded-xl" : "rounded-full"
      } bg-white shadow-sm ring-2 ring-white/70`}
    >
      <div
        className="flex h-full w-full items-center justify-center text-[9px] font-black text-white"
        style={{ backgroundColor: accent }}
      >
        CV
      </div>
    </div>
  );
}

function getCVPreviewData(layout) {
  const common = {
    name: "Emma Williams",
    role: "Operations Manager",
    email: "emma.williams@email.com",
    phone: "+44 7700 123456",
    location: "London, UK",
    linkedin: "linkedin.com/in/emmawilliams",
  };

  const data = {
    ats: {
      ...common,
      role: "Operations Manager",
      summary:
        "Operations Manager with 8+ years of experience improving workflow efficiency, service delivery and reporting accuracy across fast-paced business environments.",
      employment: [
        {
          title: "Operations Manager",
          company: "Brightline Services, London",
          date: "Jan 2021 — Present",
          bullets: [
            "Improved monthly reporting accuracy by 38% through process automation.",
            "Managed supplier performance, internal workflows and executive reporting.",
          ],
        },
        {
          title: "Senior Operations Coordinator",
          company: "Apex Group, Manchester",
          date: "Jun 2017 — Dec 2020",
          bullets: [
            "Coordinated schedules, documentation and vendor communication.",
            "Supported budget tracking and compliance records across departments.",
          ],
        },
      ],
      education: [
        {
          degree: "BA Business Management",
          school: "University of Manchester",
          date: "2013 — 2016",
        },
      ],
      skills: [
        { name: "Operations Management", level: 94 },
        { name: "Reporting", level: 90 },
        { name: "Microsoft Excel", level: 88 },
        { name: "KPI Tracking", level: 86 },
        { name: "Vendor Management", level: 84 },
        { name: "Team Coordination", level: 91 },
      ],
      languages: ["English — Native", "Arabic — Professional"],
    },

    modern: {
      ...common,
      role: "Sales & Business Development Manager",
      summary:
        "Commercial professional experienced in B2B sales, lead generation, CRM management and revenue growth.",
      employment: [
        {
          title: "Business Development Manager",
          company: "CloudBridge Ltd, Birmingham",
          date: "Mar 2022 — Present",
          bullets: [
            "Increased qualified sales pipeline by 42% using targeted CRM workflows.",
            "Managed key accounts and improved client retention by 28%.",
          ],
        },
        {
          title: "Sales Executive",
          company: "Northpoint Solutions, Leeds",
          date: "Aug 2018 — Feb 2022",
          bullets: [
            "Generated new business leads through email, phone and LinkedIn outreach.",
            "Prepared weekly sales reports for senior management.",
          ],
        },
      ],
      education: [
        {
          degree: "BSc Marketing & Business",
          school: "University of Leeds",
          date: "2014 — 2017",
        },
      ],
      skills: [
        { name: "CRM Management", level: 92 },
        { name: "Sales Strategy", level: 90 },
        { name: "Lead Generation", level: 88 },
        { name: "Negotiation", level: 84 },
        { name: "Forecasting", level: 82 },
        { name: "Reporting", level: 86 },
      ],
      languages: ["English — Fluent", "Urdu — Native"],
    },

    executive: {
      ...common,
      name: "James Carter",
      role: "Head of Operations",
      summary:
        "Strategic operations leader with 12+ years of experience scaling teams, improving service delivery and leading business transformation.",
      employment: [
        {
          title: "Head of Operations",
          company: "Meridian Group, London",
          date: "Apr 2020 — Present",
          bullets: [
            "Led a 45-person team across logistics, planning and service delivery.",
            "Delivered £1.2M annual cost saving through supplier restructuring.",
          ],
        },
        {
          title: "Operations Lead",
          company: "Northpoint Services, London",
          date: "Jan 2015 — Mar 2020",
          bullets: [
            "Managed operational planning, performance reporting and process controls.",
            "Improved customer response time by 31% through workflow redesign.",
          ],
        },
      ],
      education: [
        {
          degree: "MBA",
          school: "London Business School",
          date: "2012 — 2014",
        },
      ],
      skills: [
        { name: "Leadership", level: 96 },
        { name: "Business Strategy", level: 94 },
        { name: "Budget Management", level: 91 },
        { name: "Stakeholder Management", level: 90 },
        { name: "Change Management", level: 88 },
        { name: "KPI Performance", level: 92 },
      ],
      languages: ["English — Native"],
    },

    creative: {
      ...common,
      name: "Sofia Miller",
      role: "Brand & Graphic Designer",
      summary:
        "Creative designer with experience in brand identity, campaign visuals, digital assets and design systems.",
      employment: [
        {
          title: "Brand Designer",
          company: "Studio Nova, London",
          date: "Feb 2021 — Present",
          bullets: [
            "Designed full brand systems for 20+ client campaigns.",
            "Improved landing page conversion by 22% through visual redesign.",
          ],
        },
        {
          title: "Junior Graphic Designer",
          company: "Pixel House, Bristol",
          date: "Jul 2018 — Jan 2021",
          bullets: [
            "Created social media graphics, brochures and presentation assets.",
            "Supported creative direction for product launch campaigns.",
          ],
        },
      ],
      education: [
        {
          degree: "BA Graphic Design",
          school: "University of the Arts London",
          date: "2015 — 2018",
        },
      ],
      skills: [
        { name: "Figma", level: 94 },
        { name: "Brand Identity", level: 92 },
        { name: "Adobe Suite", level: 90 },
        { name: "UI Design", level: 86 },
        { name: "Social Media Design", level: 88 },
        { name: "Print Design", level: 82 },
      ],
      languages: ["English — Fluent"],
    },

    student: {
      ...common,
      name: "Adam Khan",
      role: "Computer Science Graduate",
      summary:
        "Motivated graduate with strong project experience in web development, databases and software problem solving.",
      employment: [
        {
          title: "Software Intern",
          company: "TechWorks Ltd, Manchester",
          date: "Jun 2024 — Sep 2024",
          bullets: [
            "Built reusable React components for an internal admin dashboard.",
            "Supported bug fixing, API testing and documentation tasks.",
          ],
        },
      ],
      education: [
        {
          degree: "BSc Computer Science",
          school: "University of Bristol",
          date: "2021 — 2024",
        },
        {
          degree: "A-Levels: Maths, Computer Science, Business",
          school: "Bristol Sixth Form College",
          date: "2019 — 2021",
        },
      ],
      skills: [
        { name: "React", level: 84 },
        { name: "Next.js", level: 82 },
        { name: "MongoDB", level: 78 },
        { name: "Git", level: 80 },
        { name: "APIs", level: 76 },
        { name: "JavaScript", level: 86 },
      ],
      languages: ["English — Fluent", "Urdu — Native"],
    },

    technical: {
      ...common,
      name: "Daniel Brooks",
      role: "Full Stack Developer",
      summary:
        "Full Stack Developer experienced in building scalable web applications using React, Next.js, Node.js and MongoDB.",
      employment: [
        {
          title: "Full Stack Developer",
          company: "TechWorks Ltd, London",
          date: "May 2022 — Present",
          bullets: [
            "Integrated Stripe Checkout and subscription billing flows.",
            "Improved page performance score from 61 to 92.",
          ],
        },
        {
          title: "Frontend Developer",
          company: "AppForge Studio, Remote",
          date: "Jan 2020 — Apr 2022",
          bullets: [
            "Built responsive UI components using React and Tailwind CSS.",
            "Connected frontend screens with REST APIs and authentication.",
          ],
        },
      ],
      education: [
        {
          degree: "BSc Software Engineering",
          school: "University of Sheffield",
          date: "2016 — 2019",
        },
      ],
      skills: [
        { name: "React", level: 94 },
        { name: "Next.js", level: 92 },
        { name: "Node.js", level: 88 },
        { name: "MongoDB", level: 84 },
        { name: "Stripe", level: 82 },
        { name: "Tailwind CSS", level: 91 },
      ],
      languages: ["English — Fluent"],
    },

    academic: {
      ...common,
      name: "Dr. Olivia Harris",
      role: "Lecturer in Business Management",
      summary:
        "Academic professional with experience in teaching, curriculum development, student mentoring and applied business research.",
      employment: [
        {
          title: "Lecturer",
          company: "London Metropolitan College",
          date: "Sep 2020 — Present",
          bullets: [
            "Delivered undergraduate modules in strategy and operations.",
            "Supervised 40+ student research projects.",
          ],
        },
      ],
      education: [
        {
          degree: "PhD Business Management",
          school: "King's College London",
          date: "2016 — 2020",
        },
        {
          degree: "MSc International Business",
          school: "University of Warwick",
          date: "2014 — 2015",
        },
      ],
      skills: [
        { name: "Teaching", level: 94 },
        { name: "Research", level: 92 },
        { name: "Curriculum Design", level: 88 },
        { name: "Supervision", level: 90 },
        { name: "Academic Writing", level: 91 },
        { name: "Strategy", level: 84 },
      ],
      languages: ["English — Native"],
    },

    healthcare: {
      ...common,
      name: "Sarah Ahmed",
      role: "Registered Nurse",
      summary:
        "Compassionate Registered Nurse with experience in patient care, clinical documentation and multidisciplinary team coordination.",
      employment: [
        {
          title: "Registered Nurse",
          company: "NHS Trust, Birmingham",
          date: "Aug 2021 — Present",
          bullets: [
            "Delivered safe patient care across high-pressure ward environments.",
            "Maintained accurate clinical records and care plans.",
          ],
        },
        {
          title: "Healthcare Assistant",
          company: "Greenfield Care, Birmingham",
          date: "Jan 2019 — Jul 2021",
          bullets: [
            "Assisted patients with daily care, mobility and personal support.",
            "Followed safeguarding and infection-control procedures.",
          ],
        },
      ],
      education: [
        {
          degree: "BSc Adult Nursing",
          school: "Birmingham City University",
          date: "2018 — 2021",
        },
      ],
      skills: [
        { name: "Patient Care", level: 95 },
        { name: "Clinical Records", level: 90 },
        { name: "Care Planning", level: 88 },
        { name: "BLS", level: 92 },
        { name: "Medication Support", level: 86 },
        { name: "Team Communication", level: 91 },
      ],
      languages: ["English — Fluent", "Arabic — Conversational"],
    },

    trade: {
      ...common,
      name: "Michael Turner",
      role: "Warehouse Supervisor",
      summary:
        "Dependable warehouse professional with experience in stock control, dispatch coordination, team supervision and health & safety.",
      employment: [
        {
          title: "Warehouse Supervisor",
          company: "North Logistics, Leeds",
          date: "Nov 2020 — Present",
          bullets: [
            "Supervised 12 warehouse staff across daily operations.",
            "Improved dispatch accuracy by 30% through checklist controls.",
          ],
        },
        {
          title: "Warehouse Operative",
          company: "FastMove Distribution, Leeds",
          date: "Mar 2017 — Oct 2020",
          bullets: [
            "Handled goods-in, stock rotation, picking, packing and dispatch.",
            "Maintained safe working standards and stock records.",
          ],
        },
      ],
      education: [
        {
          degree: "Level 2 Certificate in Warehousing",
          school: "Leeds City College",
          date: "2016 — 2017",
        },
      ],
      skills: [
        { name: "Inventory Control", level: 92 },
        { name: "Forklift Operation", level: 90 },
        { name: "Dispatch", level: 88 },
        { name: "Goods-In", level: 86 },
        { name: "Health & Safety", level: 91 },
        { name: "Team Supervision", level: 89 },
      ],
      languages: ["English — Fluent"],
    },

    europass: {
      ...common,
      name: "Maria Laurent",
      role: "International Project Coordinator",
      summary:
        "Multilingual project coordinator experienced in EU-funded programmes, documentation, reporting and international stakeholder communication.",
      employment: [
        {
          title: "Project Coordinator",
          company: "Global Education Network, Brussels",
          date: "Jan 2021 — Present",
          bullets: [
            "Coordinated project partners across six countries.",
            "Prepared progress reports, meeting notes and compliance documents.",
          ],
        },
        {
          title: "Project Assistant",
          company: "European Training Centre, Paris",
          date: "Jun 2018 — Dec 2020",
          bullets: [
            "Supported Erasmus+ documentation, event planning and partner updates.",
            "Maintained project records and financial tracking sheets.",
          ],
        },
      ],
      education: [
        {
          degree: "MA International Relations",
          school: "Sciences Po Paris",
          date: "2016 — 2018",
        },
      ],
      skills: [
        { name: "Project Coordination", level: 92 },
        { name: "Reporting", level: 90 },
        { name: "EU Documentation", level: 88 },
        { name: "Scheduling", level: 86 },
        { name: "Budget Tracking", level: 84 },
        { name: "Partner Management", level: 91 },
      ],
      languages: ["English C2", "French C1", "German B2", "Spanish B1"],
    },
  };

  return data[layout] || data.ats;
}

function CVEducation({ education = [] }) {
  return (
    <>
      {education.map((edu, index) => (
        <div key={index} className="mb-1.5">
          <div className="flex justify-between gap-2">
            <p className="text-[7px] font-black text-black">{edu.degree}</p>
            <p className="whitespace-nowrap text-[6px] font-bold text-black/45">
              {edu.date}
            </p>
          </div>
          <p className="text-[6.5px] text-black/55">{edu.school}</p>
        </div>
      ))}
    </>
  );
}

function CVLanguages({ languages = [], dark = false }) {
  return (
    <div className="space-y-1">
      {languages.slice(0, 4).map((language) => (
        <p
          key={language}
          className={`text-[6.5px] leading-3 ${
            dark ? "text-white/75" : "text-black/60"
          }`}
        >
          {language}
        </p>
      ))}
    </div>
  );
}

function MiniCVPreview({ template, large = false }) {
  const cv = getCVPreviewData(template.layout);
  const accent = template.accent || "#111827";

  const pagePadding = large ? "p-7" : "p-4";
  const pageHeight = large ? "min-h-[520px]" : "min-h-[330px]";

  if (template.layout === "modern" || template.layout === "healthcare") {
    return (
      <div
        className={`overflow-hidden rounded-2xl bg-white text-black shadow-inner ${pageHeight}`}
      >
        <div className={`grid ${pageHeight} grid-cols-[0.34fr_0.66fr]`}>
          <aside
            className={`${large ? "p-5" : "p-3"} text-white`}
            style={{ backgroundColor: accent }}
          >
            <div className="mb-4">
              <CVPhoto accent={accent} size={large ? "lg" : "md"} />
            </div>

            <h3
              className={
                large
                  ? "text-lg font-black leading-tight"
                  : "text-[10px] font-black leading-tight"
              }
            >
              {cv.name}
            </h3>

            <p className="mt-1 text-[7px] font-semibold text-white/75">
              {cv.role}
            </p>

            <div className="mt-5 space-y-2 text-[6.5px] leading-4 text-white/70">
              <p>{cv.email}</p>
              <p>{cv.phone}</p>
              <p>{cv.location}</p>
              <p>{cv.linkedin}</p>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[7px] font-black uppercase tracking-widest text-white">
                Skills
              </p>

              <div className="space-y-2">
                {cv.skills.slice(0, 6).map((skill) => (
                  <CVSkillBar
                    key={skill.name}
                    skill={skill.name}
                    level={skill.level}
                    accent={accent}
                    dark
                  />
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[7px] font-black uppercase tracking-widest text-white">
                Languages
              </p>
              <CVLanguages languages={cv.languages} dark />
            </div>
          </aside>

          <main className={large ? "p-5" : "p-3"}>
            <CVSection title="Professional Summary" accent={accent}>
              <p className="text-[6.8px] leading-[1.45] text-black/65">
                {cv.summary}
              </p>
            </CVSection>

            <CVSection title="Employment History" accent={accent}>
              {cv.employment.map((job, index) => (
                <CVRole key={index} {...job} />
              ))}
            </CVSection>

            <CVSection title="Education" accent={accent}>
              <CVEducation education={cv.education} />
            </CVSection>
          </main>
        </div>
      </div>
    );
  }

  if (template.layout === "executive") {
    return (
      <div
        className={`overflow-hidden rounded-2xl bg-white text-black shadow-inner ${pageHeight}`}
      >
        <div className={`${large ? "p-6" : "p-4"} bg-neutral-950 text-white`}>
          <div className="flex items-center gap-4">
            <CVPhoto accent={accent} size={large ? "lg" : "md"} />

            <div>
              <p className="text-[6px] font-black uppercase tracking-[0.25em] text-white/50">
                Executive CV
              </p>

              <h3
                className={
                  large ? "mt-2 text-2xl font-black" : "mt-1 text-sm font-black"
                }
              >
                {cv.name}
              </h3>

              <p className="text-[7px] font-semibold text-white/70">
                {cv.role}
              </p>

              <p className="mt-2 text-[6.5px] text-white/50">
                {cv.email} · {cv.phone} · {cv.location}
              </p>
            </div>
          </div>

          <div
            className="mt-4 h-[3px] w-16 rounded-full"
            style={{ backgroundColor: accent }}
          />
        </div>

        <div
          className={`grid grid-cols-[0.36fr_0.64fr] gap-4 ${
            large ? "p-6" : "p-4"
          }`}
        >
          <aside>
            <CVSection title="Core Skills" accent={accent}>
              {cv.skills.map((skill) => (
                <CVSkillBar
                  key={skill.name}
                  skill={skill.name}
                  level={skill.level}
                  accent={accent}
                />
              ))}
            </CVSection>

            <CVSection title="Education" accent={accent}>
              <CVEducation education={cv.education} />
            </CVSection>

            <CVSection title="Languages" accent={accent}>
              <CVLanguages languages={cv.languages} />
            </CVSection>
          </aside>

          <main>
            <CVSection title="Professional Profile" accent={accent}>
              <p className="text-[6.8px] leading-[1.45] text-black/65">
                {cv.summary}
              </p>
            </CVSection>

            <CVSection title="Leadership Experience" accent={accent}>
              {cv.employment.map((job, index) => (
                <CVRole key={index} {...job} />
              ))}
            </CVSection>
          </main>
        </div>
      </div>
    );
  }

  if (template.layout === "creative") {
    return (
      <div
        className={`overflow-hidden rounded-2xl bg-white text-black shadow-inner ${pageHeight}`}
      >
        <div className={pagePadding}>
          <div
            className="mb-4 flex items-center gap-3 rounded-2xl p-3"
            style={{ backgroundColor: `${accent}15` }}
          >
            <CVPhoto accent={accent} size={large ? "lg" : "md"} square />

            <div>
              <h3
                className={
                  large ? "text-xl font-black" : "text-xs font-black"
                }
              >
                {cv.name}
              </h3>

              <p className="text-[7px] font-bold" style={{ color: accent }}>
                {cv.role}
              </p>

              <p className="text-[6px] text-black/45">
                {cv.email} · {cv.location}
              </p>
            </div>
          </div>

          <CVSection title="Creative Profile" accent={accent}>
            <p className="text-[6.8px] leading-[1.45] text-black/65">
              {cv.summary}
            </p>
          </CVSection>

          <div className="grid grid-cols-[0.62fr_0.38fr] gap-3">
            <div>
              <CVSection title="Experience" accent={accent}>
                {cv.employment.map((job, index) => (
                  <CVRole key={index} {...job} />
                ))}
              </CVSection>
            </div>

            <div>
              <CVSection title="Skills" accent={accent}>
                {cv.skills.map((skill) => (
                  <CVSkillBar
                    key={skill.name}
                    skill={skill.name}
                    level={skill.level}
                    accent={accent}
                  />
                ))}
              </CVSection>

              <CVSection title="Education" accent={accent}>
                <CVEducation education={cv.education} />
              </CVSection>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template.layout === "europass") {
    return (
      <div
        className={`overflow-hidden rounded-2xl bg-white text-black shadow-inner ${pageHeight}`}
      >
        <div className={pagePadding}>
          <header className="mb-4 flex items-center gap-3 border-b pb-3">
            <CVPhoto accent={accent} size={large ? "lg" : "md"} />

            <div>
              <h3
                className={
                  large ? "text-xl font-black" : "text-xs font-black"
                }
              >
                {cv.name}
              </h3>

              <p className="text-[7px] font-bold" style={{ color: accent }}>
                {cv.role}
              </p>

              <p className="text-[6px] text-black/45">
                European / International CV Format
              </p>
            </div>
          </header>

          <CVSection title="Profile" accent={accent}>
            <p className="text-[6.8px] leading-[1.45] text-black/65">
              {cv.summary}
            </p>
          </CVSection>

          <CVSection title="Employment History" accent={accent}>
            {cv.employment.map((job, index) => (
              <CVRole key={index} {...job} />
            ))}
          </CVSection>

          <div className="grid grid-cols-2 gap-4">
            <CVSection title="Education" accent={accent}>
              <CVEducation education={cv.education} />
            </CVSection>

            <CVSection title="Skills" accent={accent}>
              {cv.skills.slice(0, 5).map((skill) => (
                <CVSkillBar
                  key={skill.name}
                  skill={skill.name}
                  level={skill.level}
                  accent={accent}
                />
              ))}
            </CVSection>
          </div>

          <CVSection title="Languages" accent={accent}>
            <CVLanguages languages={cv.languages} />
          </CVSection>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white text-black shadow-inner ${pageHeight}`}
    >
      <div className={pagePadding}>
        <header
          className="mb-4 border-b pb-3"
          style={{ borderColor: `${accent}70` }}
        >
          <h3
            className={
              large
                ? "text-2xl font-black tracking-tight"
                : "text-sm font-black tracking-tight"
            }
          >
            {cv.name}
          </h3>

          <p className="mt-1 text-[8px] font-bold" style={{ color: accent }}>
            {cv.role}
          </p>

          <p className="mt-1 text-[6.5px] text-black/45">
            {cv.email} · {cv.phone} · {cv.location}
          </p>
        </header>

        <CVSection title="Professional Summary" accent={accent}>
          <p className="text-[6.8px] leading-[1.45] text-black/65">
            {cv.summary}
          </p>
        </CVSection>

        <CVSection title="Employment History" accent={accent}>
          {cv.employment.map((job, index) => (
            <CVRole key={index} {...job} />
          ))}
        </CVSection>

        <div className="grid grid-cols-[0.55fr_0.45fr] gap-4">
          <CVSection title="Education" accent={accent}>
            <CVEducation education={cv.education} />
          </CVSection>

          <CVSection title="Skills" accent={accent}>
            {cv.skills.map((skill) => (
              <CVSkillBar
                key={skill.name}
                skill={skill.name}
                level={skill.level}
                accent={accent}
              />
            ))}
          </CVSection>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-[1.75rem] border p-3 text-left transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        selected
          ? "border-qorliqGold bg-qorliqGold/10 shadow-xl shadow-qorliqGold/10"
          : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >
      <MiniCVPreview template={template} />

      <div className="mt-4 px-1 pb-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-white">{template.name}</h3>
            <p className="mt-1 text-[10px] font-semibold text-white/40">
              {template.industry}
            </p>
          </div>

          <span
            className={`rounded-full px-2 py-1 text-[9px] font-black ${
              selected
                ? "bg-qorliqGold text-black"
                : "bg-white/10 text-white/60 group-hover:bg-white/15"
            }`}
          >
            {template.score}% ATS
          </span>
        </div>

        <p className="mt-3 min-h-[40px] text-[11px] leading-5 text-white/55">
          {template.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[10px] font-bold text-white/35">
            Professional CV layout
          </p>

          <span
            className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${
              selected ? "bg-qorliqGold text-black" : "bg-white/10 text-white/55"
            }`}
          >
            {selected ? "Selected" : "Preview"}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function CVBuilderPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    cvTemplates[0].id
  );
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredTemplates = useMemo(() => {
    if (activeFilter === "all") return cvTemplates;
    return cvTemplates.filter((template) => template.category === activeFilter);
  }, [activeFilter]);

  const activeTemplate =
    cvTemplates.find((template) => template.id === selectedTemplateId) ||
    cvTemplates[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#08080B] text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-12%] top-[-10%] h-[34rem] w-[34rem] rounded-full bg-qorliqGold/10 blur-[140px]" />
        <div className="absolute right-[-12%] top-[25%] h-[38rem] w-[38rem] rounded-full bg-blue-600/10 blur-[160px]" />
        <div className="absolute bottom-[-20%] left-[30%] h-[30rem] w-[30rem] rounded-full bg-emerald-500/5 blur-[140px]" />
      </div>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 pb-14 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-qorliqGold/30 bg-qorliqGold/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-qorliqGold">
            Premium CV Builder
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-[-0.05em] text-white md:text-6xl md:leading-[1.05]">
            Choose a professional CV template built for real hiring standards.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
            Select from 10 industry-focused CV layouts designed for ATS systems,
            recruiters, graduates, executives, technical roles and international
            applications.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href={`/cv-builder/create?template=${activeTemplate.id}`}
              className="rounded-full bg-qorliqGold px-8 py-4 text-center text-xs font-black uppercase tracking-widest text-black shadow-xl shadow-qorliqGold/10 transition duration-300 hover:scale-[1.03] hover:bg-white"
            >
              Use {activeTemplate.name}
            </Link>

            <a
              href="#templates"
              className="rounded-full border border-white/10 bg-white/[0.03] px-8 py-4 text-center text-xs font-black uppercase tracking-widest text-white/80 transition hover:border-white/30 hover:bg-white/[0.06]"
            >
              View All Templates
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-2xl font-black text-qorliqGold">
                {activeTemplate.score}%
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                ATS Score
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-2xl font-black text-blue-400">10</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                Templates
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-2xl font-black text-emerald-400">PDF</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                Export Ready
              </p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-r from-qorliqGold/20 to-blue-500/10 opacity-80 blur-2xl" />

          <div className="relative rounded-[2.2rem] border border-white/10 bg-[#111116] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between px-2">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-qorliqGold">
                  Live CV Preview
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {activeTemplate.name}
                </h2>
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-white/60">
                {activeTemplate.industry}
              </span>
            </div>

            <MiniCVPreview template={activeTemplate} large />

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-black text-white">Best for</p>
              <p className="mt-1 text-sm leading-6 text-white/55">
                {activeTemplate.bestFor}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="templates"
        className="relative z-10 mx-auto max-w-7xl border-t border-white/10 px-6 py-14"
      >
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
              Template Library
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white md:text-5xl">
              Select the right CV design
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">
              Every layout uses professional sample CV content with dates,
              employment history, education, skills progress bars and clean
              international formatting.
            </p>
          </div>

          <Link
            href={`/cv-builder/create?template=${activeTemplate.id}`}
            className="rounded-full bg-white px-6 py-3 text-center text-xs font-black uppercase tracking-widest text-black transition hover:bg-qorliqGold"
          >
            Continue With Selected
          </Link>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-wider transition ${
                activeFilter === filter.id
                  ? "border-qorliqGold bg-qorliqGold text-black"
                  : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={selectedTemplateId === template.id}
              onClick={() => setSelectedTemplateId(template.id)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}