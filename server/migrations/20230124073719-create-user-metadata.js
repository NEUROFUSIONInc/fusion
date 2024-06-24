'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserMetadata', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userEmail: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      userGuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true
      },
      magicLinkAuthToken: {
        type: Sequelize.TEXT
      },
      neurosityToken: {
        type: Sequelize.TEXT
      },
      magicflowToken: {
        type: Sequelize.TEXT
      },
      magicflowLastFetched: {
        type: Sequelize.DATE
      },
      userLastLogin: {
        type: Sequelize.DATE
      },
      userConsentUsage: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserMetadata');
  }
};