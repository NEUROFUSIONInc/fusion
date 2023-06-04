const { Magic } = require("@magic-sdk/admin");
const jwt = require("jsonwebtoken");
require("dotenv").config();
/* 1. Setup Magic Admin SDK */
const magic = new Magic(process.env.MAGICLINK_SECRET_KEY);

const { RelayPool } = require("nostr-relaypool");
const {
  getEventHash,
  getSignature,
  generatePrivateKey,
  getPublicKey,
  nip19,
  nip04,
} = require("nostr-tools");

let relays = ["ws://127.0.0.1:6969"];

// create publicKey & privateKey to sign messages as fusion
const privateKey = generatePrivateKey();
const publicKey = getPublicKey(privateKey);

let relayPool = new RelayPool(relays);

const db = require("../models/index");

exports.tokenValidator = async (req, res, next) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.UserMetadata.findOne({
      where: {
        userGuid: decoded.userGuid,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Authentication failed",
      });
    }

    // TODO: add all user's providers

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      error: "Authentication failed",
    });
  }
};

exports.validateLogin = async (req, res) => {
  if (!req.body.userEmail || !req.body.magicLinkAuthToken) {
    res.status(401).json({
      body: {
        error: "user email or magic link auth token not provided",
      },
    });
    return;
  }

  try {
    // call magiclink to validate user is loggedIn
    const magicLinkUser = await magic.users.getMetadataByToken(
      req.body.magicLinkAuthToken
    );
    if (!magicLinkUser) {
      res.status(401).json({
        body: {
          error: "user is not logged in",
        },
      });
      return;
    }

    try {
      // fetch/create user
      const [userMetadata, _] = await db.UserMetadata.findOrCreate({
        where: {
          userEmail: magicLinkUser.email,
        },
      });

      // update last seen
      await userMetadata.update({
        userLastLogin: new Date(),
      });

      const userInfo = {
        userGuid: userMetadata.userGuid,
      };
      const authToken = jwt.sign(userInfo, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
      });

      // return user guid
      res.status(200).json({
        body: {
          userGuid: userMetadata.userGuid,
          magicLinkAuthToken: userMetadata.magicLinkAuthToken,
          magicflowToken: userMetadata.magicflowToken,
          neurosityToken: userMetadata.neurosityToken,
          authToken,
        },
      });
    } catch (e) {
      console.log(e);
      res.status(400).json({
        body: {
          error: "Unable to fetch/create user",
        },
      });
      return;
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({
      body: {
        error: "Unable to validate login",
      },
    });
    return;
  }
};

exports.validateNostrLogin = async (req, res) => {
  if (!req.body.pubkey) {
    res.status(401).json({
      body: {
        error: "pubkey is required",
      },
    });
    return;
  }

  try {
    // TODO: log the pubKey in db
    // now try to save the account / generate one
    // connect to the relayPool and then drop message
    const userInfo = {
      pubkey: req.body.pubkey,
    };
    const authToken = jwt.sign(userInfo, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    const content = await nip04.encrypt(privateKey, req.body.pubkey, authToken);

    const event = {
      content: content,
      created_at: Math.floor(Date.now() / 1000),
      kind: 4,
      pubkey: publicKey,
      tags: [["p", req.body.pubkey]],
    };

    event.id = getEventHash(event);

    // we sign the message with fusion server private key
    event.sig = getSignature(event, privateKey);
    console.log(event);
    relayPool.publish(event, ["ws://127.0.0.1:6969"]);

    res.status(200).json({
      body: {
        success: true,
        message: "User token sent to relay pool",
      },
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      body: {
        error: "Unable to validate login",
      },
    });
    return;
  }
};
