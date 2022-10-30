import React, { useState, useEffect, startTransition } from 'react';

export default function Experiment(
    // name,
    // text,
    // notion,
    // duration, // in seconds
        props
    ) {
    
    function startRecording() {
        // record raw data
        alert("starting recording")
        // invoke all te subscriptions 

        // download as csv when time is up
    }

    function validateDuration() {
        
    }

    return (
        <>
            <h3>{props.name}</h3>
            <p>{props.text}</p>

            Recording time in minutes : 
            <input type="number" value={props.duration} placeholder="2" onChange={validateDuration}></input>
            
            <p>Time left: </p>
            {/* remaining time displated */}
            <button onClick={startRecording}>Start Recording</button>

        </>
    )
}