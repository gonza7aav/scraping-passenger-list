// this will process the cli arguments
const getArguments = () => {
  const userArguments = process.argv.map((x) => x.toLowerCase()).slice(2);

  // the first one always will be the retry string
  // the user use this when run the retry-arrival or retry-passengers
  const isRetry = userArguments[0] === 'retry';

  // then we could have two more arguments delay and max
  // delay will be used to sleep between fetchs, the default is 1000ms
  // max will be the number of fetchs it going to do, the default is all (0)
  // they have the following sintax 'key=value'
  let delay;
  let max;
  let aux;

  for (const argument of userArguments) {
    aux = argument.split('=');

    if (aux[0] === 'delay') {
      delay = Number.parseInt(aux[1], 10);
    } else if (aux[0] === 'max') {
      max = Number.parseInt(aux[1], 10);
    }
  }

  // if they were not setted or were setted wrong, set the default values
  if (typeof delay === 'undefined' || Number.isNaN(delay)) delay = 1000;
  if (typeof max === 'undefined' || Number.isNaN(max)) max = 0;

  return { isRetry, delay, max };
};

module.exports = getArguments;
