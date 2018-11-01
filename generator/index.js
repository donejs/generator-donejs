var BaseGenerator = require('../lib/baseGenerator');
var path = require('path');
var _ = require('lodash');
var packages = require('./packages');
var utils = require('../lib/utils');
var getKeywords = utils.getKeywords;

module.exports = class extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    // Pre set the default props from the information we have at this point
    this.props = {
      name: this.pkg.name,
      description: this.pkg.description,
      version: this.pkg.version,
      homepage: this.pkg.homepage,
      repository: this.pkg.repository
    };

    this.mainFiles = [
      '_gitignore',
      'CONTRIBUTING.md',
      'README.md',
      'default/templates/file.js',
      'default/index.js',
      'test/index.js'
    ];
  }

  prompting() {
    var done = this.async();

    var prompts = [{
      name: 'name',
      message: 'Project name',
      when: !this.pkg.name,
      default: process.cwd().split(path.sep).pop()
    }, {
      name: 'description',
      message: 'Description',
      when: !this.pkg.description
    }, {
      name: 'homepage',
      message: 'Project homepage url',
      when: !this.pkg.homepage
    }, {
      name: 'githubAccount',
      message: 'GitHub username or organization',
      when: !this.pkg.repository
    }, {
      name: 'authorName',
      message: 'Author\'s Name',
      when: !this.pkg.author,
      store: true
    }, {
      name: 'authorEmail',
      message: 'Author\'s Email',
      when: !this.pkg.author,
      store: true
    }, {
      name: 'authorUrl',
      message: 'Author\'s Homepage',
      when: !this.pkg.author,
      store: true
    }, {
      name: 'keywords',
      message: 'Application keywords',
      when: !this.pkg.keywords
    }];

    this.prompt(prompts).then(function(props) {
      this.props = _.extend(this.props, props);
      this.props.name = _.kebabCase(this.props.name);
      this.props.addName = this.props.name.replace('donejs-', '');
      done();
    }.bind(this));
  }

  writing() {
    var self = this;
    var keywords = getKeywords('generator', this.props.keywords);
    this.fs.writeJSON('package.json', {
      name: this.props.name,
      version: '0.0.0',
      description: this.props.description,
      homepage: this.props.homepage,
      repository: this.props.repository,
      author: {
        name: this.props.authorName,
        email: this.props.authorEmail,
        url: this.props.authorUrl
      },
      main: "lib/",
      scripts: {
        test: "npm run jshint && npm run mocha",
        jshint: "jshint test/. default/index.js --config",
        mocha: "mocha test/ --timeout 120000",
        publish: "git push origin --tags && git push origin",
        'release:patch': "npm version patch && npm publish",
        'release:minor': "npm version minor && npm publish",
        'release:major': "npm version major && npm publish"
      },
      keywords: keywords
    });

    var deps = utils.toNpmInstallStrings(packages.dependencies);
    var devDeps = utils.toNpmInstallStrings(packages.devDependencies);

    this.npmInstall(deps, { 'save': true });
    this.npmInstall(devDeps, { 'saveDev': true });

    this.composeWith(require.resolve('generator-license/app'), {
      name: this.props.authorName,
      email: this.props.authorEmail,
      website: this.props.authorUrl,
      defaultLicense: 'MIT'
    });

    this.fs.copy(this.templatePath('static'), this.destinationPath());
    this.fs.copy(this.templatePath('static/.*'), this.destinationPath());

    this.mainFiles.forEach(function(name) {
      // Handle bug where npm has renamed .gitignore to .npmignore
      // https://github.com/npm/npm/issues/3763
      self.fs.copyTpl(
        self.templatePath(name),
        self.destinationPath((name === "_gitignore") ? ".gitignore" : name),
        self.props
      );
    });
  }
};
