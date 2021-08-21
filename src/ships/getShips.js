const fetchShips = require('./fetchShips');
const { writeFile } = require('../fs');

const getShips = async () => {
  const ships = await fetchShips();

  // we only fetch one page, so it makes no sense to accumulate the ships in a file
  // that's why we set the overwrite param to true
  await writeFile('results/ships.csv', ships, true);
};

module.exports = getShips;
