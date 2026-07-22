class AIService:
    def __init__(self):
        self.name = "ai_service"

from openai import AzureOpenAI
from dotenv import load_dotenv
import os
import json

load_dotenv()

# Azure OpenAI 接続設定
client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-02-01"
)

DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")


def analyze_task(title: str, description: str = ""):
    """
    タスクのタイトル・説明から
    カテゴリ・優先度を自動判定する
    """
    prompt = f"""
    以下のタスク情報を分析して、JSONで返してください。

    タイトル: {title}
    説明: {description}

    返却形式:
    {{
        "category": "カテゴリ名（例: 会議・開発・事務・その他）",
        "priority": "優先度（low / medium / high）",
        "summary": "タスクの要約（30文字以内）"
    }}
    """

    response = client.chat.completions.create(
        model=DEPLOYMENT,
        messages=[
            {"role": "system", "content": "あなたはタスク管理AIです。"},
            {"role": "user",   "content": prompt}
        ],
        response_format={"type": "json_object"}
    )

    result = json.loads(response.choices[0].message.content)
    return result