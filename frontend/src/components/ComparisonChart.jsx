import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#8B5CF6']

function ComparisonChart({ results }) {
  if (!results || results.length === 0) {
    return null
  }

  const data = results.map((r) => ({ name: r.name, 'Seek Distance': r.total_seek }))
  const minSeek = Math.min(...results.map((r) => r.total_seek))

  return (
    <div className='bg-white border rounded-2xl p-6 shadow-sm space-y-3'>
      <h3 className='text-lg font-bold text-gray-900'>Total Seek Distance Comparison</h3>
      <p className='text-sm text-gray-500'>
        Lower = better. Measures total disk head movement.
      </p>

      <div className='w-full h-[280px]'>
        <ResponsiveContainer width='100%' height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip />
            <Bar dataKey='Seek Distance' radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={entry['Seek Distance'] === minSeek ? 1 : 0.65}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className='text-sm text-green-700 font-semibold'>
        Highlighted bar = winner (lowest seek)
      </p>
    </div>
  )
}

export default ComparisonChart
