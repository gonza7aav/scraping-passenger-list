const axios = require('axios').default;
const JSSoup = require('jssoup').default;
const Ship = require('./Ship');

// This will fetch the ships of the page, format and return them as an array
const fetchShips = async () => {
  const { data } = await axios.get('https://www.hebrewsurnames.com/ships');

  const soup = new JSSoup(data);

  /*
    First we need to find all the a tags of the soup.
    Then filter them to get the a tags related to ships.
    The map make ships objects cutting out irrelevant attributes.
    The last filter remove the repeated ones. Why is this needed?
    well, the page will display a different table (but same data)
    depending on the device. I think is a responsive stuff.
  */
  return soup
    .findAll('a')
    .filter((el) => el.attrs.href.startsWith('/ships_'))
    .map((el, idx) => new Ship(idx + 1, el.attrs.href))
    .filter((el, idx, arr) => idx === arr.findIndex((x) => x.url === el.url));
};

module.exports = fetchShips;
