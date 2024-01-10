"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserProviders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userGuid: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      providerGuid: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      providerUserId: {
        type: Sequelize.STRING,
      },
      providerUserKey: {
        type: Sequelize.STRING,
      },
      providerToken: {
        type: Sequelize.TEXT,
      },
      providerOrder: {
        type: Sequelize.INTEGER,
      },
      providerLastFetched: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserProviders");
  },
};
