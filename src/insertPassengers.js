const sql = require('mssql');
const readFile = require('./readFile');
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

(async () => {
  try {
    const passengers = await readFile('./results/passengers.json');

    await sql.connect(sqlConfig);

    let progress = 0;
    for (const passenger of passengers) {
      await sql.query(
        `INSERT INTO passengers (ship, arrival, id, name, birthPlace, age) ` +
          `VALUES (${passenger.shipId}, ${passenger.arrivalId}, ` +
          `${passenger.id}, '${passenger.name}', ` +
          `'${passenger.birthPlace}', ${passenger.age})`
      );

      if (++progress % 1000 === 0)
        console.log(`${progress}/${passengers.length} completed`);
    }

    sql.close();

    console.log(
      `\n${passengers.length} passengers were inserted into the database.`
    );
  } catch (err) {
    console.error(err);
  }
})();
