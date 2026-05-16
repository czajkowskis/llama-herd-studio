from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.agent import Agent
from app.models.run import Run
from app.models.workflow import Workflow
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    RecentRunResponse,
    RunsByStatusResponse,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    session: AsyncSession = Depends(get_db_session),
) -> DashboardSummaryResponse:
    total_agents = await session.scalar(select(func.count()).select_from(Agent))
    total_workflows = await session.scalar(select(func.count()).select_from(Workflow))
    total_runs = await session.scalar(select(func.count()).select_from(Run))

    status_result = await session.execute(
        select(Run.status, func.count()).group_by(Run.status)
    )
    status_counts = {status: count for status, count in status_result.all()}

    recent_runs_result = await session.execute(
        select(
            Run.id,
            Run.workflow_id,
            Workflow.name,
            Run.status,
            Run.started_at,
            Run.finished_at,
        )
        .join(Workflow, Workflow.id == Run.workflow_id)
        .order_by(Run.started_at.desc())
        .limit(10)
    )

    recent_runs = [
        RecentRunResponse(
            id=row.id,
            workflow_id=row.workflow_id,
            workflow_name=row.name,
            status=row.status,
            started_at=row.started_at,
            finished_at=row.finished_at,
        )
        for row in recent_runs_result.all()
    ]

    return DashboardSummaryResponse(
        total_agents=total_agents or 0,
        total_workflows=total_workflows or 0,
        total_runs=total_runs or 0,
        runs_by_status=RunsByStatusResponse(
            pending=status_counts.get("pending", 0),
            running=status_counts.get("running", 0),
            success=status_counts.get("success", 0),
            failed=status_counts.get("failed", 0),
        ),
        recent_runs=recent_runs,
    )
