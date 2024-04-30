const db = require("../models/index");

exports.saveQuest = async (req, res) => {
  try {
    // validate the most important

    const quest = await db.Quest.create({
      userGuid: req.user.userGuid,
      title: req.body.title,
      description: req.body.description,
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

exports.joinQuest = async (req, res) => {
  // todo: parameters
  // joinCode, userGuid - as long as parameters are valid
  // check if quest exists
  // add user to quest in the db
};

// TODO: exports.resetJoinCode

exports.getQuests = async (req, res) => {
  try {
    const quests = await db.Quest.findAll({
      where: {
        userGuid: req.user.userGuid,
      },
    });

    res.status(200).json({
      quests,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error getting quests",
    });
  }
};
