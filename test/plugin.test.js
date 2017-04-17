var assert = require('assert');
var fs = require('fs');
var path = require('path');
var helpers = require('yeoman-test');
var exec = require('child_process').exec;
var donejsPackage = require('donejs-cli/package.json');
var npmVersion = require('../lib/utils').npmVersion;

function pipe(child) {
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

var generator = path.join(__dirname, '../plugin');

describe('generator-donejs:plugin', function () {
  it('donejs:plugin', function (done) {
    var tmpDir;

    helpers.run(path.join(__dirname, '../plugin'))
      .inTmpDir(function (dir) {
        tmpDir = dir;
      })
      .withOptions({
        packages: donejsPackage.donejs,
        skipInstall: false
      })
      .withPrompts({
        name: 'my-plugin'
      })
      .on('end', function () {
        var child = exec('npm test', {
          cwd: tmpDir
        });

        pipe(child);

        child.on('exit', function (status) {
          assert.equal(status, 0, 'Got correct exit status');

          child = exec('npm run build', {
            cwd: tmpDir
          });

          pipe(child);
          child.on('exit', function(status) {
            assert.equal(status, 0, 'Got correct exit status');
            done();
          });
        });
      });
  });

  it('should write dependencies to package.json', function (done) {
    var tmpDir;

    helpers.run(path.join(__dirname, '../plugin'))
      .inTmpDir(function (dir) {
        tmpDir = dir;
      })
      .withOptions({
        packages: {
          dependencies: {
            "can-component": "^3.0.4",
            "can-define": "^1.0.10",
            "can-stache": "^3.0.16",
            "can-view-autorender": "^3.0.4",
            "steal-less": "^1.2.0",
            "steal-stache": "^3.0.5"
          },
          devDependencies: donejsPackage.donejs.devDependencies
        },
        skipInstall: false
      })
      .withPrompts({
        name: 'my-plugin'
      })
      .on('end', function () {
        assert.jsonFileContent('package.json', {
          steal: {
            plugins: [
              "steal-less",
              "steal-stache"
            ]
          },
          dependencies: {
            "can-component": "^3.0.4",
            "can-define": "^1.0.10",
            "can-stache": "^3.0.16",
            "can-view-autorender": "^3.0.4",
            "steal-less": "^1.2.0",
            "steal-stache": "^3.0.5"
          }
        });
        done();
      });
  });

  it('fails if there are no packages', function(done) {
    helpers.run(path.join(__dirname, '../plugin'))
      .withOptions({
        packages: null,
        skipInstall: true
      })
      .withPrompts({
        name: 'my-plugin'
      })
      .on('error', function(err){
        assert(true, 'An error for not providing packages');
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
});
