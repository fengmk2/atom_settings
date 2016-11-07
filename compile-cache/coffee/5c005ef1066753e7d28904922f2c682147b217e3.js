(function() {
  var Linter, LinterESLint, allowUnsafeNewFunction, exec, findFile, fs, linterPath, path, resolve,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  linterPath = atom.packages.getLoadedPackage('linter').path;

  Linter = require("" + linterPath + "/lib/linter");

  findFile = require("" + linterPath + "/lib/util");

  resolve = require('resolve').sync;

  allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction;

  exec = require('child_process').exec;

  path = require("path");

  fs = require("fs");

  LinterESLint = (function(_super) {
    __extends(LinterESLint, _super);

    LinterESLint.syntax = ['source.js', 'source.js.jsx', 'source.babel'];

    LinterESLint.disableWhenNoEslintrcFileInPath = false;

    LinterESLint.prototype.linterName = 'eslint';

    LinterESLint.prototype._findGlobalNpmDir = function() {
      return exec('npm config get prefix', (function(_this) {
        return function(code, stdout, stderr) {
          var cleanPath, dir;
          if (!stderr) {
            cleanPath = stdout.replace(/[\n\r\t]/g, '');
            dir = path.join(cleanPath, 'lib', 'node_modules');
            return fs.exists(dir, function(exists) {
              if (exists) {
                return _this.npmPath = dir;
              }
            });
          }
        };
      })(this));
    };

    LinterESLint.prototype._requireEsLint = function(filePath) {
      var eslint, eslintPath;
      this.localEslint = false;
      try {
        eslintPath = resolve('eslint', {
          basedir: path.dirname(filePath)
        });
        eslint = require(eslintPath);
        this.localEslint = true;
        return eslint;
      } catch (_error) {
        if (this.useGlobalEslint) {
          try {
            eslintPath = resolve('eslint', {
              basedir: this.npmPath
            });
            eslint = require(eslintPath);
            this.localEslint = true;
            return eslint;
          } catch (_error) {}
        }
      }
      return require('eslint');
    };

    LinterESLint.prototype.lintFile = function(filePath, callback) {
      var CLIEngine, basePath, config, engine, eslintrc, filename, isPluginRule, linter, messages, notFoundPlugins, notFullyCompatible, options, origPath, ralativeToIgnorePath, result, rulesDir, _ref, _ref1, _ref2;
      filename = path.basename(filePath);
      origPath = path.join(this.cwd, filename);
      options = {};
      _ref = this._requireEsLint(origPath), linter = _ref.linter, CLIEngine = _ref.CLIEngine;
      eslintrc = findFile(origPath, '.eslintrc');
      if (!eslintrc && this.disableWhenNoEslintrcFileInPath) {
        return callback([]);
      }
      if (this.rulesDir) {
        rulesDir = findFile(this.cwd, [this.rulesDir], false, 0);
      }
      options.ignorePath = findFile(origPath, '.eslintignore');
      if (options.ignorePath) {
        ralativeToIgnorePath = origPath.replace(path.dirname(options.ignorePath) + path.sep, '');
      }
      if (rulesDir && fs.existsSync(rulesDir)) {
        options.rulePaths = [rulesDir];
      }
      engine = new CLIEngine(options);
      if (options.ignorePath && engine.isPathIgnored(ralativeToIgnorePath)) {
        return callback([]);
      }
      config = {};
      allowUnsafeNewFunction((function(_this) {
        return function() {
          return config = engine.getConfigForFile(origPath);
        };
      })(this));
      notFullyCompatible = false;
      notFoundPlugins = [];
      if ((_ref1 = config.plugins) != null ? _ref1.length : void 0) {
        if (this.localEslint) {
          if (!engine.addPlugin) {
            notFullyCompatible = true;
            options.plugins = config.plugins;
            engine = new CLIEngine(options);
          } else {
            basePath = this.useGlobalEslint ? this.npmPath : origPath;
            config.plugins.forEach(function(pluginName) {
              var npmPluginName, pluginObject, pluginPath;
              npmPluginName = 'eslint-plugin-' + pluginName;
              try {
                pluginPath = resolve(npmPluginName, {
                  basedir: path.dirname(basePath)
                });
                pluginObject = require(pluginPath);
                return engine.addPlugin(npmPluginName, pluginObject);
              } catch (_error) {
                return notFoundPlugins.push(npmPluginName);
              }
            });
          }
        } else {
          isPluginRule = new RegExp("^(" + (config.plugins.join('|')) + ")/");
          Object.keys(config.rules).forEach(function(key) {
            if (isPluginRule.test(key)) {
              return delete config.rules[key];
            }
          });
        }
      }
      result = [];
      if (notFoundPlugins.length) {
        result.push({
          line: 1,
          column: 0,
          severity: 1,
          message: "`npm install " + (notFoundPlugins.join(' ')) + "` in your project (linter-eslint)"
        });
      } else {
        allowUnsafeNewFunction((function(_this) {
          return function() {
            return result = linter.verify(_this.editor.getText(), config);
          };
        })(this));
      }
      if (((_ref2 = config.plugins) != null ? _ref2.length : void 0) && !this.localEslint) {
        result.push({
          line: 1,
          column: 0,
          severity: 1,
          message: "`npm install eslint` in your project to enable plugins: " + (config.plugins.join(', ')) + " (linter-eslint)"
        });
      }
      if (notFullyCompatible) {
        result.push({
          line: 1,
          column: 0,
          severity: 1,
          message: "You are using the version of eslint@0.20 or less. You have to update eslint to 0.21+ or downgrade linter-eslint"
        });
      }
      messages = result.map((function(_this) {
        return function(m) {
          var message;
          message = m.message;
          if (m.ruleId != null) {
            message += " (" + m.ruleId + ")";
          }
          return _this.createMessage({
            line: m.line,
            col: m.column,
            error: m.severity === 2,
            warning: m.severity === 1,
            message: message
          });
        };
      })(this));
      return callback(messages);
    };

    function LinterESLint(editor) {
      LinterESLint.__super__.constructor.call(this, editor);
      this.rulesDirListener = atom.config.observe('linter-eslint.eslintRulesDir', (function(_this) {
        return function(newDir) {
          return _this.rulesDir = newDir;
        };
      })(this));
      atom.config.observe('linter-eslint.disableWhenNoEslintrcFileInPath', (function(_this) {
        return function(skipNonEslint) {
          return _this.disableWhenNoEslintrcFileInPath = skipNonEslint;
        };
      })(this));
      atom.config.observe('linter-eslint.useGlobalEslint', (function(_this) {
        return function(useGlobal) {
          _this.useGlobalEslint = useGlobal;
          if (_this.useGlobalEslint) {
            return _this._findGlobalNpmDir();
          }
        };
      })(this));
    }

    LinterESLint.prototype.destroy = function() {
      return this.rulesDirListener.dispose();
    };

    return LinterESLint;

  })(Linter);

  module.exports = LinterESLint;

}).call(this);
