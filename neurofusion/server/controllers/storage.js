const stream = require('stream');
const blobStorage = require('../storage/blob');


exports.uploadBlob = async (req, res) => {
  const dataName = req.body.dataName;
  const fileTimestamp = req.body.fileTimestamp;
  const content = req.body.content;
  const userGuid = req.body.userGuid;

  if (!dataName || !fileTimestamp || !content || !userGuid) {
    return res.status(401)
      .send("Invalid payload");
  }

  const fileName = `${userGuid}/${fileTimestamp}-${dataName}.json`;
  const fileType = "application/json";
  const tags = {
    "guid": userGuid,
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

exports.findBlobs = async (req, res) => {
  const dataName = req.query.dataName;
  const userGuid = req.query.userGuid;
  const startTimestamp = req.query.startTimestamp;
  const endTimestamp = req.query.endTimestamp;

  if (!dataName || !userGuid || !startTimestamp || !endTimestamp) {
    return res.status(401)
      .send("Invalid payload");
  }

  try {
    const blobNames = await blobStorage.findBlobs(userGuid, dataName, startTimestamp, endTimestamp);
    res.status(200)
      .json({ blobNames });
  } catch (err) {
    console.error(err);
    res.status(400)
      .send("Unable to search blobs");
  }
};

exports.getBlob = async (req, res) => {
  const blobName = req.query.blobName;

  if (!blobName) {
    return res.status(401)
      .send("Invalid payload");
  }

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
  const blobName = req.query.blobName;

  if (!blobName) {
    return res.status(401)
      .send("Invalid payload");
  }

  try {
    const buffer = await blobStorage.getBlobAsBuffer(blobName);
    const fileName = blobName.split("/")[1];

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