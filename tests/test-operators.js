var assert = require('assert')
  , timer = require(__dirname + '/timer')
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')
  , opts = { out: false }

exec('echo && echo pass', function(err, output) {
  if(err) { throw err }
  assert.equal('pass', output.trim())

  var t = timer();
  $p('echo', opts).and('echo pass', opts)
    .on('start', function() {
      this.stdout.on('data', function(output) {
        t.stop();
        assert.equal('pass', output.toString().trim())
      })
    });
})

exec('fail || echo pass', function(err, output) {
  if(err) { throw err }
  assert.equal('pass', output.trim())

  var t = timer();
  $p('fail', opts).or('echo pass', opts)
    .on('start', function() {
      this.stdout.on('data', function(output) {
        t.stop();
        assert.equal('pass', output.toString().trim())
      })
    });
})

exec('fail; echo pass', function(err, output) {
  if(err) { throw err }
  assert.equal('pass', output.trim())

  var t = timer();
  $p('fail', opts).then('echo pass', opts)
    .on('start', function() {
      this.stdout.on('data', function(output) {
        t.stop();
        assert.equal('pass', output.toString().trim())
      })
    });
})

exec('echo && echo pass && echo pass2', function(err, output) {
  if(err) { throw err }
  //assert.equal('pass2', output.trim())

  var t = timer();
  $p('fail', opts)
    .or('echo pass', opts)
    .or('echo pass2', opts)
      .on('start', function() {
        this.stdout.on('data', function(output) {
          t.stop();
          assert.equal('pass2', output.toString().trim());
        });
      });
})

exec('fail || echo pass && echo pass2', function(err, output) {
  if(err) { throw err }
  //assert.equal('pass2', output.trim())

  var t = timer();
  $p('fail', opts)
    .or('echo pass', opts)
    .and('echo pass2', opts)
      .on('start', function() {
        this.stdout.on('data', function(output) {
          t.stop();
          assert.equal('pass2', output.toString().trim())
        })
      });
})
