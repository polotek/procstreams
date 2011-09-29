var spawn = require('child_process').spawn
  , slice = Array.prototype.slice;

function procPipe(dest, options, callback) {
  options = options || {}

  var source = this
   , dest_stdout
   , dest_stderr;

  if(source._piped) { throw new Error('The process has already been piped'); }
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

  var onexit = function(exit, signal) {
    // emitting end on the source pipes should trigger cleanup routines
    source.stdout.emit('end');
    source.stderr.emit('end');

    if(typeof callback == 'function') { callback(exit, signal); }
  }

  source.on('exit', onexit);

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
    if(typeof opts == 'fuction') {
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
    cmd = parsedArgs.unshift();
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

function procStream(cmd, args, opts, callback) {
  if(!cmd) { throw new Error('Missing command'); }

  if((cmd === process || typeof cmd.spawn == 'function') && typeof cmd.pipe == 'function') {
    return cmd;
  }

  var o = normalizeArguments(cmd, args, opts, callback);
  cmd = o.cmd;
  args = o.args;
  opts = o.opts;
  callback = o.callback;

  var child = spawn(cmd, args, opts);

  child.out = function out() {
    if(child._out) { return; }
    child._out = true;

    var opts = { end: false }
    child.stdout.pipe(process.stdout, opts);
    child.stderr.pipe(process.stderr, opts);
  }

  child.and = function and() {
    var source = child
     , args = slice.call(arguments);

    source.on('exit', function(exit, signal) {
      if(exit === 0) {
        process.nextTick(function() {
          procStream.apply(null, args);
        });
      }
    });
  }

  child.or = function or() {
    var source = child
     , args = slice.call(arguments);

    source.on('exit', function(exit, signal) {
      if(exit !== 0) {
        process.nextTick(function() {
          procStream.apply(null, args);
        });
      }
    });    
  }

  child.then = function then() {
    var source = child
      , args = slice.call(arguments);

    source.on('exit', function(exit, signal) {
      process.nextTick(function() {
        procStream.apply(null, args);
      });
    });
  }

  child.pipe = procPipe;

  if(opts.out !== false) {
    child.out();
  }

  if(typeof callback == 'function') { child.on('exit', callback); }

  return child;
}

module.exports = procStream;
