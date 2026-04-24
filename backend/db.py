from datetime import datetime
from typing import Optional

from sqlmodel import Field, Session, SQLModel, create_engine, select


class SimulationRun(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    lambda_rate: float
    n_requests: int
    timestamp: str
    result_json: str


database_url = "sqlite:///scheduler.db"
engine = create_engine(database_url, echo=False)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def save_run(lambda_rate, n_requests, result_json) -> None:
    run = SimulationRun(
        lambda_rate=lambda_rate,
        n_requests=n_requests,
        timestamp=datetime.utcnow().isoformat(),
        result_json=result_json,
    )
    with Session(engine) as session:
        session.add(run)
        session.commit()


def get_recent_runs(limit=10):
    with Session(engine) as session:
        statement = select(SimulationRun).order_by(SimulationRun.id.desc()).limit(limit)
        return session.exec(statement).all()
