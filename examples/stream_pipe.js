var $p = require('../');

$p('cat ../tests/fixtures/10lines.txt')
  .pipe('grep even')
  .pipe('wc -l')
  .pipe(process.stdout)
;
