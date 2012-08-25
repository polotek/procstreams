var test = require('tap').test
  , timers = require(__dirname + '/timers')
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')

test('flexible arguments', function(assert) {
  var version = process.version
  exec('node --version', function(err, output){
    assert.ifError(err)

    assert.equal(version, output.toString().trim())

    assert.test('string cmd with args', function(assert) {
      var t = timers.timer()
      $p('node --version')
        .data(function(err, output) {
          t.stop()
          assert.equal(version, output.toString().trim())
          assert.end()
        })
    })

    assert.test('string cmd, string args', function(assert) {
      var t = timers.timer()
      $p('node',  '--version')
        .data(function(err, output) {
          t.stop()
          assert.equal(version, output.toString().trim())
          assert.end()
        })
    })

    assert.test('string cmd, array args', function(assert) {
      var t = timers.timer()
      $p('node',  ['--version'])
        .data(function(err, output) {
          t.stop()
          assert.equal(version, output.toString().trim())
          assert.end()
        })
    })

    assert.end()
  })
})
