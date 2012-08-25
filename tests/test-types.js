var test = require('tap').test
  , Stream = require('stream')
  , fs = require('fs')
  , cp = require('child_process')
  , exec = cp.exec
  , spawn = cp.spawn
  , $p = require(__dirname + '/..')

test('the types behave properly', function(assert) {
  var child = spawn('echo "test"')
    , child2 = exec('echo "test" | cat')

  assert.ok($p.isProcess(process), 'process is a process')
  assert.ok($p.isProcess(child), 'spawn returns a process')
  assert.ok($p.isProcess(child2), 'exec returns a process')

  // a process is not a procstream
  assert.ok(!$p.is(process), 'process is not a procstream')
  assert.ok(!$p.is(child), 'child_process is not a procstream');

  var stream = new Stream()
    , file = fs.createReadStream('tests/fixtures/3lines.txt')
  assert.ok($p.isStream(process.stdout), 'process stdout is a stream')
  assert.ok($p.isStream(process.stdin), 'process stdin is a stream')
  assert.ok($p.isStream(stream), 'stream is a stream')
  assert.ok($p.isStream(file), 'filestream is a stream')

  // a normal stream is not a procstream
  assert.ok(!$p.is(process.stdout), 'process streams are not procstreams')
  assert.ok(!$p.is(stream), 'stream is not a procstream')
  assert.ok(!$p.is(file), 'file stream is not a procstream')
  assert.ok(!$p.is(), "falsy check doesn't error")

  var proc = $p('echo "test"')
    , pstream = $p.enhanceStream(stream)
  assert.ok($p.is(proc), 'procstream is a procstream')
  assert.ok($p.is(pstream), 'enhanced stream is a procstream')
  // a procstream is also a process
  assert.ok($p.isProcess(proc), 'procstream is a process')
  // a procstream is not like a normal stream
  assert.ok(!$p.isStream(proc), 'procstream is not a normal stream')
  assert.ok(!$p.isProcess(pstream), 'enhanced stream is not a process')
  assert.ok(!$p.isStream(pstream), 'enhanced stream is not a normal stream')

  assert.end()
})
