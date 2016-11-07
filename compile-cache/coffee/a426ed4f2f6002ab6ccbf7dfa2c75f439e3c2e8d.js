(function() {
  var Linter, LinterJsYaml, fs, linterPath, yaml,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  yaml = require('js-yaml');

  linterPath = atom.packages.getLoadedPackage("linter").path;

  Linter = require("" + linterPath + "/lib/linter");

  LinterJsYaml = (function(_super) {
    __extends(LinterJsYaml, _super);

    LinterJsYaml.syntax = ['source.yaml'];

    LinterJsYaml.prototype.cmd = 'js-yaml.js';

    LinterJsYaml.prototype.executablePath = null;

    LinterJsYaml.prototype.linterName = 'js-yaml';

    LinterJsYaml.prototype.isNodeExecutable = true;

    LinterJsYaml.prototype.errorStream = 'stderr';

    LinterJsYaml.prototype.regex = 'JS-YAML: (?<message>.+) at line (?<line>\\d+), column (?<col>\\d+):';

    function LinterJsYaml(editor) {
      LinterJsYaml.__super__.constructor.call(this, editor);
      this.executablePathListener = atom.config.observe('linter-js-yaml.jsYamlExecutablePath', (function(_this) {
        return function() {
          return _this.executablePath = atom.config.get('linter-js-yaml.jsYamlExecutablePath');
        };
      })(this));
    }

    LinterJsYaml.prototype.lintFile = function(filePath, callback) {
      return fs.readFile(filePath, 'utf8', (function(_this) {
        return function(err, data) {
          var e, messages;
          messages = [];
          try {
            yaml.safeLoad(data, {
              onWarning: function(error) {
                return messages.push(error.message);
              }
            });
            return _this.processMessage(messages, callback);
          } catch (_error) {
            e = _error;
            return LinterJsYaml.__super__.lintFile.call(_this, filePath, callback);
          }
        };
      })(this));
    };

    LinterJsYaml.prototype.createMessage = function(match) {
      if (match.message.startsWith('unknown tag')) {
        match.warning = true;
      }
      return LinterJsYaml.__super__.createMessage.call(this, match);
    };

    LinterJsYaml.prototype.destroy = function() {
      return this.executablePathListener.dispose();
    };

    return LinterJsYaml;

  })(Linter);

  module.exports = LinterJsYaml;

}).call(this);
