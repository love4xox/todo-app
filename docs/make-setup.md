# Make + 구글 시트 설정하기

서버가 보낸 결과를 Make가 받아서, 구글 시트에 **하위 할 일 하나당 한 줄**씩 적게 만드는 설정입니다.
Make와 구글 시트는 웹사이트에서 클릭으로 만들기 때문에 코드에 흔적이 남지 않습니다. 그래서 순서를 여기에 적어 둡니다.

> Make 화면의 버튼 이름은 업데이트에 따라 조금 다를 수 있습니다. 모듈 이름(Webhooks, Iterator, Google Sheets)을 기준으로 찾으세요.

## 전체 모양
```
[Webhooks: Custom webhook] → [Iterator: subtasks 하나씩 꺼내기] → [Google Sheets: Add a Row]
```

## 서버가 Make로 보내는 데이터
```json
{
  "task": "이사 준비",
  "created_at": "2026-11-03 11:30:28",
  "subtasks": [
    { "order": 1, "text": "이사 업체 견적 받기" },
    { "order": 2, "text": "짐 줄이기" }
  ]
}
```
(만드는 곳: `backend/app/services/make.py`)

---

## 1. 구글 시트 만들기
1. 구글 드라이브에서 새 스프레드시트를 만들고 이름을 `할 일 쪼개기`로 바꿉니다.
2. 첫 줄(1행)에 제목을 적습니다.

| A | B | C | D |
|---|---|---|---|
| 원래 할 일 | 순서 | 하위 할 일 | 저장 시각 |

## 2. Make 시나리오와 웹훅 주소 만들기
1. make.com에 로그인 → **Create a new scenario**.
2. 가운데 `+`를 눌러 **Webhooks** → **Custom webhook**을 고릅니다.
3. **Add**를 눌러 웹훅 이름을 `todo-breakdown`으로 짓고 저장합니다.
4. 생긴 주소(`https://hook...make.com/...`)를 **Copy address to clipboard**로 복사합니다.
5. Cursor에서 `backend/.env`를 열어 붙여 넣고 저장합니다.
   ```
   MAKE_WEBHOOK_URL=복사한주소
   ```
6. 서버 터미널에서 **Ctrl+C** → `uvicorn app.main:app --reload --port 8000`으로 다시 켭니다. (`.env`는 서버를 다시 켜야 읽힙니다)

> 웹훅 주소를 아는 사람은 누구나 시트에 글을 쓸 수 있습니다. 코드·README·깃허브·채팅에 붙여 넣지 마세요.
> 실수로 퍼졌다면 Make에서 웹훅을 지우고 새로 만든 뒤 `.env`만 바꾸면 됩니다.

## 3. Make에게 데이터 모양 알려 주기
Make는 데이터를 한 번 받아 봐야 `task`, `subtasks` 같은 칸 이름을 압니다.
1. Webhooks 모듈 화면에 "듣고 있음(listening)" 표시가 보이는 상태로 둡니다.
   (안 보이면 시나리오 아래쪽 **Run once**를 누릅니다)
2. 우리 화면(http://localhost:5173)에서 할 일 하나를 쪼갭니다.
3. Make에 **Successfully determined**가 뜨면 성공입니다.

## 4. Iterator 추가하기 (목록을 하나씩 꺼내기)
1. Webhooks 모듈 오른쪽의 `+` → **Flow Control** → **Iterator**.
2. **Array** 칸에 Webhooks 모듈의 `subtasks`를 끌어다 넣습니다.

> 왜 필요할까? 서버는 하위 할 일 3~5개를 **목록 하나**로 보냅니다.
> Iterator가 목록을 하나씩 나눠 주면, 다음 모듈이 그 수만큼 반복해서 한 줄씩 적습니다.

## 5. Google Sheets 모듈 추가하기
1. Iterator 오른쪽의 `+` → **Google Sheets** → **Add a Row**.
2. **Connection**: 구글 계정으로 연결합니다.
3. 스프레드시트 `할 일 쪼개기`, 시트 `시트1`(또는 `Sheet1`)을 고르고, **Table contains headers**는 **Yes**.
4. 칸마다 값을 끌어다 넣습니다.

| 시트 칸 | 넣을 값 |
|---|---|
| 원래 할 일 | Webhooks의 `task` |
| 순서 | Iterator의 `order` |
| 하위 할 일 | Iterator의 `text` |
| 저장 시각 | Webhooks의 `created_at` |

## 6. 켜기
1. 아래쪽 **Save**(디스켓 아이콘)로 저장합니다.
2. 스케줄 스위치를 **ON**으로, 실행 방식은 **Immediately**(데이터가 오면 바로)로 둡니다.

## 7. 확인하기
1. 화면에서 할 일 하나를 쪼갭니다.
2. 쪽지 아래에 `✓ 구글 시트에 저장했어요`가 보이고,
3. 구글 시트에 하위 할 일 수만큼 줄이 늘어나면 완료입니다.

### 안 될 때
| 증상 | 확인할 것 |
|---|---|
| 화면에 `시트 저장 실패` | `.env`의 주소가 맞는지, 서버를 다시 켰는지, 서버 터미널의 `[Make]` 로그 |
| 화면은 `저장했어요`인데 시트가 비어 있음 | Make 시나리오가 ON인지, Make의 History에서 에러가 났는지 |
| 시트에 한 줄만 생기고 내용이 이상함 | Iterator를 빼먹었거나, 칸에 Webhooks의 `subtasks`를 통째로 넣었는지 |

## 공용 PC에서 끝낼 때
- Make, 구글 계정에서 로그아웃합니다.
- 다른 사람이 쓰는 PC라면 `backend/.env`를 지웁니다.
