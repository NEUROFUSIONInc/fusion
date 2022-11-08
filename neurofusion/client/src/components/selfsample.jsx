import React, { useState, useEffect } from 'react';


export default function SelfSample() {

    const [selfSampleHistory, setSelfSampleHistory] = useState([]); // [{unixTimestamp, text}, ...]
    const [sampleText, setSampleText] = useState("");

    useEffect(() => {
        // get data from local storage
        let selfSampleHistory = JSON.parse(localStorage.getItem("selfSampleHistory"));
        if (selfSampleHistory) {
            setSelfSampleHistory(selfSampleHistory);
        }
    }, []);

    const saveSelfSampleEntry = () => {
        // get the current unix timestamp
        let entryTimestamp = Math.floor(Date.now() / 1000);
        
        const sampleEntry = {
            "unixTimestamp": entryTimestamp,
            "text": sampleText
        }

        const latestSelfSampleHistory = [...selfSampleHistory, sampleEntry];
        setSelfSampleHistory(latestSelfSampleHistory);

        // add the entry to the history
        const historyString = JSON.stringify(latestSelfSampleHistory)
        localStorage.setItem('selfSampleHistory', historyString);
    }

    const handleSampleTextChange = (event) => {
        setSampleText(event.target.value);
    }

    let selfSampleHistoryStyle = {height: '200px', overflowY: 'auto'}

    return (
        <div id="self-sampling" >
            <h2>Self-sampling</h2>
            <p>Self-sampling gives a verbose description of what you're doing now.</p>
            <p>Enter a text below so we can reference & tie recordings to during analysis.</p>
            
            <label htmlFor='self_sample_text'>Entry:</label>
            <textarea 
                id="self_sample_text"
                value={sampleText}
                onChange={handleSampleTextChange}
                placeholder="e.g I'm listening to music"
            ></textarea>
            <button id="self_sample_button" onClick={saveSelfSampleEntry}>Save Entry</button>

            <div>
                <p>See recent entries below:</p>

                <div style={selfSampleHistoryStyle}>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Text</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                        {selfSampleHistory.map((entry, index) => {
                            return (
                                <tr key={index}>
                                    <td>{new Date(parseInt(entry.unixTimestamp)*1000).toUTCString()}</td>
                                    <td>{entry.text}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                
                </div>
            </div>
        </div>
    )
}


            
