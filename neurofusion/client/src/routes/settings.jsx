// will contain settings page for 
// 1. user profile
// 2. connecting magicflow data
// 3. connecting oura data

import { useEffect } from 'react';
import { React, useState } from 'react';
import SideNavBar from '../components/sidenavbar';

export default function Settings() {

    const [magicflowToken, setMagicflowToken] = useState({})

    useEffect(() => {
        // get magicflow token from localstorage
        // setMagicflowToken(token)        
    }, [])

    const handleTokenChange = (event) => {

    }

    const handleMagicFlowTokenSave = (event) => {
        // call magicflow api to validate token

        // save token to localstorage
    }

    return (
        <>
            <SideNavBar></SideNavBar>

            <main style={{
                marginLeft: '10%',
            }}>
                <h1>Settings</h1>

                <h2>Data Onboarding</h2>
                <form onSubmit={handleMagicFlowTokenSave}>
                    <h3>Productivity Data (magicflow)</h3>
                    <label>
                        Magicflow Token:
                        <input type="text" name="token" onChange={handleTokenChange} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </main>
        </>
    );
}