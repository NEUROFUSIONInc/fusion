const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cron = require("node-cron");

// import db
const db = require("./models/index");

// import controllers
const userController = require("./controllers/user");
const storageController = require("./controllers/storage");
const magicFlowController = require("./controllers/magicflow");
const neurosityController = require("./controllers/neurosity");
// const vitalController = require("./controllers/vital");
const insightController = require("./controllers/insight");
const questController = require("./controllers/quest");
const mailController = require("./controllers/mailer");

// import cron runners
const magicFlowCron = require("./cron-jobs/magicflow-daily-fetch");
// const vitalCron = require("./cron-jobs/vital-daily-fetch");

// create express app
const app = express();
const port = process.env.PORT || 4000;

// config parsing application/json
app.use(
  express.json({
    limit: "1000mb",
  })
);

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// TODO: configure trusted sources
app.use(cors());

/**
 * User Routes
 */
app.post("/api/nostrlogin", userController.validateNostrLogin);

app.post("/api/sendContactEmail", mailController.sendContactEmail);

// All routes after this require an authorization token
app.use(userController.tokenValidator);

// TODO: endpoint to get providers user is connected to

/**
 * Neurosity Routes
 */
//  generate oauth url
app.get("/api/neurosity/get-oauth-url", neurosityController.generateOAuthURL);

// get custom token for signed in user given neurosity id
app.get("/api/neurosity/get-custom-token", neurosityController.getOAuthToken);

/**
 * Magicflow Routes
 */
app.post("/api/magicflow/set-token", magicFlowController.setToken);

app.get("/api/magicflow/get-token", magicFlowController.fetchToken);

/**
 * Vital Routes
 */
// app.get("/api/vital/get-token", vitalController.generateToken);

// app.get("/api/vital/get-devices", vitalController.getDevices);

/**
 * Storage Routes
 */
app.post(
  "/api/storage/upload",
  storageController.uploadValidator,
  storageController.uploadBlob
);

app.get(
  "/api/storage/search",
  storageController.findValidator,
  storageController.findBlobs
);

// Get blob content
app.get(
  "/api/storage/get",
  storageController.getAndDownloadValidator,
  storageController.getBlob
);

// Download blob content as file
app.get(
  "/api/storage/download",
  storageController.getAndDownloadValidator,
  storageController.downloadBlob
);

/**
 * Language Model Calls
 */
app.post("/api/getpromptsummary", insightController.getPromptSummary);

app.post("/api/getpromptsummary/v2", insightController.getPromptSummaryV2);

app.post("/api/getpromptsuggestions", insightController.getPromptSuggestions);

/**
 * Get the latest version
 */

/**
 * Quest Calls
 */
app.post("/api/quest", questController.saveQuest);
app.get("/api/quests", questController.getCreatorQuests);
app.get("/api/quest/getByCode", questController.getQuestByCode);
app.post("/api/quest/edit", questController.editQuest);
app.post("/api/quest/join", questController.joinQuest);
app.get(
  "/api/quest/userSubscription",
  questController.getUserQuestSubscription
);
app.get("/api/quest/subscribers", questController.getQuestSubscribers);

/**
 * Start server
 */
app.listen(port, async () => {
  console.log(`Neurofusion server listening on port ${port}`);

  await db.sequelize.authenticate();
  console.log("Database connected");

  // Schedule cron jobs after db is connected (for jobs that require db query)
  cron.schedule(magicFlowCron.expression, magicFlowCron.job);
  // cron.schedule(vitalCron.expression, vitalCron.job);
});
