#!/usr/bin/perl
use POSIX qw(strftime);
use Time::Local;

$DEBUG = 0;
if ("--debug" eq $ARGV[0]) {
  $DEBUG = 1;
}

######################### CONFIG ###############################

$java = "/usr/bin/java";


### Project Root
$projectRoot = "..";

## The main file to include ($jsroot will be prepended)
$mainFile = "/server2js/server2js.js";

### Rest subfolders
$jsroot = $projectRoot . "/html/js";
$binPath = $projectRoot . "/bin";
$closurelib = $jsroot . "/closure-library";
$googPath = $jsroot . "/closure-library/closure/goog";
$externsPath = $binPath . "/externs";
#3rd party apps...
$asyncPath = $jsroot . "/closure-library/third_party/closure/goog";
$calcdeps = $jsroot . "/closure-library/closure/bin/calcdeps.py";
$closurebuilder = $jsroot . "/closure-library/closure/bin/build/closurebuilder.py";
$closurecompiler = $projectRoot . "/bin/Third-Party/closure_compiler/compiler.jar";
######################### CONFIG END ###########################


$cmdCompile = $java . " -jar " . $closurecompiler;
$cmdCompile .= " --js ../html/js/server2js/server2.js";
$cmdCompile .= " --compilation_level=ADVANCED_OPTIMIZATIONS";
$cmdCompile .= " --warning_level=verbose";
$cmdCompile .= " --summary_detail_level=3";
$cmdCompile .= " --js_output_file=$projectRoot" . "/html/jsc/server2.js";
$cmdCompile .- " --generate_exports";
if ($DEBUG) {
  $cmdCompile .= " --source_map_format=V3";
  $cmdCompile .= " --create_source_map=$projectRoot/html/compiled.js.map";
  $cmdCompile .= " --output_wrapper='(function(){%output%}).call(this); \\\n//@ sourceMappingURL=/compiled.js.map'";
} else {
  $cmdCompile .= " --output_wrapper='(function(){%output%}).call(this);'";
}

$cmdCompile .= " > compilerserver2js.out";

print $cmdCompile . "\n\n";

system $cmdCompile;


system "cp " . $projectRoot . "/html/jsc/server2.js " . $projectRoot . "/build/server2.js";

## Compile with ADVANCED_OPTIMIZATIONS to compiled.js
## Use -Xmx1024m for giving more memory to java: http://groups.google.com/group/closure-compiler-discuss/browse_thread/thread/522fd9e9a87b9c92?hl=en#
#$cmdCompile = "$java -Xmx1024m -jar $closurecompiler ";

print "JS Compiled. See output in engine/bin/compiler.out\n";

