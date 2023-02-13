"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserProvider extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // models.UserMetadata.belongsToMany(models.Provider, {
      //   through: models.UserProvider,
      // });
      // models.Provider.belongsToMany(models.UserMetadata, {
      //   through: models.UserProvider,
      // });
    }
  }
  UserProvider.init(
    {
      userGuid: {
        type: DataTypes.UUID,
        references: {
          model: "UserMetadata",
          key: "userGuid",
        },
        allowNull: false,
      },
      providerGuid: {
        type: DataTypes.UUID,
        references: {
          model: "Provider",
          key: "guid",
        },
        allowNull: false,
      },
      providerUserId: DataTypes.STRING,
      providerUserKey: DataTypes.STRING,
      providerToken: DataTypes.TEXT,
      providerOrder: DataTypes.INTEGER,
      providerLastFetched: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "UserProvider",
    }
  );

  return UserProvider;
};
