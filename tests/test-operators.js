var assert = require('assert')
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')
  , opts = { out: false }

exec('fail || echo "pass"', function(err, output) {
  if(err) { throw err }
  assert.equal('pass', output.trim())

  $p('fail', opts).or('echo "pass"', opts)
    .on('start', function() {
      this.stdout.on('data', function(output) {
        assert.equal('pass', output.toString().trim())
      })
    });

})
