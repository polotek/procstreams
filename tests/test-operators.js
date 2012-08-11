var assert = require('assert')
  , timer = require(__dirname + '/timers').timer
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')

exec('echo && echo pass', function(err, output) {
  assert.ifError(err)
  assert.equal('pass', output.toString().trim())

  var t = timer()
  $p('echo').and('echo pass')
    .data(function(err, output) {
      t.stop()
      assert.equal('pass', output.toString().trim())
    })
})

exec('fail || echo pass', function(err, output) {
  assert.ifError(err)
  assert.equal('pass', output.toString().trim())

  var t = timer()
  $p('fail')
    .on('error', function(){})
    .or('echo pass')
    .data(function(err, output) {
      t.stop()
      assert.equal('pass', output.toString().trim())
    })
})

exec('fail; echo pass', function(err, output) {
  assert.ifError(err)
  assert.equal('pass', output.toString().trim())

  var t = timer()
  $p('fail')
    .on('error', function(){})
    .then('echo pass')
    .data(function(err, output) {
      t.stop()
      assert.equal('pass', output.toString().trim())
    })
})

exec('echo && echo pass && echo pass2', function(err, output) {
  assert.ifError(err)
  assert.equal('pass\npass2', output.toString().trim())

  var t = timer()
  $p('echo')
    .and('echo pass')
    .and('echo pass2')
      .data(function(err, output) {
        t.stop()
        assert.equal('pass\npass2', output.toString().trim())
      })
})

exec('fail || echo pass && echo pass2', function(err, output) {
  assert.ifError(err)
  assert.equal('pass2', output.toString().trim())

  var t = timer()
  $p('fail')
    .on('error', function(){})
    .or('echo pass')
    .and('echo pass2')
      .data(function(err, output) {
        t.stop()
        assert.equal('pass2', output.toString().trim())
      })
})
