# scraping-passenger-list

<div align='center'>

![GitHub release](https://img.shields.io/github/v/release/gonza7aav/scraping-passenger-list?label=release&color=informational)
![GitHub repository size](https://img.shields.io/github/repo-size/gonza7aav/scraping-passenger-list?label=size&color=informational)
![Repository license](https://img.shields.io/github/license/gonza7aav/scraping-passenger-list?label=license&color=informational)

[Spanish](README.es.md)

</div>

A bundle of web scraping scripts that harvest information about ships, arrivals and passengers from [Jewish Genealogy in Argentina](https://www.hebrewsurnames.com/).

Result files can be imported into a SQL database for querying. These files are available in [Releases](https://github.com/gonza7aav/scraping-passenger-list/releases).

## 📑 Table of Contents

- [💡 Motivation](#-Motivation)
- [🚧 Prerequisites](#-Prerequisites)
- [🛠️ Install](#-Install)
- [🚀 Usage](#-Usage)
  - [🔍 Getting some information](#-Getting-some-information)
    - [🚩 Flags](#-Flags)
  - [♻️ Retrying those which failed](#-Retrying-those-which-failed)
  - [🔣 Querying the database](#-Querying-the-database)
- [📝 License](#-License)

## 💡 Motivation

My mother's family emigrated mainly from _Czech Republic_. While looking for them in some passenger lists, a couple of problems appeared. The first was the last name. I still don't quite understand how it works, but women have their last name "changed" by adding "ova". For example, "Vonka" is "Vonkova". The second was how they were registered when they arrived in _Argentina_. When the names were somewhat complex, they were changed to a similar one from here. For example, "Jan" to "Juan" or "František" to "Francisco".

This made things more difficult, I needed to look for all the possibilities. What was my solution? Regular expressions. But since the page had no option to search with them, I decided to copy its information to a personal database to work from there.

## 🚧 Prerequisites

- _[Node.js](https://nodejs.org/)_

If you are going to create the database and query it, you also need:

- _[MySQL](https://www.mysql.com/)_

You can import the `.csv` files to your preferred database service. But this code only cover _MySQL_.

## 🛠️ Install

1. Download this repository

2. Install the dependencies

   ```console
   npm install
   ```

3. Fill `.env.sample` file and rename it to `.env`

## 🚀 Usage

### 🔍 Getting some information

These are the scraping scripts you can run:

- Get ships

  ```console
  npm run get-ships
  ```

  Search for available ships in the page. Then, they will be written in `ships.csv`.

- Get arrivals

  ```console
  npm run get-arrivals -- [flags]
  ```

  Look for the arrivals of every ship in `ships.csv`. So, you must have run `get-ships` before.

  Then, the results will be saved in `arrivals.csv`. If any request failed over the network or due to a limit, it will be in `ships.error.csv` to retry them later.

- Get passengers

  ```console
  npm run get-passengers -- [flags]
  ```

  Get the passenger list of every arrival in `arrivals.csv`. So, you have to run the `get-arrivals` command before.

  After it, all passengers could be found in `passengers.csv`. If any request failed over the network or due to a limit, it will be in `arrivals.error.csv` to retry them later.

#### 🚩 Flags

I added these to modify the behaviour without changing a config file or some constant inside the script.

- Limit the amount of work to do

  Example:

  ```console
  npm run get-arrivals -- [-l | --limit <number>]
  ```

  When you set a limit, some request or insert may exceed it. So, it will be saved in a `.error.csv` file in order to be resumed later. The default value is 500. With 0 we set no limit.

- Change the delay

  Example:

  ```console
  npm run get-passengers -- [-d | --delay <number>]
  ```

  The default value is 200ms. **It's not recommended to go below that** without knowing how many request the server could handle/allows. I am not responsible for any ban for making too many requests in a very short time.

### ♻️ Retrying those which failed

If you encountered a failure or setted a limit, then you have a `.error.csv` file and here is what you should do to retry those.

Example: If you want to retry getting the arrivals of ships that failed

```console
npm run get-arrivals -- [-r | --retry]
```

This search for the arrivals of ships in `ships.error.csv`. The results will appended to `arrivals.csv`. Same logic for others commands.

### 🔣 Querying the database

Wait. What database? Well... first you need to create it running:

```console
npm run init-database
```

With a database created, you can insert the result files into it with:

- Ships

  ```console
  npm run insert-ships -- [flags]
  ```

- Arrivals

  ```console
  npm run insert-arrivals -- [flags]
  ```

- Passengers

  ```console
  npm run insert-passengers -- [flags]
  ```

By the time I am writing this, I harvested almost 1.2 million passengers. Inserting this quantity will take a while... like several minutes. So, stretch out and go get some coffee.

Once finished, you will be able to query the `scraping-passenger-list` database. You don't have to worry about table joins, I leave a template called [`selectPassenger.sql`](src/selectPassenger.sql).

## 📝 License

Copyright © 2021 _Aguirre Gonzalo Adolfo_.
This project is _[MIT](LICENSE)_ licensed.
