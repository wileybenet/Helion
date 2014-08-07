var levels = [
  'green',
  'yellow',
  'red'
];

module.exports = {
  process: function(str, level) {
    console.log('\n  PROC '+str[levels[level]]);
  },
  api: function(str, level) {
    console.log('\n  API '+str[levels[level]]);
  },
  error: function(err) {
    console.log('\n  ERROR '+err.stack.toString().red);
  },
  fatal: function(err) {
    console.log('\n  UNCAUGHT ERROR '+err.stack.toString().red);
  }
};