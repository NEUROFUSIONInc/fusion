// will contain settings page for 
// 1. user profile
// 2. connecting magicflow data
// 3. connecting oura data

import { useEffect } from 'react';
import { React, useState } from 'react';
import SideNavBar from '../components/sidenavbar';

export function ConnectNeurosityAccountButton() {
    function connectNeurosityAccount() {
      fetch(`http://localhost:4000/api/get-neurosity-oauth-url`)
        .then((res) => res.json())
        .then(data => {
          console.log(data)
          if (data.statusCode == 200) {
            // redirects the browser to the Neurosity OAuth sign-in page
            window.location.href = data.body.url;
          } else {
            console.error(`Error: Did not receive url`);
          }
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  
    return (
        <>
            <h3>EEG Data (Neurosity)</h3>
            <button onClick={connectNeurosityAccount}>
                Connect Neurosity Account
            </button>
        </>
    );
}

export function ConnectMagicFlow() {
    const handleTokenChange = (event) => {

    }

    const handleMagicFlowTokenSave = (event) => {
        // call magicflow api to validate token

        // save token to localstorage
    }
    return (
        <form onSubmit={handleMagicFlowTokenSave}>
            <h3>Productivity Data (magicflow)</h3>
            <label>
                Magicflow Token:
                <input type="text" name="token" onChange={handleTokenChange} />
            </label>
            <input type="submit" value="Submit" />
        </form>
    )
}

export default function Settings() {

    const [magicflowToken, setMagicflowToken] = useState({})

    useEffect(() => {
        // get magicflow token from localstorage
        // setMagicflowToken(token)        
    }, [])

    return (
        <>
            <SideNavBar></SideNavBar>

            <main style={{
                marginLeft: '10%',
                paddingLeft: "10px"
            }}>
                <h1>Settings</h1>

                <h2>Data Onboarding</h2>

                <ConnectNeurosityAccountButton />

                <ConnectMagicFlow />

                <h3>Health Data (Oura/Apple Health)</h3>
                <p>Coming soon!</p>
            </main>
        </>
    );
}