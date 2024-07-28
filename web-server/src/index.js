import React, { useState } from "react";
import ReactDOM from 'react-dom/client';

import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";

import './index.css';
import './ubuntu.css';
import App from './App';

import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { ApplicationProvider } from './providers/ApplicationProvider';
import { FileTransferProvider } from './providers/FileTransferProvider';
import { AuthProvider } from './providers/AuthProvider';
import TransfersPage from './pages/app/TransfersPage';
import AccountPage from './pages/app/AccountPage';
import TransferInfoPage from "./pages/app/TransferInfoPage";
import DownloadPage from "./pages/app/DownloadPage";
import StatisticsPage from "./pages/app/StatisticsPage";
import FilesPage from "./pages/app/FilesPage";
import QuickSharePage from "./pages/app/quick-share/QuickSharePage";
import QuickShareNew from "./pages/app/quick-share/QuickShareNew";
import EmptyPage from "./pages/app/EmptyPage";
import QuickShareProgress from "./pages/app/quick-share/QuickShareProgress";
import { QuickShareProvider } from "./providers/QuickShareProvider";
import Login from "./pages/app/Login";
import SignUp from "./pages/app/SignUp";
import Site from "./pages/site/Site";
import AboutPage from "./pages/site/AboutPage";
import HomePage from "./pages/app/HomePage";
import PrivacyPolicyPage from "./pages/site/legal/PrivacyPolicyPage";
import TermsOfConditionsPage from "./pages/site/legal/TermsOfConditionsPage";
import ResetPasswordRequest from "./pages/app/PasswordResetRequest";
import ChangePassword from "./pages/app/ChangePassword";
import { isSelfHosted } from "./utils";
import PricingPage from "./pages/site/PricingPage";
import VerifyAccount from "./pages/app/VerifyAccount";
import AnalyticsHelmet from "./components/AnalyticsHelmet";
import JoinWaitlistPage from "./pages/app/JoinWaitlistPage";
import { FilePickerProvider } from "./providers/FilePickerProvider";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AnalyticsHelmet />}>
      <Route element={<FilePickerProvider />}>
        <Route path="/transfer/:secretCode" element={<DownloadPage />} />
        <Route element={<AuthProvider ignoreVerification={true} />}>
          <Route path="/" element={<Site />}>
            <Route path="/" element={<AboutPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="legal/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="legal/terms-and-conditions" element={<TermsOfConditionsPage />} />
            <Route path="*" element={<Navigate to={"/"} replace={true} />} />
          </Route>
        </Route>
        <Route element={<AuthProvider />}>
          <Route element={<ApplicationProvider />}>
            <Route element={<App />}>
              <Route path="/app">
                <Route element={<QuickShareProvider />}>
                  <Route path="quick-share" element={<QuickSharePage />}>
                    <Route path="" element={<QuickShareNew />} />
                    <Route path="progress" element={<QuickShareProgress />} />
                    {/* <Route path="progress" element={<TransfersPage />} /> */}
                    {/* <Route path=":id" element={<TransferInfoPage />} /> */}
                  </Route>
                </Route>
                <Route path="dashboard" element={<HomePage />} />
                <Route path="transfers">
                  <Route path="" element={<TransfersPage />} />
                  <Route path=":id" element={<TransferInfoPage />} />
                </Route>
                <Route path="statistics" element={<StatisticsPage />} />
                <Route path="files" element={<FilesPage />} />
                <Route path="account" element={<AccountPage />} />
                <Route path="" element={<EmptyPage />} />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path="/upgrade" element={<Navigate to={"/pricing"} replace={true} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/reset-password" element={<ResetPasswordRequest />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/join-waitlist" element={<JoinWaitlistPage />} />
      </Route>
    </Route >
  )
)

const selfHostRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route element={<ApplicationProvider />}>
        <Route element={<AuthProvider ignoreVerification={true} />}>
          <Route element={<App />}>
            <Route element={<QuickShareProvider />}>
              <Route path="/quick-share" element={<QuickSharePage />}>
                <Route path="/quick-share" element={<QuickShareNew />} />
                <Route path="progress" element={<QuickShareProgress />} />
                {/* <Route path="progress" element={<TransfersPage />} /> */}
                {/* <Route path=":id" element={<TransferInfoPage />} /> */}
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<EmptyPage />} />
        </Route>
      </Route>
    </Route >
  )
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <RouterProvider router={isSelfHosted() ? selfHostRouter : router} />
  // </React.StrictMode>
);