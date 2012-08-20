var semver = require('semver');

exports.fix_child_process = function(cp) {
  if(semver.lt(process.versions.node, '0.8.0')) {
    cp.on('exit', function() {
      var self = this
        , args = Array.prototype.slice.call(arguments);

      process.nextTick(function() {
        args.unshift('close');
        self.emit.apply(self, args);
      });
    });
  }
}
