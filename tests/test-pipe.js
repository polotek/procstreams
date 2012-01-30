var assert = require('assert')
  , timer = require('./timers').timer
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')
  , Stream = require('stream').Stream

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

exec('cat tests/fixtures/10lines.txt | grep "even" | wc -l'
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
    
    var wc_l = new Stream
    wc_l.writable = true
    wc_l.readable = true
    var wcData = ''
    wc_l.write = function (buf) { wcData += buf }
    wc_l.end = function () {
        wc_l.emit('data', (wcData.split('\n').length - 1) + '\n')
        wc_l.emit('end')
    }
    
    $p('cat tests/fixtures/10lines.txt')
      .pipe('grep even')
      .pipe(wc_l)
      .pipe(out)
})

exec('cat tests/fixtures/10lines.txt | grep "even" | wc -l'
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
    
    var grep = new Stream
    grep.writable = true
    grep.readable = true
    var grepData = ''
    grep.write = function (buf) { grepData += buf }
    grep.end = function () {
        grep.emit('data', grepData.split('\n').filter(function (line) {
            return line.match(/even/)
        }).join('\n'))
        grep.emit('end')
    }
    
    $p('cat tests/fixtures/10lines.txt')
      .pipe(grep)
      .pipe('wc -l')
      .pipe(out)
})
