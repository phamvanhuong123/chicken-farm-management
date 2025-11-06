// Những dowmain được phép truy cập đến tài nguyên của server
export const WHITELIST_DOMAINS = [
  "http://localhost:3000", // nếu có dùng React (CRA)
  "http://127.0.0.1:3000",
  "http://localhost:5173", // 👈 thêm dòng này cho Vite frontend
  "http://127.0.0.1:5173",
];
