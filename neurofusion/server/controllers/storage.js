const stream = require('stream');
const { body, query, validationResult } = require('express-validator');
const blobStorage = require('../storage/blob');


exports.uploadValidator = [
  body("userGuid").notEmpty().isUUID().withMessage("must be a uuid"),
  body("provider").notEmpty().withMessage("must not be empty"),
  body("dataName").notEmpty().withMessage("must not be empty"),
  body("fileTimestamp").notEmpty().isNumeric().withMessage("must be a timestamp"),
  body("content").notEmpty().withMessage("must not be empty")
];

exports.uploadBlob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400)
      .json({
        errors: errors.array()
      });
  }

  const dataName = req.body.dataName;
  const fileTimestamp = req.body.fileTimestamp;
  const content = req.body.content;
  const userGuid = req.body.userGuid;
  const provider = req.body.provider;

  const fileName = `${userGuid}/${provider}/${fileTimestamp}-${dataName}.json`;
  const fileType = "application/json";
  const tags = {
    "guid": userGuid,
    "provider": provider,
    "dataName": dataName,
    "timestamp": `${fileTimestamp}`
  };

  try {
    const requestId = await blobStorage.uploadBlob(JSON.stringify(content), fileName, fileType, tags);
    console.log(`Upload complete: ${requestId}`);

    res.status(200).json({
      fileName,
      fileType
    });
  } catch (err) {
    console.error(err);
    res.status(400)
      .send("Unable to upload file");
  }
};

exports.findValidator = [
  query("userGuid")
    .notEmpty()
    .isUUID()
    .withMessage("must be a uuid"),
  query("startTimestamp")
    .notEmpty()
    .isNumeric()
    .withMessage("must be a timestamp"),
  query("endTimestamp")
    .notEmpty()
    .isNumeric()
    .withMessage("must be a timestamp"),
  // Optional params - either provide a valid value or don't add it
  query("provider")
    .notEmpty()
    .optional({ nullable: false })
    .withMessage("must not be empty if provided. optional param"),
  query("dataName")
    .notEmpty()
    .optional({ nullable: false })
    .withMessage("must not be empty if provided. optional param")
];

exports.findBlobs = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400)
      .json({
        errors: errors.array()
      });
  }

  const dataName = req.query.dataName;
  const provider = req.query.provider;
  const userGuid = req.query.userGuid;
  const startTimestamp = req.query.startTimestamp;
  const endTimestamp = req.query.endTimestamp;

  try {
    const blobNames = await blobStorage.findBlobs(userGuid, startTimestamp, endTimestamp, provider, dataName);
    res.status(200)
      .json({ blobNames });
  } catch (err) {
    console.error(err);
    res.status(400)
      .send("Unable to search blobs");
  }
};

exports.getAndDownloadValidator = [
  query("blobName")
    .notEmpty()
    .withMessage("must not be empty")
];

exports.getBlob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400)
      .json({
        errors: errors.array()
      });
  }

  const blobName = req.query.blobName;

  try {
    const buffer = await blobStorage.getBlobAsBuffer(blobName);

    res.status(200)
      .set("Content-Type", "application/json")
      .send(buffer);
  } catch (err) {
    console.error(err);
    res.status(400)
      .send("Unable to view blob");
  }
};

exports.downloadBlob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400)
      .json({
        errors: errors.array()
      });
  }

  const blobName = req.query.blobName;

  try {
    const buffer = await blobStorage.getBlobAsBuffer(blobName);
    const filePaths = blobName.split("/");
    const fileName = filePaths[filePaths.length - 1];

    const readStream = new stream.PassThrough();
    readStream.end(buffer);

    res.set({
      "Content-Disposition": `attachment; filename=${fileName}`,
      "Content-Type": "application/json"
    });

    readStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(400)
      .send("Unable to download blob");
  }
};