import { cvTemplates } from "@/lib/data";

function Tiny({ title, value, accent = "#111" }) {
  return (
    <section>
      <p
        className="text-[8px] font-black uppercase tracking-widest"
        style={{ color: accent }}
      >
        {title}
      </p>
      <p className="mt-1 whitespace-pre-line text-[7px] leading-3 text-black/65">
        {value}
      </p>
    </section>
  );
}

function CardTiny({ title, value, accent }) {
  return (
    <section className="rounded-xl bg-qorliqCream p-2">
      <p
        className="text-[7px] font-black uppercase tracking-widest"
        style={{ color: accent }}
      >
        {title}
      </p>
      <p className="mt-1 whitespace-pre-line text-[7px] leading-3 text-black/60">
        {value}
      </p>
    </section>
  );
}

function ClassicTiny({ title, value, accent }) {
  return (
    <section>
      <p
        className="border-b pb-1 font-serif text-[9px] font-bold"
        style={{ borderColor: `${accent}66`, color: accent }}
      >
        {title}
      </p>
      <p className="mt-1 whitespace-pre-line text-[7px] leading-3 text-black/65">
        {value}
      </p>
    </section>
  );
}

function SkillPill({ children, accent }) {
  return (
    <span
      className="rounded-full px-2 py-1 text-[6px] font-bold text-white"
      style={{ backgroundColor: accent }}
    >
      {children}
    </span>
  );
}

export default function TemplatePreview({
  template,
  selected = false,
  onClick,
  dark = true,
}) {
  const demo = {
    name: "Amelia Carter",
    role: "Marketing Executive",
    email: "amelia@email.com",
    phone: "+44 7700 000000",
    location: "London, UK",
    profile:
      "Commercially focused professional with strong communication, service and reporting experience.",
    experience:
      "Business Support Executive\n2021–Present\n• Managed customer records\n• Supported admin systems\n• Improved reporting process",
    skills: "Communication · MS Office · CRM",
    education: "BA Business Management",
    projects: "Customer dashboard improvement project",
    certifications: "Google Digital Marketing Certificate",
    languages: "English · Arabic",
    research: "Published research on workplace productivity",
    clinical: "Patient care · Ward support · Clinical records",
    trade: "Inventory handling · Safety checks · Equipment use",
  };

  const accent = template.accent || "#111827";
  const layout = template.layout;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.7rem] border p-4 text-left transition hover:-translate-y-1 ${
        selected
          ? "border-qorliqGold bg-qorliqGold/15"
          : dark
          ? "border-white/10 bg-black/20 hover:border-white/30"
          : "border-black/10 bg-white"
      }`}
    >
      <div className="min-h-[280px] overflow-hidden rounded-2xl bg-white text-black shadow-xl">
        {/* ATS PROFESSIONAL */}
        {layout === "ats" && (
          <div className="p-5">
            <div className="border-b pb-3" style={{ borderColor: accent }}>
              <h4 className="text-base font-black uppercase tracking-tight">
                {demo.name}
              </h4>
              <p className="mt-1 text-[8px] font-bold" style={{ color: accent }}>
                {demo.role}
              </p>
              <p className="mt-1 text-[7px] text-black/50">
                {demo.email} · {demo.phone} · {demo.location}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <Tiny title="Professional Summary" value={demo.profile} accent={accent} />
              <Tiny title="Work Experience" value={demo.experience} accent={accent} />
              <Tiny title="Core Skills" value={demo.skills} accent={accent} />
              <Tiny title="Education" value={demo.education} accent={accent} />
            </div>
          </div>
        )}

        {/* MODERN STANDARD */}
        {layout === "modern" && (
          <div className="grid min-h-[280px] grid-cols-[0.38fr_0.62fr]">
            <aside className="p-4 text-white" style={{ backgroundColor: accent }}>
              <div className="mb-3 h-12 w-12 rounded-full bg-white/80" />
              <p className="text-[11px] font-black leading-tight">{demo.name}</p>
              <p className="mt-1 text-[8px] text-white/75">{demo.role}</p>

              <p className="mt-4 text-[7px] leading-3 text-white/65">
                {demo.email}
                <br />
                {demo.phone}
                <br />
                {demo.location}
              </p>

              <div className="mt-4 border-t border-white/20 pt-3 text-[7px] leading-3 text-white/75">
                {demo.skills}
              </div>
            </aside>

            <main className="space-y-3 p-4">
              <Tiny title="Profile" value={demo.profile} />
              <Tiny title="Experience" value={demo.experience} />
              <Tiny title="Education" value={demo.education} />
              <Tiny title="Certificates" value={demo.certifications} />
            </main>
          </div>
        )}

        {/* EXECUTIVE PREMIUM */}
        {layout === "executive" && (
          <div>
            <div className="bg-black p-5 text-white">
              <p
                className="text-[7px] font-black uppercase tracking-[0.25em]"
                style={{ color: accent }}
              >
                Executive Curriculum Vitae
              </p>
              <h4 className="mt-2 text-lg font-black">{demo.name}</h4>
              <p className="text-[8px] text-white/70">{demo.role}</p>
            </div>

            <div className="grid grid-cols-[0.35fr_0.65fr] gap-4 p-4">
              <aside className="space-y-3">
                <Tiny title="Contact" value={`${demo.email}\n${demo.phone}`} accent={accent} />
                <Tiny title="Leadership" value="Operations · Strategy · Teams" accent={accent} />
                <Tiny title="Education" value={demo.education} accent={accent} />
              </aside>
              <main className="space-y-3">
                <Tiny title="Executive Profile" value={demo.profile} accent={accent} />
                <Tiny title="Career Experience" value={demo.experience} accent={accent} />
                <Tiny title="Key Achievements" value="Improved service process and reporting quality." accent={accent} />
              </main>
            </div>
          </div>
        )}

        {/* CREATIVE DESIGNER */}
        {layout === "creative" && (
          <div className="p-4">
            <div
              className="grid grid-cols-[0.35fr_0.65fr] gap-3 rounded-xl p-3"
              style={{ backgroundColor: `${accent}18` }}
            >
              <div className="h-14 w-14 rounded-2xl bg-white shadow" />
              <div>
                <p
                  className="text-[7px] font-black uppercase tracking-widest"
                  style={{ color: accent }}
                >
                  Creative Portfolio CV
                </p>
                <h4 className="mt-1 text-sm font-black">{demo.name}</h4>
                <p className="text-[8px] font-bold" style={{ color: accent }}>
                  {demo.role}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <CardTiny title="Profile" value={demo.profile} accent={accent} />
              <CardTiny title="Experience" value={demo.experience} accent={accent} />
              <CardTiny title="Portfolio" value={demo.projects} accent={accent} />
              <CardTiny title="Skills" value={demo.skills} accent={accent} />
            </div>
          </div>
        )}

        {/* STUDENT / GRADUATE */}
        {layout === "student" && (
          <div className="p-5">
            <div className="rounded-2xl p-4" style={{ backgroundColor: `${accent}15` }}>
              <h4 className="text-base font-black">{demo.name}</h4>
              <p className="text-[8px] font-bold" style={{ color: accent }}>
                Fresh Graduate
              </p>
              <p className="mt-1 text-[7px] text-black/50">
                {demo.email} · {demo.phone}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <Tiny title="Career Objective" value={demo.profile} accent={accent} />
              <Tiny title="Education" value={demo.education} accent={accent} />
              <Tiny title="Projects" value={demo.projects} accent={accent} />
              <Tiny title="Skills" value={demo.skills} accent={accent} />
              <Tiny title="Certificates" value={demo.certifications} accent={accent} />
            </div>
          </div>
        )}

        {/* TECHNICAL / IT */}
        {layout === "technical" && (
          <div>
            <div className="p-4 text-white" style={{ backgroundColor: accent }}>
              <p className="text-[7px] font-black uppercase tracking-[0.25em] text-white/70">
                Technical CV
              </p>
              <h4 className="mt-2 text-base font-black">{demo.name}</h4>
              <p className="text-[8px] text-white/75">Software / IT Professional</p>
            </div>

            <div className="p-4">
              <div className="mb-3 flex flex-wrap gap-1.5">
                <SkillPill accent={accent}>React</SkillPill>
                <SkillPill accent={accent}>Next.js</SkillPill>
                <SkillPill accent={accent}>MongoDB</SkillPill>
                <SkillPill accent={accent}>API</SkillPill>
              </div>

              <div className="space-y-3">
                <Tiny title="Technical Profile" value={demo.profile} accent={accent} />
                <Tiny title="Projects" value={demo.projects} accent={accent} />
                <Tiny title="Experience" value={demo.experience} accent={accent} />
                <Tiny title="Certifications" value={demo.certifications} accent={accent} />
              </div>
            </div>
          </div>
        )}

        {/* ACADEMIC / RESEARCH */}
        {layout === "academic" && (
          <div className="p-5 text-center">
            <h4 className="font-serif text-base font-bold">{demo.name}</h4>
            <p
              className="mt-1 text-[8px] font-bold uppercase tracking-widest"
              style={{ color: accent }}
            >
              Academic Curriculum Vitae
            </p>
            <p className="mt-1 text-[7px] text-black/45">
              {demo.email} · {demo.phone}
            </p>

            <div className="mt-4 space-y-3 text-left">
              <ClassicTiny title="Profile" value={demo.profile} accent={accent} />
              <ClassicTiny title="Education" value={demo.education} accent={accent} />
              <ClassicTiny title="Research" value={demo.research} accent={accent} />
              <ClassicTiny title="Teaching Experience" value={demo.experience} accent={accent} />
              <ClassicTiny title="Publications" value="Workplace productivity research paper" accent={accent} />
            </div>
          </div>
        )}

        {/* HEALTHCARE */}
        {layout === "healthcare" && (
          <div className="grid min-h-[280px] grid-cols-[0.34fr_0.66fr]">
            <aside className="p-4 text-white" style={{ backgroundColor: accent }}>
              <div className="mb-3 h-12 w-12 rounded-full bg-white/85" />
              <p className="text-[10px] font-black">{demo.name}</p>
              <p className="mt-1 text-[7px] text-white/75">Healthcare Professional</p>

              <div className="mt-4 space-y-3 text-[7px] leading-3 text-white/70">
                <p>{demo.email}</p>
                <p>{demo.phone}</p>
                <p>{demo.languages}</p>
              </div>
            </aside>

            <main className="space-y-3 p-4">
              <Tiny title="Healthcare Profile" value={demo.profile} />
              <Tiny title="Clinical Skills" value={demo.clinical} />
              <Tiny title="Experience" value={demo.experience} />
              <Tiny title="Certifications" value="First Aid · Patient Care · Safeguarding" />
              <Tiny title="Education" value={demo.education} />
            </main>
          </div>
        )}

        {/* SKILLED WORKER / TRADE */}
        {layout === "trade" && (
          <div>
            <div className="p-4" style={{ backgroundColor: `${accent}20` }}>
              <p className="text-[7px] font-black uppercase tracking-widest text-black/50">
                Skilled Worker CV
              </p>
              <h4 className="mt-2 text-base font-black">{demo.name}</h4>
              <p className="text-[8px] font-bold" style={{ color: accent }}>
                Warehouse / Trade Professional
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4">
              <Tiny title="Profile" value={demo.profile} accent={accent} />
              <Tiny title="Key Skills" value={demo.trade} accent={accent} />
              <Tiny title="Experience" value={demo.experience} accent={accent} />
              <Tiny title="Licences" value="Driving Licence · Safety Training" accent={accent} />
              <Tiny title="Education" value={demo.education} accent={accent} />
              <Tiny title="Availability" value="Full-time · Immediate start" accent={accent} />
            </div>
          </div>
        )}

        {/* EUROPASS STYLE */}
        {layout === "europass" && (
          <div className="p-5">
            <div className="flex items-start gap-3 border-b pb-3">
              <div
                className="h-12 w-12 rounded-lg"
                style={{ backgroundColor: `${accent}25` }}
              />
              <div>
                <p
                  className="text-[7px] font-black uppercase tracking-[0.22em]"
                  style={{ color: accent }}
                >
                  Europass Style CV
                </p>
                <h4 className="mt-1 text-base font-black">{demo.name}</h4>
                <p className="text-[8px] text-black/55">{demo.role}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Tiny title="Personal Information" value={`${demo.email}\n${demo.phone}\n${demo.location}`} accent={accent} />
              <Tiny title="Work Experience" value={demo.experience} accent={accent} />
              <Tiny title="Education and Training" value={demo.education} accent={accent} />
              <Tiny title="Language Skills" value={demo.languages} accent={accent} />
              <Tiny title="Digital Skills" value={demo.skills} accent={accent} />
            </div>
          </div>
        )}
      </div>

      <p
        className={`mt-4 text-sm font-black ${
          dark ? "text-white" : "text-black"
        }`}
      >
        {template.name}
      </p>

      <p
        className={`mt-1 text-xs leading-5 ${
          dark ? "text-white/45" : "text-black/45"
        }`}
      >
        {template.industry}
      </p>

      <p
        className={`mt-1 text-[11px] leading-5 ${
          dark ? "text-white/35" : "text-black/45"
        }`}
      >
        {template.description}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-qorliqGold">
          Demo only
        </p>

        <span className="rounded-full bg-qorliqGold px-2.5 py-1 text-[10px] font-black text-black">
          ATS {template.score}%+
        </span>
      </div>
    </button>
  );
}