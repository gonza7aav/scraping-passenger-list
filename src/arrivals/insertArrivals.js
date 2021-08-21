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

// some dates from the page are wrong
// fix them using the following values
const fixDate = (date) => {
  const aux = date.split('-');
  if (aux[0] === '0000') aux[0] = '2999';
  if (aux[1] === '00') aux[1] = '01';
  if (aux[2] === '00') aux[2] = '01';
  return aux.join('-');
};

const insertArrivals = async ({ retry, delay, limit }) => {
  // this array will contain the arrivals that throw any error
  // with these we could save a temp file to retry later
  const arrivalsThatFailed = [];

  let arrivals;

  try {
    arrivals = await readFile(`results/arrivals${retry ? '.database' : ''}.csv`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;

    // if there is nothing to process, exit with a custom error
    throw new Error(
      `There is no arrivals ${retry ? 'db file to retry.' : 'file to process.'}`
    );
  }

  // here we separate the ones that will be process now. 0 means all
  if (limit !== 0 && arrivals.length > limit) {
    // save those that exceed as errors (to retry later)
    arrivals.slice(limit).map((x) => arrivalsThatFailed.push(x));
    arrivals = arrivals.slice(0, limit);
  }

  // start the progress bar
  global.progressBar.start(arrivals.length, 0);

  await new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) reject(err);
      resolve();
    });
  });

  for (const arrival of arrivals) {
    try {
      await new Promise((resolve, reject) => {
        connection.query(
          'INSERT INTO arrivals (ship, id, date, url) ' +
            `VALUES (${arrival.shipId},${arrival.id},'${fixDate(arrival.date)}','${arrival.url}')`,
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });
    } catch (err) {
      // save the arrival to retry later
      arrivalsThatFailed.push(arrival);
    }

    global.progressBar.increment();
    await wait(delay);
  }

  connection.end();

  // save errors overwriting the previous file to only have the latest errors
  await writeFile('results/arrivals.database.csv', arrivalsThatFailed, true);
};

module.exports = insertArrivals;
