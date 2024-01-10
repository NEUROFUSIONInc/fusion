const { default: Surreal } = require("surrealdb.js");

const db = new Surreal();

try {
  (async () => {
    // Connect to the database
    await db.connect("http://127.0.0.1:8000/rpc");

    // TODO: generate user npub and use that for log in

    // Signin as a namespace, database, or root user
    await db.signin({
      user: "root",
      pass: "root",
    });

    // Select a specific namespace / database
    await db.use({ ns: "test", db: "test" });

    // todo: create database tables: save prompt, save responses...
    // let prompts = await db.create("prompt", {});
    // let responses = await db.create("response", {});

    // // todo: use the import function you already have
    // let created = await db.create("person", {
    //   title: "Founder & CEO",
    //   name: {
    //     first: "Tobie",
    //     last: "Morgan Hitchcock",
    //   },
    //   marketing: true,
    //   identifier: Math.random().toString(36).slice(2, 12),
    // });

    // // Update a person record with a specific id
    // let updated = await db.merge("person:jaime", {
    //   marketing: true,
    // });

    // // Select all people records
    // let people = await db.select("person");

    // // Perform a custom advanced query
    // let groups = await db.query(
    //   "SELECT marketing, count() FROM type::table($tb) GROUP BY marketing",
    //   {
    //     tb: "person",
    //   }
    // );
  })();
} catch (e) {
  console.error("ERROR", e);
}

export default db;
