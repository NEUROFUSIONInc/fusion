/**
 * Module for interacting with health related data from Vital https://tryvital.io/
 *
 */
const { VitalClient } = require("@tryvital/vital-node");
const axios = require("axios");
require("dotenv").config();

const db = require("../models/index");

const client = new VitalClient({
  api_key: process.env.VITAL_SECRET_KEY,
  environment: process.env.VITAL_ENVIRONMENT,
  region: "us",
});

exports.generateToken = async (req, res) => {
  // fetch or create vital user if one does not exist in the database
  const provider = await db.Provider.findOne({
    where: {
      name: "Oura",
    },
  });

  if (!provider) {
    return res.status(400).json({
      error: "Vital provider not found",
    });
  }

  // find userProvider record for vital
  const [userProvider, _] = await db.UserProvider.findOrCreate({
    where: {
      userGuid: req.user.userGuid,
      providerGuid: provider.guid,
    },
  });

  if (!userProvider) {
    return res.status(400).json({
      error: "Unable to fetch/generate user provider record",
    });
  }

  // get the vital 'user id' & 'user key' for the signed in
  if (!userProvider.providerUserId || !userProvider.providerUserKey) {
    try {
      // create a vital user
      const user = await client.User.create(userProvider.userGuid);

      if (!user) {
        throw new Error("Unable to create vital user");
      }

      // update the vital user id & key in the database
      userProvider.providerUserId = user.user_id;
      userProvider.providerUserKey = user.user_key;
      await userProvider.save();
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        error: "Unable to create vital user",
      });
    }
  }

  try {
    console.log("creating link token");
    // make request to generate link token
    const link = await client.Link.create(userProvider.providerUserId);

    if (!link) {
      throw new Error("Unable to generate link token");
    }

    return res.status(200).json({
      linkToken: link.link_token,
    });
  } catch (err) {
    console.error(err);
    console.error(err.message);
    return res.status(400).json({
      error: "Unable to generate link token",
    });
  }
};

exports.getDevices = async (req, res) => {
  // fetch the users devices
  const vitalProviders = await db.Provider.findAll({
    where: {
      type: "vital",
    },
  });

  const providerGuids = vitalProviders.map((provider) => provider.guid);

  if (providerGuids.length === 0) {
    return res.status(400).json({
      error: "Vital provider not found",
    });
  }

  const userProviders = await db.UserProvider.findOne({
    where: {
      userGuid: req.user.userGuid,
      providerGuid: {
        [db.Sequelize.Op.in]: providerGuids, // not necessay since we're still calling vital anyways
      },
    },
  });

  if (!userProviders) {
    return res.status(400).json({
      error: "Unable to fetch user provider record",
    });
  }

  // make api call for vital
  try {
    const user = await client.User.providers(userProviders.providerUserId);

    if (!user) {
      throw new Error("Unable to fetch vital user");
    }

    // map the devices to the format we want
    const devices = user.providers.map((provider) => {
      return {
        name: provider.name,
        slug: provider.slug,
        status: provider.status,
      };
    });

    return res.status(200).json({
      devices,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      error: "Unable to fetch devices",
    });
  }
};

exports.updateUserHistory = async (req, res) => {
  // follow the format used for magicflow here
};
