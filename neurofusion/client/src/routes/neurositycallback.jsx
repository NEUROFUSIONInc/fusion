import { createContext, useContext, useEffect } from "react";
import { useNotion } from "../services/neurosity"
import { useOAuthResult } from "../services/neurosity";

export default function NeurosityCallback() {
    const { loading, user } = useNotion();
    const oauthResult = useOAuthResult();

    useEffect(() => {
        // validate auth result and then redirect to settings page
        if(!loading && user) {
            // make api to backend that oauth is complete
            // TODO: implement route on backend
            fetch(`${process.env.REACT_APP_NEUROFUSION_BACKEND_URL}/api/neurosity-oauth-complete`, {
                method: "POST",
                body: JSON.stringify(oauthResult)
            })
            console.log("user is logged in successfully");
            // alert("user is logged in successfully");
            window.location.href = '/settings';
        }

        // TODO: what do we do if auth don't work, still redirect to settings page?
    })

    return (
        <></>
    )
}