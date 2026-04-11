import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import VacancyFunnelPage from "./pages/VacancyFunnelPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import OnboardingPage from "./pages/OnboardingPage";
import TurkeyLandPage from "./pages/TurkeyLandPage";
import TurkeyAdminPage from "./pages/TurkeyAdminPage";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/funnel/:slug" element={<VacancyFunnelPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/grundstuecke" element={<TurkeyLandPage />} />
        <Route path="/grundstuecke/admin" element={<TurkeyAdminPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
