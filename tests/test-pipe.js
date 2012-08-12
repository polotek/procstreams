var assert = require('assert')
  , timers = require('./timers')
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')
  , Stream = require('stream').Stream

exec('cat tests/fixtures/3lines.txt | wc -l', function(err, output) {
  assert.ifError(err)
  assert.equal('3', output.toString().trim())

  var t = timers.timer()
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

    var t = timers.timer()
    $p('cat tests/fixtures/10lines.txt')
      .pipe('grep even')
      .pipe('wc -l')
        .data(function(err, output) {
          t.stop()
          assert.equal('5', output.toString().trim())
        })
})

var getOutStream = function(t, output) {
  var data = ''
  var out = new Stream
  out.writable = true      
  out.write = function (buf) { data += buf }
  out.end = function () {
    assert.equal(data.trim(), output.toString().trim())
    t.stop()
  }
  return out
}

var getWCStream = function() {
  var wcData = '';
  var wc_l = new Stream
  wc_l.writable = true
  wc_l.readable = true
  wc_l.write = function (buf) { wcData += buf }
  wc_l.end = function () {
    wc_l.emit('data', wcData.trim().split('\n').length)
    wc_l.emit('end')
  };
  return wc_l
}

var getGrepStream = function(t) {
  var grep = new Stream
  grep.writable = true
  grep.readable = true
  var grepData = ''
  grep.write = function (buf) { grepData += buf }
  grep.end = function () {
    t.stop()
    grepData = grepData.split('\n').filter(function (line) {
        return line.match(/even/)
    }).join('\n') + '\n'
    grep.emit('data', grepData)
    grep.emit('end')
  }
  return grep
}

exec('cat tests/fixtures/10lines.txt | grep "even"'
  , function(err, output) {
    if(err) { throw err }
    
    var t = timers.timer()

    $p('cat tests/fixtures/10lines.txt')
      .pipe('grep even')
      .pipe(getOutStream(t, output))
})

exec('cat tests/fixtures/10lines.txt | grep "even" | wc -l'
  , function(err, output) {
    if(err) { throw err }
    
    var t = timers.multiTimer(2)

    $p('cat tests/fixtures/10lines.txt')
      .pipe('grep even')
      .pipe(getWCStream())
      .pipe(getOutStream(t, output))

    $p('echo pass').and('cat tests/fixtures/10lines.txt')
      .pipe('grep even')
      .pipe(getWCStream())
      .pipe(getOutStream(t, output))
})

exec('cat tests/fixtures/10lines.txt | grep "even" | wc -l'
  , function(err, output) {
    if(err) { throw err }
    
    var t = timers.multiTimer(2)
    var proc = $p('cat tests/fixtures/10lines.txt')
      .pipe(getGrepStream(t))
      .pipe('wc -l')
      .pipe(getOutStream(t, output))
})
