import React from 'react'
import Card from './Card'
import CardHeader from './CardHeader'
import CardBody from './CardBody'
import SvgLineChart from './SvgLineChart'

const SongRetentionChart = ({ retentionData }) => {
  return (
    <Card>
        <CardHeader>Retención de Oyentes (Segundo a Segundo)</CardHeader>
        <CardBody>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
            Identifica las partes exactas donde la canción pierde interés. La caída en el segundo 90 es una oportunidad de mejora.
        </p>
        <div className="w-full h-72">
            <SvgLineChart data={retentionData.retention} timestamps={retentionData.timestamps} />
        </div>
        </CardBody>
    </Card>
  )
}

export default SongRetentionChart