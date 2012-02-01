var assert = require('assert')
  , fs = require('fs')
  , timer = require(__dirname + '/timers').timer
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')

exec('node does-not-exist', function(err, stdout, stderr) {
  assert.ok(err)

  var t = timer()
  $p('node does-not-exist')
    .data(function(err, stdout, stderr) {
      t.stop()

      assert.ok(err)
      assert.notStrictEqual(err.code, 0)
      assert.ok(stderr && /does-not-exist/.test(stderr))
    })
})
