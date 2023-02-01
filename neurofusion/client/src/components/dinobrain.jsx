import React from "react";
import Runner from "../utils/dinorunner";


export function DinoBrain() {

    /**
     * Two modes to playing the game
     *   - raw event json timestamps will also be uploaded to neurofusion
     *   - also begin recording raw brainwaves & all other neurosity data points
     *   - marker will be logged on key press also for the trigger
     *        - sent to neurosity for kinesis api
     *        - sent to neurofusion for raw event json timestamps
     * 
     * during training...keyboard input will be passed to the game
     * 
     * during testing .. 
     *    - make call to neurosity kinesis api to subscribe for the event
     *    - be sure to mention in th log that the data is coming from predicted timestamp of
     *     keypress (keeping this to do some analysis & maybe auto training later)
     * 
     * 
     * when you come back ..
     *   Runner.loadImages is called for initialization of the view
     *   
     *  variables that would be userful
     *  - Runner.keycodes.JUMP
     *  - Runner.keycodes.DUCK
     *  - Runner.keycodes.RESTART
     * 
     *  It's the .handleEvent() method that is called when a key is pressed.
     *  * how important is it that the timestamps are collected here vs deeper??
     * 
     * It may be easier to just have a seperate function that does event logging without
     * altering the original dino game source code!
     */
    return (
        <div>
            <h1>Dino brain!</h1>
        </div>
    )
}