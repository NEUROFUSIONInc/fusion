const dayjs = require("dayjs");
const dotenv = require("dotenv");
const blobStorage = require("../../storage/blob");

dotenv.config();

const writeData = async (guid, provider, dataName, timestamp, content) => {
  const fileName = `${guid}/${provider}/${dataName}_${timestamp}.json`;
  const fileType = "application/json";
  const tags = {
    guid: guid,
    provider: provider,
    dataName: dataName,
    timestamp: `${timestamp}`,
  };

  try {
    const requestId = await blobStorage.uploadBlob(
      JSON.stringify(content),
      fileName,
      fileType,
      tags
    );
    console.log(`Upload complete: ${requestId}`);
  } catch (err) {
    console.error(err);
  }
};

const storageProcessor = async ({ guid, provider, dataName, result }) => {
  console.log(
    `STORAGE_PROCESSOR: Processing ${guid}; ${provider}; ${dataName}`
  );
  if (!guid || !provider || !dataName) {
    console.error("STORAGE_PROCESSOR: invalid payload");
    return;
  }

  if (!result) {
    console.log("STORAGE_PROCESSOR: no data to write");
    return;
  }

  // Expects result to be an object of date -> content mapping
  try {
    await Promise.allSettled(
      Object.entries(result).map(([date, content]) =>
        writeData(guid, provider, dataName, dayjs(date).unix(), content)
      )
    );
  } catch (err) {
    console.error(err);
  }
};

module.exports = storageProcessor;
