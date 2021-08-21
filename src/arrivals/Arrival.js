/* eslint-disable implicit-arrow-linebreak */

const formatDateFromURL = (url) => url.trim().slice(-10);

const formatURL = (url) =>
  `https://www.hebrewsurnames.com/${url.trim().replace(/ /g, '%20')}`;

class Arrival {
  constructor(ship, id, url) {
    this.shipId = ship.id;
    this.id = id;
    this.date = formatDateFromURL(url);
    this.url = formatURL(url);
  }
}

module.exports = Arrival;
