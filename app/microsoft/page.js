"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  BrainCircuit,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  Cloud,
  CloudCog,
  DatabaseBackup,
  GraduationCap,
  Headphones,
  HeartPulse,
  LifeBuoy,
  LockKeyhole,
  Rocket,
  ServerCog,
  ShieldCheck,
  Store,
  Truck,
  UsersRound,
  Zap,
} from "lucide-react";

const COUNTRIES = [
  ["AF", "Afghanistan", "93"],
  ["AL", "Albania", "355"],
  ["DZ", "Algeria", "213"],
  ["AD", "Andorra", "376"],
  ["AO", "Angola", "244"],
  ["AR", "Argentina", "54"],
  ["AM", "Armenia", "374"],
  ["AU", "Australia", "61"],
  ["AT", "Austria", "43"],
  ["AZ", "Azerbaijan", "994"],
  ["BH", "Bahrain", "973"],
  ["BD", "Bangladesh", "880"],
  ["BE", "Belgium", "32"],
  ["BR", "Brazil", "55"],
  ["BN", "Brunei", "673"],
  ["BG", "Bulgaria", "359"],
  ["CA", "Canada", "1"],
  ["CN", "China", "86"],
  ["CY", "Cyprus", "357"],
  ["CZ", "Czech Republic", "420"],
  ["DK", "Denmark", "45"],
  ["EG", "Egypt", "20"],
  ["FI", "Finland", "358"],
  ["FR", "France", "33"],
  ["DE", "Germany", "49"],
  ["GH", "Ghana", "233"],
  ["GR", "Greece", "30"],
  ["HK", "Hong Kong", "852"],
  ["HU", "Hungary", "36"],
  ["IN", "India", "91"],
  ["ID", "Indonesia", "62"],
  ["IE", "Ireland", "353"],
  ["IT", "Italy", "39"],
  ["JP", "Japan", "81"],
  ["JO", "Jordan", "962"],
  ["KE", "Kenya", "254"],
  ["KW", "Kuwait", "965"],
  ["MY", "Malaysia", "60"],
  ["MX", "Mexico", "52"],
  ["NL", "Netherlands", "31"],
  ["NZ", "New Zealand", "64"],
  ["NG", "Nigeria", "234"],
  ["NO", "Norway", "47"],
  ["OM", "Oman", "968"],
  ["PK", "Pakistan", "92"],
  ["PH", "Philippines", "63"],
  ["PL", "Poland", "48"],
  ["PT", "Portugal", "351"],
  ["QA", "Qatar", "974"],
  ["RO", "Romania", "40"],
  ["SA", "Saudi Arabia", "966"],
  ["SG", "Singapore", "65"],
  ["ZA", "South Africa", "27"],
  ["KR", "South Korea", "82"],
  ["ES", "Spain", "34"],
  ["LK", "Sri Lanka", "94"],
  ["SE", "Sweden", "46"],
  ["CH", "Switzerland", "41"],
  ["TH", "Thailand", "66"],
  ["TR", "Turkey", "90"],
  ["AE", "United Arab Emirates", "971"],
  ["GB", "United Kingdom", "44"],
  ["US", "United States", "1"],
  ["VN", "Vietnam", "84"],
];

const heroMessages = [
  "Microsoft cloud, security & AI.",
  "Microsoft 365, Azure & Copilot.",
  "Secure productivity, backup & resilience.",
  "Modern workplace, training & support.",
];

const services = [
  {
    icon: CloudCog,
    title: "Microsoft CSP Licensing",
    text: "Flexible Microsoft licensing support for Microsoft 365, Azure, Dynamics 365, Windows, Power Platform, and business cloud services.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Microsoft 365 Deployment",
    text: "Tenant setup, domain connection, Outlook, Teams, SharePoint, OneDrive, user permissions, policies, and onboarding.",
  },
  {
    icon: ServerCog,
    title: "Azure Cloud Services",
    text: "Azure setup, hosting, migration, compute, storage, backup, networking, monitoring, cost visibility, and cloud optimization.",
  },
  {
    icon: ShieldCheck,
    title: "Microsoft Security",
    text: "Microsoft Defender, Entra ID, conditional access, MFA, endpoint security, email protection, compliance, and security posture review.",
  },
  {
    icon: DatabaseBackup,
    title: "Backup & Disaster Recovery",
    text: "Microsoft 365 backup planning for Exchange, SharePoint, OneDrive, Teams files, Azure workloads, retention, and recovery workflows.",
  },
  {
    icon: GraduationCap,
    title: "Microsoft Courses",
    text: "Practical Microsoft learning paths for end users, admins, Azure teams, security teams, and Copilot-ready organizations.",
  },
  {
    icon: Bot,
    title: "Copilot Readiness",
    text: "Licensing guidance, data readiness, permission review, security preparation, adoption planning, and productivity use cases.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Dynamics 365 & Power Platform",
    text: "CRM, sales process, customer service, finance workflows, Power Apps, Power Automate, reporting, and automation.",
  },
  {
    icon: LifeBuoy,
    title: "Managed Support",
    text: "Ongoing support for users, licenses, renewals, changes, cloud health, security improvements, and business continuity.",
  },
];

const serviceTabs = [
  ["Cloud & Licensing", "Microsoft CSP, Microsoft 365, Azure and business applications."],
  ["Secure Cloud", "Managed protection for identities, devices, email and data."],
  ["Backup & Recovery", "Continuity for Microsoft 365, files, mailboxes and cloud workloads."],
  ["Training & Enablement", "Courses for admins, users, security teams and managers."],
];

const chooseUs = [
  ["01", "Authorized Reseller Approach", "We support customers with genuine Microsoft solutions, proper licensing guidance, and a structured reseller workflow for business environments."],
  ["02", "Security-First Delivery", "Every Microsoft setup is reviewed with identity protection, MFA, access control, email security, endpoint protection, and backup planning in mind."],
  ["03", "Complete Service Coverage", "From Microsoft 365 and Azure to backup, cybersecurity, Copilot readiness, courses, migration, and managed support — everything is connected."],
  ["04", "Business-Focused Advice", "We recommend plans based on team size, budget, growth, security level, and operational need — not unnecessary licenses."],
  ["05", "Training & Enablement", "We help staff and admins use Microsoft tools properly through practical training, security awareness, and adoption support."],
  ["06", "Long-Term Support", "We stay involved after setup with renewals, changes, support, cloud health checks, security improvements, and customer success guidance."],
];

const courses = [
  ["For Staff", "Microsoft 365 User Adoption", "Outlook, Teams, OneDrive, SharePoint, file sharing, meeting discipline, collaboration, and productivity best practices."],
  ["For IT Admins", "Microsoft 365 Administration", "User management, licensing, groups, roles, domains, policies, Teams admin, SharePoint admin, and secure configuration."],
  ["For Cloud Teams", "Azure Fundamentals", "Azure basics, subscriptions, resources, storage, compute, networking, backup, cost control, and migration overview."],
  ["For Security Teams", "Security & Compliance", "MFA, Defender, Entra ID, conditional access, phishing awareness, endpoint protection, compliance, and reporting."],
  ["For Leaders", "Copilot Readiness Workshop", "Data readiness, permissions, use cases, productivity workflows, governance, security review, and adoption roadmap."],
  ["For Businesses", "Backup & Recovery Awareness", "Microsoft 365 backup gaps, retention, restore process, business continuity, ownership, and recovery planning."],
];

const microsoftMatters = [
  [LockKeyhole, "Security", "Protect identities, devices, data, files, and communication."],
  [Zap, "Productivity", "Use Outlook, Teams, Office apps, SharePoint and OneDrive effectively."],
  [Cloud, "Cloud Scale", "Azure enables hosting, backup, migration, modernization and growth."],
  [BrainCircuit, "AI Readiness", "Prepare data, security and permissions before adopting Microsoft Copilot."],
];

const industries = [
  [Building2, "Corporate Offices"],
  [Store, "Retail & E-commerce"],
  [GraduationCap, "Education"],
  [HeartPulse, "Healthcare"],
  [Truck, "Logistics"],
  [Briefcase, "Professional Services"],
  [Rocket, "Startups"],
  [UsersRound, "Enterprise Teams"],
];

const processSteps = [
  ["01", "Discovery", "Review users, cloud needs, email, devices, security, backup and growth plan."],
  ["02", "Solution Design", "Map the right Microsoft plans, security controls, backup approach and training path."],
  ["03", "Deployment", "Configure tenant, users, Teams, SharePoint, Azure, Defender, access and policies."],
  ["04", "Enablement", "Deliver staff training, admin guidance, security awareness and Copilot readiness."],
];

const customerCards = [
  ["Small Businesses", "Microsoft 365 setup, email migration, backup, security, and support."],
  ["Growing Companies", "Azure, Teams, SharePoint, access control, cloud storage, and user management."],
  ["Enterprise Teams", "Advanced security, compliance, governance, Copilot readiness, and admin enablement."],
  ["Reseller Clients", "Licensing, renewals, service packaging, migration, and long-term managed support."],
];

const logos = [
  ["/partner/microsoft.png", "Microsoft"],
  ["/partner/infinigate.png", "Infinigate"],
  ["/partner/azure.png", "Azure"],
  ["/partner/microsoft-365.png", "Microsoft 365"],
  ["/partner/microsoft-defender.png", "Microsoft Defender"],
];

function flagEmoji(code) {
  if (!code || code.length !== 2) return "🌐";
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
}

function getBrowserCountryCode() {
  if (typeof navigator === "undefined") return "";
  const parts = (navigator.language || "").split("-");
  return parts.length > 1 ? parts.pop() : "";
}

const pageClass =
  "relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_4%,rgba(245,185,56,0.16),transparent_28%),radial-gradient(circle_at_88%_6%,rgba(0,120,212,0.22),transparent_30%),radial-gradient(circle_at_50%_110%,rgba(50,213,131,0.10),transparent_30%),linear-gradient(180deg,#02040a_0%,#071221_43%,#05070b_100%)] text-white";

const containerClass = "mx-auto w-[min(1200px,calc(100%-32px))] sm:w-[min(1200px,calc(100%-40px))]";
const sectionClass = `${containerClass} py-14 sm:py-18 lg:py-22 scroll-mt-28`;
const cardClass = "rounded-[26px] border border-white/10 bg-white/[0.055] shadow-[0_20px_56px_rgba(0,0,0,0.22)] backdrop-blur-xl";
const iconBoxClass = "grid h-14 w-14 place-items-center rounded-2xl border border-[#f5b938]/25 bg-[#f5b938]/15 text-[#f5b938]";
const buttonPrimary = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f5b938] to-[#ffd977] px-5 py-3 text-sm font-black text-black shadow-[0_18px_42px_rgba(245,185,56,0.22)] transition hover:-translate-y-0.5";
const buttonGhost = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.055] px-5 py-3 text-sm font-black text-white transition hover:bg-white/10";

export default function MicrosoftPartnerPage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroFading, setIsHeroFading] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    phone: "",
    email: "",
    city: "",
    employees: "",
    service: "",
    description: "",
  });

  const contactRef = useRef(null);
  const countryWrapRef = useRef(null);

  const sortedCountries = useMemo(
    () => [...COUNTRIES].sort((a, b) => a[1].localeCompare(b[1])),
    []
  );

  const filteredCountries = useMemo(() => {
    const query = countryQuery.toLowerCase().trim().replace("+", "");
    if (!query || selectedCountry) return sortedCountries.slice(0, 80);

    return sortedCountries
      .filter(([iso, name, dial]) => {
        return (
          iso.toLowerCase().includes(query) ||
          name.toLowerCase().includes(query) ||
          dial.includes(query)
        );
      })
      .slice(0, 80);
  }, [countryQuery, selectedCountry, sortedCountries]);

  const phonePrefix = selectedCountry
    ? `${flagEmoji(selectedCountry[0])} +${selectedCountry[2]}`
    : "🇬🇧 +44";

  useEffect(() => {
    const interval = setInterval(() => {
      setIsHeroFading(true);
      setTimeout(() => {
        setHeroIndex((prev) => (prev + 1) % heroMessages.length);
        setIsHeroFading(false);
      }, 420);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function setCountryByCode(code) {
      if (!code) return false;
      const match = COUNTRIES.find(([iso]) => iso === code.toUpperCase());
      if (!match) return false;
      setSelectedCountry(match);
      setCountryQuery(`${flagEmoji(match[0])} ${match[1]}`);
      return true;
    }

    async function detectCountry() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1400);
        const response = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          if (setCountryByCode(data.country_code)) return;
        }
      } catch {
        // Browser/location fallback below.
      }

      if (setCountryByCode(getBrowserCountryCode())) return;
      setCountryByCode("GB");
    }

    detectCountry();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (countryWrapRef.current && !countryWrapRef.current.contains(event.target)) {
        setCountryMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function selectCountry(country) {
    setSelectedCountry(country);
    setCountryQuery(`${flagEmoji(country[0])} ${country[1]}`);
    setCountryMenuOpen(false);
  }

  function scrollToContact(event) {
    event?.preventDefault?.();
    contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "#contact");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      ...form,
      country: selectedCountry?.[1] || countryQuery || "United Kingdom",
      dialCode: selectedCountry?.[2] || "44",
      phone: `${selectedCountry ? `+${selectedCountry[2]}` : "+44"} ${form.phone}`.trim(),
    };

    console.log("Microsoft consultation request:", payload);
    setSubmitStatus("Request received. This is a dummy submit handler. Connect your API here.");
  }

  return (
    <main className={pageClass}>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:76px_76px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.8),transparent_82%)]" />
<section className={`${containerClass} py-10 sm:py-16 lg:py-20 scroll-mt-28`}>
  <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
    <div className="min-w-0">
      <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#f5b938]/30 bg-[#f5b938]/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#ffd877] sm:px-3.5 sm:text-xs sm:tracking-[0.16em]">
        <BadgeCheck size={15} strokeWidth={2.4} className="shrink-0" />
        <span className="truncate sm:whitespace-normal">
          Trusted Microsoft Reseller · Secure Cloud · Backup · Training
        </span>
      </div>

      <h1 className="mt-5 max-w-3xl text-[34px] font-black leading-[1.02] tracking-[-0.055em] xs:text-[38px] sm:mt-6 sm:text-6xl sm:leading-[0.98] lg:text-[64px]">
        <span className="block">Accelerate your business with</span>

        <span className="mt-2 block min-h-[82px] sm:min-h-[116px] lg:min-h-[122px]">
          <span
            className={`inline-block bg-gradient-to-r from-white via-[#f5b938] to-[#48c9ff] bg-clip-text text-transparent transition duration-500 ${
              isHeroFading ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            {heroMessages[heroIndex]}
          </span>
        </span>
      </h1>

      <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/65 sm:mt-6 sm:text-base sm:leading-8">
        Qorliq delivers Microsoft licensing, cloud deployment, cybersecurity, backup,
        training and managed support for organizations that want a secure, scalable and
        future-ready Microsoft environment.
      </p>

      <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
        <Link
          href="#contact"
          onClick={scrollToContact}
          className={`${buttonPrimary} w-full sm:w-auto`}
        >
          Request Microsoft Consultation
          <ArrowRight size={17} strokeWidth={2.4} />
        </Link>

        <Link href="#services" className={`${buttonGhost} w-full sm:w-auto`}>
          View Services
        </Link>
      </div>

      <div className="-mx-4 mt-6 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {[
          [Cloud, "Microsoft CSP"],
          [ShieldCheck, "Managed Security"],
          [DatabaseBackup, "Backup & Recovery"],
          [GraduationCap, "Microsoft Courses"],
        ].map(([Icon, label]) => (
          <span
            key={label}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3.5 py-2.5 text-xs font-extrabold text-white/75"
          >
            <Icon size={16} strokeWidth={2.3} className="shrink-0" />
            {label}
          </span>
        ))}
      </div>

      <div className="-mx-4 mt-8 grid auto-cols-[145px] grid-flow-col gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid-flow-row sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0">
        {[
          [Building2, "Global", "Reseller Coverage"],
          [Headphones, "24/7", "Cloud-Ready Support"],
          [ServerCog, "360°", "Service Coverage"],
          [ShieldCheck, "SMB+", "Enterprise Ready"],
        ].map(([Icon, value, label]) => (
          <div
            key={label}
            className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.055] p-4"
          >
            <Icon size={20} strokeWidth={2.3} className="mb-2 text-[#f5b938]" />
            <b className="block text-xl font-black tracking-tight">{value}</b>
            <span className="mt-1 block text-[10px] font-black uppercase leading-4 tracking-[0.1em] text-white/45">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div className="min-w-0 rounded-[28px] border border-white/10 bg-white/[0.075] p-3 shadow-[0_28px_90px_rgba(0,0,0,0.48)] sm:rounded-[42px] sm:p-5">
      <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-[#030810]/90 to-[#0c1c30]/80 p-4 sm:min-h-[500px] sm:rounded-[28px] sm:p-7">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <MicrosoftLogo />

          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-[11px] font-black text-emerald-200">
            <BadgeCheck size={14} strokeWidth={2.5} />
            Partner Ready
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <StackCard
            icon={Cloud}
            title="Cloud & Licensing"
            text="Microsoft 365, Azure, Teams, SharePoint, Dynamics 365."
            tag="CSP"
          />

          <StackCard
            icon={ShieldCheck}
            title="Security Operations"
            text="Defender, identity, endpoint, email, compliance, and access control."
            tag="SOC"
          />

          <StackCard
            icon={DatabaseBackup}
            title="Backup & Recovery"
            text="Microsoft 365 backup, mailbox recovery, OneDrive, SharePoint, and continuity."
            tag="BCDR"
          />

          <StackCard
            icon={GraduationCap}
            title="Microsoft Courses"
            text="Admin, user adoption, Azure fundamentals, security, and Copilot readiness."
            tag="L&D"
          />
        </div>

        <div className="mt-5 rounded-2xl border border-[#f5b938]/25 bg-[#f5b938]/10 p-4 text-xs font-extrabold leading-6 text-[#ffe2a4] sm:rounded-3xl sm:p-5 sm:text-sm sm:leading-7">
          A modern reseller environment for secure cloud, managed services,
          professional services, enablement, backup, and ongoing support.
        </div>
      </div>
    </div>
  </div>
</section>

      <section className="border-y border-white/10 bg-white/[0.035] py-6">
        <div className={`${containerClass} flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between`}>
          <p className="m-0 text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
            Microsoft ecosystem supported by Qorliq
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
            {["Microsoft 365", "Azure", "Defender", "Entra ID", "SharePoint", "Dynamics 365", "Copilot"].map((item) => (
              <span key={item} className="shrink-0 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-black text-white/80">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={`${containerClass} pt-7`}>
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard number="01" title="Microsoft Reseller Environment" text="Licensing, cloud setup, renewals and customer support." />
          <InfoCard number="02" title="Secure Cloud Delivery" text="Security, backup, access control and continuity planning." />
          <InfoCard number="03" title="Enablement & Training" text="Practical Microsoft courses for users, admins and leaders." />
        </div>
      </section>

      <section id="services" className={sectionClass}>
        <SectionHead
          kicker="Our Core Service Areas"
          title="End-to-end Microsoft services built for modern enterprise operations."
          text="Clear categories, readable service cards, and a premium layout for customers who need licensing, cloud, cybersecurity, backup, training, and managed support."
        />

        <div className="mb-5 flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {serviceTabs.map(([title, text], index) => (
            <div
              key={title}
              className={`min-w-[245px] rounded-3xl border p-5 backdrop-blur-xl lg:min-w-0 ${
                index === 0 ? "border-[#f5b938]/35 bg-[#f5b938]/10" : "border-white/10 bg-white/[0.045]"
              }`}
            >
              <b className="block text-base">{title}</b>
              <span className="mt-2 block text-xs leading-5 text-white/60">{text}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map(({ icon: Icon, title, text }) => (
            <article key={title} className={`${cardClass} p-6 transition hover:-translate-y-1 hover:border-[#f5b938]/35 hover:bg-white/[0.08] sm:p-7`}>
              <div className={iconBoxClass}>
                <Icon size={27} strokeWidth={2.25} />
              </div>
              <h3 className="mt-5 text-xl font-black tracking-tight">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">{text}</p>
              <Link href="#contact" onClick={scrollToContact} className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#ffd877] hover:text-white">
                Learn more
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="security" className={sectionClass}>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-[#0078d4]/30 bg-[radial-gradient(circle_at_8%_5%,rgba(0,120,212,0.30),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035))] p-6 sm:p-9">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#f5b938]">Secure Cloud Services</p>
            <h2 className="text-[34px] font-black leading-[1.02] tracking-[-0.058em] sm:text-5xl lg:text-[56px]">Security and backup are not add-ons. They are core services.</h2>
            <p className="mt-5 text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
              Modern Microsoft environments need more than licenses. They need identity protection,
              endpoint security, email protection, backup, compliance, monitoring, user awareness,
              and recovery planning.
            </p>
            <CheckList
              items={[
                "Microsoft Defender and endpoint protection configuration",
                "MFA, conditional access, and identity security with Entra ID",
                "Email security, anti-phishing policies, and mailbox protection",
                "Microsoft 365 backup, retention, and recovery planning",
                "Security awareness and admin enablement courses",
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SimpleCard title="Identity Protection" text="Secure sign-in, MFA, user roles, admin controls, conditional access, and account protection." />
            <SimpleCard title="Email & Collaboration Security" text="Protect Outlook, Teams, SharePoint, OneDrive, and business communication from common threats." />
            <SimpleCard title="Backup Governance" text="Define what is backed up, how long it is retained, who can restore it, and how recovery works." />
            <SimpleCard title="Managed Cloud Security" text="Ongoing review of Microsoft security posture, risk areas, adoption, and improvements." />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="grid items-center gap-8 rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_82%_18%,rgba(245,185,56,0.13),transparent_35%)] bg-white/[0.045] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.48)] sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#f5b938]">Why Microsoft Matters</p>
            <h2 className="text-[34px] font-black leading-[1.02] tracking-[-0.058em] sm:text-5xl lg:text-[56px]">One platform for productivity, cloud, security, data and AI.</h2>
            <p className="mt-5 text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
              Microsoft connects email, meetings, documents, identity, cloud infrastructure, security,
              automation, analytics, and AI in one business ecosystem. Qorliq helps customers use that
              ecosystem properly, securely, and cost-effectively.
            </p>
            <Link href="#contact" onClick={scrollToContact} className={`${buttonPrimary} mt-7 w-full sm:w-auto`}>
              Plan My Microsoft Environment
              <ArrowRight size={17} strokeWidth={2.4} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {microsoftMatters.map(([Icon, title, text]) => (
              <div key={title} className="rounded-[26px] border border-white/10 bg-black/25 p-6 backdrop-blur-xl">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f5b938]/25 bg-[#f5b938]/15 text-[#f5b938]">
                  <Icon size={25} strokeWidth={2.3} />
                </div>
                <h3 className="mt-4 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <SectionHead
          kicker="Why Choose Qorliq"
          title="Why businesses choose us for Microsoft services."
          text="Qorliq is positioned as a practical Microsoft reseller partner, not just a license seller. We help customers choose, deploy, secure, back up, train, and manage their Microsoft environment."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {chooseUs.map(([number, title, text]) => (
            <article key={title} className={`${cardClass} min-h-[230px] p-7`}>
              <NumberPill>{number}</NumberPill>
              <h3 className="text-xl font-black tracking-tight">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="training" className={sectionClass}>
        <div className="rounded-[34px] border border-emerald-300/20 bg-[radial-gradient(circle_at_14%_16%,rgba(50,213,131,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.035))] p-6 sm:p-10">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#f5b938]">Microsoft Courses & Enablement</p>
          <h2 className="text-[34px] font-black leading-[1.02] tracking-[-0.058em] sm:text-5xl lg:text-[56px]">Training for users, admins and business teams.</h2>
          <p className="mt-5 max-w-4xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
            Qorliq can position Microsoft learning as a business enablement service: practical sessions
            for staff adoption, IT administration, cloud fundamentals, cybersecurity awareness and Copilot readiness.
          </p>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {courses.map(([label, title, text]) => (
              <article key={title} className="rounded-3xl border border-white/10 bg-black/25 p-6 backdrop-blur-xl">
                <small className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black text-emerald-200">
                  {label}
                </small>
                <h3 className="mt-4 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className={sectionClass}>
        <SectionHead
          kicker="Our Customers & Partners"
          title="Built for customers, supported by a partner ecosystem."
          text="Qorliq works with customers and technology partners to deliver secure, scalable Microsoft solutions for modern business environments."
        />

        <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_8%_10%,rgba(245,185,56,0.13),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(0,120,212,0.18),transparent_32%)] bg-white/[0.045] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.48)] sm:p-10">
          <PartnerGroup title="Customer Environments We Support">
            <div className="grid gap-4 lg:grid-cols-4">
              {customerCards.map(([title, text]) => (
                <PartnerCard key={title} title={title} text={text} />
              ))}
            </div>
          </PartnerGroup>

          <PartnerGroup title="Business Sectors">
            <div className="flex gap-3 overflow-x-auto pb-2 xl:grid xl:grid-cols-8 xl:overflow-visible xl:pb-0">
              {industries.map(([Icon, title]) => (
                <div key={title} className="min-w-[150px] rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-center backdrop-blur-xl xl:min-w-0">
                  <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f5b938]/25 bg-[#f5b938]/15 text-[#f5b938]">
                    <Icon size={24} strokeWidth={2.25} />
                  </span>
                  <b className="mt-3 block text-sm leading-5">{title}</b>
                </div>
              ))}
            </div>
          </PartnerGroup>

          <PartnerGroup title="Technology & Distribution Partners">
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
  {logos.map(([src, title], index) => (
    <div
      key={`${title}-${index}`}
      className="flex aspect-[1.35/1] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-center transition duration-200 hover:-translate-y-1 hover:border-[#f5b938]/40 hover:bg-white/[0.08] sm:aspect-auto sm:min-h-[125px] sm:rounded-3xl sm:p-4 lg:min-h-[145px] lg:p-5"
    >
      <img
        src={src}
        alt={`${title} logo`}
        className="h-auto max-h-10 w-full max-w-[120px] object-contain sm:max-h-12 sm:max-w-[150px] lg:max-h-16 lg:max-w-[190px]"
        loading="lazy"
      />
    </div>
  ))}
</div>
          </PartnerGroup>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {processSteps.map(([number, title, text]) => (
            <article key={title} className={`${cardClass} p-6`}>
              <NumberPill>{number}</NumberPill>
              <h3 className="text-lg font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <div className="grid items-center gap-8 rounded-[34px] border border-[#0078d4]/40 bg-[radial-gradient(circle_at_84%_12%,rgba(67,199,255,0.23),transparent_30%),linear-gradient(135deg,rgba(0,120,212,0.62),rgba(9,18,34,0.86))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.48)] sm:p-10 lg:grid-cols-[1fr_0.72fr]">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#f5b938]">Partner Ready</p>
            <h2 className="text-[34px] font-black leading-[1.02] tracking-[-0.058em] sm:text-5xl lg:text-[56px]">Your trusted Microsoft cloud and security partner.</h2>
            <p className="mt-5 text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
              Qorliq supports businesses with Microsoft licensing, Microsoft 365, Azure,
              cybersecurity, backup, training, Copilot readiness, and managed support through a
              professional reseller environment.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="#contact" onClick={scrollToContact} className={buttonPrimary}>
                Become a Microsoft Client
                <ArrowRight size={17} strokeWidth={2.4} />
              </Link>
              <Link href="#services" className={buttonGhost}>
                View Services
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-8 text-[#1b1b1b] shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
            <div className="mb-5 border-b border-black/10 pb-5">
              <MicrosoftLogo dark />
            </div>
            <h3 className="text-3xl font-black tracking-tight text-[#222]">Solutions Partner</h3>
            <p className="mt-3 text-sm font-bold leading-6 text-black/55">Modern Work · Azure · Security · Backup · Training</p>
          </div>
        </div>
      </section>

      <section id="contact" ref={contactRef} className={`${sectionClass} pt-10`}>
        <div className="grid gap-8 rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_0%_0%,rgba(245,185,56,0.12),transparent_34%),radial-gradient(circle_at_100%_0%,rgba(0,120,212,0.15),transparent_34%)] bg-white/[0.045] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.48)] sm:p-10 lg:grid-cols-[0.82fr_1fr]">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#f5b938]">Start with Qorliq</p>
            <h2 className="text-[34px] font-black leading-[1.02] tracking-[-0.058em] sm:text-5xl lg:text-[56px]">Ready to improve your Microsoft environment?</h2>
            <p className="mt-5 text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
              Complete the portal form and Qorliq will review your Microsoft licensing,
              Microsoft 365, Azure, security, backup, training, Copilot readiness or managed support requirement.
            </p>
            <CheckList
              items={[
                "Business consultation for Microsoft services",
                "Clear service matching based on company size",
                "Support for global customer environments",
              ]}
            />
          </div>

         <form
  onSubmit={handleSubmit}
  className="grid gap-4 rounded-[22px]  md:border md:border-white/10 md:bg-black/20  sm:rounded-[28px] md:p-5 md:grid-cols-2"
>
  <Field
    label="Full Name"
    placeholder="Enter your full name"
    value={form.fullName}
    onChange={(value) => updateForm("fullName", value)}
  />

  <Field
    label="Company Name"
    placeholder="Enter company name"
    value={form.companyName}
    onChange={(value) => updateForm("companyName", value)}
  />

  <div className="flex min-w-0 flex-col gap-2">
    <label className="pl-1 text-[10px] font-black uppercase tracking-[0.1em] text-white/75 sm:text-[11px]">
      Mobile Number
    </label>

    <div className="flex min-h-13 w-full min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-black/25 focus-within:border-[#f5b938]/70 focus-within:ring-4 focus-within:ring-[#f5b938]/10 sm:min-h-14">
      <span className="flex min-w-[72px] shrink-0 items-center justify-center border-r border-white/10 bg-white/[0.055] px-2 text-xs font-black text-white sm:min-w-[96px] sm:px-3 sm:text-sm">
        {phonePrefix}
      </span>

      <input
        value={form.phone}
        onChange={(e) => updateForm("phone", e.target.value)}
        placeholder="Mobile number"
        className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-white outline-none placeholder:text-white/35 sm:px-4"
      />
    </div>

    <small className="text-[11px] font-bold leading-5 text-white/40 sm:text-xs">
      Select your country first. The dialing code updates automatically.
    </small>
  </div>

  <Field
    label="Business Email"
    placeholder="name@company.com"
    type="email"
    value={form.email}
    onChange={(value) => updateForm("email", value)}
  />

  <div className="relative flex min-w-0 flex-col gap-2" ref={countryWrapRef}>
    <label className="pl-1 text-[10px] font-black uppercase tracking-[0.1em] text-white/75 sm:text-[11px]">
      Country / Region
    </label>

    <input
      value={countryQuery}
      onChange={(e) => {
        setSelectedCountry(null);
        setCountryQuery(e.target.value);
        setCountryMenuOpen(true);
      }}
      onFocus={() => setCountryMenuOpen(true)}
      placeholder="Search country / region"
      autoComplete="off"
      className="h-13 w-full min-w-0 rounded-2xl border border-white/15 bg-black/25 px-3 text-sm font-bold text-white outline-none transition placeholder:text-white/35 focus:border-[#f5b938]/70 focus:ring-4 focus:ring-[#f5b938]/10 sm:h-14 sm:px-4"
    />

    {countryMenuOpen ? (
      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-64 overflow-auto rounded-2xl border border-[#f5b938]/30 bg-[#071221] p-2 shadow-2xl sm:max-h-72">
        {filteredCountries.length ? (
          filteredCountries.map((country) => (
            <button
              type="button"
              key={country[0]}
              onMouseDown={(e) => {
                e.preventDefault();
                selectCountry(country);
              }}
              className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-white transition hover:bg-white/10"
            >
              <span className="min-w-0 truncate">
                {flagEmoji(country[0])} {country[1]}
              </span>

              <span className="shrink-0 text-[#ffd877]">+{country[2]}</span>
            </button>
          ))
        ) : (
          <div className="px-3 py-4 text-sm font-bold text-white/50">
            No country found
          </div>
        )}
      </div>
    ) : null}
  </div>

  <Field
    label="State / City"
    placeholder="Example: Riyadh, London, Dubai"
    value={form.city}
    onChange={(value) => updateForm("city", value)}
  />

  <SelectField
    label="Company Size by Employee"
    value={form.employees}
    onChange={(value) => updateForm("employees", value)}
    options={[
      "1 - 10 employees",
      "11 - 25 employees",
      "26 - 50 employees",
      "51 - 100 employees",
      "101 - 250 employees",
      "251 - 500 employees",
      "500+ employees",
    ]}
    placeholder="Select employee range"
  />

  <SelectField
    label="Interested With"
    value={form.service}
    onChange={(value) => updateForm("service", value)}
    options={[
      "Microsoft CSP Licensing",
      "Microsoft 365 Deployment",
      "Azure Cloud Services",
      "Microsoft Security",
      "Backup & Disaster Recovery",
      "Microsoft Courses & Training",
      "Copilot Readiness",
      "Dynamics 365 & Power Platform",
      "Managed Support",
      "Complete Microsoft Business Package",
    ]}
    placeholder="Select service"
  />

  <div className="flex min-w-0 flex-col gap-2 md:col-span-2">
    <label className="pl-1 text-[10px] font-black uppercase tracking-[0.1em] text-white/75 sm:text-[11px]">
      Description
    </label>

    <textarea
      value={form.description}
      onChange={(e) => updateForm("description", e.target.value)}
      placeholder="Tell us about your Microsoft requirement, current setup, number of users, migration needs, security concerns, backup requirements, or training goals."
      className="min-h-32 w-full min-w-0 resize-none rounded-2xl border border-white/15 bg-black/25 px-3 py-4 text-sm font-bold leading-6 text-white outline-none transition placeholder:text-white/35 focus:border-[#f5b938]/70 focus:ring-4 focus:ring-[#f5b938]/10 sm:px-4"
    />
  </div>

  {submitStatus ? (
    <p className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold leading-6 text-emerald-100 md:col-span-2">
      {submitStatus}
    </p>
  ) : null}

  <button
    type="submit"
    className={`${buttonPrimary} flex w-full items-center justify-center gap-2 px-4 text-center text-[11px] sm:text-xs md:col-span-2`}
  >
    <span className="truncate sm:whitespace-normal">
      Submit Microsoft Consultation Request
    </span>
    <ArrowRight className="shrink-0" size={17} strokeWidth={2.4} />
  </button>
</form>
        </div>
      </section>
    </main>
  );
}

function MicrosoftLogo({ dark = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid grid-cols-2 gap-[3px]">
        <i className="block h-4 w-4 bg-[#f25022]" />
        <i className="block h-4 w-4 bg-[#7fba00]" />
        <i className="block h-4 w-4 bg-[#00a4ef]" />
        <i className="block h-4 w-4 bg-[#ffb900]" />
      </div>
      <strong className={`text-2xl font-black tracking-tight sm:text-3xl ${dark ? "text-[#222]" : "text-white"}`}>Microsoft</strong>
    </div>
  );
}

function StackCard({ icon: Icon, title, text, tag }) {
  return (
    <div className="grid grid-cols-[42px_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-3 sm:grid-cols-[46px_1fr_auto] sm:gap-4 sm:p-4">
      <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-2xl bg-[#f5b938]/10 text-[#f5b938] sm:h-[46px] sm:w-[46px]">
        <Icon size={22} strokeWidth={2.3} />
      </span>

      <div className="min-w-0">
        <b className="block text-sm font-black text-white">{title}</b>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/60 sm:line-clamp-none">
          {text}
        </p>
      </div>

      <em className="rounded-full bg-white px-2 py-1 text-[9px] font-black not-italic text-[#05070b] sm:text-[10px]">
        {tag}
      </em>
    </div>
  );
}

function InfoCard({ number, title, text }) {
  return (
    <div className={`${cardClass} p-6`}>
      <NumberPill>{number}</NumberPill>
      <b className="block text-lg font-black tracking-tight">{title}</b>
      <p className="mt-2 text-sm leading-6 text-white/65">{text}</p>
    </div>
  );
}

function SectionHead({ kicker, title, text }) {
  return (
    <div className="mb-9 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#f5b938]">{kicker}</p>
        <h2 className="max-w-3xl text-[34px] font-black leading-[1.02] tracking-[-0.058em] sm:text-5xl lg:text-[56px]">{title}</h2>
      </div>
      <p className="max-w-xl text-sm font-medium leading-7 text-white/65 sm:text-base sm:leading-8">{text}</p>
    </div>
  );
}

function SimpleCard({ title, text }) {
  return (
    <article className={`${cardClass} p-6 sm:p-7`}>
      <h3 className="text-xl font-black tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/65">{text}</p>
    </article>
  );
}

function CheckList({ items }) {
  return (
    <div className="mt-6 grid gap-3">
      {items.map((item) => (
        <div key={item} className="flex gap-3 text-sm font-bold leading-6 text-white/75">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f5b938]/15 text-sm font-black text-[#f5b938]">✓</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function NumberPill({ children }) {
  return (
    <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5b938]/15 text-sm font-black text-[#ffd877]">
      {children}
    </span>
  );
}

function PartnerGroup({ title, children }) {
  return (
    <div className="mt-8 first:mt-0">
      <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-[#f5b938]">{title}</p>
      {children}
    </div>
  );
}

function PartnerCard({ title, text }) {
  return (
    <div className="flex min-h-[125px] flex-col justify-center gap-2 rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur-xl">
      <b className="text-lg font-black tracking-tight">{title}</b>
      <span className="text-sm leading-6 text-white/65">{text}</span>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="pl-1 text-[11px] font-black uppercase tracking-[0.12em] text-white/75">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-white/15 bg-black/25 px-4 text-sm font-bold text-white outline-none transition placeholder:text-white/35 focus:border-[#f5b938]/70 focus:ring-4 focus:ring-[#f5b938]/10"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="pl-1 text-[11px] font-black uppercase tracking-[0.12em] text-white/75">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-14 w-full rounded-2xl border border-[#f5b938]/25 bg-[linear-gradient(135deg,rgba(245,185,56,0.12),rgba(0,120,212,0.08))] px-4 text-sm font-bold text-white outline-none transition focus:border-[#f5b938]/70 focus:ring-4 focus:ring-[#f5b938]/10">
        <option value="" disabled className="text-black">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} className="text-black">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
