import "./globals.css";

import Providers from "./providers";
import ClientLayout from "@/components/ClientLayout";

import { Rubik, Instrument_Serif } from "next/font/google";

/* =========================================
   PRIMARY FONT — RUBIK
========================================= */

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

/* =========================================
   EDITORIAL FONT — INSTRUMENT SERIF
========================================= */

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

/* =========================================
   SEO METADATA
========================================= */

export const metadata = {
  title: "Qorliq Digital",
  description:
    "Premium digital agency for websites, applications, lead generation and CV builder services.",
};

/* =========================================
   ROOT LAYOUT
========================================= */

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var saved = localStorage.getItem("qorliq-theme");

                  var systemDark = window.matchMedia(
                    "(prefers-color-scheme: dark)"
                  ).matches;

                  var theme =
                    saved === "light" || saved === "dark"
                      ? saved
                      : systemDark
                        ? "dark"
                        : "light";

                  document.documentElement.classList.toggle(
                    "dark",
                    theme === "dark"
                  );

                  document.documentElement.setAttribute(
                    "data-theme",
                    theme
                  );
                } catch (error) {
                  document.documentElement.classList.remove("dark");

                  document.documentElement.setAttribute(
                    "data-theme",
                    "light"
                  );
                }
              })();
            `,
          }}
        />
      </head>

      <body
        className={`
          ${rubik.variable}
          ${instrumentSerif.variable}
          font-sans
          antialiased
        `}
      >
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}