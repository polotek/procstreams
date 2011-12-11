var assert = require('assert')
	, exec = require('child_process').exec
	, $p = require(__dirname + '/..')

exec('cat tests/fixtures/3lines.txt | wc -l', function(err, output) {
	if(err) { throw err }
	assert.equal('3', output.trim())

	var opts = { out: false }
	$p('cat tests/fixtures/3lines.txt', opts).pipe('wc -l', opts)
		.stdout.on('data', function(output) {
			assert.equal('3', output.toString().trim())
		})
})