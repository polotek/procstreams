var fs = require('fs');

fs.readFile('./cwd-test-file.txt', function (err, file) {
  if(err) {
    console.error(err);
  }
  else {
    console.log(file.toString());
  }
});