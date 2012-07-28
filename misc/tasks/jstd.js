/*
 Copyright 2012 Ilya Lakhin (Илья Александрович Лахин)

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

module.exports = function(grunt) {
    var jstdServerProcess = null;

    var exec = require("child_process").exec;

    grunt.registerTask("jstdServer", "JsTestDriver server starting up", function() {
        var done = grunt.utils._.debounce(this.async(), 300);

        grunt.config.requires("jstdServer");
        var port = grunt.config.get("jstdServer").port,
            config = grunt.config.get("jstdServer").config,
            driver = grunt.config.get("jstdServer").driver,
            browsers = grunt.config.get("jstdServer").browsers;

        var start = function() {
            grunt.verbose.writeln("Starting JsTestDriver server on port " + port + "...");
            var command = "java -jar " + driver + " --config \"" + config + "\"";
            if (browsers) {
                if (grunt.utils._.isString(browsers)) {
                    command += " --browser \"" + browsers + "\"";
                } else {
                    grunt.utils._.each(browsers, function(browser) {
                        command += " --browser \"" + browser + "\""
                    });
                }
            }
            command += " --port " + port;
            grunt.verbose.writeln("Command to execute: " + command);
            jstdServerProcess = exec(command, function(error, stdout, stderr) {
                if (error !== null) {
                    grunt.log.writeln("JsTestDriver startup error:");
                    grunt.log.writeln(error);
                    grunt.log.writeln(stdout);
                    grunt.log.writeln(stderr);
                    done(false);
                }
            });
            jstdServerProcess.on("exit", function() {
                jstdServerProcess = null;
            });
            jstdServerProcess.stdout.on("data", function(data) {
                grunt.log.writeln("JsTestDriver server started:");
                grunt.log.writeln(data);
                done(true);
            });
        };

        if (jstdServerProcess !== null) {
            jstdServerProcess.on("exit", function() {
                start();
            });
            jstdServerProcess.kill();
        } else {
            start();
        }
    });

    grunt.registerTask("jstd", "JsTestDriver unit test running", function() {
        var done = this.async();

        grunt.config.requires("jstdServer");
        var driver = grunt.config.get("jstdServer").driver,
            config = grunt.config.get("jstdServer").config;

        grunt.verbose.writeln("Starting JsTestDriver unit test...");
        var command = "java -jar " + driver + " --config " + config + " --tests all";
        grunt.verbose.writeln("Command to execute: " + command);
        var testProcess = exec(command, function(error, stdout, stderr) {
            if (error !== null) {
                grunt.log.writeln("JsTestDriver test error:");
                grunt.log.writeln(error);
                grunt.log.writeln(stdout);
                grunt.log.writeln(stderr);
                done(false);
            } else {
                grunt.verbose.writeln("JsTestDriver testing finished.");
                if (stdout) {
                    grunt.log.writeln(stdout);
                }
            }
        });
        testProcess.on("exit", function() {
            done(true);
        });
        testProcess.stdout.on("data", function(data) {
            grunt.log.write(data);
        });
    });
};