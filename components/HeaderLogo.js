import Image from "next/image";
import Link from "next/link";

/** Responsive QORLIQ CV brand logo with light/dark variants. */
export default function HeaderLogo({ className = "" }) {
  return (
    <Link
      href="/"
      aria-label="QORLIQ CV homepage"
      className={`
        inline-flex shrink-0 items-center
        rounded-md outline-offset-4
        focus-visible:outline-2
        focus-visible:outline-accent
        ${className}
      `}
    >
      {/* Light Mode Logo */}
      <Image
        src="/QORLIQ_cv.svg"
        alt="QORLIQ CV"
        width={260}
        height={80}
        priority
        sizes="(max-width: 639px) 155px, (max-width: 1023px) 200px, 240px"
        className="
          h-auto
          w-[155px]
          sm:w-[200px]
          lg:w-[220px]
          xl:w-[240px]
          dark:hidden
        "
      />

      {/* Dark Mode Logo */}
      <Image
        src="/QORLIQ_cv_dark.svg"
        alt="QORLIQ CV"
        width={260}
        height={80}
        priority
        sizes="(max-width: 639px) 155px, (max-width: 1023px) 200px, 240px"
        className="
          hidden
          h-auto
          w-[155px]
          sm:w-[200px]
          lg:w-[220px]
          xl:w-[240px]
          dark:block
        "
      />
    </Link>
  );
}