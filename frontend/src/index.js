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
import OverviewPage, { loader as OverviewPageLoader } from "./routes/dashboard/OverviewPage";
import OnboardingPage from "./routes/dashboard/onboarding/OnboardingPage";
import RequireOnboarded from "./components/RequireOnboarded";
import PrivacyPolicyPage from "./routes/legal/PrivacyPolicyPage";
import TermsAndConditionsPage from "./routes/legal/TermsAndConditionsPage";
import { AnalyticsProvider } from "./providers/AnalyticsProvider";
import SignUpPage from "./routes/SignUpPage";
import ChangePasswordPage from "./routes/ChangePasswordPage";
import NotFoundPage from "./routes/NotFoundPage";
import VerifyAccountPage from "./routes/VerifyAccountPage";
import TransfersPage, { loader as TransfersPageLoader } from "./routes/dashboard/TransfersPage";
import QuickSharePage from "./routes/QuickSharePage";
import QuickShareProgress from "./routes/quick-share/QuickShareProgress";
import QuickShareNew from "./routes/quick-share/QuickShareNew";
import NewTransferPage from "./routes/dashboard/transfers/NewTransferPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<AnalyticsProvider />}>
        <Route element={<AuthProvider />}>
          <Route element={<ApplicationProvider />}>
            <Route element={<DashboardProvider />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route element={<RequireOnboarded />}>
                <Route path="/app" element={<Dashboard />}>
                  <Route index element={<Navigate to="/app/overview" replace />} />
                  <Route path="overview" element={<OverviewPage />} loader={OverviewPageLoader} />
                  <Route path="transfers">
                    <Route index element={<TransfersPage />} loader={TransfersPageLoader} />
                    <Route path="new" element={<NewTransferPage />} />
                  </Route>
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="/" element={<App />}>
              <Route index element={<HomePage />} />
              <Route path="/quick-share" element={<QuickSharePage />} >
                <Route index element={<QuickShareNew />} />
                <Route path="progress" element={<QuickShareProgress />} />
              </Route>
              <Route path="/legal/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/legal/terms-and-conditions" element={<TermsAndConditionsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="/login" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/verify-account" element={<VerifyAccountPage />} />
          </Route>
          {/* <Route path="reset-password" element={<PasswordResetRequestPage />} /> */}
        </Route>
      </Route>
    </>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <RouterProvider router={router} />
  </>
);