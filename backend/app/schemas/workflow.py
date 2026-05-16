import uuid
from datetime import datetime
from typing import Any


from pydantic import BaseModel, ConfigDict, Field


class WorkflowGraph(BaseModel):
    nodes: list[dict[str, Any]] = Field(default_factory=list)
    edges: list[dict[str, Any]] = Field(default_factory=list)


class WorkflowCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    graph: WorkflowGraph = Field(default_factory=WorkflowGraph)


class WorkflowUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    graph: WorkflowGraph | None = None


class WorkflowResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    graph: WorkflowGraph
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
