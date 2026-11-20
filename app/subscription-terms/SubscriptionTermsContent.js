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
  ["introduction", "Introduction"],
  ["available-plans", "Available access plans"],
  ["checkout", "Prices and checkout"],
  ["renewals", "Renewals and recurring payments"],
  ["access", "Access periods and expiration"],
  ["downloads", "Download allowances"],
  ["cancellation", "How to cancel"],
  ["after-cancellation", "What happens after cancellation"],
  ["refunds", "Refund and no-refund policy"],
  ["consumer-rights", "Your statutory rights"],
  ["payment-failures", "Failed and disputed payments"],
  ["changes", "Plan and price changes"],
  ["availability", "Service availability"],
  ["accounts", "Account and CV information"],
  ["contact", "Support and related policies"],
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
      aria-label="Subscription terms contents"
    >
      <div className="border-l border-border py-1">
        <p className="mb-4 pl-4 text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
          On this page
        </p>
        <nav aria-label="Subscription sections">
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
                        layoutId="qorliq-subscription-active-bar"
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

export default function SubscriptionTermsContent() {
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
              Transparent subscription information
            </motion.div>
            <h1 className="text-[clamp(2.6rem,6vw,4.25rem)] font-semibold leading-[1.05] tracking-[-0.07em] text-text-primary">
              Subscription Terms<span className="text-[#089D98] dark:text-accent">.</span>
            </h1>
            <motion.p {...enter(0.08)} className="mt-5 max-w-[690px] text-[15px] leading-[1.85] text-text-secondary sm:text-[17px]">
              Understand your QORLIQ CV access, billing, download allowances, cancellation and refund conditions before you subscribe. Important payment terms are highlighted for clarity.
            </motion.p>
            <motion.div {...enter(0.14)} className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border pb-8 text-[12px] text-text-muted sm:pb-9">
              <span className="inline-flex items-center gap-2"><FileText size={15} aria-hidden="true" /> Updated {LAST_UPDATED}</span>
              <span className="inline-flex items-center gap-2"><LockKeyhole size={15} aria-hidden="true" /> Billing & access terms</span>
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
                aria-controls="subscription-mobile-contents"
                className="flex min-h-13 w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13px] font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
              >
                <span className="inline-flex items-center gap-2"><FileText size={16} className="text-[#078C88] dark:text-accent" aria-hidden="true" /> Jump to a section</span>
                <ChevronDown size={18} className={`text-text-secondary transition-transform duration-200 ${mobileTOCOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {mobileTOCOpen && (
                <motion.nav
                  id="subscription-mobile-contents"
                  aria-label="Subscription sections"
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
            <article className="min-w-0 max-w-[790px]" aria-label="Subscription terms details">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 13 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
              >
                <ReviewNote>
                  Before publishing, confirm each plan’s renewal settings, cancellation timing, actual download limits, checkout disclosures, legal operator and contact details. The text below must match the live product and applicable consumer law.
                </ReviewNote>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
                className="mt-7 rounded-2xl border border-amber-300/60 bg-amber-50 p-5 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100 sm:p-6"
              >
                <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.10em]"><CreditCard size={16} aria-hidden="true" /> Cancellation & refund summary</div>
                <p className="mt-3 text-[15px] font-semibold leading-7">Cancelling your subscription does not automatically refund money already paid.</p>
                <p className="mt-2 text-[13px] leading-6">We do not ordinarily provide refunds or prorated credits for unused time following voluntary cancellation. This policy is subject to mandatory consumer rights, including any applicable cooling-off or faulty-service remedies.</p>
                <a href="#refunds" onClick={(event) => navigateToSection(event, "refunds")} className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold underline underline-offset-4">Read the refund policy <ArrowUpRight size={14} aria-hidden="true" /></a>
              </motion.div>

              <Section id="introduction" title="Introduction" index={1} reduceMotion={reduceMotion}>
                <p>These Subscription Terms describe how paid access to QORLIQ CV works, including plan duration, payment, cancellation, downloads and refunds. They apply alongside our <Link href="/terms-and-conditions">Terms &amp; Conditions</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.</p>
                <p>Review the pricing and plan details shown at checkout. If an offer or checkout confirmation gives specific terms that differ from a general description on this page, those purchase-specific terms should be examined together with applicable law.</p>
              </Section>

              <Section id="available-plans" title="Available access plans" index={2} reduceMotion={reduceMotion}>
                <p>QORLIQ CV may offer a short-duration one-time access option and longer-duration paid plans. Plan availability, included benefits and exact pricing are shown on our <Link href="/pricing">Pricing page</Link> and at checkout.</p>
                <Points>
                  <li><strong>One-time access:</strong> a limited access window specified at purchase; it is not automatically a recurring subscription.</li>
                  <li><strong>Longer access plans:</strong> access may be offered for three months, six months or a year, depending on current offers.</li>
                  <li><strong>Plan features:</strong> each plan can have its own download allowance and access limits, which should be displayed before payment.</li>
                </Points>
                <p>Do not assume that a three-month, six-month or annual label means automatic renewal. A charge only recurs where recurring billing is expressly disclosed at checkout and the selected payment arrangement supports it.</p>
              </Section>

              <Section id="checkout" title="Prices and checkout" index={3} reduceMotion={reduceMotion}>
                <p>The amount payable, currency, taxes (where applicable), included features and any recurring billing schedule should be disclosed before the order is confirmed. Prices displayed for future purchases may change, subject to applicable law.</p>
                <p>Payments are handled using our Stripe payment integration. Payment information may be processed by Stripe in accordance with its own terms and privacy information; QORLIQ CV may receive payment status, customer and transaction references needed to manage your access.</p>
                <ReviewNote>Check how tax, one-time payment vs subscription, billing interval, and any customer consent requirements are presented in the live checkout.</ReviewNote>
              </Section>

              <Section id="renewals" title="Renewals and recurring payments" index={4} reduceMotion={reduceMotion}>
                <p>If you select an <strong>automatically renewing subscription</strong>, the renewal interval, payment amount and cancellation method must be clearly presented before purchase. Where enabled, recurring charges can continue until the subscription is cancelled or otherwise ends, in line with the terms presented at purchase.</p>
                <p>If your plan is a <strong>fixed-term, non-renewing purchase</strong>, paid access ends on the stated expiration date unless you choose to purchase another plan. No recurring payment should be implied for such a purchase.</p>
                <p>Check your checkout confirmation, billing dashboard and Stripe payment confirmation to understand which type of access you purchased.</p>
                <ReviewNote>Confirm whether the live three-month, six-month and annual plans use Stripe subscriptions or fixed-term payments and that the user interface accurately reflects their renewal status.</ReviewNote>
              </Section>

              <Section id="access" title="Access periods and expiration" index={5} reduceMotion={reduceMotion}>
                <p>Paid features are available only during the access period and while your account has the necessary entitlement. The start and expiry dates may be recorded in your account and shown in your dashboard.</p>
                <p>When access expires, is cancelled or is otherwise no longer active, the service may prevent new CV downloads until you purchase or restore valid access. You may still have access to some free account features, depending on the functionality available at that time.</p>
                <p>Saving or drafting a CV does not extend a paid access period unless the relevant offer expressly provides otherwise.</p>
              </Section>

              <Section id="downloads" title="Download allowances" index={6} reduceMotion={reduceMotion}>
                <p>Download limits may apply even when a plan is active. Each authorised PDF or Word export may count toward the download allowance for your account. The current dashboard may display your remaining allowance.</p>
                <p>After the limit is reached, the service can refuse further exports and display an option to purchase more access. Do not assume a subscription includes unlimited downloads unless explicitly described as such at checkout.</p>
                <p>Please check exported files for accuracy and compatibility with the software in which you intend to use them.</p>
              </Section>

              <Section id="cancellation" title="How to cancel" index={7} reduceMotion={reduceMotion}>
                <p>Where self-service cancellation is available, you can request cancellation using the subscription controls in your account dashboard. If you cannot access those controls, use the contact method available on our website for assistance.</p>
                <p>When you cancel, review any confirmation shown on screen. It should explain whether cancellation takes effect immediately or at the end of a billing period, and whether any future charges remain scheduled.</p>
                <p>If you purchased a one-time, non-recurring access option, there may be no future subscription charge to cancel. This does not by itself create a right to reverse the completed purchase.</p>
              </Section>

              <Section id="after-cancellation" title="What happens after cancellation" index={8} reduceMotion={reduceMotion}>
                <p><strong>Cancellation is not a refund.</strong> Cancelling stops or changes access and future billing as specified in the cancellation confirmation, but it does not automatically repay fees already charged.</p>
                <p>Depending on how your subscription was set up, cancellation may remove paid access when processed rather than leaving access active until the original expiry date. Check the actual effective date shown in your account.</p>
                <p>We recommend downloading any documents you need while your paid access remains valid and within your download allowance. Your account and personal information remain subject to our <Link href="/privacy-policy">Privacy Policy</Link>.</p>
                <ReviewNote>Verify that the dashboard confirmation matches the exact Stripe cancellation operation and the application’s immediate access-reset behaviour.</ReviewNote>
              </Section>

              <Section id="refunds" title="Refund and no-refund policy" index={9} reduceMotion={reduceMotion}>
                <p><strong>Standard policy:</strong> subscription and access fees already paid are not automatically refundable because you voluntarily cancel, stop using the service, change your mind after any legally applicable cancellation period or leave time or downloads unused.</p>
                <p>We do not ordinarily offer partial or prorated refunds for unused subscription time solely due to voluntary cancellation.</p>
                <p><strong>Exceptions required by law:</strong> these conditions do not override mandatory rights to cancel within an applicable cooling-off period, obtain remedies for digital content or services not supplied as legally required, challenge unauthorised payments, or use other non-excludable consumer protections.</p>
                <p>If you believe a legal refund right applies, contact support with the account email, transaction date, payment reference (if available), and a summary of the problem. Requests should be reviewed according to the transaction and relevant law.</p>
              </Section>

              <Section id="consumer-rights" title="Your statutory rights" index={10} reduceMotion={reduceMotion}>
                <p>Consumer protections vary by location, purchase type and circumstances. A digital service or digital-content purchase may carry mandatory cancellation, quality or delivery rights.</p>
                <p>Where the law requires specific consent or acknowledgement before access begins and a statutory cancellation right can be lost, we will not assume that right has been waived unless the required conditions were met. Nothing in these Subscription Terms excludes mandatory legal protections.</p>
                <p>These terms are intended to explain QORLIQ CV’s standard commercial policy, not replace rights that the law guarantees.</p>
              </Section>

              <Section id="payment-failures" title="Failed and disputed payments" index={11} reduceMotion={reduceMotion}>
                <p>If a payment fails, is delayed or cannot be verified, access may not activate or renew until the payment is successfully confirmed. Please avoid repeated checkout attempts if a payment is still processing.</p>
                <p>For suspected duplicate or unauthorised charges, contact support and your payment provider with the relevant transaction details. Nothing here limits your legal rights regarding unauthorised transactions or payment disputes.</p>
              </Section>

              <Section id="changes" title="Plan and price changes" index={12} reduceMotion={reduceMotion}>
                <p>We may offer new plans, change availability or adjust prices for future purchases. A change to the price or material terms of an existing recurring agreement will be handled according to the terms disclosed at purchase and any applicable notice, consent and cancellation requirements.</p>
                <p>Features, templates and download rules may evolve over time. We will not treat such changes as removing rights that cannot legally be excluded.</p>
              </Section>

              <Section id="availability" title="Service availability" index={13} reduceMotion={reduceMotion}>
                <p>Internet connectivity, maintenance and third-party outages can affect our ability to process payments or generate downloads. A temporary technical issue does not automatically mean that a payment has failed or a new purchase is required.</p>
                <p>If you experience an access or export error, check your account status and contact support before making repeated payments. Any remedies required by law remain available.</p>
              </Section>

              <Section id="accounts" title="Account and CV information" index={14} reduceMotion={reduceMotion}>
                <p>You are responsible for maintaining accurate account information and keeping your login credentials secure. CV details and account data are handled in accordance with our <Link href="/privacy-policy">Privacy Policy</Link>.</p>
                <p>Subscription cancellation does not necessarily delete your account or CV content. Account deletion and personal-data requests, where available, are separate processes described in the Privacy Policy and support information.</p>
              </Section>

              <Section id="contact" title="Support and related policies" index={15} reduceMotion={reduceMotion}>
                <p>For subscription questions, account access, cancellation, suspected duplicate charges or legally required refund requests, use the support channel listed on the QORLIQ CV website.</p>
                <div className="rounded-xl border border-border bg-background-soft px-4 py-4 sm:px-5">
                  <p className="font-semibold text-text-primary">QORLIQ CV — Subscription support</p>
                  <p className="mt-1 text-[13px]">Operating entity, registered address and official privacy / subscription support contact: <strong>confirm before publication.</strong></p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                    <Link href="/pricing" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg font-semibold focus-visible:outline-2 focus-visible:outline-accent">View plans <ArrowUpRight size={15} aria-hidden="true" /></Link>
                    <Link href="/terms-and-conditions" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg font-semibold focus-visible:outline-2 focus-visible:outline-accent">General terms <ArrowUpRight size={15} aria-hidden="true" /></Link>
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
