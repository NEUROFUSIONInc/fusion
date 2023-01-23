import logo from '../assets/logo.png';
import dinodemo from '../assets/dinodemo.png';
import analysisdemo from '../assets/analysisdemo.png';
import '../App.css';

const logoStyle = {
    padding: '0 20px'
}


export default function LandingPage() {

    function redirectToLogin() {
        window.location.href = "/login";
    }
    
    return (
        <div class="container">

            <div class="landing">
                <div class="banner">
                    <div class="title">
                        <img src={logo} height={150} style={logoStyle} ></img>
                        <h1>NEUROFUSION</h1>
                    </div>
                    <p>Making your brain & behavior data accessible to you</p>
                </div>
                <div class="block">
                    <div class="body">
                        <h1 class="bodyTitle">
                            You focus on the fun part - exploring
                        </h1>
                        <p>We provide:</p>
                        <ul class="list">
                            <li>
                                A playground of experiments for collecting brain
                                data
                            </li>
                            <li>
                                Instant & interactive plots of recorded data:
                                <ul>
                                    <li>health</li>
                                    <li>productivity</li>
                                    <li>brain power</li>
                                    <li>self sample</li>
                                </ul>
                            </li>
                            <li>Run datasets against available models</li>
                            <li>Share your runs & results with others</li>
                        </ul>
                    </div>
                    <img
                        class="image"
                        src={dinodemo}
                    ></img>
                </div>
                <div class="block">
                    <img
                        class="image"
                        src={analysisdemo}
                    ></img>
                    <div class="body">
                        <h1 class="bodyTitle">
                            We enable community science
                        </h1>
                        <ul class="list">
                            <li>
                                Taking brain (EEG) & behavior research out of the
                                lab
                            </li>
                            <li>"Run trials on yourself"</li>
                            <li>
                                Design studies - a set of experiments - and exection flow
                            </li>
                            <li>Define methods that update study results as new data
                                is fetched!</li>
                            <li>
                            Members can opt-in and participate using hassle-free 
                            data collection & validation tools while maintaining ownership
                            of their data and providing consent for usage.
                            </li>
                        </ul>
                    </div>
                </div>

                <button class="button" onClick={redirectToLogin}>LOGIN</button>

                <div class="footer">
                    <h3>ore@usefusion.app</h3>
                    <h3>© NEUROFUSION Research Inc.</h3>
                </div>
            </div>
        </div>
    );
}

