const db = require('../models/index');


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
        error: "Unable to fetch user token"
      });
  }
};