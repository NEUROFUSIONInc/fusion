"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserQuestDataset extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserQuestDataset.init(
    {
      userGuid: {
        type: DataTypes.UUID,
        references: {
          model: "UserMetadata",
          key: "userGuid",
        },
        allowNull: false,
      },
      questGuid: {
        type: DataTypes.UUID,
        references: {
          model: "Quest",
          key: "guid",
        },
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserQuestDataset",
    }
  );
  return UserQuestDataset;
};
