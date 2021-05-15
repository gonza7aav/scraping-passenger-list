const fs = require('fs/promises');

// read a file in a path and return a JSON parsed object
const readFile = async (filename = '') => {
  try {
    const content = JSON.parse(await fs.readFile(filename));
    return content;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }

    console.error(err);
    process.exit(0);
  }
};

module.exports = readFile;
