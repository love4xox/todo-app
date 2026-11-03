// 서버를 부르는 코드는 이 파일에만 둔다.
// 서버 주소나 요청 모양이 바뀌면 여기만 고치면 된다.
// 이 파일에는 API 키나 웹훅 주소가 절대 들어가지 않는다. (그건 서버만 안다)

/**
 * 할 일 하나를 서버에 보내고, 쪼갠 결과를 받아 온다.
 * 성공하면 { task, subtasks } 를 돌려주고, 실패하면 사람이 읽을 수 있는 메시지로 에러를 던진다.
 */
export async function breakDownTask(task) {
  let res;
  try {
    res = await fetch("/api/breakdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
    });
  } catch {
    throw new Error("서버에 연결할 수 없어요. 백엔드가 켜져 있는지 확인해 주세요.");
  }

  // 응답이 JSON이 아닐 수도 있으니(서버가 꺼졌을 때 등) 조심해서 읽는다
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(toFriendlyMessage(res.status, data));
  }
  return data;
}

function toFriendlyMessage(status, data) {
  if (status === 422) return "할 일은 1~100자로 적어 주세요.";
  if (typeof data?.detail === "string") return data.detail; // 서버가 보낸 한국어 메시지
  return "서버에 연결할 수 없어요. 백엔드가 켜져 있는지 확인해 주세요.";
}
