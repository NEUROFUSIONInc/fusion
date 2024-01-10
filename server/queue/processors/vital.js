const dayjs = require("dayjs");
const { VitalClient } = require("@tryvital/vital-node");
const db = require("../../models");
require("dotenv").config();

const client = new VitalClient({
  api_key: process.env.VITAL_SECRET_KEY,
  environment: process.env.VITAL_ENVIRONMENT,
  region: "us",
});

const groupDataByDay = (arr) => {
  // Convert array to key/value for each day. Storage saves data for each day in separate files.
  const data = arr.reduce((r, val) => {
    const day = val.date ? val.date.split("T")[0] : val.timestamp.split("T")[0];
    r[day] = r[day] || [];
    r[day].push(val);
    return r;
  }, {});

  return data;
};


const getProviders = async (providerUserId) => {
  try {
    const res = await client.User.providers(providerUserId);
    const providers = res.providers.map(p => p.slug);

    return providers;
  } catch (err) {
    throw err;
  }
};

const updateSleepSummaryData = async (providerUserId, provider, startDate, endDate, guid, storageQueue) => {
  try {
    const res = await client.Sleep.getSleepWithStream(providerUserId, startDate, endDate, provider);
    const data = groupDataByDay(res.sleep);

    storageQueue.push({
      guid,
      provider,
      dataName: "sleep-summary",
      result: data,
    });
  } catch (err) {
    throw err;
  }
};

const updateSleepRawData = async (providerUserId, provider, startDate, endDate, guid, storageQueue) => {
  try {
    const res = await client.Sleep.get_raw(providerUserId, startDate, endDate, provider);
    const data = groupDataByDay(res.sleep);

    storageQueue.push({
      guid,
      provider,
      dataName: "sleep-raw",
      result: data,
    });
  } catch (err) {
    throw err;
  }
};

const updateActivitySummaryData = async (providerUserId, provider, startDate, endDate, guid, storageQueue) => {
  try {
    const res = await client.Activity.get(providerUserId, startDate, endDate, provider);
    const data = groupDataByDay(res.activity);

    storageQueue.push({
      guid,
      provider,
      dataName: "activity-summary",
      result: data,
    });
  } catch (err) {
    throw err;
  }
};

const updateActivityRawData = async (providerUserId, provider, startDate, endDate, guid, storageQueue) => {
  try {
    const res = await client.Activity.get_raw(providerUserId, startDate, endDate, provider);
    const data = groupDataByDay(res.activity);

    storageQueue.push({
      guid,
      provider,
      dataName: "activity-raw",
      result: data,
    });
  } catch (err) {
    throw err;
  }
};

const updateWorkoutsSummaryData = async (providerUserId, provider, startDate, endDate, guid, storageQueue) => {
  try {
    const res = await client.Workouts.get(providerUserId, startDate, endDate, provider);

    for (let i = 0; i < res.workouts.length; i++) {
      const stream = await client.Workouts.getStream(res.workouts[i].id);
      res.workouts[i].workouts_stream = stream;
    }

    const data = groupDataByDay(res.workouts);

    storageQueue.push({
      guid,
      provider,
      dataName: "workouts-summary",
      result: data,
    });
  } catch (err) {
    throw err;
  }
};

const updateWorkoutsRawData = async (providerUserId, provider, startDate, endDate, guid, storageQueue) => {
  try {
    const res = await client.Workouts.get_raw(providerUserId, startDate, endDate, provider);
    const data = groupDataByDay(res.workouts);

    storageQueue.push({
      guid,
      provider,
      dataName: "workouts-raw",
      result: data,
    });
  } catch (err) {
    throw err;
  }
};

const updateBodySummaryData = async (providerUserId, provider, startDate, endDate, guid, storageQueue) => {
  try {
    const res = await client.Body.get(providerUserId, startDate, endDate, provider);
    const data = groupDataByDay(res.body);

    storageQueue.push({
      guid,
      provider,
      dataName: "body-summary",
      result: data,
    });
  } catch (err) {
    throw err;
  }
};

const updateBodyRawData = async (providerUserId, provider, startDate, endDate, guid, storageQueue) => {
  try {
    const res = await client.Body.get_raw(providerUserId, startDate, endDate, provider);
    const data = groupDataByDay(res.body);

    storageQueue.push({
      guid,
      provider,
      dataName: "body-raw",
      result: data,
    });
  } catch (err) {
    throw err;
  }
};

const updateBloodOxygenData = async (providerUserId, provider, startDate, endDate, guid, storageQueue) => {
  try {
    const res = await client.Vitals.bloodOxygen(providerUserId, startDate, endDate, provider);
    const data = groupDataByDay(res);

    storageQueue.push({
      guid,
      provider,
      dataName: "blood-oxygen",
      result: data,
    });
  } catch (err) {
    throw err;
  }
};

const updateBloodPressureData = async (providerUserId, provider, startDate, endDate, guid, storageQueue) => {
  try {
    const res = await client.Vitals.bloodPressure(providerUserId, startDate, endDate, provider);
    const data = groupDataByDay(res);

    storageQueue.push({
      guid,
      provider,
      dataName: "blood-pressure",
      result: data,
    });
  } catch (err) {
    throw err;
  }
};

const updateHeartRateData = async (providerUserId, provider, startDate, endDate, guid, storageQueue) => {
  try {
    const res = await client.Vitals.heartrate(providerUserId, startDate, endDate, provider);
    const data = groupDataByDay(res);

    storageQueue.push({
      guid,
      provider,
      dataName: "heart-rate",
      result: data,
    });
  } catch (err) {
    throw err;
  }
};

const queueProcessor = async ({guid, providerUserId, lastFetched, storageQueue}) =>  {
  console.log(`VITAL_PROCESSOR: Processing ${guid}. Last sync ${lastFetched}`);

  if (!guid || !providerUserId || !storageQueue) {
    console.error("VITAL_PROCESSOR: Invalid payload");
    return;
  }

  const startDate = lastFetched ? dayjs(lastFetched).toDate() : dayjs().subtract(2, 'week').toDate();

  // timeseries data are limited to 7 days
  const timeSeriesStartDate = lastFetched ? dayjs(lastFetched).toDate() : dayjs().subtract(1, 'week').toDate();
  const endDate = dayjs().toDate();

  try {
    const providers = await getProviders(providerUserId);

    await Promise.allSettled(
      providers.map(provider => {
        [
          updateSleepSummaryData(providerUserId, provider, startDate, endDate, guid, storageQueue),
          updateSleepRawData(providerUserId, provider, startDate, endDate, guid, storageQueue),
          updateActivitySummaryData(providerUserId, provider, startDate, endDate, guid, storageQueue),
          updateActivityRawData(providerUserId, provider, startDate, endDate, guid, storageQueue),
          updateWorkoutsSummaryData(providerUserId, provider, startDate, endDate, guid, storageQueue),
          updateWorkoutsRawData(providerUserId, provider, startDate, endDate, guid, storageQueue),
          updateBodySummaryData(providerUserId, provider, startDate, endDate, guid, storageQueue),
          updateBodyRawData(providerUserId, provider, startDate, endDate, guid, storageQueue),
          updateBloodOxygenData(providerUserId, provider, timeSeriesStartDate, endDate, guid, storageQueue),
          updateBloodPressureData(providerUserId, provider, timeSeriesStartDate, endDate, guid, storageQueue),
          updateHeartRateData(providerUserId, provider, timeSeriesStartDate, endDate, guid, storageQueue),
        ]
      })
    );

    await db.UserProvider.update({ providerLastFetched: endDate }, {
      where: {
        userGuid: guid,
        providerUserId,
      },
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = queueProcessor;