import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import LandingPage from "./pages/LandingPage";
import FuerUnternehmenPage from "./pages/FuerUnternehmenPage";
import FuerKandidatenPage from "./pages/FuerKandidatenPage";
import FuerRecruiterPage from "./pages/FuerRecruiterPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CandidateRegisterPage from "./pages/CandidateRegisterPage";
import CompanyRegisterPage from "./pages/CompanyRegisterPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import RecruiterRegisterPage from "./pages/RecruiterRegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminTotpSetupPage from "./pages/AdminTotpSetupPage";
import AdminTotpVerifyPage from "./pages/AdminTotpVerifyPage";
import KandidatOnboardingPage from "./pages/KandidatOnboardingPage";
import KandidatDokumentePage from "./pages/KandidatDokumentePage";
import KandidatEinwilligungPage from "./pages/KandidatEinwilligungPage";
import KandidatProfilBearbeitenPage from "./pages/KandidatProfilBearbeitenPage";
import UnternehmenProfilPage from "./pages/UnternehmenProfilPage";
import UnternehmenStellAnlegenPage from "./pages/UnternehmenStellAnlegenPage";
import UnternehmenStellenVerwaltenPage from "./pages/UnternehmenStellenVerwaltenPage";
import UnternehmenStelleBearbeitenPage from "./pages/UnternehmenStelleBearbeitenPage";
import AdminSkillsPage from "./pages/AdminSkillsPage";
import AdminVerifizierungsQueuePage from "./pages/AdminVerifizierungsQueuePage";
import AdminUnternehmenPage from "./pages/AdminUnternehmenPage";
import AdminMonitoringPage from "./pages/AdminMonitoringPage";
import UnternehmenMatchDashboardPage from "./pages/UnternehmenMatchDashboardPage";
import UnternehmenAbonnementPage from "./pages/UnternehmenAbonnementPage";
import RecruiterInteressentenPage from "./pages/RecruiterInteressentenPage";
import RecruiterProfilPage from "./pages/RecruiterProfilPage";
import RecruiterKandidatHochladenPage from "./pages/RecruiterKandidatHochladenPage";
import RecruiterKandidatenPage from "./pages/RecruiterKandidatenPage";
import KandidatDatenschutzPage from "./pages/KandidatDatenschutzPage";
import KandidatAnfragePage from "./pages/KandidatAnfragePage";
import LebenslaufGeneratorPage from "./pages/LebenslaufGeneratorPage";
import { AuthProvider } from "./features/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PageTransition } from "./components/PageTransition";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <PageTransition>
        <Routes>
          {/* Startseite & Marketing */}
          <Route path="/" element={<App />} />
          <Route path="/start" element={<LandingPage />} />
          <Route path="/fuer-unternehmen" element={<FuerUnternehmenPage />} />
          <Route path="/fuer-kandidaten"  element={<FuerKandidatenPage />}  />
          <Route path="/fuer-recruiter"   element={<FuerRecruiterPage />}   />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/passwort-vergessen" element={<ForgotPasswordPage />} />
          <Route path="/passwort-zuruecksetzen" element={<ResetPasswordPage />} />

          {/* Registrierung */}
          <Route path="/registrieren/kandidat" element={<CandidateRegisterPage />} />
          <Route path="/registrieren/unternehmen" element={<CompanyRegisterPage />} />
          <Route path="/registrieren/recruiter" element={<RecruiterRegisterPage />} />

          {/* Dashboard (role-based redirect) */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/warten" element={<ProtectedRoute><PendingApprovalPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/totp-einrichten" element={<ProtectedRoute><AdminTotpSetupPage /></ProtectedRoute>} />
          <Route path="/admin/totp-verify" element={<ProtectedRoute><AdminTotpVerifyPage /></ProtectedRoute>} />
          <Route path="/admin/skills" element={<ProtectedRoute><AdminSkillsPage /></ProtectedRoute>} />
          <Route path="/admin/verifizierung" element={<ProtectedRoute><AdminVerifizierungsQueuePage /></ProtectedRoute>} />
          <Route path="/admin/unternehmen" element={<ProtectedRoute><AdminUnternehmenPage /></ProtectedRoute>} />
          <Route path="/admin/monitoring" element={<ProtectedRoute><AdminMonitoringPage /></ProtectedRoute>} />

          {/* Kandidat — öffentliche Anfrage (kein Login) */}
          <Route path="/kandidat/anfrage"       element={<KandidatAnfragePage />}        />
          <Route path="/lebenslauf-erstellen"   element={<LebenslaufGeneratorPage />}    />

          {/* Kandidat — interne Seiten (Recruiter-verwaltete Profile) */}
          <Route path="/kandidat/onboarding" element={<ProtectedRoute><KandidatOnboardingPage /></ProtectedRoute>} />
          <Route path="/kandidat/dokumente" element={<ProtectedRoute><KandidatDokumentePage /></ProtectedRoute>} />
          <Route path="/kandidat/einwilligung" element={<ProtectedRoute><KandidatEinwilligungPage /></ProtectedRoute>} />
          <Route path="/kandidat/profil" element={<ProtectedRoute><KandidatProfilBearbeitenPage /></ProtectedRoute>} />
          <Route path="/kandidat/datenschutz" element={<ProtectedRoute><KandidatDatenschutzPage /></ProtectedRoute>} />

          {/* Unternehmen */}
          <Route path="/unternehmen/matches" element={<ProtectedRoute><UnternehmenMatchDashboardPage /></ProtectedRoute>} />
          <Route path="/unternehmen/profil" element={<ProtectedRoute><UnternehmenProfilPage /></ProtectedRoute>} />
          <Route path="/unternehmen/stelle-anlegen" element={<ProtectedRoute><UnternehmenStellAnlegenPage /></ProtectedRoute>} />
          <Route path="/unternehmen/stellen-verwalten" element={<ProtectedRoute><UnternehmenStellenVerwaltenPage /></ProtectedRoute>} />
          <Route path="/unternehmen/stelle-bearbeiten/:id" element={<ProtectedRoute><UnternehmenStelleBearbeitenPage /></ProtectedRoute>} />
          <Route path="/unternehmen/abonnement" element={<ProtectedRoute><UnternehmenAbonnementPage /></ProtectedRoute>} />

          {/* Recruiter */}
          <Route path="/recruiter/kandidaten" element={<ProtectedRoute><RecruiterKandidatenPage /></ProtectedRoute>} />
          <Route path="/recruiter/kandidat-hochladen" element={<ProtectedRoute><RecruiterKandidatHochladenPage /></ProtectedRoute>} />
          <Route path="/recruiter/profil" element={<ProtectedRoute><RecruiterProfilPage /></ProtectedRoute>} />
          <Route path="/recruiter/interessenten" element={<ProtectedRoute><RecruiterInteressentenPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </PageTransition>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
