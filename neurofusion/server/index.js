const {Notion} = require("@neurosity/notion");
const express = require("express");
const dotenv = require('dotenv');
const cors = require('cors');
const cron = require('node-cron');

const storageController = require('./controllers/storage');
const userController = require('./controllers/user');
const magicFlowController = require('./controllers/magicflow');

const db = require('./models/index');

const magicFlowCron = require('./cron-jobs/magicflow-daily-fetch');

dotenv.config()

const app = express()
const port = process.env.PORT || 4000;

const notion = new Notion({
  autoSelectDevice: false
});

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


// TODO: configure trusted sources
app.use(cors());

// TODO: configure body parser (base64auth)

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
          "write:brainwaves",
          "read:kinesis",
          "write:kinesis",
          "read:status"
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
// TODO: needs to be properly tested
app.get('/api/neurosity/get-custom-token', (req, res) => {
  const userId = req.params.userId;

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
  
// TODO: store the token in the database
app.post('/api/neurosity/oauth-complete', (req, res) => {
})

/**
 * Magicflow Routes
 */
// TODO: set token - implementation
app.post('/api/magicflow/set-token', magicFlowController.setToken);

// TODO: fetch magicflow token - testing
app.get('/api/magicflow/get-token/:email', magicFlowController.fetchToken);


// TODO: post request to trigger updating magicflow data
app.post('/api/magicflow/update-data', (req, res) => {
  // parse userGuid & fetch for magicflow token for user

  // then call ../magicflow/index.js getTimeseriesData
});

app.post('/api/userlogin', userController.validateLogin);

/**
 * Storage Routes
 */
app.post('/api/storage/upload', storageController.uploadValidator, storageController.uploadBlob);

app.get('/api/storage/search', storageController.findValidator, storageController.findBlobs);

// Get blob content
app.get('/api/storage/get', storageController.getAndDownloadValidator, storageController.getBlob);

// Download blob content as file
app.get('/api/storage/download', storageController.getAndDownloadValidator, storageController.downloadBlob);

/**
 * Start server
 */
app.listen(port, async () => {
  console.log(`Neurofusion server listening on port ${port}`);

  await db.sequelize.authenticate();
  console.log('Database connected');

  // Schedule cron jobs after db is connected (for jobs that require db query)
  cron.schedule(magicFlowCron.expression, magicFlowCron.job);
});