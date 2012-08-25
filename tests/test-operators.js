var test = require('tap').test
  , timer = require(__dirname + '/timers').timer
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')

test('and operator only fires on success', function(assert) {
  exec('echo && echo pass', function(err, output) {
    assert.ifError(err)
    assert.equal('pass', output.toString().trim())

    var t = timer()
    $p('echo').and('echo pass')
      .data(function(err, output) {
        t.stop()
        assert.equal('pass', output.toString().trim())
        assert.end()
      })
  })
})

test('or operator only fires on failure', function(assert) {
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
        assert.end()
      })
  })
})

test('then operator fires on success', function(assert) {
  exec('echo; echo pass', function(err, output) {
    assert.ifError(err)
    assert.equal('pass', output.toString().trim())

    var t = timer()
    $p('echo')
      .then('echo pass')
      .data(function(err, output) {
        t.stop()
        assert.equal('pass', output.toString().trim())
        assert.end()
      })
  })
})

test('then operator fires on failure', function(assert) {
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
        assert.end()
      })
  })
})

test('chaining and operator', function(assert) {
  exec('echo && echo && echo pass2', function(err, output) {
    assert.ifError(err)
    assert.equal('pass2', output.toString().trim())

    var t = timer()
    $p('echo')
      .and('echo pass')
      .and('echo pass2')
        .data(function(err, output) {
          t.stop()
          assert.equal('pass2', output.toString().trim())
          assert.end()
        })
  })
})

test('chaining different operators', function(assert) {
  exec('fail || echo pass && echo pass2', function(err, output) {
    assert.ifError(err)
    // assert.equal('pass\npass2', output.toString().trim())

    var t = timer()
    $p('fail')
      .on('error', function(){})
      .or('echo pass')
      .and('echo pass2')
        .data(function(err, output) {
          t.stop()
          assert.equal('pass2', output.toString().trim())
          assert.end()
        })
  })
})
