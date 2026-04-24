import { useState } from 'react'

const ALGORITHMS = ['FCFS', 'SCAN', 'CSCAN', 'PREDICTIVE']

function ConfigPanel({ onRun, loading }) {
  const [config, setConfig] = useState({
    lambda_rate: 2,
    max_tracks: 200,
    head_start: 100,
    request_mode: 'auto',
    n_requests: 50,
    manual_tracks: [],
    algorithms: ['FCFS', 'SCAN', 'CSCAN', 'PREDICTIVE'],
  })
  const [manualInput, setManualInput] = useState('')
  const [previewTracks, setPreviewTracks] = useState([])
  const [validationError, setValidationError] = useState('')

  const updateField = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const parseManualTracks = (value, maxTracks) => {
    const parsed = value
      .split(/[\s,]+/)
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item))
      .map((item) => Math.min(Math.max(Math.round(item), 0), maxTracks))

    return parsed
  }

  const toggleAlgorithm = (algo) => {
    setConfig((prev) => {
      const exists = prev.algorithms.includes(algo)
      return {
        ...prev,
        algorithms: exists
          ? prev.algorithms.filter((item) => item !== algo)
          : [...prev.algorithms, algo],
      }
    })
  }

  const handleManualInputChange = (value) => {
    setManualInput(value)
    setValidationError('')

    const parsedTracks = parseManualTracks(value, config.max_tracks)
    setConfig((prev) => ({
      ...prev,
      request_mode: 'manual',
      manual_tracks: parsedTracks,
    }))
  }

  const handleModeChange = (mode) => {
    setConfig((prev) => ({
      ...prev,
      request_mode: mode,
    }))
    setValidationError('')
  }

  const handlePreviewTracks = () => {
    const count = config.n_requests
    const generated = Array.from({ length: count }, () =>
      Math.floor(Math.random() * (config.max_tracks + 1))
    )
    setPreviewTracks(generated)
  }

  const handleRunClick = () => {
    if (config.request_mode === 'manual') {
      if (config.manual_tracks.length < 2) {
        setValidationError('Please enter at least 2 track numbers.')
        return
      }

      setValidationError('')
      const { n_requests, ...manualConfig } = config
      onRun(manualConfig)
      return
    }

    const { manual_tracks, ...autoConfig } = config
    onRun(autoConfig)
  }

  const maxHead = config.max_tracks - 1
  const isManual = config.request_mode === 'manual'
  const displayedManualCount = config.manual_tracks.length
  const previewVisibleTracks = previewTracks.slice(0, 20)
  const previewExtraCount = Math.max(0, previewTracks.length - 20)

  return (
    <div className='bg-white border rounded-2xl p-6 shadow-sm space-y-6'>
      <h2 className='text-xl font-bold text-blue-900'>Simulation Configuration</h2>

      <div className='space-y-5'>
        <div>
          <label className='block text-sm font-semibold text-gray-800 mb-2'>
            Arrival Rate (lambda): {config.lambda_rate} req/s
          </label>
          <input
            type='range'
            min={0.1}
            max={10}
            step={0.1}
            value={config.lambda_rate}
            onChange={(e) => updateField('lambda_rate', Number(e.target.value))}
            className='w-full'
          />
          <div className='mt-1 flex justify-between text-xs text-gray-500'>
            <span>Quiet (0.1)</span>
            <span>Burst (10)</span>
          </div>
        </div>

        <div>
          <label className='block text-sm font-semibold text-gray-800 mb-2'>
            Number of Requests: {config.n_requests}
          </label>
          <input
            type='range'
            min={10}
            max={200}
            step={10}
            value={config.n_requests}
            onChange={(e) => updateField('n_requests', Number(e.target.value))}
            className='w-full'
          />
        </div>

        <div>
          <label className='block text-sm font-semibold text-gray-800 mb-2'>
            Disk Tracks: {config.max_tracks}
          </label>
          <input
            type='range'
            min={50}
            max={500}
            step={50}
            value={config.max_tracks}
            onChange={(e) => {
              const nextTracks = Number(e.target.value)
              setConfig((prev) => ({
                ...prev,
                max_tracks: nextTracks,
                head_start: Math.min(prev.head_start, nextTracks - 1),
              }))
            }}
            className='w-full'
          />
        </div>

        <div className='flex justify-start'>
          <div className='bg-gray-100 p-1 rounded-xl inline-flex gap-1'>
            <button
              type='button'
              onClick={() => handleModeChange('manual')}
              className={
                isManual
                  ? 'bg-blue-800 text-white rounded-lg px-4 py-1.5 text-sm font-semibold'
                  : 'bg-gray-100 text-gray-500 rounded-lg px-4 py-1.5 text-sm'
              }
            >
              ✏️ Manual Entry
            </button>
            <button
              type='button'
              onClick={() => handleModeChange('auto')}
              className={
                isManual
                  ? 'bg-gray-100 text-gray-500 rounded-lg px-4 py-1.5 text-sm'
                  : 'bg-blue-800 text-white rounded-lg px-4 py-1.5 text-sm font-semibold'
              }
            >
              ⚡ Auto Generate
            </button>
          </div>
        </div>

        {isManual ? (
          <div className='space-y-2'>
            <label className='block text-sm font-semibold text-gray-800'>
              Enter Track Numbers (comma or space separated)
            </label>
            <textarea
              value={manualInput}
              onChange={(e) => handleManualInputChange(e.target.value)}
              placeholder='e.g. 45, 21, 67, 3, 120, 85, 15, 170'
              rows={3}
              className='w-full rounded-xl border border-gray-300 p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-200'
            />
            <p className='text-xs text-gray-400'>{displayedManualCount} tracks entered</p>
          </div>
        ) : (
          <div className='space-y-3'>
            <div>
              <label className='block text-sm font-semibold text-gray-800 mb-2'>
                Number of Requests: {config.n_requests}
              </label>
              <input
                type='range'
                min={10}
                max={200}
                step={10}
                value={config.n_requests}
                onChange={(e) => updateField('n_requests', Number(e.target.value))}
                className='w-full'
              />
            </div>

            <div className='space-y-2'>
              <button
                type='button'
                onClick={handlePreviewTracks}
                className='rounded-xl bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800'
              >
                Preview Generated Tracks
              </button>

              {previewTracks.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {previewVisibleTracks.map((track, index) => (
                    <span
                      key={`${track}-${index}`}
                      className='bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5 font-mono'
                    >
                      {track}
                    </span>
                  ))}
                  {previewExtraCount > 0 && (
                    <span className='text-xs text-gray-400 self-center'>
                      +{previewExtraCount} more...
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {validationError && <p className='text-sm text-red-600'>{validationError}</p>}

        <div>
          <label className='block text-sm font-semibold text-gray-800 mb-2'>
            Starting Head Position: {config.head_start}
          </label>
          <input
            type='range'
            min={0}
            max={maxHead}
            step={1}
            value={config.head_start}
            onChange={(e) => updateField('head_start', Number(e.target.value))}
            className='w-full'
          />
        </div>
      </div>

      <div>
        <h3 className='text-sm font-semibold text-gray-800 mb-3'>Algorithms</h3>
        <div className='grid grid-cols-2 gap-3'>
          {ALGORITHMS.map((algo) => (
            <label
              key={algo}
              className='flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700'
            >
              <input
                type='checkbox'
                checked={config.algorithms.includes(algo)}
                onChange={() => toggleAlgorithm(algo)}
              />
              {algo}
            </label>
          ))}
        </div>
      </div>

      <button
        type='button'
        onClick={handleRunClick}
        disabled={loading || config.algorithms.length === 0}
        className='w-full bg-blue-800 text-white rounded-xl py-3 font-bold disabled:opacity-60 disabled:cursor-not-allowed'
      >
        {loading ? 'Simulating...' : 'Run Simulation'}
      </button>
    </div>
  )
}

export default ConfigPanel
