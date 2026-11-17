"use client";

import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";

/*
 * SAMPLE LOGOS ONLY. Replace this list with companies you have verified
 * QORLIQ CV customers actually joined before publishing a hiring claim.
 * Logos are inline SVG, so no remote image requests or Next.js image config.
 */

function GoogleLogo() {
  return (
    <span className="inline-flex items-center gap-2.5" aria-hidden="true">
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0" fill="none">
        <path fill="#4285F4" d="M43.6 24.5c0-1.5-.1-3-.4-4.5H24v8.5h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15.3Z" />
        <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1a12.3 12.3 0 0 1-18.4-6.4H5.7v5.3A20 20 0 0 0 24 44Z" />
        <path fill="#FBBC05" d="M12.5 27.6a12.3 12.3 0 0 1 0-7.2v-5.3H5.7a20 20 0 0 0 0 17.8l6.8-5.3Z" />
        <path fill="#EA4335" d="M24 12a10.9 10.9 0 0 1 7.8 3l5.9-5.8A19.2 19.2 0 0 0 24 4 20 20 0 0 0 5.7 15.1l6.8 5.3A12 12 0 0 1 24 12Z" />
      </svg>
      <span className="text-[21px] font-semibold tracking-[-0.055em] text-[#5F6368] dark:text-[#E8EAED]">Google</span>
    </span>
  );
}

function MicrosoftLogo() {
  return (
    <span className="inline-flex items-center gap-2.5" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0">
        <path fill="#F25022" d="M0 0h11v11H0z" />
        <path fill="#7FBA00" d="M13 0h11v11H13z" />
        <path fill="#00A4EF" d="M0 13h11v11H0z" />
        <path fill="#FFB900" d="M13 13h11v11H13z" />
      </svg>
      <span className="text-[20px] font-semibold tracking-[-0.055em] text-[#5E5E5E] dark:text-[#E8EAED]">Microsoft</span>
    </span>
  );
}

function AmazonLogo() {
  return (
    <span className="relative inline-flex flex-col items-center" aria-hidden="true">
      <span className="text-[27px] font-bold leading-[1.1] tracking-[-0.065em] text-[#232F3E] dark:text-white">amazon</span>
      <svg viewBox="0 0 90 13" className="-mt-0.5 h-[11px] w-[90px]" fill="none">
        <path d="M7 2C29 11 57 12 82 3" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" />
        <path d="m72 1 12 1-4 9" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function SpotifyLogo() {
  return (
    <span className="inline-flex items-center gap-2" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0">
        <circle cx="12" cy="12" r="12" fill="#1DB954" />
        <path d="M5 8c5.2-1.4 10.3-.7 14.5 1.9M6 12c4.4-1.1 8.9-.5 12.2 1.5M7 15.5c3.8-.8 7.1-.3 10 1.3" fill="none" stroke="#0B2015" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
      <span className="text-[22px] font-bold tracking-[-0.06em] text-[#191414] dark:text-white">Spotify</span>
    </span>
  );
}

function AdobeLogo() {
  return (
    <span className="inline-flex items-center gap-2" aria-hidden="true">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0">
        <path fill="#EB1000" d="M0 0h32v32H0z" />
        <path fill="#fff" d="M12.5 7H7l8.4 18.4 3-6.8L12.5 7Zm7 0 5.5 0-8.4 18.4-3-6.8L19.5 7Z" />
      </svg>
      <span className="text-[23px] font-bold tracking-[-0.05em] text-[#242424] dark:text-white">Adobe</span>
    </span>
  );
}

const COMPANIES = [
  { name: "Google", Logo: GoogleLogo },
  { name: "Microsoft", Logo: MicrosoftLogo },
  { name: "Amazon", Logo: AmazonLogo },
  { name: "Spotify", Logo: SpotifyLogo },
  { name: "Adobe", Logo: AdobeLogo },
];

function LogoRow({ duplicate = false }) {
  return (
    <div
      aria-hidden={duplicate ? "true" : undefined}
      className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14 lg:gap-20 lg:pr-20"
    >
      {COMPANIES.map(({ name, Logo }) => (
        <div
          key={name}
          aria-label={duplicate ? undefined : name}
          className="flex h-[64px] shrink-0 items-center justify-center opacity-75 transition-[opacity,transform] duration-300 hover:scale-[1.04] hover:opacity-100"
        >
          <Logo />
        </div>
      ))}
    </div>
  );
}

export default function CustomerHiredAt() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="customer-hired-heading"
      className="overflow-hidden border-y border-border bg-surface py-12 text-text-primary sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1440px] px-4 text-center sm:px-8 lg:px-12 xl:px-16">
  {/* SECTION BADGE */}
  <motion.div
    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="
      mx-auto mb-5 inline-flex items-center gap-2
      rounded-full border border-accent/25 bg-accent/10
      px-3.5 py-2 text-[11px] font-semibold
      text-text-primary
    "
  >
    <Sparkles
      size={14}
      className="text-[#078C88] dark:text-accent"
      aria-hidden="true"
    />
    Your career, your next opportunity
  </motion.div>

  {/* MAIN HEADING */}
  <motion.h2
    id="customer-hired-heading"
    initial={reducedMotion ? false : { opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{
      duration: 0.65,
      delay: 0.1,
      ease: [0.22, 1, 0.36, 1],
    }}
    className="
      mx-auto max-w-[780px]
      text-[clamp(2.5rem,5vw,4.6rem)]
      font-semibold leading-[1.09]
      tracking-[-0.07em]
      text-text-primary
    "
  >
    A professional CV for your{" "}
    <span className="text-[#089D98] dark:text-accent">
      next career move.
    </span>
  </motion.h2>

  {/* DESCRIPTION */}
  <motion.p
    initial={reducedMotion ? false : { opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{
      duration: 0.6,
      delay: 0.18,
      ease: [0.22, 1, 0.36, 1],
    }}
    className="
      mx-auto mt-5 max-w-[600px]
      text-[14px] leading-[1.85]
      text-text-secondary
      sm:text-[16px]
    "
  >
    From your first application to your next big opportunity,
    present your skills and experience with a professionally
    designed CV that helps you make a strong impression.
  </motion.p>
</div>

      <div className="relative mx-auto mt-9 max-w-[1440px] overflow-hidden sm:mt-11" aria-label="Example companies">
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-surface to-transparent sm:w-24" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-surface to-transparent sm:w-24" />
        {reducedMotion ? (
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5">
            {COMPANIES.map(({ name, Logo }) => (
              <div key={name} aria-label={name} className="flex h-16 items-center"><Logo /></div>
            ))}
          </div>
        ) : (
          <motion.div
            className="flex w-max items-center will-change-transform [animation-play-state:running] hover:[animation-play-state:paused]"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 28, ease: "linear", repeat: Infinity }}
          >
            <LogoRow />
            <LogoRow duplicate />
          </motion.div>
        )}
      </div>
    </section>
  );
}
