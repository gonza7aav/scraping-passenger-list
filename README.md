# scraping-passenger-list

<div align='center'>

![GitHub release](https://img.shields.io/github/v/release/gonza7aav/scraping-passenger-list?color=critical)
![GitHub repository size](https://img.shields.io/github/repo-size/gonza7aav/scraping-passenger-list?label=size&color=informational)
![Repository license](https://img.shields.io/github/license/gonza7aav/scraping-passenger-list?color=informational)

</div>

<!-- summary -->

A bundle of web scraping script that harvest information about ships, arrivals and passengers from [Jewish Genealogy in Argentina](https://www.hebrewsurnames.com/).

The results are some JSON files that could be imported into a SQL database to be processed later. These files are available in [Releases](https://github.com/gonza7aav/scraping-passenger-list/releases).

## 📑 Table of Contents

- [💡 Motivation](#💡-Motivation)
- [🚧 Prerequisites](#🚧-Prerequisites)
- [🛠️ Install](#🛠️-Install)
- [🚀 Usage](#🚀-Usage)
  - [🔍 Getting some information](#🔍-Getting-some-information)
    - [🚩 Flags](#🚩-Flags)
  - [♻️ Retrying those which failed](#♻️-Retrying-those-which-failed)
  - [🔣 Querying the database](#🔣-Querying-the-database)
- [📝 License](#📝-License)

## 💡 Motivation

Some time ago, I was asked about my relationship with a relative. And to be honest, I didn't know how, but I was sure that we are family. So, I started to build my definitive family tree.

My mother's family emigrate mainly from the _Czech Republic_. While I was searching for them in some passenger's list, a couple of problems appeared. First one was the surname. I still don't quite understand how it works, but women have their surname "changed" by adding "ova". For example, "Vonka" will be "Vonkova". The second was how they were registered when arriving in _Argentina_. When names were a bit complex, they changed to a similar one from here. For example, "Jan" to "Juan" or "František" to "Francisco".

These make things harder, I needed to search for all possibilities. What was my solution? Regular expressions. The page didn't have any option to search with them, so I decided to copy its information to a personal database to work from there.

## 🚧 Prerequisites

- _[Node.js](https://nodejs.org/)_
- _[Git](https://git-scm.com/)_ (optional)
- _[SQL Server](https://www.microsoft.com/sql-server/)_ (If you will create the databse to query it)
- _[SQL Server Management Studio](https://docs.microsoft.com/sql/ssms)_ (optional)

## 🛠️ Install

1. Download this repository

   If you have _Git_, you can clone it with:

   ```console
   git clone https://github.com/gonza7aav/scraping-passenger-list.git
   ```

2. Install the dependencies

   ```console
   npm install
   ```

## 🚀 Usage

### 🔍 Getting some information

Inside the project directory, you can:

- Get the ships

  ```console
  npm run get-ships
  ```

  This will search for available ships saving the results in `ships.json`

- Get the arrivals

  ```console
  npm run get-arrivals [flags]
  ```

  This will search for available arrivals from ships in the already created ship's file . So, you must have run `get-ships` before.

  After the run, all results will be saved in `arrivals.json` and a `ships.error.json` could be found. Last one contains the ships that failed. These failures can be caused when there are no available arrivals for that ship, an established limit or by network errors.

- Get the passengers

  ```console
  npm run get-passengers [flags]
  ```

  This will look for the passenger list of all arrivals in a already saved arrivals file. So, you have to run the `get-arrivals` command before.

  After the run, any passengers found will be written in `passengers.json` and a `arrival.error.json` may be created. Last one contains the arrivals that failed. These failures can be caused when there are no passengers for that ship's arrival, an established limit or by network errors.

#### 🚩 Flags

First of all, flags are optional. I added these to modify the behaviour without changing a config file or some constant inside the script.

- Limit the amount of ships/arrivals to fetch

  ```console
  npm run get-arrivals max=100
  ```

  When you set a limit, some work may exceed it. So, it will be saved in a `*.error.json` file in order to be resumed later. If no flag is present, all the work will be processed.

- Change the delay between page fetches

  ```console
  npm run get-passengers delay=500
  ```

  The default value is 1000ms, that is one second. **It's not recommended to go below that** without knowing how many request the page could handle / allows. I am not responsible for any ban for making requests in a very short time.

### ♻️ Retrying those which failed

After fetching the arrivals and passengers, you may have some `*.error.json` files and here is what you should do to retry those.

- Get the arrivals of ships that failed

  ```console
  npm run retry-arrivals [flags]
  ```

  This will search for available arrivals from ships which failed before, in other words, this use the `ships.error.json` file. The results will be appended to `arrivals.json`.

- Get the passengers of arrivals that failed

  ```console
  npm run retry-passengers [flags]
  ```

  This will look for the passenger list of failed arrivals, in other words, this use the `arrivals.error.json` file. The results will be added to `passengers.json`.

### 🔣 Querying the database

Wait. What database? Well... First you need to create it running the file [`initDatabase.sql`](src/initDatabase.sql). If you have _SSMS_, you can run it there.

Remember when I said that I added the flags so you don't have to modify any file? I lied. A bit. In order to connect to the server where you created the database, you need to update the [`config.json`](config.json) file.

With an updated config file, you can insert the result files into the database with:

- Add the ships

  ```console
  npm run insert-ships
  ```

- Add the arrivals

  ```console
  npm run insert-arrivals
  ```

- Add the passengers

  ```console
  npm run insert-passengers
  ```

By the time I am writing this, I harvested almost 1.2 million passengers. Inserting this quantity will take a while... like 20 minutes. So, stretch out and go get some coffee.

Once finished, you will be able to query the `ScrapingPassengerList` database. You don't have to worry about table joins, I leave a template called [`selectPassenger.sql`](src/selectPassenger.sql).

## 📝 License

Copyright © 2021 _Aguirre Gonzalo Adolfo_.
This project is _[MIT](LICENSE)_ licensed
