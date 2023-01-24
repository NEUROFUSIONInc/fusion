const {Notion} = require("@neurosity/notion");
const express = require("express");
const dotenv = require('dotenv');
const cors = require('cors');

const storageController = require('./controllers/storage');
const userController = require('./controllers/user');

const db = require('./models/index');


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
app.post('/api/magicflow/set-token', (req, res) => {
  // store token in db
  // check if data exists & fetch from magicflow
})

// TODO: fetch magicflow token - testing
app.get('/api/magicflow/get-token', (req, res) => {
  console.log(req.params);
  if (!req.params.userEmail) {
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
          userGuid: userMetadata.userGuid,
          magicflowToken: userMetadata.magicflowToken
        }
      });
    }
  })();
})


// TODO: post request to trigger updating magicflow data
app.post('/api/magicflow/update-data', (req, res) => {
  // parse userGuid & fetch for magicflow token for user

  // then call ../magicflow/index.js getTimeseriesData
});

app.post('/api/userlogin', userController.validateLogin);

/**
 * Storage Routes
 */
app.post('/api/storage/upload', storageController.uploadBlob);

app.get('/api/storage/search', storageController.findBlobs);

// Get blob content
app.get('/api/storage/get', storageController.getBlob);

// Download blob content as file
app.get('/api/storage/download', storageController.downloadBlob);

/**
 * Start server
 */
app.listen(port, () => {
  console.log(`Neurofusion server listening on port ${port}`)

  db.sequelize.authenticate().then(async () => {
    console.log('Database connected');
  });
});