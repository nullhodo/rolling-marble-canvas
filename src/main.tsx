import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

// ローカル開発時だけタブタイトルに [DEV] を付ける
if (import.meta.env.DEV && !document.title.startsWith("[DEV]")) {
  document.title = `[DEV] ${document.title}`;
}

// StrictMode の二重マウントで p5 (WebGL コンテキスト) を作り直さないよう、テンプレートに合わせて使わない
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />,
);
