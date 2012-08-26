exports.timer = function(delay, msg) {
    var t = {
      stop: function() {
        clearTimeout(t._id)
      }
    }
    t._id = setTimeout(function() {
      throw new Error('Timer timed out' + (msg ? ': ' + msg : ''))
    }, delay || 1000)

    return t
}

exports.multiTimer = function(stops, delay, msg, callback) {
  if(typeof msg === 'function') {
    callback = msg
    msg = null
    if(typeof delay === 'string') {
      msg = delay
      delay = null
    }
  }

  if(typeof delay === 'functon') {
    callback = delay
    msg = null
    delay = null
  }

  stops = stops || 1
  var t = exports.timer(delay, msg)
  t._stop = t.stop
  t.stop = function() {
    --stops
    if(stops === 0) {
      t._stop()
      if(typeof callback === 'function') {
        return callback();
      }
    } else if (stops < 0) {
      throw new Error('Too many timer stops: ', msg)
    }
  }

  return t
}
