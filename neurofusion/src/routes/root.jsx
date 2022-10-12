import logo from '../assets/logo.png';

export default function Root() {
    return (
      <>
        <div id="sidebar">
            <img src={logo} className="App-logo" alt="logo" width={100} height={100} />

            <h1>neurofusion</h1>
            <p>..for the curious</p>
        </div>

        <div id="signalquality">
            
        </div>
      </>
    );
  }