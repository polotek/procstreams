var Stream = require('stream').Stream
  , inherits = require('inherits');

var Collector = function() {
  this.data = '';
  this.writable = true;
}
inherits(Collector, Stream)
Collector.prototype.write = function(d) {
  this.data +=d;
  this.emit('data', d);
}
Collector.prototype.end = function() {
  this.writable = false;
  this.emit('end');
}
exports.Collector = Collector;
