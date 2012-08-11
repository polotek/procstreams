var assert = require('assert')
  , multiTimer = require('./timers').multiTimer
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')

var version = process.version
exec('node --version', function(err, output){
  assert.ifError(err)

  assert.equal(version, output.trim())

  var t = multiTimer(8)
  $p('node --version')
    .data(function(err, output) {
      t.stop()
      assert.equal(version, output.toString().trim())
    })

  $p('node',  '--version')
    .data(function(err, output) {
      t.stop()
      assert.equal(version, output.toString().trim())
    })

  $p('node',  ['--version'])
    .data(function(err, output) {
      t.stop()
      assert.equal(version, output.toString().trim())
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

  $p('echo "new\nline"')
    .data(function(err, output) {
      t.stop()
      assert.equal('new\nline', output.toString().trim())
    })

  $p('echo "foo" "bar baz" \'fizz buzz\'')
    .data(function(err, output) {
      t.stop()
      assert.equal('foo bar baz fizz buzz', output.toString().trim())
    })
})
