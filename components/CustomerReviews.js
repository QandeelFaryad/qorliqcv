"use client";

import { useState } from "react";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Quote,
  Star,
} from "lucide-react";

/* =========================================================
   CUSTOMER REVIEWS

   DEMONSTRATION CONTENT
   Replace with genuine customer reviews before publishing.
========================================================= */

const reviews = [
  {
    id: 1,
    name: "Customer Review 01",
    role: "Software Developer",
    location: "United Kingdom",
    rating: 5,
    review:
      "The templates are clean and professional. I particularly like being able to see how my CV looks while editing it.",
    template: "Tech Minimal",
    initials: "01",
  },
  {
    id: 2,
    name: "Customer Review 02",
    role: "Operations Manager",
    location: "Saudi Arabia",
    rating: 5,
    review:
      "The CV builder makes it easier to organize professional experience into a clear and well-structured document.",
    template: "London Executive",
    initials: "02",
  },
  {
    id: 3,
    name: "Customer Review 03",
    role: "Recent Graduate",
    location: "Canada",
    rating: 5,
    review:
      "The step-by-step editing process is straightforward. The live preview makes choosing the right layout much easier.",
    template: "Graduate Fresh",
    initials: "03",
  },
  {
    id: 4,
    name: "Customer Review 04",
    role: "Business Administrator",
    location: "United Kingdom",
    rating: 5,
    review:
      "I appreciate the simple interface and the ability to create a professional CV without dealing with complicated formatting.",
    template: "Clean ATS",
    initials: "04",
  },
  {
    id: 5,
    name: "Customer Review 05",
    role: "Project Coordinator",
    location: "Germany",
    rating: 5,
    review:
      "The European CV layouts are particularly useful. The design feels modern while keeping the information easy to read.",
    template: "EU Photo Document",
    initials: "05",
  },
];

/* =========================================================
   ANIMATION
========================================================= */

const ease = [0.22, 1, 0.36, 1];

/* =========================================================
   STAR RATING
========================================================= */

function StarRating({ rating }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={15}
          strokeWidth={1.5}
          className={
            index < rating
              ? "fill-accent text-accent"
              : "text-border-strong"
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/* =========================================================
   REVIEW CARD
========================================================= */

function ReviewCard({ review, featured = false }) {
  return (
    <article
      className={`
        relative
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-[18px]
        border
        p-6
        transition-colors
        duration-300
        sm:p-8

        ${
          featured
            ? `
              border-[#07183f]
              bg-[#07183f]
              text-white
              dark:border-accent/30
              dark:bg-[#102044]
            `
            : `
              border-border
              bg-surface
              text-text-primary
            `
        }
      `}
    >
      {/* TOP */}

      <div className="flex items-start justify-between gap-4">
        <StarRating rating={review.rating} />

        <Quote
          size={26}
          strokeWidth={1.3}
          className={
            featured
              ? "text-accent/70"
              : "text-accent"
          }
        />
      </div>

      {/* REVIEW */}

      <blockquote
        className={`
          mt-8
          flex-1
          text-[18px]
          font-medium
          leading-[1.65]
          tracking-[-0.025em]
          sm:text-[20px]

          ${
            featured
              ? "text-white"
              : "text-text-primary"
          }
        `}
      >
        “{review.review}”
      </blockquote>

      {/* DIVIDER */}

      <div
        className={`
          my-8
          h-px
          w-full

          ${
            featured
              ? "bg-white/20"
              : "bg-border"
          }
        `}
      />

      {/* CUSTOMER */}

      <div className="flex items-center gap-3">
        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-full
            text-[12px]
            font-bold

            ${
              featured
                ? "bg-accent text-[#061747]"
                : "bg-background-muted text-text-primary"
            }
          `}
        >
          {review.initials}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`
              text-[13px]
              font-semibold

              ${
                featured
                  ? "text-white"
                  : "text-text-primary"
              }
            `}
          >
            {review.name}
          </p>

          <p
            className={`
              mt-1
              text-[11px]
              leading-relaxed

              ${
                featured
                  ? "text-white/70"
                  : "text-text-secondary"
              }
            `}
          >
            {review.role} · {review.location}
          </p>
        </div>
      </div>

      {/* TEMPLATE */}

      <div
        className={`
          mt-6
          flex
          items-center
          justify-between
          gap-3
          border-t
          pt-4

          ${
            featured
              ? "border-white/15"
              : "border-border"
          }
        `}
      >
        <span
          className={`
            font-mono
            text-[10px]
            uppercase
            tracking-[0.1em]

            ${
              featured
                ? "text-white/60"
                : "text-text-muted"
            }
          `}
        >
          Template used
        </span>

        <span
          className={`
            text-[11px]
            font-semibold

            ${
              featured
                ? "text-accent"
                : "text-text-primary"
            }
          `}
        >
          {review.template}
        </span>
      </div>
    </article>
  );
}

/* =========================================================
   MAIN SECTION
========================================================= */

export default function CustomerReviews() {
  const reduceMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);

  const total = reviews.length;

  const changeReview = (direction) => {
    setActiveIndex((previous) =>
      (previous + direction + total) % total
    );
  };

  const visibleReviews = [
    reviews[activeIndex],
    reviews[(activeIndex + 1) % total],
    reviews[(activeIndex + 2) % total],
  ];

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="
        relative
        w-full
        overflow-hidden
        bg-background-soft
        py-24
        sm:py-28
        lg:py-36
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
        {/* ============================================
            SECTION INTRODUCTION
        ============================================ */}

        <div
          className="
            grid
            grid-cols-1
            items-end
            gap-8
            lg:grid-cols-[1.2fr_0.8fr]
            lg:gap-16
          "
        >
          {/* LEFT */}

          <div>
            <motion.div
              initial={
                reduceMotion
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
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                ease,
              }}
              className="mb-8 flex items-center gap-3"
            >
              <span
                className="
                  font-mono
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.19em]
                  text-text-muted
                "
              >
                Customer Experiences
              </span>

              <span
                aria-hidden="true"
                className="h-px w-9 bg-accent"
              />
            </motion.div>

            {/* HEADING */}

            <h2
              id="reviews-heading"
              className="
                max-w-[850px]
                text-[clamp(3rem,6vw,6.2rem)]
                font-semibold
                leading-[1.04]
                tracking-[-0.075em]
                text-text-primary
              "
            >
              <motion.span
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 35,
                      }
                }
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  ease,
                }}
                className="block"
              >
                Built for people.
              </motion.span>

              <motion.span
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 35,
                      }
                }
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: 0.12,
                  ease,
                }}
                className="block"
              >
                <span className="relative inline-block">
                  <span
                    className="
                      relative
                      z-10
                      font-editorial
                      font-normal
                      italic
                      tracking-[-0.07em]
                    "
                  >
                    Going places.
                  </span>

                  {/* CYAN HIGHLIGHT */}

                  <motion.span
                    aria-hidden="true"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: 0.65,
                      ease,
                    }}
                    style={{
                      transformOrigin: "left",
                    }}
                    className="
                      absolute
                      bottom-[0.06em]
                      left-0
                      z-0
                      h-[0.27em]
                      w-full
                      bg-accent
                    "
                  />
                </span>
              </motion.span>
            </h2>
          </div>

          {/* RIGHT */}

          <motion.p
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 25,
                  }
            }
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease,
            }}
            className="
              max-w-[400px]
              text-[16px]
              leading-[1.85]
              text-text-secondary
              lg:ml-auto
              lg:pb-3
            "
          >
            A professional CV should make the process
            feel simpler. Explore how different
            professionals might use QORLIQ CV to
            present their experience with confidence.
          </motion.p>
        </div>

        {/* ============================================
            DEMO LABEL
        ============================================ */}

        <div
          className="
            mt-14
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
            sm:mt-16
          "
        >
          <p
            className="
              text-[11px]
              font-medium
              text-text-muted
            "
          >
            Sample testimonials — demonstration content
          </p>

          {/* CONTROLS */}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeReview(-1)}
              aria-label="Previous review"
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-border-strong
                bg-surface
                text-text-primary
                transition-all
                duration-200
                hover:border-accent
                hover:bg-background-muted
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-accent
              "
            >
              <ArrowLeft size={18} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={() => changeReview(1)}
              aria-label="Next review"
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-[#07183f]
                text-white
                transition-all
                duration-200
                hover:bg-[#102b66]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-accent

                dark:bg-accent
                dark:text-[#061747]
                dark:hover:bg-accent-hover
              "
            >
              <ArrowRight size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* ============================================
            REVIEW CAROUSEL
        ============================================ */}

        <div
          className="
            relative
            mt-6
            min-h-[390px]
          "
          aria-live="polite"
          aria-atomic="false"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeIndex}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      x: 35,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={
                reduceMotion
                  ? undefined
                  : {
                      opacity: 0,
                      x: -35,
                    }
              }
              transition={{
                duration: 0.4,
                ease,
              }}
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {visibleReviews.map((review, index) => (
                <div
                  key={review.id}
                  className={`
                    min-w-0

                    ${
                      index === 2
                        ? "hidden xl:block"
                        : index === 1
                          ? "hidden md:block"
                          : ""
                    }
                  `}
                >
                  <ReviewCard
                    review={review}
                    featured={index === 0}
                  />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ============================================
            PAGINATION
        ============================================ */}

        <div
          className="
            mt-9
            flex
            items-center
            justify-between
            gap-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
            aria-label="Choose review"
          >
            {reviews.map((review, index) => (
              <button
                key={review.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to review ${index + 1}`}
                aria-current={
                  activeIndex === index
                    ? "true"
                    : undefined
                }
                className={`
                  h-[6px]
                  rounded-full
                  transition-all
                  duration-300
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-accent

                  ${
                    activeIndex === index
                      ? "w-9 bg-accent"
                      : "w-3 bg-border-strong hover:bg-text-muted"
                  }
                `}
              />
            ))}
          </div>

          <span
            className="
              font-mono
              text-[11px]
              text-text-muted
            "
          >
            {String(activeIndex + 1).padStart(2, "0")}
            <span className="mx-2">/</span>
            {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* ============================================
            BOTTOM LINK
        ============================================ */}

        <div
          className="
            mt-14
            flex
            justify-center
            border-t
            border-border
            pt-10
          "
        >
          <a
            href="/cv-builder"
            className="
              group
              inline-flex
              min-h-12
              items-center
              gap-3
              rounded-xl
              bg-[#07183f]
              px-7
              text-[13px]
              font-semibold
              text-white
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#102b66]

              dark:bg-accent
              dark:text-[#061747]
              dark:hover:bg-accent-hover
            "
          >
            Create Your Professional CV

            <ArrowUpRight
              size={17}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </a>
        </div>
      </div>
    </section>
  );
}