(function() {
  var CompositeDisposable, Q, ScrollView, ShowTodoView, TodoEmptyView, TodoFileView, TodoNoneView, TodoRegexView, fs, ignore, path, slash, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  ScrollView = require('atom-space-pen-views').ScrollView;

  path = require('path');

  fs = require('fs-plus');

  _ = require('underscore-plus');

  Q = require('q');

  slash = require('slash');

  ignore = require('ignore');

  _ref = require('./todo-item-view'), TodoRegexView = _ref.TodoRegexView, TodoFileView = _ref.TodoFileView, TodoNoneView = _ref.TodoNoneView, TodoEmptyView = _ref.TodoEmptyView;

  module.exports = ShowTodoView = (function(_super) {
    __extends(ShowTodoView, _super);

    ShowTodoView.prototype.maxLength = 120;

    ShowTodoView.prototype.matches = [];

    ShowTodoView.content = function() {
      return this.div({
        "class": 'show-todo-preview native-key-bindings',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'todo-action-items pull-right'
          }, function() {
            _this.a({
              outlet: 'saveAsButton',
              "class": 'icon icon-cloud-download'
            });
            return _this.a({
              outlet: 'refreshButton',
              "class": 'icon icon-sync'
            });
          });
          _this.div({
            outlet: 'todoLoading'
          }, function() {
            _this.div({
              "class": 'markdown-spinner'
            });
            return _this.h5({
              outlet: 'searchCount',
              "class": 'text-center'
            }, "Loading Todos...");
          });
          return _this.div({
            outlet: 'todoList'
          });
        };
      })(this));
    };

    function ShowTodoView(_arg) {
      this.filePath = _arg.filePath;
      ShowTodoView.__super__.constructor.apply(this, arguments);
      this.disposables = new CompositeDisposable;
      this.handleEvents();
      this.searchWorkspace = this.filePath !== '/Open-TODOs';
    }

    ShowTodoView.prototype.handleEvents = function() {
      var pane;
      this.disposables.add(atom.commands.add(this.element, {
        'core:save-as': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this.saveAs();
          };
        })(this),
        'core:refresh': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this.getTodos();
          };
        })(this)
      }));
      pane = atom.workspace.getActivePane();
      if (atom.config.get('todo-show.rememberViewSize')) {
        this.restorePaneFlex(pane);
      }
      this.disposables.add(pane.observeFlexScale((function(_this) {
        return function(flexScale) {
          return _this.savePaneFlex(flexScale);
        };
      })(this)));
      this.saveAsButton.on('click', (function(_this) {
        return function() {
          return _this.saveAs();
        };
      })(this));
      return this.refreshButton.on('click', (function(_this) {
        return function() {
          return _this.getTodos();
        };
      })(this));
    };

    ShowTodoView.prototype.destroy = function() {
      var _ref1;
      this.cancelScan();
      if ((_ref1 = this.disposables) != null) {
        _ref1.dispose();
      }
      return this.detach();
    };

    ShowTodoView.prototype.savePaneFlex = function(flex) {
      return localStorage.setItem('todo-show.flex', flex);
    };

    ShowTodoView.prototype.restorePaneFlex = function(pane) {
      var flex;
      flex = localStorage.getItem('todo-show.flex');
      if (flex) {
        return pane.setFlexScale(parseFloat(flex));
      }
    };

    ShowTodoView.prototype.getTitle = function() {
      if (this.searchWorkspace) {
        return "Todo-Show Results";
      } else {
        return "Todo-Show Open Files";
      }
    };

    ShowTodoView.prototype.getURI = function() {
      return "todolist-preview:///" + (this.getPath());
    };

    ShowTodoView.prototype.getPath = function() {
      return this.filePath;
    };

    ShowTodoView.prototype.getProjectPath = function() {
      return atom.project.getPaths()[0];
    };

    ShowTodoView.prototype.startLoading = function() {
      this.loading = true;
      this.matches = [];
      this.todoList.empty();
      return this.todoLoading.show();
    };

    ShowTodoView.prototype.stopLoading = function() {
      this.loading = false;
      return this.todoLoading.hide();
    };

    ShowTodoView.prototype.buildRegexLookups = function(settingsRegexes) {
      var i, regex, _i, _len, _results;
      _results = [];
      for (i = _i = 0, _len = settingsRegexes.length; _i < _len; i = _i += 2) {
        regex = settingsRegexes[i];
        _results.push({
          'title': regex,
          'regex': settingsRegexes[i + 1]
        });
      }
      return _results;
    };

    ShowTodoView.prototype.makeRegexObj = function(regexStr) {
      var flags, pattern, _ref1, _ref2;
      pattern = (_ref1 = regexStr.match(/\/(.+)\//)) != null ? _ref1[1] : void 0;
      flags = (_ref2 = regexStr.match(/\/(\w+$)/)) != null ? _ref2[1] : void 0;
      if (!pattern) {
        return false;
      }
      return new RegExp(pattern, flags);
    };

    ShowTodoView.prototype.handleScanMatch = function(match, regex) {
      var matchText, _match;
      matchText = match.matchText;
      while ((_match = regex != null ? regex.exec(matchText) : void 0)) {
        matchText = _match.pop();
      }
      matchText = matchText.replace(/(\*\/|\?>|-->|#>|-}|\]\])\s*$/, '').trim();
      if (matchText.length >= this.maxLength) {
        matchText = "" + (matchText.substring(0, this.maxLength - 3)) + "...";
      }
      match.matchText = matchText || 'No details';
      if (match.range.serialize) {
        match.rangeString = match.range.serialize().toString();
      } else {
        match.rangeString = match.range.toString();
      }
      match.relativePath = atom.project.relativize(match.path);
      return match;
    };

    ShowTodoView.prototype.fetchRegexItem = function(regexLookup) {
      var hasIgnores, ignoreRules, ignoresFromSettings, onPathsSearched, options, regex;
      regex = this.makeRegexObj(regexLookup.regex);
      if (!regex) {
        return false;
      }
      ignoresFromSettings = atom.config.get('todo-show.ignoreThesePaths');
      hasIgnores = (ignoresFromSettings != null ? ignoresFromSettings.length : void 0) > 0;
      ignoreRules = ignore({
        ignore: ignoresFromSettings
      });
      options = {};
      if (!this.firstRegex) {
        this.firstRegex = true;
        onPathsSearched = (function(_this) {
          return function(nPaths) {
            if (_this.loading) {
              return _this.searchCount.text("" + nPaths + " paths searched...");
            }
          };
        })(this);
        options = {
          paths: '*',
          onPathsSearched: onPathsSearched
        };
      }
      return atom.workspace.scan(regex, options, (function(_this) {
        return function(result, error) {
          var match, pathToTest, _i, _len, _ref1, _results;
          if (error) {
            console.debug(error.message);
          }
          if (!result) {
            return;
          }
          pathToTest = slash(result.filePath.substring(atom.project.getPaths()[0].length));
          if (hasIgnores && ignoreRules.filter([pathToTest]).length === 0) {
            return;
          }
          _ref1 = result.matches;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            match = _ref1[_i];
            match.title = regexLookup.title;
            match.regex = regexLookup.regex;
            match.path = result.filePath;
            _results.push(_this.matches.push(_this.handleScanMatch(match, regex)));
          }
          return _results;
        };
      })(this));
    };

    ShowTodoView.prototype.fetchOpenRegexItem = function(regexLookup) {
      var deferred, editor, regex, _i, _len, _ref1;
      regex = this.makeRegexObj(regexLookup.regex);
      if (!regex) {
        return false;
      }
      deferred = Q.defer();
      _ref1 = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        editor = _ref1[_i];
        editor.scan(regex, (function(_this) {
          return function(result, error) {
            var match;
            if (error) {
              console.debug(error.message);
            }
            if (!result) {
              return;
            }
            match = {
              title: regexLookup.title,
              regex: regexLookup.regex,
              path: editor.getPath(),
              matchText: result.matchText,
              lineText: result.matchText,
              range: [[result.computedRange.start.row, result.computedRange.start.column], [result.computedRange.end.row, result.computedRange.end.column]]
            };
            return _this.matches.push(_this.handleScanMatch(match, regex));
          };
        })(this));
      }
      deferred.resolve();
      return deferred.promise;
    };

    ShowTodoView.prototype.getTodos = function() {
      var promise, regexObj, regexes, _i, _len;
      this.startLoading();
      regexes = this.buildRegexLookups(atom.config.get('todo-show.findTheseRegexes'));
      this.searchPromises = [];
      for (_i = 0, _len = regexes.length; _i < _len; _i++) {
        regexObj = regexes[_i];
        if (this.searchWorkspace) {
          promise = this.fetchRegexItem(regexObj);
        } else {
          promise = this.fetchOpenRegexItem(regexObj);
        }
        this.searchPromises.push(promise);
      }
      Q.all(this.searchPromises).then((function(_this) {
        return function() {
          _this.stopLoading();
          return _this.renderTodos(_this.matches);
        };
      })(this));
      return this;
    };

    ShowTodoView.prototype.groupMatches = function(matches, cb) {
      var group, groupBy, iteratee, key, regexes, sortedMatches, _ref1, _results;
      regexes = atom.config.get('todo-show.findTheseRegexes');
      groupBy = atom.config.get('todo-show.groupMatchesBy');
      switch (groupBy) {
        case 'file':
          iteratee = 'relativePath';
          sortedMatches = _.sortBy(matches, iteratee);
          break;
        case 'none':
          sortedMatches = _.sortBy(matches, 'matchText');
          return cb(sortedMatches, groupBy);
        default:
          iteratee = 'title';
          sortedMatches = _.sortBy(matches, function(match) {
            return regexes.indexOf(match[iteratee]);
          });
      }
      _ref1 = _.groupBy(sortedMatches, iteratee);
      _results = [];
      for (key in _ref1) {
        if (!__hasProp.call(_ref1, key)) continue;
        group = _ref1[key];
        _results.push(cb(group, groupBy));
      }
      return _results;
    };

    ShowTodoView.prototype.renderTodos = function(matches) {
      if (!matches.length) {
        return this.todoList.append(new TodoEmptyView);
      }
      return this.groupMatches(matches, (function(_this) {
        return function(group, groupBy) {
          switch (groupBy) {
            case 'file':
              return _this.todoList.append(new TodoFileView(group));
            case 'none':
              return _this.todoList.append(new TodoNoneView(group));
            default:
              return _this.todoList.append(new TodoRegexView(group));
          }
        };
      })(this));
    };

    ShowTodoView.prototype.cancelScan = function() {
      var promise, _i, _len, _ref1, _results;
      _ref1 = this.searchPromises;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        promise = _ref1[_i];
        if (promise) {
          _results.push(promise.cancel());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    ShowTodoView.prototype.getMarkdown = function(matches) {
      var markdown;
      markdown = [];
      this.groupMatches(matches, function(group, groupBy) {
        var match, out, _i, _j, _k, _len, _len1, _len2;
        switch (groupBy) {
          case 'file':
            out = "\n## " + (group[0].relativePath || 'Unknown File') + "\n\n";
            for (_i = 0, _len = group.length; _i < _len; _i++) {
              match = group[_i];
              out += "- " + (match.matchText || 'empty');
              if (match.title) {
                out += " `" + match.title + "`";
              }
              out += "\n";
            }
            break;
          case 'none':
            out = "\n## All Matches\n\n";
            for (_j = 0, _len1 = group.length; _j < _len1; _j++) {
              match = group[_j];
              out += "- " + (match.matchText || 'empty');
              if (match.title) {
                out += " _(" + match.title + ")_";
              }
              if (match.relativePath) {
                out += " `" + match.relativePath + "`";
              }
              if (match.range && match.range[0]) {
                out += " `:" + (match.range[0][0] + 1) + "`";
              }
              out += "\n";
            }
            break;
          default:
            out = "\n## " + (group[0].title || 'No Title') + "\n\n";
            for (_k = 0, _len2 = group.length; _k < _len2; _k++) {
              match = group[_k];
              out += "- " + (match.matchText || 'empty');
              if (match.relativePath) {
                out += " `" + match.relativePath + "`";
              }
              if (match.range && match.range[0]) {
                out += " `:" + (match.range[0][0] + 1) + "`";
              }
              out += "\n";
            }
        }
        return markdown.push(out);
      });
      return markdown.join('');
    };

    ShowTodoView.prototype.saveAs = function() {
      var filePath, outputFilePath;
      if (this.loading) {
        return;
      }
      filePath = "" + (path.parse(this.getPath()).name) + ".md";
      if (this.getProjectPath()) {
        filePath = path.join(this.getProjectPath(), filePath);
      }
      if (outputFilePath = atom.showSaveDialogSync(filePath.toLowerCase())) {
        fs.writeFileSync(outputFilePath, this.getMarkdown(this.matches));
        return atom.workspace.open(outputFilePath);
      }
    };

    return ShowTodoView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3Nob3ctdG9kby12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0SUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQyxhQUFjLE9BQUEsQ0FBUSxzQkFBUixFQUFkLFVBREQsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FITCxDQUFBOztBQUFBLEVBSUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUpKLENBQUE7O0FBQUEsRUFNQSxDQUFBLEdBQUksT0FBQSxDQUFRLEdBQVIsQ0FOSixDQUFBOztBQUFBLEVBT0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBUFIsQ0FBQTs7QUFBQSxFQVFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUixDQVJULENBQUE7O0FBQUEsRUFVQSxPQUE2RCxPQUFBLENBQVEsa0JBQVIsQ0FBN0QsRUFBQyxxQkFBQSxhQUFELEVBQWdCLG9CQUFBLFlBQWhCLEVBQThCLG9CQUFBLFlBQTlCLEVBQTRDLHFCQUFBLGFBVjVDLENBQUE7O0FBQUEsRUFZQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osbUNBQUEsQ0FBQTs7QUFBQSwyQkFBQSxTQUFBLEdBQVcsR0FBWCxDQUFBOztBQUFBLDJCQUNBLE9BQUEsR0FBUyxFQURULENBQUE7O0FBQUEsSUFHQSxZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyx1Q0FBUDtBQUFBLFFB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

//# sourceURL=/Users/mk2/.atom/packages/todo-show/lib/show-todo-view.coffee
