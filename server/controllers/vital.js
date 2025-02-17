/**
 * Module for interacting with health related data from Vital https://tryvital.io/
 *
 */
const { VitalClient, VitalEnvironment } = require("@tryvital/vital-node");

const db = require("../models/index");

exports.generateToken = async (req, res) => {
  try {
    const { device, questId } = req.query;

    if (!["Oura","Apple Health", "Whoop"].includes(device)) {
      return res.status(400).json({ error: "Invalid device type. Must be either 'Oura', 'Apple Health', or 'Whoop'" });
    }

    const quest = await db.Quest.findOne({ where: { guid: questId } });
    if (!quest) {
      return res.status(400).json({ error: "Quest not found" });
    }

    const questExtraConfig = await db.QuestExtraConfig.findOne({ where: { questId } });
    if (!questExtraConfig) {
      return res.status(400).json({ error: "Quest does not have vital configured" });
    }

    const { vital_api_key, vital_environment, vital_region } = JSON.parse(questExtraConfig.value);
    if (!vital_api_key || !vital_environment || !vital_region) {
      return res.status(400).json({ error: "Quest config is missing vital credentials" });
    }

    const vitalClient = new VitalClient({
      apiKey: vital_api_key,
      environment: vital_environment === "sandbox" ? VitalEnvironment.Sandbox : VitalEnvironment.Production,
    });

    const provider = await db.Provider.findOne({
      where: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('name')), device.toLowerCase())
    });
    if (!provider) {
      return res.status(400).json({ error: "Vital provider not found" });
    }

    const [userProvider] = await db.UserProvider.findOrCreate({
      where: {
        userGuid: req.user.userGuid,
        providerGuid: provider.guid,
        questGuid: questId,
      },
    });

    if (!userProvider) {
      return res.status(400).json({ error: "Unable to fetch/generate user provider record" });
    }

    if (!userProvider.providerUserId) {
      try {
        const user = await vitalClient.user.create({
          clientUserId: `${userProvider.userGuid}-${userProvider.providerGuid}`,
        });
        if (!user) throw new Error("Unable to create vital user");

        userProvider.providerUserId = user.userId;
        await userProvider.save();
      } catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Unable to create vital user" });
      }
    }

    // based on the device being connected, decide whether to create a link token or a signin token
    if (["oura", "whoop"].includes(device.toLowerCase())) {
      try {
        const provider = device.toLowerCase() === "whoop" ? "whoop_v2" : device.toLowerCase();
        const token = await vitalClient.link.token({
          userId: userProvider.providerUserId,
          provider,
        });
        if (!token) throw new Error("Unable to generate link token");

        return res.status(200).json({ linkToken: token.linkToken, linkUrl: token.linkWebUrl });
      } catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Unable to generate link token" });
      }
    } else if (["Apple Health"].includes(device)) {
      try {
        console.log("creating signin token for mobile app");
        const token = await vitalClient.user.getUserSignInToken(
          userProvider.providerUserId);
  
        if (!token) throw new Error("Unable to generate signin token");
  
        return res.status(200).json({ signInToken: token.signInToken });
      } catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Unable to generate signin token" });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Unable to generate link token" });
  }
};

exports.getUserVitalConnectedSources = async (userGuid, questId) => {
  const questExtraConfig = await db.QuestExtraConfig.findOne({ where: { questId } });
  if (!questExtraConfig) {
    return false;
  }

  const { vital_api_key, vital_environment, vital_region } = JSON.parse(questExtraConfig.value);
  if (!vital_api_key || !vital_environment || !vital_region) {
    return false;
  }

  const userProvider = await db.UserProvider.findOne({ where: { userGuid, questGuid: questId } });
  if (!userProvider || !userProvider.providerUserId) {
    return false;
  }

  const vitalClient = new VitalClient({
    apiKey: vital_api_key,
    environment: vital_environment === "sandbox" ? VitalEnvironment.Sandbox : VitalEnvironment.Production,
  });

  const user = await vitalClient.user.get(userProvider.providerUserId);
  if (!user) {
    return false;
  }

  const connectedSources = user["connectedSources"];

  if (!connectedSources) {
    return false;
  }

  return connectedSources;
}