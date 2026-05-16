import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.run import Run, RunEvent


async def append_run_event(
    *,
    session: AsyncSession,
    run: Run,
    sequence: int,
    event_type: str,
    payload: dict[str, Any] | None = None,
    node_id: str | None = None,
    agent_id: uuid.UUID | None = None,
) -> RunEvent:
    event = RunEvent(
        run_id=run.id,
        sequence=sequence,
        event_type=event_type,
        node_id=node_id,
        agent_id=agent_id,
        payload=payload or {},
    )
    session.add(event)
    await session.flush()
    return event
