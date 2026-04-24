function ResultsCard({ results, lambdaRate }) {
  if (!results || results.length === 0) {
    return null
  }

  const winner = results.reduce((best, curr) =>
    curr.total_seek < best.total_seek ? curr : best
  )
  const sorted = [...results].sort((a, b) => a.total_seek - b.total_seek)

  return (
    <div className='bg-green-50 border border-green-200 rounded-2xl p-5 space-y-4'>
      <div>
        <h3 className='text-xl font-bold text-green-900'>Results Summary</h3>
        <p className='text-sm text-green-700'>Lambda rate: {lambdaRate} req/s</p>
      </div>

      <div className='bg-green-100 rounded-xl p-4 text-center'>
        <p className='text-xs text-green-600'>Best Algorithm</p>
        <p className='text-3xl font-bold text-green-800'>{winner.name}</p>
        <p className='text-sm text-green-700'>Seek Distance: {winner.total_seek}</p>
      </div>

      <div className='space-y-2'>
        {sorted.map((item, idx) => (
          <div
            key={item.name}
            className='flex items-center justify-between bg-white rounded-lg px-3 py-2'
          >
            <span className='font-mono font-bold'>
              {idx + 1}. {item.name}
            </span>
            <span className='text-sm text-gray-700'>{item.total_seek} tracks</span>
            <span className='text-sm text-purple-700 font-mono'>
              {item.complexity?.best_fit ?? '-'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResultsCard
