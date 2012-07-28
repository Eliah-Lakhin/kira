module.exports = function(grunt) {
    var jstdServerProcess = null;

    grunt.registerTask("jstdServer", "JsTestDriver server starting up", function() {
        var done = grunt.utils._.debounce(this.async(), 300);

        var exec = require("child_process").exec;

        grunt.config.requires("jstdServer");
        var port = grunt.config.get("jstdServer").port,
            config = grunt.config.get("jstdServer").config,
            driver = grunt.config.get("jstdServer").driver;

        var start = function() {
            grunt.verbose.writeln("Starting JsTestDriver server on port " + port + "...");
            var command = "java -jar " + driver + " --config \"" + config + "\" --port " + port;
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
};