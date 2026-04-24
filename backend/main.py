import asyncio
import json
from typing import Dict

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from analyser import fit_complexity, theoretical_bounds
from db import create_db_and_tables, get_recent_runs, save_run
from models import (
    AlgorithmResult,
    ComplexityResult,
    PredictionResponse,
    SimulationRequest,
    SimulationResponse,
)
from poisson import generate_requests, get_tracks
from predictor import adaptive_algorithm, predict_next_track
from schedulers import cscan, fcfs, predictive, scan


app = FastAPI(title="Predictive Disk Scheduling API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.get("/")
def root() -> Dict[str, str]:
    return {"status": "running", "docs": "/docs"}


@app.post("/simulate", response_model=SimulationResponse)
def simulate(req: SimulationRequest) -> SimulationResponse:
    if req.request_mode == 'manual':
        tracks = req.manual_tracks
        interval = 1.0 / req.lambda_rate
        requests = [
            {'time': round(i * interval, 4), 'track': t}
            for i, t in enumerate(tracks)
        ]
    else:
        requests = generate_requests(req.lambda_rate, req.n_requests, req.max_tracks)
        tracks = get_tracks(requests)

    results = []
    algo_map = {'FCFS': fcfs, 'SCAN': scan, 'CSCAN': cscan}

    for algo_name in req.algorithms:
        if algo_name == 'PREDICTIVE':
            raw = predictive(requests, req.head_start, req.lambda_rate)
        else:
            fn = algo_map.get(algo_name)
            if not fn:
                continue
            raw = fn(tracks, req.head_start, req.max_tracks)

        cx = fit_complexity(raw['T_n'])
        results.append(AlgorithmResult(
            name=raw['name'],
            total_seek=raw['total_seek'],
            seek_history=raw['seek_history'],
            T_n=raw['T_n'],
            complexity=ComplexityResult(**cx)
        ))

    save_run(req.lambda_rate, len(tracks), str([r.dict() for r in results]))

    return SimulationResponse(
        lambda_rate=req.lambda_rate,
        n_requests=len(tracks),
        tracks=tracks,
        results=results,
    )


@app.get('/predict', response_model=PredictionResponse)
def predict(lambda_rate: float = 2.0, tracks: str = ''):
    """
    Prediction endpoint.
    - tracks: comma-separated list of recent track numbers e.g. '45,21,67,3,120'
    - lambda_rate: the Poisson arrival rate used in the simulation

    Returns:
    - predicted_next_track: where the disk head should pre-position
    - recommended_algorithm: best algorithm for current load
    - load_status: burst / quiet / normal
    - explanation: plain English summary
    """
    if tracks.strip():
        try:
            track_list = [int(x.strip()) for x in tracks.split(',') if x.strip()]
        except ValueError:
            track_list = []
    else:
        track_list = []

    predicted_track = predict_next_track(track_list) if track_list else 100

    import random
    n = max(len(track_list), 5)
    inter_arrivals = [random.expovariate(lambda_rate) for _ in range(n)]

    adaptive = adaptive_algorithm(inter_arrivals, lambda_rate)

    status = adaptive['load_status']
    algo = adaptive['recommended_algorithm']
    ratio = adaptive['ratio']

    if status == 'burst':
        explanation = (
            f"Observed arrival rate is {ratio:.1f}x higher than expected (λ={lambda_rate}). "
            f"Burst detected — SCAN recommended to handle high request volume efficiently."
        )
    elif status == 'quiet':
        explanation = (
            f"Observed arrival rate is only {ratio:.1f}x of expected (λ={lambda_rate}). "
            f"Quiet period — FCFS recommended for simplicity under low load."
        )
    else:
        explanation = (
            f"Arrival rate is normal (ratio={ratio:.1f}, λ={lambda_rate}). "
            f"CSCAN recommended for balanced performance and fairness."
        )

    return PredictionResponse(
        predicted_next_track=predicted_track,
        recommended_algorithm=algo,
        load_status=status,
        observed_rate=adaptive['observed_rate'],
        expected_rate=adaptive['expected_rate'],
        ratio=ratio,
        explanation=explanation,
    )


@app.get("/bounds")
def bounds():
    return theoretical_bounds()


@app.get("/history")
def history():
    return get_recent_runs()


@app.websocket("/ws/simulate")
async def ws_simulate(websocket: WebSocket) -> None:
    await websocket.accept()

    payload = await websocket.receive_json()
    req = SimulationRequest(**payload)

    requests = generate_requests(req.lambda_rate, req.n_requests, req.max_tracks)
    tracks = get_tracks(requests)

    result = fcfs(tracks, req.head_start, req.max_tracks)

    for i, (head, t_val) in enumerate(zip(result["seek_history"], result["T_n"])):
        await websocket.send_json({"step": i, "head": head, "T_n": t_val})
        await asyncio.sleep(0.08)

    await websocket.close()
