const { createReadStream, createWriteStream } = require('fs');
const { rm, readdir, mkdir } = require('fs/promises');
const { dirname } = require('path');
const { parse, format } = require('fast-csv');

const read = async (path) => {
  const data = [];

  return new Promise((resolve, reject) => {
    createReadStream(path)
      .on('error', (err) => reject(err))
      .pipe(parse({ headers: true }))
      .on('error', (err) => reject(err))
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data));
  });
};

const write = async (path, data = [], overwrite = true) => {
  // if there is no data, we won't write in the file
  if (data.length === 0) {
    // if you will overwrite with no data, just delete the file
    if (overwrite) {
      await rm(path).catch((err) => {
        if (err.code !== 'ENOENT') throw err;
      });
    }
    return;
  }

  // check if you need to create the folder
  try {
    // this will throw an error if the folder doesn't exist
    await readdir(dirname(path));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;

    await mkdir(dirname(path), { recursive: true });
  }

  await new Promise((resolve, reject) => {
    const fileStream = createWriteStream(path, {
      flags: `${overwrite ? 'w' : 'a'}`,
    });

    fileStream.on('error', (err) => reject(err));

    const csvStream = format({
      headers: overwrite,
      includeEndRowDelimiter: true,
    });

    csvStream
      .pipe(fileStream)
      .on('error', (err) => reject(err))
      .on('finish', () => resolve());

    for (const row of data) {
      csvStream.write(row);
    }

    csvStream.end();
  });
};

module.exports = { readFile: read, writeFile: write };
