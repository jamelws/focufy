import React from 'react'

const SvgLineChart = ({ data, timestamps, color = '#8257e5' }) => {
  const width = 500;
    const height = 200;
    const padding = 20;
    const points = data.map((point, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - (point / 100) * (height - padding * 2) - padding;
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `${points} ${width - padding},${height - padding} ${padding},${height - padding}`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
                </linearGradient>
            </defs>
            <polyline fill="url(#gradient)" points={areaPoints} />
            <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
            {timestamps.map((ts, i) => {
                 const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
                 return <text key={i} x={x} y={height - 5} fontSize="10" fill="currentColor" textAnchor="middle">{ts}</text>
            })}
        </svg>
    );
}

export default SvgLineChart