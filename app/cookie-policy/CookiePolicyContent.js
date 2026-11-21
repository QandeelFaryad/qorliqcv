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
  Cookie,
  Settings2,
  ShieldCheck,
} from "lucide-react";


const LAST_UPDATED = "20 November 2026";

const SECTIONS = [
  ["overview", "Overview"],
  ["cookies-explained", "What cookies are"],
  ["types", "Types of cookies"],
  ["essential", "Strictly necessary cookies"],
  ["preferences", "Preference cookies"],
  ["analytics", "Analytics and performance"],
  ["marketing", "Advertising and marketing"],
  ["authentication", "Account and session cookies"],
  ["payments", "Payments and third-party tools"],
  ["choices", "Your cookie choices"],
  ["browser", "Browser controls"],
  ["retention", "Cookie duration and retention"],
  ["updates", "Updates to this policy"],
  ["contact", "Contact and related policies"],
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
      aria-label="Cookie policy contents"
    >
      <div className="border-l border-border py-1">
        <p className="mb-4 pl-4 text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
          On this page
        </p>
        <nav aria-label="Cookie policy sections">
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
                    className={`relative flex min-h-9 items-center gap-2.5 rounded-r-lg px-4 py-2 text-[12px] leading-[1.45] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${selected ? "bg-accent/10 font-semibold text-[#078C88] dark:text-accent" : "text-text-secondary hover:bg-background-soft hover:text-[#078C88] dark:hover:text-accent"}`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="qorliq-cookie-active-bar"
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

export default function CookiePolicyContent() {
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
      behavior: reduceMotion ? "auto" : "smooth",
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
              Transparent cookie information
            </motion.div>
          <h1 className="text-[clamp(2.8rem,5.3vw,5.2rem)] font-bold leading-[1.08] tracking-[-0.065em] text-text-primary">
  Cookie Policy
  <span className="text-[#089D98] dark:text-accent">.</span>
</h1>
            <motion.p {...enter(0.08)} className="mt-5 max-w-[690px] text-[15px] leading-[1.85] text-text-secondary sm:text-[17px]">
              Learn how cookies and similar technologies may be used on QORLIQ CV, which choices are available to you, and how to manage them. We explain what is known and identify settings that require confirmation.
            </motion.p>
            <motion.div {...enter(0.14)} className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border pb-8 text-[12px] text-text-muted sm:pb-9">
              <span className="inline-flex items-center gap-2"><FileText size={15} aria-hidden="true" /> Updated {LAST_UPDATED}</span>
              <span className="inline-flex items-center gap-2"><Cookie size={15} aria-hidden="true" /> Cookies & privacy</span>
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
                aria-controls="cookie-mobile-contents"
                className="flex min-h-13 w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13px] font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
              >
                <span className="inline-flex items-center gap-2"><FileText size={16} className="text-[#078C88] dark:text-accent" aria-hidden="true" /> Jump to a section</span>
                <ChevronDown size={18} className={`text-text-secondary transition-transform duration-200 ${mobileTOCOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {mobileTOCOpen && (
                <motion.nav
                  id="cookie-mobile-contents"
                  aria-label="Cookie policy sections"
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
                          className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-[13px] focus-visible:outline-2 focus-visible:outline-accent ${activeId === id ? "bg-accent/10 font-semibold text-[#078C88] dark:text-accent" : "text-text-secondary hover:bg-background-soft hover:text-[#078C88] dark:hover:text-accent"}`}
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
            <article className="min-w-0 max-w-[790px]" aria-label="Cookie policy details">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 13 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
              >
                <ReviewNote>
                  Before publishing, audit the cookies, SDKs, storage entries and third-party scripts actually used in production. Confirm their names, providers, purposes, durations, consent mechanism and cookie contact details. Do not publish unverified claims.
                </ReviewNote>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
                className="mt-7 rounded-2xl border border-border bg-background-soft p-5 sm:p-6"
              >
                <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.10em] text-text-primary">
                  <Settings2 size={16} className="text-[#078C88] dark:text-accent" aria-hidden="true" /> Your cookie choices
                </div>
                <p className="mt-3 text-[15px] font-semibold leading-7 text-text-primary">You can manage cookies through your browser and, where offered, the site's cookie preference controls.</p>
                <p className="mt-2 text-[13px] leading-6 text-text-secondary">Blocking essential cookies may prevent sign-in, account security, checkout or other core features from working. Optional cookies should be subject to the consent choices required by applicable law.</p>
                <a href="#choices" onClick={(event) => navigateToSection(event, "choices")} className="mt-3 inline-flex min-h-9 items-center gap-1 text-[13px] font-semibold text-[#2563a6] underline underline-offset-4 dark:text-accent">Understand your options <ArrowUpRight size={14} aria-hidden="true" /></a>
              </motion.div>

              <Section id="overview" title="Overview" index={1} reduceMotion={reduceMotion}>
                <p>This Cookie Policy explains the use of cookies and similar browser technologies in connection with QORLIQ CV. It should be read together with our <Link href="/privacy-policy">Privacy Policy</Link> and <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>.</p>
                <p>Cookies can help deliver website features and remember information across visits. Some are required to operate a service, while others may be optional and used only if enabled on the site.</p>
              </Section>

              <Section id="cookies-explained" title="What cookies are" index={2} reduceMotion={reduceMotion}>
                <p>A cookie is a small file that a website asks your browser to store on your device. Similar mechanisms can include local storage, session storage and other identifiers. Their legal treatment may depend on the technology and jurisdiction.</p>
                <p>Cookies may be <strong>first-party</strong> (set by the site you visit) or <strong>third-party</strong> (set by another provider). A session cookie may expire when you close your browser; a persistent cookie may remain until it expires or you delete it.</p>
              </Section>

              <Section id="types" title="Types of cookies" index={3} reduceMotion={reduceMotion}>
                <p>Cookies and similar technologies are commonly grouped by purpose. QORLIQ CV should only claim to use a category below when its production implementation has been verified.</p>
                <Points>
                  <li><strong>Strictly necessary:</strong> authentication, secure sessions and essential technical operations.</li>
                  <li><strong>Preferences:</strong> remembering user-selected settings such as display preferences.</li>
                  <li><strong>Analytics:</strong> understanding site usage, performance or errors where deployed.</li>
                  <li><strong>Marketing:</strong> measuring campaigns or supporting advertising, if those tools are deployed.</li>
                </Points>
              </Section>

              <Section id="essential" title="Strictly necessary cookies" index={4} reduceMotion={reduceMotion}>
                <p>Essential cookies or equivalent technologies may be necessary to keep you signed in, secure access to your account, protect against misuse and maintain service continuity. Some functions may not work without them.</p>
                <p>These technologies should be limited to their necessary functions. Their exact names and expiry periods must be confirmed from the live application before publication.</p>
              </Section>

              <Section id="preferences" title="Preference cookies" index={5} reduceMotion={reduceMotion}>
                <p>Preference technologies can remember settings you select, such as a preferred appearance or other interface options. QORLIQ CV's current interface may store appearance settings locally in the browser rather than in a traditional cookie.</p>
                <p>Where a choice is stored, you may be able to change it using the relevant website setting or clear the corresponding browser storage. Whether consent is required depends on the purpose and applicable rules.</p>
              </Section>

              <Section id="analytics" title="Analytics and performance" index={6} reduceMotion={reduceMotion}>
                <p>Analytics tools, if installed, may gather information about visits, page use, device characteristics and performance to help diagnose issues and improve the website. Some tools use cookies, while others use different technologies.</p>
                <p><strong>Implementation check:</strong> confirm whether QORLIQ CV uses any analytics provider, including its identity, the information collected, retention and the consent mechanism before naming the provider or making a claim about analytics cookies.</p>
              </Section>

              <Section id="marketing" title="Advertising and marketing" index={7} reduceMotion={reduceMotion}>
                <p>If advertising pixels, conversion tags or remarketing technologies are added to QORLIQ CV, they may be used to understand campaign performance or display relevant advertisements, subject to applicable requirements and user choices.</p>
                <p>This description <strong>does not mean</strong> that marketing trackers are currently active. Verify deployed scripts and configure any required consent before enabling non-essential marketing technologies.</p>
              </Section>

              <Section id="authentication" title="Account and session cookies" index={8} reduceMotion={reduceMotion}>
                <p>QORLIQ CV supports user accounts and sign-in. The authentication system may rely on session cookies to recognise signed-in users, protect sessions and apply access rules for CV creation and downloads.</p>
                <p>Depending on your sign-in method, authentication providers may process information under their own policies. Signing out or clearing browser data can affect your session and may require you to sign in again.</p>
              </Section>

              <Section id="payments" title="Payments and third-party tools" index={9} reduceMotion={reduceMotion}>
                <p>QORLIQ CV integrates Stripe for payments. During checkout, Stripe may use cookies or similar security and fraud-prevention technologies in accordance with its own documentation and privacy policy.</p>
                <p>Some website features may also use external providers for sign-in or AI-assisted CV content. Their use of browser storage, if any, depends on the actual integration. Review each service before adding it to a definitive cookie inventory.</p>
                <ReviewNote>Confirm all live third-party scripts, their cookie names, purposes, expiry periods, consent categories and links to provider notices.</ReviewNote>
              </Section>

              <Section id="choices" title="Your cookie choices" index={10} reduceMotion={reduceMotion}>
                <p>Where the website offers a cookie banner or preference centre, you should be able to use it to make the choices offered there. Any controls described publicly must be implemented and work as described.</p>
                <p>You can also control many cookies through your browser. Necessary cookies may still be required for core functionality. If the site has not yet implemented a consent-management interface, it should not claim that visitors can change their choices using a non-existent on-site panel.</p>
                <ReviewNote>Confirm whether a cookie banner / preference centre exists and add a working link or button here only after it is implemented.</ReviewNote>
              </Section>

              <Section id="browser" title="Browser controls" index={11} reduceMotion={reduceMotion}>
                <p>Most browsers let you view stored website information, block particular cookies, clear cookies or limit third-party tracking through their privacy settings. The exact steps vary by browser and device.</p>
                <Points>
                  <li>Use your browser's privacy or site-data settings to inspect and remove stored cookies.</li>
                  <li>Restrict third-party cookies or tracking if supported by your browser.</li>
                  <li>Remember that removing site data may sign you out and reset preferences.</li>
                </Points>
              </Section>

              <Section id="retention" title="Cookie duration and retention" index={12} reduceMotion={reduceMotion}>
                <p>Some browser storage is temporary and is removed at the end of a session. Other entries may remain for a defined period, until replaced, or until you delete them. Providers can set different expiry periods for different purposes.</p>
                <p>QORLIQ CV should publish a verified inventory listing each non-essential cookie or similar tracker, its provider, purpose and duration once those details are confirmed.</p>
              </Section>

              <Section id="updates" title="Updates to this policy" index={13} reduceMotion={reduceMotion}>
                <p>We may revise this policy when website features, third-party services or relevant requirements change. The latest version will be published on this page with an updated date.</p>
                <p>Changes affecting optional tracking should also be reflected in the site's actual consent and preference mechanisms, where required.</p>
              </Section>

              <Section id="contact" title="Contact and related policies" index={14} reduceMotion={reduceMotion}>
                <p>For questions about cookies or your privacy choices, use the support or contact channel published on QORLIQ CV.</p>
                <div className="rounded-xl border border-border bg-background-soft px-4 py-4 sm:px-5">
                  <p className="font-semibold text-text-primary">QORLIQ CV — Privacy inquiries</p>
                  <p className="mt-1 text-[13px]">Official legal entity, contact address and privacy contact: <strong>confirm before publication.</strong></p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                    <Link href="/privacy-policy" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg font-semibold focus-visible:outline-2 focus-visible:outline-accent">Privacy Policy <ArrowUpRight size={15} aria-hidden="true" /></Link>
                    <Link href="/contact" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg font-semibold focus-visible:outline-2 focus-visible:outline-accent">Contact <ArrowUpRight size={15} aria-hidden="true" /></Link>
                  </div>
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
