"use client";

import { useState, useEffect } from "react";
import QualitativeFeedback from "@/components/report/QualitativeFeedback";
import AudienceAffinity from "@/components/report/AudienceAffinity";
import AudienceDemographics from "@/components/report/AudienceDemographics";
import SongRetentionChart from "@/components/report/SongRetentionChart";
import KeyMetrics from "@/components/report/KeyMetrics";
import AIExecutiveSummary from "@/components/report/AIExecutiveSummary";

export default function ReportDetailPage({ params }) {
  const { musicSetId } = params;
  const [reportData, setReportData] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!musicSetId) return;
    (async () => {
      try {
        const res = await fetch(`/api/report/${musicSetId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error cargando reporte");
        setReportData(data);
        setSelectedVersionId(data.versions[0]?.id || null);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [musicSetId]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!reportData) return <div className="text-gray-500">Cargando reporte…</div>;

  const selectedData = reportData.versions.find(v => v.id === selectedVersionId);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 min-h-screen font-sans text-zinc-800 dark:text-zinc-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Dashboard de Análisis FOCUFY
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Reporte para: <span className="font-semibold text-blue-500">{reportData.songTitle}</span> por <span className="font-semibold">{reportData.artistName}</span>
          </p>
        </header>

        {/* Selector de versiones */}
        <div className="mb-6">
          <div className="flex items-center bg-white dark:bg-zinc-800 p-1 rounded-lg shadow-sm w-fit">
            {reportData.versions.map(version => (
              <button 
                key={version.id}
                onClick={() => setSelectedVersionId(version.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  selectedVersionId === version.id 
                    ? 'bg-blue-500 text-white shadow' 
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                {version.name}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido dinámico */}
        {selectedData && (
          <div className="space-y-6">
            <AIExecutiveSummary summary={selectedData.summary} />
            <KeyMetrics metrics={selectedData.metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <SongRetentionChart retentionData={selectedData.retentionData} />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <AudienceDemographics demographics={selectedData.demographics} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <AudienceAffinity affinity={selectedData.affinity} />
              <QualitativeFeedback feedback={selectedData.feedback} />
            </div>
          </div>
        )}

        <footer className="text-center mt-12 text-sm text-zinc-400">
          <p>&copy; {new Date().getFullYear()} FOCUFY. Decisiones inteligentes para tu música.</p>
        </footer>
      </div>
    </div>
  );
}
