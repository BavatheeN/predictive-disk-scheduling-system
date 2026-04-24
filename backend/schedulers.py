import math
from typing import Dict, List


def _result_from_sequence(name: str, head_start: int, service_order: List[int]) -> dict:
    seek_history = [head_start]
    T_n = [0]

    current_head = head_start
    total_seek = 0

    for track in service_order:
        total_seek += abs(track - current_head)
        seek_history.append(track)
        T_n.append(total_seek)
        current_head = track

    return {
        "name": name,
        "total_seek": total_seek,
        "seek_history": seek_history,
        "T_n": T_n,
    }


def fcfs(tracks: list[int], head_start: int, max_tracks: int = 200) -> dict:
    return _result_from_sequence("FCFS", head_start, list(tracks))


def scan(
    tracks: list[int],
    head_start: int,
    max_tracks: int = 200,
    direction: str = "up",
) -> dict:
    sorted_tracks = sorted(tracks)
    left = [t for t in sorted_tracks if t < head_start]
    right = [t for t in sorted_tracks if t >= head_start]

    if direction == "down":
        order = list(reversed(left)) + right
    else:
        order = right + list(reversed(left))

    return _result_from_sequence("SCAN", head_start, order)


def cscan(tracks: list[int], head_start: int, max_tracks: int = 200) -> dict:
    sorted_tracks = sorted(tracks)
    left = [t for t in sorted_tracks if t < head_start]
    right = [t for t in sorted_tracks if t >= head_start]

    seek_history = [head_start]
    T_n = [0]
    current_head = head_start
    total_seek = 0

    for track in right:
        total_seek += abs(track - current_head)
        seek_history.append(track)
        T_n.append(total_seek)
        current_head = track

    if left:
        first_left_track = left[0]
        jump_cost = (max_tracks - 1 - current_head) + first_left_track
        total_seek += jump_cost
        seek_history.append(first_left_track)
        T_n.append(total_seek)
        current_head = first_left_track

        for track in left[1:]:
            total_seek += abs(track - current_head)
            seek_history.append(track)
            T_n.append(total_seek)
            current_head = track

    return {
        "name": "CSCAN",
        "total_seek": total_seek,
        "seek_history": seek_history,
        "T_n": T_n,
    }


def predictive(requests: list[dict], head_start: int, lambda_rate: float) -> dict:
    remaining = list(requests)
    seek_history = [head_start]
    T_n = [0]

    current_head = head_start
    current_time = 0.0
    total_seek = 0

    while remaining:
        best_idx = 0
        best_score = -1.0

        for idx, req in enumerate(remaining):
            wait_term = math.exp(-lambda_rate * max(0.0, req["time"] - current_time))
            distance_term = abs(req["track"] - current_head) + 1
            score = wait_term / distance_term
            if score > best_score:
                best_score = score
                best_idx = idx

        selected = remaining.pop(best_idx)
        next_track = selected["track"]

        total_seek += abs(next_track - current_head)
        seek_history.append(next_track)
        T_n.append(total_seek)

        current_head = next_track
        current_time = selected["time"]

    return {
        "name": "PREDICTIVE",
        "total_seek": total_seek,
        "seek_history": seek_history,
        "T_n": T_n,
    }
