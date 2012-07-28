module.exports = function(grunt) {
    grunt.initConfig({
        pkg: "<json:package.json>",
        meta: {
            banner: grunt.file.read("misc/banner.txt")
        },
        lint: {
            grunt: "grunt.js",
            sources: [
                "src/base.js",
                "src/modules/typecheck.js",
                "src/modules/console.js",
                "src/modules/objects.js",
                "src/modules/arrays.js",
                "src/modules/options.js",
                "src/modules/generators.js",
                "src/modules/ranges.js"
            ]
        },
        concat: {
            sources: {
                src: ["<banner>",
                    "<file_strip_banner:src/wrappers/intro.js>",
                    "<file_strip_banner:src/base.js>",
                    "<file_strip_banner:src/modules/typecheck.js>",
                    "<file_strip_banner:src/modules/console.js>",
                    "<file_strip_banner:src/modules/objects.js>",
                    "<file_strip_banner:src/modules/arrays.js>",
                    "<file_strip_banner:src/modules/options.js>",
                    "<file_strip_banner:src/modules/generators.js>",
                    "<file_strip_banner:src/modules/ranges.js>",
                    "<file_strip_banner:src/wrappers/outro.js>"],
                dest: "build/full/<%= pkg.name %>-<%= pkg.version %>.js",
                separator: "\n\n"
            }
        },
        min: {
            dist: {
                src: "build/full/<%= pkg.name %>-<%= pkg.version %>.js",
                dest: "build/min/<%= pkg.name %>-<%= pkg.version %>-min.js"
            }
        },
        watch: {
            files: ["src/*.js", "test/*.js"],
            tasks: "build"
        },
        jstdServer: {
            port: 9876,
            driver: "lib/JsTestDriver.jar"
        },
        jstd: {
            full: "test/kira-full.jstd",
            min: "test/kira-min.jstd"
        },
        jshint: {
            options: {
                bitwise: true,
                camelcase: true,
                curly: true,
                eqeqeq: true,
                latedef: true,
                noempty: true,
                quotmark: "double",
                regexp: true
            }
        }
    });

    grunt.loadTasks("misc/tasks");

    grunt.registerTask("build", "lint concat min");

    grunt.registerTask("build-test", "build jstd");

    grunt.registerTask("build-watch", "build watch");

    grunt.registerTask("default", "build");
};
