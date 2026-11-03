// 화면 전체를 관리하는 곳.
// 지금 화면이 어떤 상태인지(입력 대기 / 기다림 / 결과 / 에러)를 기억하고,
// 상태에 맞는 부품(components)을 골라서 보여 준다.
import { useState } from "react";
import { breakDownTask } from "./api.js";
import TaskForm from "./components/TaskForm.jsx";
import SubtaskList from "./components/SubtaskList.jsx";

export default function App() {
  // status: "idle"(입력 대기) | "loading"(기다림) | "done"(결과) | "error"(에러)
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(task) {
    setStatus("loading");
    setErrorMessage("");
    try {
      const data = await breakDownTask(task);
      // id를 새로 붙여 두면, 새 결과가 올 때마다 메모지가 새로 만들어져 이전 체크가 지워진다
      setResult({ ...data, id: Date.now() });
      setStatus("done");
    } catch (err) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="title">할 일 쪼개기</h1>
        <p className="subtitle">막막한 일 하나를 적으면, 바로 시작할 수 있는 작은 일로 나눠 드려요.</p>
      </header>

      <TaskForm onSubmit={handleSubmit} isLoading={status === "loading"} />

      {status === "loading" && <SubtaskList.Loading />}
      {status === "done" && <SubtaskList key={result.id} task={result.task} subtasks={result.subtasks} saved={result.saved} />}
      {status === "error" && (
        <div className="error-note" role="alert">
          <strong>앗, 실패했어요</strong>
          <p>{errorMessage}</p>
        </div>
      )}
    </main>
  );
}
