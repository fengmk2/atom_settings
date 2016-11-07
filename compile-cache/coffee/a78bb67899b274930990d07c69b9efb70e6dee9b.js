(function() {
  var Task, Transpiler, fs, languagebabelSchema, path, pathIsInside;

  Task = require('atom').Task;

  fs = require('fs-plus');

  path = require('path');

  pathIsInside = require('../node_modules/path-is-inside');

  languagebabelSchema = {
    type: 'object',
    properties: {
      babelMapsPath: {
        type: 'string'
      },
      babelMapsAddUrl: {
        type: 'boolean'
      },
      babelSourcePath: {
        type: 'string'
      },
      babelTranspilePath: {
        type: 'string'
      },
      createMap: {
        type: 'boolean'
      },
      createTargetDirectories: {
        type: 'boolean'
      },
      createTranspiledCode: {
        type: 'boolean'
      },
      disableWhenNoBabelrcFileInPath: {
        type: 'boolean'
      },
      projectRoot: {
        type: 'boolean'
      },
      suppressSourcePathMessages: {
        type: 'boolean'
      },
      suppressTranspileOnSaveMessages: {
        type: 'boolean'
      },
      transpileOnSave: {
        type: 'boolean'
      }
    },
    additionalProperties: false
  };

  Transpiler = (function() {
    Transpiler.prototype.fromGrammarName = 'Babel ES6 JavaScript';

    Transpiler.prototype.fromScopeName = 'source.js.jsx';

    Transpiler.prototype.toScopeName = 'source.js.jsx';

    function Transpiler() {
      this.reqId = 0;
      this.babelTranspilerTasks = {};
      this.babelTransformerPath = require.resolve('./transpiler-task');
      this.transpileErrorNotifications = {};
      this.deprecateConfig();
    }

    Transpiler.prototype.transform = function(code, _arg) {
      var babelOptions, config, filePath, msgObject, pathTo, reqId, sourceMap;
      filePath = _arg.filePath, sourceMap = _arg.sourceMap;
      config = this.getConfig();
      pathTo = this.getPaths(filePath, config);
      this.createTask(pathTo.projectPath);
      babelOptions = {
        filename: filePath,
        sourceMaps: sourceMap != null ? sourceMap : false,
        ast: false
      };
      if (this.babelTranspilerTasks[pathTo.projectPath]) {
        reqId = this.reqId++;
        msgObject = {
          reqId: reqId,
          command: 'transpileCode',
          pathTo: pathTo,
          code: code,
          babelOptions: babelOptions
        };
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var err;
          try {
            _this.babelTranspilerTasks[pathTo.projectPath].send(msgObject);
          } catch (_error) {
            err = _error;
            delete _this.babelTranspilerTasks[pathTo.projectPath];
            reject("Error " + err + " sending to transpile task with PID " + _this.babelTranspilerTasks[pathTo.projectPath].childProcess.pid);
          }
          return _this.babelTranspilerTasks[pathTo.projectPath].once("transpile:" + reqId, function(msgRet) {
            if (msgRet.err != null) {
              return reject("Babel v" + msgRet.babelVersion + "\n" + msgRet.err.message + "\n" + msgRet.babelCoreUsed);
            } else {
              msgRet.sourceMap = msgRet.map;
              return resolve(msgRet);
            }
          });
        };
      })(this));
    };

    Transpiler.prototype.transpile = function(sourceFile, textEditor) {
      var babelOptions, config, err, localConfig, msgObject, pathTo, reqId;
      config = this.getConfig();
      pathTo = this.getPaths(sourceFile, config);
      if (config.allowLocalOverride) {
        if (this.jsonSchema == null) {
          this.jsonSchema = (require('../node_modules/jjv'))();
          this.jsonSchema.addSchema('localConfig', languagebabelSchema);
        }
        localConfig = this.getLocalConfig(pathTo.sourceFileDir, pathTo.projectPath, {});
        this.merge(config, localConfig);
        pathTo = this.getPaths(sourceFile, config);
      }
      if (config.transpileOnSave !== true) {
        return;
      }
      if (config.disableWhenNoBabelrcFileInPath) {
        if (!this.isBabelrcInPath(pathTo.sourceFileDir)) {
          return;
        }
      }
      if (!pathIsInside(pathTo.sourceFile, pathTo.sourceRoot)) {
        if (!config.suppressSourcePathMessages) {
          atom.notifications.addWarning('LB: Babel file is not inside the "Babel Source Path" directory.', {
            dismissable: false,
            detail: "No transpiled code output for file \n" + pathTo.sourceFile + " \n\nTo suppress these 'invalid source path' messages use language-babel package settings"
          });
        }
        return;
      }
      babelOptions = this.getBabelOptions(config);
      this.cleanNotifications(pathTo);
      this.createTask(pathTo.projectPath);
      if (this.babelTranspilerTasks[pathTo.projectPath]) {
        reqId = this.reqId++;
        msgObject = {
          reqId: reqId,
          command: 'transpile',
          pathTo: pathTo,
          babelOptions: babelOptions
        };
        try {
          this.babelTranspilerTasks[pathTo.projectPath].send(msgObject);
        } catch (_error) {
          err = _error;
          console.log("Error " + err + " sending to transpile task with PID " + this.babelTranspilerTasks[pathTo.projectPath].childProcess.pid);
          delete this.babelTranspilerTasks[pathTo.projectPath];
          this.createTask(pathTo.projectPath);
          console.log("Restarted transpile task with PID " + this.babelTranspilerTasks[pathTo.projectPath].childProcess.pid);
          this.babelTranspilerTasks[pathTo.projectPath].send(msgObject);
        }
        return this.babelTranspilerTasks[pathTo.projectPath].once("transpile:" + reqId, (function(_this) {
          return function(msgRet) {
            var mapJson, xssiProtection, _ref, _ref1, _ref2;
            if ((_ref = msgRet.result) != null ? _ref.ignored : void 0) {
              return;
            }
            if (msgRet.err) {
              if (msgRet.err.stack) {
                return _this.transpileErrorNotifications[pathTo.sourceFile] = atom.notifications.addError("LB: Babel Transpiler Error", {
                  dismissable: true,
                  detail: "" + msgRet.err.message + "\n \n" + msgRet.babelCoreUsed + "\n \n" + msgRet.err.stack
                });
              } else {
                _this.transpileErrorNotifications[pathTo.sourceFile] = atom.notifications.addError("LB: Babel v" + msgRet.babelVersion + " Transpiler Error", {
                  dismissable: true,
                  detail: "" + msgRet.err.message + "\n \n" + msgRet.babelCoreUsed + "\n \n" + msgRet.err.codeFrame
                });
                if ((((_ref1 = msgRet.err.loc) != null ? _ref1.line : void 0) != null) && (textEditor != null)) {
                  return textEditor.setCursorBufferPosition([msgRet.err.loc.line - 1, msgRet.err.loc.column]);
                }
              }
            } else {
              if (!config.suppressTranspileOnSaveMessages) {
                atom.notifications.addInfo("LB: Babel v" + msgRet.babelVersion + " Transpiler Success", {
                  detail: "" + pathTo.sourceFile + "\n \n" + msgRet.babelCoreUsed
                });
              }
              if (!config.createTranspiledCode) {
                if (!config.suppressTranspileOnSaveMessages) {
                  atom.notifications.addInfo('LB: No transpiled output configured');
                }
                return;
              }
              if (pathTo.sourceFile === pathTo.transpiledFile) {
                atom.notifications.addWarning('LB: Transpiled file would overwrite source file. Aborted!', {
                  dismissable: true,
                  detail: pathTo.sourceFile
                });
                return;
              }
              if (config.createTargetDirectories) {
                fs.makeTreeSync(path.parse(pathTo.transpiledFile).dir);
              }
              if (config.babelMapsAddUrl) {
                msgRet.result.code = msgRet.result.code + '\n' + '//# sourceMappingURL=' + pathTo.mapFile;
              }
              fs.writeFileSync(pathTo.transpiledFile, msgRet.result.code);
              if (config.createMap && ((_ref2 = msgRet.result.map) != null ? _ref2.version : void 0)) {
                if (config.createTargetDirectories) {
                  fs.makeTreeSync(path.parse(pathTo.mapFile).dir);
                }
                mapJson = {
                  version: msgRet.result.map.version,
                  sources: pathTo.sourceFile,
                  file: pathTo.transpiledFile,
                  sourceRoot: '',
                  names: msgRet.result.map.names,
                  mappings: msgRet.result.map.mappings
                };
                xssiProtection = ')]}\n';
                return fs.writeFileSync(pathTo.mapFile, xssiProtection + JSON.stringify(mapJson, null, ' '));
              }
            }
          };
        })(this));
      }
    };

    Transpiler.prototype.cleanNotifications = function(pathTo) {
      var i, n, sf, _ref, _results;
      if (this.transpileErrorNotifications[pathTo.sourceFile] != null) {
        this.transpileErrorNotifications[pathTo.sourceFile].dismiss();
        delete this.transpileErrorNotifications[pathTo.sourceFile];
      }
      _ref = this.transpileErrorNotifications;
      for (sf in _ref) {
        n = _ref[sf];
        if (n.dismissed) {
          delete this.transpileErrorNotifications[sf];
        }
      }
      i = atom.notifications.notifications.length - 1;
      _results = [];
      while (i >= 0) {
        if (atom.notifications.notifications[i].dismissed && atom.notifications.notifications[i].message.substring(0, 3) === "LB:") {
          atom.notifications.notifications.splice(i, 1);
        }
        _results.push(i--);
      }
      return _results;
    };

    Transpiler.prototype.createTask = function(projectPath) {
      var _base;
      return (_base = this.babelTranspilerTasks)[projectPath] != null ? _base[projectPath] : _base[projectPath] = Task.once(this.babelTransformerPath, projectPath, (function(_this) {
        return function() {
          return delete _this.babelTranspilerTasks[projectPath];
        };
      })(this));
    };

    Transpiler.prototype.deprecateConfig = function() {
      if (atom.config.get('language-babel.supressTranspileOnSaveMessages') != null) {
        atom.config.set('language-babel.suppressTranspileOnSaveMessages', atom.config.get('language-babel.supressTranspileOnSaveMessages'));
      }
      if (atom.config.get('language-babel.supressSourcePathMessages') != null) {
        atom.config.set('language-babel.suppressSourcePathMessages', atom.config.get('language-babel.supressSourcePathMessages'));
      }
      atom.config.unset('language-babel.supressTranspileOnSaveMessages');
      atom.config.unset('language-babel.supressSourcePathMessages');
      atom.config.unset('language-babel.useInternalScanner');
      atom.config.unset('language-babel.stopAtProjectDirectory');
      atom.config.unset('language-babel.babelStage');
      atom.config.unset('language-babel.externalHelpers');
      atom.config.unset('language-babel.moduleLoader');
      atom.config.unset('language-babel.blacklistTransformers');
      atom.config.unset('language-babel.whitelistTransformers');
      atom.config.unset('language-babel.looseTransformers');
      atom.config.unset('language-babel.optionalTransformers');
      atom.config.unset('language-babel.plugins');
      atom.config.unset('language-babel.presets');
      return atom.config.unset('language-babel.formatJSX');
    };

    Transpiler.prototype.getBabelOptions = function(config) {
      var babelOptions;
      return babelOptions = {
        sourceMaps: config.createMap,
        code: true
      };
    };

    Transpiler.prototype.getConfig = function() {
      return atom.config.get('language-babel');
    };

    Transpiler.prototype.getLocalConfig = function(fromDir, toDir, localConfig) {
      var err, fileContent, isProjectRoot, jsonContent, languageBabelCfgFile, localConfigFile, schemaErrors;
      localConfigFile = '.languagebabel';
      languageBabelCfgFile = path.join(fromDir, localConfigFile);
      if (fs.existsSync(languageBabelCfgFile)) {
        fileContent = fs.readFileSync(languageBabelCfgFile, 'utf8');
        try {
          jsonContent = JSON.parse(fileContent);
        } catch (_error) {
          err = _error;
          atom.notifications.addError("LB: " + localConfigFile + " " + err.message, {
            dismissable: true,
            detail: "File = " + languageBabelCfgFile + "\n\n" + fileContent
          });
          return;
        }
        schemaErrors = this.jsonSchema.validate('localConfig', jsonContent);
        if (schemaErrors) {
          atom.notifications.addError("LB: " + localConfigFile + " configuration error", {
            dismissable: true,
            detail: "File = " + languageBabelCfgFile + "\n\n" + fileContent
          });
        } else {
          isProjectRoot = jsonContent.projectRoot;
          this.merge(jsonContent, localConfig);
          if (isProjectRoot) {
            jsonContent.projectRootDir = fromDir;
          }
          localConfig = jsonContent;
        }
      }
      if (fromDir !== toDir) {
        if (fromDir === path.dirname(fromDir)) {
          return localConfig;
        }
        if (isProjectRoot) {
          return localConfig;
        }
        return this.getLocalConfig(path.dirname(fromDir), toDir, localConfig);
      } else {
        return localConfig;
      }
    };

    Transpiler.prototype.getPaths = function(sourceFile, config) {
      var absMapFile, absMapsRoot, absProjectPath, absSourceRoot, absTranspileRoot, absTranspiledFile, parsedSourceFile, projectContainingSource, relMapsPath, relSourcePath, relSourceRootToSourceFile, relTranspilePath, sourceFileInProject;
      projectContainingSource = atom.project.relativizePath(sourceFile);
      if (projectContainingSource[0] === null) {
        sourceFileInProject = false;
      } else {
        sourceFileInProject = true;
      }
      if (config.projectRootDir != null) {
        absProjectPath = path.normalize(config.projectRootDir);
      } else if (projectContainingSource[0] === null) {
        absProjectPath = path.parse(sourceFile).root;
      } else {
        absProjectPath = path.normalize(projectContainingSource[0]);
      }
      relSourcePath = path.normalize(config.babelSourcePath);
      relTranspilePath = path.normalize(config.babelTranspilePath);
      relMapsPath = path.normalize(config.babelMapsPath);
      absSourceRoot = path.join(absProjectPath, relSourcePath);
      absTranspileRoot = path.join(absProjectPath, relTranspilePath);
      absMapsRoot = path.join(absProjectPath, relMapsPath);
      parsedSourceFile = path.parse(sourceFile);
      relSourceRootToSourceFile = path.relative(absSourceRoot, parsedSourceFile.dir);
      absTranspiledFile = path.join(absTranspileRoot, relSourceRootToSourceFile, parsedSourceFile.name + '.js');
      absMapFile = path.join(absMapsRoot, relSourceRootToSourceFile, parsedSourceFile.name + '.js.map');
      return {
        sourceFileInProject: sourceFileInProject,
        sourceFile: sourceFile,
        sourceFileDir: parsedSourceFile.dir,
        mapFile: absMapFile,
        transpiledFile: absTranspiledFile,
        sourceRoot: absSourceRoot,
        projectPath: absProjectPath
      };
    };

    Transpiler.prototype.isBabelrcInPath = function(fromDir) {
      var babelrc, babelrcFile;
      babelrc = '.babelrc';
      babelrcFile = path.join(fromDir, babelrc);
      if (fs.existsSync(babelrcFile)) {
        return true;
      }
      if (fromDir !== path.dirname(fromDir)) {
        return this.isBabelrcInPath(path.dirname(fromDir));
      } else {
        return false;
      }
    };

    Transpiler.prototype.merge = function(targetObj, sourceObj) {
      var prop, val, _results;
      _results = [];
      for (prop in sourceObj) {
        val = sourceObj[prop];
        _results.push(targetObj[prop] = val);
      }
      return _results;
    };

    Transpiler.prototype.stopTranspilerTask = function(projectPath) {
      var msgObject;
      msgObject = {
        command: 'stop'
      };
      return this.babelTranspilerTasks[projectPath].send(msgObject);
    };

    Transpiler.prototype.stopAllTranspilerTask = function() {
      var projectPath, v, _ref, _results;
      _ref = this.babelTranspilerTasks;
      _results = [];
      for (projectPath in _ref) {
        v = _ref[projectPath];
        _results.push(this.stopTranspilerTask(projectPath));
      }
      return _results;
    };

    Transpiler.prototype.stopUnusedTasks = function() {
      var atomProjectPath, atomProjectPaths, isTaskInCurrentProject, projectTaskPath, v, _i, _len, _ref, _results;
      atomProjectPaths = atom.project.getPaths();
      _ref = this.babelTranspilerTasks;
      _results = [];
      for (projectTaskPath in _ref) {
        v = _ref[projectTaskPath];
        isTaskInCurrentProject = false;
        for (_i = 0, _len = atomProjectPaths.length; _i < _len; _i++) {
          atomProjectPath = atomProjectPaths[_i];
          if (pathIsInside(projectTaskPath, atomProjectPath)) {
            isTaskInCurrentProject = true;
            break;
          }
        }
        if (!isTaskInCurrentProject) {
          _results.push(this.stopTranspilerTask(projectTaskPath));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return Transpiler;

  })();

  module.exports = Transpiler;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1iYWJlbC9saWIvdHJhbnNwaWxlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkRBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxNQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGdDQUFSLENBSGYsQ0FBQTs7QUFBQSxFQU1BLG1CQUFBLEdBQXNCO0FBQUEsSUFDcEIsSUFBQSxFQUFNLFFBRGM7QUFBQSxJQUVwQixVQUFBLEVBQVk7QUFBQSxNQUNWLGFBQUEsRUFBa0M7QUFBQSxRQUFFLElBQUEsRUFBTSxRQUFSO09BRHhCO0FBQUEsTUFFVixlQUFBLEVBQWtDO0FBQUEsUUFBRSxJQUFBLEVBQU0sU0FBUjtPQUZ4QjtBQUFBLE1BR1YsZUFBQSxFQUFrQztBQUFBLFFBQUUsSUFBQSxFQUFNLFFBQVI7T0FIeEI7QUFBQSxNQUlWLGtCQUFBLEVBQWtDO0FBQUEsUUFBRSxJQUFBLEVBQU0sUUFBUjtPQUp4QjtBQUFBLE1BS1YsU0FBQSxFQUFrQztBQUFBLFFBQUUsSUFBQSxFQUFNLFNBQVI7T0FMeEI7QUFBQSxNQU1WLHVCQUFBLEVBQWtDO0FBQUEsUUFBRSxJQUFBLEVBQU0sU0FBUjtPQU54QjtBQUFBLE1BT1Ysb0JBQUEsRUFBa0M7QUFBQSxRQUFFLElBQUEsRUFBTSxTQUFSO09BUHhCO0FBQUEsTUFRViw4QkFBQSxFQUFrQztBQUFBLFFBQUUsSUFBQSxFQUFNLFNBQVI7T0FSeEI7QUFBQSxNQVNWLFdBQUEsRUFBa0M7QUFBQSxRQUFFLElB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

//# sourceURL=/Users/mk2/.atom/packages/language-babel/lib/transpiler.coffee
