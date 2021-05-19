const sql = require('mssql');
const readFile = require('./readFile');
const printProgressBar = require('./printProgressBar');
const { database } = require('../config.json');

const sqlConfig = {
  user: database.user,
  password: database.password,
  database: 'ScrapingPassengerList',
  server: database.server,
  options: {
    trustServerCertificate: true,
  },
};

// some dates from the page are wrong
// fix them using the following values
const fixDate = (date) => {
  const aux = date.split('-');
  if (aux[0] === '0000') aux[0] = '2999';
  if (aux[1] === '00') aux[1] = '01';
  if (aux[2] === '00') aux[2] = '01';
  return aux.join('-');
};

(async () => {
  try {
    const arrivals = await readFile('./results/arrivals.json');

    await sql.connect(sqlConfig);

    let progress = 0;
    for (const arrival of arrivals) {
      await sql.query(
        `INSERT INTO arrivals (ship, id, date, url) ` +
          `VALUES (${arrival.shipId}, ${arrival.id}, ` +
          `'${fixDate(arrival.date)}', '${arrival.url}')`
      );

      printProgressBar(++progress, arrivals.length);
    }

    sql.close();

    console.log(
      `\n${arrivals.length} arrivals were inserted into the database.`
    );
  } catch (err) {
    console.error(err);
  }
})();
