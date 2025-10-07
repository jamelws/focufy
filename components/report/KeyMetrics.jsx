import React from 'react';
import MetricCard from './MetricCard';

const RepeatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-purple-500"><path strokeLinecap="round" strokeLinejoin="round" d="m16.023 9.348-4.992 0a.75.75 0 0 1 0-1.5h4.992a.75.75 0 0 1 0 1.5Zm-4.992 1.5a.75.75 0 0 0 0 1.5h4.992a.75.75 0 0 0 0-1.5h-4.992Zm-4.992-1.5a.75.75 0 0 1 0-1.5h4.992a.75.75 0 0 1 0 1.5H6.039Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>;

const KeyMetrics = ({ metrics }) => {
  console.log("metrics",metrics)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Reproducciones" value={metrics.playCount} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" /></svg>} />
        <MetricCard title="Tasa de Finalización" value={`${metrics.completionRate}%`} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>} />
        <MetricCard title="Ratio de Repetición" value={`${metrics.replayRatio}%`} icon={<RepeatIcon />} />
        <MetricCard title="Puntaje General" value={metrics.overallScore} icon={<StarIcon />} />
    </div>
  )
}

export default KeyMetrics;