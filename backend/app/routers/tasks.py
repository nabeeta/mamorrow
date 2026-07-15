from fastapi import APIRouter

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("")
def list_tasks():
    return []
