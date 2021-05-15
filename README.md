# scraping-passenger-list

<div align='center'>

![GitHub release](https://img.shields.io/github/v/release/gonza7aav/scraping-passenger-list?color=critical&label=database)
![GitHub repository size](https://img.shields.io/github/repo-size/gonza7aav/scraping-passenger-list?label=size&color=informational)
![Repository license](https://img.shields.io/github/license/gonza7aav/scraping-passenger-list?color=informational)

</div>

<!-- summary -->

A bundle of web scraping script that harvest information about ships, arrivals and passengers from [Jewish Genealogy in Argentina](https://www.hebrewsurnames.com/).

The results are some JSON files that could be imported into a SQL database to be processed later. They are available in the [Releases](https://github.com/gonza7aav/scraping-passenger-list/releases).

## 📑 Table of Contents

- [💡 Motivation](#💡-Motivation)
- [🚧 Prerequisites](#🚧-Prerequisites)
- [🛠️ Install](#🛠️-Install)
- [🚀 Usage](#🚀-Usage)
  - [🚩 Flags](#🚩-Flags)
- [📂 Results](#📂-Results)
- [📝 License](#📝-License)

## 💡 Motivation

Some time ago, I was asked about my relationship with a relative. And to be honest, I didn't know how, but I was sure that we are family. So, I started to build my definitive family tree.

My mother's family emigrate mainly from the _Czech Republic_. While I was searching for them in the passenger's list, some problem appeared. The first one was the surname. I still don't quite understand how it works, but women have their surname "changed" by adding "ova". For example, "Vonka" will be "Vonkova". The second was the way they were registered when arriving in _Argentina_. When the names were a bit complex, they changed to a similar one from here. For example, "Jan" to "Juan" or "František" to "Francisco".

These make things harder, I needed to search for all possibilities. What was my solution? The regular expression. The page didn't have the option to search with them, so I decided to copy its information to a personal database to work from there.

## 🚧 Prerequisites

- _[Node.js](https://nodejs.org/en/)_
- _[Git](https://git-scm.com/)_ (optional)

## 🛠️ Install

1. Download this repository

   If you have _Git_, you can clone it with:

   ```console
   git clone https://github.com/gonza7aav/scraping-passenger-list.git
   ```

2. Install the dependencies with:

   ```console
   npm install
   ```

## 🚀 Usage

In the project directory, you can:

- Get the ships

  ```console
  npm run get-ships
  ```

  This will save the results in `ships.json`

- Get the arrivals

  ```console
  npm run get-arrivals [flags]
  ```

  To run this, you must have the `ships.json` file. The results will be saved in `arrivals.json`

- Get the passengers

  ```console
  npm run get-passengers [flags]
  ```

  Like the previous one, in order to run this, you must have the `arrivals.json` file. The results will be saved in `passengers.json`

### 🚩 Flags

First of all, the flags are optional. I added these to modify the behaviour without changing a config file or some constant in the script.

- Limit the amount of ships/arrivals to process

  For example, process only the arrivals of 50 ships

  ```console
  npm run get-arrivals max=50
  ```

  When you set a limit, some work may exceed it. So, it will be saved in a `*.error.json` file in order to be processed later. When you want to continue the previously limited run, you need to use a retry command (listed in [Results](#📂-Results) section). If the flag is not present, all the work will be processed.

- Change the delay between page fetchs

  For example, get the passengers with half a second (500ms) of delay between arrivals

  ```console
  npm run get-passengers delay=500
  ```

  The default value is one second, that is 1000ms. I don't recommend to go below that, because I don't know how many request the page allows or could handle. So, it's up to you.

## 📂 Results

Inside the `results` folder, which will be created after the run of the scripts, you will found the JSON files mentioned above.

Also, you could found some `*.error.json` files. These have the ships/arrivals that ended up with errors when fetching the information. With the following commands, it will retry to get data from only the ones that failed.

- Retry the ships that failed

  ```console
  npm run retry-arrivals [flags]
  ```

  This need the `ships.error.json` file. The results will be appended to `arrivals.json`

- Retry the arrivals that failed

  ```console
  npm run retry-passengers [flags]
  ```

  This need the `arrivals.error.json` file. The results will be appended to `passengers.json`

## 📝 License

Copyright © 2021 _Aguirre Gonzalo Adolfo_.
This project is _[MIT](LICENSE)_ licensed
