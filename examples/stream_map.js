var $p = require('../');
var Stream = require('stream').Stream;

var grepEven = new Stream;
grepEven.readable = true;
grepEven.writable = true;

var data = '';
grepEven.write = function (buf) { data += buf };
grepEven.end = function () {
  this.emit('data', data
    .split('\n')
    .map(function (line) { return line + '\n' })
    .filter(function (line) { return line.match(/even/) })
    .join('')
  );
  this.emit('end');
};

$p('cat ../tests/fixtures/10lines.txt')
  .pipe(grepEven)
  .pipe('wc -l')
  .pipe(process.stdout);
