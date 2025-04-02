import React from "react";
import ReactDOM from 'react-dom/client';

import "bootstrap-icons/font/bootstrap-icons.css";
import './index.css';

import App from './App';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom";
import { AuthProvider } from './providers/AuthProvider';
import HomePage from './routes/HomePage';
import { ApplicationProvider } from './providers/ApplicationProvider';
import Dashboard, { loader as DashboardLoader } from "./routes/dashboard/Dashboard";
import SignInPage from "./routes/SignInPage";
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
import DownloadPage from "./routes/DownloadPage";
import UnzipFilesPage from "./routes/tools/UnzipFilesPage";
import ZipFilesPage from "./routes/tools/ZipFilesPage";
import { isSelfHosted } from "./utils";
import HashInterceptor from "./components/HashInterceptor";
import SelfHostApp from "./routes/selfhost/SelfHostApp";
import HeicConvertPage from "./routes/tools/HeicConvertPage";
import DownloadPageSuccess, { loader as DownloadPageLoader } from "./components/DownloadPageSuccess";
import DownloadPageError from "./components/DownloadPageError";
import DownloadPageUpload, { loader as UploadPageLoader } from "./components/DownloadPageUpload";
import ImpressumPage from "./routes/legal/ImpressumPage";
import BrandingPage from "./routes/dashboard/branding/BrandingPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<AnalyticsProvider />}>
        <Route element={<AuthProvider />}>
          <Route element={<ApplicationProvider />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route element={<RequireOnboarded />}>
              <Route path="/app" element={<Dashboard />} id="dashboard" loader={DashboardLoader} errorElement={<Navigate to={"/login"} replace />}>
                {/* <Route index element={<Navigate to="/app/overview" replace />} /> */}
                <Route index element={<OverviewPage />} />
                <Route path="transfers" element={<TransfersPage />} />
                {/* <Route path="transfers/:id" element={<TransfersPage />} /> */}
                <Route path="transfers/new" element={<NewTransferPage />} />
                <Route path="branding" element={<BrandingPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="/" element={<App />}>
              <Route index element={<HomePage />} />
              <Route path="/quick-share" element={<QuickSharePage />} >
                <Route index element={<QuickShareNew />} />
                <Route path="progress" element={<QuickShareProgress />} />
              </Route>
              <Route path="/transfer/:secretCode" element={<DownloadPage />}>
                <Route index element={<DownloadPageSuccess />} loader={DownloadPageLoader} errorElement={<DownloadPageError />} />
              </Route>
              <Route path="/upload/:secretCode" element={<DownloadPage />}>
                <Route index element={<DownloadPageUpload />} loader={UploadPageLoader} errorElement={<DownloadPageError />} />
              </Route>
              <Route path="/legal/impressum" element={<ImpressumPage />} />
              <Route path="/legal/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/legal/terms-and-conditions" element={<TermsAndConditionsPage />} />
              <Route path="/tools">
                <Route path="unzip-files-online" element={<UnzipFilesPage />} />
                <Route path="zip-files-online" element={<ZipFilesPage />} />
                <Route path="heic-convert" element={<HeicConvertPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="/login" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            {/* <Route path="/verify-account" element={<VerifyAccountPage />} /> */}
          </Route>
          {/* <Route path="reset-password" element={<PasswordResetRequestPage />} /> */}
        </Route>
      </Route>
    </>
  )
);

const selfhostRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<ApplicationProvider />}>
        <Route path="/" element={<SelfHostApp />} >
          <Route path="/quick-share" element={<QuickSharePage />}>
            <Route index element={<QuickShareNew />} />
            <Route path="/quick-share/progress" element={<QuickShareProgress />} />
          </Route>
          <Route path="/tools">
            <Route path="unzip-files-online" element={<UnzipFilesPage />} />
            <Route path="zip-files-online" element={<ZipFilesPage />} />
            <Route path="heic-convert" element={<HeicConvertPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </>
  )
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <RouterProvider router={isSelfHosted() ? selfhostRouter : router} />
  </>
);