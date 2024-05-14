const db = require("../models/index");

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
    const quests = await db.Quest.findAll({
      where: {
        userGuid: req.user.userGuid,
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
    const quest = await db.Quest.findOne({
      where: {
        guid: req.body.guid,
      },
    });

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

    console.log(userQuest);

    await userQuest.save();

    // add the additional data to the userQuest

    res.status(201).json({
      userQuest,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Error joining quest",
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

    console.log(userQuest);

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

    console.log(userQuests);

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

// TODO: exports.resetJoinCode
