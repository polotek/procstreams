var assert = require('assert')
  , fs = require('fs')
  , multiTimer = require(__dirname + '/timers').multiTimer
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')

exec('node does-not-exist', function(err, stdout, stderr) {
  assert.ok(err)

  var t = multiTimer(3)
  $p('node does-not-exist')
    .data(function(err, stdout, stderr) {
      t.stop()

      assert.ok(err)
      assert.notStrictEqual(0, err.code)
      assert.ok(stderr && /does-not-exist/.test(stderr))
    })

  var err = null
  $p('node does-not-exist')
    .on('error', function(_err) {
      err = _err
    })
    .on('exit', function(errCode) {
      t.stop()
      assert.ok(err)
      assert.notStrictEqual(0, err.code)
      assert.strictEqual(errCode, err.code)
    })

  var err = null
    , proc = null
  proc = $p('node does-not-exist')
    .on('error', function(_err) {
      err = _err
    })
    .on('exit', function(errCode, signal) {
      t.stop()
      assert.ok(err)
      assert.ok(err.signal)
      assert.strictEqual(signal, err.signal)
    })

  process.nextTick(function() {
    proc.kill()
  })
})
