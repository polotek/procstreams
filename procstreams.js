var slice = Array.prototype.slice
  , EventEmitter = require('events').EventEmitter
  , spawn = require('child_process').spawn
  , inherits = require('inherits')
  , utils = require('./protochains')
  , Collector = require('./collector').Collector;

function procPipe(dest, options) {
  options = options || {}

  var source = this
   , dest_stdout
   , dest_stderr;

  if(source._piped) {
    throw new Error('The process has already been piped');
  }
  source._piped = true;

  source.stdout.pipe(dest.stdin);

  // stderr goes to console by default, can be overridden
  if(options.stderr) {
    // Could be an alternate stream to pipe to
    if(typeof options.stderr.pipe == 'function') {
      dest_stderr = options.stderr;
    } else {
      dest_stderr = dest.stderr;
    }

    source.stderr.pipe(dest_stderr);
  }

  dest.emit('pipe', source);

  return dest;
}

// TODO: make this really robust, use optimist parser?
function parseArgs(args) {
  return args.trim().split(/\s+/);
}

function normalizeArguments(cmd, args, opts, callback) {
  if(args) {
    // options object
    if(typeof args != 'string' && !Array.isArray(args)) {
      opts = args;
      callback = opts;
      args = null;
    }
  }

  if(opts) {
    if(typeof opts == 'function') {
      callback = opts;
      opts = {}
    }
  } else {
    opts = {}
  }
  if(!opts.env) { opts.env = process.env; }

  var parsedArgs
   , val;

  if(typeof cmd == 'string') {
    if(typeof args == 'string') { cmd += ' ' + args; }

    parsedArgs = parseArgs(cmd);
    cmd = parsedArgs.shift();

    if(Array.isArray(args)) {
      parsedArgs = parsedArgs.concat(args);
    }
  } else if(Array.isArray(cmd)) {
    if(typeof args == 'string') { args = parseArgs(args); }

    parsedArgs = cmd.concat(args);
    cmd = parsedArgs.shift();
  } else {
    throw new Error('Invalid command');
  }

  return {
    cmd: cmd
    , args: parsedArgs
    , opts: opts
    , callback: callback
  }
}

function collect() {
  var stdout = new Collector()
    , stderr = new Collector();

  this.stdout.pipe(stdout);
  this.stderr.pipe(stderr);

  this.on('exit', function(err, signal) {
    if(err === 0) {
      this.emit('_output', stdout.data, stderr.data);
    }
  }.bind(this));
}

function procStream(cmd, args, opts, callback) {
  if(!cmd) { throw new Error('Missing command'); }

  var proc = null, o = null;

  // this is a process object
  if((cmd === process || typeof cmd.spawn == 'function')) {
    // this is already procstream
    if(typeof cmd.pipe == 'function') {
      if(typeof callback == 'function') {
        cmd.on('exit', callback);
      }
      return cmd;
    } else {
    // this is a process that needs to be enhanced
      proc = procStream.enhance(cmd);
    }
  } else {
  // get the args to create a new procstream
    o = normalizeArguments(cmd, args, opts, callback);
    cmd = o.cmd;
    args = o.args;
    opts = o.opts;
    callback = o.callback;

    proc = spawn(cmd, args, opts);
    proc = procStream.enhance(proc);

    proc._args = o;
  }

  if(opts.out === true) {
    proc.out();
  }

  if(typeof callback == 'function') { proc.on('exit', callback); }

  // TODO: This should be immediate instead of nextTick. But it fails
  // for some reason
  process.nextTick(function() { proc.emit('start'); });
  return proc;
}
procStream.enhance = utils.enhance;
procStream._prototype = {
  out: function out() {
    if(this._out) { return; }
    this._out = true;

    var opts = { end: false }
    this.stdout.pipe(process.stdout, opts);
    this.stderr.pipe(process.stderr, opts);

    return this;
  }
  , data: function data(fn) {
    this.on('_output', fn);
    this.once('start', collect)

    return this;
  }
  , and: function and() {
    var args = slice.call(arguments)
      , dest = new procPromise(args);

    this.on('exit', function(code, signal) {
      if(code === 0) {
        dest.resolve(args);
      }
    });

    return dest;
  }
  , or: function or() {
    var args = slice.call(arguments)
      , dest = new procPromise(args);

    this.on('exit', function(code, signal) {
      if(code !== 0) {
        dest.resolve();
      }
    });

    return dest;
  }
  , then: function then() {
    var args = slice.call(arguments)
      , dest = new procPromise(args);

    this.on('exit', function(code, signal) {
      dest.resolve();
    });

    return dest;
  }
  , pipe: function(cmd, args, options) {
    var source = this
      , dest = procStream.apply(null, arguments);

    if(typeof args != 'string' && !Array.isArray(args)) {
      options = args;
    }
    return procPipe.call(source, dest, options);
  }
}
inherits(procStream, EventEmitter, procStream._prototype);

function procPromise(args) {
  this._args = args;

  this.resolve = procPromise.prototype.resolve.bind(this);
  this.reject = procPromise.prototype.reject.bind(this);
}
procPromise._prototype = {
  resolve: function() {
    process.nextTick(function() {
      var proc = procStream.apply(null, this._args);
      proc._events = utils.mixin({}, this._events);
      return proc;
    }.bind(this));
  }
  , reject: function() {}
}
inherits(procPromise, procStream, procPromise._prototype);

module.exports = procStream;
