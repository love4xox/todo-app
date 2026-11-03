// React가 index.html의 <div id="root"> 안에 App을 그려 넣는 시작점.
// 이 파일은 거의 고칠 일이 없다.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/theme.css";
import "./styles/app.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
