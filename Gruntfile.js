
module.exports = function(grunt)
{

  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  //grunt.loadTasks('closure-tools/tasks');
  // Project configuration.
  grunt.initConfig({
    // closureBuilder not used on purpose.
    closureCompiler: {
      options: {
        compilerFile: '../../closure-compiler/superstartup-compiler/build/sscompiler.jar',
        compilerOpts: {
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          warning_level: 'verbose',
          summary_detail_level: 3,
          define: ["'goog.DEBUG=false'", "'ss.STANDALONE=true'"],
          output_wrapper: '"!function(){%output%}.call(this);"',
          externs: 'build/json.extern.js'
        }
      },
      target: {
        src: [
          'closure-library/closure/goog/base.js',
          'src/server2js.export.js',
          'src/server2.js'
          ],
        dest: 'dist/server2.min.js'
      }
    },
    closureDepsWriter: {
      options: {
        closureLibraryPath: 'closure-library'
      },
       // any name that describes your operation
      targetName: {
        src: ['server2.js', 'build/server2js.export.js'],
        dest: 'build/deps.js'
      }
    },

    /**
     * TESTING
     *
     */
    connect: {
      test: {
        options: {
          port: 8888,
          base: './',
          keepalive: false
        }
      }
    },
    qunit: {
      all: ['http://localhost:8888/test/index.html?testNumber=2']
    },

    nodeunit: {
      all: ['test/node/**/*.js']
    },
    watch: {
      test: {
        files: ['lib/**/*.js', 'test/node/**/*.js'],
        tasks: 'test'
      },
      web: {
        files: ['src/**/*.js', 'test/unit/**/*.js'],
        tasks: 'test:web'
      }
    }
  });

  grunt.registerTask('test', 'Test all or specific targets', function(target) {
    var nodeTest = [
      'nodeunit:all'
    ];

    var webTest = [
      'server',
      'qunit:all'
    ];

    // clear temp folder v0.4 way
    //grunt.file.expand( ['temp/*'] )
    //.forEach( grunt.file.delete );



    //return;
    switch( target ) {
      case 'node':
        grunt.task.run(nodeTest);
      break;
      case 'web':
        grunt.task.run(webTest);
      break;
      default:
        // Not working on phantomJs (!) see:
        // https://groups.google.com/forum/?fromgroups=#!topic/phantomjs/7wi5PXFWG78
        //
        // grunt.task.run(webTest);
        grunt.task.run(nodeTest);
      break;
    }

  });

  // Default task.
  grunt.registerTask('default', 'test');
};