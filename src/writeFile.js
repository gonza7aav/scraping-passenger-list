const fs = require('fs/promises');
const readFile = require('./readFile');

const goUpOneDirectory = (path) => {
  const aux = path.lastIndexOf('/');
  return path.slice(0, aux === -1 ? 0 : aux);
};

// if the path doesn't exist, this will create it recursively
const createPath = async (filename) => {
  const path = goUpOneDirectory(filename);

  if (path !== '') {
    try {
      // this will throw an error if the folder doesn't exist
      await fs.readdir(path);
    } catch (err) {
      if (err.code === 'ENOENT') {
        await createPath(path);
        await fs.mkdir(path);
        console.log(`The folder ${path} was created`);
      } else {
        console.error(err);
        process.exit(0);
      }
    }
  }
};

// Write a file in a path no matter if this does not exist
const writeFile = async (filename = '', content = [], overwrite = true) => {
  // if there is no content, we won't write in the file
  if (content.length === 0) {
    // if you will overwrite with no content, just delete the file
    if (overwrite)
      await fs.rm(filename).catch((err) => {
        if (err.code !== 'ENOENT') console.error(err);
      });
    return;
  }

  // check if you need to create the folder
  await createPath(filename);

  if (!overwrite) content = [...(await readFile(filename)), ...content];

  try {
    await fs.writeFile(`${filename}`, JSON.stringify(content, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(0);
  }
};

module.exports = writeFile;
