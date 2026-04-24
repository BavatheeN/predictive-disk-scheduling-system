import { useEffect, useState } from 'react'
import axios from 'axios'

function PredictionCard({ lambdaRate, tracks }) {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const fetchPrediction = async () => {
      setLoading(true)
      try {
        const response = await axios.get('http://localhost:8000/predict', {
          params: {
            lambda_rate: lambdaRate,
            tracks: tracks.join(','),
          },
        })
        if (active) {
          setPrediction(response.data)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchPrediction()

    return () => {
      active = false
    }
  }, [lambdaRate, tracks])

  if (loading || !prediction) {
    return (
      <div className='bg-purple-50 border border-purple-200 rounded-2xl p-5'>
        <h3 className='text-purple-900 font-bold text-lg mb-3'>🔮 System Prediction</h3>
        <p className='text-sm text-purple-800'>Analyzing request pattern...</p>
      </div>
    )
  }

  const algorithmColor =
    prediction.recommended_algorithm === 'SCAN'
      ? 'text-blue-600'
      : prediction.recommended_algorithm === 'FCFS'
        ? 'text-red-600'
        : 'text-green-600'

  const statusBadge =
    prediction.load_status === 'burst'
      ? 'bg-red-100 text-red-700'
      : prediction.load_status === 'quiet'
        ? 'bg-green-100 text-green-700'
        : 'bg-blue-100 text-blue-700'

  return (
    <div className='bg-purple-50 border border-purple-200 rounded-2xl p-5 space-y-4'>
      <h3 className='text-purple-900 font-bold text-lg'>🔮 System Prediction</h3>

      <div className='grid grid-cols-3 gap-3'>
        <div className='bg-white rounded-xl p-3 text-center'>
          <p className='text-xs text-gray-400'>Predicted Next Track</p>
          <p className='text-2xl font-bold text-purple-700'>{prediction.predicted_next_track}</p>
          <p className='text-xs text-gray-400'>Pre-position head here</p>
        </div>

        <div className='bg-white rounded-xl p-3 text-center'>
          <p className='text-xs text-gray-400'>Best Algorithm Now</p>
          <p className={`text-2xl font-bold ${algorithmColor}`}>
            {prediction.recommended_algorithm}
          </p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${statusBadge}`}>
            {prediction.load_status}
          </span>
        </div>

        <div className='bg-white rounded-xl p-3 text-center'>
          <p className='text-xs text-gray-400'>Observed / Expected Rate</p>
          <p className='text-2xl font-bold text-gray-700'>{prediction.ratio.toFixed(2)}x</p>
          <p className='text-xs text-gray-400'>λ = {lambdaRate} req/s</p>
        </div>
      </div>

      <div className='bg-purple-100 rounded-xl p-3'>
        <p className='text-sm text-purple-800'>💡 {prediction.explanation}</p>
      </div>
    </div>
  )
}

export default PredictionCard
