import logo from '../assets/logo.png';
import React, { useState, useEffect } from 'react';

import { notion, useNotion } from "../services/neurosity";

export default function Root() {

    const { user, lastSelectedDeviceId, setSelectedDevice } = useNotion();
    const email = "oreogundipe@gmail.com"
    const password = "#pJ4NDTNOL7L"
    useEffect(() => {
        login()

        async function login() {
            await notion
            .login({
                email,
                password
            }).then(() => {
                alert("logged in to neurosity")
            })
        }
    }, [
        lastSelectedDeviceId,
        setSelectedDevice
    ])
    
    return (
      <>
        <div id="sidebar">
            <img src={logo} className="App-logo" alt="logo" width={100} height={100} />

            <h1>neurofusion</h1>
            <p>..for the curious</p>
        </div>

        <div id="signalquality">

        </div>

        <div id="record-experiment">

        </div>
      </>
    );
  }