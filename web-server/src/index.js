import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './index.css';
import App from './App';
import NotFound from './pages/NotFound';
import ContactsList from './components/ContactsList';
import UploadOrReceive from "./components/UploadOrReceive"
import UploadOptions from './components/UploadOptions';
import Progress from './components/Progress';

import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { ApplicationProvider } from './providers/ApplicationProvider';

const router = createBrowserRouter([
  {
    element: <ApplicationProvider/>,
    children: [
      {
        path: "/",
        element: <App/>, // TODO: Implement element that redirects to appropriate route depending on URL hash (send/receive)
        children: [
          {
            path: "/",
            element: <UploadOrReceive/>
          },
          {
            path: "upload",
            element: <UploadOptions/>
          },
          {
            path: "progress",
            element: <Progress/>
          },
          {
            path: "contacts",
            element: <ContactsList/>
          }
        ]
      }
    ]
  },
  {
    path: "*",
    element: <NotFound/>
  }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);