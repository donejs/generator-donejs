var Generator = require('yeoman-generator');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    /*
     * _globalConfig points to ~/.yo-rc-global.json
     * when the user does not have permissions to write to
     * this file, write to the local config instead
     * to prevent yeoman from throwing an uncaught error
     */
    try {
      var cur = fs.readJSONSync(this._globalConfig.path);
      fs.writeJSONSync(this._globalConfig.path, cur);
    } catch(e) {
      this._globalConfig = this.config;
    }
  }
};
