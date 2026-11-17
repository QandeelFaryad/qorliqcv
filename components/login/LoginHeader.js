"use client";

import Image from "next/image";
import Link from "next/link";



export default function LoginHeader() {




  return (
    <header
      className="
        relative z-40
        w-full
        border-b border-border
        bg-background
      "
    >
      <div
        className="
          relative
          mx-auto
          flex h-[72px]
          w-full max-w-[1440px]
          items-center
          justify-center

          px-4
          sm:px-8

          lg:h-[84px]
          lg:justify-start
          lg:px-12
          xl:px-16
        "
      >
        {/* ====================================
            MOBILE BACK BUTTON
        ==================================== */}

   

        {/* ====================================
            QORLIQ CV LOGO
        ==================================== */}
<Link
  href="/"
  aria-label="QORLIQ CV homepage"
  className="
    inline-flex shrink-0 items-center
    rounded-md outline-offset-4
    focus-visible:outline-2 focus-visible:outline-accent
  "
>
  {/* Light Mode Logo */}
  <Image
    src="/QORLIQ_cv.svg"
    alt="QORLIQ CV"
    width={185}
    height={56}
    priority
    className="h-auto w-[158px] lg:w-[185px] dark:hidden"
  />

  {/* Dark Mode Logo */}
  <Image
    src="/QORLIQ_cv_dark.svg"
    alt="QORLIQ CV"
    width={185}
    height={56}
    priority
    className="hidden h-auto w-[158px] lg:w-[185px] dark:block"
  />
</Link>

        {/* ====================================
            DESKTOP BACK BUTTON
        ==================================== */}

        
    
      </div>
    </header>
  );
}