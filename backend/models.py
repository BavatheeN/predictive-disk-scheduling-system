from typing import List, Optional

from pydantic import BaseModel, model_validator


class SimulationRequest(BaseModel):
    lambda_rate: float
    max_tracks: int = 200
    head_start: int = 100
    algorithms: List[str]
    request_mode: str = 'auto'
    n_requests: Optional[int] = 50
    manual_tracks: Optional[List[int]] = None

    @model_validator(mode='after')
    def validate_request_mode(self):
        if self.request_mode == 'manual':
            if self.manual_tracks is None or len(self.manual_tracks) < 2:
                raise ValueError('manual_tracks must have at least 2 track numbers')
            self.manual_tracks = [max(0, min(t, self.max_tracks - 1)) for t in self.manual_tracks]
        elif self.request_mode == 'auto':
            if self.n_requests is None:
                raise ValueError('n_requests is required for auto mode')
        return self


class ComplexityResult(BaseModel):
    best_fit: str
    r2_score: float


class AlgorithmResult(BaseModel):
    name: str
    total_seek: int
    seek_history: List[int]
    T_n: List[int]
    complexity: Optional[ComplexityResult]


class SimulationResponse(BaseModel):
    lambda_rate: float
    n_requests: int
    tracks: List[int]
    results: List[AlgorithmResult]


class PredictionResponse(BaseModel):
    predicted_next_track: int
    recommended_algorithm: str
    load_status: str
    observed_rate: float
    expected_rate: float
    ratio: float
    explanation: str
