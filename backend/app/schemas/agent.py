import uuid
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class AgentConfig(BaseModel):
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int | None = Field(default=None, ge=1)
    tools: list[str] = Field(default_factory=list)


class AgentCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    system_prompt: str = ""
    model_provider: str = Field(default="openai", max_length=100)
    model_name: str = Field(default="gpt-4.1-mini", max_length=100)
    config: AgentConfig = Field(default_factory=AgentConfig)


class AgentUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    system_prompt: str | None = None
    model_provider: str | None = Field(default=None, max_length=100)
    model_name: str | None = Field(default=None, max_length=100)
    config: AgentConfig | None = None


class AgentResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    system_prompt: str
    model_provider: str
    model_name: str
    config: AgentConfig
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
