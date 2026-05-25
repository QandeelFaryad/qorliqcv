"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const cvTemplates = [
  {
    id: "executive-gold",
    name: "Executive Gold",
    layout: "executive",
    category: "Premium",
    accent: "#C6A35D",
    score: 92,
    role: "Senior Operations Director",
    bestFor: "Directors, executives, senior managers and leadership roles",
    description:
      "Premium executive layout with a strong leadership profile, achievements and board-level structure.",
  },
  {
    id: "modern-black",
    name: "Modern Black",
    layout: "modern",
    category: "Professional",
    accent: "#111111",
    score: 88,
    role: "Business Development Manager",
    bestFor: "Business, sales, operations and modern corporate roles",
    description:
      "Clean modern CV with a strong sidebar, professional hierarchy and recruiter-friendly structure.",
  },
  {
    id: "clean-ats",
    name: "Clean ATS",
    layout: "ats",
    category: "ATS",
    accent: "#2B6CB0",
    score: 96,
    role: "Operations Manager",
    bestFor: "ATS portals, online applications and corporate hiring systems",
    description:
      "Simple ATS-focused CV format with clean headings, readable spacing and no unnecessary graphics.",
  },
  {
    id: "creative-edge",
    name: "Creative Edge",
    layout: "creative",
    category: "Creative",
    accent: "#7C3AED",
    score: 84,
    role: "Brand Designer",
    bestFor: "Design, marketing, branding and creative roles",
    description:
      "Creative but professional CV layout with a portfolio-style header and balanced content cards.",
  },
  {
    id: "classic-pro",
    name: "Classic Pro",
    layout: "classic",
    category: "Professional",
    accent: "#8A6A35",
    score: 90,
    role: "Office Administrator",
    bestFor: "Admin, office, customer service and traditional professional roles",
    description:
      "Classic professional CV format with formal typography and strong international readability.",
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    layout: "ats",
    category: "Corporate",
    accent: "#1D4ED8",
    score: 94,
    role: "Corporate Services Manager",
    bestFor: "Corporate, finance, administration and management roles",
    description:
      "Corporate blue CV with a clean ATS-ready structure and strong professional presentation.",
  },
  {
    id: "tech-minimal",
    name: "Tech Minimal",
    layout: "modern",
    category: "Tech",
    accent: "#0F766E",
    score: 91,
    role: "Full Stack Developer",
    bestFor: "Software, IT, data, cybersecurity and technical roles",
    description:
      "Minimal technical CV focused on skills, stack, projects and measurable technical outcomes.",
  },
  {
    id: "luxury-ivory",
    name: "Luxury Ivory",
    layout: "executive",
    category: "Premium",
    accent: "#B0894F",
    score: 89,
    role: "Client Relationship Manager",
    bestFor: "Luxury retail, premium brands, client-facing and management roles",
    description:
      "Elegant ivory-style executive CV with premium spacing, luxury tone and polished structure.",
  },
  {
    id: "graduate-fresh",
    name: "Graduate Fresh",
    layout: "creative",
    category: "Graduate",
    accent: "#16A34A",
    score: 86,
    role: "Graduate Trainee",
    bestFor: "Students, fresh graduates, internships and first job applications",
    description:
      "Fresh graduate CV focused on education, projects, skills and early career potential.",
  },
  {
    id: "formal-uk",
    name: "Formal UK",
    layout: "classic",
    category: "ATS",
    accent: "#6B7280",
    score: 93,
    role: "Public Sector Administrator",
    bestFor: "UK jobs, public sector, council, admin and formal applications",
    description:
      "Formal UK CV layout with compact sections, clean formatting and professional presentation.",
  },
  {
    id: "senior-director",
    name: "Senior Director",
    layout: "executive",
    category: "Executive",
    accent: "#5A3E1B",
    score: 95,
    role: "Senior Director",
    bestFor: "Senior directors, heads of department and executive leadership roles",
    description:
      "Board-level CV layout for senior professionals with leadership impact and strategic achievements.",
  },
  {
    id: "admin-professional",
    name: "Admin Professional",
    layout: "classic",
    category: "Admin",
    accent: "#334155",
    score: 90,
    role: "Executive Assistant",
    bestFor: "Administration, EA, office support, reception and coordination roles",
    description:
      "Professional admin CV with strong organisation, document control and communication structure.",
  },
  {
    id: "healthcare-clinical",
    name: "Healthcare Clinical",
    layout: "ats",
    category: "Healthcare",
    accent: "#0E7490",
    score: 92,
    role: "Registered Nurse",
    bestFor: "Nursing, healthcare, care support and clinical applications",
    description:
      "Clinical CV format focused on patient care, compliance, certifications and healthcare experience.",
  },
  {
    id: "sales-leader",
    name: "Sales Leader",
    layout: "modern",
    category: "Sales",
    accent: "#B45309",
    score: 89,
    role: "Sales Team Leader",
    bestFor: "Sales, account management, business development and revenue roles",
    description:
      "Sales-focused CV layout showing targets, pipeline, client retention and measurable performance.",
  },
  {
    id: "finance-analyst",
    name: "Finance Analyst",
    layout: "ats",
    category: "Finance",
    accent: "#1E3A8A",
    score: 94,
    role: "Finance Analyst",
    bestFor: "Finance, accounting, banking, reporting and analyst roles",
    description:
      "Structured finance CV with reporting, reconciliations, forecasting and analytical achievements.",
  },
];

const filters = [
  "All",
  "Premium",
  "Professional",
  "ATS",
  "Creative",
  "Corporate",
  "Tech",
  "Graduate",
  "Executive",
  "Admin",
  "Healthcare",
  "Sales",
  "Finance",
];

const demoProfiles = {
  executive: {
    name: "James Carter",
    title: "Senior Operations Director",
    email: "james.carter@email.com",
    phone: "+44 7700 123456",
    location: "London, United Kingdom",
    profile:
      "Strategic senior leader with 12+ years of experience improving operations, service delivery and commercial performance across multi-site business environments.",
    experience:
      "Senior Operations Director | Meridian Group | 2020–Present\n• Led operational transformation across 4 regional teams and improved delivery performance by 32%.\n• Delivered £1.2M annual cost saving through supplier restructuring and workflow redesign.\n\nHead of Operations | Northpoint Services | 2015–2020\n• Managed planning, reporting, budgets and senior stakeholder communication.\n• Improved response time by 31% through process automation and clearer KPI tracking.",
    skills:
      "Strategic Leadership · Operations Management · Budget Control · Stakeholder Management · Change Management · KPI Reporting",
    education:
      "MBA Executive Management | London Business School\nBA Business Management | University of Manchester",
  },
  modern: {
    name: "Emma Williams",
    title: "Business Development Manager",
    email: "emma.williams@email.com",
    phone: "+44 7700 123456",
    location: "Manchester, United Kingdom",
    profile:
      "Commercial professional experienced in B2B sales, CRM management, client development and revenue growth within competitive business markets.",
    experience:
      "Business Development Manager | CloudBridge Ltd | 2021–Present\n• Increased qualified sales pipeline by 42% through targeted outreach and CRM segmentation.\n• Improved client retention by 28% by introducing structured account review meetings.\n\nSales Executive | Northpoint Solutions | 2018–2021\n• Generated new business through email, phone and LinkedIn outreach.\n• Prepared weekly sales reports and pipeline updates for senior management.",
    skills:
      "CRM Management · Lead Generation · Sales Strategy · Negotiation · Forecasting · Client Retention",
    education:
      "BSc Marketing & Business | University of Leeds\nHubSpot Sales Software Certification",
  },
  ats: {
    name: "Amelia Carter",
    title: "Operations Manager",
    email: "amelia.carter@email.com",
    phone: "+44 7700 123456",
    location: "Birmingham, United Kingdom",
    profile:
      "Operations Manager with 8+ years of experience improving workflow efficiency, reporting accuracy and service delivery in fast-paced professional environments.",
    experience:
      "Operations Manager | Brightline Services | 2021–Present\n• Improved monthly reporting accuracy by 38% through workflow automation and process checks.\n• Managed supplier performance, internal schedules and executive reporting packs.\n\nSenior Operations Coordinator | Apex Group | 2017–2021\n• Coordinated documentation, vendor communication and operational records.\n• Supported budget tracking, compliance logs and departmental reporting.",
    skills:
      "Operations Management · Reporting · Microsoft Excel · KPI Tracking · Vendor Management · Team Coordination",
    education:
      "BA Business Management | University of Manchester\nLean Process Improvement Certificate",
  },
  creative: {
    name: "Sofia Miller",
    title: "Brand Designer",
    email: "sofia.miller@email.com",
    phone: "+44 7700 123456",
    location: "London, United Kingdom",
    profile:
      "Creative designer with experience in brand identity, digital campaigns, visual systems and marketing assets for modern consumer brands.",
    experience:
      "Brand Designer | Studio Nova | 2021–Present\n• Designed brand systems for 20+ client campaigns across digital and print channels.\n• Improved landing page conversion by 22% through clearer creative direction and visual hierarchy.\n\nJunior Graphic Designer | Pixel House | 2018–2021\n• Created social media graphics, brochures, campaign visuals and presentation assets.\n• Supported product launch campaigns from concept to final delivery.",
    skills:
      "Brand Identity · Figma · Adobe Creative Suite · UI Design · Social Media Design · Print Layout",
    education:
      "BA Graphic Design | University of the Arts London\nProfessional Diploma in Digital Design",
  },
  classic: {
    name: "Aisha Khan",
    title: "Executive Assistant",
    email: "aisha.khan@email.com",
    phone: "+44 7700 123456",
    location: "Leeds, United Kingdom",
    profile:
      "Highly organised administrative professional with strong experience supporting senior leadership, documentation, scheduling and office operations.",
    experience:
      "Executive Assistant | Meridian Holdings | 2019–Present\n• Managed executive calendars, travel bookings, meeting packs and board documentation.\n• Prepared reports, internal communication and confidential correspondence.\n\nOffice Administrator | Westfield Services | 2016–2019\n• Handled reception, data entry, supplier invoices and document control.\n• Maintained accurate records and improved filing efficiency across departments.",
    skills:
      "Calendar Management · Administration · MS Office · Reporting · Document Control · Communication",
    education:
      "Diploma in Business Administration | London College\nAdvanced Microsoft Office Certification",
  },
};

function getDemo(template) {
  if (template.name === "Tech Minimal") {
    return {
      ...demoProfiles.modern,
      name: "Daniel Brooks",
      title: "Full Stack Developer",
      profile:
        "Full stack developer experienced in React, Next.js, Node.js, MongoDB and scalable web applications with strong attention to performance and user experience.",
      experience:
        "Full Stack Developer | TechWorks Ltd | 2022–Present\n• Integrated Stripe checkout, user authentication and subscription billing flows.\n• Improved page performance score from 61 to 92 through code and asset optimisation.\n\nFrontend Developer | AppForge Studio | 2020–2022\n• Built responsive UI components using React and Tailwind CSS.\n• Connected frontend screens with REST APIs and authentication workflows.",
      skills:
        "React · Next.js · JavaScript · Node.js · MongoDB · Tailwind CSS · Stripe · REST APIs",
      education:
        "BSc Software Engineering | University of Sheffield\nAWS Cloud Practitioner Fundamentals",
    };
  }

  if (template.name === "Healthcare Clinical") {
    return {
      ...demoProfiles.ats,
      name: "Sarah Ahmed",
      title: "Registered Nurse",
      profile:
        "Compassionate Registered Nurse with experience in patient care, clinical documentation, care planning and multidisciplinary team coordination.",
      experience:
        "Registered Nurse | NHS Trust | 2021–Present\n• Delivered safe patient care across high-pressure ward environments.\n• Maintained accurate clinical records, care plans and medication support notes.\n\nHealthcare Assistant | Greenfield Care | 2019–2021\n• Assisted patients with daily care, mobility and personal support.\n• Followed safeguarding and infection-control procedures.",
      skills:
        "Patient Care · Clinical Records · Care Planning · BLS · Medication Support · Team Communication",
      education:
        "BSc Adult Nursing | Birmingham City University\nBasic Life Support Certification",
    };
  }

  if (template.name === "Finance Analyst") {
    return {
      ...demoProfiles.ats,
      name: "Noah Edwards",
      title: "Finance Analyst",
      profile:
        "Finance analyst with experience in month-end reporting, reconciliations, forecasting and Excel-based performance dashboards.",
      experience:
        "Finance Analyst | Sterling Accounts Group | 2022–Present\n• Prepared monthly variance analysis and board reporting packs.\n• Reduced reconciliation errors by 29% through improved Excel controls.\n\nAccounts Assistant | LedgerWorks Ltd | 2019–2022\n• Processed invoices, bank reconciliations and expense reports.\n• Supported VAT records and supplier payment schedules.",
      skills:
        "Financial Reporting · Excel · Forecasting · Reconciliation · QuickBooks · Variance Analysis",
      education:
        "BSc Accounting & Finance | University of Reading\nAAT Level 3 Diploma",
    };
  }

  if (template.name === "Sales Leader") {
    return {
      ...demoProfiles.modern,
      name: "Hannah Walker",
      title: "Sales Team Leader",
      profile:
        "Target-driven sales leader experienced in pipeline management, team coaching, account growth and customer retention.",
      experience:
        "Sales Team Leader | MarketPoint UK | 2021–Present\n• Led an 8-person sales team and exceeded quarterly target by 24%.\n• Improved conversion rate by 18% through call coaching and CRM review.\n\nAccount Executive | LeadBridge Ltd | 2018–2021\n• Managed SME accounts and renewed £480k annual revenue.\n• Prepared proposals, demos and client follow-up campaigns.",
      skills:
        "Sales Leadership · Pipeline Management · Account Growth · CRM · Negotiation · Coaching",
      education:
        "BA Business & Marketing | Manchester Metropolitan University\nSales Leadership Certificate",
    };
  }

  if (template.name === "Graduate Fresh") {
    return {
      ...demoProfiles.creative,
      name: "Adam Khan",
      title: "Computer Science Graduate",
      profile:
        "Motivated graduate with strong project experience in web development, databases and software problem solving.",
      experience:
        "Software Intern | TechWorks Ltd | 2024\n• Built reusable React components for an internal admin dashboard.\n• Supported bug fixing, API testing and documentation tasks.\n\nUniversity Project | CV Builder Platform | 2024\n• Created responsive pages using React, Next.js and Tailwind CSS.\n• Connected form data with reusable template preview components.",
      skills:
        "React · Next.js · JavaScript · MongoDB · Git · APIs · Tailwind CSS",
      education:
        "BSc Computer Science | University of Bristol\nA-Levels: Maths, Computer Science, Business",
    };
  }

  if (
    template.layout === "executive" ||
    template.name === "Senior Director" ||
    template.name === "Luxury Ivory" ||
    template.name === "Executive Gold"
  ) {
    return demoProfiles.executive;
  }

  if (template.layout === "modern") return demoProfiles.modern;
  if (template.layout === "creative") return demoProfiles.creative;
  if (template.layout === "classic") return demoProfiles.classic;

  return demoProfiles.ats;
}

function TinySection({ title, value, accent }) {
  return (
    <section>
      <p
        className="border-b border-black/10 pb-1 text-[7px] font-black uppercase tracking-widest"
        style={{ color: accent }}
      >
        {title}
      </p>
      <p className="mt-1 whitespace-pre-line text-[6.8px] leading-[1.35] text-black/65">
        {value}
      </p>
    </section>
  );
}

function CardSection({ title, value, accent }) {
  return (
    <section className="rounded-lg bg-[#F8F4EA] p-2">
      <p
        className="border-b border-black/10 pb-1 text-[6.5px] font-black uppercase tracking-widest"
        style={{ color: accent }}
      >
        {title}
      </p>
      <p className="mt-1 whitespace-pre-line text-[6.5px] leading-[1.32] text-black/60">
        {value}
      </p>
    </section>
  );
}

function ClassicSection({ title, value, accent }) {
  return (
    <section>
      <p
        className="border-b pb-1 font-serif text-[8px] font-bold"
        style={{ borderColor: `${accent}66`, color: accent }}
      >
        {title}
      </p>
      <p className="mt-1 whitespace-pre-line text-[6.8px] leading-[1.35] text-black/65">
        {value}
      </p>
    </section>
  );
}

function TemplatePreview({ template, selected, onClick }) {
  const demo = getDemo(template);
  const accent = template.accent;

  const isModern = template.layout === "modern";
  const isCreative = template.layout === "creative";
  const isClassic = template.layout === "classic";
  const isExecutive = template.layout === "executive";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-[1.4rem] border p-3 text-left transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        selected
          ? "border-qorliqGold bg-qorliqGold/15 shadow-xl shadow-qorliqGold/10"
          : "border-white/10 bg-white/[0.045] hover:border-white/25 hover:bg-white/[0.07]"
      }`}
    >
      <div
        className={`min-h-[245px] overflow-hidden rounded-xl bg-white text-black shadow-xl ${
          isModern ? "grid grid-cols-[0.34fr_0.66fr]" : ""
        }`}
      >
        {isModern ? (
          <>
            <aside className="p-3 text-white" style={{ backgroundColor: accent }}>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-[10px] font-black text-black">
                CV
              </div>
              <p className="text-[10px] font-black leading-tight">
                {demo.name}
              </p>
              <p className="mt-1 text-[7px] leading-3 text-white/75">
                {demo.title}
              </p>
              <p className="mt-3 text-[6.5px] leading-3 text-white/65">
                {demo.email}
                <br />
                {demo.phone}
                <br />
                {demo.location}
              </p>
              <p className="mt-3 border-t border-white/20 pt-2 text-[6.5px] leading-3 text-white/75">
                {demo.skills}
              </p>
            </aside>

            <main className="space-y-2 p-3">
              <TinySection title="Profile" value={demo.profile} accent={accent} />
              <TinySection
                title="Experience"
                value={demo.experience}
                accent={accent}
              />
              <TinySection
                title="Education"
                value={demo.education}
                accent={accent}
              />
            </main>
          </>
        ) : isCreative ? (
          <div className="p-3">
            <div
              className="grid grid-cols-[0.28fr_0.72fr] gap-2 rounded-lg p-2"
              style={{ backgroundColor: `${accent}18` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[10px] font-black shadow">
                CV
              </div>
              <div>
                <p
                  className="text-[6.5px] font-black uppercase tracking-widest"
                  style={{ color: accent }}
                >
                  Creative CV
                </p>
                <h4 className="mt-1 text-[12px] font-black leading-tight">
                  {demo.name}
                </h4>
                <p className="text-[7px] font-bold" style={{ color: accent }}>
                  {demo.title}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <CardSection title="Profile" value={demo.profile} accent={accent} />
              <CardSection
                title="Experience"
                value={demo.experience}
                accent={accent}
              />
              <CardSection title="Skills" value={demo.skills} accent={accent} />
              <CardSection
                title="Education"
                value={demo.education}
                accent={accent}
              />
            </div>
          </div>
        ) : isClassic ? (
          <div className="p-4 text-center">
            <h4 className="font-serif text-[15px] font-bold leading-tight">
              {demo.name}
            </h4>
            <p
              className="mt-1 text-[7px] font-bold uppercase tracking-widest"
              style={{ color: accent }}
            >
              {demo.title}
            </p>
            <p className="mt-1 text-[6.5px] text-black/45">
              {demo.email} · {demo.phone}
            </p>

            <div className="mt-3 space-y-2 text-left">
              <ClassicSection
                title="Profile"
                value={demo.profile}
                accent={accent}
              />
              <ClassicSection
                title="Experience"
                value={demo.experience}
                accent={accent}
              />
              <ClassicSection title="Skills" value={demo.skills} accent={accent} />
              <ClassicSection
                title="Education"
                value={demo.education}
                accent={accent}
              />
            </div>
          </div>
        ) : isExecutive ? (
          <div className="p-4">
            <div
              className="rounded-lg p-3 text-white"
              style={{ backgroundColor: "#111111" }}
            >
              <p
                className="text-[6.5px] font-black uppercase tracking-[0.22em]"
                style={{ color: accent }}
              >
                Executive Profile
              </p>
              <h4 className="mt-1 text-[15px] font-black leading-tight">
                {demo.name}
              </h4>
              <p className="mt-1 text-[7px] font-bold text-white/75">
                {demo.title}
              </p>
              <p className="mt-2 text-[6.5px] text-white/50">
                {demo.email} · {demo.phone}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-[0.42fr_0.58fr] gap-2">
              <div className="space-y-2">
                <TinySection title="Skills" value={demo.skills} accent={accent} />
                <TinySection
                  title="Education"
                  value={demo.education}
                  accent={accent}
                />
              </div>
              <div className="space-y-2">
                <TinySection
                  title="Profile"
                  value={demo.profile}
                  accent={accent}
                />
                <TinySection
                  title="Leadership"
                  value={demo.experience}
                  accent={accent}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div
              className="border-b-2 pb-2 text-center"
              style={{ borderColor: accent }}
            >
              <h4 className="text-[15px] font-black leading-tight">
                {demo.name}
              </h4>
              <p
                className="mt-1 text-[7px] font-bold uppercase tracking-widest"
                style={{ color: accent }}
              >
                {demo.title}
              </p>
              <p className="mt-1 text-[6.5px] text-black/45">
                {demo.email} · {demo.phone}
              </p>
            </div>

            <div className="mt-3 space-y-2">
              <TinySection title="Profile" value={demo.profile} accent={accent} />
              <TinySection
                title="Experience"
                value={demo.experience}
                accent={accent}
              />
              <TinySection title="Skills" value={demo.skills} accent={accent} />
              <TinySection
                title="Education"
                value={demo.education}
                accent={accent}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-white">{template.name}</p>
          <p className="mt-1 text-xs leading-5 text-white/45">
            International CV layout
          </p>
        </div>

        <span className="rounded-full bg-qorliqGold px-2.5 py-1 text-[10px] font-black text-black">
          ATS {template.score}%+
        </span>
      </div>

      <p className="mt-2 min-h-[40px] text-[11px] leading-5 text-white/55">
        {template.description}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-qorliqGold">
          {template.category}
        </p>
        <span
          className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${
            selected ? "bg-qorliqGold text-black" : "bg-white/10 text-white/60"
          }`}
        >
          {selected ? "Selected" : "Preview"}
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/65 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#17181D] p-5 text-white shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
              Selected Template
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
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
          <div className="rounded-[1.5rem] border border-qorliqGold/30 bg-qorliqGold/10 p-5">
            <h3 className="text-xl font-black text-white">
              Yes, I have old CV
            </h3>

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

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-xl font-black text-white">No, start empty</h3>

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
  const [activeFilter, setActiveFilter] = useState("All");
  const [showOldCVPopup, setShowOldCVPopup] = useState(false);

  const filteredTemplates = useMemo(() => {
    if (activeFilter === "All") return cvTemplates;
    return cvTemplates.filter((template) => template.category === activeFilter);
  }, [activeFilter]);

  const activeTemplate =
    cvTemplates.find((template) => template.id === selectedTemplateId) ||
    cvTemplates[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#111217] pb-24 text-white md:pb-0">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-12%] top-[-10%] h-[34rem] w-[34rem] rounded-full bg-qorliqGold/[0.07] blur-[140px]" />
        <div className="absolute right-[-12%] top-[25%] h-[38rem] w-[38rem] rounded-full bg-blue-600/[0.06] blur-[160px]" />
        <div className="absolute bottom-[-20%] left-[30%] h-[30rem] w-[30rem] rounded-full bg-emerald-500/[0.035] blur-[140px]" />
      </div>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 sm:pb-14 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-qorliqGold/30 bg-qorliqGold/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-qorliqGold">
            Premium CV Builder
          </div>

          <h1 className="mt-6 max-w-3xl text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl md:text-6xl md:leading-[1.05]">
            Choose a professional CV template built for real hiring standards.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
            Select from 15 international CV templates designed for ATS systems,
            recruiters, graduates, executives, technical roles, healthcare,
            sales and finance applications.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowOldCVPopup(true)}
              className="rounded-full bg-qorliqGold px-8 py-4 text-center text-xs font-black uppercase tracking-widest text-black shadow-xl shadow-qorliqGold/10 transition duration-300 hover:scale-[1.03] hover:bg-white"
            >
              Use {activeTemplate.name}
            </button>

            <a
              href="#templates"
              className="rounded-full border border-white/10 bg-white/[0.03] px-8 py-4 text-center text-xs font-black uppercase tracking-widest text-white/80 transition hover:border-white/30 hover:bg-white/[0.06]"
            >
              View All Templates
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-black text-qorliqGold">
                {activeTemplate.score}%
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/45">
                ATS Score
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-black text-blue-400">15</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/45">
                Templates
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-black text-emerald-400">DOCX</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/45">
                Export Ready
              </p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-r from-qorliqGold/20 to-blue-500/10 opacity-80 blur-2xl" />

          <div className="relative rounded-[2.2rem] border border-white/10 bg-[#191A20] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4 px-2">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-qorliqGold">
                  Live CV Preview
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {activeTemplate.name}
                </h2>
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-white/60">
                {activeTemplate.category}
              </span>
            </div>

            <TemplatePreview
              template={activeTemplate}
              selected
              onClick={() => {}}
            />

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
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
        className="relative z-10 mx-auto max-w-7xl border-t border-white/10 px-4 py-12 sm:px-6 sm:py-14"
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
              Every template uses international CV writing style with profile,
              experience, skills and education sections formatted like a real
              recruiter-ready CV.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowOldCVPopup(true)}
            className="hidden rounded-full bg-white px-6 py-3 text-center text-xs font-black uppercase tracking-widest text-black transition hover:bg-qorliqGold md:inline-flex"
          >
            Continue With Selected
          </button>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-wider transition ${
                activeFilter === filter
                  ? "border-qorliqGold bg-qorliqGold text-black"
                  : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((template) => (
            <TemplatePreview
              key={template.id}
              template={template}
              selected={selectedTemplateId === template.id}
              onClick={() => setSelectedTemplateId(template.id)}
            />
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-white/10 bg-[#191A20]/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setShowOldCVPopup(true)}
          className="w-full rounded-full bg-qorliqGold px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-black shadow-xl shadow-qorliqGold/[0.15] transition active:scale-[0.98]"
        >
          Use This Template
        </button>

        <p className="mt-1 text-center text-[10px] font-semibold text-white/45">
          Selected: {activeTemplate.name}
        </p>
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