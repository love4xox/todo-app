// 쪼갠 결과를 메모지 모양의 체크리스트로 보여 주는 부품.
// 체크 상태는 이 부품 안에서만 기억한다. (서버나 시트에 저장하지 않음 — GOAL.md 범위)
import { useState } from "react";

export default function SubtaskList({ task, subtasks, saved }) {
  // 체크된 할 일의 번호(index)를 모아 두는 곳
  const [checked, setChecked] = useState([]);

  function toggle(index) {
    setChecked((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  return (
    <section className="memo" aria-label="쪼갠 할 일">
      <div className="memo__header">
        <h2 className="memo__title">{task}</h2>
        <span className="memo__progress">
          {checked.length} / {subtasks.length}
        </span>
      </div>
      <ol className="memo__list">
        {subtasks.map((subtask, index) => {
          const isDone = checked.includes(index);
          return (
            <li key={index}>
              {/* label로 감싸면 줄 어디를 눌러도 체크된다 */}
              <label className={`memo__item ${isDone ? "is-done" : ""}`}>
                <input
                  type="checkbox"
                  className="memo__checkbox"
                  checked={isDone}
                  onChange={() => toggle(index)}
                />
                <span className="memo__badge" aria-hidden="true">
                  {isDone ? "✓" : index + 1}
                </span>
                <span className="memo__text">{subtask}</span>
              </label>
            </li>
          );
        })}
      </ol>

      {/* 시트 저장 결과: 실패해도 위의 결과는 그대로 쓸 수 있다 */}
      <p className={`memo__saved ${saved ? "is-ok" : "is-fail"}`}>
        {saved ? "구글 시트에 저장했어요" : "시트 저장 실패 · 결과는 그대로 볼 수 있어요"}
      </p>
    </section>
  );
}

// 기다리는 동안 보여 줄 빈 메모지 (같은 메모지 모양이라 이 파일에 함께 둔다)
SubtaskList.Loading = function Loading() {
  return (
    <section className="memo memo--loading" aria-label="쪼개는 중">
      <p className="memo__title">쪼개는 중...</p>
      <ol className="memo__list">
        {[1, 2, 3].map((n) => (
          <li key={n} className="memo__item">
            <span className="memo__badge">{n}</span>
            <span className="memo__skeleton" />
          </li>
        ))}
      </ol>
    </section>
  );
};
