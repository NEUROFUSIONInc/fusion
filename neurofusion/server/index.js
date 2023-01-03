import { Notion } from "@neurosity/notion";
import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config()

const app = express()
const port = process.env.PORT || 4000;

const notion = new Notion({
  autoSelectDevice: false
});

// TODO: configure trusted sources
app.use(cors());

//  generate oauth url
app.get('/api/get-neurosity-oauth-url', (req, res) => {
  async function getOAuth() {
    await notion
    .createOAuthURL({
      clientId: process.env.NEUROSITY_OAUTH_CLIENT_ID,
      clientSecret: process.env.NEUROSITY_OAUTH_CLIENT_SECRET,
      redirectUri: process.env.NEUROSITY_OAUTH_CLIENT_REDIRECT_URI,
      responseType: "token",
      state: Math.random().toString().split(".")[1], // A random string is required for security reasons
      scope: [
        "read:accelerometer",
        "read:brainwaves",
        "read:calm",
        "read:devices-info",
        "read:devices-status",
        "read:focus",
        "read:memories:brainwaves",
        "read:signal-quality",
        "write:brainwave-markers",
        "write:brainwaves"
      ]

    })
    .then((url) => (
      res.status(200).json({
        statusCode: 200,
        body: {
          url: url
        }
      }
    )))
    .catch((error) => (
      res.status(400).json({
        body: error.response.data
      }
    )));
  }

  getOAuth();
})

// get custom token given neurosity id
app.get('/api/get-neurosity-token', (req, res) => {

  const userId = req.body.userId;

  async function getToken() {
    await notion
    .getOAuthToken({
      clientId: process.env.NEUROSITY_OAUTH_CLIENT_ID,
      clientSecret: process.env.NEUROSITY_OAUTH_CLIENT_SECRET,
      userId
    })
    .then((url) => (
      res.status(200).json({
        statusCode: 200,
        body: {
          url: url
        }
      }
    )))
    .catch((error) => (
      res.status(400).json({
        body: error.response.data
      }
    )));
  }

  getToken();
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})