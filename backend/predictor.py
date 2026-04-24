import numpy as np


def predict_next_track(history: list[int], window: int = 5) -> int:
    """
    Predicts the next disk track request using weighted moving average.
    Uses the last `window` track numbers as input features.
    Weights: more recent requests get higher weight.
    Returns the predicted next track as an integer.
    If history has fewer than 2 items, return the last item or 0.
    """
    if len(history) < 2:
        return history[-1] if history else 0
    recent = history[-window:]
    weights = np.arange(1, len(recent) + 1, dtype=float)
    predicted = int(np.average(recent, weights=weights))
    return predicted


def adaptive_algorithm(inter_arrival_times: list[float],
                        lambda_rate: float) -> dict:
    """
    Looks at recent inter-arrival times between disk requests.
    Compares observed arrival rate vs expected Poisson rate (lambda).
    Classifies current load and recommends the best scheduling algorithm.

    Rules:
    - If observed_rate > 1.5 * lambda_rate  → BURST  → recommend SCAN
    - If observed_rate < 0.5 * lambda_rate  → QUIET  → recommend FCFS
    - Otherwise                             → NORMAL → recommend CSCAN

    Returns a dict with:
    - recommended_algorithm: str
    - load_status: 'burst' | 'quiet' | 'normal'
    - observed_rate: float (rounded to 3 decimal places)
    - expected_rate: float (lambda_rate)
    - ratio: float (observed / expected, rounded to 3 decimal places)
    """
    if len(inter_arrival_times) < 3:
        return {
            'recommended_algorithm': 'SCAN',
            'load_status': 'normal',
            'observed_rate': lambda_rate,
            'expected_rate': lambda_rate,
            'ratio': 1.0
        }

    observed_rate = 1.0 / np.mean(inter_arrival_times)
    ratio = observed_rate / lambda_rate

    if ratio > 1.5:
        status = 'burst'
        algo   = 'SCAN'
    elif ratio < 0.5:
        status = 'quiet'
        algo   = 'FCFS'
    else:
        status = 'normal'
        algo   = 'CSCAN'

    return {
        'recommended_algorithm': algo,
        'load_status':           status,
        'observed_rate':         round(float(observed_rate), 3),
        'expected_rate':         float(lambda_rate),
        'ratio':                 round(float(ratio), 3)
    }
