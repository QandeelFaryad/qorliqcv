"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { getOfferStartedAt, getOfferState } from "@/lib/cvOfferCountdown";

const navItems = [
  { label: "Home", href: "/#home" },
  { label: "Services", href: "/#services" },
  { label: "Microsoft", href: "/microsoft" },
  { label: "CV Builder", href: "/cv-builder" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/#contact" },
];

export default function Header() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isOfferVisible, setIsOfferVisible] = useState(false);

  const { data: session, status } = useSession();

  const isSuccessPage =
    pathname?.includes("/success") ||
    pathname?.includes("/payment-success") ||
    pathname?.includes("/order-success");

  useEffect(() => {
    if (isSuccessPage) {
      setIsOfferVisible(false);
      return;
    }

    const startedAt = getOfferStartedAt();

    const checkOffer = () => {
      const state = getOfferState(startedAt);
      setIsOfferVisible(state.isActive && !state.isExpired);
    };

    checkOffer();

    const interval = setInterval(checkOffer, 1000);

    return () => clearInterval(interval);
  }, [isSuccessPage]);

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const userName = session?.user?.name || session?.user?.email || "User";
  const userInitial = userName?.charAt(0)?.toUpperCase() || "U";

  const handleLogout = async () => {
    setProfileOpen(false);
    setOpen(false);

    await signOut({
      callbackUrl: "/login",
    });
  };

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-[9998] border-b border-white/10 bg-[#050505]/95 text-white shadow-2xl shadow-black/30 backdrop-blur-2xl transition-all duration-300 ${
          isOfferVisible ? "top-[36px]" : "top-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link
            href="/#home"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3"
          >
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

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/cv-builder"
              className="rounded-full bg-gradient-to-r from-[#F3D88B] to-qorliqGold px-5 py-3 text-sm font-black text-black shadow-lg shadow-qorliqGold/20 transition hover:scale-[1.02] hover:shadow-qorliqGold/30"
            >
              CV Builder
            </Link>

            {status === "authenticated" ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-qorliqGold/40 bg-qorliqGold/15 text-sm font-black uppercase text-qorliqGold transition hover:bg-qorliqGold/25"
                  aria-label="User profile"
                >
                  {userInitial}
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#101010] p-3 shadow-2xl shadow-black/40">
                    <div className="mb-3 border-b border-white/10 pb-3">
                      <p className="text-sm font-bold text-white">{userName}</p>
                      <p className="mt-1 truncate text-xs text-white/50">
                        {session?.user?.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left text-sm font-bold text-red-300 transition hover:bg-red-500/20"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-qorliqGold/30 px-5 py-3 text-sm font-black text-qorliqGold transition hover:bg-qorliqGold/10"
              >
                Login
              </Link>
            )}
          </div>

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

        {open ? (
          <div className="border-t border-white/10 bg-[#050505]/98 px-5 py-5 lg:hidden">
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

              <Link
                href="/cv-builder"
                onClick={() => setOpen(false)}
                className="mt-3 rounded-full bg-gradient-to-r from-[#F3D88B] to-qorliqGold px-5 py-4 text-center text-sm font-black text-black"
              >
                Open CV Builder
              </Link>

              {status === "authenticated" ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-qorliqGold/40 bg-qorliqGold/15 text-sm font-black uppercase text-qorliqGold">
                      {userInitial}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {userName}
                      </p>
                      <p className="truncate text-xs text-white/50">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-full border border-red-500/20 bg-red-500/10 px-5 py-4 text-center text-sm font-black text-red-300 transition hover:bg-red-500/20"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-3 rounded-full border border-qorliqGold/30 px-5 py-4 text-center text-sm font-black text-qorliqGold transition hover:bg-qorliqGold/10"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        ) : null}
      </header>

      <div className={isOfferVisible ? "h-[110px]" : "h-[74px]"} />
    </>
  );
}