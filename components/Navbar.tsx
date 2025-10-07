"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // iconos tailwind ui
import Image from "next/image";

interface NavbarProps {
  linksvisibles?: boolean; // opcional
}

export default function Navbar({ linksvisibles = true }: NavbarProps) {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!i18n.isInitialized) return <div />;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors ${
        isScrolled ? "bg-black shadow-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 text-white font-bold text-lg">
            <Link href="/" className="hover:underline underline-offset-8 decoration-2 decoration-purple-500">
              <Image
                src="/focu_whitw_02.png"
                alt="Focufy"
                width={120}
                height={40}
                className="object-contain"
              />
            </Link>
          </div>

          {/* Desktop links */}
          {linksvisibles && (
          <div className="hidden md:flex space-x-6 text-gray-500 font-madefor text-lg">
            <Link href="#hero" className="hover:underline underline-offset-8 decoration-2 decoration-purple-500">{t("navbar.home")}</Link>
            <Link href="#stack"  className="hover:underline underline-offset-8 decoration-2 decoration-purple-500">{t("navbar.stack")}</Link>
            <Link href="#extra" className="hover:underline underline-offset-8 decoration-2 decoration-purple-500">{t("navbar.extra")}</Link>
            <Link href="#about" className="hover:underline underline-offset-8 decoration-2 decoration-purple-500">{t("navbar.about")}</Link>
            <Link href="#perfila" className="hover:underline underline-offset-8 decoration-2 decoration-purple-500">{t("navbar.perfila")}</Link>
            <Link href="#pricing" className="hover:underline underline-offset-8 decoration-2 decoration-purple-500">{t("navbar.pricing")}</Link>
            <Link href="#ready" className="hover:underline underline-offset-8 decoration-2 decoration-purple-500">{t("navbar.contact")}</Link>
          </div>)
          }
          {/* Language selector */}
          <div className="flex items-center gap-2">
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="rounded-md bg-purple-950/20 text-purple-800 px-2 py-1 text-sm font-semibold"
            >
              <option value="en" className="text-pink-500">EN</option>
              <option value="es" className="text-pink-500">ES</option>
              <option value="fr" className="text-pink-500">FR</option>
            </select>

            {/* Mobile button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-purple-900 hover:bg-pink-500/10"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-purple-800/80 px-4 pt-4 pb-6">
          <div className="space-between flex flex-col text-white text-3xl font-sans elements-center text-center gap-4">
            <Link
              href="#hero"
              onClick={() => setMenuOpen(false)}
              className="block rounded-md px-3 py-2 hover:bg-purple-700/40"
            >
              {t("navbar.home")}
            </Link>
            <Link
              href="#stack"
              onClick={() => setMenuOpen(false)}
              className="block hover:bg-white/10 rounded-md px-3 py-2"
            >
              {t("navbar.stack")}
            </Link>
            <Link
              href="#extra"
              onClick={() => setMenuOpen(false)}
              className="block hover:bg-white/10 rounded-md px-3 py-2"
            >
              {t("navbar.extra")}
            </Link>
            <Link
              href="#about"
              onClick={() => setMenuOpen(false)}
              className="block hover:bg-white/10 rounded-md px-3 py-2"
            >
              {t("navbar.about")}
            </Link>
            <Link
              href="#perfila"
              onClick={() => setMenuOpen(false)}
              className="block hover:bg-white/10 rounded-md px-3 py-2"
            >
              {t("navbar.perfila")}
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMenuOpen(false)}
              className="block hover:bg-white/10 rounded-md px-3 py-2"
            >
              {t("navbar.pricing")}
            </Link>
            <Link
              href="#ready"
              onClick={() => setMenuOpen(false)}
              className="block hover:bg-white/10 rounded-md px-3 py-2"
            >
              {t("navbar.contact")}
            </Link>
          </div>
        </div>
      )}

    </nav>
  );
}
