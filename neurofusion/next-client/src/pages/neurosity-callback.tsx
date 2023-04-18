import { useEffect } from "react";

import { API_URL } from "~/config";
import { useNeurosityState, useOAuthResult } from "~/hooks";

export default function NeurosityCallback() {
  const { loading, user } = useNeurosityState();
  // This is absolutely necessary to get the oauth result
  const oauthResult = useOAuthResult();

  useEffect(() => {
    // validate auth result and then redirect to settings page
    if (!loading && user) {
      // make api to backend that oauth is complete
      fetch(`${API_URL}/api/neurosity-oauth-complete`, {
        method: "POST",
        body: JSON.stringify(oauthResult),
      });
      // alert("user is logged in successfully");
      window.location.href = "/settings";
    }

    window.location.href = "/integrations";
  }, [loading, user, oauthResult]);

  return <></>;
}
