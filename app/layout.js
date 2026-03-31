import Script from "next/script";
import { Poppins } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import ClientLayout from "./ClientLayout";
import SessionWrapper from "./component/SessionWrapper";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "DryFruit Store",
  description: "Fresh & Natural Dried Fruits",
};

export default function RootLayout({ children }) {
  const whatsappNumber = "03556560893";
  const defaultMessage = "Hello, I want to inquire about your products.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <html lang="en">
      <head>
        {/* ✅ Google Analytics Script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LB9SCCYFDL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LB9SCCYFDL');
          `}
        </Script>
      </head>

      <body className={`${poppins.variable} antialiased font-sans bg-white relative`}>

        {/* WhatsApp Button */}
        <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <Image
            className="fixed bottom-20 right-5 z-50 rounded-full cursor-pointer shadow-lg"
            width={80}
            height={80}
            src="/whatsapp.jpg"
            alt="Chat on WhatsApp"
          />
        </Link>

        <SessionWrapper>
          <Suspense fallback={<div>Loading...</div>}>
            <ClientLayout>
              {children}
            </ClientLayout>
          </Suspense>
        </SessionWrapper>

        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}