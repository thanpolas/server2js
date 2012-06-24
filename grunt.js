module.exports = function(grunt) 
{
  
  grunt.loadNpmTasks('grunt-closure-tools');
  
  // Project configuration.
  grunt.initConfig({
    closureCompiler: {
      target: {
        closureCompiler: '../superstartup/build/closure_compiler/sscompiler.jar',
        js: ['closure-library/closure/goog/base.js', 'exports.js', 'server2.js'],
        output_file: 'server2.min.js',
        options: {
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          warning_level: 'verbose',          
          summary_detail_level: 3,
          generate_exports: null,
          output_wrapper: '"(function(){%output%}).call(this);"',
          manage_closure_dependencies: null
          //jscomp_off: 'checkVars'
        }
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'closureCompiler');
};