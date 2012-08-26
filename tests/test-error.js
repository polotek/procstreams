var test = require('tap').test
  , fs = require('fs')
  , timers = require(__dirname + '/timers')
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')

test('proc errors', function(assert) {
  exec('node does-not-exist', function(err, stdout, stderr) {
    assert.ok(err)

    assert.test('data method returns error', function(assert) {
      var t = timers.timer()
      $p('node does-not-exist')
        .data(function(err, stdout, stderr) {
          t.stop()

          assert.ok(err)
          assert.notEqual(0, err.code)
          assert.ok(stderr && /does-not-exist/.test(stderr))
          assert.end()
        })
    })

    assert.test('error event raised with code', function(assert) {
      var t = timers.timer()
      var err = null
      $p('node does-not-exist')
        .on('error', function(_err) {
          err = _err
        })
        .on('close', function(errCode) {
          t.stop()
          assert.ok(err)
          assert.notEqual(0, err.code)
          assert.equal(errCode, err.code)
          assert.end()
        })
    })

    assert.test('error event raised with kill signal', function(assert) {
      var t = timers.timer()
      var err = null
        , proc = null
      proc = $p('node does-not-exist')
        .on('error', function(_err) {
          err = _err
        })
        .on('close', function(errCode, signal) {
          t.stop()
          assert.ok(err)
          assert.ok(err.signal)
          assert.equal(signal, err.signal)
          assert.end()
        })

      process.nextTick(function() {
        proc.kill()
      })
    })

    assert.end()
  })
})
