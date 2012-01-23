exports.timer = function(delay, msg) {
    var t = {
      stop: function() {
        clearTimeout(this._id)
      }
    }
    t._id = setTimeout(function() {
      throw new Error('Timer timed out' + (msg ? ': ' + msg : ''))
    }, delay || 1000)

    return t
}

exports.multiTimer = function(stops, delay, msg) {
  stops = stops || 1
  var t = exports.timer(delay, msg)
  t._stop = t.stop
  t.stop = function() {
    if(!--stops) {
      t._stop()
    }
  }

  return t
}
