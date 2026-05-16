import uuid
from datetime import datetime
from typing import Any


from pydantic import BaseModel, ConfigDict, Field


class WorkflowNode(BaseModel):
    id: str = Field(min_length=1)
    type: str = Field(min_length=1)
    data: dict[str, Any] = Field(default_factory=dict)
    position: dict[str, float] = Field(default_factory=dict)


class WorkflowEdge(BaseModel):
    id: str | None = None
    source: str = Field(min_length=1)
    target: str = Field(min_length=1)
    data: dict[str, Any] = Field(default_factory=dict)


class WorkflowGraph(BaseModel):
    nodes: list[WorkflowNode] = Field(default_factory=list)
    edges: list[WorkflowEdge] = Field(default_factory=list)


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


class WorkflowValidationResponse(BaseModel):
    valid: bool
    errors: list[str] = Field(default_factory=list)
