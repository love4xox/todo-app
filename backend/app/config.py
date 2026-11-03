"""backend/.env 파일을 읽어서 다른 파일들이 쓸 수 있게 꺼내 두는 곳.

비밀 값을 읽는 곳을 여기 한 군데로 모아 두면,
"키가 어디서 쓰이지?"를 찾을 때 이 파일만 보면 된다.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

# 서버를 어느 폴더에서 켜든 항상 backend/.env를 읽도록 위치를 정확히 지정
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_PATH)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "")

# Make 웹훅 주소는 비어 있어도 서버가 켜지게 둔다.
# 시트 저장이 안 되더라도 '쪼개기'는 쓸 수 있어야 하기 때문 (GOAL.md 기준)
MAKE_WEBHOOK_URL = os.getenv("MAKE_WEBHOOK_URL", "")

# 값이 비어 있으면 서버를 켤 때 바로 알려 준다 (나중에 요청할 때 헷갈리는 에러가 나는 것보다 낫다)
if not GEMINI_API_KEY:
    raise RuntimeError("backend/.env에 GEMINI_API_KEY가 비어 있어요. .env.example을 참고하세요.")
if not GEMINI_MODEL:
    raise RuntimeError("backend/.env에 GEMINI_MODEL이 비어 있어요. .env.example을 참고하세요.")
