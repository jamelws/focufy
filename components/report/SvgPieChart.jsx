import React from 'react'

const SvgPieChart = ({ data }) => {
  const size = 200;
  const radius = size / 2;
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent) * radius;
    const y = Math.sin(2 * Math.PI * percent) * radius;
    return [x, y];
  };

  return (
    <div className="flex items-center justify-center">
      <svg height={size} width={size} viewBox={`-${radius} -${radius} ${size} ${size}`}>
        {data.map(({ value, color }, i) => {
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
          cumulativePercent += value / 100;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          const largeArcFlag = value > 50 ? 1 : 0;
          const pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;

          return (
            <path
              key={`${color}-${i}`}   // ✅ clave única
              d={pathData}
              fill={color}
            />
          );
        })}
      </svg>

      {/* 👉 Leyenda de colores */}
      <div className="ml-4 text-sm">
        {data.map((d, i) => (
          <div key={`${d.color}-legend-${i}`} className="flex items-center mb-1">
            <div
              className="w-4 h-4 mr-2 rounded"
              style={{ backgroundColor: d.color }}
            />
            <span>{d.label || `Segmento ${i + 1}`} - {d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SvgPieChart;
