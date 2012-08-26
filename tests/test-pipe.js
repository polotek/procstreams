var test = require('tap').test
  , timers = require('./timers')
  , exec = require('child_process').exec
  , $p = require(__dirname + '/..')
  , Stream = require('stream').Stream
  , Collector = require('data-collector-stream')

test('simple pipe', function(assert) {
  exec('cat tests/fixtures/3lines.txt | wc -l', function(err, output) {
    assert.ifError(err)
    assert.equal('3', output.toString().trim())

    var t = timers.timer()
    $p('cat tests/fixtures/3lines.txt').pipe('wc -l')
      .data(function(err, output) {
        assert.ifError(err)

        t.stop()
        assert.equal('3', output.toString().trim())
        assert.end()
      })
  })
})

test('multiple pipes', function(assert) {
  exec('cat tests/fixtures/10lines.txt | grep "even" | wc -l'
    , function(err, output) {
      assert.ifError(err)
      assert.equal('5', output.toString().trim())

      var t = timers.timer()
      $p('cat tests/fixtures/10lines.txt')
        .pipe('grep even')
        .pipe('wc -l')
          .data(function(err, output) {
            assert.ifError(err)

            t.stop()
            assert.equal('5', output.toString().trim())
            assert.end()
          })
    })
})

var getWCStream = function() {
  var wcData = '';
  var wc_l = new Stream
  wc_l.writable = true
  wc_l.readable = true
  wc_l.write = function (buf) { wcData += buf }
  wc_l.end = function (data) {
    if(data) { this.write(data) }

    wc_l.emit('data', wcData.trim().split('\n').length)
    wc_l.emit('end')
  }
  return wc_l
}

var getGrepStream = function() {
  var grep = new Stream
  grep.writable = true
  grep.readable = true
  var grepData = ''
  grep.write = function (buf) { grepData += buf }
  grep.end = function (data) {
    if(data) { this.write(data) }

    grepData = grepData.split('\n').filter(function (line) {
        return line.match(/even/)
    }).join('\n') + '\n'
    grep.emit('data', grepData)
    grep.emit('end')
  }
  return grep
}

test('pipe to a stream', function(assert) {
  exec('cat tests/fixtures/10lines.txt | grep "even"'
    , function(err, output) {
      assert.ifError(err);
      
      var t = timers.timer()
      $p('cat tests/fixtures/10lines.txt')
        .pipe('grep even')
        .pipe(new Collector())
          .data(function(err, stdout) {
            assert.ifError(err)

            t.stop()
            assert.equal(stdout.toString().trim(), output.toString().trim())
            assert.end()
          })
    })
})

test('pipe to and from streams', function(assert) {
  exec('cat tests/fixtures/10lines.txt | grep "even" | wc -l'
    , function(err, output) {
      assert.ifError(err);
      
      var t = timers.multiTimer(2, 3000, function() {
        assert.end()
      })

      $p('cat tests/fixtures/10lines.txt')
        .pipe('grep even')
        .pipe(getWCStream())
        .pipe(new Collector())
          .data(function(err, stdout) {
            assert.ifError(err);

            t.stop()
            assert.equal(stdout.toString().trim(), output.toString().trim())
          })

      $p('echo pass').and('cat tests/fixtures/10lines.txt')
        .pipe('grep even')
        .pipe(getWCStream())
        .pipe(new Collector())
          .data(function(err, stdout) {
            assert.ifError(err);

            t.stop()
            assert.equal(stdout.toString().trim(), output.toString().trim())
          })
    })
})

test('mix stream and proc pipes', function(assert) {
  exec('cat tests/fixtures/10lines.txt | grep "even" | wc -l'
    , function(err, output) {
      assert.ifError(err);

      var t = timers.multiTimer(2)
      var proc = $p('cat tests/fixtures/10lines.txt')
        .pipe(getGrepStream())
          .on('close', function() {
            t.stop()
          })
        .pipe('wc -l')
        .pipe(new Collector())
          .data(function(err, stdout) {
            assert.ifError(err);

            t.stop()
            assert.equal(stdout.toString().trim(), output.toString().trim())
            assert.end()
          })
    })
})
