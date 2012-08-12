var Stream = require('stream')
  , util = require('util');

var PassThrough = function() {
  Stream.apply(this, arguments);
  this.readable = this.writable = true;
}
util.inherits(PassThrough, Stream);
PassThrough.prototype.write = function(data) {
  this.emit('data', data);
}
PassThrough.prototype.end = function(data) {
  if(data) { this.write(data); }

  this.readable = false;
  this.writable = false;

  this.emit('end');
}

module.exports = PassThrough;
