"""Gemini에게 할 일을 쪼개 달라고 부탁하는 담당자.

Gemini와 관련된 코드는 이 파일에만 둔다.
모델이나 라이브러리가 바뀌어도 이 파일만 고치면 된다.
"""
from pathlib import Path

from google import genai
from google.genai import types
from pydantic import BaseModel

from app.config import GEMINI_API_KEY, GEMINI_MODEL

# 프롬프트는 코드 밖 텍스트 파일에 둔다. Windows에서 한글이 깨지지 않도록 utf-8을 꼭 지정
PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "breakdown.txt"
PROMPT_TEMPLATE = PROMPT_PATH.read_text(encoding="utf-8")

MIN_SUBTASKS = 3
MAX_SUBTASKS = 5

client = genai.Client(api_key=GEMINI_API_KEY)


class GeminiError(Exception):
    """Gemini 호출이 실패했을 때 쓰는 에러. main.py가 이걸 잡아서 화면에 알려 준다."""


class _SubtaskResult(BaseModel):
    """Gemini에게 '이 모양의 JSON으로만 답해'라고 알려 주는 틀"""

    subtasks: list[str]


def break_down_task(task: str) -> list[str]:
    """할 일 하나를 받아서 작은 할 일 3~5개의 목록을 돌려준다."""
    prompt = PROMPT_TEMPLATE.replace("{task}", task)

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                # 자유로운 글 대신 정해진 JSON 모양으로 답하게 하면, 결과를 꺼내 쓰기가 훨씬 안전하다
                response_mime_type="application/json",
                response_schema=_SubtaskResult,
            ),
        )
    except Exception as e:
        # 키가 틀렸거나, 인터넷이 끊겼거나, 사용량을 넘었을 때 여기로 온다
        raise GeminiError(f"Gemini 호출에 실패했어요: {type(e).__name__}") from e

    result = response.parsed
    if result is None:
        raise GeminiError("Gemini 답변을 읽지 못했어요.")

    # 빈 줄은 버리고 앞뒤 공백 정리
    subtasks = [s.strip() for s in result.subtasks if s.strip()]

    # AI가 규칙을 어길 수도 있으니 개수는 코드에서 한 번 더 확인한다
    if len(subtasks) < MIN_SUBTASKS:
        raise GeminiError("쪼갠 결과가 너무 적어요. 다시 시도해 주세요.")
    return subtasks[:MAX_SUBTASKS]
