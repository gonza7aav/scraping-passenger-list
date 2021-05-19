USE ScrapingPassengerList
GO

SELECT
  passengers.name AS "Passenger",
  passengers.birthPlace AS "Birth Place",
  passengers.age AS "Age",
  ships.name AS "Ship",
  arrivals.date AS "Arrival"
FROM passengers
JOIN arrivals ON passengers.arrival = arrivals.id AND passengers.ship = arrivals.ship
JOIN ships ON arrivals.ship = ships.id
-- WHERE
ORDER BY arrivals.date, passengers.name ASC
