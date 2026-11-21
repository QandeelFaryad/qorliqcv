"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";


const LAST_UPDATED = "20 November 2026";

const SECTIONS = [
  ["overview", "Overview and acceptance"],
  ["eligibility", "Eligibility and accounts"],
  ["services", "Our services"],
  ["cv-content", "Your CV content"],
  ["plans", "Plans and pricing"],
  ["billing", "Payments and renewals"],
  ["cancellations", "Cancelling your subscription"],
  ["refunds", "Refund and no-refund policy"],
  ["downloads", "Downloads and access limits"],
  ["ai", "AI-assisted features"],
  ["acceptable-use", "Acceptable use"],
  ["intellectual-property", "Intellectual property"],
  ["availability", "Availability and changes"],
  ["liability", "Liability and consumer rights"],
  ["privacy", "Privacy and data protection"],
  ["changes", "Changes to these terms"],
  ["contact", "Contact and legal details"],
];

const EASE = [0.22, 1, 0.36, 1];

function Section({ id, title, index, children, reduceMotion }) {
  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.08, margin: "0px 0px -30px 0px" },
    transition: { duration: reduceMotion ? 0 : 0.54, ease: EASE },
  };

  return (
    <motion.section
      {...reveal}
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-28 border-b border-border pb-9 pt-9 first:pt-0 last:border-b-0 last:pb-0 sm:pb-10 sm:pt-10"
    >
      <div className="mb-4 flex items-start gap-3 sm:gap-4">
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: reduceMotion ? 0 : 0.32, delay: reduceMotion ? 0 : 0.09, ease: EASE }}
          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background-soft text-[11px] font-semibold tabular-nums text-text-secondary"
        >
          {String(index).padStart(2, "0")}
        </motion.span>
        <h2 id={`${id}-heading`} className="text-[20px] font-semibold leading-[1.35] tracking-[-0.045em] text-text-primary sm:text-[23px]">
          {title}
        </h2>
      </div>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.08, ease: EASE }}
        className="space-y-4 pl-0 text-[14px] leading-[1.9] text-text-secondary sm:pl-11 sm:text-[15px] [&_a]:font-medium [&_a]:text-[#2563a6] [&_a]:underline [&_a]:underline-offset-4 dark:[&_a]:text-accent [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-text-primary"
      >
        {children}
      </motion.div>
    </motion.section>
  );
}

function Points({ children }) {
  return <ul className="list-disc space-y-2 pl-5 marker:text-[#089D98]">{children}</ul>;
}

function ReviewNote({ children }) {
  return (
    <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-[13px] leading-6 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
      <strong className="!text-inherit">Information to confirm before publishing:</strong> {children}
    </div>
  );
}

function DesktopTOC({ activeId, reduceMotion, navigateToSection }) {
  return (
    <motion.aside
      initial={reduceMotion ? false : { opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
      className="hidden self-start lg:sticky lg:top-24 lg:block"
      aria-label="Terms and conditions contents"
    >
      <div className="border-l border-border py-1">
        <p className="mb-4 pl-4 text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
          On this page
        </p>
        <nav aria-label="Terms sections">
          <ol className="space-y-0.5">
            {SECTIONS.map(([id, label], i) => {
              const selected = activeId === id;
              return (
                <li key={id}>
                  <motion.a
                    href={`#${id}`}
                    onClick={(event) => navigateToSection(event, id)}
                    whileHover={reduceMotion ? undefined : { x: 3 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                    transition={{ duration: reduceMotion ? 0 : 0.18, ease: EASE }}
                    aria-current={selected ? "location" : undefined}
                    className={`relative flex min-h-9 items-center gap-2.5 rounded-r-lg px-4 py-2 text-[12px] leading-[1.45] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${selected ? "bg-accent/10 font-semibold text-text-primary" : "text-text-secondary hover:bg-background-soft hover:text-text-primary"}`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="qorliq-terms-active-bar"
                        transition={{ duration: reduceMotion ? 0 : 0.24, ease: EASE }}
                        className="absolute -left-px inset-y-0 w-[2px] rounded-full bg-[#078C88] dark:bg-accent"
                        aria-hidden="true"
                      />
                    )}
                    <span className="w-5 shrink-0 text-[10px] tabular-nums text-text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span>{label}</span>
                  </motion.a>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </motion.aside>
  );
}

export default function TermsConditionsContent() {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(SECTIONS[0][0]);
  const [mobileTOCOpen, setMobileTOCOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const copyTimer = useRef(null);

  function navigateToSection(event, id) {
    const destination = document.getElementById(id);
    if (!destination) return;
    event.preventDefault();
    setMobileTOCOpen(false);
    setActiveId(id);
    window.history.pushState(null, "", `#${id}`);
    destination.scrollIntoView({
      behavior: reduceMotion ? "instant" : "smooth",
      block: "start",
    });
  }

  useEffect(() => {
    const onScroll = () => {
      const threshold = 145;
      let current = SECTIONS[0][0];
      for (const [id] of SECTIONS) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= threshold) current = id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, []);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  async function copyPageLink() {
    if (!navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setHasCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setHasCopied(false), 2200);
    } catch {
      setHasCopied(false);
    }
  }

  const enter = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.48, delay: reduceMotion ? 0 : delay, ease: EASE },
  });

  return (
    <>
     
      <main className="min-h-[70dvh] bg-background text-text-primary">
        <div className="mx-auto max-w-[1232px] px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8 lg:pt-16">
          <motion.div {...enter()} className="max-w-[850px]">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[11px] font-semibold text-text-secondary shadow-sm"
            >
              <ShieldCheck size={14} className="text-[#078C88] dark:text-accent" aria-hidden="true" />
              Clear terms for your CV
            </motion.div>
           <h1 className="text-[clamp(2.8rem,5.3vw,5.2rem)] font-bold leading-[1.08] tracking-[-0.065em] text-text-primary">
  Terms &amp; Conditions
  <span className="text-[#089D98] dark:text-accent">.</span>
</h1>
            <motion.p {...enter(0.08)} className="mt-5 max-w-[690px] text-[15px] leading-[1.85] text-text-secondary sm:text-[17px]">
              Read the terms for using QORLIQ CV, including subscription billing, cancellation, downloads and our refund policy. We have highlighted important payment conditions so they are easy to find.
            </motion.p>
            <motion.div {...enter(0.14)} className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border pb-8 text-[12px] text-text-muted sm:pb-9">
              <span className="inline-flex items-center gap-2"><FileText size={15} aria-hidden="true" /> Updated {LAST_UPDATED}</span>
              <span className="inline-flex items-center gap-2"><LockKeyhole size={15} aria-hidden="true" /> Service terms</span>
              <button
                type="button"
                onClick={copyPageLink}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 font-semibold text-text-secondary transition-colors hover:bg-background-soft hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
                aria-live="polite"
              >
                {hasCopied ? <Check size={15} aria-hidden="true" /> : <ArrowUpRight size={15} aria-hidden="true" />}
                {hasCopied ? "Link copied" : "Share this page"}
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: reduceMotion ? 0 : 0.46, delay: reduceMotion ? 0 : 0.08, ease: EASE }}
            className="mt-7 lg:hidden"
          >
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <button
                type="button"
                onClick={() => setMobileTOCOpen((open) => !open)}
                aria-expanded={mobileTOCOpen}
                aria-controls="terms-mobile-contents"
                className="flex min-h-13 w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13px] font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
              >
                <span className="inline-flex items-center gap-2"><FileText size={16} className="text-[#078C88] dark:text-accent" aria-hidden="true" /> Jump to a section</span>
                <ChevronDown size={18} className={`text-text-secondary transition-transform duration-200 ${mobileTOCOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {mobileTOCOpen && (
                <motion.nav
                  id="terms-mobile-contents"
                  aria-label="Terms sections"
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.28, ease: EASE }}
                  className="max-h-[48dvh] overflow-y-auto border-t border-border px-2 py-2"
                >
                  <ol className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
                    {SECTIONS.map(([id, label], i) => (
                      <li key={id}>
                        <a
                          href={`#${id}`}
                          onClick={(event) => navigateToSection(event, id)}
                          className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-[13px] focus-visible:outline-2 focus-visible:outline-accent ${activeId === id ? "bg-accent/10 font-semibold text-text-primary" : "text-text-secondary hover:bg-background-soft"}`}
                        >
                          <span className="w-5 text-[11px] tabular-nums text-text-muted">{String(i + 1).padStart(2, "0")}</span>
                          <span className="flex-1">{label}</span>
                          <ChevronRight size={13} aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ol>
                </motion.nav>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="mt-9 grid grid-cols-1 items-start gap-8 lg:mt-12 lg:grid-cols-[242px_minmax(0,1fr)] lg:gap-12 xl:gap-16">
            <DesktopTOC activeId={activeId} reduceMotion={reduceMotion} navigateToSection={navigateToSection} />
            <article className="min-w-0 max-w-[790px]" aria-label="Terms and conditions details">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 13 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
              >
                <ReviewNote>
                  Publication review required: confirm the operating legal entity, contact method, how Stripe subscriptions renew, whether cancellation ends access immediately, your checkout consent flow, and any applicable statutory cooling-off rights. These terms must match your actual checkout and subscription behaviour.
                </ReviewNote>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
                className="mt-7 rounded-2xl border border-amber-300/60 bg-amber-50 p-5 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100 sm:p-6"
              >
                <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.10em]"><CreditCard size={16} aria-hidden="true" /> Important subscription terms</div>
                <p className="mt-3 text-[15px] font-semibold leading-7">Cancelling a paid subscription does not, by itself, entitle you to a refund of subscription fees already paid.</p>
                <p className="mt-2 text-[13px] leading-6">Our no-refund policy applies only to the extent permitted by law. It does not exclude statutory cooling-off rights, remedies for faulty or undelivered services, or other non-excludable consumer rights. Please review Sections 7 and 8 before purchasing.</p>
                <a href="#refunds" onClick={(event) => navigateToSection(event, "refunds")} className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold underline underline-offset-4">Read the refund policy <ArrowUpRight size={14} aria-hidden="true" /></a>
              </motion.div>

              <Section id="overview" title="Overview and acceptance" index={1} reduceMotion={reduceMotion}>
                <p>These Terms and Conditions govern access to and use of QORLIQ CV, including our CV builder, previews, exports and paid features. “QORLIQ CV”, “we”, “our” and “us” refer to the service operator identified in the Contact section.</p>
                <p>By creating an account, using the service or purchasing access, you agree to these terms, subject to any rights that cannot lawfully be excluded. If you do not agree, please do not purchase or use paid features.</p>
              </Section>

              <Section id="eligibility" title="Eligibility and accounts" index={2} reduceMotion={reduceMotion}>
                <p>You must be legally able to enter into a contract in your location and provide accurate registration and billing information. You are responsible for protecting your sign-in credentials and for activity conducted through your account, except to the extent caused by our own failure to meet legal obligations.</p>
                <p>Some functionality requires signing in. Please contact support if you believe someone has accessed your account without permission.</p>
                <ReviewNote>Confirm and insert the minimum customer age, and describe any additional restrictions imposed by your payment provider.</ReviewNote>
              </Section>

              <Section id="services" title="Our services" index={3} reduceMotion={reduceMotion}>
                <p>QORLIQ CV helps users create, edit, preview and download professional CVs and resumes. Available features may include a selection of templates, document exports, account dashboards and optional AI-assisted text generation.</p>
                <p>Our tools assist with document preparation. We do not guarantee that a CV will lead to an interview, job offer, employment or a particular recruitment result.</p>
              </Section>

              <Section id="cv-content" title="Your CV content" index={4} reduceMotion={reduceMotion}>
                <p>You are responsible for checking the accuracy, suitability and legality of the information you submit. You retain your rights in original CV content that you create or upload, subject to any third-party rights.</p>
                <p>You grant us permission to process, store, display and transform your content as needed to provide the features you request, including previews, file downloads and AI tools you choose to use, as described in our <Link href="/privacy-policy">Privacy Policy</Link>.</p>
                <p>Do not submit personal information about other individuals unless you have a lawful basis to do so.</p>
              </Section>

              <Section id="plans" title="Plans and pricing" index={5} reduceMotion={reduceMotion}>
                <p>Available options may include limited-duration one-time access and paid subscription plans. The current price, currency, tax information, access period, renewal terms and relevant limits should be shown at checkout before you pay.</p>
                <p>One-time access is different from an automatically renewing subscription. Selecting a plan does not guarantee unlimited CV downloads unless explicitly stated in its offer.</p>
                <p>Prices and offers may change for future purchases, but changes do not retrospectively modify payments already completed. Any applicable renewal-price notices are governed by law and the terms presented at purchase.</p>
              </Section>

              <Section id="billing" title="Payments and renewals" index={6} reduceMotion={reduceMotion}>
                <p>Payments and subscription billing are processed through our payment integration, Stripe. By completing a purchase, you authorise the charge displayed at checkout, including any applicable taxes.</p>
                <p><strong>For an automatically renewing plan</strong>, the renewal interval, recurring price and cancellation method must be clearly displayed before you subscribe. Where your chosen plan renews automatically, charges may continue in accordance with those disclosed terms until your subscription is cancelled or otherwise ends.</p>
                <p>Transactions may be declined or delayed by payment providers. Please avoid submitting repeated payments while a transaction is still being processed.</p>
                <ReviewNote>Confirm whether each displayed plan is recurring or fixed-term, exact renewal behaviour, and required pre-renewal notices before publication.</ReviewNote>
              </Section>

              <Section id="cancellations" title="Cancelling your subscription" index={7} reduceMotion={reduceMotion}>
                <p>You may request to cancel an active subscription using the cancellation control available in your account, where provided, or the support channel identified below.</p>
                <p><strong>Cancellation and refunds are separate:</strong> cancelling prevents or ends access and/or future billing according to the cancellation confirmation and your plan terms. It does <strong>not</strong> automatically reverse a payment already made. Unless applicable law requires otherwise or we expressly agree to a refund, no money is returned simply because you cancel.</p>
                <p><strong>Access after cancellation:</strong> the application may remove subscription access when cancellation is processed. Do not assume your account will continue to have paid features until the end of the original term. Check the confirmation displayed when cancelling; it should state the effective date and consequences.</p>
                <p>If a renewal has already been charged, cancellation will not necessarily undo that transaction. Statutory rights remain unaffected.</p>
                <ReviewNote>Verify current cancellation implementation, effective date, payment processor settings, and messages shown in the dashboard before publishing this paragraph.</ReviewNote>
              </Section>

              <Section id="refunds" title="Refund and no-refund policy" index={8} reduceMotion={reduceMotion}>
                <p><strong>Our standard policy:</strong> fees paid for a subscription or access period are non-refundable when you cancel, stop using the service, change your mind after the applicable cancellation period, or do not use your available CV downloads. We do not offer automatic refunds or prorated refunds for unused subscription time solely because of voluntary cancellation.</p>
                <p><strong>Important legal exception:</strong> this policy applies <strong>only where permitted by applicable law</strong>. It does not remove any right to cancel within a legally applicable cooling-off period, obtain a remedy for a service or digital product that is faulty or not provided as required, challenge an unauthorised charge, or exercise another statutory right.</p>
                <p>Some digital-content transactions may be subject to specific rules about immediate performance and express acknowledgement at checkout. We will not treat a statutory cancellation right as waived unless the legal conditions for doing so have been met.</p>
                <p>If you believe you are entitled to a refund under applicable law, please contact us with your account email, transaction date and a description of the issue. We will assess the request against your legal rights and the payment circumstances.</p>
                <p>No provision in these terms limits mandatory consumer protection remedies.</p>
              </Section>

              <Section id="downloads" title="Downloads and access limits" index={9} reduceMotion={reduceMotion}>
                <p>Paid access and export functionality may be limited by time, account status, download allowance or plan features. Download restrictions are enforced through our application and may apply independently to PDF and editable Word formats.</p>
                <p>Each authorised export may consume part of your download allowance as described in the relevant offer and checkout experience. Once your allowance or access period is exhausted, you may need to purchase additional access before downloading again.</p>
                <p>File compatibility can vary by program and device. We recommend checking downloaded documents before submitting them to an employer.</p>
              </Section>

              <Section id="ai" title="AI-assisted features" index={10} reduceMotion={reduceMotion}>
                <p>Optional AI tools may suggest CV summaries, descriptions or other text. AI output can be incomplete, inaccurate or unsuitable for a particular role. You must review and edit it before using it.</p>
                <p>AI assistance does not replace professional, legal or recruitment advice. Inputs used for AI generation may be processed by a third-party provider as explained in our <Link href="/privacy-policy">Privacy Policy</Link>.</p>
              </Section>

              <Section id="acceptable-use" title="Acceptable use" index={11} reduceMotion={reduceMotion}>
                <p>Please use the platform lawfully and respectfully. You must not:</p>
                <Points>
                  <li>Attempt unauthorised access, bypass payment or download restrictions, or disrupt service operations.</li>
                  <li>Upload malicious code or material that infringes third-party rights.</li>
                  <li>Use the service to misrepresent another person's identity without permission.</li>
                  <li>Resell or systematically scrape our templates or platform functionality without authorisation.</li>
                </Points>
                <p>We may take proportionate action against misuse, subject to any applicable legal and contractual requirements.</p>
              </Section>

              <Section id="intellectual-property" title="Intellectual property" index={12} reduceMotion={reduceMotion}>
                <p>The platform interface, code, branding and original template designs may be protected by intellectual-property laws. Using our services does not transfer ownership of these elements to you.</p>
                <p>Subject to your payment and compliance with these terms, you may use your exported CV for your own applications and professional purposes. Your original personal content remains yours.</p>
              </Section>

              <Section id="availability" title="Availability and changes" index={13} reduceMotion={reduceMotion}>
                <p>We aim to make the service available, but maintenance, connectivity problems, third-party outages and security events can affect access. We may correct faults and update functionality or templates.</p>
                <p>If a failure triggers a right to a remedy under applicable consumer law, this section does not take that right away.</p>
              </Section>

              <Section id="liability" title="Liability and consumer rights" index={14} reduceMotion={reduceMotion}>
                <p>We do not promise employment outcomes, uninterrupted service or that every exported document will be suitable for every employer’s recruitment software. You remain responsible for reviewing your CV.</p>
                <p>Nothing in these terms excludes or limits liability or remedies that cannot lawfully be excluded or limited, including mandatory consumer rights or liability for fraud. Other limitations, if any, must be stated clearly and reviewed under the applicable law.</p>
              </Section>

              <Section id="privacy" title="Privacy and data protection" index={15} reduceMotion={reduceMotion}>
                <p>Our <Link href="/privacy-policy">Privacy Policy</Link> explains how account information, CV content, billing references and other personal data may be processed in connection with QORLIQ CV.</p>
              </Section>

              <Section id="changes" title="Changes to these terms" index={16} reduceMotion={reduceMotion}>
                <p>We may update these terms to reflect service, operational or legal changes. The latest version will appear on this page with an updated date. Changes affecting existing subscriptions or legal rights will be handled in accordance with applicable notice and consent requirements.</p>
              </Section>

              <Section id="contact" title="Contact and legal details" index={17} reduceMotion={reduceMotion}>
                <p>For account issues, cancellation concerns, payment queries or requests involving legal consumer rights, please use the contact channel currently provided on the QORLIQ CV website.</p>
                <div className="rounded-xl border border-border bg-background-soft px-4 py-4 sm:px-5">
                  <p className="font-semibold text-text-primary">QORLIQ CV — Customer support</p>
                  <p className="mt-1 text-[13px]">Legal operator, registered address and official support email: <strong>confirm before publication.</strong></p>
                  <Link href="/pricing" className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg font-semibold focus-visible:outline-2 focus-visible:outline-accent">View available plans <ArrowUpRight size={15} aria-hidden="true" /></Link>
                </div>
              </Section>
            </article>
          </div>
        </div>
      </main>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.06 }}
        transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
      >
     
      </motion.div>
    </>
  );
}
