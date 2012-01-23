var assert = require('assert')
  , fs = require('fs')
  , timer = require(__dirname + '/timers').timer
  , $p = require(__dirname + '/..')
  , opts = { out: false }

var processStdout = ''
process.stdout.on('data', function(d) {
  processStdout += d
})

fs.readFile('tests/fixtures/long.txt', function(err, fileData) {
  if(err) { throw err }

  var t = timer()
  $p('cat tests/fixtures/long.txt', opts)
    .data(function(stdout, stderr) {
      t.stop()
      assert.equal(fileData, stdout)
    })
})
