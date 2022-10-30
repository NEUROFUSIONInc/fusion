import React, { useState, useEffect } from "react";

const Timer = ({ delayResend = "180" }) => {
  const [delay, setDelay] = useState(+delayResend);
  const [minutes, setMinutes] = useState(Math.floor(delay / 60));
  const [seconds, setSeconds] = useState(Math.floor(delay % 60));
  
  useEffect(() => {
    const timer = setInterval(() => {
        setDelay(delay - 1);
        setMinutes(Math.floor(delay / 60));
        setSeconds(Math.floor(delay % 60));

        if (delay === 0 || delay <= 0) {
            clearInterval(timer);
        }
    }, 1000);

    
    if (delay === 0) {
        clearInterval(timer);
        setMinutes(Math.floor(delay / 60));
        setSeconds(Math.floor(delay % 60));
    }
    return () => {
      clearInterval(timer);
    };
  }, [delay, delayResend]);

  return (
    <>
      <span>
        {minutes} min :{seconds} secs
      </span>
    </>
  );
};

export default Timer;