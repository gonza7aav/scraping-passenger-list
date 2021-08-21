const axios = require('axios').default;
const JSSoup = require('jssoup').default;
const Arrival = require('./Arrival');

// This will get the arrivals of a ship, format and return them as an array
const fetchArrivals = async (ship) => {
  const { data } = await axios.get(ship.url);

  const soup = new JSSoup(data);

  /*
    First we need to find all the a tags of the soup.
    Then filter them to get the a tags related to arrivals.
    The map make arrivals objects cutting out irrelevant attributes.
    The last filter remove the repeated ones. Why is this needed?
    well, the page will display a different table (but same data)
    depending on the device. I think is a responsive stuff.
  */
  return soup
    .findAll('a')
    .filter((x) => x.attrs.href.startsWith('arrival_'))
    .map((el, idx) => new Arrival(ship, idx + 1, el.attrs.href))
    .filter((el, idx, arr) => idx === arr.findIndex((x) => x.url === el.url));
};

module.exports = fetchArrivals;
