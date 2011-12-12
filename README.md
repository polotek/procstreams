`procstreams` is a little experiment with shell scripting in node.

This is a rough first attempt. Right now all it does is make it easier to
create child processes and compose them together in a similar way to unix
command line scripting.

    var $p = require('procstreams');
    $p('cat lines.txt').pipe('wc -l')
      .stdout.on('data', function(err, output) {
          console.log(output); // prints number of lines in the file lines.txt
      })

    $p('mkdir foo')
      .and('cp file.txt foo/')
      .and('rm file.txt')
      .on('exit', function() {
        console.log('done');
      });

### procstream function

The procstream function is the main entry point which creates a child process
that's pipeable and composable. It takes arguments in several formats.

**procstream(cmd, argsArray, options, callback)**

`cmd` can be the name of the command, or an array of strings with cmd and args
or a string of cmd + args.

`args` (optional) can be a string of args or an array of arg strings

`options` (optional) options object

`callback` (optional) callback to be called on the "exit" event from the proc.
It receives the same arguments as the child process exit callback

### options

The options object supports all of the options from [`child_process.spawn`](http://nodejs.org/docs/v0.6.5/api/child_processes.html#child_process.spawn) plus 
a few additions specific to procstream

`out` - Boolean that determines if the proc output is directed to the main
process output

By default when a procstream is created, the stdout and stderr of the child
process is directed to the stdout and stderr of the calling process. This
isn't always what you want. Pass `false` here to disable.

`stderr` - Stream. The stderr of the proc will be directed to this stream if
provided

### procstream methods

Each procstream has a set of methods that aid composition. Each of these
methods takes as input a procstream or a set of arguments like the procstream
function. Each method returns the input procstream so it can be chained.

**in_proc.pipe(out_proc)**

Similar to node's Stream.pipe, this is modeled after unix command piping. The
stdout of in_proc is directed to the stdin of out_proc. Stderr of in_proc is
directed to stderr of out_proc.

**proc1.then(proc2)**

Like 2 commands run in succession (separated by ';'), the proc1 is run to
completion; then proc 2 is run.

**proc1.and(proc2)**

Like the `&&` operator, the proc1 is run to completion; if it exits with a 0
error code, proc2 is run. If the error code is non-zero, proc2 is not run

**proc1.or(proc2)**

Like the `||` operator, the proc1 is run to completion; if it exits with a
non-zero error code, proc2 is run. If the error code is zero, proc2 is not
run.

### Why?

Shell scripting languages are extremely powerful, but they're also annoyingly
esoteric. They're difficult to read because of the terse and obscure syntax.
And for most web programmers they only come up often enough to be frustrating.
Many people now use general purpose languages like python and ruby because
they're more familiar and easily installed in most environments.

But currently node isn't very good for this type of scripting. So procstreams
is my attempt to add some nice abstractions to the node api that enable easier
scripting in javascript.

### Known Issues

* Multiple procs don't chain together properly

### TODO

* Make it easier to get the full output from a proc or proc chain
* Add options for converting the format of proc output, e.g. numbers, json, etc.
* Add better ways to take action at various events in the proc chain execution
* Add nice abstractions for filesystem operations