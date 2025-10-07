"use client";

import { useEffect, useState } from "react";
import NavbarD from "./NavbarD";
import Sidebar from "./Sidebar";
type Perfil = "CURADOR" | "CREADOR";
export default function NavbarDWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [perfil, setPerfil] = useState<Perfil>("CURADOR");
  const [isReady, setIsReady] = useState(false);

  // ✅ Cargar perfil desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem("perfil") as Perfil | null;
    if (saved) setPerfil(saved);
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <>
      <NavbarD
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 pt-16 md:ml-64 ">{children}</main>
    </>
  );
}
