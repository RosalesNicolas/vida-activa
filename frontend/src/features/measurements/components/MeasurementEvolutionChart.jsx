function formatDate(date) {
  if (!date) return ''

  return new Date(
    `${date}T00:00:00`,
  ).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

function MeasurementEvolutionChart({
  title,
  data,
  dataKey,
  unit,
}) {
  const width = 760
  const height = 280

  const padding = {
    top: 25,
    right: 30,
    bottom: 45,
    left: 55,
  }

  const validData = data.filter((item) => {
    const value = Number(item[dataKey])

    return (
      item.date &&
      Number.isFinite(value)
    )
  })

  if (validData.length === 0) {
    return (
      <div className="card border-0 shadow-sm p-4 h-100">
        <h2 className="h5 mb-3">{title}</h2>

        <p className="text-secondary mb-0">
          No hay datos suficientes para mostrar el gráfico.
        </p>
      </div>
    )
  }

  const values = validData.map((item) =>
    Number(item[dataKey]),
  )

  const minimumValue = Math.min(...values)
  const maximumValue = Math.max(...values)

  const difference = maximumValue - minimumValue

  const verticalMargin =
    difference === 0
      ? Math.max(maximumValue * 0.05, 1)
      : difference * 0.15

  const chartMinimum = Math.max(
    0,
    minimumValue - verticalMargin,
  )

  const chartMaximum =
    maximumValue + verticalMargin

  const chartWidth =
    width - padding.left - padding.right

  const chartHeight =
    height - padding.top - padding.bottom

  const getX = (index) => {
    if (validData.length === 1) {
      return padding.left + chartWidth / 2
    }

    return (
      padding.left +
      (index / (validData.length - 1)) *
        chartWidth
    )
  }

  const getY = (value) => {
    const range =
      chartMaximum - chartMinimum || 1

    return (
      padding.top +
      chartHeight -
      ((value - chartMinimum) / range) *
        chartHeight
    )
  }

  const points = validData.map((item, index) => ({
    x: getX(index),
    y: getY(Number(item[dataKey])),
    value: Number(item[dataKey]),
    date: item.date,
  }))

  const path = points
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`,
    )
    .join(' ')

  const gridLines = Array.from(
    { length: 5 },
    (_, index) => {
      const ratio = index / 4

      return {
        y:
          padding.top +
          ratio * chartHeight,
        value:
          chartMaximum -
          ratio *
            (chartMaximum - chartMinimum),
      }
    },
  )

  const latestPoint =
    points[points.length - 1]

  return (
    <div className="card border-0 shadow-sm p-4 h-100">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h2 className="h5 mb-0">
          {title}
        </h2>

        <div className="text-end">
          <strong className="d-block">
            {latestPoint.value.toFixed(1)} {unit}
          </strong>

          <small className="text-secondary">
            Último registro
          </small>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={title}
          style={{
            width: '100%',
            minWidth: '560px',
          }}
        >
          {gridLines.map((line) => (
            <g key={line.y}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={line.y}
                y2={line.y}
                stroke="#dee2e6"
                strokeWidth="1"
              />

              <text
                x={padding.left - 10}
                y={line.y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#6c757d"
              >
                {line.value.toFixed(1)}
              </text>
            </g>
          ))}

          <line
            x1={padding.left}
            x2={padding.left}
            y1={padding.top}
            y2={height - padding.bottom}
            stroke="#6c757d"
          />

          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={height - padding.bottom}
            y2={height - padding.bottom}
            stroke="#6c757d"
          />

          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <circle
              key={`${point.date}-${point.x}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="white"
              stroke="currentColor"
              strokeWidth="3"
            >
              <title>
                {formatDate(point.date)}: {point.value} {unit}
              </title>
            </circle>
          ))}

          <text
            x={padding.left}
            y={height - 15}
            textAnchor="start"
            fontSize="12"
            fill="#6c757d"
          >
            {formatDate(validData[0].date)}
          </text>

          <text
            x={width - padding.right}
            y={height - 15}
            textAnchor="end"
            fontSize="12"
            fill="#6c757d"
          >
            {formatDate(
              validData[validData.length - 1].date,
            )}
          </text>
        </svg>
      </div>
    </div>
  )
}

export default MeasurementEvolutionChart
