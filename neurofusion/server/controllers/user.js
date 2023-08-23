require("websocket-polyfill");

const { Magic } = require("@magic-sdk/admin");
const jwt = require("jsonwebtoken");
global.crypto = require("crypto");
const {
  getEventHash,
  getSignature,
  generatePrivateKey,
  getPublicKey,
  nip19,
  nip04,
  relayInit,
} = require("nostr-tools");
require("dotenv").config();
/* 1. Setup Magic Admin SDK */
const magic = new Magic(process.env.MAGICLINK_SECRET_KEY);

// create publicKey & privateKey to sign messages as fusion
const serverPrivateKey = process.env.NOSTR_FUSION_PRIVATE_KEY;
const serverPublicKey = getPublicKey(serverPrivateKey);

console.log("privateKey", serverPrivateKey);
console.log("publicKey", serverPublicKey);

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
  console.log("incoming request", req.body);
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

    // basically, generate a tokey for this pubkey
    const content = await nip04.encrypt(
      serverPrivateKey,
      req.body.pubkey,
      authToken
    );

    const event = {
      content: content,
      created_at: Math.floor(Date.now() / 1000),
      kind: 4,
      pubkey: serverPublicKey,
      tags: [["p", req.body.pubkey]],
    };

    event.id = getEventHash(event);

    const relay = relayInit("wss://relay.usefusion.ai");
    relay.on("connect", () => {
      console.log("connected to relay");
    });
    relay.on("error", (err) => {
      console.log("error", err);
    });

    await relay.connect();

    let sub = relay.sub([
      {
        // ids: ["be5230ede4d50912ea7d8f989209b9e70c168c8dc930b29bcf66cd8f889bd3ca"],
        authors: [serverPublicKey],
        // kinds: [4],
        // "#p": [publicKey],
        // since: loginTimestamp,
      },
    ]);
    sub.on("event", (event) => {
      console.log("we got the event we wanted:", event);
      // console.log("decoding...");
      // const decoded = await nip04.decrypt(credentials!.privateKey, serverPublicKey!, event.content);
      console.log("access token", decoded);
      // authToken = decoded;
    });

    // we sign the message with fusion server private key
    event.id = getEventHash(event);
    event.sig = getSignature(event, serverPrivateKey);
    console.log(event);
    console.log("sending to relay pool");
    await relay.publish(event);

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
