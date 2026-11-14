"use client";

import { useState } from "react";
import Link from "next/link";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";

import {
  ArrowUpRight,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";

/* =========================================================
   FAQ DATA
   Based on the QORLIQ CV homepage PDF
========================================================= */

const faqs = [
{
  id: "faq-1",
  question: "How does QORLIQ CV work?",
  answer:
    "Creating your professional CV is simple. Choose a template, enter your details, and customize your CV with a live preview. Once you're happy with your CV, select a plan and complete your payment to download it in PDF or Word format.",
},
  {
    id: "faq-2",
    question:
      "Will recruiters’ software be able to read my CV?",
    answer:
      "Yes. QORLIQ CV templates are designed with applicant tracking systems in mind. They use clear section headings, readable typography, selectable text, and a structured reading order to help recruitment software process your information.",
  },
  {
    id: "faq-3",
    question: "Can I import my existing CV?",
    answer:
      "Yes. Upload your existing CV in PDF, DOC, DOCX, or TXT format. QORLIQ CV will extract the available information and help you organize it into your selected template. You can review and edit everything before exporting.",
  },
  {
    id: "faq-4",
    question: "Can I keep more than one version?",
    answer:
      "Yes. You can create multiple CVs and tailor each version to a specific job or industry. Your saved CVs can be managed from your dashboard, subject to your plan's access conditions.",
  },
  {
    id: "faq-5",
    question: "Who can see my CV?",
    answer:
      "Your CV is associated with your account and is not publicly displayed by default. You control the information you enter and the documents you choose to download or share.",
  },
];

/* =========================================================
   ANIMATION CONFIG
========================================================= */

const ease = [0.22, 1, 0.36, 1];

/* =========================================================
   FAQ ITEM
========================================================= */

function FAQItem({
  item,
  index,
  isOpen,
  onToggle,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 18,
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
        duration: 0.6,
        delay: index * 0.07,
        ease,
      }}
      className={`
        group
        relative
        border-b
        border-border
        transition-colors
        duration-300

        ${
          isOpen
            ? "bg-background-soft/50"
            : "hover:bg-background-soft/40"
        }
      `}
    >
      {/* QUESTION */}

      <h3>
        <button
          type="button"
          id={`${item.id}-trigger`}
          aria-expanded={isOpen}
          aria-controls={`${item.id}-panel`}
          onClick={onToggle}
          className="
            flex
            w-full
            items-center
            justify-between
            gap-5
            px-4
            py-6
            text-left
            outline-none
            transition-colors
            duration-200
            focus-visible:ring-2
            focus-visible:ring-inset
            focus-visible:ring-accent
            sm:px-6
            sm:py-7
            lg:px-8
          "
        >
          <span
            className={`
              max-w-[570px]
              text-[15px]
              font-semibold
              leading-[1.55]
              tracking-[-0.025em]
              transition-colors
              duration-200
              sm:text-[16px]
              lg:text-[17px]

              ${
                isOpen
                  ? "text-text-primary"
                  : "text-text-secondary group-hover:text-text-primary"
              }
            `}
          >
            {item.question}
          </span>

          {/* PLUS / MINUS ICON */}

          <span
            className={`
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              transition-all
              duration-300

              ${
                isOpen
                  ? `
                    border-accent
                    bg-accent
                    text-[#061747]
                  `
                  : `
                    border-border-strong
                    bg-surface
                    text-text-secondary
                    group-hover:border-accent
                  `
              }
            `}
          >
            <AnimatePresence
              mode="wait"
              initial={false}
            >
              <motion.span
                key={isOpen ? "minus" : "plus"}
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        rotate: -45,
                        scale: 0.7,
                      }
                }
                animate={{
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
                }}
                exit={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: 0,
                        rotate: 45,
                        scale: 0.7,
                      }
                }
                transition={{
                  duration: 0.18,
                }}
              >
                {isOpen ? (
                  <Minus
                    size={17}
                    strokeWidth={1.8}
                  />
                ) : (
                  <Plus
                    size={17}
                    strokeWidth={1.8}
                  />
                )}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
      </h3>

      {/* ANSWER */}

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`${item.id}-answer`}
            id={`${item.id}-panel`}
            role="region"
            aria-labelledby={`${item.id}-trigger`}
            initial={
              reduceMotion
                ? false
                : {
                    height: 0,
                    opacity: 0,
                  }
            }
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={
              reduceMotion
                ? undefined
                : {
                    height: 0,
                    opacity: 0,
                  }
            }
            transition={{
              height: {
                duration: 0.38,
                ease,
              },
              opacity: {
                duration: 0.25,
              },
            }}
            className="overflow-hidden"
          >
            <div
              className="
                max-w-[650px]
                px-4
                pb-7
                pr-12
                sm:px-6
                sm:pb-8
                lg:px-8
              "
            >
              <p
                className="
                  text-[14px]
                  leading-[1.9]
                  text-text-secondary
                  sm:text-[15px]
                "
              >
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE CYAN LINE */}

      {isOpen && (
        <motion.div
          layoutId="faq-active-line"
          className="
            absolute
            bottom-[-1px]
            left-0
            h-[2px]
            w-[72px]
            bg-accent
          "
          transition={{
            duration: 0.35,
            ease,
          }}
        />
      )}
    </motion.div>
  );
}

/* =========================================================
   FAQ SECTION
========================================================= */

export default function FAQSection() {
  const reduceMotion = useReducedMotion();

  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex((previous) =>
      previous === index ? -1 : index
    );
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="
        relative
        w-full
        overflow-hidden
        bg-background
        py-24
        sm:py-28
        lg:py-36
      "
    >
      <div
        className="
          mx-auto
          grid
          w-full
          max-w-[1440px]
          grid-cols-1
          items-start
          gap-14
          px-5
          sm:px-8
          lg:grid-cols-[0.85fr_1.15fr]
          lg:gap-20
          lg:px-12
          xl:gap-24
          xl:px-16
        "
      >
        {/* ============================================
            LEFT CONTENT
        ============================================ */}

        <div className="lg:sticky lg:top-[120px]">
          {/* SECTION LABEL */}

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
            className="
              mb-8
              flex
              items-center
              gap-3
            "
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
              05 — FAQ
            </span>

            <span
              aria-hidden="true"
              className="
                h-px
                w-9
                bg-accent
              "
            />
          </motion.div>

          {/* ========================================
              MAIN HEADING
          ======================================== */}

          <h2
            id="faq-heading"
            className="
              max-w-[620px]
              text-[clamp(3.4rem,6vw,6.2rem)]
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
              Good
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
              questions.
            </motion.span>
          </h2>

          {/* DESCRIPTION */}

          <motion.p
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 20,
                  }
            }
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.75,
              delay: 0.2,
              ease,
            }}
            className="
              mt-8
              max-w-[380px]
              text-[15px]
              leading-[1.9]
              text-text-secondary
              sm:text-[16px]
            "
          >
            Short answers, no fine print.
            Need something else? Write to us and
            a person will reply.
          </motion.p>

          {/* CONTACT SUPPORT */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 20,
                  }
            }
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: 0.3,
              ease,
            }}
            className="mt-8"
          >
            <Link
              href="/dashboard/support"
              className="
                group
                inline-flex
                items-center
                gap-3
                border-b
                border-border-strong
                pb-2
                text-[14px]
                font-semibold
                text-text-primary
                transition-all
                duration-300
                hover:gap-5
                hover:border-accent
              "
            >
              Contact support

              <ArrowUpRight
                size={17}
                strokeWidth={1.8}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            </Link>
          </motion.div>
        </div>

        {/* ============================================
            RIGHT FAQ ACCORDION
        ============================================ */}

        <div
          className="
            min-w-0
            border-t
            border-border-strong
          "
        >
          {faqs.map((item, index) => (
            <FAQItem
              key={item.id}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}