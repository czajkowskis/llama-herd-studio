import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class RunsByStatusResponse(BaseModel):
    pending: int = 0
    running: int = 0
    success: int = 0
    failed: int = 0


class RecentRunResponse(BaseModel):
    id: uuid.UUID
    workflow_id: uuid.UUID
    workflow_name: str
    status: str
    started_at: datetime
    finished_at: datetime | None


class DashboardSummaryResponse(BaseModel):
    total_agents: int
    total_workflows: int
    total_runs: int
    runs_by_status: RunsByStatusResponse = Field(default_factory=RunsByStatusResponse)
    recent_runs: list[RecentRunResponse] = Field(default_factory=list)
