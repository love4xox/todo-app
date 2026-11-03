"""서버의 입구(안내 데스크).

"이 주소로 요청이 오면 이 담당자에게 넘긴다"만 정한다.
실제 일(Gemini 부르기 등)은 services/ 안의 담당자가 한다.
"""
from fastapi import FastAPI, HTTPException

from app.schemas import BreakdownRequest, BreakdownResponse
from app.services.gemini import GeminiError, break_down_task
from app.services.make import send_to_sheet

app = FastAPI(title="할 일 쪼개기")


@app.get("/api/health")
def health():
    """서버가 켜져 있는지 확인하는 용도"""
    return {"status": "ok"}


@app.post("/api/breakdown", response_model=BreakdownResponse)
def breakdown(request: BreakdownRequest):
    """할 일 하나를 받아서 작은 할 일 3~5개로 쪼개고, 시트에 저장한 뒤 돌려준다."""
    # 1) Gemini로 쪼개기 — 실패하면 여기서 멈춘다 (저장할 것도 없으니까)
    try:
        subtasks = break_down_task(request.task)
    except GeminiError as e:
        # 502 = "내 서버는 멀쩡한데, 내가 부른 바깥 서비스(Gemini)가 실패했다"는 뜻
        raise HTTPException(status_code=502, detail=str(e))

    # 2) Make로 시트 저장 — 실패해도 결과는 그대로 돌려주고, 저장 여부만 알려 준다
    saved = send_to_sheet(request.task, subtasks)

    return BreakdownResponse(task=request.task, subtasks=subtasks, saved=saved)
