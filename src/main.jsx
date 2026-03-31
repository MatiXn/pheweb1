import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import VacancyFunnelPage from "./pages/VacancyFunnelPage";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/funnel/:slug" element={<VacancyFunnelPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
