const { Op } = require("sequelize");
const dayjs = require("dayjs");
const db = require("../models");
const { magicFlowQueue, storageQueue } = require("../queue");

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
    console.log(`MAGICFLOW_DAILY_FETCH: running on ${dayjs().toString()}`);

    const magicflowProvider = await db.Provider.findOne({
      where: { name: "Magicflow" },
    });

    if (!magicflowProvider) {
      console.log("Magicflow provider does not exist");
      return null;
    }

    const userProviders = await db.UserProvider.findAll({
      where: {
        providerGuid: magicflowProvider.guid,
        providerLastFetched: {
          [Op.or]: {
            [Op.lt]: dayjs().startOf("day"),
            [Op.eq]: null,
          },
        },
      },
    });
    console.log(
      `MAGICFLOW_DAILY_FETCH: updating magicflow data for ${users.length} users`
    );
    for (const userProvider of userProviders) {
      magicFlowQueue.push({
        guid: userProvider.userGuid,
        token: userProvider.providerToken,
        lastFetched: userProvider.providerLastFetched,
        storageQueue, // Importing this from magicflow processor wasn't working so passing the instance
      });
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  expression: CRON_EXPRESSION,
  job,
};
