// app/dashboard/layout.tsx
"use client";

import { useState } from "react";
import { SesionProvider } from "@/context/SesionContext";
import NavbarD from "@/components/NavbarD";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SesionProvider>
      {/* Navbar superior */}
      <NavbarD
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="pt-16 flex">
        {/* Sidebar lateral */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Contenido principal */}
        <main className="flex-1 ml-0 md:ml-64 p-6  dark:bg-zinc-900 min-h-screen">
          {children}
        </main>
      </div>
    </SesionProvider>
  );
}
