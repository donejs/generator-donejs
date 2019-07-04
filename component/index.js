var BaseGenerator = require('../lib/baseGenerator');
var path = require('path');
var _ = require('lodash');
var utils = require('../lib/utils');

module.exports = class extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);

    this.templatePath = utils.templatePath(path.join('.donejs', 'templates', 'component'));

    this.argument('name', {
      type: String,
      required: false,
      desc: 'The module name for your component (e.g. restaurant/list)'
    });

    this.argument('tag', {
      type: String,
      required: false,
      desc: 'The name of the tag (e.g. restaurant-list)'
    });

    this.modletFiles = [
      'modlet/component.html',
      'modlet/component.js',
      'modlet/component.md',
      'modlet/component.less',
      'modlet/component.stache',
      'modlet/component-test.js',
      'modlet/test.html'
    ];
  }

  prompting() {
    var done = this.async();
    this.prompt({
      name: 'name',
      message: 'What is the module name of your component (e.g. pmo/home or pmo/home.component)?',
      validate: utils.validateRequired,
      when: !this.options.name
    }).then(function(first) {
      var name = this.options.name || first.name;
      name = this.options.name = name.replace(/\/$/, "");

      this.isDoneComponent = this.options.name.indexOf('.component') !== -1;
      this.options.name = name = name.replace('.component', '');

      var tag = _.kebabCase(name);
      var prompts = [{
        name: 'tag',
        message: 'The tag name of the component',
        default: tag,
        when: !this.options.tag,
        validate: utils.validateTagName
      }];

      this.prompt(prompts).then(function(props) {
        _.extend(this.options, props);

        done();
      }.bind(this));
    }.bind(this));
  }

  writing() {
    var isDoneComponent = this.isDoneComponent;
    var self = this;
    var done = this.async();

    var pkg = utils.getPkgOrBail(this, done);
    if(!pkg) {
      return;
    }

    var parts = _.map( this.options.name.split('/'), _.trim );
    var name = _.last(parts);
    var folder = _.get(pkg, 'steal.directories.lib') || "./";
    var appName = _.get(pkg, 'name');
    // If we generate a component with the same name as the application
    var isRootComponent = name === appName;

    // https://github.com/donejs/donejs/issues/525
    if(!isRootComponent && parts[0] === appName) {
      parts.shift();
    }

    var fullPath = [folder].concat(parts);

    // .component files don't go in their own folder
    if (isDoneComponent) {
      fullPath.pop();
    }

    // The tag name as a CamelCase for the VM
    var camelCase = _.camelCase(this.options.tag);
    var tagCase = utils.upperFirst(camelCase);

    var options = {
      // ../ levels to go up to the root
      root: _.repeat('../', fullPath.length),
      // The full component path
      path: path.join.apply(path, fullPath),
      // The full tag name (prepending the short name if it isn't there yet)
      tag: this.options.tag,
      camelCase: camelCase,
      tagCase: tagCase,
      // The short name of the component (e.g. list for restaurant/list)
      name: name,
      app: appName,
      // The full module name (e.g. pmo/restaurant/list)
      module: ["~"].concat(parts).join('/')
    };

    if (isDoneComponent) {
      this.fs.copyTpl(
        self.templatePath('component.component'),
        self.destinationPath(path.join(options.path, options.name + '.component')),
        options
      );
    } else {
      this.modletFiles.forEach(function (name) {
        var target = name.replace('component', options.name).replace('modlet/', '');
        self.fs.copyTpl(
          self.templatePath(name),
          self.destinationPath(path.join(options.path, target)),
          options
        );
      });

      var mainTests = this.destinationPath(path.join(folder, 'test.js'));
      utils.addImport(mainTests, ["~"].concat(fullPath.slice(1)).join('/') +
        '/' + name + '-test');
    }
    done();
  }
};
