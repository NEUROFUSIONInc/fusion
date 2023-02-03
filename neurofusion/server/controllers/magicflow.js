const db = require('../models/index');
const { magicFlowQueue, storageQueue } = require('../queue');


exports.fetchToken = async (req, res) => {
  const email = req.params.email;
  if (!email) {
    return res.status(401)
      .json({
        error: "User email not provided"
      });
  }

  try {
    const userMetadata = await db.UserMetadata.findOne({ where: { userEmail: email } });

    if (!userMetadata) {
      return res.status(401)
        .json({
          error: "User does not exist"
        });
    }

    res.status(200)
      .json({
        userGuid: userMetadata.userGuid,
        magicflowToken: userMetadata.magicflowToken
      });
  } catch (err) {
    console.error(err);
    res.status(400)
      .json({
        error: "Unable to fetch magicflow token"
      });
  }
};

exports.setToken = async (req, res) => {
  const email = req.body.userEmail;
  const magicflowToken = req.body.magicflowToken;

  if (!email || !magicflowToken) {
    return res.status(401)
      .json({
        error: "Invalid payload."
      });
  }

  try {
    const userMetadata = await db.UserMetadata.findOne({ where: { userEmail: email } });

    if (!userMetadata) {
      return res.status(401)
        .json({
          error: "User does not exist"
        });
    }

    await db.UserMetadata.update({ magicflowToken: magicflowToken }, {
      where: {
        userGuid: userMetadata.userGuid
      }
    });

    // Fetch user's magicflow data in the background
    magicFlowQueue.push({
      guid: userMetadata.userGuid,
      token: magicflowToken,
      lastFetched: userMetadata.magicflowLastFetched,
      storageQueue // Importing this from magicflow processor wasn't working so passing the instance
    });

    res.status(200)
      .json({
        userGuid: userMetadata.userGuid,
        magicflowToken
      });
  } catch (err) {
    console.error(err);
    res.status(400)
      .json({
        error: "Unable to update magicflow token"
      });
  }
};