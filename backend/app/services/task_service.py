class TaskService:
    def __init__(self):
        self.name = "task_service"
import uuid
from datetime import datetime
from app.repository import cosmos
from app.models import TaskCreate, TaskUpdate


def get_all_tasks():
    """全タスク取得"""
    return cosmos.get_all_tasks()


def get_task(task_id: str):
    """タスク1件取得"""
    task = cosmos.get_task_by_id(task_id)
    if not task:
        return None
    return task


def create_task(task_data: TaskCreate):
    """タスク作成"""
    task = task_data.dict()
    task["id"]         = str(uuid.uuid4())  # ユニークID生成
    task["created_at"] = datetime.utcnow().isoformat()
    task["status"]     = task.get("status", "todo")

    result = cosmos.create_task(task)
    return result


def update_task(task_id: str, task_data: TaskUpdate):
    """タスク更新"""
    # 既存タスクを取得
    existing = cosmos.get_task_by_id(task_id)
    if not existing:
        return None

    # 変更部分だけ上書き
    update_data = task_data.dict(exclude_unset=True)
    existing.update(update_data)

    result = cosmos.update_task(task_id, existing)
    return result


def delete_task(task_id: str):
    """タスク削除"""
    existing = cosmos.get_task_by_id(task_id)
    if not existing:
        return None
    return cosmos.delete_task(task_id)