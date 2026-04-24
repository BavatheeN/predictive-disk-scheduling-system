import { useEffect, useRef } from 'react'

const ALGO_COLORS = {
  FCFS: '#EF4444',
  SCAN: '#3B82F6',
  CSCAN: '#10B981',
  PREDICTIVE: '#8B5CF6',
}

function DiskVisualizer({ results, maxTracks }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !results || results.length === 0) {
      return
    }

    const ctx = canvas.getContext('2d')
    const W = 760
    const H = 200
    const PAD = 50
    const trackW = W - 2 * PAD

    canvas.width = W
    canvas.height = H

    ctx.fillStyle = '#F8FAFC'
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = '#E2E8F0'
    ctx.fillRect(PAD, H / 2 - 6, trackW, 12)

    ctx.fillStyle = '#94A3B8'
    ctx.font = '12px sans-serif'
    ctx.fillText('0', PAD - 6, H / 2 + 24)
    ctx.fillText(String(maxTracks), PAD + trackW - 8, H / 2 + 24)

    results.forEach((algo, idx) => {
      const color = ALGO_COLORS[algo.name] || '#334155'
      const yOffset = (idx - (results.length - 1) / 2) * 22
      const y = H / 2 + yOffset

      ctx.beginPath()
      ctx.setLineDash([6, 4])
      ctx.strokeStyle = color
      ctx.lineWidth = 2

      algo.seek_history.forEach((track, pointIdx) => {
        const x = PAD + (track / maxTracks) * trackW
        if (pointIdx === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
      ctx.setLineDash([])

      const firstX = PAD + (algo.seek_history[0] / maxTracks) * trackW
      ctx.beginPath()
      ctx.fillStyle = color
      ctx.arc(firstX, y, 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = color
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText(algo.name, 4, y + 4)
    })
  }, [results, maxTracks])

  if (!results || results.length === 0) {
    return null
  }

  return (
    <div className='bg-white border rounded-2xl p-6 shadow-sm space-y-4'>
      <h3 className='text-lg font-bold text-gray-900'>
        Disk Arm Movement (Track 0 to {maxTracks})
      </h3>

      <canvas
        ref={canvasRef}
        className='w-full rounded-lg border border-gray-100'
      />

      <div className='flex flex-wrap gap-4'>
        {results.map((r) => (
          <div key={r.name} className='flex items-center gap-2 text-sm text-gray-700'>
            <span
              className='inline-block w-8 h-0.5'
              style={{ backgroundColor: ALGO_COLORS[r.name] }}
            />
            <span>{r.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DiskVisualizer
