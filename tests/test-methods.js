var test = require('tap').test
  , fs = require('fs')
  , timers = require(__dirname + '/timers')
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')

test('data method returns combined output', function(assert) {
  var processStdout = ''
  process.stdout.on('data', function(d) {
    processStdout += d
  })

  fs.readFile('tests/fixtures/long.txt', function(err, fileData) {
    assert.ifError(err)

    var t = timers.timer()
    $p('cat tests/fixtures/long.txt')
      .data(function(err, stdout, stderr) {
        assert.ifError(err)
 
        t.stop()
        assert.equal(fileData.toString(), stdout.toString())
        assert.end()
      })
  })
})

test('out method sends stdout to process', function(assert) {
  var t = timers.timer()
  exec('node tests/bin/out-test.js', function(err, output) {
    assert.ifError(err)
 
    t.stop()
    assert.equal('output 3', output.toString().trim())
    assert.end()
  })
})
