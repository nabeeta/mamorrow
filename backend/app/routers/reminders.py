from fastapi import APIRouter

router = APIRouter(prefix="/api/reminders", tags=["reminders"])

@router.get("")
def list_reminders():
    return []
