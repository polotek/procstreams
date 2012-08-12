var assert = require('assert')
  , timers = require('./timers')
  , Collector = require('data-collector-stream')
  , $p = require(__dirname + '/..')

var t = timers.multiTimer(3)
$p('node tests/bin/out-test2.js')
  .data(function(err, stdout) {
    assert.ifError(err)

    t.stop()
    assert.equal('output 2', stdout.toString().trim())
  })

var env = { 'ENV_TEST': 'env overridden' }
Object.keys(process.env).forEach(function(k) {
  env[k] = process.env[k]
})

$p('node tests/bin/env-test.js'
  , {
    env: env
  })
  .data(function(err, stdout) {
    assert.ifError(err)

    t.stop()
    assert.equal('env overridden', stdout.toString().trim())
  })

var collector = new Collector()
collector.on('end', function() {
  t.stop()
  assert.equal('stderr output test', collector.getData().toString().trim())
})
$p('node tests/bin/err-test.js').pipe('cat', { stderr: collector })
