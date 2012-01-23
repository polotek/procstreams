var $p = require(__dirname + '/../../')

$p('echo output 1')
  .pipe('echo output 2')
  .pipe('echo output 3').out()
