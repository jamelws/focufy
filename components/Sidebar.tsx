"use client";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Link from "next/link";
import { TFunction } from "i18next";
import { useSesion } from "@/context/SesionContext";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";  // 👈 IMPORTANTE

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { perfil } = useSesion();

  const menus: Record<string, string[]> = {
    CURADOR: ["mymusic"],
    CREADOR: ["sets", "focusgroups", "myquestions", "report"],
  };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* ✅ Versión móvil */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: open ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-16 left-0 bottom-0 w-64 z-50
        ${perfil === "CREADOR"
          ? "bg-gradient-to-b from-pink-500 to-purple-800"
          : "bg-gradient-to-b from-orange-500 to-pink-800"}
        text-black shadow-lg p-6 font-bold
        flex flex-col justify-between md:hidden`}
      >
        <SidebarContent perfil={perfil} menus={menus} t={t} onLinkClick={onClose} />
      </motion.aside>

      {/* ✅ Versión escritorio */}
      <aside
        className={`hidden md:flex md:flex-col md:w-64 md:fixed md:top-16 md:bottom-0
          ${perfil === "CREADOR"
            ? "bg-gradient-to-b from-pink-500 via-purple-600 to-purple-800"
            : "bg-gradient-to-b from-orange-500 via-pink-500 to-pink-700"}
          text-black shadow-lg p-6 justify-between`}
      >
        <SidebarContent perfil={perfil} menus={menus} t={t} />
      </aside>
    </>
  );
}

function SidebarContent({
  perfil,
  menus,
  t,
  onLinkClick,
}: {
  perfil: "CURADOR" | "CREADOR";
  menus: Record<string, string[]>;
  t: TFunction<"translation">;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname(); // 👈 Ruta actual

  let base = "/dashboard/artist/";
  if (perfil === "CURADOR") base = "/dashboard/listener/";

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-lg font-bold mb-4">{t(perfil)}</h2>
        <ul className="space-y-3">
          {menus[perfil].map((key) => {
            const href = base + key;
            const isActive = pathname === href; // 👈 Comprueba ruta actual

            return (
              <li key={key}>
                <Link
                  href={href}
                  onClick={onLinkClick}
                  className={`block px-3 py-2 rounded font-bold transition
                    ${isActive
                      ? "bg-purple-700 text-white shadow-md" // 👈 Estilo activo
                      : "hover:bg-purple-700 hover:text-white"}`}
                >
                  {t(key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-3 border-t border-purple-300 pt-4">
        <Link
          href="/dashboard/profile"
          onClick={onLinkClick}
          className={`block px-3 py-2 rounded font-bold transition
            ${pathname === "/dashboard/profile"
              ? "bg-black text-white shadow-md"
              : "hover:bg-purple-700 hover:text-white"}`}
        >
          {t("profile")}
        </Link>

        <button
          onClick={() => {
            onLinkClick?.();
            signOut({ redirect: true, callbackUrl: "/" });
          }}
          className="w-full text-left px-3 py-2 rounded font-bold hover:bg-red-600 hover:text-white transition"
        >
          {t("logout")}
        </button>
      </div>
    </div>
  );
}
