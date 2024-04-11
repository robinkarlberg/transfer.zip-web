import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

import {
  createBrowserRouter,
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

const router = createBrowserRouter([
  {
    element: <ApplicationProvider />,
    children: [
      {
        path: "/",
        element: <FileTransferProvider />,
        children: [{
          element: <App />, // TODO: Implement element that redirects to appropriate route depending on URL hash (send/receive)
          children: [
            {
              path: "/about",
              element: <AboutPage />
            },
            {
              path: "/privacy-policy",
              element: <PrivacyPolicyPage />
            },
            {
              path: "/",
              element: <IndexPage />
            },
            {
              path: "upload",
              element: <UploadPage />
            },
            {
              path: "upload-on-behalf",
              element: <UploadOnBehalfPage />
            },
            {
              path: "progress",
              element: <ProgressPage />
            }
          ]
        }]
      }
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);