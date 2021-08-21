const wait = require('wait');
const fetchPassengers = require('./fetchPassengers');
const { readFile, writeFile } = require('../fs');

const getPassengers = async ({ retry, delay, limit }) => {
  // this array will contain the arrivals that throw any error
  // with these we could save a temp file to retry later
  const arrivalsThatFailed = [];

  let arrivals;

  try {
    arrivals = await readFile(`results/arrivals${retry ? '.error' : ''}.csv`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;

    // if there is nothing to process, exit with a custom error
    throw new Error(
      `There is no arrivals ${
        retry ? 'error file to retry.' : 'file to process.'
      }`
    );
  }

  // here we separate the ones that will be process now. 0 means all
  if (limit !== 0 && arrivals.length > limit) {
    // save those that exceed as errors (to retry later)
    arrivals.slice(limit).map((x) => arrivalsThatFailed.push(x));
    arrivals = arrivals.slice(0, limit);
  }

  let passengers = [];

  // start the progress bar
  global.progressBar.start(arrivals.length, 0);

  for (const arrival of arrivals) {
    try {
      const aux = await fetchPassengers(arrival);
      passengers = [...passengers, ...aux];
    } catch (err) {
      // save the arrival to retry later
      arrivalsThatFailed.push(arrival);
    }

    global.progressBar.increment();
    await wait(delay);
  }

  // save results overwriting the previous file if this was a normal run
  // if this is a retry, send false in order to append the results
  await writeFile('results/passengers.csv', passengers, !retry);

  // save errors overwriting the previous file to only have the latest errors
  await writeFile('results/arrivals.error.csv', arrivalsThatFailed, true);
};

module.exports = getPassengers;
