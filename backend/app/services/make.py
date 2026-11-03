"""쪼갠 결과를 Make 웹훅으로 보내는 담당자.

Make가 받은 데이터를 구글 시트에 한 줄씩 적는다. (설정 방법: docs/make-setup.md)
웹훅 주소는 비밀이라 화면(React)이 아니라 서버인 여기서만 부른다.
"""
from datetime import datetime, timedelta, timezone

import httpx

from app.config import MAKE_WEBHOOK_URL

# 한국 시간. (Windows에서는 ZoneInfo("Asia/Seoul")가 추가 설치 없이는 안 돼서 +9시간으로 직접 정한다)
KST = timezone(timedelta(hours=9))


def send_to_sheet(task: str, subtasks: list[str]) -> bool:
    """Make 웹훅으로 결과를 보낸다. 성공하면 True, 실패하면 False.

    실패해도 에러를 던지지 않는다. 시트 저장이 안 돼도 화면에는 결과를 보여 줘야 하기 때문.
    """
    if not MAKE_WEBHOOK_URL:
        print("[Make] MAKE_WEBHOOK_URL이 비어 있어서 시트 저장을 건너뜁니다.")
        return False

    payload = {
        "task": task,
        "created_at": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
        # Make의 반복(Iterator) 모듈이 이 목록을 하나씩 꺼내서 시트에 한 줄씩 적는다
        "subtasks": [{"order": i, "text": text} for i, text in enumerate(subtasks, start=1)],
    }

    try:
        response = httpx.post(MAKE_WEBHOOK_URL, json=payload, timeout=10)
        response.raise_for_status()  # 200번대가 아니면 실패로 본다
    except Exception as e:
        # 웹훅 주소가 로그에 찍히지 않도록, 에러 종류만 남긴다
        print(f"[Make] 시트 저장 실패: {type(e).__name__}")
        return False

    return True
