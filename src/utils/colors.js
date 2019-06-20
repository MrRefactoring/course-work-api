const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';

const end = '\x1b[0m';

const paint = (color, message) => color + message + end;

module.exports = {
  red: (message) => paint(red, message),
  green: (message) => paint(green, message),
  yellow: (message) => paint(yellow, message)
};
