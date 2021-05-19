USE master;
GO

CREATE DATABASE ScrapingPassengerList;
GO

USE ScrapingPassengerList;
GO

CREATE TABLE ships (
  id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,

  CONSTRAINT PK_ships PRIMARY KEY (id)
);

CREATE TABLE arrivals (
  ship INT NOT NULL,
  id INT NOT NULL,
  date DATE NOT NULL,
  url VARCHAR(255) NOT NULL,

  CONSTRAINT PK_arrivals PRIMARY KEY (ship, id),
  CONSTRAINT FK_arrivals_ships FOREIGN KEY (ship) REFERENCES ships(id)
);

CREATE TABLE passengers (
  ship INT NOT NULL,
  arrival INT NOT NULL,
  id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  birthPlace VARCHAR(100) NOT NULL,
  age INT NOT NULL,

  CONSTRAINT PK_passengers PRIMARY KEY (ship, arrival, id),
  CONSTRAINT FK_passengers_arrival FOREIGN KEY (ship, arrival) REFERENCES arrivals(ship, id)
);