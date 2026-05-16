import uuid

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class RunCreateRequest(BaseModel):
    input: dict[str, Any] = Field(default_factory=dict)


class RunEventResponse(BaseModel):
    id: uuid.UUID
    run_id: uuid.UUID
    sequence: int
    event_type: str
    node_id: str | None
    agent_id: uuid.UUID | None
    payload: dict[str, Any]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class RunResponse(BaseModel):
    id: uuid.UUID
    workflow_id: uuid.UUID
    status: str
    input: dict[str, Any]
    output: dict[str, Any] | None
    error: str | None
    started_at: datetime
    finished_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class RunDetailResponse(RunResponse):
    events: list[RunEventResponse] = Field(default_factory=list)
