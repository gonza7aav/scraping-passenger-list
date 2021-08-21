const mysql = require('mysql');

// setting up enviromental variables
require('dotenv').config();

// create the connection with mysql
const connection = mysql.createConnection({
  host: process.env.DATABASE_HOSTNAME,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
});

const initDatabase = async () => {
  try {
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // create the database
    await new Promise((resolve, reject) => {
      connection.query('CREATE DATABASE `scraping-passenger-list`', (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // create the ships table
    await new Promise((resolve, reject) => {
      connection.query(
          'CREATE TABLE `scraping-passenger-list`.`ships` (' +
          '`id` INT NOT NULL,' +
          '`name` VARCHAR(30) NOT NULL,' +
          '`url` VARCHAR(100) NOT NULL,' +
          'PRIMARY KEY (`id`));',
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    // create the arrivals table
    await new Promise((resolve, reject) => {
      connection.query(
          'CREATE TABLE `scraping-passenger-list`.`arrivals` (' +
          '`ship` INT NOT NULL,' +
          '`id` INT NOT NULL,' +
          '`date` DATE NOT NULL,' +
          '`url` VARCHAR(100) NOT NULL,' +
          'PRIMARY KEY (`ship`, `id`),' +
          'FOREIGN KEY (`ship`) REFERENCES `ships`(`id`));',
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    // create the passengers table
    await new Promise((resolve, reject) => {
      connection.query(
          'CREATE TABLE `scraping-passenger-list`.`passengers` (' +
          '`ship` INT NOT NULL,' +
          '`arrival` INT NOT NULL,' +
          '`id` INT NOT NULL,' +
          '`name` VARCHAR(100) NOT NULL,' +
          '`birthPlace` VARCHAR(50) NOT NULL,' +
          '`age` INT NOT NULL,' +
          'PRIMARY KEY (`ship`, `arrival`, `id`),' +
          'FOREIGN KEY (`ship`, `arrival`) REFERENCES `arrivals`(`ship`, `id`));',
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    connection.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

initDatabase();

console.log('The database was created.');
