module.exports = function(grunt) {
    grunt.initConfig({
        pkg: "<json:package.json>",
        meta: {
            banner: grunt.file.read("misc/banner.txt")
        },
        concat: {
            sources: {
                src: ["<banner>", "<file_strip_banner:src/kira.js>"],
                dest: "build/<%= pkg.name %>-<%= pkg.version %>.js"
            }
        },
        min: {
            dist: {
                src: "build/<%= pkg.name %>-<%= pkg.version %>.js",
                dest: "build/<%= pkg.name %>-min-<%= pkg.version %>.js"
            }
        },
        watch: {
            files: ["src/*.js", "test/*.js"],
            tasks: "concat min"
        },
        jstdServer: {
            port: 9876,
            config: "test/kira-base-features.jstd",
            driver: "lib/JsTestDriver.jar"
        }
    });

    grunt.loadTasks("misc/tasks");

    grunt.registerTask("default", "jstdServer");
};
