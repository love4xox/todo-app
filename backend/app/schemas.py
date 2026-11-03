"""서버와 화면이 주고받는 데이터의 '모양'을 정하는 약속서.

여기 적힌 모양과 다른 데이터가 들어오면 FastAPI가 알아서 거절한다.
"""
from pydantic import BaseModel, ConfigDict, Field


class BreakdownRequest(BaseModel):
    """화면 → 서버: 쪼개 달라고 보내는 할 일"""

    # 앞뒤 공백을 자동으로 지워서, 스페이스만 친 입력도 '빈 입력'으로 걸러지게 한다
    model_config = ConfigDict(str_strip_whitespace=True)

    task: str = Field(min_length=1, max_length=100, examples=["이사 준비"])


class BreakdownResponse(BaseModel):
    """서버 → 화면: 쪼갠 결과"""

    task: str
    subtasks: list[str]
    saved: bool  # 구글 시트(Make)에 저장됐는지
