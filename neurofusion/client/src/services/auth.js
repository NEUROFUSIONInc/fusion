import { createContext, useEffect, useState, useContext } from 'react';
import { Magic } from 'magic-sdk';
import axios from 'axios';

const magic = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY);

const initialUserState = {
    user: null,
    userEmail: null,
    userAuthError: null,
    isLoggedIn: false,
    isLoading: true,
};

export const NeurofusionUserContext = createContext(initialUserState);

export const useNeurofusionUser = () => {
    return useContext(NeurofusionUserContext);
};

export function ProvideNeurofusionUser({ children }) {
    const userProvider = useProvideNeurofusionUser();

    useEffect(() => {
        // redirect to login page if not signed in
        console.log("validating user login")
        
        const path = window.location.pathname;
        console.log("current path is ", path);
        // if the user is not logged in and is not on the login page, redirect to login page
        const openRoutes = [
            '/',
            '/login'
        ]

        if (userProvider.isLoading == false 
            && userProvider.isLoggedIn !== true
            && !openRoutes.includes(path)
        ) {
            window.location.href = '/login';
        }
    }, [userProvider.isLoading, userProvider.isLoggedIn])

    return (
        <>
            <NeurofusionUserContext.Provider value={userProvider}>
                {children}
            </NeurofusionUserContext.Provider>
        </>
    );
}

function useProvideNeurofusionUser() {
    const [userState, setUserState] = useState(initialUserState);
    
    useEffect(() => {
        console.log("User login status is ", userState.isLoggedIn);

        const validateUser = async () => {
            try {
                await checkUser(setUserState);
            } catch (error) {
                console.error(error);
            }
        };
        validateUser();
    }, []);
    useEffect(() => {}, []);
    // check auth state and set user

    return userState;
}

// TODO: add session to pages
export const checkUser = async (cb) => {
  const isLoggedIn = await magic.user.isLoggedIn();
  if (isLoggedIn) {
    const user = await magic.user.getMetadata();
    return cb({ isLoggedIn: true, email: user.email, isLoading: false });
  }
  return cb({ isLoggedIn: false, isLoading: false });
};

export const loginUser = async (email, cb) => {
  const idToken = await magic.auth.loginWithMagicLink({ email });
  if (idToken) {
    const neurofusionUser = await userLoginComplete(email, idToken);
    const user = await magic.user.getMetadata();

    const userMetadata = {...neurofusionUser, isLoggedIn: true, isLoading: false, email: user.email};
    return cb(userMetadata);
  } else { 
    return cb({ isLoggedIn: false, isLoading: false });
  }
};

export const logoutUser = async () => {
  await magic.user.logout();
  window.location.assign('/');
};

export async function userLoginComplete(email, idToken) {
    const res = await axios.post(`${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/userlogin`, {
        userEmail: email,
        magicLinkAuthToken: idToken
    });

    if (res.status === 200) {
        // Simple but not the most secure way to store the token
        localStorage.setItem('token', res.data.body.authToken);
        return res.data;
    }
}