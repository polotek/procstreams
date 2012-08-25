var test = require('tap').test
  , timers = require('./timers')
  , Collector = require('data-collector-stream')
  , $p = require(__dirname + '/..')

test('out option sends stdout to process', function(assert) {
  var t = timers.timer()
  $p('node tests/bin/out-test2.js')
    .data(function(err, stdout) {
      assert.ifError(err)

      t.stop()
      assert.equal('output 2', stdout.toString().trim())
      assert.end()
    })
})

test('env option overrides proc environment', function(assert) {
  var t = timers.timer()

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
      assert.end()
    })
})

test('stderr option sends stderr to provided stream', function(assert) {
  var t = timers.timer()

  var collector = new Collector()
  collector.on('end', function() {
    t.stop()
    assert.equal('stderr output test', collector.getData().toString().trim())
    assert.end()
  })
  $p('node tests/bin/err-test.js').pipe('cat', { stderr: collector })
})
