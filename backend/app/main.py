from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.endpoints.agents import router as agents_router
from app.api.endpoints.workflows import router as workflows_router
from app.api.endpoints.runs import router as runs_router
from app.core.config import settings
from app.db.session import get_db_session

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
)

app.include_router(agents_router, prefix="/api")
app.include_router(workflows_router, prefix="/api")
app.include_router(runs_router, prefix="/api")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/db")
async def database_health_check(
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, str]:
    await session.execute(text("SELECT 1"))
    return {"status": "ok"}
