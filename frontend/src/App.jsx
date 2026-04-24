import { useState } from 'react'
import { runSimulation } from './api/simulate'
import ComparisonChart from './components/ComparisonChart'
import ComplexityTable from './components/ComplexityTable'
import ConfigPanel from './components/ConfigPanel'
import DiskVisualizer from './components/DiskVisualizer'
import PredictionCard from './components/PredictionCard'
import RecurrenceChart from './components/RecurrenceChart'
import ResultsCard from './components/ResultsCard'

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [config, setConfig] = useState(null)

  const handleRun = async (cfg) => {
    setLoading(true)
    setError(null)
    setConfig(cfg)

    try {
      const data = await runSimulation(cfg)
      setResult(data)
    } catch {
      setError('Failed to connect to backend. Is it running on port 8000?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-blue-900 text-white px-8 py-5'>
        <h1 className='text-2xl font-bold'>Predictive Disk Scheduling System</h1>
        <p className='text-blue-200 text-sm mt-1'>
          OS + DAA + Poisson Simulation | FCFS vs SCAN vs C-SCAN vs Predictive
        </p>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-8 space-y-8'>
        <section className='space-y-3'>
          <ConfigPanel onRun={handleRun} loading={loading} />
          {error && <p className='text-red-600 text-sm font-medium'>{error}</p>}
        </section>

        {result && (
          <>
            <section>
              <PredictionCard
                lambdaRate={config.lambda_rate}
                tracks={result.tracks}
              />
            </section>

            <DiskVisualizer results={result.results} maxTracks={config.max_tracks} />

            <section className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <ComparisonChart results={result.results} />
              <RecurrenceChart results={result.results} />
            </section>

            <ComplexityTable results={result.results} />

            <ResultsCard results={result.results} lambdaRate={result.lambda_rate} />
          </>
        )}
      </main>
    </div>
  )
}

export default App