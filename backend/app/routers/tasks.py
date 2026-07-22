from fastapi import APIRouter

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("")
def list_tasks():
    return []
from fastapi import APIRouter, HTTPException
from app.models import TaskCreate, TaskUpdate
from app.services import task_service, ai_service

router = APIRouter()


@router.get("/tasks")
def get_tasks():
    """全タスク取得"""
    tasks = task_service.get_all_tasks()
    return tasks


@router.get("/tasks/{task_id}")
def get_task(task_id: str):
    """タスク1件取得"""
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="タスクが見つかりません")
    return task


@router.post("/tasks")
def create_task(task_data: TaskCreate):
    """タスク作成（AI分析付き）"""
    # AI でカテゴリ・優先度を自動判定
    ai_result = ai_service.analyze_task(
        title=task_data.title,
        description=task_data.description or ""
    )

    # AI結果をタスクに反映（未設定の場合のみ）
    if not task_data.category:
        task_data.category = ai_result.get("category")
    if task_data.priority == "medium":
        task_data.priority = ai_result.get("priority", "medium")

    task = task_service.create_task(task_data)
    return task


@router.put("/tasks/{task_id}")
def update_task(task_id: str, task_data: TaskUpdate):
    """タスク更新"""
    task = task_service.update_task(task_id, task_data)
    if not task:
        raise HTTPException(status_code=404, detail="タスクが見つかりません")
    return task


@router.delete("/tasks/{task_id}")
def delete_task(task_id: str):
    """タスク削除"""
    result = task_service.delete_task(task_id)
    if not result:
        raise HTTPException(status_code=404, detail="タスクが見つかりません")
    return {"message": "削除しました"}