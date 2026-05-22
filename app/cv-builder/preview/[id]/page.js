"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const templateConfig = {
  "ats-professional": {
    layout: "ats",
    name: "ATS Professional",
    accent: "#111827",
    photo: false,
  },
  "modern-corporate": {
    layout: "modern",
    name: "Modern Corporate",
    accent: "#2563EB",
    photo: true,
  },
  "executive-leadership": {
    layout: "executive",
    name: "Executive Leadership",
    accent: "#B88A2C",
    photo: false,
  },
  "creative-portfolio": {
    layout: "creative",
    name: "Creative Portfolio",
    accent: "#7C3AED",
    photo: true,
  },
  "graduate-entry": {
    layout: "student",
    name: "Graduate Entry",
    accent: "#059669",
    photo: true,
  },
  "technical-it": {
    layout: "technical",
    name: "Technical IT",
    accent: "#0891B2",
    photo: false,
  },
  "academic-research": {
    layout: "academic",
    name: "Academic Research",
    accent: "#4338CA",
    photo: false,
  },
  "healthcare-clinical": {
    layout: "healthcare",
    name: "Healthcare Clinical",
    accent: "#0F766E",
    photo: true,
  },
  "skilled-trade": {
    layout: "trade",
    name: "Skilled Trade",
    accent: "#EA580C",
    photo: true,
  },
  "international-europass": {
    layout: "europass",
    name: "International Europass",
    accent: "#1D4ED8",
    photo: true,
  },

  executive: {
    layout: "executive",
    name: "Executive Leadership",
    accent: "#B88A2C",
    photo: false,
  },
  modern: {
    layout: "modern",
    name: "Modern Corporate",
    accent: "#2563EB",
    photo: true,
  },
  creative: {
    layout: "creative",
    name: "Creative Portfolio",
    accent: "#7C3AED",
    photo: true,
  },
  minimal: {
    layout: "ats",
    name: "ATS Professional",
    accent: "#111827",
    photo: false,
  },
};

const emptyCV = {
  template: "ats-professional",
  fullName: "",
  jobTitle: "",
  email: "",
  phone: "",
  location: "",
  linkedIn: "",
  github: "",
  portfolio: "",
  website: "",
  photo: "",
  summary: "",
  skills: [],
  languages: [],
  experience: "",
  projects: "",
  education: "",
  certifications: [],
  strengths: [],
  experiences: [],
  educations: [],
  projectsList: [],
  certificationsList: [],
};

export default function CVPreviewPage() {
  const params = useParams();
  const cvId = params.id;

  const [cv, setCv] = useState(emptyCV);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCV() {
      try {
        const res = await fetch(`/api/cv/${cvId}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success) {
          const loaded = data.cv || data.data || {};

          setCv({
            ...emptyCV,
            ...loaded,
            skills: normalizeList(loaded.skills),
            languages: normalizeList(loaded.languages),
            certifications: normalizeList(loaded.certifications),
            strengths: normalizeList(loaded.strengths),
            experiences: Array.isArray(loaded.experiences)
              ? loaded.experiences
              : [],
            educations: Array.isArray(loaded.educations)
              ? loaded.educations
              : [],
            projectsList: Array.isArray(loaded.projectsList)
              ? loaded.projectsList
              : [],
            certificationsList: Array.isArray(loaded.certificationsList)
              ? loaded.certificationsList
              : [],
          });
        }
      } catch (error) {
        console.error("Load CV error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (cvId) loadCV();
  }, [cvId]);


  const config =
    templateConfig[cv.template] || templateConfig["ats-professional"];

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-qorliqGold">
          Loading CV...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-white md:px-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl print:max-w-none">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
              Qorliq CV Builder
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">
              CV Preview
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Selected Template:{" "}
              <span className="font-bold text-qorliqGold">{config.name}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/cv-builder/create?edit=${cvId}`}
              className="rounded-full border border-white/15 px-6 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-white/70 transition hover:border-qorliqGold hover:text-qorliqGold"
            >
              Edit CV
            </Link>

     <Link
  href={`/cv-builder/success?cvId=${cvId}`}
  className="inline-flex items-center justify-center rounded-full bg-qorliqGold px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white"
>
  Pay & Download
</Link>
          </div>
        </div>

     <div className="mx-auto flex w-full justify-center overflow-x-auto print:block print:overflow-visible">
  <TemplateRenderer cv={cv} config={config} />
</div>
      </div>
    </main>
  );
}

function TemplateRenderer({ cv, config }) {
  if (config.layout === "modern" || config.layout === "healthcare") {
    return <ModernTemplate cv={cv} config={config} />;
  }

  if (config.layout === "executive") {
    return <ExecutiveTemplate cv={cv} config={config} />;
  }

  if (config.layout === "creative") {
    return <CreativeTemplate cv={cv} config={config} />;
  }

  if (
    config.layout === "student" ||
    config.layout === "trade" ||
    config.layout === "europass"
  ) {
    return <PhotoHeaderTemplate cv={cv} config={config} />;
  }

  return <ATSTemplate cv={cv} config={config} />;
}

function ATSTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <div className="min-h-[1120px] bg-white px-12 py-12 text-black shadow-2xl print:shadow-none">
      <header
        className="border-b pb-6"
        style={{ borderColor: `${accent}55` }}
      >
        {hasText(cv.fullName) ? (
          <h1 className="text-5xl font-black tracking-[-0.05em]">
            {cv.fullName}
          </h1>
        ) : null}

        {hasText(cv.jobTitle) ? (
          <p className="mt-2 text-xl font-bold" style={{ color: accent }}>
            {cv.jobTitle}
          </p>
        ) : null}

        {hasContact(cv) ? <ContactLine cv={cv} dark={false} /> : null}
      </header>

      <main className="mt-8 space-y-8">
        {hasText(cv.summary) ? (
          <CVSection title="Professional Summary" accent={accent}>
            <Paragraph text={cv.summary} />
          </CVSection>
        ) : null}

        {hasValidExperience(cv) ? (
          <CVSection title="Work Experience" accent={accent}>
            <ExperienceContent cv={cv} />
          </CVSection>
        ) : null}

        <div className="grid gap-8 md:grid-cols-[0.58fr_0.42fr]">
          <div className="space-y-8">
            {hasValidEducation(cv) ? (
              <CVSection title="Education" accent={accent}>
                <EducationContent cv={cv} />
              </CVSection>
            ) : null}

            {hasValidProjects(cv) ? (
              <CVSection title="Projects" accent={accent}>
                <ProjectsContent cv={cv} />
              </CVSection>
            ) : null}
          </div>

          <aside className="space-y-8">
            {hasList(cv.skills) ? (
              <CVSection title="Skills" accent={accent}>
                <TagList items={cv.skills} accent={accent} />
              </CVSection>
            ) : null}

            {hasList(cv.languages) ? (
              <CVSection title="Languages" accent={accent}>
                <BulletList items={cv.languages} />
              </CVSection>
            ) : null}

            {hasValidCertifications(cv) ? (
              <CVSection title="Certifications" accent={accent}>
                <CertificationContent cv={cv} />
              </CVSection>
            ) : null}

            {hasList(cv.strengths) ? (
              <CVSection title="Key Strengths" accent={accent}>
                <BulletList items={cv.strengths} />
              </CVSection>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}

function ModernTemplate({ cv, config }) {
  const accent = config.accent || "#0f7f70";

  return (
    <div
      id="cv-download"
      className="grid shrink-0 bg-white text-black shadow-2xl"
      style={{
        width: "794px",
        height: "1123px",
        minHeight: "1123px",
        gridTemplateColumns: "270px 524px",
        alignItems: "stretch",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* LEFT SIDEBAR */}
      <aside
        className="flex flex-col px-8 py-10 text-white"
        style={{
          backgroundColor: accent,
          width: "270px",
          height: "1123px",
          minHeight: "1123px",
          alignSelf: "stretch",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {hasText(cv.photo) || hasText(cv.fullName) ? (
          <ProfilePhoto cv={cv} accent={accent} dark />
        ) : null}

        {hasText(cv.fullName) ? (
          <h1 className="mt-6 text-3xl font-black leading-tight">
            {cv.fullName}
          </h1>
        ) : null}

        {hasText(cv.jobTitle) ? (
          <p className="mt-2 text-sm font-semibold text-white/75">
            {cv.jobTitle}
          </p>
        ) : null}

        {hasContact(cv) ? (
          <div className="mt-8">
            <SmallTitle title="Contact" dark />
            <ContactStack cv={cv} dark />
          </div>
        ) : null}

        {hasList(cv.skills) ? (
          <div className="mt-8">
            <SmallTitle title="Skills" dark />
            <SkillPills items={cv.skills} dark />
          </div>
        ) : null}

        {hasList(cv.languages) ? (
          <div className="mt-8">
            <SmallTitle title="Languages" dark />
            <BulletList items={cv.languages} dark />
          </div>
        ) : null}

        {hasList(cv.strengths) ? (
          <div className="mt-8">
            <SmallTitle title="Strengths" dark />
            <BulletList items={cv.strengths} dark />
          </div>
        ) : null}
      </aside>

      {/* RIGHT CONTENT */}
      <main
        className="space-y-8 px-10 py-10"
        style={{
          width: "524px",
          height: "1123px",
          minHeight: "1123px",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          overflow: "hidden",
        }}
      >
        {hasText(cv.summary) ? (
          <CVSection title="Professional Summary" accent={accent}>
            <Paragraph text={cv.summary} />
          </CVSection>
        ) : null}

        {hasValidExperience(cv) ? (
          <CVSection title="Employment History" accent={accent}>
            <ExperienceContent cv={cv} />
          </CVSection>
        ) : null}

        {hasValidEducation(cv) ? (
          <CVSection title="Education" accent={accent}>
            <EducationContent cv={cv} />
          </CVSection>
        ) : null}

        {hasValidProjects(cv) ? (
          <CVSection title="Projects" accent={accent}>
            <ProjectsContent cv={cv} />
          </CVSection>
        ) : null}

        {hasValidCertifications(cv) ? (
          <CVSection title="Certifications" accent={accent}>
            <CertificationContent cv={cv} />
          </CVSection>
        ) : null}
      </main>
    </div>
  );
}
function ExecutiveTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <div className="min-h-[1120px] overflow-hidden bg-white text-black shadow-2xl print:shadow-none">
      <div className="bg-neutral-950 px-10 py-12 text-white">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-white/45">
          Executive CV
        </p>

        {hasText(cv.fullName) ? (
          <h1 className="mt-3 text-5xl font-black tracking-[-0.055em]">
            {cv.fullName}
          </h1>
        ) : null}

        {hasText(cv.jobTitle) ? (
          <p className="mt-3 text-xl font-semibold text-white/70">
            {cv.jobTitle}
          </p>
        ) : null}

        {hasContact(cv) ? <ContactLine cv={cv} dark /> : null}

        <div
          className="mt-6 h-1.5 w-24 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </div>

      <div className="grid gap-10 px-10 py-10 md:grid-cols-[0.36fr_0.64fr]">
        <aside className="space-y-8">
          {hasList(cv.skills) ? (
            <CVSection title="Core Skills" accent={accent}>
              <SkillPills items={cv.skills} accent={accent} />
            </CVSection>
          ) : null}

          {hasValidEducation(cv) ? (
            <CVSection title="Education" accent={accent}>
              <EducationContent cv={cv} compact />
            </CVSection>
          ) : null}

          {hasList(cv.languages) ? (
            <CVSection title="Languages" accent={accent}>
              <BulletList items={cv.languages} />
            </CVSection>
          ) : null}

          {hasValidCertifications(cv) ? (
            <CVSection title="Certifications" accent={accent}>
              <CertificationContent cv={cv} compact />
            </CVSection>
          ) : null}

          {hasList(cv.strengths) ? (
            <CVSection title="Key Strengths" accent={accent}>
              <BulletList items={cv.strengths} />
            </CVSection>
          ) : null}
        </aside>

        <main className="space-y-8">
          {hasText(cv.summary) ? (
            <CVSection title="Professional Profile" accent={accent}>
              <Paragraph text={cv.summary} />
            </CVSection>
          ) : null}

          {hasValidExperience(cv) ? (
            <CVSection title="Leadership Experience" accent={accent}>
              <ExperienceContent cv={cv} />
            </CVSection>
          ) : null}

          {hasValidProjects(cv) ? (
            <CVSection title="Projects" accent={accent}>
              <ProjectsContent cv={cv} />
            </CVSection>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function CreativeTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <div className="min-h-[1120px] bg-white px-10 py-10 text-black shadow-2xl print:shadow-none">
      <header
        className="flex flex-col gap-6 rounded-[2rem] p-7 sm:flex-row sm:items-center"
        style={{ backgroundColor: `${accent}15` }}
      >
        {hasText(cv.photo) || hasText(cv.fullName) ? (
          <ProfilePhoto cv={cv} accent={accent} rounded />
        ) : null}

        <div className="min-w-0">
          <p
            className="text-xs font-black uppercase tracking-[0.25em]"
            style={{ color: accent }}
          >
            Creative Portfolio CV
          </p>

          {hasText(cv.fullName) ? (
            <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
              {cv.fullName}
            </h1>
          ) : null}

          {hasText(cv.jobTitle) ? (
            <p className="mt-2 text-xl font-bold" style={{ color: accent }}>
              {cv.jobTitle}
            </p>
          ) : null}

          {hasContact(cv) ? <ContactLine cv={cv} dark={false} /> : null}
        </div>
      </header>

      <main className="mt-10 grid gap-9 md:grid-cols-[0.62fr_0.38fr]">
        <div className="space-y-8">
          {hasText(cv.summary) ? (
            <CVSection title="Creative Profile" accent={accent}>
              <Paragraph text={cv.summary} />
            </CVSection>
          ) : null}

          {hasValidExperience(cv) ? (
            <CVSection title="Experience" accent={accent}>
              <ExperienceContent cv={cv} />
            </CVSection>
          ) : null}

          {hasValidProjects(cv) ? (
            <CVSection title="Projects" accent={accent}>
              <ProjectsContent cv={cv} />
            </CVSection>
          ) : null}
        </div>

        <aside className="space-y-8 rounded-[1.8rem] border border-black/5 bg-black/[0.025] p-6">
          {hasList(cv.skills) ? (
            <CVSection title="Skills" accent={accent}>
              <SkillPills items={cv.skills} accent={accent} />
            </CVSection>
          ) : null}

          {hasValidEducation(cv) ? (
            <CVSection title="Education" accent={accent}>
              <EducationContent cv={cv} compact />
            </CVSection>
          ) : null}

          {hasList(cv.languages) ? (
            <CVSection title="Languages" accent={accent}>
              <BulletList items={cv.languages} />
            </CVSection>
          ) : null}

          {hasValidCertifications(cv) ? (
            <CVSection title="Certifications" accent={accent}>
              <CertificationContent cv={cv} compact />
            </CVSection>
          ) : null}

          {hasList(cv.strengths) ? (
            <CVSection title="Strengths" accent={accent}>
              <BulletList items={cv.strengths} />
            </CVSection>
          ) : null}
        </aside>
      </main>
    </div>
  );
}

function PhotoHeaderTemplate({ cv, config }) {
  const accent = config.accent;

  const label =
    config.layout === "europass"
      ? "European / International CV Format"
      : config.layout === "student"
      ? "Graduate CV"
      : config.layout === "trade"
      ? "Skilled Trade CV"
      : "Professional CV";

  return (
    <div className="min-h-[1120px] bg-white px-10 py-10 text-black shadow-2xl print:shadow-none">
      <header
        className="flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-center"
        style={{ borderColor: `${accent}40` }}
      >
        {hasText(cv.photo) || hasText(cv.fullName) ? (
          <ProfilePhoto cv={cv} accent={accent} />
        ) : null}

        <div className="min-w-0">
          <p
            className="text-xs font-black uppercase tracking-[0.25em]"
            style={{ color: accent }}
          >
            {label}
          </p>

          {hasText(cv.fullName) ? (
            <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
              {cv.fullName}
            </h1>
          ) : null}

          {hasText(cv.jobTitle) ? (
            <p className="mt-2 text-xl font-bold" style={{ color: accent }}>
              {cv.jobTitle}
            </p>
          ) : null}

          {hasContact(cv) ? <ContactLine cv={cv} dark={false} /> : null}
        </div>
      </header>

      <main className="mt-9 space-y-8">
        {hasText(cv.summary) ? (
          <CVSection title="Profile" accent={accent}>
            <Paragraph text={cv.summary} />
          </CVSection>
        ) : null}

        {hasValidExperience(cv) ? (
          <CVSection title="Employment History" accent={accent}>
            <ExperienceContent cv={cv} />
          </CVSection>
        ) : null}

        <div className="grid gap-9 md:grid-cols-2">
          {hasValidEducation(cv) ? (
            <CVSection title="Education" accent={accent}>
              <EducationContent cv={cv} />
            </CVSection>
          ) : null}

          {hasList(cv.skills) ? (
            <CVSection title="Skills" accent={accent}>
              <SkillPills items={cv.skills} accent={accent} />
            </CVSection>
          ) : null}
        </div>

        <div className="grid gap-9 md:grid-cols-2">
          {hasValidProjects(cv) ? (
            <CVSection title="Projects" accent={accent}>
              <ProjectsContent cv={cv} />
            </CVSection>
          ) : null}

          <div className="space-y-8">
            {hasList(cv.languages) ? (
              <CVSection title="Languages" accent={accent}>
                <BulletList items={cv.languages} />
              </CVSection>
            ) : null}

            {hasValidCertifications(cv) ? (
              <CVSection title="Certifications" accent={accent}>
                <CertificationContent cv={cv} />
              </CVSection>
            ) : null}

            {hasList(cv.strengths) ? (
              <CVSection title="Strengths" accent={accent}>
                <BulletList items={cv.strengths} />
              </CVSection>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

function CVSection({ title, children, accent }) {
  if (!children) return null;

  return (
    <section>
      <h2
        className="text-sm font-black uppercase tracking-[0.22em]"
        style={{ color: accent }}
      >
        {title}
      </h2>

      <div
        className="mt-3 h-px w-full"
        style={{ backgroundColor: `${accent}35` }}
      />

      <div className="mt-4">{children}</div>
    </section>
  );
}

function ExperienceContent({ cv }) {
  if (Array.isArray(cv.experiences) && cv.experiences.length > 0) {
    const validItems = cv.experiences.filter(
      (item) =>
        hasText(item.jobTitle) ||
        hasText(item.company) ||
        hasText(item.location) ||
        hasText(item.startDate) ||
        hasText(item.endDate) ||
        hasText(item.description)
    );

    if (validItems.length > 0) {
      return (
        <div className="space-y-6">
          {validItems.map((item, index) => (
            <div key={index}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  {hasText(item.jobTitle) ? (
                    <h3 className="text-lg font-black text-black">
                      {item.jobTitle}
                    </h3>
                  ) : null}

                  {[item.company, item.location].filter(Boolean).length > 0 ? (
                    <p className="text-sm font-semibold text-black/55">
                      {[item.company, item.location].filter(Boolean).join(", ")}
                    </p>
                  ) : null}
                </div>

                {formatDateRange(
                  item.startDate,
                  item.endDate,
                  item.current
                ) ? (
                  <p className="whitespace-nowrap text-sm font-bold text-black/45">
                    {formatDateRange(item.startDate, item.endDate, item.current)}
                  </p>
                ) : null}
              </div>

              {hasText(item.description) ? (
                <Paragraph text={item.description} className="mt-3" />
              ) : null}
            </div>
          ))}
        </div>
      );
    }
  }

  return hasText(cv.experience) ? <Paragraph text={cv.experience} /> : null;
}

function EducationContent({ cv, compact = false }) {
  if (Array.isArray(cv.educations) && cv.educations.length > 0) {
    const validItems = cv.educations.filter(
      (item) =>
        hasText(item.degree) ||
        hasText(item.institution) ||
        hasText(item.location) ||
        hasText(item.startDate) ||
        hasText(item.endDate) ||
        hasText(item.description)
    );

    if (validItems.length > 0) {
      return (
        <div className={compact ? "space-y-4" : "space-y-5"}>
          {validItems.map((item, index) => (
            <div key={index}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  {hasText(item.degree) ? (
                    <h3 className="text-base font-black text-black">
                      {item.degree}
                    </h3>
                  ) : null}

                  {[item.institution, item.location].filter(Boolean).length >
                  0 ? (
                    <p className="text-sm font-semibold text-black/55">
                      {[item.institution, item.location]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  ) : null}
                </div>

                {[item.startDate, item.endDate].filter(Boolean).length > 0 ? (
                  <p className="whitespace-nowrap text-sm font-bold text-black/45">
                    {[item.startDate, item.endDate].filter(Boolean).join(" — ")}
                  </p>
                ) : null}
              </div>

              {hasText(item.description) ? (
                <Paragraph text={item.description} className="mt-2" />
              ) : null}
            </div>
          ))}
        </div>
      );
    }
  }

  return hasText(cv.education) ? <Paragraph text={cv.education} /> : null;
}

function ProjectsContent({ cv }) {
  if (Array.isArray(cv.projectsList) && cv.projectsList.length > 0) {
    const validItems = cv.projectsList.filter(
      (item) =>
        hasText(item.title) ||
        hasText(item.role) ||
        hasText(item.technologies) ||
        hasText(item.date) ||
        hasText(item.description)
    );

    if (validItems.length > 0) {
      return (
        <div className="space-y-5">
          {validItems.map((item, index) => (
            <div key={index}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  {hasText(item.title) ? (
                    <h3 className="text-base font-black text-black">
                      {item.title}
                    </h3>
                  ) : null}

                  {[item.role, item.technologies].filter(Boolean).length > 0 ? (
                    <p className="text-sm font-semibold text-black/55">
                      {[item.role, item.technologies]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>

                {hasText(item.date) ? (
                  <p className="whitespace-nowrap text-sm font-bold text-black/45">
                    {item.date}
                  </p>
                ) : null}
              </div>

              {hasText(item.description) ? (
                <Paragraph text={item.description} className="mt-2" />
              ) : null}
            </div>
          ))}
        </div>
      );
    }
  }

  return hasText(cv.projects) ? <Paragraph text={cv.projects} /> : null;
}

function CertificationContent({ cv, compact = false }) {
  if (
    Array.isArray(cv.certificationsList) &&
    cv.certificationsList.length > 0
  ) {
    const validItems = cv.certificationsList.filter(
      (item) => hasText(item.name) || hasText(item.issuer) || hasText(item.date)
    );

    if (validItems.length > 0) {
      return (
        <div className={compact ? "space-y-3" : "space-y-4"}>
          {validItems.map((item, index) => (
            <div key={index}>
              {hasText(item.name) ? (
                <h3 className="text-sm font-black text-black">{item.name}</h3>
              ) : null}

              {[item.issuer, item.date].filter(Boolean).length > 0 ? (
                <p className="text-sm leading-7 text-black/60">
                  {[item.issuer, item.date].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      );
    }
  }

  return hasList(cv.certifications) ? (
    <BulletList items={cv.certifications} />
  ) : null;
}

function Paragraph({ text, dark = false, className = "" }) {
  if (!hasText(text)) return null;

  return (
    <p
      className={`whitespace-pre-line text-sm leading-8 ${
        dark ? "text-white/75" : "text-black/70"
      } ${className}`}
    >
      {text}
    </p>
  );
}

function BulletList({ items, dark = false }) {
  const list = normalizeList(items);

  if (list.length === 0) return null;

  return (
    <ul
      className={`space-y-2 text-sm leading-7 ${
        dark ? "text-white/78" : "text-black/70"
      }`}
    >
      {list.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-3">
          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TagList({ items, accent }) {
  const list = normalizeList(items);

  if (list.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full px-3 py-1.5 text-xs font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function SkillPills({ items, accent = "#111827", dark = false }) {
  const list = normalizeList(items);

  if (list.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
            dark ? "bg-white/15 text-white" : "text-white"
          }`}
          style={dark ? undefined : { backgroundColor: accent }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function SmallTitle({ title, dark = false }) {
  return (
    <p
      className={`mb-3 text-xs font-black uppercase tracking-[0.22em] ${
        dark ? "text-white" : "text-black"
      }`}
    >
      {title}
    </p>
  );
}

function ContactLine({ cv, dark = false }) {
  const baseClass = dark
    ? "text-white/65 hover:text-white"
    : "text-black/55 hover:text-black";

  return (
    <div
      className={`mt-5 flex flex-wrap gap-x-3 gap-y-2 text-sm ${
        dark ? "text-white/65" : "text-black/55"
      }`}
    >
      {hasText(cv.email) ? (
        <a className={baseClass} href={`mailto:${cv.email}`}>
          {cv.email}
        </a>
      ) : null}

      {hasText(cv.phone) ? <span>{cv.phone}</span> : null}
      {hasText(cv.location) ? <span>{cv.location}</span> : null}

      <ClickableUrl value={cv.linkedIn} className={baseClass} />
      <ClickableUrl value={cv.github} className={baseClass} />
      <ClickableUrl value={cv.portfolio} className={baseClass} />
      <ClickableUrl value={cv.website} className={baseClass} />
    </div>
  );
}

function ContactStack({ cv, dark = false }) {
  const baseClass = dark
    ? "text-white/75 hover:text-white"
    : "text-black/60 hover:text-black";

  return (
    <div className="space-y-2 text-sm leading-6">
      {hasText(cv.email) ? (
        <a className={`block break-all ${baseClass}`} href={`mailto:${cv.email}`}>
          {cv.email}
        </a>
      ) : null}

      {hasText(cv.phone) ? (
        <p className={dark ? "text-white/75" : "text-black/60"}>{cv.phone}</p>
      ) : null}

      {hasText(cv.location) ? (
        <p className={dark ? "text-white/75" : "text-black/60"}>
          {cv.location}
        </p>
      ) : null}

      <ClickableUrl
        value={cv.linkedIn}
        className={`block break-all ${baseClass}`}
      />
      <ClickableUrl
        value={cv.github}
        className={`block break-all ${baseClass}`}
      />
      <ClickableUrl
        value={cv.portfolio}
        className={`block break-all ${baseClass}`}
      />
      <ClickableUrl
        value={cv.website}
        className={`block break-all ${baseClass}`}
      />
    </div>
  );
}

function ClickableUrl({ value, className = "" }) {
  if (!hasText(value)) return null;

  const clean = String(value).trim();

  const href =
    clean.startsWith("http://") || clean.startsWith("https://")
      ? clean
      : `https://${clean}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline-offset-4 hover:underline ${className}`}
    >
      {clean}
    </a>
  );
}

function ProfilePhoto({ cv, accent, dark = false, rounded = false }) {
  return (
    <div
      className={`flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden border ${
        rounded ? "rounded-[1.8rem]" : "rounded-full"
      } ${dark ? "border-white/25 bg-white/10" : "border-black/5 bg-black/5"}`}
      style={{ boxShadow: `0 18px 45px ${accent}25` }}
    >
      {hasText(cv.photo) ? (
        <img
          src={cv.photo}
          alt={cv.fullName || "Profile"}
          className="h-full w-full object-cover"
        />
      ) : (
        <DefaultAvatar name={cv.fullName} accent={accent} />
      )}
    </div>
  );
}

function DefaultAvatar({ name = "Candidate", accent = "#111827" }) {
  const initials = String(name || "Candidate")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center text-white"
      style={{
        background: `linear-gradient(135deg, ${accent}, #111827)`,
      }}
    >
      <div className="h-12 w-12 rounded-full bg-white/90" />
      <div className="mt-2 h-10 w-20 rounded-t-full bg-white/90" />
      <p className="mt-1 text-xs font-black opacity-50">{initials}</p>
    </div>
  );
}

function formatDateRange(startDate, endDate, current) {
  const start = hasText(startDate) ? startDate : "";
  const end = current ? "Present" : hasText(endDate) ? endDate : "";

  if (!start && !end) return "";
  if (start && end) return `${start} — ${end}`;
  return start || end;
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/,|\n|·/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasList(value) {
  return normalizeList(value).length > 0;
}

function hasContact(cv) {
  return (
    hasText(cv.email) ||
    hasText(cv.phone) ||
    hasText(cv.location) ||
    hasText(cv.linkedIn) ||
    hasText(cv.github) ||
    hasText(cv.portfolio) ||
    hasText(cv.website)
  );
}

function hasValidExperience(cv) {
  if (Array.isArray(cv.experiences)) {
    const validItems = cv.experiences.filter(
      (item) =>
        hasText(item.jobTitle) ||
        hasText(item.company) ||
        hasText(item.location) ||
        hasText(item.startDate) ||
        hasText(item.endDate) ||
        hasText(item.description)
    );

    if (validItems.length > 0) return true;
  }

  return hasText(cv.experience);
}

function hasValidEducation(cv) {
  if (Array.isArray(cv.educations)) {
    const validItems = cv.educations.filter(
      (item) =>
        hasText(item.degree) ||
        hasText(item.institution) ||
        hasText(item.location) ||
        hasText(item.startDate) ||
        hasText(item.endDate) ||
        hasText(item.description)
    );

    if (validItems.length > 0) return true;
  }

  return hasText(cv.education);
}

function hasValidProjects(cv) {
  if (Array.isArray(cv.projectsList)) {
    const validItems = cv.projectsList.filter(
      (item) =>
        hasText(item.title) ||
        hasText(item.role) ||
        hasText(item.technologies) ||
        hasText(item.date) ||
        hasText(item.description)
    );

    if (validItems.length > 0) return true;
  }

  return hasText(cv.projects);
}

function hasValidCertifications(cv) {
  if (Array.isArray(cv.certificationsList)) {
    const validItems = cv.certificationsList.filter(
      (item) => hasText(item.name) || hasText(item.issuer) || hasText(item.date)
    );

    if (validItems.length > 0) return true;
  }

  return hasList(cv.certifications);
}