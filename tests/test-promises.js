var test = require('tap').test
  , fs = require('fs')
  , timers = require(__dirname + '/timers')
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')
  , nop = function() {}


test('proc promises', function(assert) {
  assert.test('and method on promise fires on success', function(assert) {
    var t = timers.timer()
    $p('echo one')
      .and('echo two')
      .and('echo three')
        .data(function(err, stdout, stderr) {
          t.stop()
          assert.equal('three', stdout.toString().trim())
          assert.end()
        })
  })

  assert.test('or method on promise fires on failure', function(assert) {
    var t = timers.timer()
    $p('echo one')
      .and('fail two').on('error', nop)
      .or('echo three')
        .data(function(err, stdout, stderr) {
          t.stop()
          assert.equal('three', stdout.toString().trim())
          assert.end()
        })
  })

  assert.test('then method on promise fires on success', function(assert) {
    var t = timers.timer()
    $p('echo one')
      .then('echo two')
      .then('echo three')
        .data(function(err, stdout, stderr) {
          t.stop()
          assert.equal('three', stdout.toString().trim())
          assert.end()
        })
  })

  assert.test('then promise fires on failure', function(assert) {
    var t = timers.timer()
    $p('echo one')
      .then('fail two').on('error', nop)
      .then('echo three')
        .data(function(err, stdout, stderr) {
          t.stop()
          assert.equal('three', stdout.toString().trim())
          assert.end()
        })
  })

  assert.test('promise events are transfered to procstream', function(assert) {
    var t = timers.timer()
    var outProc
    $p('echo one')
      .and('echo two')
      .and('echo three')
        .on('start', function() {
          outProc = this
        })
        .out()

    process.stdout.on('pipe', function(source) {
      t.stop()
      assert.equal(source, outProc.stdout)
      assert.end()
    })
  })

  assert.test('promises can be piped', function(assert) {
    var t = timers.timer()
    $p('echo one')
      .and('echo two')
      .and('echo three')
      .pipe('cat')
        .data(function(err, stdout, stderr) {
          t.stop()
          assert.equal('three', stdout.toString().trim())
          assert.end()
        })
  })

  assert.end()
})
