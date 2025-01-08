const dayjs = require("dayjs");
const db = require("../models/index");
const { nip19 } = require("nostr-tools");

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
    if (!userPubkey.startsWith('npub1')) {
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
    if (!userPubkey.startsWith('npub1')) {
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
          )
        ]
      }
    });

    if (!existingQuest) {
      res.status(403).json({
        error: "Unauthorized - you must be the creator or a collaborator to edit this quest"
      });
      return;
    }

    const quest = existingQuest

    // Check if quest exists
    if (!quest) {
      res.status(404).json({
        error: "Quest not found"
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

exports.getQuestDatasets = async (req, res) => {
  try {
    const latestTimestamps = await db.UserQuestDataset.findAll({
      where: {
        questGuid: req.query.questId,
        ...(req.query.type && { type: req.query.type }),
        ...(req.query.singleUser && { userGuid: req.user.userGuid })
      },
      attributes: [
        "userGuid",
        "questGuid",
        "type",
        [
          db.sequelize.fn("MAX", db.sequelize.col("timestamp")),
          "latestTimestamp",
        ],
      ],
      group: ["userGuid", "questGuid", "type"],
      raw: true, // Get plain objects instead of Sequelize instances
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
        "value", // Get the JSON data from the original table
      ],
    });

    console.log("query returned for user quests", userQuestDatasets);

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
