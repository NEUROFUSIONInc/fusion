import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import React, { useState, useEffect } from 'react';

import Spinner from 'react-bootstrap/Spinner';

import Root from "./routes/root";
import Analysis from './routes/analysis';
import ErrorPage from './routes/error-page';
import Recordings from './routes/recordings';
import Settings from './routes/settings';
import LandingPage from './routes/landingpage';
import NeurosityCallback from "./routes/neurositycallback";

import { UserContext } from "./contexts/UserContext";
import { checkUser } from './services/magic';
import { ProvideNotion } from "./services/neurosity";
import AuthManager from "./components/authmanager";
import './App.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
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
  const [user, setUser] = useState({ isLoggedIn: false, email: '' });
  const [loading, setLoading] = useState();

  useEffect(() => {
    console.log(user.isLoggedIn);
    if (user.isLoggedIn) {
      return;
    }
    const validateUser = async () => {
      setLoading(true);
      try {
        await checkUser(setUser);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    validateUser();
  }, [user.isLoggedIn]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '100vh' }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <ProvideNotion>
        {user.isLoggedIn == false ?
          <AuthManager setStatus={setUser} />
          :
          <RouterProvider router={router} />
        }
      </ProvideNotion>
    </UserContext.Provider>
  );
}

export default App;
