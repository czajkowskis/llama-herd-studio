import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.agent import Agent
from app.schemas.agent import AgentCreateRequest, AgentUpdateRequest, AgentResponse

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=list[AgentResponse])
async def list_agents(session: AsyncSession = Depends(get_db_session)) -> list[Agent]:
    result = await session.execute(select(Agent).order_by(Agent.created_at.desc()))
    return list(result.scalars().all())


@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    payload: AgentCreateRequest,
    session: AsyncSession = Depends(get_db_session),
) -> Agent:
    agent = Agent(
        name=payload.name,
        description=payload.description,
        system_prompt=payload.system_prompt,
        model_provider=payload.model_provider,
        model_name=payload.model_name,
        config=payload.config.model_dump(),
    )

    session.add(agent)
    await session.commit()
    await session.refresh(agent)

    return agent


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
) -> Agent:
    agent = await session.get(Agent, agent_id)

    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return agent


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: uuid.UUID,
    payload: AgentUpdateRequest,
    session: AsyncSession = Depends(get_db_session),
) -> Agent:
    agent = await session.get(Agent, agent_id)

    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    if "config" in update_data and update_data["config"] is not None:
        update_data["config"] = payload.config.model_dump()

    for field, value in update_data.items():
        setattr(agent, field, value)

    await session.commit()
    await session.refresh(agent)

    return agent


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
) -> None:
    agent = await session.get(Agent, agent_id)

    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    await session.delete(agent)
    await session.commit()
