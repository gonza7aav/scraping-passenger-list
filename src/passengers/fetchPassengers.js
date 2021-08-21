/* eslint-disable no-underscore-dangle */

const axios = require('axios').default;
const JSSoup = require('jssoup').default;
const Passenger = require('./Passenger');

// This will get the passengers of the arrival, format and return them as an array
const fetchPassengers = async (arrival) => {
  const { data } = await axios.get(arrival.url);

  const soup = new JSSoup(data);

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
    passengers.push(
      new Passenger(arrival, i / 3, parent.contents.slice(i, i + 3))
    );
  }

  return passengers;
};

module.exports = fetchPassengers;
