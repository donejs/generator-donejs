var assert = require('assert');
var path = require('path');
var fs = require('fs-extra');
var helpers = require('yeoman-test');
var exec = require('child_process').exec;
var donejsPackage = require('donejs-cli/package.json');
var npmVersion = require('../lib/utils').npmVersion;

function pipe(child) {
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

var generator = path.join(__dirname, '../app');

describe('generator-donejs', function () {
  describe('donejs:app', function() {
    it('works', function (done) {
      var tmpDir;

      helpers.run(generator)
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
            assert.equal(status, 0, 'Got correct exit status');
            done();
          });
        });
    });

    it('fails with an invalid package name', function (done) {
      helpers.run(generator)
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

    it('fails if there are no packages', function(done) {
      helpers.run(generator)
        .withOptions({
          packages: null,
          skipInstall: true
        })
        .withPrompts({
          name: 'place-my-tmp'
        })
        .on('error', function(err){
          assert(true, 'An error for not providing packages');
          done();
        });
    });
  });

  describe('Absolute path support', function() {
    it('set relative path name', function (done) {
      helpers.run(generator)
        .inTmpDir(function (dir) {
          this.withPrompts({
            folder: path.join(fs.realpathSync(dir), 'src'),
            authorName: 'Test'
          });
        })
        .withOptions({
          packages: donejsPackage.donejs,
          skipInstall: true
        })
        .on('end', function() {
          assert.jsonFileContent('package.json', {
            steal: {
              directories: {
                lib: 'src'
              }
            }
          });
          done();
        });
    });
  });

  describe('External path will error', function() {
    it("fails with external path", function(done) {
      helpers.run(generator)
        .inTmpDir(function (dir) {
          this.withPrompts({
            folder: path.join(fs.realpathSync(dir), '..', 'src')
          })
        })
        .withOptions({
          packages: donejsPackage.donejs,
          skipInstall: true
        })
        .on('error', function(err){
          var msg = err.message;
          console.log(msg);
          assert(/is external/.test(msg), 'Error because of invalid external folder path');
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

    it('npmAlgorithm flag set if using NPM < 3', function(done){
      var major = this.npmVersion.major;
      var tmpDir;

      helpers.run(generator)
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
          var npmAlgorithm = pkg.steal.npmAlgorithm;

          if(major >= 3) {
            assert.equal(npmAlgorithm, undefined, 'If the user is using npm 3 or greater then npmAlgorithm should not be set');
          } else {
            assert.equal(npmAlgorithm, 'nested', 'If the user is using npm 2 or less then npmAlgorithm should be "nested"');
          }

          done();
        });
    });
  });

  it('steal-less and steal-stache are added as steal plugins', function(done) {
    var tmpDir;

    helpers.run(generator)
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
        var plugins = pkg.steal.plugins;

        assert.ok(plugins.indexOf('steal-less') >= 0, 'plugins config should contain steal-less');
        assert.ok(plugins.indexOf('steal-stache') >= 0, 'plugins config should contain steal-stache');
        assert.ok(plugins.indexOf('done-component') >= 0, 'plugins config should contain done-component');
        assert.ok(plugins.indexOf('done-css') >= 0, 'plugins config should contain done-css');

        done();
      });
  });

  it('adds a license to the root folder and package.json', function (done) {
    var tmpDir;
    helpers.run(generator)
      .inTmpDir(function (dir) {
        tmpDir = dir
      })
      .withOptions({
        packages: donejsPackage.donejs,
        skipInstall: true
      })
      .withPrompts({
        name: 'demo',
        authorName: 'Amy Wong',
        authorEmail: 'amy.wong@example.com',
        authorUrl: 'https://wongcorp.com'
      })
      .on('end', function () {
        assert.jsonFileContent('package.json', {license: 'MIT'}, 'license field set in package.json');
        assert(fs.existsSync(path.join(tmpDir, 'LICENSE')), 'license file exists in root folder');
        done();
      });
  });

  it('should allow dashed keywords to be entered', function (done) {
    helpers.run(generator)
      .inTmpDir(function (dir) {})
      .withOptions({
        packages: donejsPackage.donejs,
        skipInstall: true
      })
      .withPrompts({
        name: 'demo',
        authorName: 'Amy Wong',
        authorEmail: 'amy.wong@example.com',
        authorUrl: 'https://wongcorp.com',
        keywords: 'a b-c, e'
      })
      .on('end', function () {
        var keywords = ['a', 'b-c', 'donejs-app', 'e'];
        assert.jsonFileContent('package.json', {keywords: keywords}, 'correct keywords set in package.json');
        done();
      });
  });

  describe('Package names', function(){
    it('can include numbers', function(done){
      var tmpDir;

      helpers.run(generator)
        .inTmpDir(function (dir) {
          tmpDir = dir;
        })
        .withOptions({
          packages: donejsPackage.donejs,
          skipInstall: true
        })
        .withPrompts({
          name: 'hot5'
        })
        .on('end', function () {
          var pkg = require(tmpDir + '/package.json');

          assert.equal(pkg.name, 'hot5', 'name was not changed');
          assert.equal(pkg.main, 'hot5/index.stache!done-autorender', 'main is correct');

          done();
        });
    });
  });

  describe('if user can\'t write to ~/yo-rc-global.json', function() {
    var globalConfigPath, globalConfigPermissions;

    beforeEach(function() {
      var userHome, fileStats;

      userHome = require('user-home');
      globalConfigPath = path.join(userHome, '.yo-rc-global.json');

      if (!fs.existsSync(globalConfigPath)) {
        fs.writeJSONSync(globalConfigPath, {});
      }

      fileStats = fs.statSync(globalConfigPath);
      globalConfigPermissions = fileStats['mode'];

      // change permissions of global config
      fs.chmodSync(globalConfigPath, 0);
    });

    afterEach(function() {
      // restore permissions of global config
      fs.chmodSync(globalConfigPath, globalConfigPermissions);
    });

    it('works', function (done) {
      var tmpDir;

      helpers.run(generator)
        .inTmpDir(function (dir) {
          tmpDir = dir;
        })
        .withOptions({
          packages: donejsPackage.donejs,
          skipInstall: true,
          // make sure yeoman tries to write to .yo-rc files
          skipCache: false
        })
        .withPrompts({
          name: 'place-my-tmp',
          // make sure to set prompts that are `store: true`
          authorName: 'Joe Programmer',
          authorEmail: 'joe@program.mer',
          authorUrl: 'www.program.mer'
        })
        .on('end', function () {
          assert(true, 'completed successfully');
          done();
        })
        .on('error', function(err){
          assert(false, err);
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
  fs.appendFileSync(path.join(tmpDir, 'src/test.js'), '\nrequire("place-my-tmp/test/routing.test");\n');

  // add page property to AppViewModel
  insert(
    path.join(tmpDir, 'src/app.js'),
    function(a){ return a.search('message') !== -1; },
    'page: \'string\',',
    true
  );

  // add routing into app.js:
  // route('/:page', {page: 'home'});
  fs.appendFileSync(path.join(tmpDir, 'src/app.js'), '\nroute("/{page}", {page: "home"});\n');

  // add a button for navigation into index.stache after H1:
  insert(
    path.join(tmpDir, 'src/index.stache'),
    function(a){ return a.search('<h1>') !== -1; },
    '<can-import from="can-stache/helpers/route" />' +
    '<a id="goto-dashboard" href="{{routeUrl page=\'dashboard\'}}">Goto Dashboard</a>'
  );
}

/**
 * Injects a string into a file after the line that passes the given testFn.
 * @param fileName
 * @param insertion
 * @param testFn
 */
function insert(fileName, testFn, insertion, after){
  var content = fs.readFileSync(fileName),
    lines = content.toString().split('\n');

  // empty file:
  fs.truncateSync(fileName, 0);

  lines.forEach(function(line){
    if (!after) {
      fs.appendFileSync(fileName, line + '\n');
    }
    if (testFn(line)){
      fs.appendFileSync(fileName, insertion + '\n');
    }
    if (after) {
      fs.appendFileSync(fileName, line + '\n');
    }
  });
}
