module.exports = function(delay, msg) {
    var t = {
      stop: function() {
        clearTimeout(this._id);
      }
    }
    t._id = setTimeout(function() {
      throw new Error('Timer timed out' + (msg ? ': ' + msg : ''));
    }, delay || 1000);

    return t;
}
