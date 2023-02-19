import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";
import axios from "axios";

import Root from "./routes/root";
import Analysis from "./routes/analysis";
import ErrorPage from "./routes/error-page";
import Datasets from "./routes/datasets";
import Settings from "./routes/settings";
import LandingPage from "./routes/landingpage";
import AuthManager from "./routes/authmanager";
import NeurosityCallback from "./routes/neurositycallback";

import { ProvideNotion } from "./services/neurosity";
import { ProvideNeurofusionUser } from "./services/auth";

import "./App.css";

axios.interceptors.request.use(
  (config) => {
    const { origin } = new URL(config.url);
    const allowedOrigins = [process.env.REACT_APP_NEUROFUSION_BACKEND_URL];
    const token = localStorage.getItem("token");

    if (allowedOrigins.includes(origin)) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <AuthManager />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/lab",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/analysis",
    element: <Analysis />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/datasets",
    element: <Datasets />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/settings",
    element: <Settings />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/neurosity-callback",
    element: <NeurosityCallback />,
    errorElement: <ErrorPage />,
  },
]);

function App() {
  return (
    <ProvideNeurofusionUser>
      <ProvideNotion>
        <RouterProvider router={router} />
      </ProvideNotion>
    </ProvideNeurofusionUser>
  );
}

export default App;
