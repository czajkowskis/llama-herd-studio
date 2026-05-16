import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db_session
from app.models.run import Run, RunEvent
from app.models.workflow import Workflow
from app.schemas.run import (
    RunCreateRequest,
    RunDetailResponse,
    RunEventResponse,
    RunResponse,
)
from app.services.run_executor import execute_fake_workflow_run

router = APIRouter(tags=["runs"])


@router.get("/runs", response_model=list[RunResponse])
async def list_runs(
    session: AsyncSession = Depends(get_db_session),
) -> list[Run]:
    result = await session.execute(select(Run).order_by(Run.started_at.desc()))
    return list(result.scalars().all())


@router.get("/runs/{run_id}", response_model=RunDetailResponse)
async def get_run(
    run_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
) -> Run:
    result = await session.execute(
        select(Run).where(Run.id == run_id).options(selectinload(Run.events))
    )
    run = result.scalar_one_or_none()

    if run is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run `{run_id}` not found",
        )

    run.events.sort(key=lambda event: event.sequence)
    return run


@router.get("/runs/{run_id}/events", response_model=list[RunEventResponse])
async def list_run_events(
    run_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
) -> list[RunEvent]:
    run = await session.get(Run, run_id)

    if run is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run `{run_id}` not found",
        )

    result = await session.execute(
        select(RunEvent)
        .where(RunEvent.run_id == run_id)
        .order_by(RunEvent.sequence.asc())
    )
    return list(result.scalars().all())


@router.post(
    "/workflows/{workflow_id}/runs",
    response_model=RunDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_workflow_run(
    workflow_id: uuid.UUID,
    payload: RunCreateRequest,
    session: AsyncSession = Depends(get_db_session),
) -> Run:
    workflow = await session.get(Workflow, workflow_id)

    if workflow is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow `{workflow_id}` not found",
        )

    return await execute_fake_workflow_run(
        session=session, workflow=workflow, input_data=payload.input
    )
