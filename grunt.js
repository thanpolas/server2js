
module.exports = function(grunt)
{

  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-contrib-watch');

  //grunt.loadTasks('closure-tools/tasks');
  // Project configuration.
  grunt.initConfig({
    // closureBuilder not used on purpose.
    closureCompiler: {
      target: {
        closureCompiler: '../../closure-compiler/superstartup-compiler/build/sscompiler.jar',
        js: [
          'closure-library/closure/goog/base.js',
          'lib/server2js.export.js',
          'lib/server2.js'
          ],
        output_file: 'dist/server2.min.js',
        options: {
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          warning_level: 'verbose',
          summary_detail_level: 3,
          define: ["'goog.DEBUG=false'", "'ss.STANDALONE=true'"],
          output_wrapper: '"!function(){%output%}.call(this);"',
          externs: 'build/json.extern.js'
        }
      }
    },
    closureDepsWriter: {
       // any name that describes your operation
      targetName: {
        closureLibraryPath: 'closure-library', // path to closure library
        files: ['server2.js', 'build/server2js.export.js'],
        output_file: 'build/deps.js'
      }
    },
		qunit: {
			all: ['http://localhost:8888/test/index.html?testNumber=2']
		},
    server: {
      port: 8888,
      base: '.'
    },
    nodeTest: {
      all: ['test/node/**/*.js']
    },
    watch: {
      test: {
        files: ['node/**/*.js', 'test/node/**/*.js'],
        tasks: 'test'
      }
    }
  });


  grunt.renameTask('test', 'nodeTest');

  grunt.registerTask('test', 'Test all or specific targets', function(target) {
    var nodeTest = [
      'nodeTest:all'
    ];

    var webTest = [
      'server',
      'qunit:all'
    ];

    //return;
    switch( target ) {
      case 'node':
        grunt.task.run(nodeTest);
      break;
      case 'web':
        grunt.task.run(webTest);
      break;
      default:
        grunt.task.run(webTest);
        grunt.task.run(nodeTest);
      break;
    }

  });

  // Default task.
  grunt.registerTask('default', 'test');
};