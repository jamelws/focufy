"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from "react-i18next";

export default function SelectReportPage() {
  const [musicSets, setMusicSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const fetchMusicSets = async () => {
      try {
        const response = await fetch('/api/artist/report');
        if (!response.ok) {
          throw new Error('Error al cargar los proyectos.');
        }
        const data = await response.json();
        setMusicSets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMusicSets();
  }, []);
  useEffect(() => { setMounted(true); }, []);
  if(!mounted) return null;
  if (isLoading) return <p className="text-center p-8">{t("loading")}</p>;
  if (error) return <p className="text-center text-red-500 p-8">{error}</p>;
  
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">{t("selectrep")}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            {t("repdesc")}
          </p>
        </header>
        <div className="space-y-4">
          {musicSets.length > 0 ? (
            musicSets.map((set) => (
              <Link
                href={`/dashboard/artist/report/${set.id}`}
                key={set.id}
                className="block p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <h2 className="font-bold text-xl text-blue-600 dark:text-blue-400">{set.name}</h2>
              </Link>
            ))
          ) : (
            <p className="text-center text-zinc-500">{t("notokensforrep")}</p>
          )}
        </div>
      </div>
    </div>
  );
}