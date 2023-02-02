const fastq = require('fastq');
const magicFlowProcessor = require('./processors/magicflow');
const storageProcessor = require('./processors/storage');


/**
 * This uses an in-memory queue for background processing and the queue items will be lost if the server crashes.
 * This needs to be replaced in the future with a redis-backed queue or cloud-based queue systems
 */
const magicFlowQueue = fastq.promise(magicFlowProcessor, 1);
const storageQueue = fastq.promise(storageProcessor, 1);

module.exports = {
  magicFlowQueue,
  storageQueue
};