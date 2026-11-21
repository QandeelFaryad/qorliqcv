"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/* =========================================================
   CONFIGURATION
========================================================= */

const EASE = [0.22, 1, 0.36, 1];

/*
  Save original company logos inside:

  public/partners/

  SVG or transparent PNG wordmarks are recommended.

  IMPORTANT:
  Only display these as partnerships if they are
  officially associated with your business.
*/

const partners = [
  {
    name: "Microsoft",
    logo: "/partners/microsoft.png",
  },
  {
    name: "Stripe",
    logo: "/partners/stripe.png",
  },
  {
    name: "Google",
    logo: "/partners/google.png",
  },
  {
    name: "Meta",
    logo: "/partners/meta.png",
  },
  {
    name: "TikTok",
    logo: "/partners/tiktok.png",
  },
  {
    name: "Snapchat",
    logo: "/partners/snapchat.png",
  },
  {
    name: "Shopify",
    logo: "/partners/shopify.png",
  },
  {
    name: "WooCommerce",
    logo: "/partners/woocommerce.png",
  },
  {
    name: "Ingram Micro",
    logo: "/partners/ingram-micro.png",
  },
  {
    name: "Infinigate Cloud",
    logo: "/partners/infinigate-cloud.png",
  },
  {
    name: "Zylliq",
    logo: "/partners/zylliq.png",
  },
  {
    name: "Makarim Altamayuz",
    logo: "/partners/makarim-altamayuz.png",
  },
  {
    name: "Arabic Company",
    logo: "/partners/arabic-company.png",
  },
  {
    name: "Aramak Real Estate",
    logo: "/partners/aramak-real-estate.png",
  },
];

/* =========================================================
   PARTNER LOGO
========================================================= */

function PartnerLogo({ partner, index, reducedMotion }) {
  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              y: 15,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.5,
        delay: reducedMotion
          ? 0
          : Math.min(index * 0.045, 0.4),
        ease: EASE,
      }}
      className="
        group
        flex
        min-w-0
        items-center
        justify-center
        px-2
        py-4

        sm:px-3
        lg:px-2
      "
    >
      <motion.div
        whileHover={
          reducedMotion
            ? undefined
            : {
                scale: 1.06,
                y: -2,
              }
        }
        transition={{
          duration: 0.25,
          ease: EASE,
        }}
        className="
          relative
          h-[45px]
          w-full
          max-w-[155px]

          sm:h-[52px]
          lg:h-[58px]
        "
      >
        <Image
          src={partner.logo}
          alt={`${partner.name} logo`}
          fill
          sizes="
            (max-width: 640px) 45vw,
            (max-width: 1024px) 23vw,
            150px
          "
          className="
            object-contain

            grayscale
            opacity-45

            transition-all
            duration-300

            group-hover:grayscale-0
            group-hover:opacity-100
          "
        />
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PartnershipsCertificates() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="partnerships-certifications"
      aria-labelledby="partnerships-heading"
      className="
        relative
        overflow-hidden

        border-y
        border-[#e4e7ee]

        bg-[#f5f6fa]

        py-14
        sm:py-16
        lg:py-20

        dark:border-border
        dark:bg-background-soft
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1440px]

          px-5
          sm:px-8
          lg:px-12
          xl:px-16
        "
      >
        {/* ================================================
            SECTION HEADING
        ================================================= */}
<motion.div
  initial={{ opacity: 0, y: 18 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6, ease: EASE }}
  className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
>
  <div>
    <div className="mb-3 flex items-center gap-3">
      <span className="h-[3px] w-9 rounded-full bg-[#089D98]" />

      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#089D98] dark:text-accent">
        OUR NETWORK
      </p>
    </div>

    <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.12] tracking-[-0.06em] text-text-primary">
      Partnerships & Certifications
      <span className="text-[#089D98] dark:text-accent">.</span>
    </h2>
  </div>

  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-2">
    <span className="h-2 w-2 rounded-full bg-[#089D98]" />

    <span className="text-[12px] font-semibold text-text-secondary">
      14 Partners
    </span>
  </div>
</motion.div>
        {/* ================================================
            LOGO GRID

            MOBILE: 2 COLUMNS
            TABLET: 4 COLUMNS
            DESKTOP: 8 COLUMNS

            NO CARDS
            NO MARQUEE
        ================================================= */}

        <div
          className="
            mt-8

            grid
            grid-cols-2
            items-center

            gap-x-5
            gap-y-5

            sm:grid-cols-4
            sm:gap-x-6
            sm:gap-y-7

            lg:mt-10
            lg:grid-cols-8
            lg:gap-x-5
            lg:gap-y-9

            xl:gap-x-7
          "
        >
          {partners.map((partner, index) => (
            <PartnerLogo
              key={partner.name}
              partner={partner}
              index={index}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}