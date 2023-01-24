const { Magic } = require('@magic-sdk/admin');
require('dotenv').config();
/* 1. Setup Magic Admin SDK */
const magic = new Magic(process.env.MAGICLINK_SECRET_KEY);

const db = require('../models/index');

exports.validateLogin = async (req, res) => {
    if (!req.body.userEmail || !req.body.magicLinkAuthToken) {
      res.status(401).json({
        body: {
          error: "user email or magic link auth token not provided"
        }
      });
      return;
    }
  
    try {
      // call magiclink to validate user is loggedIn
      const magicLinkUser = await magic.users.getMetadataByToken(req.body.magicLinkAuthToken);
      if (!magicLinkUser) {
        res.status(401).json({
          body: {
            error: "user is not logged in"
          }
        });
        return;
      }

      try {
        // fetch/create user
        const [userMetadata, _] = await db.UserMetadata.findOrCreate({
          where: {
            userEmail: magicLinkUser.email
          }
        });
      
        // update last seen
        await userMetadata.update({
          userLastLogin: new Date()
        })
        
        // return user guid
        res.status(200).json({
          body: {
            userGuid: userMetadata.userGuid,
            magicLinkAuthToken: userMetadata.magicLinkAuthToken,
            magicflowToken: userMetadata.magicflowToken,
            neurosityToken: userMetadata.neurosityToken
          }
        });
      } catch (e) {
        console.log(e);
        res.status(400).json({
          body: {
            error: "Unable to fetch/create user"
          }
        });
        return;
      }
    } catch (e) {
      console.log(e)
      res.status(400).json({
        body: {
          error: "Unable to validate login"
        }
      });
      return;
    }
  
  }