const { Op, literal, fn, col } = require("sequelize");
const dayjs = require('dayjs');
const db = require('../models');

const { vitalQueue, storageQueue } = require('../queue');

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
  try {
    console.log(`VITAL_DAILY_FETCH: running on ${dayjs().toString()}`);

    /**
     * SELECT userGuid, providerUserId, min(providerLastFetched) AS lastFetched
     * FROM userproviders
     * WHERE providerGuid IN (SELECT guid FROM providers WHERE type = "vital")
     * GROUP BY userGuid, providerUserId;
     */
    const users = await db.UserProvider.findAll({
      attributes: [
        'userGuid',
        'providerUserId',
        [fn('MIN', col('providerLastFetched')), 'lastFetched']
      ],
      where: {
        providerGuid: {
          [Op.in]: literal(`(SELECT guid FROM providers WHERE type = "vital")`)
        }
      },
      group: ['userGuid', 'providerUserId']
    });

    console.log(`VITAL_DAILY_FETCH: updating vital data for ${users.length} users`);

    for (const user of users) {
      vitalQueue.push({
        guid: user.userGuid,
        providerUserId: user.providerUserId,
        lastFetched: user.dataValues.lastFetched, // custom column can't be accessed directly
        storageQueue
      });
    }
  } catch (err) {
    console.error(err);
  }
};


module.exports = {
  expression: CRON_EXPRESSION,
  job
};