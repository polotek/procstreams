var test = require('tap').test
  , timers = require('./timers')
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

    assert.test('argument combinations', function(assert) {
      var t = timers.multiTimer(6, 3000, function() {
        assert.end()
      })

      $p('node --version', function() {
        t.stop()
      })

      $p('node', '--version', function() {
        t.stop()
      })

      $p('node --version', null, null, function() {
        t.stop()
      })

      $p('node --version', function() {
        t.stop()
      })

      $p('node --version', { out: true }, function() {
        t.stop()
      })

      $p('node', '--version', { out: true }, function() {
        t.stop()
      })
    })

    assert.test('args with quotes and newlines', function(assert) {
      var t = timers.timer()
      $p('echo "new\nline"')
        .data(function(err, output) {
          t.stop()
          assert.equal('new\nline', output.toString().trim())
          assert.end()
        })
    })

    assert.test('non-trivial args', function(assert) {
      var t = timers.timer()
      $p('echo "foo" "bar baz" \'fizz buzz\'')
        .data(function(err, output) {
          t.stop()
          assert.equal('foo bar baz fizz buzz', output.toString().trim())
          assert.end()
        })
    })

    assert.end()
  })
})
