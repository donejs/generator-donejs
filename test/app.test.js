var assert = require('assert');
var path = require('path');
var fs = require('fs-extra');
var helpers = require('yeoman-generator').test;
var exec = require('child_process').exec;
var donejsPackage = require('donejs-cli/package.json');
var npmVersion = require('../lib/utils').npmVersion;

function pipe(child) {
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

describe('generator-donejs', function () {
  describe('donejs:app', function() {
    it('works', function (done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../app'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
        })
        .withOptions({
          packages: donejsPackage.donejs,
          skipInstall: false
        })
        .withPrompts({
          name: 'place-my-tmp'
        })
        .on('end', function () {

          prepareRoutingTest(tmpDir);

          child = exec('npm test', {
            cwd: tmpDir
          });

          pipe(child);

          child.on('exit', function (status) {
            assert.equal(status, 0, 'Got correct exist status');
            done();
          });
        });
    });

    it('fails with an invalid package name', function (done) {
      var tmpDir;

      helpers.run(path.join(__dirname, '../app'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
        })
        .withOptions({
          packages: donejsPackage.donejs,
          skipInstall: true
        })
        .withPrompts({
          name: 'http'
        })
        .on('error', function(err){
          var msg = err.message;
          assert(/is not valid/.test(msg), 'Error because of invalid name');
          done();
        });
    });

  });

  describe('NPM 3 support', function(){
    before(function(done){
      var test = this;
      npmVersion(function(err, version){
        if(err) return done(err);
        test.npmVersion = version;
        done();
      });
    });

    it('npmAlgorithm flag set if using NPM 3+', function(done){
      var major = this.npmVersion.major;
      var tmpDir;

      helpers.run(path.join(__dirname, '../app'))
        .inTmpDir(function (dir) {
          tmpDir = dir;
        })
        .withOptions({
          packages: donejsPackage.donejs,
          skipInstall: true
        })
        .withPrompts({
          name: 'place-my-npm'
        })
        .on('end', function () {
          var pkg = require(tmpDir + '/package.json');
          var npmAlgorithm = pkg.system.npmAlgorithm;

          if(major >= 3) {
            assert.equal(npmAlgorithm, 'flat', 'If the user is using npm 3 or greater then npmAlgorithm should be "flat"');
          } else {
            assert.equal(npmAlgorithm, undefined, 'If the user is using npm 2 or less then npmAlgorithm should not be set');
          }

          done();
        });
    });
  });
});

/**
 * To test hashtag routing we need to:
 * - copy routing test into generated project test folder;
 * - import the test in test.js;
 * - add routing to the app;
 * - add a UI element for routing (ahref going to /dashboard).
 */
function prepareRoutingTest(tmpDir){
  // copy extra test files into tmpDir/src/test folder:
  fs.copySync(path.join(__dirname, 'app_tests/routing.test.js'), path.join(tmpDir, 'src/test/routing.test.js'));

  // import the copied test in test.js (note that it refers project name):
  fs.appendFileSync(path.join(tmpDir, 'src/test/test.js'), '\nimport "place-my-tmp/test/routing.test";\n');

  // add routing into app.js:
  // route('/:page', {page: 'home'});
  fs.appendFileSync(path.join(tmpDir, 'src/app.js'), '\nroute("/:page", {page: "home"});\n');

  // add a button for navigation into index.stache after H1:
  insertAfter(
    path.join(tmpDir, 'src/index.stache'),
    a => a.search('<h1>') !== -1,
    '<a id="goto-dashboard" href="{{routeUrl page=\'dashboard\'}}">Goto Dashboard</a>'
  );
}

/**
 * Injects a string into a file after the line that passes the given testFn.
 * @param fileName
 * @param insertion
 * @param testFn
 */
function insertAfter(fileName, testFn, insertion){
  var content = fs.readFileSync(fileName),
    lines = content.toString().split('\n');

  // empty file:
  fs.truncateSync(fileName, 0);

  lines.forEach(function(line){
    fs.appendFileSync(fileName, line + '\n');
    if (testFn(line)){
      fs.appendFileSync(fileName, insertion + '\n');
    }
  });
}
