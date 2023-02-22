import logo from "../assets/logo.png";
import analysisdemo from "../assets/analysisdemo_day.png";
import "../App.css";

import fusionMobileDemo from "../assets/fusionmobile_demo.png";

const logoStyle = {};

const imageStyle = {
  width: "100%",
};

export default function LandingPage() {
  function redirectToLogin() {
    window.location.href = "/login";
  }

  return (
    <div class="container">
      <div class="landing">
        <div class="banner">
          <div class="title">
            <img src={logo} height={100} style={logoStyle}></img>
            <h1 style={{ paddingLeft: "10px" }}>FUSION</h1>
          </div>
          <p>Making your health & behavior data accessible to you</p>
        </div>
        <div class="block">
          <div style={{ width: "100vw" }}>
            <img
              class="image"
              src={analysisdemo}
              style={{ width: "100%" }}
            ></img>
          </div>
        </div>

        <button className="button" type="button" onClick={redirectToLogin}>
          LOGIN
        </button>

        <div class="block">
          <div class="body">
            <h1 class="bodyTitle">You focus on the fun part - exploring</h1>
            <p>We provide:</p>
            <ul class="list">
              <li>
                A playground of exercises for recording brain & behavior data
              </li>
              <li>
                See how your health, productivity, brain power, behavior
                (activities) change over time
              </li>
              <li>
                Run your data with available models & share your results with
                others!
              </li>
            </ul>
          </div>
          <div class="body">
            <h1 class="bodyTitle">Your lab on the go!</h1>
            <ul class="list">
              <li>Design quests, a set of tasks and their exection flow</li>
              <li>
                Define methods that update study results as new data is fetched!
              </li>
              <li>
                Members can opt-in and provide informed consent to participate
                in shared studies via the platform.
              </li>
            </ul>
          </div>
        </div>

        {/* here we talk about all the different data sources */}
        <div class="block">
          {/* <h3>Logging Events</h3> */}
          <p
            style={{
              fontSize: "20px",
            }}
          >
            Create personalized prompts that help you observe your behavioral
            patterns over time!
          </p>
        </div>
        <div class="block">
          <img src={fusionMobileDemo} style={imageStyle}></img>
        </div>

        <div class="block">
          <h3>How is data stored & processed?</h3>
          <ul>
            <li>
              We anonymize data by default (i.e data sources connected on fusion
              will never be stored with your name, email, or phone number)
            </li>
            <li>
              When you connect a data source, we store the data in an Azure Blob
              Storage container with a random identifier
            </li>
            <li>Your data is encrypted while in transit and at rest.</li>
          </ul>
        </div>

        <div class="footer">
          <h3>ore@usefusion.app</h3>
          <h3>© NEUROFUSION Research Inc.</h3>
        </div>
      </div>
    </div>
  );
}
