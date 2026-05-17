from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.run import Run
from app.models.workflow import Workflow
from app.services.event_log import append_run_event
from app.services.graph_validation import validate_workflow_graph
from app.services.graph_executor import execute_workflow_graph


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

    try:
        await append_run_event(
            session=session,
            run=run,
            sequence=1,
            event_type="run.started",
            payload={"input": input_data},
        )
        await append_run_event(
            session=session,
            run=run,
            sequence=2,
            event_type="workflow.loaded",
            payload={
                "workflow_id": str(workflow.id),
                "workflow_name": workflow.name,
                "node_count": len(workflow.graph.get("nodes", [])),
                "edge_count": len(workflow.graph.get("edges", [])),
            },
        )
        validate_workflow_graph(workflow.graph)

        await append_run_event(
            session=session,
            run=run,
            sequence=3,
            event_type="workflow.validated",
            payload={"message": "Workflow graph is valid."},
        )

        if input_data.get("fail") is True:
            raise RuntimeError("Fake executor failure requested.")

        output, next_sequence = await execute_workflow_graph(
            session=session,
            run=run,
            workflow=workflow,
            input_data=input_data,
            starting_sequence=4,
        )

        run.status = "success"
        run.output = output

        await append_run_event(
            session=session,
            run=run,
            sequence=next_sequence,
            event_type="run.completed",
            payload={"output": output},
        )
    except Exception as exc:
        run.status = "failed"
        run.error = str(exc)

        await append_run_event(
            session=session,
            run=run,
            sequence=999,
            event_type="run.failed",
            payload={"error": str(exc)},
        )
    finally:
        run.finished_at = datetime.now(timezone.utc)
        await session.commit()

    result = await session.execute(
        select(Run).where(Run.id == run.id).options(selectinload(Run.events))
    )
    created_run = result.scalar_one()
    created_run.events.sort(key=lambda event: event.sequence)

    return created_run
