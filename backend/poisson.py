import random
from typing import Dict, List

import numpy as np


def generate_requests(lambda_rate, n_requests, max_tracks=200) -> list[dict]:
    requests: List[Dict[str, float | int]] = []
    t = 0.0
    for _ in range(n_requests):
        t += random.expovariate(lambda_rate)
        requests.append(
            {
                "time": round(t, 4),
                "track": random.randint(0, max_tracks - 1),
            }
        )
    return requests


def get_tracks(requests) -> list[int]:
    return [req["track"] for req in requests]


def arrival_stats(requests) -> dict:
    if not requests:
        return {"total_time": 0.0, "mean_gap": 0.0, "std_gap": 0.0}

    times = np.array([req["time"] for req in requests], dtype=float)
    gaps = np.diff(np.concatenate(([0.0], times)))

    return {
        "total_time": float(times[-1]),
        "mean_gap": float(np.mean(gaps)) if len(gaps) else 0.0,
        "std_gap": float(np.std(gaps)) if len(gaps) else 0.0,
    }
