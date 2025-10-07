"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AIExecutiveSummary from "@/components/report/AIExecutiveSummary";
import KeyMetrics from "@/components/report/KeyMetrics";
import Card from "@/components/report/Card";
import SongDetailView from "@/components/report/SongDetailView";

// --- Gemini API Helper ---
const callGeminiAPI = async (prompt) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // API Key is handled by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            return "No se pudo obtener una respuesta de la IA. Intenta de nuevo.";
        }
    } catch (error) {
        console.error("Gemini API call error:", error);
        return "Error al contactar la IA. Revisa la consola para más detalles.";
    }
};

export default function ReportPage() {
  const { musicSetId } = useParams();
  const [report, setReport] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [modalContent, setModalContent] = useState('');
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  useEffect(() => {
    if (!musicSetId) return;
    fetch(`/api/artist/report/${musicSetId}`)
      .then(r => r.json())
      .then(setReport);
  }, [musicSetId]);

  if (!report) return <div className="p-6">Cargando reporte...</div>;

  const musicSet = report.musicSet;

  const Modal = ({ title, content, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={onClose}>
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <div className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap h-64 overflow-y-auto">{content}</div>
      <button onClick={onClose} className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg">Cerrar</button>
    </div>
  </div>);

  const handleSuggestFix = async (song) => {
  setIsLoadingModal(true);
  setModalContent('');

  // 👇 usar retentionData (no retentionDrop)
  const prompt = `Eres un productor musical experimentado. 
  La canción "${song.title}" tiene una caída de retención de oyentes del ${song.retentionData.drop || 0}% 
  en el minuto ${song.retentionData.at || "?"}. 
  Sugiere 3 arreglos específicos (uno de estructura, uno de instrumentación, y uno de mezcla) 
  para solucionar este problema en una canción de ${song.summary.keywords.join(', ')}. 
  Sé conciso y directo.`;

  const result = await callGeminiAPI(prompt);
  setModalContent(result);
  setIsLoadingModal(false);
};


   // 🔹 Vista detalle de canción
  if (selectedSong) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-900 min-h-screen font-sans text-zinc-800 dark:text-zinc-200 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <SongDetailView song={selectedSong} onBack={() => setSelectedSong(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      { (isLoadingModal || modalContent) && <Modal title="Sugerencias de Arreglos con IA" content={isLoadingModal ? 'Analizando...' : modalContent} onClose={() => setModalContent('')} /> }
      {/* 🔹 Resumen Ejecutivo */}
      <AIExecutiveSummary summary={musicSet.summary} />

      {/* 🔹 Key Metrics (del set completo) */}
      <KeyMetrics metrics={musicSet.metrics} />

      {/* 🔹 Listado de Canciones */}
      <div className="space-y-3">

        {/* Encabezado de la tabla */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
          <div className="col-span-5">Canción</div>
          <div className="col-span-2 text-center">Puntaje</div>
          <div className="col-span-5">Acciones</div>
        </div>

        {/* Filas de canciones */}
        {musicSet.songs.map(song => (
          <Card key={song.id} className="hover:shadow-lg hover:border-blue-500 border-2 border-transparent">
            <div className="grid grid-cols-12 gap-4 items-center p-4">
              
              {/* Nombre de la canción */}
              <div className="col-span-5">
                <p className="font-bold text-zinc-800 dark:text-white">{song.title}</p>
              </div>

              {/* Puntaje + barra de progreso */}
              <div className="col-span-2 flex flex-col items-center">
                <span
                  className={`text-xl font-bold ${
                    song.metrics.overallScore > 8.5
                      ? 'text-green-500'
                      : song.metrics.overallScore > 7
                      ? 'text-blue-500'
                      : 'text-zinc-500'
                  }`}
                >
                  {song.metrics.overallScore}
                </span>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${song.metrics.overallScore * 10}%` }}
                  ></div>
                </div>
              </div>

              {/* Acciones */}
              <div className="col-span-5 flex justify-end space-x-2">
                {(song.metrics.overallScore < 5) && (
                  <button onClick={() => handleSuggestFix(song)}
                    className="flex items-center px-3 py-2 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    ✨ Sugerir Arreglos
                  </button>
                )}
                <button
                  onClick={() => setSelectedSong(song)}
                  className="px-3 py-2 text-xs font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Ver Análisis
                </button>
              </div>

            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}
