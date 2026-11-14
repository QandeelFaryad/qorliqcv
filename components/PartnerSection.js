"use client";

import Image from "next/image";

/* =========================================================
   PARTNER LOGOS
========================================================= */

const partners = [
  {
    name: "Microsoft Azure",
    image: "/partner/azure.png",
  },
  {
    name: "Infinigate",
    image: "/partner/infinigate.png",
  },
  {
    name: "Microsoft",
    image: "/partner/microsoft.png",
  },
  {
    name: "Microsoft 365",
    image: "/partner/microsoft-365.png",
  },
  {
    name: "Microsoft Defender",
    image: "/partner/microsoft-defender.png",
  },
];

/* =========================================================
   PARTNER LOGO
========================================================= */

function PartnerLogo({ partner }) {
  return (
    <div
      className="
        flex
        h-[76px]
        w-[190px]
        shrink-0
        items-center
        justify-center
        px-5
        sm:w-[220px]
        lg:w-[235px]
      "
    >
      <Image
        src={partner.image}
        alt={partner.name}
        width={220}
        height={76}
        sizes="(max-width: 640px) 150px, 190px"
        className="
          h-auto
          max-h-[55px]
          w-auto
          max-w-full
          object-contain
          opacity-80
          transition-all
          duration-300
          hover:scale-105
          hover:opacity-100
        "
      />
    </div>
  );
}

/* =========================================================
   PARTNERS SECTION
========================================================= */

export default function PartnerSection() {
  return (
    <section
      aria-label="Our partners"
      className="
        relative
        w-full
        overflow-hidden
        border-y
        border-white/10
        bg-[#07112b]
        py-5
        text-white
        sm:py-6
      "
    >
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1440px]
          flex-col
          gap-6
          px-5
          sm:px-8
          lg:flex-row
          lg:items-center
          lg:gap-10
          lg:px-12
          xl:px-16
        "
      >
        {/* ============================================
            LEFT LABEL
        ============================================ */}

        <div
          className="
            relative
            z-10
            flex
            shrink-0
            items-center
            gap-4
            lg:w-[160px]
          "
        >
          <span
            aria-hidden="true"
            className="
              h-8
              w-[3px]
              rounded-full
              bg-accent
            "
          />

          <div>
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-white/45
              "
            >
              Trusted
            </p>

            <h2
              className="
                mt-1
                whitespace-nowrap
                text-[15px]
                font-bold
                tracking-[-0.02em]
                text-white
              "
            >
              Our Partners
            </h2>
          </div>
        </div>

        {/* ============================================
            RIGHT ANIMATED LOGOS
        ============================================ */}

        <div
          className="
            partner-marquee
            relative
            min-w-0
            flex-1
            overflow-hidden
          "
        >
          <div className="partner-marquee-track">
            {/* Original logos */}

            <div className="partner-marquee-group">
              {partners.map((partner) => (
                <PartnerLogo
                  key={partner.name}
                  partner={partner}
                />
              ))}
            </div>

            {/* Duplicate for seamless looping */}

            <div
              aria-hidden="true"
              className="partner-marquee-group"
            >
              {partners.map((partner) => (
                <PartnerLogo
                  key={`duplicate-${partner.name}`}
                  partner={partner}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}