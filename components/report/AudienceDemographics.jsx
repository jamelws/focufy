import React from 'react'
import Card from './Card'
import CardHeader from './CardHeader'
import CardBody from './CardBody'
import SvgVerticalBarChart from './SvgVerticalBarChart'

const AudienceDemographics = ({ demographics }) => {
  return (
    <Card>
        <CardHeader>Perfil Demográfico del Oyente</CardHeader>
        <CardBody>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                El grupo de 25-28 años muestra la mayor afinidad.
            </p>
            <div className="w-full h-64">
                <SvgVerticalBarChart data={demographics.data} labels={demographics.labels} />
            </div>
        </CardBody>
    </Card>
  )
}

export default AudienceDemographics