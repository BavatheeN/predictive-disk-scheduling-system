const THEORY = {
  FCFS: {
    best: 'O(n)',
    avg: 'O(n·D)',
    worst: 'O(n·D)',
    note: 'No sorting — random order',
  },
  SCAN: {
    best: 'O(n)',
    avg: 'O(√n)',
    worst: 'O(n)',
    note: 'Sorted sweep — bounded by 2D',
  },
  CSCAN: {
    best: 'O(n)',
    avg: 'O(√n)',
    worst: 'O(n)',
    note: 'Circular — fairer variance',
  },
  PREDICTIVE: {
    best: 'O(n)',
    avg: 'O(n log n)',
    worst: 'O(n²)',
    note: 'λ-aware greedy scoring',
  },
}

function ComplexityTable({ results }) {
  if (results === null) {
    return null
  }

  return (
    <div className='bg-white border rounded-2xl p-6 shadow-sm space-y-4'>
      <h3 className='text-lg font-bold text-gray-900'>Asymptotic Complexity Analysis</h3>

      <div className='overflow-x-auto'>
        <table className='min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden'>
          <thead>
            <tr className='bg-blue-900 text-white'>
              <th className='text-left px-4 py-3'>Algorithm</th>
              <th className='text-left px-4 py-3'>Best Case</th>
              <th className='text-left px-4 py-3'>Average Case</th>
              <th className='text-left px-4 py-3'>Worst Case</th>
              <th className='text-left px-4 py-3'>Empirical Fit</th>
              <th className='text-left px-4 py-3'>R² Score</th>
              <th className='text-left px-4 py-3'>Notes</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => {
              const theory = THEORY[r.name]
              return (
                <tr key={r.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className='px-4 py-3 font-bold font-mono'>{r.name}</td>
                  <td className='px-4 py-3 text-green-700'>{theory?.best ?? '-'}</td>
                  <td className='px-4 py-3 text-blue-700'>{theory?.avg ?? '-'}</td>
                  <td className='px-4 py-3 text-red-700'>{theory?.worst ?? '-'}</td>
                  <td className='px-4 py-3 text-purple-700 font-mono font-bold'>
                    {r.complexity?.best_fit ?? '-'}
                  </td>
                  <td className='px-4 py-3 text-gray-500'>
                    {r.complexity?.r2_score?.toFixed(3) ?? '-'}
                  </td>
                  <td className='px-4 py-3 text-gray-400 text-xs'>{theory?.note ?? '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ComplexityTable
