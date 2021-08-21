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

const insertPassengers = async ({ retry, delay, limit }) => {
  // this array will contain the passengers that throw any error
  // with these we could save a temp file to retry later
  const passengersThatFailed = [];

  let passengers;

  try {
    passengers = await readFile(`results/passengers${retry ? '.database' : ''}.csv`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;

    // if there is nothing to process, exit with a custom error
    throw new Error(
      `There is no passengers ${
        retry ? 'db file to retry.' : 'file to process.'
      }`
    );
  }

  // here we separate the ones that will be process now. 0 means all
  if (limit !== 0 && passengers.length > limit) {
    // save those that exceed as errors (to retry later)
    passengers.slice(limit).map((x) => passengersThatFailed.push(x));
    passengers = passengers.slice(0, limit);
  }

  // start the progress bar
  global.progressBar.start(passengers.length, 0);

  await new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) reject(err);
      resolve();
    });
  });

  for (const passenger of passengers) {
    try {
      await new Promise((resolve, reject) => {
        connection.query(
          'INSERT INTO passengers (ship, arrival, id, name, birthPlace, age) ' +
            `VALUES (${passenger.shipId},${passenger.arrivalId},${passenger.id},` +
            `'${passenger.name}','${passenger.birthPlace}',${passenger.age})`,
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });
    } catch (err) {
      // save the passenger to retry later
      passengersThatFailed.push(passenger);
    }

    global.progressBar.increment();
    await wait(delay);
  }

  connection.end();

  // save errors overwriting the previous file to only have the latest errors
  await writeFile('results/passengers.database.csv', passengersThatFailed, true);
};

module.exports = insertPassengers;
