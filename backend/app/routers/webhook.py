from fastapi import APIRouter

router = APIRouter(prefix="/api/webhook", tags=["webhook"])

@router.post("/mail")
def receive_mail():
    return {"message": "Webhook placeholder"}
