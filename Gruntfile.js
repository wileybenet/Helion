module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      scripts: {
        files: ['app/*.js'],
        tasks: ['jshint'],
        options: {
          debounceDelay: 500,
          spawn: false,
          event: ['changed']
        },
      },
    },
    jasmine_node: {
      specNameMatcher: 'spec'
    }
  });

  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.registerTask('default', 'jasmine_node');

};