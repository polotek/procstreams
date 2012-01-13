var assert = require('assert')
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')
  , opts = { out: false }

exec('fail || echo "pass"', function(err, output) {
  if(err) { throw err }
  assert.equal('pass', output.trim())

  var collect = function(proc, args) {
    var data = ''
    proc.stdout.on('data', function(d) { data += d })
    proc.stdout.on('end', function() { console.log("\n---- " + proc._args.cmd + "\n\n" + data) })
  }

  $p('fail', opts).or('echo "pass"', opts)
    //collect(c)
    .on('start', function() {
      this.stdout.on('data', function(output) {
        assert.equal('pass', output.toString().trim())
      })
    });

})
