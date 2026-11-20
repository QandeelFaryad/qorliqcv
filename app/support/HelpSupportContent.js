"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown, CircleHelp, Mail, ShieldCheck, FileText } from "lucide-react";
import ContactSection from "@/components/contact/ContactSection";

const EASE = [0.22, 1, 0.36, 1];
const FAQs = [
  {
    question: "How can I contact support?",
    answer: "Choose Billing & subscriptions or CV & account support above, then select Email support. Your device will open its configured email application with support@qorliqcv.com as the recipient.",
  },
  {
    question: "I've paid but can't access my CV. What should I do?",
    answer: "Make sure you're signed in with the account used at checkout. If you still cannot access your CV, email us with your account email, payment date and a brief description. Never send your password or full payment card details.",
  },
  {
    question: "What if my PDF or Word download isn't working?",
    answer: "Check your internet connection, subscription access and available download allowance. If the issue continues, email support with the file format, browser, device and any error message you see.",
  },
  {
    question: "Can I cancel my subscription?",
    answer: "You can manage available subscription controls from your account's billing section. Cancelling does not automatically refund previously paid fees, except where applicable law gives you refund rights. Contact billing support for assistance.",
  },
  {
    question: "How do I ask about privacy or my personal information?",
    answer: "Email support@qorliqcv.com from your account email and explain your request. We may need to confirm account ownership before processing requests involving personal information.",
  },
];

function FAQRow({ faq, index, expanded, onToggle, reduced }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={`help-answer-${index}`}
          className="group flex min-h-[70px] w-full cursor-pointer items-center justify-between gap-5 py-5 text-left text-[14px] font-semibold leading-6 text-text-primary transition-colors hover:text-[#078C88] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:hover:text-accent sm:text-[15px]"
        >
          <span>{faq.question}</span>
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${expanded ? "border-accent/30 bg-accent/10 text-[#078C88] dark:text-accent" : "border-border text-text-muted group-hover:border-accent/30"}`}>
            <ChevronDown size={16} aria-hidden="true" className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={`help-answer-${index}`}
            key="answer"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="max-w-[760px] pb-6 pr-7 text-[13px] leading-[1.9] text-text-secondary sm:text-[14px]">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpSupportContent() {
  const reduced = useReducedMotion();
  const [activeFAQ, setActiveFAQ] = useState(null);
  const entrance = (delay = 0) => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.58, delay: reduced ? 0 : delay, ease: EASE },
  });
  const reveal = {
    initial: reduced ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.1 },
    transition: { duration: reduced ? 0 : 0.55, ease: EASE },
  };

  return (
    <main className="min-h-[70dvh] bg-background text-text-primary">
      <div className="mx-auto w-full max-w-[1160px] px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8 lg:pt-16">
        <header className="max-w-[730px]">
          <motion.div {...entrance()} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[11px] font-medium text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-[#078C88] dark:bg-accent" aria-hidden="true" /> Help centre
          </motion.div>
          <motion.h1 {...entrance(0.06)} className="mt-5 text-[clamp(2.65rem,6vw,4.5rem)] font-semibold leading-[1.07] tracking-[-0.072em] text-text-primary">
            We're here to help<span className="text-[#078C88] dark:text-accent">.</span>
          </motion.h1>
          <motion.p {...entrance(0.12)} className="mt-4 max-w-[620px] text-[15px] leading-[1.85] text-text-secondary sm:text-[17px]">
            Get straightforward support for billing, your account and CV downloads. Choose a topic and contact us directly by email.
          </motion.p>
          <motion.div {...entrance(0.18)} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-text-muted">
            <span className="inline-flex items-center gap-2"><Mail size={15} aria-hidden="true" /> Direct email support</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck size={15} aria-hidden="true" /> No forms to complete</span>
          </motion.div>
        </header>

        <div className="mt-11 sm:mt-14"><ContactSection /></div>

        <motion.section {...reveal} aria-labelledby="faq-heading" className="mt-16 sm:mt-20">
          <div className="mb-6 sm:mb-7">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#078C88] dark:text-accent"><CircleHelp size={15} aria-hidden="true" /> Common questions</p>
            <h2 id="faq-heading" className="mt-3 text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold leading-tight tracking-[-0.055em]">Frequently asked questions</h2>
            <p className="mt-2 text-[14px] leading-7 text-text-secondary">Find a quick answer before getting in touch.</p>
          </div>
          <div className="rounded-[22px] border border-border bg-surface px-5 sm:px-8">
            {FAQs.map((faq, index) => (
              <FAQRow
                key={faq.question}
                faq={faq}
                index={index}
                expanded={activeFAQ === index}
                onToggle={() => setActiveFAQ((current) => current === index ? null : index)}
                reduced={reduced}
              />
            ))}
          </div>
        </motion.section>

        <motion.section {...reveal} aria-labelledby="still-help-heading" className="mt-7 flex flex-col items-start justify-between gap-5 rounded-[22px] border border-border bg-background-soft px-5 py-6 sm:flex-row sm:items-center sm:px-7 sm:py-7">
          <div>
            <h2 id="still-help-heading" className="text-[19px] font-semibold tracking-[-0.045em]">Still need assistance?</h2>
            <p className="mt-1 text-[13px] leading-7 text-text-secondary">Send our team a short message and include the relevant details.</p>
          </div>
          <a href="mailto:support@qorliqcv.com?subject=Support%20enquiry%20%E2%80%94%20QORLIQ%20CV" className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#07183F] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#102B66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:bg-accent dark:text-[#07183F] sm:w-auto">
            <Mail size={16} aria-hidden="true" /> Contact support <ArrowRight size={16} aria-hidden="true" />
          </a>
        </motion.section>

        <motion.nav {...reveal} aria-label="Related information" className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-[12px] text-text-secondary">
          <span className="inline-flex items-center gap-1.5 font-semibold text-text-primary"><FileText size={15} aria-hidden="true" /> Useful links</span>
          <Link href="/privacy-policy" className="hover:text-[#078C88] hover:underline focus-visible:outline-2 focus-visible:outline-accent dark:hover:text-accent">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="hover:text-[#078C88] hover:underline focus-visible:outline-2 focus-visible:outline-accent dark:hover:text-accent">Terms & Conditions</Link>
          <Link href="/subscription-terms" className="hover:text-[#078C88] hover:underline focus-visible:outline-2 focus-visible:outline-accent dark:hover:text-accent">Subscription Terms</Link>
          <Link href="/cookie-policy" className="hover:text-[#078C88] hover:underline focus-visible:outline-2 focus-visible:outline-accent dark:hover:text-accent">Cookie Policy</Link>
        </motion.nav>
      </div>
    </main>
  );
}
