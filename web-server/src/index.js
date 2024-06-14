import React, { useState } from "react";
import ReactDOM from 'react-dom/client';

import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";

import './index.css';
import './ubuntu.css';
import App from './App';
import NotFoundPage from './pages/NotFoundPage';
import LinkPage from './pages/LinkPage';

import IndexPage from "./pages/partial/IndexPage"
import UploadPage from './pages/partial/UploadPage';
import UploadOnBehalfPage from './pages/partial/UploadOnBehalfPage';
import ProgressPage from './pages/partial/ProgressPage';

import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { ApplicationProvider } from './providers/ApplicationProvider';
import { FileTransferProvider } from './providers/FileTransferProvider';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AboutPage from './pages/AboutPage';
import { AuthProvider } from './providers/AuthProvider';
import TransfersPage from './pages/app/TransfersPage';
import AccountPage from './pages/app/AccountPage';
import HomePage from "./pages/app/HomePage";
import TransferInfoPage from "./pages/app/TransferInfoPage";
import DownloadPage from "./pages/app/DownloadPage";
import StatisticsPage from "./pages/app/StatisticsPage";
import FilesPage from "./pages/app/FilesPage";
import QuickSharePage from "./pages/app/quick-share/QuickSharePage";
import QuickShareIndex from "./pages/app/quick-share/QuickShareNew";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/dl/:secretCode" element={<DownloadPage />} />
      <Route element={<ApplicationProvider />}>
        <Route element={<AuthProvider />}>
          <Route element={<App />}>
            <Route path="/quick-share" element={<QuickSharePage/>}>
              <Route path="new" element={<QuickShareIndex />} />
              {/* <Route path="progress" element={<TransfersPage />} /> */}
              {/* <Route path=":id" element={<TransferInfoPage />} /> */}
            </Route>
            <Route path="/home" element={<HomePage />} />
            <Route path="/transfers">
              <Route path="/transfers" element={<TransfersPage />} />
              <Route path=":id" element={<TransferInfoPage />} />
            </Route>
            <Route path="/account" element={<AccountPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/files" element={<FilesPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={"/home"} />} />
    </Route >
  )
  // [
  // {
  //   element: <ApplicationProvider />,
  //   children: [
  //     {
  //       element: <AuthProvider />,
  //       children: [
  //         {
  //           element: <FileTransferProvider />,
  //           children: [{
  //             element: <App />,
  //             children: [
  //               {
  //                 path: "/",
  //                 element: <IndexPage />
  //               },
  //               {
  //                 path: "/transfers",
  //                 element: <TransfersPage />
  //               },
  //               {
  //                 path: "/account",
  //                 element: <AccountPage />
  //               },
  //               {
  //                 path: "/upload",
  //                 element: <UploadPage />
  //               },
  //               {
  //                 path: "/upload-on-behalf",
  //                 element: <UploadOnBehalfPage />
  //               },
  //               {
  //                 path: "/progress",
  //                 element: <ProgressPage />
  //               }
  //             ]
  //           }]
  //         }
  //       ]
  //     },
  //   ]
  // },
  // {
  //   path: "*",
  //   element: <NotFoundPage />
  // }]
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <RouterProvider router={router} />
  // </React.StrictMode>
);