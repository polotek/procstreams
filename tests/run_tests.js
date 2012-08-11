// FAILS=0
// for i in tests/test-*.js; do
//   echo $i
//   node $i || let FAILS++
// done
// exit $FAILS

var fs = require('fs')
  , $p = require(__dirname + '/..');

fs.readdir('tests', function(err, testFiles) {
  if(err) {
    console.error('Could not read test files');
    throw err;
  }

  var chain, fails = 0;
  testFiles
    .filter(function(file) {
        return /^test-[a-zA-Z_.-]+\.js$/.test(file);
      })
    .forEach(function(file, idx) {
      console.log(file + '\n------');
      // add each test run to the pipe chain
      var path = 'tests/' + file;
      chain = chain ? chain.then('node', path) : $p('node', path);
      chain.on('close', function(code) {
        if(code) {
          fails++;
        }
      });
    });
  // chain now has a pipe of all test files ready to be run sequentially
  chain.on('close', function() {
    console.log('\n' + fails + ' tests failed');
  });
});
