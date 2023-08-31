"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn("UserMetadata", "userEmail", {
      allowNull: true,
    });
    await queryInterface.addColumn("UserMetadata", "userPubkey", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.removeColumn("UserMetadata", "magicLinkAuthToken");
    await queryInterface.removeColumn("UserMetadata", "neurosityToken");
    await queryInterface.removeColumn("UserMetadata", "magicflowToken");
    await queryInterface.removeColumn("UserMetadata", "magicflowLastFetched");
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("UserMetadata", "userNpub");
  },
};
