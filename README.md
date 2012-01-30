`procstreams` is a little experiment with shell scripting in node.

This is a rough first attempt. Right now all it does is make it easier
to create child processes and compose them together in a similar way to
unix command line scripting.

    var $p = require('procstreams');
    $p('cat lines.txt').pipe('wc -l')
      .data(function(stdout, stderr) {
          console.log(stdout); // prints number of lines in the file lines.txt
      });

    $p('mkdir foo')
      .and('cp file.txt foo/')
      .and('rm file.txt')
        .on('exit', function() {
          console.log('done');
        });

## procstream function

The procstream function is the main entry point which creates a child
process that's pipeable and composable. It takes arguments in several
formats. It returns a `ProcStream` object that represents the child process.

    procstream(cmd, argsArray, options, callback)

`cmd` can be the name of the command, or an array of strings with cmd and args
or a string of cmd + args.

`args` (optional) can be a string of args or an array of arg strings

`options` (optional) options object

`callback` (optional) callback to be called on the "exit" event from the proc.
It receives the same arguments as the child process exit callback

### options

The options object supports all of the options from [`child_process.spawn`](http://nodejs.org/docs/v0.6.5/api/child_processes.html#child_process.spawn) plus
a few additions specific to procstreams:

`out` - Boolean that determines if the proc output is directed to the main
process output

By default when a procstream is created, the stdout and stderr of the
child process is directed to the stdout and stderr of the calling
process. This isn't always what you want. Pass `false` here to disable.

`stderr` - Stream. The stderr of the proc will be directed to this stream if
provided


## ProcStream

The ProcStream object represents the child process that is being
executed. It is an `EventEmitter` and it also has various methods for
chaining procstreams together.


### procstream methods

Each procstream has a set of methods that aid composition. Each of these
methods takes as input a procstream or a set of arguments like the
procstream function. Each method returns the input procstream so it can
be chained.

**proc1.pipe(proc2)**

Similar to node's `Stream.pipe`, this is modeled after unix command
piping. The stdout of in_proc is directed to the stdin of out_proc.
Stderr of `proc1` is directed to stderr of `proc2`. This method chains by
returning `proc2`.

`proc2` can also be a node `Stream` object and can be interleaved with piping to
commands:

    var $p = require('procstreams');

    $p('cat tests/fixtures/10lines.txt')
      .pipe('grep even')
      .pipe('wc -l')
      .pipe(process.stdout)

If your `Stream` object has a `write()` function and emits `'data'` events then
you can interleave shell commands with streaming map functions:

    var $p = require('../')
    var Stream = require('stream').Stream

    var grepEven = new Stream
    grepEven.writable = true
    grepEven.readable = true

    var data = ''
    grepEven.write = function (buf) { data += buf }
    grepEven.end = function () {
      this.emit('data', data
        .split('\n')
        .map(function (line) { return line + '\n' })
        .filter(function (line) { return line.match(/even/) })
        .join('')
      )
      this.emit('end')
    }

    $p('cat ../tests/fixtures/10lines.txt')
      .pipe(grepEven)
      .pipe('wc -l')
      .pipe(process.stdout)

**proc1.then(proc2)**

Like 2 commands run in succession (separated by ';'), the proc1 is run
to completion; then proc 2 is run. This method chains by
returning proc2.

**proc1.and(proc2)**

Like the `&&` operator, the proc1 is run to completion; if it exits with
a 0 error code, proc2 is run. If the error code is non-zero, proc2 is
not run. This method chains by returning proc2.

**proc1.or(proc2)**

Like the `||` operator, the proc1 is run to completion; if it exits with
a non-zero error code, proc2 is run. If the error code is zero, proc2 is
not run. This method chains by returning proc2.

**proc.data(fn)**

    $('cat some-large-file.txt')
      .data(function(stdout, stderr) {
        // process the full output of the proc
      })

This function will cause the output of the proc to be collected and
passed to this callback on exit. The callback receives the stdout and
stderr of the proc. This method chains by
returning the same proc.

**proc.out()**

Direct the stdout and stderr of the proc to the calling process. This is
useful if you pass `out: false` as an option but want to pipe out later. This method chains by
returning the same proc.


## Why?

Shell scripting languages are extremely powerful, but they're also
annoyingly esoteric. They're difficult to read because of the terse and
obscure syntax. And for most web programmers they only come up often
enough to be frustrating. Many people now use general purpose languages
like python and ruby because they're more familiar and easily installed
in most environments.

But currently node isn't very good for this type of scripting. So
procstreams is my attempt to add some nice abstractions to the node api
that enable easier scripting in javascript.


## TODO

* Add options for converting the format of proc output, e.g. numbers, json, etc.
* Add better ways to take action at various events in the proc chain execution


## The MIT License

Copyright (c)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
