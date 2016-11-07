(function() {
  var CompositeDisposable, allowUnsafeNewFunction, execSync, findFile, linterPackage, path, statSync, sync;

  path = require('path');

  sync = require('resolve').sync;

  execSync = require('child_process').execSync;

  statSync = require('fs').statSync;

  findFile = require('atom-linter').findFile;

  CompositeDisposable = require('atom').CompositeDisposable;

  allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction;

  linterPackage = atom.packages.getLoadedPackage('linter');

  if (!linterPackage) {
    return atom.notifications.addError('Linter should be installed first, `apm install linter`', {
      dismissable: true
    });
  }

  module.exports = {
    config: {
      eslintRulesDir: {
        type: 'string',
        "default": ''
      },
      disableWhenNoEslintrcFileInPath: {
        type: 'boolean',
        "default": false,
        description: 'Disable linter when no `.eslintrc` is found in project'
      },
      useGlobalEslint: {
        type: 'boolean',
        "default": false,
        description: 'Use globally installed `eslint`'
      },
      showRuleIdInMessage: {
        type: 'boolean',
        "default": true,
        description: 'Show the `eslint` rule before error'
      },
      globalNodePath: {
        type: 'string',
        "default": '',
        description: 'Run `$ npm config get prefix` to find it'
      }
    },
    activate: function() {
      console.log('activate linter-eslint');
      this.subscriptions = new CompositeDisposable;
      if (atom.config.get('linter-eslint.useGlobalEslint')) {
        return this.findGlobalNPMdir();
      }
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    provideLinter: function() {
      var provider;
      return provider = {
        grammarScopes: ['source.js', 'source.js.jsx', 'source.babel', 'source.js-semantic'],
        scope: 'file',
        lintOnFly: true,
        lint: (function(_this) {
          return function(TextEditor) {
            var CLIEngine, config, dirname, engine, error, eslintConfig, filePath, linter, onlyConfig, options, relative, results, rulesDir, showRuleId, _ref;
            filePath = TextEditor.getPath();
            dirname = filePath ? path.dirname(filePath) : '';
            onlyConfig = atom.config.get('linter-eslint.disableWhenNoEslintrcFileInPath');
            eslintConfig = findFile(filePath, '.eslintrc');
            if (onlyConfig && !eslintConfig) {
              return [];
            }
            options = {};
            options.ignorePath = findFile(filePath, '.eslintignore');
            rulesDir = atom.config.get('linter-eslint.eslintRulesDir');
            if (rulesDir) {
              rulesDir = findFile(dirname, [rulesDir], false, 0);
            }
            showRuleId = atom.config.get('linter-eslint.showRuleIdInMessage');
            if (rulesDir) {
              try {
                if (statSync(rulesDir).isDirectory()) {
                  options.rulePaths = [rulesDir];
                }
              } catch (_error) {
                error = _error;
                console.warn('[Linter-ESLint] ESlint rules directory does not exist in your fs');
                console.warn(error.message);
              }
            }
            _ref = _this.requireESLint(filePath), linter = _ref.linter, CLIEngine = _ref.CLIEngine;
            if (filePath) {
              engine = new CLIEngine(options);
              config = {};
              allowUnsafeNewFunction(function() {
                return config = engine.getConfigForFile(filePath);
              });
              if (options.ignorePath) {
                relative = filePath.replace("" + (path.dirname(options.ignorePath)) + path.sep, '');
                if (engine.isPathIgnored(relative || engine.isPathIgnored("" + relative + "/"))) {
                  return [];
                }
              }
              if (config.plugins) {
                if (engine.addPlugin) {
                  config.plugins.forEach(_this.loadPlugin.bind(_this, engine, filePath));
                } else {
                  options.plugins = config.plugins;
                  engine = new CLIEngine(options);
                }
              }
              try {
                results = [];
                allowUnsafeNewFunction(function() {
                  return results = linter.verify(TextEditor.getText(), config, filePath).map(function(_arg) {
                    var endCol, indentLevel, line, message, range, ruleId, severity, startCol;
                    message = _arg.message, line = _arg.line, severity = _arg.severity, ruleId = _arg.ruleId;
                    indentLevel = TextEditor.indentationForBufferRow(line - 1);
                    startCol = TextEditor.getTabLength() * indentLevel;
                    endCol = TextEditor.getBuffer().lineLengthForRow(line - 1);
                    range = [[line - 1, startCol], [line - 1, endCol]];
                    if (showRuleId) {
                      return {
                        type: severity === 1 ? 'warning' : 'error',
                        html: '<span class="badge badge-flexible">' + ruleId + '</span> ' + message,
                        filePath: filePath,
                        range: range
                      };
                    } else {
                      return {
                        type: severity === 1 ? 'warning' : 'error',
                        text: message,
                        filePath: filePath,
                        range: range
                      };
                    }
                  });
                });
                return results;
              } catch (_error) {
                error = _error;
                console.warn('[Linter-ESLint] error while linting file');
                console.warn(error.message);
                console.warn(error.stack);
                return [
                  {
                    type: 'error',
                    text: 'error while linting file, open the console for more information',
                    file: filePath,
                    range: [[0, 0], [0, 0]]
                  }
                ];
              }
            }
          };
        })(this)
      };
    },
    loadPlugin: function(engine, filePath, pluginName) {
      var error, namespace, npmPluginName, plugin, pluginPath, _ref;
      namespace = '';
      if (pluginName[0] === '@') {
        _ref = pluginName.split('/'), namespace = _ref[0], pluginName = _ref[1];
        namespace += '/';
      }
      npmPluginName = pluginName.replace('eslint-plugin-', '');
      npmPluginName = "" + namespace + "eslint-plugin-" + npmPluginName;
      try {
        pluginPath = sync(npmPluginName, {
          basedir: path.dirname(filePath)
        });
        plugin = require(pluginPath);
        return engine.addPlugin(pluginName, plugin);
      } catch (_error) {
        error = _error;
        if (this.useGlobalEslint) {
          try {
            pluginPath = sync(npmPluginName, {
              basedir: this.npmPath
            });
            plugin = require(pluginPath);
            return engine.addPlugin(pluginName, plugin);
          } catch (_error) {}
        }
      }
      console.warn("[Linter-ESLint] error loading plugin");
      console.warn(error.message);
      console.warn(error.stack);
      return atom.notifications.addError("[Linter-ESLint] plugin " + pluginName + " not found", {
        dismissable: true
      });
    },
    requireESLint: function(filePath) {
      var error, eslint, eslintPath;
      this.localEslint = false;
      try {
        eslint = this.requireLocalESLint(filePath);
        this.localEslint = true;
        return eslint;
      } catch (_error) {
        error = _error;
        if (this.useGlobalEslint) {
          try {
            eslintPath = sync('eslint', {
              basedir: this.npmPath
            });
            eslint = allowUnsafeNewFunction(function() {
              return require(eslintPath);
            });
            this.localEslint = true;
            return eslint;
          } catch (_error) {}
        } else {
          if (!this.warnNotFound) {
            console.warn('[Linter-ESLint] local `eslint` not found');
            console.warn(error);
            atom.notifications.addError('[Linter-ESLint] `eslint` binary not found locally, falling back to packaged one. Plugins won\'t be loaded and linting will possibly not work. (Try `Use Global ESLint` option, or install locally `eslint` to your project.)', {
              dismissable: true
            });
            this.warnNotFound = true;
          }
        }
      }
      return require('eslint');
    },
    requireLocalESLint: function(filePath) {
      var currentPath, eslintPath;
      currentPath = filePath;
      while (currentPath !== path.dirname(currentPath)) {
        currentPath = path.dirname(currentPath);
        try {
          eslintPath = sync('eslint', {
            basedir: currentPath
          });
        } catch (_error) {
          continue;
        }
        return allowUnsafeNewFunction(function() {
          return require(eslintPath);
        });
      }
      throw new Error("Could not find `eslint` locally installed in " + (path.dirname(filePath)) + " or any parent directories");
    },
    findGlobalNPMdir: function() {
      var error, globalNodePath, globalNpmPath;
      try {
        globalNodePath = atom.config.get('linter-eslint.globalNodePath');
        if (!globalNodePath) {
          globalNodePath = execSync('npm config get prefix', {
            encoding: 'utf8'
          });
          globalNodePath = globalNodePath.replace(/[\n\r\t]/g, '');
        }
        globalNpmPath = path.join(globalNodePath, 'node_modules');
        try {
          statSync(globalNpmPath).isDirectory();
        } catch (_error) {
          globalNpmPath = path.join(globalNodePath, 'lib', 'node_modules');
        }
        if (statSync(globalNpmPath).isDirectory()) {
          this.useGlobalEslint = true;
          return this.npmPath = globalNpmPath;
        }
      } catch (_error) {
        error = _error;
        console.warn('[Linter-ESlint] error loading global eslint');
        console.warn(error);
        return atom.notifications.addError('[Linter-ESLint] Global node modules path not found, using packaged ESlint. Plugins won\'t be loaded and linting will possibly not work. (Try to set `Global node path` if not set)', {
          dismissable: true
        });
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L2xpYi9saW50ZXItZXNsaW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvR0FBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQyxPQUFRLE9BQUEsQ0FBUSxTQUFSLEVBQVIsSUFERCxDQUFBOztBQUFBLEVBRUMsV0FBWSxPQUFBLENBQVEsZUFBUixFQUFaLFFBRkQsQ0FBQTs7QUFBQSxFQUdDLFdBQVksT0FBQSxDQUFRLElBQVIsRUFBWixRQUhELENBQUE7O0FBQUEsRUFJQyxXQUFZLE9BQUEsQ0FBUSxhQUFSLEVBQVosUUFKRCxDQUFBOztBQUFBLEVBS0Msc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUxELENBQUE7O0FBQUEsRUFNQyx5QkFBMEIsT0FBQSxDQUFRLFVBQVIsRUFBMUIsc0JBTkQsQ0FBQTs7QUFBQSxFQVFBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixRQUEvQixDQVJoQixDQUFBOztBQVNBLEVBQUEsSUFBQSxDQUFBLGFBQUE7QUFDRSxXQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsd0RBQTVCLEVBQXNGO0FBQUEsTUFBQSxXQUFBLEVBQWEsSUFBYjtLQUF0RixDQUFQLENBREY7R0FUQTs7QUFBQSxFQVlBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsY0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEVBRFQ7T0FERjtBQUFBLE1BR0EsK0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxR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

//# sourceURL=/Users/mk2/.atom/packages/linter-eslint/lib/linter-eslint.coffee
