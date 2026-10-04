import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "../css/fa-inline.css";
import "../css/chunk-vendors.efadcd84.css";
import "../css/app.a5feeff2.css";
import "../css/findyourcar.604be99f.css";
import "../css/requirements.css";
import "../css/brand.css";

const basename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
