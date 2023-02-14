const dayjs = require("dayjs");
const db = require("../../models");
const getTimeSeries = require("../../magicflow/utils");

const SOURCES = ["activitywatch", "apple"];

/**
 * This returns a monthly date range between the two dates.
 * The start date represents the start of the month and the end date represents the end of the month
 * For the current month, current date is used as the end date to prevent trying to fetch data for a future date
 */
const getDateRange = (startDate, endDate) => {
  startDate = dayjs(startDate).startOf("month");
  endDate = dayjs(endDate);

  if (endDate.isBefore(startDate)) {
    throw Error("End date should be greater than start date");
  }

  let results = [];

  let currentDate = startDate;
  while (currentDate.isBefore(endDate)) {
    results.push({
      start: currentDate.format("YYYY-MM-DD"),
      end: currentDate.isSame(endDate, "month")
        ? endDate.format("YYYY-MM-DD")
        : currentDate.endOf("month").format("YYYY-MM-DD"),
    });
    currentDate = currentDate.add(1, "month");
  }

  return results;
};

const updateMagicflowData = async (
  guid,
  source,
  token,
  start,
  end,
  storageQueue
) => {
  let rangeOptions = {
    range: {
      start,
      end,
    },
  };

  try {
    const result = await getTimeSeries(source, rangeOptions, token);
    storageQueue.push({
      guid,
      provider: "magicflow",
      dataName: source,
      result,
    });
  } catch (err) {
    console.error(err);
  }
};

const queueProcessor = async ({ guid, token, lastFetched, storageQueue }) => {
  console.log(
    `MAGICFLOW_PROCESSOR: Processing ${guid}. Last sync ${lastFetched}`
  );
  if (!guid || !token || !storageQueue) {
    console.error("MAGICFLOW_PROCESSOR: Invalid payload");
    return;
  }

  // If this is the first time fetching magicflow data for user, get 1 year data
  let startDate = null;
  if (!lastFetched) {
    startDate = dayjs().subtract(1, "year");
  } else {
    startDate = dayjs(lastFetched);
  }

  let endDate = dayjs();
  const months = getDateRange(startDate, endDate);

  try {
    await Promise.allSettled(
      months.flatMap((month) =>
        SOURCES.map((source) =>
          updateMagicflowData(
            guid,
            source,
            token,
            month.start,
            month.end,
            storageQueue
          )
        )
      )
    );
    // This will always update the last fetched even if writing to the blob store fails
    const magicflowProvider = await db.Provider.findOne({
      where: {
        name: "Magicflow",
      },
    });

    if (!magicflowProvider) {
      throw new Error("MAGICFLOW_PROCESSOR: Magicflow provider not found");
    }

    const userProvider = await db.UserProvider.findOne({
      where: {
        userGuid: guid,
        providerGuid: magicflowProvider.guid,
      },
    });

    userProvider.providerLastFetched = dayjs();
    await userProvider.save();
  } catch (err) {
    console.error(err);
  }
};

module.exports = queueProcessor;
