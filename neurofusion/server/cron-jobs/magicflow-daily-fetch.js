const { Op } = require("sequelize");
const dayjs = require('dayjs');
const db = require('../models');

const { magicFlowQueue, storageQueue } = require('../queue');

/**
 *  ┌────────────── second (optional)
 *  │ ┌──────────── minute
 *  │ │ ┌────────── hour
 *  │ │ │ ┌──────── day of month
 *  │ │ │ │ ┌────── month
 *  │ │ │ │ │ ┌──── day of week
 *  │ │ │ │ │ │
 *  │ │ │ │ │ │
 *  * * * * * *
 */
const CRON_EXPRESSION = "0 0 0 * * *"; // 12:00 AM every day

const job = async () => {
  console.log(`MAGICFLOW_DAILY_FETCH: running on ${dayjs().toString()}`);
  const users = await db.UserMetadata.findAll({
    where: {
      magicflowToken: {
        [Op.not]: null
      },
      magicflowLastFetched: {
        [Op.or]: {
          [Op.lt]: dayjs().startOf('day'),
          [Op.eq]: null
        }
      }
    }
  });
  console.log(`MAGICFLOW_DAILY_FETCH: updating magicflow data for ${users.length} users`);
  for (const user of users) {
    magicFlowQueue.push({
      guid: user.userGuid,
      token: user.magicflowToken,
      lastFetched: user.magicflowLastFetched,
      storageQueue // Importing this from magicflow processor wasn't working so passing the instance
    });
  }
};


module.exports = {
  expression: CRON_EXPRESSION,
  job
};