const mysql = require('mysql');
const wait = require('wait');
const { readFile, writeFile } = require('../fs');

// setting up enviromental variables
require('dotenv').config();

// create the connection with mysql
const connection = mysql.createConnection({
  host: process.env.DATABASE_HOSTNAME,
  port: process.env.DATABASE_PORT,
  database: 'scraping-passenger-list',
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
});

const insertShips = async ({ retry, delay, limit }) => {
  // this array will contain the ships that throw any error
  // with these we could save a temp file to retry later
  const shipsThatFailed = [];

  let ships;

  try {
    ships = await readFile(`results/ships${retry ? '.database' : ''}.csv`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;

    // if there is nothing to process, exit with a custom error
    throw new Error(
      `There is no ships ${retry ? 'db file to retry.' : 'file to process.'}`
    );
  }

  // here we separate the ones that will be process now. 0 means all
  if (limit !== 0 && ships.length > limit) {
    // save those that exceed as errors (to retry later)
    ships.slice(limit).map((x) => shipsThatFailed.push(x));
    ships = ships.slice(0, limit);
  }

  // start the progress bar
  global.progressBar.start(ships.length, 0);

  await new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) reject(err);
      resolve();
    });
  });

  for (const ship of ships) {
    try {
      await new Promise((resolve, reject) => {
        connection.query(
          'INSERT INTO ships (id, name, url) ' +
            `VALUES (${ship.id},'${ship.name}','${ship.url}')`,
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });
    } catch (err) {
      // save the ship to retry later
      shipsThatFailed.push(ship);
    }

    global.progressBar.increment();
    await wait(delay);
  }

  connection.end();

  // save errors overwriting the previous file to only have the latest errors
  await writeFile('results/ships.database.csv', shipsThatFailed, true);
};

module.exports = insertShips;
