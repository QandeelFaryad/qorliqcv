import "./globals.css";

import Providers from "./providers";
import ClientLayout from "@/components/ClientLayout";

import "./globals.css";

import {
  DM_Sans,
  Instrument_Serif,
} from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});


export const metadata = {
  title: "Qorliq Digital",
  description:
    "Premium digital agency for websites, applications, lead generation and CV builder services.",
};

export default function RootLayout({ children }) {
  return (
<html lang="en" suppressHydrationWarning>
  <body className={`${dmSans.variable} ${instrumentSerif.variable} font-sans`}>
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

          document.documentElement.setAttribute(
            "data-theme",
            theme
          );
        } catch (error) {
          document.documentElement.setAttribute(
            "data-theme",
            "light"
          );
        }
      })();
    `,
  }}
/>
        <Providers>
         
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}