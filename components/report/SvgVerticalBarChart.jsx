import React from 'react'
const SvgVerticalBarChart = ({ data, labels, color = '#3b82f6' }) => { 
  const width = 300; 
  const height = 250; 
  const padding = 20; 
  const barPadding = 5; 
  const maxValue = Math.max(...data); 
  const barHeight = (height - padding * 2) / data.length; 
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {data.map((value, i) => { 
        const barWidth = (value / maxValue) * (width - padding - 50); 
        const y = i * barHeight + padding; 
        return (
          <g key={i}>
            <rect x={50} y={y} width={barWidth} height={barHeight - barPadding} fill={color} rx="2" />
            <text x={45} y={y + barHeight / 2} fontSize="10" fill="currentColor" textAnchor="end" alignmentBaseline="middle">{labels[i]}</text>
            <text x={55 + barWidth} y={y + barHeight / 2} fontSize="10" fill="currentColor" alignmentBaseline="middle">{value}</text>
          </g>
        );
      })}
    </svg>
  ); 
};

export default SvgVerticalBarChart