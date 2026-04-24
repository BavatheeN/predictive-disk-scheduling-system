import axios from 'axios'

export async function runSimulation(config) {
  // Build the payload based on mode
  const payload = {
    lambda_rate:  config.lambda_rate,
    max_tracks:   config.max_tracks,
    head_start:   config.head_start,
    algorithms:   config.algorithms,
    request_mode: config.request_mode,
  }

  if (config.request_mode === 'manual') {
    payload.manual_tracks = config.manual_tracks
  } else {
    payload.n_requests = config.n_requests
  }

  const response = await axios.post('http://localhost:8000/simulate', payload)
  return response.data
}

export async function fetchBounds() {
  const response = await axios.get('http://localhost:8000/bounds')
  return response.data
}

export function openWebSocket(config, onStep, onDone) {
  const ws = new WebSocket('ws://localhost:8000/ws/simulate')

  ws.onopen = () => {
    ws.send(JSON.stringify(config))
  }

  ws.onmessage = (e) => {
    onStep(JSON.parse(e.data))
  }

  ws.onclose = () => {
    onDone()
  }

  ws.onerror = (e) => {
    console.error('WS error', e)
  }

  return ws
}
