/* eslint-disable no-underscore-dangle */

const formatCell = (cell) => {
  // the cell could be empty
  if (typeof cell.contents[0]?._text === 'undefined') return '(Unknown)';

  return cell.contents[0]._text.trim();
};

const formatAge = (text) => {
  const aux = Number.parseInt(text, 10);
  // if the age display is NaN, then save it as -1
  return Number.isNaN(aux) ? -1 : aux;
};

class Passenger {
  constructor(arrival, id, row) {
    this.shipId = arrival.shipId;
    this.arrivalId = arrival.id;
    this.id = id;
    this.name = formatCell(row[0]);
    this.birthPlace = formatCell(row[1]);
    this.age = formatAge(formatCell(row[2]));
  }
}

module.exports = Passenger;
