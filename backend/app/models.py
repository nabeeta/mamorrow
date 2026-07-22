from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskCreate(BaseModel):
    """タスク作成時のモデル"""
    title      : str
    description: Optional[str] = None
    due_date   : Optional[str] = None
    priority   : Optional[str] = "medium"  # low / medium / high
    status     : Optional[str] = "todo"    # todo / doing / done
    category   : Optional[str] = None


class TaskUpdate(BaseModel):
    """タスク更新時のモデル"""
    title      : Optional[str] = None
    description: Optional[str] = None
    due_date   : Optional[str] = None
    priority   : Optional[str] = None
    status     : Optional[str] = None
    category   : Optional[str] = None


class TaskResponse(BaseModel):
    """タスク返却時のモデル"""
    id         : str
    title      : str
    description: Optional[str] = None
    due_date   : Optional[str] = None
    priority   : Optional[str] = None
    status     : Optional[str] = None
    category   : Optional[str] = None
    created_at : Optional[str] = None