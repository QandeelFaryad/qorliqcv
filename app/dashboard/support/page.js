"use client";

import Link from "next/link";
import { useState } from "react";

const categories = ["All topics", "CV Builder", "Billing", "Account"];

const faqs = [
  {
    category: "CV Builder",
    question: "How do I download my CV?",
    answer:
      "Open your completed CV and choose Download PDF or Download Word. If your access has expired, check your plan in Subscription & Billing.",
  },
  {
    category: "CV Builder",
    question: "Can I update a CV I have already created?",
    answer:
      "Open My CVs, select the CV you want to change and continue editing. Download a new copy after saving your changes.",
  },
  {
    category: "CV Builder",
    question: "What should I do if my download fails?",
    answer:
      "Try downloading again and check whether your browser is blocking downloads. If the issue continues, contact support with the file format and any error message.",
  },
  {
    category: "Billing",
    question: "Where can I find my plan and payment details?",
    answer:
      "Visit Subscription & Billing in your dashboard to review your current plan, payment method and available billing history.",
  },
  {
    category: "Account",
    question: "How do I update my email or password?",
    answer:
      "Go to Account Settings, enter your updated details and select Save changes.",
  },
  {
    category: "Account",
    question: "How do I delete my account?",
    answer:
      "Open Account Settings and find Delete account. Review the information carefully before confirming your request.",
  },
];

function Icon({ name, className = "h-5 w-5" }) {
  const paths = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    document: (
      <>
        <path d="M14 3H5v18h14V8l-5-5Z" />
        <path d="M14 3v5h5M8 12h8M8 16h5" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </>
    ),
    message: (
      <>
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 2V11.5a9 9 0 0 1 18 0Z" />
        <path d="M8 10h8M8 14h5" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function HelpSupportPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All topics");
  const [openQuestion, setOpenQuestion] = useState(null);
  const [notice, setNotice] = useState("");

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      category === "All topics" || faq.category === category;

    const matchesSearch =
      `${faq.question} ${faq.answer} ${faq.category}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const inputClass =
    "w-full min-w-0 rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm text-[#111111] outline-none transition placeholder:text-black/30 focus:border-[#C6A35D] focus:ring-4 focus:ring-[#C6A35D]/10";

  const focusClass =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A6A35] focus-visible:ring-offset-2";

  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 pb-6 text-[#111111]">
      {/* Page heading */}
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8A6A35]">
          Qorliq Support
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Help & Support
        </h1>

        <p className="mt-2 text-sm leading-6 text-black/50">
          Find answers, manage your account or get help with an issue.
        </p>
      </header>

      {/* Search */}
      <section className="rounded-2xl border border-[#C6A35D]/20 bg-[#F7F2E8] p-5 sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          How can we help you?
        </h2>

        <p className="mt-2 text-sm leading-6 text-black/50">
          Search for help with your CV, subscription or account.
        </p>

        <div className="relative mt-5 max-w-2xl">
          <label htmlFor="help-search" className="sr-only">
            Search help articles
          </label>

          <Icon
            name="search"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/35"
          />

          <input
            id="help-search"
            type="search"
            placeholder="Search questions or keywords..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={`${inputClass} py-4 pl-12 shadow-sm`}
          />
        </div>
      </section>

      {/* Quick links */}
      <nav aria-label="Support shortcuts" className="grid gap-3 sm:grid-cols-3">
        {[
          {
            title: "My CVs",
            description: "View and edit your CVs",
            href: "/dashboard/cvs",
            icon: "document",
          },
          {
            title: "Subscription & Billing",
            description: "Manage your plan and payments",
            href: "/dashboard/billing",
            icon: "card",
          },
          {
            title: "Account Settings",
            description: "Update your account details",
            href: "/dashboard/settings",
            icon: "user",
          },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={`group flex min-w-0 items-center gap-3 rounded-2xl border border-black/[0.07] bg-white p-4 transition hover:border-[#C6A35D]/60 hover:shadow-sm ${focusClass}`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F2E8] text-[#8A6A35]">
              <Icon name={item.icon} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-black/45">
                {item.description}
              </p>
            </div>

            <Icon
              name="arrow"
              className="h-4 w-4 shrink-0 text-black/25 transition group-hover:text-[#8A6A35]"
            />
          </Link>
        ))}
      </nav>

      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[1.15fr_1fr]">
        {/* FAQ panel */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
          <div className="border-b border-black/[0.06] p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">
              Frequently asked questions
            </h2>

            <p className="mt-1 text-xs leading-5 text-black/45">
              Answers to the questions we hear most.
            </p>

            <div
              role="group"
              aria-label="Filter questions by topic"
              className="mt-5 flex flex-wrap gap-2"
            >
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${focusClass} ${
                    category === item
                      ? "bg-[#111111] text-white"
                      : "bg-[#F6F6F5] text-black/50 hover:bg-[#F7F2E8] hover:text-[#8A6A35]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <p role="status" className="sr-only">
            {filteredFaqs.length} questions found.
          </p>

          <div className="divide-y divide-black/[0.06]">
            {filteredFaqs.map((faq) => {
              const index = faqs.indexOf(faq);
              const isOpen = openQuestion === faq.question;

              return (
                <div key={faq.question}>
                  <h3>
                    <button
                      id={`question-${index}`}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`answer-${index}`}
                      onClick={() =>
                        setOpenQuestion(isOpen ? null : faq.question)
                      }
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-[#FCFBF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C6A35D] sm:px-6"
                    >
                      <span className="text-sm font-medium leading-6">
                        {faq.question}
                      </span>

                      <Icon
                        name="chevron"
                        className={`h-4 w-4 shrink-0 text-[#8A6A35] transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </h3>

                  <div
                    id={`answer-${index}`}
                    role="region"
                    aria-labelledby={`question-${index}`}
                    hidden={!isOpen}
                    className="px-5 pb-5 text-sm leading-7 text-black/55 sm:px-6"
                  >
                    {faq.answer}
                  </div>
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="px-6 py-10 text-center">
                <Icon
                  name="search"
                  className="mx-auto h-7 w-7 text-black/25"
                />
                <h3 className="mt-3 text-sm font-semibold">
                  No matching answers
                </h3>
                <p className="mt-2 text-xs leading-6 text-black/45">
                  Try another keyword or send us a message.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All topics");
                  }}
                  className={`mt-4 rounded-lg px-3 py-2 text-xs font-semibold text-[#8A6A35] hover:bg-[#F7F2E8] ${focusClass}`}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Contact form */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
          <div className="flex items-start gap-3 border-b border-black/[0.06] p-5 sm:p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F2E8] text-[#8A6A35]">
              <Icon name="message" />
            </span>

            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Contact support
              </h2>
              <p className="mt-1 text-xs leading-5 text-black/45">
                Can’t find an answer? Tell us what’s happening.
              </p>
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setNotice(
                "This is a design preview. Your request has not been sent."
              );
            }}
            className="space-y-4 p-5 sm:p-6"
          >
            <div>
              <label
                htmlFor="support-email"
                className="mb-2 block text-xs font-semibold text-black/70"
              >
                Email address
              </label>
              <input
                id="support-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="support-topic"
                className="mb-2 block text-xs font-semibold text-black/70"
              >
                What do you need help with?
              </label>
              <select
                id="support-topic"
                name="topic"
                defaultValue=""
                required
                className={inputClass}
              >
                <option value="" disabled>
                  Select a topic
                </option>
                <option value="cv">CV creation & downloads</option>
                <option value="billing">Subscription & billing</option>
                <option value="account">Account & login</option>
                <option value="technical">Technical issue</option>
                <option value="other">Something else</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="support-subject"
                className="mb-2 block text-xs font-semibold text-black/70"
              >
                Subject
              </label>
              <input
                id="support-subject"
                name="subject"
                type="text"
                placeholder="Briefly describe your issue"
                maxLength={150}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="support-message"
                className="mb-2 block text-xs font-semibold text-black/70"
              >
                Message
              </label>
              <textarea
                id="support-message"
                name="message"
                rows={5}
                placeholder="Include what you were trying to do and any error message you saw."
                maxLength={3000}
                required
                aria-describedby="message-help"
                className={`${inputClass} resize-y`}
              />
              <p
                id="message-help"
                className="mt-2 text-[11px] leading-5 text-black/40"
              >
                Please don’t include passwords or full payment card details.
              </p>
            </div>

            {notice && (
              <p
                role="status"
                aria-live="polite"
                className="rounded-xl border border-[#C6A35D]/20 bg-[#F7F2E8] px-4 py-3 text-sm leading-6 text-[#8A6A35]"
              >
                {notice}
              </p>
            )}

            <button
              type="submit"
              className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#C6A35D] px-5 py-3.5 text-sm font-bold text-[#111111] transition hover:bg-[#B89450] ${focusClass}`}
            >
              Submit request
              <Icon name="arrow" className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}