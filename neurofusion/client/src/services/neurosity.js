import { createContext, useContext, useEffect } from "react";
import { useState } from "react";
// import { useLocation } from "react-router-dom";
import { Notion } from "@neurosity/notion";
import axios from "axios";

export const notion = new Notion({
  autoSelectDevice: false
});

export const NotionContext = createContext();

export const useNotion = () => {
  return useContext(NotionContext);
};

const acmeNeuroConfig = {
  enableDBQuery: true,
  // Neurosity userId must be saved and retrieved by third-party
  testNeurosityUserId: "OEWjFDdq6mMFKyDtSafg1edxnr25"
};

const initialState = {
  loading: true,
  user: null,
  oAuthError: null,
  devices: []
};

export function ProvideNotion({ children }) {
  const notionProvider = useProvideNotion();

  return (
    <NotionContext.Provider value={notionProvider}>
      {children}
    </NotionContext.Provider>
  );
}

function useProvideNotion() {
  const [state, setState] = useState(initialState);
  const oAuthResult = useOAuthResult();
  const { customToken, error: oAuthError } = oAuthResult;

  useEffect(() => {
    const subscription = notion.onAuthStateChanged().subscribe(async (user) => {
      console.log("user", user);

      if (acmeNeuroConfig.enableDBQuery) {
        if (user) {
          setState((prevState) => ({
            ...prevState,
            loading: false,
            user
          }));
        } else {
          const params = getOAuthParams();

          if (params?.customToken) {
            return;
          }

          setState((prevState) => ({
            ...prevState,
             loading: false,
            user
          }));

          axios
            .get(`http://localhost:4000/api/get-neurosity-custom-token`, {
              params: { userId: acmeNeuroConfig.testNeurosityUserId }
            })
            .then(({ data }) =>
              notion
                .login({
                  customToken: data
                })
                .catch(() => null)
            )
            .then((auth) => {
              setState((prevState) => ({
                ...prevState,
                loading: false,
                user: auth?.user
              }));
            })
            .catch(() => {
              setState((prevState) => ({
                ...prevState,
                loading: false
              }));
            });
        }
      } else {
        setState((prevState) => ({
          ...prevState,
          loading: false,
          user
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = notion.onUserClaimsChange().subscribe((claims) => {
      console.log("claims", claims);
      setState((prevState) => ({
        ...prevState,
        claims
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = notion.onUserDevicesChange().subscribe((devices) => {
      setState((prevState) => ({
        ...prevState,
        devices
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check for prescence of customToken and trigger login
  useEffect(() => {
    if (!customToken) {
      return;
    }

    notion.login({ customToken }).catch((error) => {
      setState((prevState) => ({
        ...prevState,
        oAuthError: error?.message
      }));
    });
  }, [customToken]);

  useEffect(() => {
    if (oAuthError) {
      setState((prevState) => ({
        ...prevState,
        oAuthError
      }));

      // Remove location hash so it doesn't pass it to subsecuent routes
      window.history.replaceState(null, null, " ");
    }
  }, [oAuthError]);

  return state;
}

export function useOAuthResult() {
//   const location = useLocation();
  const paramsString = window.location.hash.replace("#", "");

  return getOAuthParams(paramsString);
}

function getOAuthParams(paramsString) {
  paramsString = paramsString ?? window.location.hash;
  const searchParams = new URLSearchParams(paramsString);

  return {
    state: searchParams.get("state"),
    error: searchParams.get("error"),
    customToken: searchParams.get("access_token")
  };
}
