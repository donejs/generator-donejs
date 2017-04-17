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

var generator = path.join(__dirname, '../generator');

describe('generator-donejs:generator', function () {
  it('donejs:generator', function (done) {
    var tmpDir;

    helpers.run(path.join(generator))
      .inTmpDir(function (dir) {
        tmpDir = dir;
      })
      .withOptions({
        packages: donejsPackage.donejs,
        skipInstall: false
      })
      .withPrompts({
        name: 'donejs-generator-test'
      })
      .on('end', function () {
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
