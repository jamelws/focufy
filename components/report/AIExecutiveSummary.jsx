import React from 'react'
import Card from './Card'
import CardHeader from './CardHeader'
import CardBody from './CardBody'
const LightbulbIco= () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c.401-.42.767-.864 1.126-1.317.36-.452.758-.901 1.135-1.348m11.218 0c.377.447.775.896 1.135 1.348.359.453.725.897 1.126 1.317a7.5 7.5 0 0 1-7.5 0m-3.75 2.311a12.06 12.06 0 0 1-4.5 0" /></svg>;

const AIExecutiveSummary = ({ summary }) => {
  
  return (
    <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/20">
    <CardHeader className="border-b-0">
        <div className="flex items-center">
            <LightbulbIco />
            <span>SONUS LLM: Resumen Ejecutivo</span>
        </div>
    </CardHeader>
    <CardBody>
      <p className="text-lg mb-3">
        <strong>Recomendación:</strong> {summary.recommendation}
      </p>
      <p className="mb-4 text-blue-100">
        <strong>Nicho Principal Identificado:</strong> {summary.nicheDescription}
      </p>
      <div>
        
      </div>
    </CardBody>
  </Card>
  )
}

export default AIExecutiveSummary