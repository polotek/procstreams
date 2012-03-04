var assert = require('assert')
  , fs = require('fs')
  , multiTimer = require(__dirname + '/timers').multiTimer
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')
  , nop = function() {}


var t = multiTimer(5)
$p('echo one')
  .and('echo two')
  .and('echo three')
    .data(function(err, stdout, stderr) {
      t.stop()
      assert.equal('three', stdout.trim())
    })

$p('echo one')
  .and('fail two').on('error', nop)
  .or('echo three')
    .data(function(err, stdout, stderr) {
      t.stop()
      assert.equal('three', stdout.trim())
    })

$p('echo one')
  .then('echo two')
  .then('echo three')
    .data(function(err, stdout, stderr) {
      t.stop()
      assert.equal('three', stdout.trim())
    })

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
  assert.strictEqual(source, outProc.stdout)
})

$p('echo one')
  .and('echo two')
  .and('echo three')
  .pipe('cat')
    .data(function(err, stdout, stderr) {
      t.stop()
      assert.equal('three', stdout.trim())
    })
