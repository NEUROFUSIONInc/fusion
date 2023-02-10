import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Root from "./routes/root";
import Analysis from './routes/analysis';
import ErrorPage from './routes/error-page';
import Recordings from './routes/recordings';
import Settings from './routes/settings';
import LandingPage from './routes/landingpage';
import AuthManager from "./routes/authmanager";
import NeurosityCallback from "./routes/neurositycallback";

import { ProvideNotion } from "./services/neurosity";
import { ProvideNeurofusionUser } from "./services/auth";

import './App.css';

axios.interceptors.request.use(config => {
  const { origin } = new URL(config.url);
  const allowedOrigins = [process.env.REACT_APP_NEUROFUSION_BACKEND_URL];
  const token = localStorage.getItem('token');
  
  if (allowedOrigins.includes(origin)) {
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));


const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <AuthManager />,
    errorElement: <ErrorPage />
  },
  {
    path: "/lab",
    element: <Root />,
    errorElement: <ErrorPage />
  },
  {
    path: "/analysis",
    element: <Analysis />,
    errorElement: <ErrorPage />
  },
  {
    path: "/recordings",
    element: <Recordings />,
    errorElement: <ErrorPage />
  },
  {
    path: "/settings",
    element: <Settings />,
    errorElement: <ErrorPage />
  },
  {
    path: "/neurosity-callback",
    element: <NeurosityCallback />,
    errorElement: <ErrorPage />
  }
]);

function App() {
  return (
      <ProvideNeurofusionUser>
        <ProvideNotion>
          <RouterProvider router={router} />
          {/* TODO: handle authentication on routes */}
        </ProvideNotion>
      </ProvideNeurofusionUser>
  );
}

export default App;
