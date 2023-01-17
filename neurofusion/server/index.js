import { Notion } from "@neurosity/notion";
import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import UserMetadata from './db.js';
dotenv.config()

const app = express()
const port = process.env.PORT || 4000;

const notion = new Notion({
  autoSelectDevice: false
});

// TODO: configure trusted sources
app.use(cors());

/**
 * Neurosity Routes
 */
//  generate oauth url
app.get('/api/neurosity/get-oauth-url', (req, res) => {
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
app.get('/api/neurosity/get-custom-token', (req, res) => {
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

app.post('/api/neurosity/oauth-complete', (req, res) => {
  // TODO: store the token in the database
})

/**
 * Magicflow Routes
 */
app.get('/api/magicflow/get-token', (req, res) => {
  console.log(req.params);
  if(!req.params.userEmail) {
    res.status(401).json({
      body: {
        error: "user email not provided"
      }
    });
    return;
  }

  (async () => {
    const userMetadata = await UserMetadata.findOne({ where: { userEmail: req.params.userEmail } });
    if (userMetadata === null) {
      console.log('Not found!');
      res.status(401).json({
        body: {
          error: "user does not exist"
        }
      });
    } else {
      console.log(userMetadata instanceof UserMetadata); // true
      console.log(userMetadata.userEmail); // 'oreogundipe@gmail.com'
      res.status(200).json({
        statusCode: 200,
        body: {
          userGuid: userMetadata.userGuid
        }
      });
    }
  })();
})

app.post('/api/magicflow/set-token', (req, res) => {
  // store token in db
  // check if data exists & fetch from magicflow
})

app.listen(port, () => {
  console.log(`Neurofusion server listening on port ${port}`)
})