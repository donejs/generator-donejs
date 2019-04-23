var BaseGenerator = require('../lib/baseGenerator');
var path = require('path');
var _ = require('lodash');
var utils = require('../lib/utils')
var npmVersion = utils.npmVersion;
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
      'CONTRIBUTING.md',
      'README.md',
      '_gitignore',
      'test.html',
      'index.html'
    ];

    this.srcFiles = [
      'plugin-test.js',
      'plugin.js',
      'plugin.md'
    ];
  }

  prompting() {
    var done = this.async();

    npmVersion(function(err, version){
      if(err) {
        done(err);
        return;
      }

      var prompts = [{
        name: 'name',
        message: 'Project name',
        when: !this.pkg.name,
        default: process.cwd().split(path.sep).pop()
      }, {
        name: 'public',
        type: 'confirm',
        message: 'Is this project public',
        default: true,
        when: function (response) {
          // Only prompt if the name prop starts with "@" indicating a scoped package
          return response.name.indexOf('@') === 0
        }
      }, {
        name: 'folder',
        message: 'Project main folder',
        default: 'src'
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
      }, {
        name: 'npmVersion',
        message: 'NPM version used',
        default: version.major
      }];

      this.prompt(prompts).then(function(props) {
        this.props = _.extend(this.props, props);
        var scopedPkgName = undefined;
        var pkgName = _.kebabCase(this.props.name);
        
        // Parse out any scoping
        if (this.props.name.indexOf('@') === 0) {
          // Get the scope of the package
          var scope = this.props.name.match(/@.+\//)[0];
          // kebabCase the package name minus the scope
          // this will be used in the repository url
          pkgName = _.kebabCase(this.props.name.replace(scope, ''));
          // Create the scoped name for use in the package.json
          scopedPkgName = scope + pkgName;
        }

        this.props.name = pkgName;
        this.props.pkgName = scopedPkgName || pkgName;
        done();
      }.bind(this));
    }.bind(this));
  }

  writing() {
    var self = this;
    var jshintFolder = this.props.folder && this.props.folder !== '.' ?
      ' ./' + this.props.folder + '/' : '';
    var keywords = getKeywords('plugin', this.props.keywords);
    var pkgJsonFields = {
      name: this.props.pkgName,
      version: '0.0.0',
      description: this.props.description,
      homepage: this.props.homepage,
      repository: {
        type: 'git',
        url: 'git://github.com/' +  this.props.githubAccount + '/' + this.props.name + '.git'
      },
      author: {
        name: this.props.authorName,
        email: this.props.authorEmail,
        url: this.props.authorUrl
      },
      "scripts": {
        preversion: "npm test && npm run build",
        version: "git commit -am \"Update version number\" && git checkout -b release && git add -f dist/",
        postpublish: "git push --tags && git checkout master && git branch -D release && git push",
        testee: "testee test.html --browsers firefox",
        test: "npm run jshint && npm run testee",
        jshint: "jshint ./*.js" + jshintFolder + " --config",
        "release:patch": "npm version patch && npm publish".concat(this.props.public ? " --access public" : ""),
        "release:minor": "npm version minor && npm publish".concat(this.props.public ? " --access public" : ""),
        "release:major": "npm version major && npm publish".concat(this.props.public ? " --access public" : ""),
        build: "node build.js",
        develop: "done-serve --static --develop --port 8080"
      },
      main: "dist/cjs/" + this.props.name,
      browser: {
       transform: [ "cssify" ]
      },
      browserify: {
       transform: [ "cssify" ]
      },
      keywords: keywords,
      steal: {
        main: this.props.name,
        configDependencies: [ 'live-reload' ],
        npmIgnore: [
          'testee',
          'generator-donejs',
          'donejs-cli',
          'steal-tools'
        ],
        plugins: [
          'steal-less',
          'steal-stache'
        ]
      }
    };

    if(this.props.folder && this.props.folder !== '.') {
      pkgJsonFields.steal.directories = { lib: this.props.folder };
    }

    if(this.props.npmVersion < 3) {
      pkgJsonFields.steal.npmAlgorithm = 'nested';
    }

    if(!this.options.packages) {
      throw new Error('No DoneJS dependency package list provided!');
    }

    var getDependency = function(name) {
      return self.options.packages.dependencies[name] ||
        self.options.packages.devDependencies[name];
    };

    this.fs.writeJSON('package.json', _.extend(pkgJsonFields, this.pkg, {
      dependencies: {
        'can-component': getDependency('can-component'),
        'can-define': getDependency('can-define'),
        'can-stache': getDependency('can-stache'),
        'can-view-autorender': getDependency('can-view-autorender'),
        'cssify': '^0.6.0',
        'steal-less': getDependency('steal-less'),
        'steal-stache': getDependency('steal-stache')
      },
      devDependencies: {
        'jshint': '^2.9.1',
        'steal': getDependency('steal'),
        'steal-qunit': getDependency('steal-qunit'),
        'steal-tools': getDependency('steal-tools'),
        'testee': getDependency('testee'),
        'generator-donejs': getDependency('generator-donejs'),
        'donejs-cli': getDependency('donejs-cli'),
        'done-serve': getDependency('done-serve')
      }
    }));

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

    this.srcFiles.forEach(function(name) {
      self.fs.copyTpl(
        self.templatePath(name),
        self.destinationPath(path.join(self.props.folder, name.replace('plugin', self.props.name))),
        self.props
      );
    });
  }

  end() {
    if(!this.options.skipInstall) {
      var done = this.async();
      this.spawnCommand('npm', ['--loglevel', 'error', 'install']).on('close', done);
    }
  }
};
