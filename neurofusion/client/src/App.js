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

import { UserContext } from "./contexts/UserContext";
import { checkUser } from './services/magic';
import Authenticate from "./components/authenticate";

const router = createBrowserRouter([
  {
    path: "/",
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
  }
]);

function App() {
  const [user, setUser] = useState({ isLoggedIn: false, email: '' });
  const [loading, setLoading] = useState();

  useEffect(() => {
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
      {user.isLoggedIn == false ?
        <Authenticate setStatus={setUser} />
        :
        <RouterProvider router={router} />
      }
    </UserContext.Provider>
  );
}

export default App;
