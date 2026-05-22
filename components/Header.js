"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/#home", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#partners", label: "Partners" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/90 text-white backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        {/* Logo */}
        <Link href="/#home" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-qorliqGold/35 bg-qorliqGold/10 shadow-lg shadow-qorliqGold/10">
            <span className="bg-gradient-to-br from-white to-qorliqGold bg-clip-text text-lg font-black text-transparent">
              Q
            </span>
          </div>

          <div className="leading-none">
            <h1 className="bg-gradient-to-r from-white via-[#F4E5BD] to-qorliqGold bg-clip-text text-lg font-black tracking-[0.16em] text-transparent">
              QORLIQ
            </h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
              Digital Agency
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-2 text-sm font-semibold text-white/65 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-qorliqGold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/#contact"
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white/85 transition hover:border-qorliqGold hover:bg-qorliqGold/10 hover:text-qorliqGold"
          >
            Request Quote
          </Link>

          <Link
            href="/cv-builder"
            className="rounded-full bg-gradient-to-r from-[#F3D88B] to-qorliqGold px-5 py-3 text-sm font-black text-black shadow-lg shadow-qorliqGold/20 transition hover:scale-[1.02] hover:shadow-qorliqGold/30"
          >
            CV Builder
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white lg:hidden"
          aria-label="Toggle menu"
        >
          <span className="space-y-1.5">
            <span
              className={`block h-0.5 w-5 bg-white transition ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {open ? (
        <div className="border-t border-white/10 bg-[#050505] px-5 py-5 lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-bold text-white/75 transition hover:border-qorliqGold hover:text-qorliqGold"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Link
                href="/#contact"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/15 px-5 py-4 text-center text-sm font-black text-white transition hover:border-qorliqGold hover:text-qorliqGold"
              >
                Request Quote
              </Link>

              <Link
                href="/cv-builder"
                onClick={() => setOpen(false)}
                className="rounded-full bg-gradient-to-r from-[#F3D88B] to-qorliqGold px-5 py-4 text-center text-sm font-black text-black"
              >
                Open CV Builder
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}