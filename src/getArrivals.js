const axios = require('axios').default;
const JSSoup = require('jssoup').default;
const getArguments = require('./getArguments');
const readFile = require('./readFile');
const writeFile = require('./writeFile');
const sleep = require('./sleep');
// const fs = require('fs/promises');

// the main module is at the bottom

// this array will contain the ships that throw any error
// with these we could save a temp file to retry later
global.shipsErrors = [];

const formatDate = (url) => url.trim().slice(-10);
const formatURL = (url) =>
  `https://www.hebrewsurnames.com/${url.trim().replace(/ /g, '%20')}`;

// This will get the arrivals of the ship, format and return them as an array
const fetchArrivals = async (ship) => {
  try {
    // any network problem will be catched here, and res will be undefined (*)
    const res = await axios.get(ship.url).catch(() => {});

    // this is for debug purpose
    // const res = {
    //   data: JSON.parse(await fs.readFile('debug/arrivalsPage.json')),
    // };

    // (*) then here we throw the network error
    if (!res?.data) throw new Error(`Can't access ${ship.name}'s arrivals.`);

    const soup = new JSSoup(res.data);

    /*
      First we need to find all the a tags of the soup.
      Then filter them to get the a tags related to arrivals.
      The map make objects cutting out irrelevant attributes.
      The last filter remove the repeated ones. Why is this needed?
      well, the page will display a different table (but same data)
      depending on the device. I think is a responsive stuff.
    */
    return soup
      .findAll('a')
      .filter((x) => x.attrs.href.startsWith('arrival_'))
      .map((el, idx) => ({
        shipId: ship.id,
        id: idx,
        date: formatDate(el.attrs.href),
        url: formatURL(el.attrs.href),
      }))
      .filter((el, idx, arr) => idx === arr.findIndex((x) => x.url === el.url));
  } catch (err) {
    console.error(err);
    return [];
  }
};

// main
(async () => {
  const { isRetry, delay, max } = getArguments();

  let ships = await readFile(`results/ships${isRetry ? '.error' : ''}.json`);

  // if there is nothing to process, exit
  if (ships.length === 0) {
    console.error(
      new Error(
        `There is no ships ${
          isRetry ? 'error file to retry.' : 'file to process.'
        }`
      )
    );
    process.exit(0);
  }

  // here we separate the ones that will be process now. 0 means all
  if (max !== 0 && ships.length > max) {
    // save those that exceed as errors (to retry later)
    ships.slice(max).map((x) => global.shipsErrors.push(x));

    ships = ships.slice(0, max);
  }

  let arrivals = [];
  let progress = 0;

  for await (const ship of ships) {
    const aux = await fetchArrivals(ship);

    if (aux.length > 0) {
      console.log(
        `[${++progress}/${ships.length}] ${ship.name}'s arrivals fetched.`
      );
      arrivals = [...arrivals, ...aux];
    } else {
      // save the ship to retry later
      global.shipsErrors.push(ship);
    }

    await sleep(delay);
  }

  // save results overwriting the previous file if this was a normal run
  // if this is a retry, send false in order to append the results
  await writeFile(`results/arrivals.json`, arrivals, !isRetry);
  // save errors overwriting the previous file to only have the latest errors
  await writeFile(`results/ships.error.json`, global.shipsErrors, true);
})();
