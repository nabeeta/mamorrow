class CosmosRepository:
    def __init__(self):
        self.name = "cosmos_repository"
from azure.cosmos import CosmosClient
from dotenv import load_dotenv
import os

load_dotenv()

# Cosmos DB 接続設定
CONNECTION_STRING = os.getenv("COSMOS_CONNECTION_STRING")
DATABASE_NAME     = os.getenv("COSMOS_DATABASE")
CONTAINER_NAME    = os.getenv("COSMOS_CONTAINER")

# クライアント初期化
client    = CosmosClient.from_connection_string(CONNECTION_STRING)
database  = client.get_database_client(DATABASE_NAME)
container = database.get_container_client(CONTAINER_NAME)


def get_all_tasks():
    """全タスク取得"""
    tasks = list(container.read_all_items())
    return tasks


def get_task_by_id(task_id: str):
    """IDでタスク取得"""
    try:
        task = container.read_item(item=task_id, partition_key=task_id)
        return task
    except Exception:
        return None


def create_task(task: dict):
    """タスク作成"""
    result = container.upsert_item(task)
    return result


def update_task(task_id: str, task: dict):
    """タスク更新"""
    task["id"] = task_id
    result = container.upsert_item(task)
    return result


def delete_task(task_id: str):
    """タスク削除"""
    container.delete_item(item=task_id, partition_key=task_id)
    return {"message": "削除完了"}