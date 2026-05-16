from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.run import Run, RunEvent
from app.models.workflow import Workflow


async def execute_fake_workflow_run(
    *,
    session: AsyncSession,
    workflow: Workflow,
    input_data: dict[str, Any],
) -> Run:
    run = Run(
        workflow_id=workflow.id,
        status="running",
        input=input_data,
    )
    session.add(run)
    await session.flush()

    events = [
        RunEvent(
            run_id=run.id,
            sequence=1,
            event_type="run.started",
            payload={"input": input_data},
        ),
        RunEvent(
            run_id=run.id,
            sequence=2,
            event_type="workflow.loaded",
            payload={
                "workflow_id": str(workflow.id),
                "workflow_name": workflow.name,
                "node_count": len(workflow.graph.get("nodes", [])),
                "edge_count": len(workflow.graph.get("edges", [])),
            },
        ),
        RunEvent(
            run_id=run.id,
            sequence=3,
            event_type="run.completed",
            payload={"message": "Fake executor completed successfully."},
        ),
    ]

    session.add_all(events)

    run.status = "success"
    run.output = {
        "message": "Fake executor completed successfully.",
        "input": input_data,
    }
    run.finished_at = datetime.now(timezone.utc)

    await session.commit()

    result = await session.execute(
        select(Run).where(Run.id == run.id).options(selectinload(Run.events))
    )
    created_run = result.scalar_one()
    created_run.events.sort(key=lambda event: event.sequence)

    return created_run
