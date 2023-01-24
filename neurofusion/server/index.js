const {Notion} = require("@neurosity/notion");
const express = require("express");
const dotenv = require('dotenv');
const cors = require('cors');
const { Magic } = require('@magic-sdk/admin');

const storageController = require('./controllers/storage');

const { sequelize, UserMetadata } = require('./db.js');
dotenv.config()

const app = express()
const port = process.env.PORT || 4000;

const notion = new Notion({
  autoSelectDevice: false
});

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/* 1. Setup Magic Admin SDK */
const magic = new Magic(process.env.MAGICLINK_SECRET_KEY);

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

// TODO: needs testing
app.post('/api/userlogin', async (req, res) => {
  if (!req.body.userEmail || !req.body.magicLinkAuthToken) {
    res.status(401).json({
      body: {
        error: "user email or magic link auth token not provided"
      }
    });
    return;
  }

  // call magiclink to validate user is loggedIn
  const magicLinkUser = await magic.users.getMetadataByToken(req.body.magicLinkAuthToken);
  if (!magicLinkUser) {
    res.status(401).json({
      body: {
        error: "user is not logged in"
      }
    });
    return;
  }

  // fetch user if exists else create user
  UserMetadata.findOne({
    where: {
      userEmail: magicLinkUser.email
    }
  }).then(result => {
    console.log(result);
    // TODO: validate results
    
    // check if user exists
    // return user guid
    res.status(200).json({
      statusCode: 200,
      body: {
        userGuid: result.userGuid,
        magicLinkAuthToken: result.magicLinkAuthToken,
        magicflowToken: result.magicflowToken,
        neurosityToken: result.neurosityToken
      }
    });
    // if not, create user
  }).catch(error => {
    console.log(error);
    res.status(400).json({
      body: error.response.data
    });
  });
})

// TODO: storage, generate upload token
app.get('/api/get-upload-token', (req, res) => {

});

app.post('/api/storage/upload', storageController.uploadBlob);

app.get('/api/storage/search', storageController.findBlobs);

// Get blob content
app.get('/api/storage/get', storageController.getBlob);

// Download blob content as file
app.get('/api/storage/download', storageController.downloadBlob);

app.listen(port, () => {
  console.log(`Neurofusion server listening on port ${port}`)

  sequelize.authenticate().then(async () => {
    console.log('Database connected');
    sequelize.sync();
  });
});