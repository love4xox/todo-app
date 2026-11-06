// 쪼갠 결과를 노션 체크리스트 모양으로 보여 주는 부품.
// 맨 위 달성률 카드 → 체크리스트 제목과 보기 탭(전체·진행중·완료) → 할 일 목록 순서.
// 체크 상태와 보기 탭은 이 부품 안에서만 기억한다. (서버나 시트에 저장하지 않음 — GOAL.md 범위)
import { useState } from "react";

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "active", label: "진행중" },
  { key: "done", label: "완료" },
];

export default function SubtaskList({ task, subtasks, saved }) {
  // 체크된 할 일의 번호(index)를 모아 두는 곳
  const [checked, setChecked] = useState([]);
  // 지금 보고 있는 탭
  const [filter, setFilter] = useState("all");

  function toggle(index) {
    setChecked((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  const percent = subtasks.length ? Math.round((checked.length / subtasks.length) * 100) : 0;

  // 탭에 맞는 할 일만 고른다. 번호(index)는 원래 순서 그대로 둬야 체크가 섞이지 않는다
  const visible = subtasks
    .map((subtask, index) => ({ subtask, index, isDone: checked.includes(index) }))
    .filter((item) => (filter === "done" ? item.isDone : filter === "active" ? !item.isDone : true));

  return (
    <section className="result" aria-label="쪼갠 할 일">
      {/* 달성률 카드 */}
      <div className="progress-card">
        <span className="progress-card__icon" aria-hidden="true">🌿</span>
        <div className="progress-card__text">
          <p className="progress-card__title">달성률: {percent}%</p>
          <p className="progress-card__sub">
            전체 {subtasks.length}개 중 {checked.length}개를 완료했어요
          </p>
        </div>
        <div
          className="progress-card__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="memo">
        <div className="memo__header">
          <h2 className="memo__title">
            {task} <span className="memo__count">({subtasks.length})</span>
          </h2>
          <div className="memo__tabs" role="group" aria-label="보기">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`memo__tab ${filter === f.key ? "is-active" : ""}`}
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <ol className="memo__list">
          {visible.map(({ subtask, index, isDone }) => (
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
          ))}
        </ol>
        {visible.length === 0 && (
          <p className="memo__empty">{filter === "done" ? "아직 완료한 일이 없어요" : "모두 끝냈어요!"}</p>
        )}

        {/* 시트 저장 결과: 실패해도 위의 결과는 그대로 쓸 수 있다 */}
        <p className={`memo__saved ${saved ? "is-ok" : "is-fail"}`}>
          {saved ? "구글 시트에 저장했어요" : "시트 저장 실패 · 결과는 그대로 볼 수 있어요"}
        </p>
      </div>
    </section>
  );
}

// 기다리는 동안 보여 줄 빈 목록 (같은 모양이라 이 파일에 함께 둔다)
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
