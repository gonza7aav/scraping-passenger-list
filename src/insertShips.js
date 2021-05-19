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
    const ships = await readFile('./results/ships.json');

    await sql.connect(sqlConfig);

    let progress = 0;
    for (const ship of ships) {
      await sql.query(
        `INSERT INTO ships (id, name, url) ` +
          `VALUES (${ship.id}, '${ship.name}', '${ship.url}')`
      );

      if (++progress % 100 === 0)
        console.log(`${progress}/${ships.length} completed`);
    }

    sql.close();

    console.log(`\n${ships.length} ships were inserted into the database.`);
  } catch (err) {
    console.error(err);
  }
})();
