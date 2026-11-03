// 입력창 + 버튼 부품.
// 사용자가 적은 글자를 기억하고, 버튼을 누르면 App에게 "이 할 일 쪼개 줘"라고 알려 준다.
import { useState } from "react";

export default function TaskForm({ onSubmit, isLoading }) {
  const [text, setText] = useState("");
  const [hint, setHint] = useState("");

  function handleSubmit(e) {
    e.preventDefault(); // 버튼을 눌러도 페이지가 새로 고쳐지지 않게 막기
    const task = text.trim();
    if (!task) {
      // 빈 입력이면 서버에 보내지 않고 여기서 바로 안내한다
      setHint("쪼갤 할 일을 먼저 적어 주세요.");
      return;
    }
    setHint("");
    onSubmit(task);
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label htmlFor="task-input" className="task-form__label">
        어떤 일이 막막한가요?
      </label>
      <div className="task-form__row">
        <input
          id="task-input"
          className="task-form__input"
          type="text"
          placeholder="예: 이사 준비"
          maxLength={100}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (hint) setHint("");
          }}
          disabled={isLoading}
        />
        <button className="task-form__button" type="submit" disabled={isLoading}>
          {isLoading ? "쪼개는 중..." : "쪼개기"}
        </button>
      </div>
      {hint && <p className="task-form__hint">{hint}</p>}
    </form>
  );
}
