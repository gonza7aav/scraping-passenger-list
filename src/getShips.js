const axios = require('axios').default;
const JSSoup = require('jssoup').default;
// const fs = require('fs/promises');
const writeFile = require('./writeFile');

// the main module is at the bottom

const formatName = (url) => url.slice(7).toUpperCase().trim();
const formatURL = (url) =>
  `https://www.hebrewsurnames.com${url.trim().replace(/ /g, '%20')}`;

// This will get the ships of the page, format and return them as an array
const fetchShips = async () => {
  try {
    // any network problem will be catched here, and res will be undefined (*)
    const res = await axios
      .get('https://www.hebrewsurnames.com/ships')
      .catch(() => {});

    // this is for debug purpose
    // const res = { data: JSON.parse(await fs.readFile('debug/shipsPage.json')) };

    // (*) then here we throw the network error
    if (!res?.data) throw new Error("Can't access ships page.");

    console.log(`Ships page fetched.`);

    const soup = new JSSoup(res.data);

    /*
      First we need to find all the a tags of the soup.
      Then filter them to get the a tags related to ships.
      The map make objects cutting out irrelevant attributes.
      The last filter remove the repeated ones. Why is this needed?
      well, the page will display a different table (but same data)
      depending on the device. I think is a responsive stuff.
    */
    return soup
      .findAll('a')
      .filter((x) => x.attrs.href.startsWith('/ships_'))
      .map((el, idx) => ({
        id: idx,
        name: formatName(el.attrs.href),
        url: formatURL(el.attrs.href),
      }))
      .filter((el, idx, arr) => idx === arr.findIndex((x) => x.url === el.url));
  } catch (err) {
    console.error(err);
    process.exit(0);
  }
};

// main
(async () => {
  // we only fetch one page, so it makes no sense to accumulate the ships
  // that's why we set the overwrite param to true
  await writeFile(`results/ships.json`, await fetchShips(), true);
})();
