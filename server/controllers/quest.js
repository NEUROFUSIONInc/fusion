const dayjs = require("dayjs");
const db = require("../models/index");
const { nip19 } = require("nostr-tools");
const axios = require("axios");
const { getUserVitalConnectedSources } = require("./vital");

exports.saveQuest = async (req, res) => {
  try {
    // validate the most important

    const quest = await db.Quest.create({
      userGuid: req.user.userGuid,
      title: req.body.title,
      description: req.body.description,
      organizerName: req.body.organizerName,
      config: req.body.config,
      joinCode: Math.random().toString(36).substring(7),
    });

    if (!quest) {
      res.status(500).json({
        error: "Error saving quest",
      });
    }

    res.status(201).json({
      quest,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error saving quest",
    });
  }
};

exports.getCreatorQuests = async (req, res) => {
  try {
    // Check if userPubkey is already npub encoded if not, encode it
    let userPubkey = req.user.userPubkey;
    if (!userPubkey.startsWith("npub1")) {
      userPubkey = nip19.npubEncode(userPubkey);
    }

    /**
     * This fetches quest the user created or the user is a collaborator on
     */
    const quests = await db.Quest.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { userGuid: req.user.userGuid },
          db.Sequelize.literal(
            `(config IS NOT NULL AND JSON_VALID(config) = 1 AND JSON_EXTRACT(config, '$.collaborators') LIKE '%${userPubkey}%')`
          ),
        ],
      },
    });

    if (!quests) {
      res.status(404).json({
        error: "Quests not found",
      });
      return;
    }

    res.status(200).json({
      quests,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error getting quests",
    });
  }
};

exports.getQuestByCode = async (req, res) => {
  try {
    const quest = await db.Quest.findOne({
      where: {
        joinCode: req.query.joinCode.trim().toLowerCase(),
      },
    });

    if (!quest) {
      res.status(404).json({
        error: "Quest not found",
      });
      return;
    }

    res.status(200).json({
      quest,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error getting quest",
    });
  }
};

exports.editQuest = async (req, res) => {
  try {
    // Check if userPubkey is already npub encoded if not, encode it
    let userPubkey = req.user.userPubkey;
    if (!userPubkey.startsWith("npub1")) {
      userPubkey = nip19.npubEncode(userPubkey);
    }

    // check if the user is the creator/collaborator of the quest
    const existingQuest = await db.Quest.findOne({
      where: {
        guid: req.body.guid,
        [db.Sequelize.Op.or]: [
          { userGuid: req.user.userGuid },
          db.Sequelize.literal(
            `(config IS NOT NULL AND JSON_VALID(config) = 1 AND JSON_EXTRACT(config, '$.collaborators') LIKE '%${userPubkey}%')`
          ),
        ],
      },
    });

    if (!existingQuest) {
      res.status(403).json({
        error:
          "Unauthorized - you must be the creator or a collaborator to edit this quest",
      });
      return;
    }

    const quest = existingQuest;

    // Check if quest exists
    if (!quest) {
      res.status(404).json({
        error: "Quest not found",
      });
      return;
    }

    quest.title = req.body.title;
    quest.description = req.body.description;
    quest.config = req.body.config;
    quest.organizerName = req.body.organizerName;

    await quest.save();

    res.status(200).json({
      quest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error updating quest",
    });
  }
};

exports.joinQuest = async (req, res) => {
  try {
    const quest = await db.Quest.findOne({
      where: {
        guid: req.body.questId.trim().toLowerCase(),
      },
    });

    if (!quest) {
      res.status(404).json({
        error: "Quest not found",
      });
      return;
    }

    // check if quest exists..
    const [userQuest, created] = await db.UserQuest.findOrCreate({
      where: {
        userGuid: req.user.userGuid,
        questGuid: quest.guid,
      },
    });

    if (!userQuest) {
      res.status(500).json({
        error: "Error joining quest",
      });
    }
    userQuest.data = JSON.stringify(req.body.data);

    await userQuest.save();

    // add the additional data to the userQuest

    res.status(201).json({
      userQuest,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error joining quest",
    });
  }
};

exports.getAllActiveQuestsForUser = async (req, res) => {
  try {
    const userQuests = await db.UserQuest.findAll({
      where: {
        userGuid: req.user.userGuid,
      },
    });

    if (!userQuests) {
      res.status(404).json({
        error: "UserQuests not found",
      });
      return;
    }

    // find distinct questIds
    const questIds = [
      ...new Set(userQuests.map((userQuest) => userQuest.questGuid)),
    ];

    let activeQuests = [];
    // go ahead and get the quest from the quest table
    for (let i = 0; i < questIds.length; i++) {
      const quest = await db.Quest.findOne({
        where: {
          guid: questIds[i],
        },
      });

      if (quest) {
        activeQuests.push(quest);
      }
    }

    res.status(200).json({
      quests: activeQuests,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error getting userQuests",
    });
  }
};

exports.getUserQuestSubscription = async (req, res) => {
  /**
   * Fetches a record for the user subscribed to a quest
   */
  try {
    const userQuest = await db.UserQuest.findOne({
      where: {
        userGuid: req.user.userGuid,
        questGuid: req.query.questId,
      },
    });

    if (!userQuest) {
      res.status(404).json({
        error: "UserQuest not found",
      });
      return;
    }

    res.status(200).json({
      userQuest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error getting userQuest",
    });
  }
};

exports.getQuestSubscribers = async (req, res) => {
  try {
    const userQuests = await db.UserQuest.findAll({
      where: {
        questGuid: req.query.questId,
      },
    });

    if (!userQuests) {
      res.status(404).json({
        error: "UserQuests not found",
      });
      return;
    }

    // go ahead and get the userNpub from the userMetadata table
    for (let i = 0; i < userQuests.length; i++) {
      const user = await db.UserMetadata.findOne({
        where: {
          userGuid: userQuests[i].userGuid,
        },
      });

      if (user) {
        userQuests[i].user = user;
      }
    }

    res.status(200).json({
      userQuests,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error getting userQuests",
    });
  }
};

exports.getQuestDetail = async (req, res) => {
  try {
    console.log("req.query.questId");
    console.log(req.query.questId);
    const quest = await db.Quest.findOne({
      where: {
        guid: req.query.questId,
      },
    });

    if (!quest) {
      res.status(404).json({
        error: "Quest not found",
      });
      return;
    }

    res.status(200).json({
      quest,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error getting quest",
    });
  }
};

// TODO: exports.resetJoinCode

exports.saveQuestDataset = async (req, res) => {
  // TODO: validate paramss.. edit json field?
  // ensure that quest exists
  try {
    const quest = await db.Quest.findOne({
      where: {
        guid: req.body.questId,
      },
    });

    if (!quest) {
      res.status(404).json({
        error: "Quest not found",
      });
      return;
    }

    console.log("incoming dataset:\n", req.body);
    const userQuestDataset = await db.UserQuestDataset.create({
      userGuid: req.user.userGuid,
      questGuid: req.body.questId,
      type: req.body.type,
      value: JSON.stringify(req.body.value),
      timestamp: dayjs().unix(),
    });

    if (!userQuestDataset) {
      res.status(500).json({
        error: "Error saving quest dataset",
      });
    }

    res.status(201).json({
      userQuestDataset,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Error saving quest dataset",
    });
  }
};

const getQuestDatasetsInternal = async (questId, type = null, singleUser = false, userGuid = null) => {
  const latestTimestamps = await db.UserQuestDataset.findAll({
    where: {
      questGuid: questId,
      ...(type && { type }),
      ...(singleUser && userGuid && { userGuid }),
    },
    attributes: [
      "userGuid",
      "questGuid",
      "type",
      [db.sequelize.fn("MAX", db.sequelize.col("timestamp")), "latestTimestamp"],
    ],
    group: ["userGuid", "questGuid", "type"],
    raw: true,
  });

  const conditions = latestTimestamps.map(
    ({ userGuid, questGuid, type, latestTimestamp }) => ({
      userGuid,
      questGuid,
      type,
      timestamp: latestTimestamp,
    })
  );

  const userQuestDatasets = await db.UserQuestDataset.findAll({
    where: {
      [db.Sequelize.Op.or]: conditions,
    },
    attributes: [
      "userGuid",
      "questGuid",
      "type",
      "timestamp",
      "value",
    ],
  });

  return userQuestDatasets;
};

exports.getQuestDatasets = async (req, res) => {
  try {
    const userQuestDatasets = await getQuestDatasetsInternal(
      req.query.questId,
      req.query.type,
      req.query.singleUser,
      req.user.userGuid
    );

    if (!userQuestDatasets) {
      res.status(404).json({
        error: "UserQuestDatasets not found",
      });
      return;
    }

    res.status(200).json({
      userQuestDatasets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error getting userQuestDatasets",
    });
  }
};

exports.getQuestAssignments = async (req, res) => {
  /**
   * - Takes questID gets the assignment config
   * - Get's the userGuid from the request
   * - Fetches the relevant onboarding value based on the user & script input
   * - Sends the request to nf-python-executor
   * - Get's the response and send to the user
   */
  try {
    console.log("getQuestAssignments");
    // get the quest
    const quest = await db.Quest.findOne({
      where: {
        guid: req.query.questId,
      },
    });

    if (!quest) {
      res.status(404).json({
        error: "Quest not found",
      });
      return;
    }

    // get the assignment config
    const assignmentConfig = JSON.parse(quest.config)?.assignmentConfig;
    if (!assignmentConfig) {
      res.status(404).json({
        error: "Assignment config not found",
      });
      return;
    }

    const scriptInputs = assignmentConfig.script.inputs;
    if (scriptInputs && scriptInputs.length > 0) {
      // Get onboarding datasets using the internal method
      const onboardingDatasets = await getQuestDatasetsInternal(
        req.query.questId,
        "onboarding_responses",
        true,
        req.user.userGuid
      );

      if (!onboardingDatasets) {
        res.status(500).json({
          error: "Error getting onboarding responses",
        });
        return;
      }

      // this is an array of onboarding responses
      const onboardingResponses = JSON.parse(onboardingDatasets[0].value);

      // for each input, find the corresponding response
      for (let i = 0; i < scriptInputs.length; i++) {
        const input = scriptInputs[i];
        const response = onboardingResponses.find((response) => response.guid === input.sourceId);
        
        // TODO: make this design more robust, scaffolding should be on the frontend where user can see and test script run
        // INJECT VARIABLE INTO THE SCRIPT
        if (response) {
          assignmentConfig.script.code = `${input.placeholder} = \"${response.responseValue}\"\n` + assignmentConfig.script.code;
        }
      }

    }

    console.log(`assignment code:\n${assignmentConfig.script.code}`);
    try {
      const response = await axios.post(
        `${process.env.NF_PYTHON_EXECUTOR_URL}/execute`,
        {
          guid: assignmentConfig.guid,
          script: assignmentConfig.script.code.trim(),
        }
      );

      if (response.status === 200) {
        res.status(200).json(response.data.output);
      } else {
        res.status(500).json({
          error: "Error executing script",
          message: JSON.stringify(response.data)
        });
      }
    } catch (error) {
      console.error('Python executor error:', error.response?.data || error.message);
      res.status(500).json({
        error: "Error executing script",
        message: error.response?.data || error.message
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error getting quest assignments",
    });
  }
};

exports.getQuestExtraConfig = async (req, res) => {
  try {
    const questId = req.query.questId;
    console.log("questId", questId);

    const quest = await db.Quest.findOne({
      where: {
        guid: questId
      }
    });

    if (!quest) {
      return res.status(404).json({
        error: "Quest not found"
      });
    }

    const config = await db.QuestExtraConfig.findOne({
      where: {
        questId: questId
      }
    });

    if (!config) {
      return res.status(404).json({
        error: "Quest API config not found"
      });
    }

    res.status(200).json({
      value: config.value
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error getting quest extra config"
    });
  }
};

exports.setQuestExtraConfig = async (req, res) => {
  try {
    const { questId, value } = req.body;
    let userPubkey = req.user.userPubkey;
    if (!userPubkey.startsWith("npub1")) {
      userPubkey = nip19.npubEncode(userPubkey);
    }

    if (!questId || !value) {
      return res.status(400).json({
        error: "Quest ID and value are required"
      });
    }

    // First check if the quest exists and user has permission
    const quest = await db.Quest.findOne({
      where: {
        guid: questId,
        [db.Sequelize.Op.or]: [
          { userGuid: req.user.userGuid },
          db.Sequelize.literal(
            `(config IS NOT NULL AND JSON_VALID(config) = 1 AND JSON_EXTRACT(config, '$.collaborators') LIKE '%${userPubkey}%')`
          ),
        ],
      },
    });

    if (!quest) {
      return res.status(403).json({
        error: "Unauthorized - you must be the creator of the quest to modify its config"
      });
    }

    const [config, created] = await db.QuestExtraConfig.findOrCreate({
      where: { questId },
      defaults: { value }
    });

    if (!created) {
      config.value = value;
      await config.save();
    }

    res.status(200).json({
      value: config.value
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error setting quest extra config"
    });
  }
};

exports.redeemGiftCard = async (req, res) => {
  try {
    const { questId, deviceId } = req.body;

    if (!questId || !deviceId) {
      return res.status(400).json({
        error: "Quest ID and device ID are required"
      });
    }

    // check that the quest config has a gift card code
    const questExtraConfig = await db.QuestExtraConfig.findOne({
      where: {
        questId: questId,
      }
    });

    if (!questExtraConfig) {
      return res.status(404).json({
        error: "ERROR: Not configured to redeem gift cards"
      });
    }

    const configObject = JSON.parse(questExtraConfig.value);
    const giftCardCodes = configObject.gift_card_codes;
    if (!giftCardCodes) {
      return res.status(404).json({
        error: "ERROR: Gift card codes not found"
      });
    }

    // check if the gift card codes history is defined, if not, initialize it
    if (configObject["gift_card_codes_history"] == undefined) {
      configObject["gift_card_codes_history"] = "";
      // this is going to be in the form of "deviceId:giftCardCode,deviceId:giftCardCode,..."
    }

    const userVitalConnectedSources = await getUserVitalConnectedSources(req.user.userGuid, questId);
    if (!userVitalConnectedSources) {
      return res.status(400).json({
        error: "You must connect your health data first to redeem a gift card"
      });
    }

    // check if the deviceId has already been assigned a gift card code
    const giftCardCodesHistory = configObject["gift_card_codes_history"];
    if (giftCardCodesHistory.includes(deviceId)) {
      // Find the code that was redeemed for this device
      const deviceHistory = giftCardCodesHistory.split(",")
        .find(entry => entry.startsWith(deviceId + ":"));
      
      if (deviceHistory) {
        const redeemedCode = deviceHistory.split(":")[1];
        return res.status(200).json({
          code: redeemedCode
        });
      }
      
      return res.status(404).json({
        error: "Unable to find gift code, it looks like you've already redeemed it"
      });
    }

    // if not, check if there's a code available and assign to the device
    // Split gift card codes into array and filter out any that are already used
    const availableCodes = giftCardCodes.split(",").filter(code => 
      !giftCardCodesHistory.includes(`:${code}`)
    );

    if (availableCodes.length === 0) {
      return res.status(404).json({
        error: "No more gift card codes available. Reach out to mouthtaping@cosimoresearch.com to get one."
      });
    }

    // Take the first available code
    const codeToAssign = availableCodes[0];
    // Update the history with the new assignment
    configObject["gift_card_codes_history"] = giftCardCodesHistory 
      ? `${giftCardCodesHistory},${deviceId}:${codeToAssign}`
      : `${deviceId}:${codeToAssign}`;

    // Save the updated config
    await db.QuestExtraConfig.update(
      { value: JSON.stringify(configObject) },
      { where: { questId: questId } }
    );

    return res.status(200).json({
      code: codeToAssign
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error redeeming gift card"
    });
  }
};