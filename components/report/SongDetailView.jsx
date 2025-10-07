import React from 'react'
import AIExecutiveSummary from './AIExecutiveSummary'
import Card from './Card'
import CardHeader from './CardHeader'
import CardBody from './CardBody'
import SvgLineChart from './SvgLineChart'
import SvgVerticalBarChart from './SvgVerticalBarChart'
import SvgPieChart from './SvgPieChart'
import MarketingStrategy from './MarketingStrategy'

const SongDetailView = ({ song, onBack }) => {
  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
      >
        &larr; Volver al Resumen
      </button>

      <div className="space-y-6">
        {/* Retención + Demográficos */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>Retención de Oyentes</CardHeader>
              <CardBody>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                  Análisis segundo a segundo del engagement.
                </p>
                <div className="w-full h-72">
                  <SvgLineChart
                    data={song.retentionData.retention}
                    timestamps={song.retentionData.timestamps}
                  />
                </div>
              </CardBody>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>Perfil Demográfico</CardHeader>
              <CardBody>
                <div className="w-full h-64">
                  {console.log("DEMOS:", song.demographics)}
                  <SvgVerticalBarChart data={song.demographics.data} labels={song.demographics.labels} />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Marketing + Feedback */}
        

        {/* 🔹 Nueva sección: Respuestas por Pregunta */}
        <div className="space-y-6">
            {song.responsesGrouped && song.responsesGrouped.length > 0 ? (
                song.responsesGrouped.map((q, idx) => (
                    <Card key={q.questionId || idx}>
                    <CardHeader>{q.questionText}</CardHeader>
                    <CardBody>
                        {q.type === "TEXT" ? (
                        // Mostrar respuestas abiertas
                        q.rawValues.length > 0 ? (
                            <ul className="text-sm space-y-1 h-64 overflow-y-auto">
                            {q.rawValues.map((val, idx) => (
                                <li key={idx} className="p-2 bg-gray-100 rounded">
                                {val}
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">Sin respuestas registradas.</p>
                        )
                        ) : (
                        // Mostrar gráfico
                        q.chartData && q.chartData.length > 0 ? (
                            <div className="w-full h-64 flex items-center justify-center">
                            <SvgPieChart data={q.chartData} />
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Sin respuestas registradas.</p>
                        )
                        )}
                    </CardBody>
                    </Card>
                ))
                ) : (
                <p className="text-sm text-gray-500">Sin preguntas encontradas.</p>
            )}
        </div>
      </div>
    </div>
  )
}

export default SongDetailView
