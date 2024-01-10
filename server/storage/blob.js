const { BlobServiceClient } = require('@azure/storage-blob');


const getContainerClient = () => {
  const accountName = process.env.AZURE_STORAGE_RESOURCE_NAME;
  const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

  const blobService = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net/?${sasToken}`
  );
  const containerClient = blobService.getContainerClient(containerName);

  return containerClient;
};

const streamToBuffer = async (readableStream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
};

exports.uploadBlob = async (content, fileName, fileType, tags={}) => {
  if (!content || !fileName || !fileType) {
    throw new Error("Invalid arguments.");
  }

  const containerClient = getContainerClient();
  await containerClient.createIfNotExists({
    access: 'container',
  });

  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  const options = {
    blobHTTPHeaders: {
      blobContentType: fileType
    },
    tags
  };
  const response = await blockBlobClient.upload(content, content.length, options);

  return response.requestId;
};

/**
 * This return's a list of blob (path) for a given user guid, data name, and date range using the blob tags
 * @param guid - user's guid
 * @param startTimestamp - unix timestamp in milliseconds. inclusive
 * @param endTimestamp - unix timestamp in milliseconds. inclusive
 * @param provider - e.g magicflow, neurosity etc. optional
 * @param dataName - e.g focus, calm, apple, activitywatch etc. optional
 */
exports.findBlobs = async (guid, startTimestamp, endTimestamp, provider, dataName) => {
  if (!guid || !startTimestamp || !endTimestamp) {
    throw new Error("Invalid params");
  }

  const containerClient = getContainerClient();

  let query = `"guid" = '${guid}' AND "timestamp" >= '${startTimestamp}' AND "timestamp" <= '${endTimestamp}'`;

  if (provider) {
    query += ` AND "provider" = '${provider}'`;
  }

  if (dataName) {
    query += ` AND "dataName" = '${dataName}'`;
  }
  
  let results = [];
  const iter = containerClient.findBlobsByTags(query);
  let blobItem = await iter.next();

  while (!blobItem.done) {
    results.push(blobItem.value.name);
    blobItem = await iter.next();
  }

  return results;
};

exports.getBlobAsBuffer = async (blobName) => {
  const containerClient = getContainerClient();
  const blobClient = containerClient.getBlobClient(blobName);

  const response = await blobClient.download();
  return await streamToBuffer(response.readableStreamBody);
};