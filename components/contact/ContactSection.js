"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Check,
  Copy,
  CreditCard,
  Headphones,
  Mail,
  Building2,
  Globe2,
  ExternalLink,
} from "lucide-react";

const EMAIL = "support@qorliqcv.com";
const EASE = [0.22, 1, 0.36, 1];
const channels = [
  {
    id: "billing",
    number: "01",
    heading: "Billing & subscriptions",
    detail: "Questions about a payment, invoice, subscription or access to a paid plan.",
    Icon: CreditCard,
    subject: "Billing enquiry — QORLIQ CV",
  },
  {
    id: "product",
    number: "02",
    heading: "CV & account support",
    detail: "Help with your account, editing your CV, templates and PDF or Word downloads.",
    Icon: Headphones,
    subject: "CV or account support — QORLIQ CV",
  },
];

function SupportCard({ channel, index, copied, onCopy, reduced }) {
  const { Icon } = channel;
  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduced ? 0 : 0.56, delay: reduced ? 0 : index * 0.07, ease: EASE }}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-border bg-surface p-5 shadow-[0_10px_35px_rgba(7,24,63,0.035)] transition-[border-color,box-shadow] duration-300 hover:border-accent/35 hover:shadow-[0_16px_42px_rgba(7,24,63,0.075)] sm:p-7 lg:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-border bg-background-soft text-text-primary transition-colors duration-300 group-hover:border-accent/25 group-hover:bg-accent/10 sm:h-14 sm:w-14">
          <Icon size={24} strokeWidth={1.65} aria-hidden="true" />
        </span>
        <span className="pt-1 text-[12px] font-medium tabular-nums text-text-muted">{channel.number} / 02</span>
      </div>
      <div className="mt-6 flex-1 sm:mt-8">
        <h3 className="text-[22px] font-semibold leading-[1.2] tracking-[-0.045em] text-text-primary sm:text-[25px]">{channel.heading}</h3>
        <p className="mt-3 max-w-[430px] text-[14px] leading-[1.8] text-text-secondary">{channel.detail}</p>
      </div>
      <div className="mt-7 border-t border-border pt-5 sm:mt-9">
        <p className="text-[12px] font-medium text-text-muted">Contact by email</p>
        <div className="mt-2 flex min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1 break-all text-[14px] font-semibold tracking-[-0.02em] text-text-primary sm:text-[15px]">{EMAIL}</span>
          <button
            type="button"
            onClick={() => onCopy(channel.id)}
            aria-label={copied ? "Email address copied" : "Copy support email address"}
            title={copied ? "Copied" : "Copy email"}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-background-soft text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {copied ? <Check size={16} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          </button>
        </div>
        <a
          href={`mailto:${EMAIL}?subject=${encodeURIComponent(channel.subject)}`}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#07183F] px-5 text-[13px] font-semibold text-white transition-all duration-200  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:bg-accent dark:text-[#07183F] dark:hover:opacity-90 sm:w-auto"
        >
          <Mail size={16} strokeWidth={1.9} aria-hidden="true" />
          Email support
          <ArrowUpRight size={16} strokeWidth={1.9} aria-hidden="true" />
        </a>
        <span role="status" className="ml-3 inline-block text-[12px] text-emerald-600 dark:text-emerald-400" aria-live="polite">{copied ? "Copied" : ""}</span>
      </div>
    </motion.article>
  );
}

export default function ContactSection() {
  const reduced = useReducedMotion();
  const [copied, setCopied] = useState("");
  const timer = useRef(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copyEmail(id) {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(id);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(""), 2200);
    } catch {
      // The mailto link remains available if clipboard permission is denied.
    }
  }

  return (
    <section id="contact-options" aria-labelledby="contact-heading" className="scroll-mt-28">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
        className="mb-6 sm:mb-8"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#078C88] dark:text-accent">Contact our team</p>
        <h2 id="contact-heading" className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-semibold leading-tight tracking-[-0.055em] text-text-primary">How can we help?</h2>
        <p className="mt-2 max-w-[590px] text-[14px] leading-[1.8] text-text-secondary">Select the right support team and email us directly. No forms or unnecessary steps.</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {channels.map((channel, index) => (
          <SupportCard key={channel.id} channel={channel} index={index} copied={copied === channel.id} onCopy={copyEmail} reduced={reduced} />
        ))}
      </div>

      <motion.aside
        initial={reduced ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.13 }}
        transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
        aria-labelledby="company-heading"
        className="mt-5 overflow-hidden rounded-[22px] border border-border bg-surface"
      >
        <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10 lg:p-8">
          <div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background-soft text-text-primary"><Building2 size={22} strokeWidth={1.65} aria-hidden="true" /></div>
            <h3 id="company-heading" className="mt-4 text-[21px] font-semibold tracking-[-0.045em] text-text-primary">Company information</h3>
            <p className="mt-2 max-w-[340px] text-[13px] leading-[1.8] text-text-secondary">QORLIQ is operated by a UK-registered company and serves customers internationally.</p>
            <p className="mt-4 inline-flex items-start gap-2 text-[12px] leading-6 text-text-muted"><Globe2 size={15} className="mt-1 shrink-0" aria-hidden="true" /> United Kingdom · International service</p>
          </div>
          <dl className="grid min-w-0 gap-x-6 gap-y-4 border-t border-border pt-6 sm:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div><dt className="text-[11px] text-text-muted">Brand</dt><dd className="mt-1 text-[13px] font-semibold text-text-primary">QORLIQ</dd></div>
            <div><dt className="text-[11px] text-text-muted">Company registration</dt><dd className="mt-1 text-[13px] font-semibold text-text-primary">15800546</dd></div>
            <div><dt className="text-[11px] text-text-muted">Operated by</dt><dd className="mt-1 text-[13px] font-semibold leading-6 text-text-primary">HOORAB GROUP OF COMPANIES LTD</dd></div>
            <div><dt className="text-[11px] text-text-muted">VAT number</dt><dd className="mt-1 text-[13px] font-semibold text-text-primary">GB-506539390</dd></div>
          </dl>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background-soft/50 px-5 py-3.5 sm:px-7 lg:px-8">
          <span className="text-[12px] text-text-secondary">Official website</span>
          <a href="https://www.qorliq.com/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 text-[13px] font-semibold text-[#2563a6] transition-colors hover:text-[#078C88] hover:underline focus-visible:outline-2 focus-visible:outline-accent dark:text-accent">
            www.qorliq.com <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </motion.aside>
    </section>
  );
}
