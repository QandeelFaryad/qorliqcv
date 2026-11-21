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
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";


const LAST_UPDATED = "20 November 2026";

const SECTIONS = [
  ["introduction", "Introduction"],
  ["information-we-collect", "Information we collect"],
  ["information-you-provide", "Information you provide"],
  ["automatically-collected-information", "Automatically collected information"],
  ["how-we-use-information", "How we use information"],
  ["storage-and-security", "Storage and security"],
  ["cookies-and-tracking", "Cookies and tracking"],
  ["third-party-services", "Third-party services"],
  ["data-sharing", "Data sharing and disclosure"],
  ["data-retention", "Data retention"],
  ["privacy-rights", "Your privacy rights"],
  ["international-transfers", "International transfers"],
  ["childrens-privacy", "Children’s privacy"],
  ["policy-changes", "Changes to this policy"],
  ["contact", "Contact us"],
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
      aria-label="Privacy policy contents"
    >
      <div className="border-l border-border py-1">
        <p className="mb-4 pl-4 text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
          On this page
        </p>
        <nav aria-label="Policy sections">
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
                        layoutId="qorliq-privacy-active-bar"
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

export default function PrivacyPolicyContent() {
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
              Your information matters
            </motion.div>
        <h1 className="text-[clamp(2.8rem,5.3vw,5.2rem)] font-bold leading-[1.08] tracking-[-0.065em] text-text-primary">
  Privacy Policy
  <span className="text-[#089D98] dark:text-accent">.</span>
</h1>
            <motion.p {...enter(0.08)} className="mt-5 max-w-[690px] text-[15px] leading-[1.85] text-text-secondary sm:text-[17px]">
              Understand what information QORLIQ CV handles, why it may be needed, and the choices available to you when you use our CV-building services.
            </motion.p>
            <motion.div {...enter(0.14)} className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border pb-8 text-[12px] text-text-muted sm:pb-9">
              <span className="inline-flex items-center gap-2"><FileText size={15} aria-hidden="true" /> Updated {LAST_UPDATED}</span>
              <span className="inline-flex items-center gap-2"><LockKeyhole size={15} aria-hidden="true" /> Privacy information</span>
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
                aria-controls="privacy-mobile-contents"
                className="flex min-h-13 w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13px] font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
              >
                <span className="inline-flex items-center gap-2"><FileText size={16} className="text-[#078C88] dark:text-accent" aria-hidden="true" /> Jump to a section</span>
                <ChevronDown size={18} className={`text-text-secondary transition-transform duration-200 ${mobileTOCOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {mobileTOCOpen && (
                <motion.nav
                  id="privacy-mobile-contents"
                  aria-label="Policy sections"
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
            <article className="min-w-0 max-w-[790px]" aria-label="Privacy policy details">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 13 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
              >
              <ReviewNote>
                This page is a draft. Confirm the operating entity, contact address, actual cookie providers, processing locations, retention periods, and any applicable AI-processing terms before publishing it as a binding policy.
              </ReviewNote>
              </motion.div>

              <Section id="introduction" title="Introduction" index={1} reduceMotion={reduceMotion}>
                <p>QORLIQ CV is an online platform for creating, editing, previewing and downloading CVs and resumes. This Privacy Policy explains the categories of personal information that may be processed when someone visits the website, creates an account, prepares a CV, purchases access or contacts support.</p>
                <p>References to “QORLIQ CV”, “we”, “us” and “our” relate to the organization operating the service. The identity and contact details of the relevant legal entity must be confirmed in the Contact section before this policy is published.</p>
              </Section>

              <Section id="information-we-collect" title="Information we collect" index={2} reduceMotion={reduceMotion}>
                <p>The information involved depends on how you use the platform. It can include:</p>
                <Points>
                  <li><strong>Account information:</strong> name, email address, sign-in details and account status.</li>
                  <li><strong>CV information:</strong> employment history, qualifications, contact information, skills, photographs and other details you choose to include.</li>
                  <li><strong>Transaction information:</strong> selected plan, subscription or purchase status, billing contact details and transaction references.</li>
                  <li><strong>Technical information:</strong> device, browser, approximate network details, session and diagnostic information where collected.</li>
                  <li><strong>Support communications:</strong> messages, requests and attachments that you submit to us.</li>
                </Points>
              </Section>

              <Section id="information-you-provide" title="Information you provide" index={3} reduceMotion={reduceMotion}>
                <p>When building a CV, you may submit information such as your name, professional summary, address or location, email, telephone number, employment and education history, projects, certifications, languages, achievements and references. Some CV layouts may also allow a profile photograph.</p>
                <p>Include only information you are entitled to share. If you add another person’s details (for example, a reference), you are responsible for ensuring that you have an appropriate basis to provide them.</p>
                <p>Where AI-assisted drafting features are used, the text you submit and relevant CV context may need to be processed to generate the requested output. Review the Third-party services section for further detail.</p>
              </Section>

              <Section id="automatically-collected-information" title="Automatically collected information" index={4} reduceMotion={reduceMotion}>
                <p>As with many web services, technical information may be processed to deliver pages, maintain sessions, prevent abuse and diagnose faults. Depending on the website configuration, this may include IP addresses, browser and operating-system details, timestamps, device properties, requested pages, error logs and security events.</p>
                <p>Optional analytics or marketing technologies should only be described as active here if they are actually enabled. See Cookies and tracking for information about browser controls.</p>
              </Section>

              <Section id="how-we-use-information" title="How we use information" index={5} reduceMotion={reduceMotion}>
                <p>Personal information may be processed to:</p>
                <Points>
                  <li>Create and maintain your account and authenticate sign-ins.</li>
                  <li>Save, edit, preview and export the CV information you request.</li>
                  <li>Administer purchases, subscriptions, access periods and download allowances.</li>
                  <li>Respond to support messages, service requests and account questions.</li>
                  <li>Operate, secure, maintain and improve the platform.</li>
                  <li>Investigate misuse, prevent fraud and meet applicable legal obligations.</li>
                </Points>
                <p>The legal basis for each activity depends on the relevant jurisdiction and circumstances; it may include performance of a contract, legal obligations, legitimate interests or consent where required. The controller should document its actual lawful bases before publication.</p>
              </Section>

              <Section id="storage-and-security" title="How we store and protect information" index={6} reduceMotion={reduceMotion}>
                <p>QORLIQ CV uses account and application infrastructure to support saved CVs, access management and related records. Information may be stored in databases and systems operated by QORLIQ CV or its service providers.</p>
                <p>Appropriate safeguards may include authentication, access restrictions, transport security, monitoring and other technical or organizational controls. No online service can promise absolute security. We do not claim any particular certification or encryption implementation without verification.</p>
                <ReviewNote>Confirm database/hosting providers, access restrictions, encryption arrangements, backup practices and the identity of the controller.</ReviewNote>
              </Section>

              <Section id="cookies-and-tracking" title="Cookies and tracking technologies" index={7} reduceMotion={reduceMotion}>
                <p>Cookies and similar browser technologies may be used to keep users signed in, maintain sessions, apply essential security controls and remember permitted preferences. Optional analytics or advertising cookies may be used only where the website actually implements them and any required permissions have been obtained.</p>
                <p>You can manage or remove cookies through your browser settings. Blocking essential cookies can prevent some account and sign-in features from working. If QORLIQ CV uses non-essential tracking, the live site should provide the appropriate notice and consent controls.</p>
                <ReviewNote>Audit the live cookie list and confirm whether analytics, advertising pixels or consent-management tools are enabled.</ReviewNote>
              </Section>

              <Section id="third-party-services" title="Third-party services" index={8} reduceMotion={reduceMotion}>
                <p>The application includes integrations for authentication, payments and optional AI-assisted CV functionality. Depending on which features you choose, relevant information may be processed through service providers such as:</p>
                <Points>
                  <li><strong>Stripe:</strong> payment and subscription processing, including payment status and transaction references. Payment-card entry may be handled using Stripe’s payment interface.</li>
                  <li><strong>Google sign-in:</strong> where a user selects Google authentication, account details needed for sign-in may be provided via the authentication flow.</li>
                  <li><strong>OpenAI:</strong> where AI-assisted CV writing is used, user-submitted prompts or relevant CV context may be sent for generation.</li>
                  <li><strong>Hosting and database providers:</strong> providers necessary to operate, store and deliver the service.</li>
                </Points>
                <p>These providers may publish separate privacy terms. Their exact roles, locations, retention settings and subprocessor arrangements should be checked against the production configuration before this document is published.</p>
              </Section>

              <Section id="data-sharing" title="Data sharing and disclosure" index={9} reduceMotion={reduceMotion}>
                <p>Information may be disclosed to service providers where needed to operate requested functions, respond to a valid legal requirement, investigate fraud or security incidents, protect legal rights, or where you have requested or authorized a disclosure.</p>
                <p>For example, generating an AI-assisted summary may involve submitting relevant text to the AI provider. Payment processing may require billing and transaction details to be shared with the payment provider.</p>
                <ReviewNote>Verify whether personal data is sold, shared for cross-context advertising, or otherwise disclosed for marketing. Do not publish an unverified “we never sell your data” statement.</ReviewNote>
              </Section>

              <Section id="data-retention" title="Data retention" index={10} reduceMotion={reduceMotion}>
                <p>Account, CV, billing, support and technical records may require different retention periods. Actual periods depend on service operation, contractual obligations, legitimate business needs and applicable recordkeeping laws.</p>
                <p>Requests to delete information may be subject to identity verification and any lawful retention requirements. Deleting a CV from the user interface does not necessarily remove related payment or legally required transaction records.</p>
                <ReviewNote>Add the actual CV/account deletion process, retention schedule, backup deletion timing and relevant statutory retention periods.</ReviewNote>
              </Section>

              <Section id="privacy-rights" title="Your privacy rights" index={11} reduceMotion={reduceMotion}>
                <p>Depending on where you live and which privacy laws apply, you may be entitled to request access to personal information, correction of inaccuracies, deletion, a portable copy, restriction of processing, or to object to some uses. Where consent is the applicable basis, you may also be able to withdraw it.</p>
                <p>Rights are not absolute and may have exceptions. We may need to verify your identity before acting on a request and may retain records where required by law. Privacy requests should be sent using the confirmed contact method in the Contact section.</p>
              </Section>

              <Section id="international-transfers" title="International data transfers" index={12} reduceMotion={reduceMotion}>
                <p>Using external hosting, authentication, payment or AI providers can involve processing information outside the country where you are located. Whether such transfers occur, and the safeguards needed, depend on the actual providers, data locations and applicable law.</p>
                <ReviewNote>Confirm the countries where CV content and account data are stored or accessed and document the appropriate legal transfer mechanisms, where applicable.</ReviewNote>
              </Section>

              <Section id="childrens-privacy" title="Children’s privacy" index={13} reduceMotion={reduceMotion}>
                <p>QORLIQ CV is designed for people preparing professional resumes and employment applications. The service’s minimum age requirement and any handling rules for minors must be confirmed against the applicable terms and markets before publication.</p>
                <ReviewNote>Specify a verified minimum age and the process for responding to concerns about a minor’s personal data.</ReviewNote>
              </Section>

              <Section id="policy-changes" title="Changes to this Privacy Policy" index={14} reduceMotion={reduceMotion}>
                <p>We may update this notice as services, providers or legal requirements change. Revised versions may be published on this page with an updated date. Where applicable law requires additional notice or consent for a material change, the operator must follow those requirements.</p>
              </Section>

              <Section id="contact" title="Contact us" index={15} reduceMotion={reduceMotion}>
                <p>If you have a question about this policy or wish to make a privacy-related request, please use the QORLIQ CV website’s existing contact channel until a dedicated privacy contact is formally designated.</p>
                <div className="rounded-xl border border-border bg-background-soft px-4 py-4 sm:px-5">
                  <p className="font-semibold text-text-primary">QORLIQ CV — Privacy enquiries</p>
                  <p className="mt-1 text-[13px]">Contact details, controller’s legal name and registered business address: <strong>to be confirmed before publication.</strong></p>
                  <Link href="/" className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg font-semibold focus-visible:outline-2 focus-visible:outline-accent">
                    Return to QORLIQ CV <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
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
