var assert = require('yeoman-assert');
var path = require('path');
var helpers = require('yeoman-test');
var exec = require('child_process').exec;
var donejsPackage = require('donejs-cli/package.json');
var npmVersion = require('../lib/utils').npmVersion;
var fs = require('fs-extra');

function pipe(child) {
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

describe('generator-donejs', function () {
  describe('donejs:component', function() {

    it('works with a .component type', function (done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../component'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
          fs.copySync(path.join( __dirname, "tests", 'basics'), dir)
        })
        .withOptions({
          skipInstall: true
        })
        .withPrompts({
          name: 'home.component'
        })
        .on('end', function () {
          assert(fs.existsSync(path.join(tmpDir, 'src', 'home.component')),
                 'home.component exists');
          done();
        });
    });

    it('Adds the right ViewModel name for a .component type', function (done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../component'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
          fs.copySync(path.join( __dirname, "tests", 'basics'), dir)
        })
        .withOptions({
          skipInstall: true
        })
        .withPrompts({
          name: 'app-cart.component'
        })
        .on('end', function () {
          var content = fs.readFileSync(path.join(tmpDir, 'src', 'app-cart.component'), 'utf8');
          assert.ok(/AppCartVM/.test(content), "Names the VM correctly");
          done();
        });
    });

    it('Exports the component and ViewModel in a modlet', function(done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../component'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
          fs.copySync(path.join( __dirname, "tests", 'basics'), dir)
        })
        .withOptions({
          skipInstall: true
        })
        .withPrompts({
          name: 'pages/restaurant/list',
          tag: 'pmo-restaurant-list'
        })
        .on('end', function () {
          var compFile = path.join(tmpDir, 'src', 'pages', 'restaurant', 'list', 'list.js');
          assert.fileContent(compFile, /export const PmoRestaurantList/);
          assert.fileContent(compFile, /export default PmoRestaurantList/);
          assert.fileContent(compFile, /export const ViewModel = PmoRestaurantList\.ViewModel/);
          done();
        });
    });

    it('can provide a name that includes the package name', function(done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../component'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
          fs.copySync(path.join( __dirname, "tests", 'basics'), dir)
        })
        .withOptions({
          skipInstall: true
        })
        .withPrompts({
          name: 'basics/foo/bar',
          tag: 'foo-bar'
        })
        .on('end', function () {
          assert(fs.existsSync(path.join(tmpDir, 'src', 'foo', 'bar', 'bar.js')),
                 'created at the right place');
          done();
        });
    });

    it('works with no directories.lib', function (done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../component'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
          fs.copySync(path.join( __dirname, "tests", "no_directories" ), dir)
        })
        .withOptions({
          skipInstall: true
        })
        .withPrompts({
          name: 'foo/bar',
          tag: 'foo-bar'
        })
        .on('end', function () {
          assert( fs.existsSync( path.join( tmpDir, "foo", "bar", "bar.js" ) ), "bar.js exists" );
          assert( fs.existsSync( path.join( tmpDir, "foo", "bar", "bar-test.js" ) ), "bar-test.js exists" );
          assert( fs.existsSync( path.join( tmpDir, "foo", "bar", "bar.html" ) ), "bar.html exists" );
          done();
        });
    });

    it('Errors when a package is not found', function (done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../component'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
          fs.copySync(path.join(__dirname, 'tests', 'empty'), dir);
        })
        .withOptions({
          skipInstall: true
        })
        .withPrompts({
          name: 'foo/bar',
          tag: 'foo-bar'
        })
        .on('error', function(err) {
          var msg = err.message;
          assert(/Expected to find/.test(msg), 'Correct error message');
          done();
        });
    });

    it('allows to override template files', function (done) {
      var source = path.join(__dirname, 'tests', 'override', 'override.js');
      var tmpDir, target;

      helpers.run(path.join(__dirname, '../component'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
          target = path.join(dir, '.donejs', 'templates', 'component', 'modlet', 'component-test.js');
          fs.copySync(path.join( __dirname, "tests", 'basics'), dir);
          fs.copySync(source, target);
        })
        .withOptions({
          skipInstall: true
        })
        .withPrompts({
          name: 'dummy',
          tag: 'dummy-component'
        })
        .on('end', function () {
          assert.fileContent(path.join(tmpDir, 'src', 'dummy', 'dummy-test.js'),
            /Overriden dummy test file/);
          done();
        });
    });

    it('works with passed arguments', function (done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../component'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
          fs.copySync(path.join( __dirname, "tests", 'basics'), dir)
        })
        .withOptions({
          skipInstall: true
        })
        .withArguments([
          'foo/bar',
          'foo-bar'
        ])
        .on('end', function () {
          assert( fs.existsSync( path.join( tmpDir, "src", "foo", "bar", "bar.js" ) ), "bar.js exists" );
          assert( fs.existsSync( path.join( tmpDir, "src", "foo", "bar", "bar-test.js" ) ), "bar-test.js exists" );
          assert( fs.existsSync( path.join( tmpDir, "src", "foo", "bar", "bar.html" ) ), "bar.html exists" );
          done();
        });
    });

    it('adds import to test.js', function (done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../component'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
          fs.copySync(path.join( __dirname, "tests", 'existing'), dir)
        })
        .withOptions({
          skipInstall: true
        })
        .withPrompts({
          name: 'foo/bar',
          tag: 'foo-bar'
        })
        .on('end', function () {
          var testFile = fs.readFileSync(path.join(tmpDir, "src", "test.js"), "utf8");
          assert(/foo-test/.test(testFile), "foo-test still exists in the file");
          assert(/bar-test/.test(testFile), "bar-test imported by test.js");
          done();
        });
    });

    it('Ignore trailing slashes on component name', function(done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../component'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
          fs.copySync(path.join( __dirname, "tests", 'basics'), dir)
        })
        .withOptions({
          skipInstall: true
        })
        .withPrompts({
          name: 'basics/foo/ bar',
          tag: 'foo-bar'
        })
        .on('end', function () {
          assert(fs.existsSync(path.join(tmpDir, 'src', 'foo', 'bar', 'bar.js')), 'bar.js exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'foo', 'bar', 'bar.md')), 'bar.md exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'foo', 'bar', 'bar.less')), 'bar.less exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'foo', 'bar', 'bar.stache')), 'bar.stache exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'foo', 'bar', 'bar-test.js')), 'bar-test.js exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'foo', 'bar', 'bar.html')), 'bar.html exists');
          done();
        });
    });

    it('Generates a component with a name like project name', function(done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../component'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
          fs.copySync(path.join( __dirname, "tests", 'basics'), dir)
        })
        .withOptions({
          skipInstall: true
        })
        .withPrompts({
          name: 'basics',
          tag: 'foo-bar'
        })
        .on('end', function () {
          assert(fs.existsSync(path.join(tmpDir, 'src', 'basics', 'basics.js')), 'basics.js exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'basics', 'basics.md')), 'basics.md exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'basics', 'basics.less')), 'basics.less exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'basics', 'basics.stache')), 'basics.stache exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'basics', 'basics-test.js')), 'basics-test.js exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'basics', 'basics.html')), 'basics.html exists');
          done();
        });
    });

    it('Generates a component with a name like project name inside a "components" folder', function(done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../component'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
          fs.copySync(path.join( __dirname, "tests", 'basics'), dir)
        })
        .withOptions({
          skipInstall: true
        })
        .withPrompts({
          name: 'components/basics',
          tag: 'foo-bar'
        })
        .on('end', function () {
          assert(fs.existsSync(path.join(tmpDir, 'src', 'components', 'basics', 'basics.js')), 'basics.js exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'components', 'basics', 'basics.md')), 'basics.md exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'components', 'basics', 'basics.less')), 'basics.less exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'components', 'basics', 'basics.stache')), 'basics.stache exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'components', 'basics', 'basics-test.js')), 'basics-test.js exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'components', 'basics', 'basics.html')), 'basics.html exists');
          done();
        });
    });

    it('Generates a component with a name and a folder like the project name', function(done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../component'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
          fs.copySync(path.join( __dirname, "tests", 'basics'), dir)
        })
        .withOptions({
          skipInstall: true
        })
        .withPrompts({
          name: 'basics/basics',
          tag: 'foo-bar'
        })
        .on('end', function () {
          assert(fs.existsSync(path.join(tmpDir, 'src', 'basics', 'basics', 'basics.js')), 'basics.js exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'basics', 'basics', 'basics.md')), 'basics.md exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'basics', 'basics', 'basics.less')), 'basics.less exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'basics', 'basics', 'basics.stache')), 'basics.stache exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'basics', 'basics', 'basics-test.js')), 'basics-test.js exists');
          assert(fs.existsSync(path.join(tmpDir, 'src', 'basics', 'basics', 'basics.html')), 'basics.html exists');
          done();
        });
    });
  });
});
