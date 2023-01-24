'use strict';
const {
  Model,
  Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserMetadata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserMetadata.init({
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },userGuid: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      unique: true
    },
    magicLinkAuthToken: DataTypes.TEXT,
    neurosityToken: DataTypes.TEXT,
    magicflowToken: DataTypes.TEXT,
    magicflowLastFetched: DataTypes.DATE,
    userLastLogin: DataTypes.DATE,
    userConsentUsage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'UserMetadata',
  });
  return UserMetadata;
};