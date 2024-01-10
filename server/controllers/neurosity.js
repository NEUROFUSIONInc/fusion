const { Neurosity } = require("@neurosity/sdk");

const neurosity = new Neurosity({
  autoSelectDevice: false,
});

exports.generateOAuthURL = async (req, res) => {
  await neurosity
    .createOAuthURL({
      clientId: process.env.NEUROSITY_OAUTH_CLIENT_ID,
      clientSecret: process.env.NEUROSITY_OAUTH_CLIENT_SECRET,
      redirectUri: process.env.NEUROSITY_OAUTH_CLIENT_REDIRECT_URI,
      responseType: "token",
      state: Math.random().toString().split(".")[1], // A random string is required for security reasons
      scope: [
        "read:accelerometer",
        "read:brainwaves",
        "read:calm",
        "read:devices-info",
        "read:devices-status",
        "read:focus",
        "read:memories:brainwaves",
        "read:signal-quality",
        "write:brainwave-markers",
        "write:brainwaves",
        "read:kinesis",
        "write:kinesis",
        "read:status",
      ],
    })
    .then((url) =>
      res.status(200).json({
        url: url,
      })
    )
    .catch((error) =>
      res.status(400).json({
        error: error.response.data,
      })
    );
};

exports.getOAuthToken = async (req, res) => {
  // TODO: get the signed in user & their neurosity user id

  // the neurosity user id should be attached to the provider model
  const userId = req.params.userId;

  async function getToken() {
    await neurosity
      .getOAuthToken({
        clientId: process.env.NEUROSITY_OAUTH_CLIENT_ID,
        clientSecret: process.env.NEUROSITY_OAUTH_CLIENT_SECRET,
        userId,
      })
      .then((url) =>
        res.status(200).json({
          statusCode: 200,
          body: {
            url: url,
          },
        })
      )
      .catch((error) =>
        res.status(400).json({
          body: error.response.data,
        })
      );
  }

  getToken();
};
