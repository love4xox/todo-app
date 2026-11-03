# 할 일 쪼개기

할 일 하나(예: "이사 준비")를 적으면 Gemini가 바로 시작할 수 있는 작은 할 일 3~5개로 쪼개 줍니다.
기능이 하나뿐인 연습용 서비스로, 목표와 완료 기준은 [GOAL.md](GOAL.md)에 있습니다.

## 흐름
```
[React 화면] → [Python 서버(FastAPI)] → [Gemini]
                        └→ [Make 웹훅] → [구글 시트]
```
- Make 웹훅은 서버가 부릅니다. 화면에서 부르면 웹훅 주소가 브라우저에 그대로 보이기 때문입니다.
- 시트 저장이 실패해도 화면에는 결과가 보이고, "시트 저장 실패"만 따로 표시됩니다.

## 폴더 구조
```
todo-app/
├─ GOAL.md / CLAUDE.md / README.md   문서
├─ backend/                          Python 서버 (비밀 값은 여기 .env에만)
│  ├─ .env.example                   환경 변수 견본 (실제 값 X)
│  ├─ requirements.txt
│  └─ app/
│     ├─ main.py                     서버 입구: 주소별로 담당자에게 넘김
│     ├─ config.py                   .env 읽기
│     ├─ schemas.py                  주고받는 데이터 모양
│     ├─ prompts/breakdown.txt       Gemini 프롬프트
│     └─ services/
│        ├─ gemini.py                Gemini 부르기
│        └─ make.py                  Make 웹훅으로 보내기
├─ docs/
│  └─ make-setup.md                  Make 시나리오·구글 시트 설정 순서
└─ frontend/                         React 화면 (비밀 값 없음)
   ├─ vite.config.js                 /api 요청을 서버(8000)로 전달
   └─ src/
      ├─ App.jsx                     화면 상태 관리 (입력/기다림/결과/에러)
      ├─ api.js                      서버 부르기
      ├─ components/                 입력창(TaskForm), 메모지 결과(SubtaskList)
      └─ styles/                     theme.css(색·간격 변수), app.css(꾸미기)
```

## 준비물
- Python 3.11 이상 (`py --version` 또는 `python --version`으로 확인)
- Node.js 20 이상 (`node --version`으로 확인)
- Gemini API 키 (Google AI Studio에서 발급)
- Make 계정과 구글 계정 (시트 저장용)

## 실행 방법 (Windows PowerShell)
터미널을 **두 개** 열어서, 하나는 서버, 하나는 화면을 켭니다.

### 터미널 1 — 서버
```powershell
cd backend
py -m venv .venv                                            # 처음 한 번만
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass  # 이 창에서만 스크립트 허용
.venv\Scripts\Activate.ps1
pip install -r requirements.txt                             # 처음 한 번만
copy .env.example .env                                      # 처음 한 번만, 그다음 .env에 키 입력 후 저장
uvicorn app.main:app --reload --port 8000
```
`Application startup complete.`가 보이면 준비 끝. http://localhost:8000/docs 에서 서버만 따로 시험할 수 있습니다.

### 터미널 2 — 화면
```powershell
cd frontend
npm install       # 처음 한 번만
npm run dev
```
http://localhost:5173 을 엽니다.

> `.env`를 고쳤다면 서버 터미널에서 Ctrl+C로 끄고 `uvicorn ...`을 다시 실행하세요. (`--reload`는 .py 파일만 감시합니다)

## 환경 변수 (`backend/.env`)
| 이름 | 설명 |
|---|---|
| `GEMINI_API_KEY` | Gemini API 키 |
| `GEMINI_MODEL` | 사용할 모델 이름 (예: `gemini-3.6-flash`) |
| `MAKE_WEBHOOK_URL` | Make 웹훅 주소. 비워 두면 시트 저장만 건너뜀 ([설정 방법](docs/make-setup.md)) |

`.env`는 `.gitignore`에 들어 있어 깃허브에 올라가지 않습니다. 공용 PC라면 작업 후 `.env`를 지우세요.
