import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // 화면에서 "/api/..."로 보낸 요청을 Python 서버(8000번)로 대신 전달해 준다.
    // 덕분에 화면 코드에는 서버 주소를 적지 않아도 되고, CORS 설정도 필요 없다.
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
