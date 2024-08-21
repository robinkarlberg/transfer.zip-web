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
import TransfersPage from './pages/app/transfers/TransfersPage';
import TransferInfoPage from "./pages/app/transfers/TransferInfoPage";
import AccountPage from './pages/app/AccountPage';
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
import ZipFilesSitePage from "./pages/site/tools/ZipFilesSitePage";
import ZipFilesAppPage from "./pages/app/tools/zip/ZipFilesAppPage";
import ZipFilesAppNew from "./pages/app/tools/zip/ZipFilesAppNew";
import ZipFilesAppProgress from "./pages/app/tools/zip/ZipFilesAppProgress";
import ZipFilesAppFinished from "./pages/app/tools/zip/ZipFilesAppFinished";
import UnzipFilesSitePage from "./pages/site/tools/UnzipFilesSitePage";
import UnzipFilesAppPage from "./pages/app/tools/unzip/UnzipFilesAppPage";
import UnzipFilesAppView from "./pages/app/tools/unzip/UnzipFilesAppView";
import UnzipFilesAppNew from "./pages/app/tools/unzip/UnzipFilesAppNew";
import NewTransferPage from "./pages/app/transfers/NewTransferPage";
import ShareZipFileSitePage from "./pages/site/tools/ShareZipFileSitePage";
import DownloadPageNew from "./pages/app/DownloadPageNew";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AnalyticsHelmet />}>
      <Route element={<FilePickerProvider />}>
        <Route path="/transfer/:secretCode" element={<DownloadPageNew />} />
        <Route element={<AuthProvider ignoreVerification={true} />}>
          <Route path="/" element={<Site />}>
            <Route path="/" element={<AboutPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="legal/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="legal/terms-and-conditions" element={<TermsOfConditionsPage />} />

            <Route path="/tools">
              <Route path="zip-files-online" element={<ZipFilesSitePage />} />
              <Route path="unzip-files-online" element={<UnzipFilesSitePage />} />
              <Route path="send-zip-file" element={<ShareZipFileSitePage />} />
            </Route>

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
                  <Route path="new" element={<NewTransferPage />} />
                  <Route path=":id" element={<TransferInfoPage />} />
                </Route>
                <Route path="statistics" element={<StatisticsPage />} />
                <Route path="storage" element={<FilesPage />} />
                <Route path="account" element={<AccountPage />} />

                <Route path="zip-files" element={<ZipFilesAppPage />} >
                  <Route path="" element={<ZipFilesAppNew />} />
                  <Route path="progress" element={<ZipFilesAppProgress />} />
                  <Route path="finished" element={<ZipFilesAppFinished />} />
                </Route>

                <Route path="unzip-files" element={<UnzipFilesAppPage />} >
                  <Route path="" element={<UnzipFilesAppNew />} />
                  <Route path="view" element={<UnzipFilesAppView />} />
                </Route>

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
      <Route element={<FilePickerProvider />}>
        <Route element={<AuthProvider ignoreVerification={true} />}>
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

              <Route path="zip-files" element={<ZipFilesAppPage />} >
                <Route path="" element={<ZipFilesAppNew />} />
                <Route path="progress" element={<ZipFilesAppProgress />} />
                <Route path="finished" element={<ZipFilesAppFinished />} />
              </Route>

              <Route path="unzip-files" element={<UnzipFilesAppPage />} >
                <Route path="" element={<UnzipFilesAppNew />} />
                <Route path="view" element={<UnzipFilesAppView />} />
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