"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Perfil = "CURADOR" | "CREADOR";

interface SesionContextType {
  perfil: Perfil;
  setPerfil: (p: Perfil) => void;
  lang: string;
  setLang: (l: string) => void;
}

const SesionContext = createContext<SesionContextType | undefined>(undefined);

export function SesionProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [perfil, setPerfilState] = useState<Perfil>("CURADOR");
  const [lang, setLangState] = useState<string>("es");

  useEffect(() => {
    const savedPerfil = localStorage.getItem("perfil") as Perfil | null;
    const savedLang = localStorage.getItem("lang");
    if (savedPerfil) setPerfilState(savedPerfil);
    if (savedLang) {
      setLangState(savedLang);
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const setPerfil = (nuevo: Perfil) => {
    setPerfilState(nuevo);
    localStorage.setItem("perfil", nuevo);
  };

  const setLang = (nuevo: string) => {
    setLangState(nuevo);
    localStorage.setItem("lang", nuevo);
    i18n.changeLanguage(nuevo);
  };

  return (
    <SesionContext.Provider value={{ perfil, setPerfil, lang, setLang }}>      
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion() {
  const ctx = useContext(SesionContext);
  if (!ctx) throw new Error("useSesion debe usarse dentro de SesionProvider");
  return ctx;
}
