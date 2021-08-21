const wait = require('wait');
const fetchArrivals = require('./fetchArrivals');
const { readFile, writeFile } = require('../fs');

const getArrivals = async ({ retry, delay, limit }) => {
  // this array will contain the ships that throw any error
  // with these we could save a temp file to retry later
  const shipsThatFailed = [];

  let ships;

  try {
    ships = await readFile(`results/ships${retry ? '.error' : ''}.csv`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;

    // if there is nothing to process, exit with a custom error
    throw new Error(
      `There is no ships ${retry ? 'error file to retry.' : 'file to process.'}`
    );
  }

  // here we separate the ones that will be process now. 0 means all
  if (limit !== 0 && ships.length > limit) {
    // save those that exceed as errors (to retry later)
    ships.slice(limit).map((x) => shipsThatFailed.push(x));
    ships = ships.slice(0, limit);
  }

  let arrivals = [];

  // start the progress bar
  global.progressBar.start(ships.length, 0);

  for (const ship of ships) {
    try {
      const aux = await fetchArrivals(ship);
      arrivals = [...arrivals, ...aux];
    } catch (err) {
      // save the ship to retry later
      shipsThatFailed.push(ship);
    }

    global.progressBar.increment();
    await wait(delay);
  }

  // save results overwriting the previous file if this was a normal run
  // if this is a retry, send false in order to append the results
  await writeFile('results/arrivals.csv', arrivals, !retry);

  // save errors overwriting the previous file to only have the latest errors
  await writeFile('results/ships.error.csv', shipsThatFailed, true);
};

module.exports = getArrivals;
