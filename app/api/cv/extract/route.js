import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { createRequire } from "module";
import { writeFile, unlink } from "fs/promises";
import os from "os";
import path from "path";
import { recognize } from "tesseract.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const require = createRequire(import.meta.url);
const PDFParser = require("pdf2json");
const WordExtractor = require("word-extractor");

const MAX_FILE_SIZE = 15 * 1024 * 1024;

/* =========================================================
   TEXT CLEANING
========================================================= */

function esc(text = "") {
  return String(text).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function cleanSpaces(text = "") {
  return String(text)
    .replace(/\u0000/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n[ ]+/g, "\n")
    .replace(/[ ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanSingleLine(text = "") {
  return cleanSpaces(text)
    .replace(/\n+/g, " ")
    .trim();
}

function stripBullet(value = "") {
  return cleanSingleLine(value).replace(
    /^[-•▪◦●○■□✓✔➤➢→]+\s*/,
    ""
  );
}

function safeDecodePdfText(value) {
  const input = String(value ?? "");

  if (!input) return "";

  try {
    return decodeURIComponent(input);
  } catch {
    try {
      return input.replace(
        /(?:%[0-9a-fA-F]{2})+/g,
        (encodedPart) => {
          const hexValues =
            encodedPart.match(
              /[0-9a-fA-F]{2}/g
            ) || [];

          const bytes =
            Uint8Array.from(
              hexValues.map((hex) =>
                Number.parseInt(
                  hex,
                  16
                )
              )
            );

          return new TextDecoder(
            "utf-8",
            {
              fatal: false,
            }
          ).decode(bytes);
        }
      );
    } catch {
      return input;
    }
  }
}

function normalizeHeading(
  value = ""
) {
  return cleanSingleLine(value)
    .toLowerCase()
    .replace(/[:\-–—|]+$/g, "")
    .replace(
      /[^a-z0-9& ]/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueList(
  values = [],
  limit = 30
) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const item =
      stripBullet(value);

    const key =
      item.toLowerCase();

    if (
      !item ||
      item.length < 2 ||
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);
    result.push(item);

    if (
      result.length >= limit
    ) {
      break;
    }
  }

  return result;
}

function splitDelimitedRespectingBrackets(
  text = "",
  limit = 50
) {
  const input =
    cleanSpaces(text);

  const result = [];

  let current = "";
  let roundDepth = 0;
  let squareDepth = 0;
  let curlyDepth = 0;

  const pushCurrent = () => {
    const value =
      stripBullet(current);

    if (value) {
      result.push(value);
    }

    current = "";
  };

  for (
    let index = 0;
    index < input.length;
    index += 1
  ) {
    const char =
      input[index];

    if (char === "(") {
      roundDepth += 1;
    }

    if (
      char === ")" &&
      roundDepth > 0
    ) {
      roundDepth -= 1;
    }

    if (char === "[") {
      squareDepth += 1;
    }

    if (
      char === "]" &&
      squareDepth > 0
    ) {
      squareDepth -= 1;
    }

    if (char === "{") {
      curlyDepth += 1;
    }

    if (
      char === "}" &&
      curlyDepth > 0
    ) {
      curlyDepth -= 1;
    }

    const outsideBrackets =
      roundDepth === 0 &&
      squareDepth === 0 &&
      curlyDepth === 0;

    const isDelimiter =
      outsideBrackets &&
      [
        "\n",
        ",",
        ";",
        "|",
        "•",
        "▪",
        "◦",
        "●",
        "■",
      ].includes(char);

    if (isDelimiter) {
      pushCurrent();

      if (
        result.length >= limit
      ) {
        break;
      }

      continue;
    }

    current += char;
  }

  if (
    result.length < limit
  ) {
    pushCurrent();
  }

  return uniqueList(
    result,
    limit
  );
}

function splitList(
  text = "",
  limit = 30
) {
  return splitDelimitedRespectingBrackets(
    text,
    limit
  );
}

/* =========================================================
   SECTION HEADINGS
========================================================= */

const SECTION_ALIASES = {
  personal: [
    "personal details",
    "personal information",
    "personal particulars",
    "personal data",
    "bio data",
    "biodata",
  ],

  summary: [
    "professional summary",
    "personal profile",
    "career profile",
    "executive profile",
    "profile summary",
    "profile",
    "summary",
    "objective",
    "career objective",
    "professional objective",
    "about me",
  ],

  experience: [
    "work experience",
    "employment history",
    "professional experience",
    "career history",
    "work history",
    "employment experience",
    "experience",
  ],

  education: [
    "education",
    "academic history",
    "academic background",
    "educational background",
    "education and qualifications",
    "academic qualifications",
    "qualifications",
  ],

  skills: [
    "skills",
    "key skills",
    "core skills",
    "technical skills",
    "professional skills",
    "computer skills",
    "it skills",
    "soft skills",
    "competencies",
    "core competencies",
    "areas of expertise",
    "expertise",
  ],

  languages: [
    "languages",
    "language",
    "language skills",
  ],

  certifications: [
    "certifications",
    "certificates",
    "courses and certifications",
    "professional certifications",
    "training and certifications",
    "licenses and certifications",
    "training",
  ],

  projects: [
    "projects",
    "professional projects",
    "key projects",
  ],

  achievements: [
    "achievements",
    "career achievements",
    "key achievements",
    "accomplishments",
    "key accomplishments",
    "awards",
    "honours",
    "honors",
    "awards and achievements",
    "awards and honors",
  ],

  strengths: [
    "strengths",
    "key strengths",
    "professional strengths",
    "personal strengths",
    "qualities",
    "personal qualities",
  ],

  hobbies: [
    "hobbies",
    "interests",
    "hobbies and interests",
    "interests and activities",
    "activities and interests",
    "personal interests",
    "areas of interest",
    "leisure interests",
    "extracurricular activities",
  ],

  references: [
    "references",
    "reference",
    "professional references",
    "referees",
  ],
};

const HEADING_ENTRIES =
  Object.entries(
    SECTION_ALIASES
  )
    .flatMap(
      ([section, aliases]) =>
        aliases.map((alias) => ({
          section,
          alias,
          normalized:
            normalizeHeading(alias),
        }))
    )
    .sort(
      (a, b) =>
        b.alias.length -
        a.alias.length
    );

const SAFE_INLINE_SINGLE_WORD_HEADINGS =
  new Set([
    "skills",
    "languages",
    "certifications",
    "projects",
    "achievements",
    "strengths",
    "hobbies",
    "interests",
    "references",
    "reference",
    "referees",
    "education",
    "qualifications",
    "training",
  ]);

function detectSectionHeading(
  line = ""
) {
  const original =
    cleanSingleLine(line);

  if (!original) {
    return null;
  }

  const normalizedLine =
    normalizeHeading(
      original
    );

  for (
    const entry
    of HEADING_ENTRIES
  ) {
    if (
      normalizedLine ===
      entry.normalized
    ) {
      return {
        section:
          entry.section,

        remainingText: "",
      };
    }

    const flexibleAlias =
      entry.alias
        .split(/\s+/)
        .map((word) =>
          esc(word)
        )
        .join("\\s+");

    const punctuatedMatch =
      original.match(
        new RegExp(
          `^\\s*${flexibleAlias}\\s*[:|\\-–—]\\s*(.+)$`,
          "i"
        )
      );

    if (punctuatedMatch) {
      return {
        section:
          entry.section,

        remainingText:
          cleanSingleLine(
            punctuatedMatch[1]
          ),
      };
    }

    const canBeInline =
      entry.alias.includes(" ") ||
      SAFE_INLINE_SINGLE_WORD_HEADINGS.has(
        entry.normalized
      );

    if (canBeInline) {
      const plainMatch =
        original.match(
          new RegExp(
            `^\\s*${flexibleAlias}\\s+(.+)$`,
            "i"
          )
        );

      if (plainMatch) {
        const remainder =
          cleanSingleLine(
            plainMatch[1]
          );

        if (
          remainder &&
          !/^(in|of|with|using|for|at|from|includes?|including)\b/i.test(
            remainder
          )
        ) {
          return {
            section:
              entry.section,

            remainingText:
              remainder,
          };
        }
      }
    }
  }

  return null;
}

function splitEmbeddedHeadingLine(
  line = ""
) {
  const original =
    cleanSingleLine(line);

  if (!original) {
    return [];
  }

  const positions = [];

  for (
    const entry
    of HEADING_ENTRIES
  ) {
    const flexibleAlias =
      entry.alias
        .split(/\s+/)
        .map((word) =>
          esc(word)
        )
        .join("\\s+");

    const regex =
      new RegExp(
        `(?:^|\\s[|•▪◦●■]\\s*|\\s)(${flexibleAlias})\\s*[:|\\-–—]\\s*`,
        "ig"
      );

    let match;

    while (
      (
        match =
          regex.exec(original)
      ) !== null
    ) {
      const aliasStart =
        match.index +
        match[0].lastIndexOf(
          match[1]
        );

      if (aliasStart > 0) {
        positions.push(
          aliasStart
        );
      }
    }
  }

  const sortedPositions = [
    ...new Set(
      positions
    ),
  ].sort(
    (a, b) => a - b
  );

  if (
    !sortedPositions.length
  ) {
    return [original];
  }

  const parts = [];
  let start = 0;

  for (
    const position
    of sortedPositions
  ) {
    const previousPart =
      cleanSingleLine(
        original.slice(
          start,
          position
        )
      );

    if (previousPart) {
      parts.push(
        previousPart
      );
    }

    start = position;
  }

  const lastPart =
    cleanSingleLine(
      original.slice(start)
    );

  if (lastPart) {
    parts.push(lastPart);
  }

  return parts;
}

function splitIntoSections(
  text = ""
) {
  const sections = {
    preamble: [],
    personal: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
    achievements: [],
    strengths: [],
    hobbies: [],
    references: [],
  };

  let currentSection =
    "preamble";

  const lines =
    cleanSpaces(text)
      .split("\n")
      .map((line) =>
        cleanSingleLine(line)
      )
      .filter(Boolean)
      .flatMap((line) =>
        detectSectionHeading(line)
          ? [line]
          : splitEmbeddedHeadingLine(
              line
            )
      );

  for (const line of lines) {
    const heading =
      detectSectionHeading(
        line
      );

    if (heading) {
      currentSection =
        heading.section;

      if (
        heading.remainingText
      ) {
        sections[
          currentSection
        ].push(
          heading.remainingText
        );
      }

      continue;
    }

    sections[
      currentSection
    ].push(line);
  }

  return sections;
}

/* =========================================================
   PERSONAL DETAILS
========================================================= */

const PERSONAL_LABEL_GROUPS = {
  fullName: [
    "full name",
    "candidate name",
    "applicant name",
    "name",
  ],

  jobTitle: [
    "job title",
    "professional title",
    "designation",
    "position",
    "profession",
  ],

  fatherName: [
    "father's name",
    "fathers name",
    "father name",
    "s/o",
    "son of",
    "daughter of",
    "d/o",
  ],

  dateOfBirth: [
    "date of birth",
    "birth date",
    "dob",
    "d.o.b",
  ],

  cnic: [
    "cnic no",
    "cnic number",
    "cnic",
    "nic no",
    "nic number",
    "national identity card",
  ],

  gender: [
    "gender",
    "sex",
  ],

  nationality: [
    "nationality",
    "citizenship",
  ],

  religion: [
    "religion",
    "faith",
  ],

  maritalStatus: [
    "marital status",
    "civil status",
  ],

  location: [
    "current address",
    "permanent address",
    "residential address",
    "postal address",
    "address",
    "location",
    "city",
  ],

  phone: [
    "phone number",
    "mobile number",
    "contact number",
    "telephone",
    "phone",
    "mobile",
    "contact",
    "tel",
  ],

  email: [
    "email address",
    "e-mail",
    "email",
  ],
};

const ALL_PERSONAL_LABELS =
  Object.values(
    PERSONAL_LABEL_GROUPS
  ).flat();

function looksLikeKnownLabel(
  line = ""
) {
  const normalized =
    normalizeHeading(line);

  if (!normalized) {
    return false;
  }

  return ALL_PERSONAL_LABELS.some(
    (label) => {
      const normalizedLabel =
        normalizeHeading(
          label
        );

      return (
        normalized ===
          normalizedLabel ||
        normalized.startsWith(
          `${normalizedLabel} `
        )
      );
    }
  );
}

function findLabelMatch(
  line = "",
  label = ""
) {
  const flexibleLabel =
    label
      .split(/\s+/)
      .map((word) =>
        esc(word)
      )
      .join("\\s+");

  return line.match(
    new RegExp(
      `(?:^|[|•▪◦●■]\\s*|\\s+)${flexibleLabel}\\s*(?:[:=\\-–—]|\\bis\\b)?\\s*(.*)$`,
      "i"
    )
  );
}

function trimAtNextPersonalLabel(
  value = ""
) {
  const input =
    cleanSingleLine(value);

  let earliestIndex =
    input.length;

  for (
    const label
    of ALL_PERSONAL_LABELS
  ) {
    const flexibleLabel =
      label
        .split(/\s+/)
        .map((word) =>
          esc(word)
        )
        .join("\\s+");

    const match =
      input.match(
        new RegExp(
          `\\s+(?:${flexibleLabel})\\s*(?:[:=\\-–—]|\\bis\\b)`,
          "i"
        )
      );

    if (
      match &&
      match.index <
        earliestIndex
    ) {
      earliestIndex =
        match.index;
    }
  }

  return cleanSingleLine(
    input.slice(
      0,
      earliestIndex
    )
  );
}

function extractLabeledValue(
  text = "",
  labels = []
) {
  const lines =
    cleanSpaces(text)
      .split("\n")
      .map((line) =>
        cleanSingleLine(line)
      )
      .filter(Boolean);

  const sortedLabels = [
    ...labels,
  ].sort(
    (a, b) =>
      b.length - a.length
  );

  for (
    let lineIndex = 0;
    lineIndex < lines.length;
    lineIndex += 1
  ) {
    const line =
      lines[lineIndex];

    for (
      const label
      of sortedLabels
    ) {
      const match =
        findLabelMatch(
          line,
          label
        );

      if (!match) {
        continue;
      }

      const sameLineValue =
        trimAtNextPersonalLabel(
          match[1]
        );

      if (
        sameLineValue &&
        !looksLikeKnownLabel(
          sameLineValue
        )
      ) {
        return sameLineValue;
      }

      const nextLine =
        cleanSingleLine(
          lines[
            lineIndex + 1
          ] || ""
        );

      if (
        nextLine &&
        !looksLikeKnownLabel(
          nextLine
        ) &&
        !detectSectionHeading(
          nextLine
        )
      ) {
        return nextLine;
      }
    }
  }

  return "";
}

function digitsOnly(
  value = ""
) {
  return String(value)
    .replace(/\D/g, "");
}

function normalizeCnic(
  value = ""
) {
  const digits =
    digitsOnly(value);

  if (
    digits.length === 13
  ) {
    return (
      `${digits.slice(0, 5)}-` +
      `${digits.slice(5, 12)}-` +
      digits.slice(12)
    );
  }

  return cleanSingleLine(
    value
  );
}

function extractCnic(
  text = ""
) {
  const labeledValue =
    extractLabeledValue(
      text,
      PERSONAL_LABEL_GROUPS.cnic
    );

  const source =
    labeledValue || text;

  const match =
    String(source).match(
      /\b\d{5}[\s-]?\d{7}[\s-]?\d\b/
    );

  return match
    ? normalizeCnic(
        match[0]
      )
    : "";
}

function extractDateOfBirth(
  text = ""
) {
  const labeledValue =
    extractLabeledValue(
      text,
      PERSONAL_LABEL_GROUPS.dateOfBirth
    );

  if (!labeledValue) {
    return "";
  }

  const match =
    labeledValue.match(
      /\b(?:\d{1,2}[\/.\-]\d{1,2}[\/.\-](?:19|20)?\d{2}|\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(?:19|20)\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+(?:19|20)\d{2})\b/i
    );

  return cleanSingleLine(
    match?.[0] ||
      labeledValue
  );
}

function extractEnumValue(
  text = "",
  labels = [],
  allowedValues = []
) {
  const labeledValue =
    extractLabeledValue(
      text,
      labels
    );

  if (!labeledValue) {
    return "";
  }

  const found =
    allowedValues.find(
      (value) =>
        new RegExp(
          `\\b${esc(value)}\\b`,
          "i"
        ).test(
          labeledValue
        )
    );

  return (
    found ||
    cleanSingleLine(
      labeledValue
    )
  );
}

function extractPersonalDetails(
  text = "",
  personalSection = ""
) {
  const source =
    cleanSpaces(
      [
        personalSection,
        text,
      ]
        .filter(Boolean)
        .join("\n")
    );

  return {
    fatherName:
      extractLabeledValue(
        source,
        PERSONAL_LABEL_GROUPS.fatherName
      ),

    dateOfBirth:
      extractDateOfBirth(
        source
      ),

    cnic:
      extractCnic(source),

    gender:
      extractEnumValue(
        source,
        PERSONAL_LABEL_GROUPS.gender,
        [
          "Male",
          "Female",
          "Other",
        ]
      ),

    nationality:
      extractLabeledValue(
        source,
        PERSONAL_LABEL_GROUPS.nationality
      ),

    religion:
      extractLabeledValue(
        source,
        PERSONAL_LABEL_GROUPS.religion
      ),

    maritalStatus:
      extractEnumValue(
        source,
        PERSONAL_LABEL_GROUPS.maritalStatus,
        [
          "Single",
          "Married",
          "Divorced",
          "Widowed",
          "Separated",
        ]
      ),
  };
}

function isCnicLike(
  value = "",
  cnic = ""
) {
  const digits =
    digitsOnly(value);

  const cnicDigits =
    digitsOnly(cnic);

  return (
    digits.length === 13 ||
    Boolean(
      cnicDigits &&
      digits === cnicDigits
    ) ||
    /^\d{13}$/.test(
      digits
    )
  );
}

function extractPhone(
  text = "",
  cnic = ""
) {
  const labeledPhone =
    extractLabeledValue(
      text,
      PERSONAL_LABEL_GROUPS.phone
    );

  const sources = [
    labeledPhone,
    text,
  ].filter(Boolean);

  const candidates = [];

  sources.forEach(
    (
      source,
      sourceIndex
    ) => {
      const matches =
        String(source).match(
          /(?:\+?\d[\d\s().-]{7,}\d)/g
        ) || [];

      matches.forEach(
        (value) => {
          const cleaned =
            cleanSingleLine(
              value
            );

          const digits =
            digitsOnly(
              cleaned
            );

          if (
            digits.length < 9 ||
            digits.length > 15
          ) {
            return;
          }

          if (
            isCnicLike(
              cleaned,
              cnic
            )
          ) {
            return;
          }

          let score = 0;

          if (
            sourceIndex === 0
          ) {
            score += 10;
          }

          if (
            cleaned.startsWith(
              "+"
            )
          ) {
            score += 4;
          }

          if (
            digits.length >= 10 &&
            digits.length <= 12
          ) {
            score += 3;
          }

          if (
            /^0?3\d{9}$/.test(
              digits
            )
          ) {
            score += 4;
          }

          if (
            /^92\d{10}$/.test(
              digits
            )
          ) {
            score += 4;
          }

          candidates.push({
            value: cleaned,
            score,
          });
        }
      );
    }
  );

  candidates.sort(
    (a, b) =>
      b.score - a.score
  );

  return (
    candidates[0]?.value ||
    ""
  );
}

function extractEmail(
  text = ""
) {
  const labeledEmail =
    extractLabeledValue(
      text,
      PERSONAL_LABEL_GROUPS.email
    );

  const source =
    labeledEmail || text;

  const match =
    String(source).match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    );

  return match?.[0] || "";
}
function cleanLocationValue(
  value = ""
) {
  return cleanSingleLine(value)
    .replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      ""
    )
    .replace(
      /(?:https?:\/\/|www\.)[^\s|,]+/gi,
      ""
    )
    .replace(
      /\b(?:phone|mobile|contact|telephone|tel)\s*[:=.-]?.*$/i,
      ""
    )
    .replace(
      /\b(?:cnic|nic|national identity card)\s*[:=.-]?.*$/i,
      ""
    )
    .replace(
      /^[\s,;|:\-–—]+|[\s,;|:\-–—]+$/g,
      ""
    )
    .trim();
}

function isValidLocation(
  value = ""
) {
  const location =
    cleanLocationValue(value);

  if (
    !location ||
    location.length < 2 ||
    location.length > 180
  ) {
    return false;
  }

  if (
    location.includes("@") ||
    /linkedin\.com/i.test(
      location
    ) ||
    /github\.com/i.test(
      location
    ) ||
    /(?:https?:\/\/|www\.)/i.test(
      location
    )
  ) {
    return false;
  }

  const digits =
    digitsOnly(location);

  if (
    digits.length >= 9 &&
    digits.length <= 15
  ) {
    return false;
  }

  if (
    isCnicLike(location)
  ) {
    return false;
  }

  if (
    detectSectionHeading(
      location
    )
  ) {
    return false;
  }

  return /[a-z]/i.test(
    location
  );
}



/* =========================================================
   DATES AND EXPERIENCE
========================================================= */

function looksLikeDateLine(
  line = ""
) {
  const value =
    cleanSingleLine(line);

  return (
    /\b(?:19|20)\d{2}\b/.test(
      value
    ) ||
    /\b(?:present|current|ongoing|now)\b/i.test(
      value
    ) ||
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\b/i.test(
      value
    )
  );
}

function parseDateAndLocation(
  line = ""
) {
  const parts =
    cleanSingleLine(line)
      .split("|")
      .map((item) =>
        cleanSingleLine(item)
      )
      .filter(Boolean);

  const datePart =
    parts[0] || "";

  const location =
    parts
      .slice(1)
      .join(" | ");

  const dateParts =
    datePart
      .split(
        /\s+-\s+|\s+–\s+|\s+—\s+|\s+to\s+/i
      )
      .map((item) =>
        cleanSingleLine(item)
      )
      .filter(Boolean);

  return {
    startDate:
      dateParts[0] || "",

    endDate:
      dateParts[1] || "",

    location,
  };
}

function parseHeaderParts(
  line = ""
) {
  return cleanSingleLine(line)
    .split(
      /\s+-\s+|\s+–\s+|\s+—\s+|\s+\|\s+/
    )
    .map((item) =>
      cleanSingleLine(item)
    )
    .filter(Boolean);
}

function parseTimedItems(
  sectionText = "",
  type = "experience"
) {
  const lines =
    cleanSpaces(sectionText)
      .split("\n")
      .map((line) =>
        cleanSingleLine(line)
      )
      .filter(Boolean);

  const items = [];
  let index = 0;

  while (
    index < lines.length
  ) {
    const headerLine =
      lines[index] || "";

    const possibleDateLine =
      lines[index + 1] || "";

    if (
      !headerLine ||
      !looksLikeDateLine(
        possibleDateLine
      )
    ) {
      index += 1;
      continue;
    }

    const headerParts =
      parseHeaderParts(
        headerLine
      );

    const dateData =
      parseDateAndLocation(
        possibleDateLine
      );

    let nextItemStart =
      index + 2;

    while (
      nextItemStart <
      lines.length
    ) {
      const followingDateLine =
        lines[
          nextItemStart + 1
        ] || "";

      if (
        followingDateLine &&
        looksLikeDateLine(
          followingDateLine
        )
      ) {
        break;
      }

      nextItemStart += 1;
    }

    const description =
      cleanSpaces(
        lines
          .slice(
            index + 2,
            nextItemStart
          )
          .join("\n")
      );

    if (
      type === "experience"
    ) {
      items.push({
        jobTitle:
          headerParts[0] || "",

        company:
          headerParts
            .slice(1)
            .join(" - ") || "",

        startDate:
          dateData.startDate,

        endDate:
          dateData.endDate,

        location:
          dateData.location,

        description,

        responsibilities:
          description,

        current:
          /present|current|ongoing|now/i.test(
            dateData.endDate
          ),
      });
    }

    index = Math.max(
      nextItemStart,
      index + 2
    );
  }

  if (
    !items.length &&
    lines.length &&
    type === "experience"
  ) {
    const completeText =
      cleanSpaces(
        lines.join("\n")
      );

    items.push({
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      location: "",
      description:
        completeText,

      responsibilities:
        completeText,

      current: false,
    });
  }

  return items;
}

/* =========================================================
   EDUCATION
========================================================= */

const EDUCATION_KEYWORD_REGEX =
  new RegExp(
    [
      "matric(?:ulation)?",
      "secondary school certificate",
      "ssc",
      "o\\s*levels?",
      "intermediate",
      "higher secondary school certificate",
      "hssc",
      "a\\s*levels?",
      "f\\.?s\\.?c",
      "f\\.?a",
      "i\\.?c\\.?s",
      "i\\.?com",
      "diploma",
      "associate degree",
      "bachelor(?:'s)?",
      "master(?:'s)?",
      "doctorate",
      "ph\\.?d",
      "m\\.?phil",
      "mba",
      "bba",
      "bs(?:c)?",
      "ms(?:c)?",
      "b\\.?com",
      "m\\.?com",
      "btech",
      "mtech",
      "degree",
    ].join("|"),
    "i"
  );

function looksLikeEducationStart(
  line = ""
) {
  const value =
    cleanSingleLine(line);

  return Boolean(
    value &&
    EDUCATION_KEYWORD_REGEX.test(
      value
    )
  );
}

function extractDateRangeFromEducation(
  text = ""
) {
  const value =
    cleanSingleLine(text);

  const monthPattern =
    "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";

  const dateToken =
    `(?:${monthPattern}\\s+(?:19|20)\\d{2}|(?:19|20)\\d{2}|present|current|ongoing|now)`;

  const rangeMatch =
    value.match(
      new RegExp(
        `\\b(${dateToken})\\s*(?:-|–|—|to)\\s*(${dateToken})\\b`,
        "i"
      )
    );

  if (rangeMatch) {
    return {
      startDate:
        cleanSingleLine(
          rangeMatch[1]
        ),

      endDate:
        cleanSingleLine(
          rangeMatch[2]
        ),

      matchedText:
        cleanSingleLine(
          rangeMatch[0]
        ),
    };
  }

  const singleMatch =
    value.match(
      new RegExp(
        `\\b(${dateToken})\\b`,
        "i"
      )
    );

  return {
    startDate:
      cleanSingleLine(
        singleMatch?.[1] ||
        ""
      ),

    endDate: "",

    matchedText:
      cleanSingleLine(
        singleMatch?.[0] ||
        ""
      ),
  };
}

function parseEducationBlock(
  blockLines = []
) {
  const lines =
    blockLines
      .map((line) =>
        cleanSingleLine(line)
      )
      .filter(Boolean);

  const combined =
    lines.join(" | ");

  const dateData =
    extractDateRangeFromEducation(
      combined
    );

  const firstLine =
    lines[0] || "";

  const firstLineWithoutDate =
    cleanSingleLine(
      firstLine.replace(
        dateData.matchedText,
        ""
      )
    ).replace(
      /^[|,;\-–—\s]+|[|,;\-–—\s]+$/g,
      ""
    );

  const headerParts =
    parseHeaderParts(
      firstLineWithoutDate
    );

  const degree =
    headerParts[0] ||
    firstLineWithoutDate;

  let institution =
    headerParts
      .slice(1)
      .join(" - ");

  let location = "";

  const descriptionLines = [];

  for (
    let index = 1;
    index < lines.length;
    index += 1
  ) {
    const line =
      lines[index];

    if (
      looksLikeDateLine(
        line
      )
    ) {
      const dateLineData =
        parseDateAndLocation(
          line
        );

      if (
        !location &&
        dateLineData.location
      ) {
        location =
          dateLineData.location;
      }

      continue;
    }

    if (
      dateData.matchedText &&
      line.includes(
        dateData.matchedText
      )
    ) {
      continue;
    }

    const pipeParts =
      line
        .split("|")
        .map((item) =>
          cleanSingleLine(
            item
          )
        )
        .filter(Boolean);

    if (
      !institution &&
      !looksLikeEducationStart(
        line
      )
    ) {
      institution =
        pipeParts[0] ||
        line;

      location =
        pipeParts
          .slice(1)
          .join(" | ");

      continue;
    }

    descriptionLines.push(
      line
    );
  }

  return {
    degree:
      cleanSingleLine(
        degree
      ),

    institution:
      cleanSingleLine(
        institution
      ),

    startDate:
      dateData.startDate,

    endDate:
      dateData.endDate,

    location:
      cleanSingleLine(
        location
      ),

    description:
      cleanSpaces(
        descriptionLines.join(
          "\n"
        )
      ),
  };
}

function parseEducationItems(
  sectionText = ""
) {
  const lines =
    cleanSpaces(
      sectionText
    )
      .split("\n")
      .map((line) =>
        cleanSingleLine(line)
      )
      .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const startIndexes = [];

  lines.forEach(
    (line, index) => {
      if (
        looksLikeEducationStart(
          line
        )
      ) {
        startIndexes.push(
          index
        );
      }
    }
  );

  if (
    !startIndexes.length
  ) {
    lines.forEach(
      (line, index) => {
        const dateData =
          extractDateRangeFromEducation(
            line
          );

        const nextLine =
          lines[
            index + 1
          ] || "";

        if (
          dateData.startDate ||
          looksLikeDateLine(
            nextLine
          )
        ) {
          startIndexes.push(
            index
          );
        }
      }
    );
  }

  const uniqueStarts = [
    ...new Set(
      startIndexes
    ),
  ].sort(
    (a, b) => a - b
  );

  if (
    !uniqueStarts.length
  ) {
    return [
      {
        degree: "",
        institution: "",
        startDate: "",
        endDate: "",
        location: "",

        description:
          cleanSpaces(
            lines.join("\n")
          ),
      },
    ];
  }

  const items = [];

  uniqueStarts.forEach(
    (
      startIndex,
      position
    ) => {
      const endIndex =
        uniqueStarts[
          position + 1
        ] ?? lines.length;

      const block =
        lines.slice(
          startIndex,
          endIndex
        );

      const item =
        parseEducationBlock(
          block
        );

      if (
        item.degree ||
        item.institution ||
        item.startDate ||
        item.endDate ||
        item.description
      ) {
        items.push(item);
      }
    }
  );

  return items;
}

/* =========================================================
   SKILLS, LANGUAGES, CERTIFICATIONS
========================================================= */

function isSkillLevel(
  value = ""
) {
  const normalized =
    cleanSingleLine(value)
      .toLowerCase();

  return (
    /^(beginner|basic|elementary|intermediate|advanced|expert|proficient|professional|excellent|good|very good|native|fluent|working proficiency|limited working proficiency)$/i.test(
      normalized
    ) ||
    /^\d{1,3}%$/.test(
      normalized
    ) ||
    /^[1-5]\s*\/\s*5$/.test(
      normalized
    )
  );
}

function parseSkills(
  text = ""
) {
  const values =
    splitDelimitedRespectingBrackets(
      text,
      50
    );

  const skills = [];
  const skillLevels = [];

  values.forEach(
    (rawItem) => {
      const item =
        stripBullet(
          rawItem
        );

      let skill = item;
      let level = "";

      const bracketMatch =
        item.match(
          /^(.*?)\s*\(([^()]*)\)\s*$/
        );

      if (
        bracketMatch &&
        isSkillLevel(
          bracketMatch[2]
        )
      ) {
        skill =
          cleanSingleLine(
            bracketMatch[1]
          );

        level =
          cleanSingleLine(
            bracketMatch[2]
          );
      } else {
        const separatorMatch =
          item.match(
            /^(.*?)\s*(?:[:|]|\s+-\s+)\s*([^:|]+)$/
          );

        if (
          separatorMatch &&
          isSkillLevel(
            separatorMatch[2]
          )
        ) {
          skill =
            cleanSingleLine(
              separatorMatch[1]
            );

          level =
            cleanSingleLine(
              separatorMatch[2]
            );
        }
      }

      if (skill) {
        skills.push(skill);
        skillLevels.push(
          level
        );
      }
    }
  );

  return {
    skills,
    skillLevels,
  };
}

function parseLanguages(
  text = ""
) {
  const lines =
    uniqueList(
      cleanSpaces(text)
        .split(/\n|,|;/)
        .map((line) =>
          stripBullet(line)
        ),
      20
    );

  const languages = [];
  const languageLevels = [];

  lines.forEach((line) => {
    const parts =
      line
        .split(
          /\s+-\s+|\s+\|\s+|\s*:\s*/
        )
        .map((item) =>
          cleanSingleLine(
            item
          )
        )
        .filter(Boolean);

    languages.push(
      parts[0] || ""
    );

    languageLevels.push(
      parts
        .slice(1)
        .join(" - ")
    );
  });

  return {
    languages,
    languageLevels,
  };
}

function parseCertifications(
  text = ""
) {
  return uniqueList(
    cleanSpaces(text)
      .split("\n")
      .map((line) =>
        stripBullet(line)
      ),
    30
  ).map((line) => {
    const parts =
      line
        .split("|")
        .map((item) =>
          cleanSingleLine(
            item
          )
        )
        .filter(Boolean);

    return {
      name:
        parts[0] || "",

      issuer:
        parts[1] || "",

      date:
        parts[2] || "",
    };
  });
}

/* =========================================================
   PROJECTS AND REFERENCES
========================================================= */

function parseProjects(
  text = ""
) {
  const lines =
    cleanSpaces(text)
      .split("\n")
      .map((line) =>
        cleanSingleLine(line)
      )
      .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const projects = [];
  let current = null;

  const saveCurrent = () => {
    if (!current) {
      return;
    }

    if (
      current.title ||
      current.role ||
      current.date ||
      current.description ||
      current.technologies.length
    ) {
      projects.push(
        current
      );
    }

    current = null;
  };

  lines.forEach((line) => {
    if (
      /^technologies\s*:/i.test(
        line
      )
    ) {
      if (!current) {
        current = {
          title: "",
          role: "",
          date: "",
          technologies: [],
          description: "",
        };
      }

      current.technologies =
        uniqueList(
          line
            .replace(
              /^technologies\s*:/i,
              ""
            )
            .split(",")
            .map((item) =>
              cleanSingleLine(
                item
              )
            ),
          20
        );

      return;
    }

    const parts =
      line
        .split("|")
        .map((item) =>
          cleanSingleLine(
            item
          )
        )
        .filter(Boolean);

    if (
      parts.length >= 2
    ) {
      saveCurrent();

      current = {
        title:
          parts[0] || "",

        role:
          parts[1] || "",

        date:
          parts[2] || "",

        technologies: [],
        description: "",
      };

      return;
    }

    if (!current) {
      current = {
        title: line,
        role: "",
        date: "",
        technologies: [],
        description: "",
      };

      return;
    }

    current.description =
      cleanSpaces(
        [
          current.description,
          line,
        ]
          .filter(Boolean)
          .join("\n")
      );
  });

  saveCurrent();

  return projects;
}

function parseReferences(
  text = ""
) {
  const lines =
    cleanSpaces(text)
      .split("\n")
      .map((line) =>
        stripBullet(line)
      )
      .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  if (
    /available (?:upon|on) request/i.test(
      lines.join(" ")
    )
  ) {
    return [
      {
        name:
          "Available on request",

        jobTitle: "",
        company: "",
        email: "",
        phone: "",
        relationship: "",
      },
    ];
  }

  const references = [];
  let current = null;

  const saveCurrent = () => {
    if (!current) {
      return;
    }

    if (
      current.name ||
      current.jobTitle ||
      current.company ||
      current.email ||
      current.phone ||
      current.relationship
    ) {
      references.push(
        current
      );
    }

    current = null;
  };

  lines.forEach((line) => {
    const emailMatch =
      line.match(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
      );

    const phoneMatch =
      line.match(
        /(?:\+?\d[\d\s().-]{7,}\d)/
      );

    if (
      emailMatch ||
      phoneMatch
    ) {
      if (!current) {
        current = {
          name: "",
          jobTitle: "",
          company: "",
          email: "",
          phone: "",
          relationship: "",
        };
      }

      if (emailMatch) {
        current.email =
          emailMatch[0];
      }

      if (phoneMatch) {
        current.phone =
          cleanSingleLine(
            phoneMatch[0]
          );
      }

      return;
    }

    const parts =
      line
        .split(
          /\s+\|\s+|\s+-\s+/
        )
        .map((item) =>
          cleanSingleLine(
            item
          )
        )
        .filter(Boolean);

    if (
      !current ||
      (
        current.name &&
        parts.length >= 2
      )
    ) {
      saveCurrent();

      current = {
        name:
          parts[0] ||
          line,

        jobTitle:
          parts[1] || "",

        company:
          parts[2] || "",

        email: "",
        phone: "",
        relationship: "",
      };

      return;
    }

    if (!current.jobTitle) {
      current.jobTitle =
        line;
    } else if (
      !current.company
    ) {
      current.company =
        line;
    } else {
      current.relationship =
        cleanSpaces(
          [
            current.relationship,
            line,
          ]
            .filter(Boolean)
            .join(" ")
        );
    }
  });

  saveCurrent();

  return references;
}

/* =========================================================
   COMPLETE CV DATA EXTRACTION
========================================================= */
function extractLocation(
  text = "",
  preambleLines = []
) {
  const cleanText =
    cleanSpaces(text);

  const labeledLocation =
    extractLabeledValue(
      cleanText,
      [
        "current address",
        "permanent address",
        "residential address",
        "postal address",
        "home address",
        "mailing address",
        "address",
        "current location",
        "location",
        "city town",
        "city/town",
        "city",
      ]
    );

  const cleanedLabeledLocation =
    cleanLocationValue(
      labeledLocation
    );

  if (
    isValidLocation(
      cleanedLabeledLocation
    )
  ) {
    return cleanedLabeledLocation;
  }

  const allLines =
    cleanText
      .split("\n")
      .map((line) =>
        cleanSingleLine(line)
      )
      .filter(Boolean);

  const preambleCandidate =
    preambleLines
      .map((line) =>
        cleanLocationValue(line)
      )
      .find((line) => {
        if (
          !isValidLocation(line)
        ) {
          return false;
        }

        return (
          /\b(?:pakistan|saudi arabia|united kingdom|uk|uae|united arab emirates|qatar|oman|bahrain|kuwait|ajk|azad kashmir|punjab|sindh|khyber pakhtunkhwa|kpk|balochistan|islamabad|riyadh|jeddah|dubai|abu dhabi|london|england|scotland|wales)\b/i.test(
            line
          ) ||
          line.split(",").length >= 2
        );
      });

  if (preambleCandidate) {
    return preambleCandidate;
  }

  const locationHintRegex =
    /\b(?:pakistan|saudi arabia|united kingdom|england|scotland|wales|uae|united arab emirates|qatar|oman|bahrain|kuwait|ajk|azad kashmir|punjab|sindh|khyber pakhtunkhwa|kpk|balochistan|islamabad|riyadh|jeddah|dammam|khobar|dubai|abu dhabi|sharjah|london|manchester|birmingham|mirpur|kotli|lahore|karachi|rawalpindi|faisalabad|multan|peshawar|quetta)\b/i;

  const hintedCandidate =
    allLines
      .map((line) =>
        cleanLocationValue(line)
      )
      .find((line) => {
        return (
          isValidLocation(line) &&
          locationHintRegex.test(
            line
          ) &&
          !looksLikeDateLine(
            line
          )
        );
      });

  if (hintedCandidate) {
    return hintedCandidate;
  }

  const commaCandidate =
    allLines
      .slice(0, 40)
      .map((line) =>
        cleanLocationValue(line)
      )
      .find((line) => {
        return (
          isValidLocation(line) &&
          line.split(",").length >=
            2 &&
          !looksLikeDateLine(
            line
          ) &&
          !EDUCATION_KEYWORD_REGEX.test(
            line
          )
        );
      });

  return commaCandidate || "";
}
function extractBasicCVData(text) {
  const cleanText =
    cleanSpaces(text);

  const sections =
    splitIntoSections(
      cleanText
    );

  const sectionText = (name) =>
    cleanSpaces(
      (
        sections[name] ||
        []
      ).join("\n")
    );

  const personalSection =
    sectionText("personal");

  const personalDetails =
    extractPersonalDetails(
      cleanText,
      personalSection
    );

  const email =
    extractEmail(
      cleanText
    );

  const phone =
    extractPhone(
      cleanText,
      personalDetails.cnic
    );

  const linkedInMatch =
    cleanText.match(
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|,]+/i
    );

  const githubMatch =
    cleanText.match(
      /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|,]+/i
    );

  const allUrls =
    cleanText.match(
      /(?:https?:\/\/|www\.)[^\s|,]+/gi
    ) || [];

  const website =
    allUrls.find(
      (url) =>
        !/linkedin\.com/i.test(
          url
        ) &&
        !/github\.com/i.test(
          url
        )
    ) || "";

  const preambleLines =
    (
      sections.preamble ||
      []
    )
      .map((line) =>
        cleanSingleLine(
          line
        )
      )
      .filter(Boolean);

  const personalLines =
    (
      sections.personal ||
      []
    )
      .map((line) =>
        cleanSingleLine(
          line
        )
      )
      .filter(Boolean);

  const identityText =
    cleanSpaces(
      [
        ...preambleLines,
        ...personalLines,
      ].join("\n")
    );

  const nonContactPreambleLines =
    preambleLines.filter(
      (line) => {
        const digits =
          digitsOnly(line);

        return (
          !line.includes("@") &&
          !/linkedin\.com/i.test(
            line
          ) &&
          !/github\.com/i.test(
            line
          ) &&
          !/(?:https?:\/\/|www\.)/i.test(
            line
          ) &&
          !(
            digits.length >= 9 &&
            digits.length <= 15
          ) &&
          !looksLikeKnownLabel(
            line
          ) &&
          !detectSectionHeading(
            line
          )
        );
      }
    );

  const badNameWords = [
    "curriculum vitae",
    "resume",
    "professional cv",
    "contact details",
    "personal details",
    "personal information",
    "email",
    "phone",
    "mobile",
    "address",
    "location",
    "father",
    "nationality",
    "religion",
    "gender",
    "cnic",
    "date of birth",
  ];

  const labeledFullName =
    extractLabeledValue(
      identityText,
      [
        "full name",
        "candidate name",
        "applicant name",
      ]
    );

  const fullName =
    labeledFullName ||
    nonContactPreambleLines.find(
      (line) => {
        const lower =
          line.toLowerCase();

        const wordCount =
          line
            .split(/\s+/)
            .length;

        return (
          line.length >= 3 &&
          line.length <= 60 &&
          wordCount >= 2 &&
          wordCount <= 6 &&
          !/\d/.test(line) &&
          !badNameWords.some(
            (word) =>
              lower.includes(
                word
              )
          )
        );
      }
    ) ||
    "";

  const labeledJobTitle =
    extractLabeledValue(
      identityText,
      PERSONAL_LABEL_GROUPS.jobTitle
    );

  const jobTitle =
    labeledJobTitle ||
    nonContactPreambleLines.find(
      (line) => {
        const lower =
          line.toLowerCase();

        return (
          line !== fullName &&
          line.length >= 2 &&
          line.length <= 100 &&
          !badNameWords.some(
            (word) =>
              lower.includes(
                word
              )
          )
        );
      }
    ) ||
    "";

  /*
   * Correct location extraction.
   * extractLocation() function must remain
   * outside extractBasicCVData().
   */
  const location =
    extractLocation(
      cleanText,
      preambleLines
    );

  const summary =
    sectionText("summary");

  const experience =
    sectionText(
      "experience"
    );

  const education =
    sectionText("education");

  const projects =
    sectionText("projects");

  const references =
    sectionText(
      "references"
    );

  const experiences =
    parseTimedItems(
      experience,
      "experience"
    );

  const educations =
    parseEducationItems(
      education
    );

  const projectsList =
    parseProjects(
      projects
    );

  const referencesList =
    parseReferences(
      references
    );

  const {
    skills,
    skillLevels,
  } = parseSkills(
    sectionText("skills")
  );

  const {
    languages,
    languageLevels,
  } = parseLanguages(
    sectionText(
      "languages"
    )
  );

  const certificationsList =
    parseCertifications(
      sectionText(
        "certifications"
      )
    );

  const certifications =
    certificationsList
      .map((item) =>
        item.name
      )
      .filter(Boolean);

  const achievements =
    splitList(
      sectionText(
        "achievements"
      ),
      30
    );

  const strengths =
    splitList(
      sectionText(
        "strengths"
      ),
      30
    );

  const hobbies =
    splitList(
      sectionText(
        "hobbies"
      ),
      30
    );

  return {
    fullName:
      cleanSingleLine(
        fullName
      ),

    jobTitle:
      cleanSingleLine(
        jobTitle
      ),

    email:
      cleanSingleLine(
        email
      ),

    phone:
      cleanSingleLine(
        phone
      ),

    location:
      cleanSingleLine(
        location
      ),

    fatherName:
      cleanSingleLine(
        personalDetails.fatherName
      ),

    dateOfBirth:
      cleanSingleLine(
        personalDetails.dateOfBirth
      ),

    dob:
      cleanSingleLine(
        personalDetails.dateOfBirth
      ),

    cnic:
      cleanSingleLine(
        personalDetails.cnic
      ),

    gender:
      cleanSingleLine(
        personalDetails.gender
      ),

    nationality:
      cleanSingleLine(
        personalDetails.nationality
      ),

    religion:
      cleanSingleLine(
        personalDetails.religion
      ),

    maritalStatus:
      cleanSingleLine(
        personalDetails.maritalStatus
      ),

    personalDetails: {
      fatherName:
        cleanSingleLine(
          personalDetails.fatherName
        ),

      dateOfBirth:
        cleanSingleLine(
          personalDetails.dateOfBirth
        ),

      cnic:
        cleanSingleLine(
          personalDetails.cnic
        ),

      gender:
        cleanSingleLine(
          personalDetails.gender
        ),

      nationality:
        cleanSingleLine(
          personalDetails.nationality
        ),

      religion:
        cleanSingleLine(
          personalDetails.religion
        ),

      maritalStatus:
        cleanSingleLine(
          personalDetails.maritalStatus
        ),
    },

    linkedIn:
      linkedInMatch?.[0] ||
      "",

    github:
      githubMatch?.[0] ||
      "",

    portfolio: "",
    website,

    summary,
    experience,
    education,
    projects,
    references,

    experiences,
    educations,
    projectsList,
    referencesList,

    skills,
    skillLevels,

    languages,
    languageLevels,

    certifications,
    certificationsList,

    achievements,
    strengths,
    hobbies,
    interests: hobbies,

    additionalSections: [],

    rawText:
      cleanText,
  };
}

/* =========================================================
   DOC EXTRACTION
========================================================= */

async function extractDocText(
  buffer,
  fileName
) {
  const extractor =
    new WordExtractor();

  const safeName =
    path
      .basename(fileName)
      .replace(
        /[^a-zA-Z0-9._-]/g,
        "-"
      );

  const tempPath =
    path.join(
      os.tmpdir(),
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}-${safeName}`
    );

  await writeFile(
    tempPath,
    buffer
  );

  try {
    const document =
      await extractor.extract(
        tempPath
      );

    return (
      document.getBody() ||
      ""
    );
  } finally {
    await unlink(
      tempPath
    ).catch(() => {});
  }
}

/* =========================================================
   PDF LINE RECONSTRUCTION
========================================================= */

function createPdfLines(
  items
) {
  const sortedItems =
    [...items].sort(
      (a, b) => {
        const yDifference =
          a.y - b.y;

        if (
          Math.abs(
            yDifference
          ) > 0.15
        ) {
          return yDifference;
        }

        return a.x - b.x;
      }
    );

  const lines = [];

  sortedItems.forEach(
    (item) => {
      const lastLine =
        lines[
          lines.length - 1
        ];

      if (
        lastLine &&
        Math.abs(
          lastLine.y -
          item.y
        ) <= 0.15
      ) {
        lastLine.items.push(
          item
        );

        return;
      }

      lines.push({
        y: item.y,
        items: [item],
      });
    }
  );

  return lines
    .map((line) =>
      line.items
        .sort(
          (a, b) =>
            a.x - b.x
        )
        .map((item) =>
          item.text
        )
        .filter(Boolean)
        .join(" ")
        .replace(
          /[ ]{2,}/g,
          " "
        )
        .trim()
    )
    .filter(Boolean);
}

/* =========================================================
   PDF EXTRACTION
========================================================= */

function extractPdfText(
  buffer
) {
  return new Promise(
    (resolve, reject) => {
      const pdfParser =
        new PDFParser(
          null,
          1
        );

      pdfParser.on(
        "pdfParser_dataError",
        (errorData) => {
          reject(
            errorData?.parserError ||
            errorData ||
            new Error(
              "PDF parsing failed."
            )
          );
        }
      );

      pdfParser.on(
        "pdfParser_dataReady",
        (pdfData) => {
          try {
            const pages =
              Array.isArray(
                pdfData?.Pages
              )
                ? pdfData.Pages
                : [];

            const pageTexts =
              pages.map(
                (page) => {
                  const rawTextItems =
                    Array.isArray(
                      page?.Texts
                    )
                      ? page.Texts
                      : [];

                  const textItems =
                    rawTextItems
                      .map(
                        (
                          textItem
                        ) => {
                          const runs =
                            Array.isArray(
                              textItem?.R
                            )
                              ? textItem.R
                              : [];

                          const text =
                            cleanSingleLine(
                              runs
                                .map(
                                  (
                                    run
                                  ) =>
                                    safeDecodePdfText(
                                      run?.T
                                    )
                                )
                                .join(
                                  ""
                                )
                            );

                          return {
                            x: Number(
                              textItem?.x ||
                              0
                            ),

                            y: Number(
                              textItem?.y ||
                              0
                            ),

                            text,
                          };
                        }
                      )
                      .filter(
                        (item) =>
                          item.text
                      );

                  if (
                    !textItems.length
                  ) {
                    return "";
                  }

                  const pageWidth =
                    Number(
                      page?.Width ||
                      0
                    );

                  if (
                    !pageWidth
                  ) {
                    return createPdfLines(
                      textItems
                    ).join("\n");
                  }

                  const leftItems =
                    textItems.filter(
                      (item) =>
                        item.x <
                        pageWidth *
                          0.48
                    );

                  const rightItems =
                    textItems.filter(
                      (item) =>
                        item.x >=
                        pageWidth *
                          0.48
                    );

                  const hasTwoColumns =
                    leftItems.length >
                      0 &&
                    rightItems.length >
                      4;

                  if (
                    hasTwoColumns
                  ) {
                    return [
                      ...createPdfLines(
                        leftItems
                      ),

                      ...createPdfLines(
                        rightItems
                      ),
                    ].join("\n");
                  }

                  return createPdfLines(
                    textItems
                  ).join("\n");
                }
              );

            resolve(
              cleanSpaces(
                pageTexts
                  .filter(Boolean)
                  .join("\n")
              )
            );
          } catch (error) {
            reject(error);
          }
        }
      );

      try {
        pdfParser.parseBuffer(
          buffer
        );
      } catch (error) {
        reject(error);
      }
    }
  );
}

/* =========================================================
   IMAGE OCR EXTRACTION
========================================================= */

async function extractImageText(
  buffer,
  fileName = "image.png"
) {
  const extension =
    path.extname(
      fileName
    ) || ".png";

  const tempPath =
    path.join(
      os.tmpdir(),
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}${extension}`
    );

  await writeFile(
    tempPath,
    buffer
  );

  try {
    const result =
      await recognize(
        tempPath,
        "eng",
        {
          logger:
            () => {},
        }
      );

    return cleanSpaces(
      result?.data?.text ||
      ""
    );
  } finally {
    await unlink(
      tempPath
    ).catch(() => {});
  }
}

function isImageFile(
  fileName = ""
) {
  return /\.(jpg|jpeg|png|webp)$/i.test(
    fileName
  );
}

/* =========================================================
   API ROUTE
========================================================= */

export async function POST(
  request
) {
  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (
      !file ||
      typeof file.arrayBuffer !==
        "function"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No file uploaded.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "The uploaded CV is too large. Maximum file size is 15MB.",
        },
        {
          status: 413,
        }
      );
    }

    const originalFileName =
      String(
        file.name ||
        "cv"
      );

    const fileName =
      originalFileName
        .toLowerCase();

    const buffer =
      Buffer.from(
        await file.arrayBuffer()
      );

    let extractedText = "";

    if (
      fileName.endsWith(
        ".txt"
      )
    ) {
      extractedText =
        buffer.toString(
          "utf-8"
        );
    } else if (
      fileName.endsWith(
        ".pdf"
      )
    ) {
      extractedText =
        await extractPdfText(
          buffer
        );
    } else if (
      fileName.endsWith(
        ".docx"
      )
    ) {
      const result =
        await mammoth.extractRawText(
          {
            buffer,
          }
        );

      extractedText =
        result?.value ||
        "";
    } else if (
      fileName.endsWith(
        ".doc"
      )
    ) {
      extractedText =
        await extractDocText(
          buffer,
          originalFileName
        );
    } else if (
      isImageFile(
        fileName
      )
    ) {
      extractedText =
        await extractImageText(
          buffer,
          originalFileName
        );
    } else {
      return NextResponse.json(
        {
          success: false,

          error:
            "Unsupported file type. Upload PDF, DOC, DOCX, TXT, JPG, JPEG, PNG or WEBP.",
        },
        {
          status: 400,
        }
      );
    }

    extractedText =
      cleanSpaces(
        extractedText
      );

    if (!extractedText) {
      const errorMessage =
        fileName.endsWith(
          ".pdf"
        )
          ? "No readable text was found in this PDF. It may be a scanned or image-only PDF. Upload a searchable PDF or a clear JPG, PNG or WEBP image for OCR extraction."
          : "No readable text was found in this CV. Upload a readable PDF, DOC, DOCX, TXT, JPG, PNG or WEBP file.";

      return NextResponse.json(
        {
          success: false,
          error:
            errorMessage,
        },
        {
          status: 422,
        }
      );
    }

    const extractedData =
      extractBasicCVData(
        extractedText
      );

    return NextResponse.json({
      success: true,
      data:
        extractedData,
    });
  } catch (error) {
    console.error(
      "CV extract error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message ||
              "Unable to extract CV data from this file."
            : "Unable to extract CV data from this file.",
      },
      {
        status: 500,
      }
    );
  }
}