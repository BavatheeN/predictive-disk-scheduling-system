import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const COLORS = {
  FCFS: '#EF4444',
  SCAN: '#3B82F6',
  CSCAN: '#10B981',
  PREDICTIVE: '#8B5CF6',
}

function RecurrenceChart({ results }) {
  if (!results || results.length === 0) {
    return null
  }

  const maxLen = Math.max(...results.map((r) => r.T_n.length))
  const data = Array.from({ length: maxLen }, (_, i) => {
    const row = { n: i }
    results.forEach((r) => {
      row[r.name] = r.T_n[i] ?? null
    })
    return row
  })

  return (
    <div className='bg-white border rounded-2xl p-6 shadow-sm space-y-3'>
      <h3 className='text-lg font-bold text-gray-900'>T(n) Recurrence Curves</h3>
      <p className='text-sm text-gray-500'>
        T(n) = cumulative seek cost after n steps. Steeper curve = higher complexity class.
      </p>

      <div className='w-full h-[280px]'>
        <ResponsiveContainer width='100%' height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='n'
              label={{ value: 'n (steps)', position: 'insideBottom', offset: -4 }}
            />
            <YAxis
              label={{ value: 'T(n)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend verticalAlign='top' />
            {results.map((r) => (
              <Line
                key={r.name}
                type='monotone'
                dataKey={r.name}
                connectNulls={false}
                dot={false}
                strokeWidth={2}
                stroke={COLORS[r.name]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RecurrenceChart
