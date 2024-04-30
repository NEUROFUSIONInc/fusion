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

exports.joinQuest = async (req, res) => {};

// TODO: exports.resetJoinCode
