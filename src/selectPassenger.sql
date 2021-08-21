SELECT
  p.`name` AS "Passenger",
  p.`birthPlace` AS "Birth Place",
  p.`age` AS "Age",
  s.`name` AS "Ship",
  a.`date` AS "Arrival"
FROM `scraping-passenger-list`.`passengers` AS p
JOIN `scraping-passenger-list`.`arrivals` AS a
  ON p.`arrival` = a.`id` AND p.`ship` = a.`ship`
JOIN `scraping-passenger-list`.`ships` AS s
  ON a.`ship` = s.`id`
-- WHERE
ORDER BY a.`date`, p.`name` ASC
