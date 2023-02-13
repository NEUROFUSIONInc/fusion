const db = require("../models/index");
const { magicFlowQueue, storageQueue } = require("../queue");

exports.fetchToken = async (req, res) => {
  try {
    const userProvider = await fetchUserProvider(
      req.user.userGuid,
      "Magicflow"
    );

    if (!userProvider) {
      throw new Error("Magicflow provider not found");
    }

    res.status(200).json({
      magicflowToken: userProvider.providerToken,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      error: "Unable to fetch magicflow token",
    });
  }
};

exports.setToken = async (req, res) => {
  const magicflowToken = req.body.magicflowToken;

  if (!magicflowToken) {
    return res.status(400).json({
      error: "Invalid payload.",
    });
  }

  try {
    const userProvider = await fetchUserProvider(
      req.user.userGuid,
      "Magicflow"
    );

    let providerLastFetched = null;
    if (userProvider) {
      userProvider.providerToken = magicflowToken;
      await userProvider.save();

      providerLastFetched = userProvider.providerLastFetched;
    } else {
      const magicflowProvider = await db.Provider.findOne({
        where: { name: "Magicflow" },
      });

      if (!magicflowProvider) {
        return res.status(400).json({
          error: "Magicflow provider not found",
        });
      }

      const newUserProvider = await db.UserProvider.create({
        userGuid: req.user.userGuid,
        providerGuid: magicflowProvider.guid,
        providerToken: magicflowToken,
      });

      providerLastFetched = newUserProvider.providerLastFetched;
    }

    // Fetch user's magicflow data in the background
    magicFlowQueue.push({
      guid: req.user.userGuid,
      token: magicflowToken,
      lastFetched: providerLastFetched,
      storageQueue, // Importing this from magicflow processor wasn't working so passing the instance
    });

    res.status(200).json({
      magicflowToken,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      error: "Unable to update magicflow token",
    });
  }
};

async function fetchUserProvider(userGuid, providerName) {
  // get the magicflow provider guid
  // TODO: load this object on app startup and store it in memory
  const magicflowProvider = await db.Provider.findOne({
    where: { name: providerName },
  });

  if (!magicflowProvider) {
    console.log("Magicflow provider does not exist");
    return null;
  }

  // check if user has magicflow token
  const userProvider = await db.UserProvider.findOne({
    where: {
      userGuid: userGuid,
      providerGuid: magicflowProvider.guid,
    },
  });

  return userProvider;
}
