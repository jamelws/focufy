
import React from 'react'
import Card from './Card'
import CardHeader from './CardHeader'
import CardBody from './CardBody'
import SvgPieChart from './SvgPieChart'

const QualitativeFeedback = ({ feedback }) => (
  <Card>
    <CardHeader>Feedback Cualitativo</CardHeader>
    <CardBody>
        <h5 className="font-semibold mb-2 text-zinc-700 dark:text-zinc-200">¿En qué playlist encaja esta canción?</h5>
        <div className="w-full h-64 flex items-center justify-center">
            <SvgPieChart data={feedback.playlistFit} />
        </div>
    </CardBody>
  </Card>
)

export default QualitativeFeedback