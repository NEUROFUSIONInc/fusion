import logo from '../assets/logo.png';
import React, { useState, useEffect } from 'react';
import { Notion } from "@neurosity/notion";

export default function Root() {

    const email = process.env.REACT_APP_NEUROSITY_EMAIL;
    const password = process.env.REACT_APP_NEUROSITY_PASSWORD;
    const deviceId = process.env.REACT_APP_NEUROSITY_DEVICEID;

    const [notion, setNotion] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    
    useEffect(() => {
        // it all starts with having a device id set
        // (you can save it in local storage after setting it once)
        if (deviceId) {
            const notion_instance = new Notion({ deviceId });
            setNotion(notion_instance);
        }

    }, [deviceId]);


    useEffect(() => {
        if (!notion) {
          return;
        }

        login()

        async function login(){
            const auth = await notion
            .login({
                email,
                password
            }).then(() => {
                alert("logged in to neurosity")
                setLoggedIn(true)
            }).catch((error) => {
                alert("failed to login")
            })

            if(auth) {
                setLoggedIn(true)
            }
        }

    }, [notion]);

    useEffect(() => {
        if(loggedIn) {
            // we can now show the user a button to start an experiment
        }
    }, [loggedIn])

    function getSignalQuality(){
        // live feed of signal quality
    }
    
    function genericExperiment(){
        // record raw data
    }
    
    return (
      <>
        <div id="sidebar">
            <img src={logo} className="App-logo" alt="logo" width={100} height={100} />

            <h1>neurofusion</h1>
            <p>..for the curious</p>
        </div>

        { loggedIn ? (
            <div id="signalquality">

            </div>
        ) :
            <></>
        }
        

        { loggedIn ? (
            <div id="record-experiment">
                <button onClick={genericExperiment}>Start a generic experiment</button>
            </div>
        ) : (
            <div>
                <p>You need to be logged in to record an experiment</p>
            </div>
        )}
        
      </>
    );
  }