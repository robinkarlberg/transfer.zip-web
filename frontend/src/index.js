import React from "react";
import ReactDOM from 'react-dom/client';

import "bootstrap-icons/font/bootstrap-icons.css";
import './index.css';

import App from './App';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom";
import { AuthProvider } from './providers/AuthProvider';
import HomePage from './routes/HomePage';
import { ApplicationProvider } from './providers/ApplicationProvider';
import Dashboard from "./routes/dashboard/Dashboard";
import SignInPage from "./routes/SignInPage";
import { DashboardProvider } from "./providers/DashboardProvider";
import SettingsPage from "./routes/dashboard/SettingsPage";
import OverviewPage from "./routes/dashboard/OverviewPage";
import OnboardingProvider from "./providers/OnboardingProvider";
import OnboardingPage from "./routes/dashboard/onboarding/OnboardingPage";
import RequireOnboarded from "./components/RequireOnboarded";
import PrivacyPolicyPage from "./routes/legal/PrivacyPolicyPage";
import TermsAndConditionsPage from "./routes/legal/TermsAndConditionsPage";
import { AnalyticsProvider } from "./providers/AnalyticsProvider";
import ConnectAccountPage from "./routes/dashboard/ConnectAccountPage";
import PaymentsPage from "./routes/dashboard/PaymentsPage";
import RefreshPage from "./routes/dashboard/connect/RefreshPage";
import SignUpPage from "./routes/SignUpPage";
import ExplorePage from "./routes/ExplorePage";
import ForSponsorsPage from "./routes/ForSponsorsPage";
import SponsorsPage from "./routes/dashboard/SponsorsPage";
import ChangePasswordPage from "./routes/ChangePasswordPage";
import AdSettingsPage from "./routes/dashboard/AdSettingsPage";
import EmbedPage from "./routes/EmbedPage";
import NotFoundPage from "./routes/NotFoundPage";
import AdvertisementEmbedPage from "./routes/AdvertisementEmbedPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<AnalyticsProvider />}>
        <Route element={<AuthProvider />}>
          <Route element={<ApplicationProvider />}>
            <Route element={<DashboardProvider />}>
              <Route element={<OnboardingProvider />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
              </Route>
              <Route element={<RequireOnboarded />}>
                <Route path="/app" element={<Dashboard />}>
                  <Route index element={<Navigate to="/app/overview" replace />} />
                  <Route path="overview" element={<OverviewPage />} />
                  <Route path="layout" element={<AdSettingsPage />} />
                  <Route path="sponsors" element={<SponsorsPage />} />
                  <Route path="payments" element={<PaymentsPage />} />
                  {/* <Route path="announcements">
                  <Route index element={<AnnouncementsPage />} />
                  <Route path=":id" element={<AnnouncementPage />} />
                  <Route path="new">
                    <Route index element={<Navigate to={"magic"} replace />} />
                    <Route path="magic" element={<NewAnnouncementMagicPage />} />
                    <Route path="design" element={<NewAnnouncementPage />} />
                  </Route>
                </Route> */}
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="connect">
                    <Route index element={<ConnectAccountPage />} />
                    <Route path="return" element={<Navigate to={"/app/overview"} replace />} />
                    <Route path="refresh" element={<RefreshPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>
            <Route path="/" element={<App />}>
              <Route index element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/for-sponsors" element={<ForSponsorsPage />} />
              <Route path="/legal/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/legal/terms-and-conditions" element={<TermsAndConditionsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>
          {/* <Route path="reset-password" element={<PasswordResetRequestPage />} /> */}
        </Route>
      </Route>
      <Route path="/embed/:pub" element={<EmbedPage />} />
      <Route path="/sponsor/:pub" element={<AdvertisementEmbedPage />} />
    </>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <RouterProvider router={router} />
  </>
);