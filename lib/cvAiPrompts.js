export function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function stripHtml(value) {
  return cleanText(value).replace(/<[^>]*>/g, "").trim();
}

export function getProfessionalTitle(cv = {}) {
  return (
    cleanText(cv.professionalTitle) ||
    cleanText(cv.targetTitle) ||
    cleanText(cv.expTitle) ||
    cleanText(cv.jobTitle) ||
    cleanText(cv.title) ||
    cleanText(cv.experiences?.[0]?.jobTitle) ||
    "Professional"
  );
}

function getRoleGuidance(title = "") {
  const t = title.toLowerCase();

  if (t.includes("ceo") || t.includes("chief executive")) {
    return "Focus on executive leadership, strategy, governance, growth, P&L ownership, stakeholder management, transformation, partnerships, and business performance.";
  }

  if (t.includes("operation")) {
    return "Focus on operations management, workflow improvement, SOPs, reporting, team coordination, vendor/client handling, efficiency, compliance, and process control.";
  }

  if (t.includes("project")) {
    return "Focus on project planning, delivery, timelines, budgets, stakeholder communication, risk control, Agile/Waterfall coordination, and measurable outcomes.";
  }

  if (t.includes("manager")) {
    return "Focus on team leadership, planning, performance tracking, reporting, process improvement, communication, and measurable business results.";
  }

  return "Tailor the content to the professional title, using realistic responsibilities, relevant keywords, and ATS-friendly language.";
}

export function buildCvContext(cv = {}) {
  const title = getProfessionalTitle(cv);

  return {
    professionalTitle: title,
    roleGuidance: getRoleGuidance(title),
    fullName: cleanText(cv.fullName),
    location: cleanText(cv.location),
    skills: Array.isArray(cv.skills)
      ? cv.skills.join(", ")
      : cleanText(cv.skills),
    languages: Array.isArray(cv.languages)
      ? cv.languages.join(", ")
      : cleanText(cv.languages),
    company: cleanText(cv.company) || cleanText(cv.experiences?.[0]?.company),
    startDate:
      cleanText(cv.startDate) || cleanText(cv.experiences?.[0]?.startDate),
    endDate:
      cleanText(cv.endDate) || cleanText(cv.experiences?.[0]?.endDate),
    responsibilities: stripHtml(
      cv.responsibilities ||
        cv.description ||
        cv.experiences?.[0]?.description
    ),
    summary: stripHtml(cv.summary || cv.currentSummary),
  };
}

export function getAiPrompt({ type, cv }) {
  const c = buildCvContext(cv);

  const baseRules = `
You are an expert CV writer.
Write ATS-friendly, realistic, human CV content.
Do not invent fake companies, degrees, certifications, dates, or personal facts.
Use the professional title as the main targeting signal.
Return clean HTML only.
Allowed tags: <p>, <strong>, <em>, <ul>, <ol>, <li>, <br>.
No markdown. No explanations.

Professional Title: ${c.professionalTitle}
Role Guidance: ${c.roleGuidance}
Skills: ${c.skills || "Not provided"}
Location: ${c.location || "Not provided"}
`;

  if (type === "summary") {
    return `${baseRules}

Task: Generate ONLY a Professional Summary.

Rules:
- Write one short professional summary paragraph.
- Do not write responsibilities.
- Do not use bullet points.
- Do not mention company name unless provided.
- Focus on career profile, strengths, expertise, and professional value.

Existing Summary: ${c.summary || "Not provided"}

Output format:
<p>...</p>`;
  }

  if (type === "responsibilities") {
    return `${baseRules}

Task: Generate ONLY Work Experience Responsibilities.

Rules:
- Do not write a professional summary.
- Do not write an introduction paragraph.
- Do not say "experienced professional".
- Write practical job duties for this role.
- Use strong action verbs.
- Make each bullet different.
- Keep bullets realistic and CV-friendly.

Company: ${c.company || "Not provided"}
Dates: ${c.startDate || "Not provided"} - ${c.endDate || "Not provided"}
Existing Responsibilities: ${c.responsibilities || "Not provided"}

Output format:
<ul>
  <li>...</li>
  <li>...</li>
  <li>...</li>
  <li>...</li>
</ul>`;
  }

  if (type === "achievement") {
    return `${baseRules}

Task: Generate ONLY CV achievements.

Rules:
- Do not write a professional summary.
- Use measurable achievement style where possible.
- Keep achievements realistic.
- Return 3 to 5 bullet points.

Output format:
<ul>
  <li>...</li>
</ul>`;
  }

  if (type === "skills") {
    return `${baseRules}

Task: Generate ONLY relevant CV skills.

Rules:
- Do not write summary.
- Do not write responsibilities.
- Return skill keywords only.
- Use ATS-friendly skills for this professional title.

Output format:
<ul>
  <li>...</li>
</ul>`;
  }

  return `${baseRules}

Task: Improve this CV section: ${type}.

Rules:
- Do not copy the professional summary unless the requested section is summary.
- Keep the output specific to the requested section.

Output: clean professional HTML.`;
}