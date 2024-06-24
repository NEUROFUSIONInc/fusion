"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserQuest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserQuest.init(
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
      data: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "UserQuest",
    }
  );
  return UserQuest;
};
