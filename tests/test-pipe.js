var assert = require('assert')
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')
  , opts = { out: false }

exec('cat tests/fixtures/3lines.txt | wc -l', function(err, output) {
  if(err) { throw err }
  assert.equal('3', output.trim())

  $p('cat tests/fixtures/3lines.txt', opts).pipe('wc -l', opts)
    .stdout.on('data', function(output) {
      assert.equal('3', output.toString().trim())
    })
})

exec('cat tests/fixtures/10lines.txt | grep "even" | wc -l'
  , function(err, output) {
    if(err) { throw err }
    assert.equal('5', output.trim())

  $p('cat tests/fixtures/10lines.txt', opts)
    .pipe('grep even', opts)
    .pipe('wc -l', opts)
      .stdout.on('data', function(output) {
        assert.equal('5', output.toString().trim())
      })
})
