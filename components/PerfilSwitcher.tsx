"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, usePathname } from "next/navigation";

type Perfil = "CURADOR" | "CREADOR";

interface PerfilSwitcherProps {
  perfilActual: Perfil;
  onChangePerfil: (nuevo: Perfil) => void;
}

export default function PerfilSwitcher({ perfilActual, onChangePerfil }: PerfilSwitcherProps) {
  const { t } = useTranslation();
  const [hover, setHover] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = () => {
    const next: Perfil = perfilActual === "CURADOR" ? "CREADOR" : "CURADOR";

    // Tu estado/app
    onChangePerfil(next);
    try {
      localStorage.setItem("activeProfile", next);
    } catch {}

    // 👇 Espejo en cookie para el middleware (1 año)
    document.cookie = `activeProfile=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;

    // 👇 Fuerza request => corre el middleware
    router.replace(pathname || "/dashboard");
    router.refresh();
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleSwitch}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="px-4 py-1 rounded-full text-sm font-semibold bg-pink-800 animate-bounce text-white shadow-md hover:scale-105 transition-transform duration-300"
      >
        {t("switchprofile")} {perfilActual === "CURADOR" ? t("creator") : t("curator")}
      </button>

      <div
        className={`absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-1 rounded-md bg-gray-800 text-white text-xs shadow-lg transition-all duration-300 ${
          hover ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
         {t("switchprofiledesc")}{" "}
        {perfilActual === "CURADOR" ? t("creator") : t("curator")}
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-gray-800 rotate-45" />
      </div>
    </div>
  );
}
