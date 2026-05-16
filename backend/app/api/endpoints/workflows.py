import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.workflow import Workflow
from app.schemas.workflow import (
    WorkflowCreateRequest,
    WorkflowUpdateRequest,
    WorkflowResponse,
    WorkflowValidationResponse,
)

from app.services.graph_validation import (
    WorkflowGraphValidationError,
    validate_workflow_graph,
)

router = APIRouter(prefix="/workflows", tags=["workflows"])


@router.get("", response_model=list[WorkflowResponse])
async def list_workflows(
    session: AsyncSession = Depends(get_db_session),
) -> list[Workflow]:
    result = await session.execute(
        select(Workflow).order_by(Workflow.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    payload: WorkflowCreateRequest, session: AsyncSession = Depends(get_db_session)
) -> Workflow:
    workflow = Workflow(
        name=payload.name,
        description=payload.description,
        graph=payload.graph.model_dump(),
    )

    session.add(workflow)
    await session.commit()
    await session.refresh(workflow)

    return workflow


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
) -> Workflow:
    workflow = await session.get(Workflow, workflow_id)

    if workflow is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow `{workflow_id}` not found",
        )

    return workflow


@router.get("/{workflow_id}/validate", response_model=WorkflowValidationResponse)
async def validate_workflow(
    workflow_id: uuid.UUID, session: AsyncSession = Depends(get_db_session)
) -> WorkflowValidationResponse:
    workflow = await session.get(Workflow, workflow_id)

    if workflow is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow '{workflow_id}' not found",
        )

    try:
        validate_workflow_graph(workflow.graph)
    except WorkflowGraphValidationError as e:
        return WorkflowValidationResponse(valid=False, errors=[str(e)])

    return WorkflowValidationResponse(valid=True)


@router.patch("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: uuid.UUID,
    payload: WorkflowUpdateRequest,
    session: AsyncSession = Depends(get_db_session),
) -> Workflow:
    workflow = await session.get(Workflow, workflow_id)

    if workflow is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow `{workflow_id}` not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    if "graph" in update_data and payload.graph is not None:
        update_data["graph"] = payload.graph.model_dump()
    for field, value in update_data.items():
        setattr(workflow, field, value)

    await session.commit()
    await session.refresh(workflow)

    return workflow


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: uuid.UUID, session: AsyncSession = Depends(get_db_session)
) -> None:
    workflow = await session.get(Workflow, workflow_id)

    if workflow is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow `{workflow_id}` not found",
        )

    await session.delete(workflow)
    await session.commit()
