[clojarse-js](http://mattfenwick.github.io/clojarse-js/)
=================

A pure Javascript library for parsing Clojure code into syntax trees.



# Installation #

If you're using npm:

    $ npm install clojarse-js

Or clone it from github:

    $ git clone git@github.com:mattfenwick/clojarse-js.git



# License #

MIT.  Please don't use it for evil.



# Examples #

Import it as a library from JavaScript code:

    var c = require('clojarse-js');
    // first the CST
    console.log(JSON.stringify(c.parseCst('(^a ~b @c)'), null, 2));
    // now for an AST
    console.log(JSON.stringify(c.parseAst('(^a ~b @c)'), null, 2));

Or use its simple command line interface:

    $ echo '(^a ~b @c)' | node main.js



# Caveats #

The goal is to parse a superset of Clojure's syntax.  Therefore, some things
which clojarse-js parses may be invalid from Clojure's point of view.



# Strategy #

### parse CST ###
 
determine start, end of each hierarchical form and token
   
errors possible:  first one will terminate parsing

 
### build AST ###

convert the CST into an AST, throwing away some information and simplifying
the structure of the tree:

 - expand built-in reader macros

   - `#'abc` -> `(var abc)`
   - `'qrs` -> `(quote qrs)`
   - `@abc` -> `(clojure.core/deref abc)`
   - `~abc` -> `(clojure.core/unquote abc)`
   - `~@abc` -> `(clojure.core/unquote-splicing abc)`

 - fold metadata into "owner" node

Errors are not expected -- any errors should represent bugs.

