const axios = require('axios').default;
const JSSoup = require('jssoup').default;
// const fs = require('fs/promises');
const getArguments = require('./getArguments');
const readFile = require('./readFile');
const writeFile = require('./writeFile');
const sleep = require('./sleep');
const printProgressBar = require('./printProgressBar');

// the main module is at the bottom

// this array will contain the arrivals that throw any error
// with these we could save a temp file to retry later
global.arrivalsErrors = [];

const formatCell = (cell) => {
  // the cell could be empty
  if (typeof cell.contents[0]?._text?.trim() === 'undefined')
    return '(Unknown)';

  return cell.contents[0]._text.trim();
};

const formatAge = (text) => {
  const aux = Number.parseInt(text, 10);
  // if the age display is NaN, then save it as 0
  return Number.isNaN(aux) ? 0 : aux;
};

// This will get the passengers of the arrival, format and return them as an array
const fetchPassengers = async (arrival) => {
  try {
    // any network problem will be catched here, and res will be undefined (*)
    const res = await axios.get(arrival.url).catch(() => {});

    // this is for debug purpose
    // const res = {
    //   data: JSON.parse(await fs.readFile('debug/passengersPage.json')),
    // };

    // (*) then here we throw the network error
    if (!res?.data)
      throw new Error(`Can't access ${arrival.date}'s passengers.`);

    const soup = new JSSoup(res.data);

    /*
      First we need to find all the div tags of the soup.
      Then filter them to get the tag that is the first cell in the table,
      which has the text "Passenger".
      Then with it's parent node, we will access all the children cells.
    */
    const { parent } = soup
      .findAll('div')
      .find((x) => x.contents[0]?._text?.trim() === 'Passenger');

    const passengers = [];

    for (let i = 3; i < parent.contents.length; i += 3) {
      passengers.push({
        shipId: arrival.shipId,
        arrivalId: arrival.id,
        id: i / 3 - 1,
        name: formatCell(parent.contents[i]),
        birthPlace: formatCell(parent.contents[i + 1]),
        age: formatAge(formatCell(parent.contents[i + 2])),
      });
    }

    return passengers;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// main
(async () => {
  const { isRetry, delay, max } = getArguments();

  let arrivals = await readFile(
    `results/arrivals${isRetry ? '.error' : ''}.json`
  );

  // if there is nothing to process, exit
  if (arrivals.length === 0) {
    console.error(
      new Error(
        `There is no arrivals ${
          isRetry ? 'error file to retry.' : 'file to process.'
        }`
      )
    );
    process.exit(0);
  }

  // here we separate the ones that will be process now. 0 means all
  if (max !== 0 && arrivals.length > max) {
    // save those that exceed as errors (to retry later)
    arrivals.slice(max).map((x) => global.arrivalsErrors.push(x));

    arrivals = arrivals.slice(0, max);
  }

  let passengers = [];
  let progress = 0;

  for await (const arrival of arrivals) {
    const aux = await fetchPassengers(arrival);

    if (aux.length > 0) {
      passengers = [...passengers, ...aux];
    } else {
      // save the arrival to retry later
      global.arrivalsErrors.push(arrival);
    }

    printProgressBar(++progress, arrivals.length);
    await sleep(delay);
  }

  console.log(`\n${passengers.length} passengers were fetched.`);

  // save results overwriting the previous file if this was a normal run
  // if this is a retry, send false in order to append the results
  await writeFile(`results/passengers.json`, passengers, !isRetry);
  // save errors overwriting the previous file to only have the latest errors
  await writeFile(`results/arrivals.error.json`, global.arrivalsErrors, true);
})();
