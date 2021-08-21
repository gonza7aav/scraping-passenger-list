/* eslint-disable implicit-arrow-linebreak */

const formatNameFromURL = (url) => url.slice(7).toUpperCase().trim();

const formatURL = (url) =>
  `https://www.hebrewsurnames.com${url.trim().replace(/ /g, '%20')}`;

class Ship {
  constructor(id, url) {
    this.id = id;
    this.name = formatNameFromURL(url);
    this.url = formatURL(url);
  }
}

module.exports = Ship;
