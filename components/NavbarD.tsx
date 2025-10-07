"use client";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useSesion } from "@/context/SesionContext";
import PerfilSwitcher from "./PerfilSwitcher";

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function NavbarD({ onToggleSidebar, sidebarOpen }: NavbarProps) {
  const { perfil, setPerfil, lang, setLang } = useSesion();

  return (
    <nav className="bg-purple-900 text-white fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 shadow-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded hover:bg-purple-700"
        >
          {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
        <Link href="/dashboard" className="flex items-center">
          <Image src="/focu_whitw_02.png" alt="Logo" width={130} height={90} priority />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <PerfilSwitcher perfilActual={perfil} onChangePerfil={setPerfil} />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="bg-purple-700 px-2 py-1 rounded text-sm"
        >
          <option value="es">ES</option>
          <option value="en">EN</option>
          <option value="fr">FR</option>
        </select>
      </div>
    </nav>
  );
}
