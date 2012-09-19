Kira
====

Considering the fact that JavaScript is a functional programming language in its basis, it makes possible to do a lot of things in elegant and compact way like in Haskell, Lisp or Scala. But unfortunately JS default environment does not provide many of the things which are traditional for functional languages.

The aim of Kira is extending and improving JavaScript environment in order to make it possible write code in functional style.

Some of Kira's features:
 * Lazy data collections.
 * Numeric ranges.
 * Safe prototype extending without clashes.
 * Function transformers.
 * Avoiding "access of undefined" errors by design.

All Kira's functions are divide into separated modules which could be built and/or installed selectively. And each module is covered by unit tests.

Getting started
---------------

1. Include [production](https://github.com/Eliah-Lakhin/kira/tree/master/build/min) build version or [development](https://github.com/Eliah-Lakhin/kira/tree/master/build/full) version in the head section of your page:

   ```html
   <script src="https://github.com/Eliah-Lakhin/kira/tree/master/build/min" type="text/javascript"></script>
   ```

2. Starting from this moment Kira's features could be access through `kira.moduleName.functionName`. For example:

   ```javascript
   kira.arrays.toSet([1, 2, 5, 1]); // creates set of numbers 1, 2, 5.
   ```

3. In Order to deploy all modules(making them accessible from appropriate type prototypes) use function `kira.deploy()`:

   ```javascript
   kira.deploy();
   [1, 2, 5, 1].toSet(); // creates set of numbers 1, 2, 5.
   ```

4. To undeploy all kira's specific features and return JavaScript environment to initial state use `kira.undeploy()` and `kira.noConflict()`:

   ```javascript
   kira.undeploy(); // [].toSet === undefined
   kira.noConflict(); // kira === undefined
   ```

Building and testing
--------------------

Kira uses [grunt](https://github.com/cowboy/grunt) build system and [JsTestDriver](http://code.google.com/p/js-test-driver/) for unit testing.

After installing Grunt, JsTestDriver and appropriate software use the following commands:

1. `grunt build` - to build the whole project.
2. `grunt build-test` - to build the project and run unit tests.

Building configuration file can be found here: https://github.com/Eliah-Lakhin/kira/blob/master/grunt.js
You may selectively exclude some of the modules from build script, but please keep in mind that modules are placed in dependent order.

License
-------
Copyright (c) Ilya Lakhin(Илья Александрович Лахин) 2012.

Licensed under the Apache License v2.0: http://www.apache.org/licenses/
