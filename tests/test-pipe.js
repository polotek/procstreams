var assert = require('assert')
  , timer = require('./timers').timer
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')

exec('cat tests/fixtures/3lines.txt | wc -l', function(err, output) {
  if(err) { throw err }
  assert.equal('3', output.trim())

  var t = timer()
  $p('cat tests/fixtures/3lines.txt').pipe('wc -l')
    .data(function(output) {
      t.stop()
      assert.equal('3', output.toString().trim())
    })
})

exec('cat tests/fixtures/10lines.txt | grep "even" | wc -l'
  , function(err, output) {
    if(err) { throw err }
    assert.equal('5', output.trim())

    var t = timer()
    $p('cat tests/fixtures/10lines.txt')
      .pipe('grep even')
      .pipe('wc -l')
        .data(function(output) {
          t.stop()
          assert.equal('5', output.toString().trim())
        })
})
