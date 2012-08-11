var assert = require('assert')
  , timer = require('./timers').timer
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')
  , Stream = require('stream').Stream

exec('cat tests/fixtures/3lines.txt | wc -l', function(err, output) {
  assert.ifError(err)
  assert.equal('3', output.toString().trim())

  var t = timer()
  $p('cat tests/fixtures/3lines.txt').pipe('wc -l')
    .data(function(err, output) {
      t.stop()
      assert.equal('3', output.toString().trim())
    })
})

exec('cat tests/fixtures/10lines.txt | grep "even" | wc -l'
  , function(err, output) {
    assert.ifError(err)
    assert.equal('5', output.toString().trim())

    var t = timer()
    $p('cat tests/fixtures/10lines.txt')
      .pipe('grep even')
      .pipe('wc -l')
        .data(function(err, output) {
          t.stop()
          assert.equal('5', output.toString().trim())
        })
})

exec('cat tests/fixtures/10lines.txt | grep "even"'
  , function(err, output) {
    if(err) { throw err }
    
    var t = timer()
    var out = new Stream
    out.writable = true
    
    var data = ''
    out.write = function (buf) { data += buf } 
    out.end = function () {
      assert.equal(data, output)
      t.stop()
    }
    
    $p('cat tests/fixtures/10lines.txt')
      .pipe('grep even')
      .pipe(out)
})
