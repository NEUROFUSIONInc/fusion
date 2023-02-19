"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      "Providers",
      [
        {
          name: "Fusion",
          type: "events",
          guid: "c3af1914-8b71-4583-8f60-445373622cd3",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Neurosity",
          type: "brain",
          guid: "51e265e2-21bb-446b-8a9c-dfae64b44048",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Magicflow",
          type: "events",
          guid: "6ddbe1e9-0809-4660-b6f0-264154148f7e",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "ActivityWatch",
          type: "events",
          guid: "6f9260bd-3a9b-44a7-88ac-984a7aac1cf4",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Fitbit",
          type: "vital",
          guid: "3b249932-2128-46a2-a608-18b399877aa0",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Apple Health",
          type: "vital",
          guid: "824923b7-f262-4171-826b-f4b6c0a76b42",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Oura",
          type: "vital",
          guid: "20508112-8c54-41ff-a1bc-b208f14efb71",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("Providers", null, {});
  },
};
