/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

const { Command, Option, InvalidArgumentError } = require('commander');
const cliProgress = require('cli-progress');
const pkg = require('../package.json');

// adding the cli flags/options
const program = new Command();
program
  .version(pkg.version)
  .addOption(
    new Option('--action <action>', 'type of script')
      .choices(['get', 'insert'])
      .makeOptionMandatory(true)
      .hideHelp(true)
  )
  .addOption(
    new Option('--script <script>', 'script to run')
      .choices(['Ships', 'Arrivals', 'Passengers'])
      .makeOptionMandatory(true)
      .hideHelp(true)
  )
  .option(
    '-d, --delay <milliseconds>',
    'delay in milliseconds',
    (value) => {
      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed)) throw new InvalidArgumentError('Not a number.');
      return parsed;
    },
    '200'
  )
  .option(
    '-l, --limit <number>',
    'limit the process to do',
    (value) => {
      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed)) throw new InvalidArgumentError('Not a number.');
      return parsed;
    },
    '500'
  )
  .option('-r, --retry', 'retry previously failed page request', false)
  .parse(process.argv);

const flags = program.opts();

// create a new progress bar instance
global.progressBar = new cliProgress.SingleBar(
  {
    format: '{bar} {percentage}% | {value}/{total}',
    stopOnComplete: true,
    barsize: 30,
    hideCursor: true,
    emptyOnZero: true,
  },
  cliProgress.Presets.shades_classic
);

(async () => {
  try {
    console.log(`Starting the ${flags.action} ${flags.script.toLowerCase()} scripts`);

    // import the script required
    const script = await require(
      `./${flags.script.toLowerCase()}/${flags.action}${flags.script}`
    );

    await script(flags);

    console.log('The execution of the scripts has finished.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
