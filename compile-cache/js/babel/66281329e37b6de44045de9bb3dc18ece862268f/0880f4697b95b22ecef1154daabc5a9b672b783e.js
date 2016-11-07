function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _helpers = require('./helpers');

var _escapeHtml = require('escape-html');

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

'use babel';

module.exports = {
  config: {
    lintHtmlFiles: {
      title: 'Lint HTML Files',
      description: 'You should also add `eslint-plugin-html` to your .eslintrc plugins',
      type: 'boolean',
      'default': false
    },
    useGlobalEslint: {
      title: 'Use global ESLint installation',
      description: 'Make sure you have it in your $PATH',
      type: 'boolean',
      'default': false
    },
    showRuleIdInMessage: {
      title: 'Show Rule ID in Messages',
      type: 'boolean',
      'default': true
    },
    disableWhenNoEslintConfig: {
      title: 'Disable when no ESLint config is found (in package.json or .eslintrc)',
      type: 'boolean',
      'default': true
    },
    eslintrcPath: {
      title: '.eslintrc Path',
      description: "It will only be used when there's no config file in project",
      type: 'string',
      'default': ''
    },
    globalNodePath: {
      title: 'Global Node Installation Path',
      description: 'Write the value of `npm get prefix` here',
      type: 'string',
      'default': ''
    },
    eslintRulesDir: {
      title: 'ESLint Rules Dir',
      description: 'Specify a directory for ESLint to load rules from',
      type: 'string',
      'default': ''
    },
    disableEslintIgnore: {
      title: 'Disable using .eslintignore files',
      type: 'boolean',
      'default': false
    },
    disableFSCache: {
      title: 'Disable FileSystem Cache',
      description: 'Paths of node_modules, .eslintignore and others are cached',
      type: 'boolean',
      'default': false
    }
  },
  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install();

    this.subscriptions = new _atom.CompositeDisposable();
    this.active = true;
    this.worker = null;
    this.scopes = ['source.js', 'source.jsx', 'source.js.jsx', 'source.babel', 'source.js-semantic'];

    var embeddedScope = 'source.js.embedded.html';
    this.subscriptions.add(atom.config.observe('linter-eslint.lintHtmlFiles', function (lintHtmlFiles) {
      if (lintHtmlFiles) {
        _this.scopes.push(embeddedScope);
      } else {
        if (_this.scopes.indexOf(embeddedScope) !== -1) {
          _this.scopes.splice(_this.scopes.indexOf(embeddedScope), 1);
        }
      }
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'linter-eslint:fix-file': function linterEslintFixFile() {
        var textEditor = atom.workspace.getActiveTextEditor();
        var filePath = textEditor.getPath();

        if (!textEditor || textEditor.isModified()) {
          // Abort for invalid or unsaved text editors
          atom.notifications.addError('Linter-ESLint: Please save before fixing');
          return;
        }

        _this.worker.request('job', {
          type: 'fix',
          config: atom.config.get('linter-eslint'),
          filePath: filePath
        }).then(function (response) {
          return atom.notifications.addSuccess(response);
        })['catch'](function (response) {
          return atom.notifications.addWarning(response);
        });
      }
    }));

    var initializeWorker = function initializeWorker() {
      var _spawnWorker = (0, _helpers.spawnWorker)();

      var worker = _spawnWorker.worker;
      var subscription = _spawnWorker.subscription;

      _this.worker = worker;
      _this.subscriptions.add(subscription);
      worker.onDidExit(function () {
        if (_this.active) {
          (0, _helpers.showError)('Worker died unexpectedly', 'Check your console for more ' + 'info. A new worker will be spawned instantly.');
          setTimeout(initializeWorker, 1000);
        }
      });
    };
    initializeWorker();
  },
  deactivate: function deactivate() {
    this.active = false;
    this.subscriptions.dispose();
  },
  provideLinter: function provideLinter() {
    var _this2 = this;

    var Helpers = require('atom-linter');
    return {
      name: 'ESLint',
      grammarScopes: this.scopes,
      scope: 'file',
      lintOnFly: true,
      lint: function lint(textEditor) {
        var text = textEditor.getText();
        if (text.length === 0) {
          return Promise.resolve([]);
        }
        var filePath = textEditor.getPath();
        var showRule = atom.config.get('linter-eslint.showRuleIdInMessage');

        return _this2.worker.request('job', {
          contents: text,
          type: 'lint',
          config: atom.config.get('linter-eslint'),
          filePath: filePath
        }).then(function (response) {
          return response.map(function (_ref) {
            var message = _ref.message;
            var line = _ref.line;
            var severity = _ref.severity;
            var ruleId = _ref.ruleId;
            var column = _ref.column;
            var fix = _ref.fix;

            var textBuffer = textEditor.getBuffer();
            var linterFix = null;
            if (fix) {
              var fixRange = new _atom.Range(textBuffer.positionForCharacterIndex(fix.range[0]), textBuffer.positionForCharacterIndex(fix.range[1]));
              linterFix = {
                range: fixRange,
                newText: fix.text
              };
            }
            var range = Helpers.rangeFromLineNumber(textEditor, line - 1);
            if (column) {
              range[0][1] = column - 1;
            }
            if (column > range[1][1]) {
              range[1][1] = column - 1;
            }
            var ret = {
              filePath: filePath,
              type: severity === 1 ? 'Warning' : 'Error',
              range: range
            };
            if (showRule) {
              ret.html = '<span class="badge badge-flexible">' + ((ruleId || 'Fatal') + '</span>' + (0, _escapeHtml2['default'])(message));
            } else {
              ret.text = message;
            }
            if (linterFix) {
              ret.fix = linterFix;
            }
            return ret;
          });
        });
      }
    };
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztvQkFFMkMsTUFBTTs7dUJBQ1YsV0FBVzs7MEJBQzNCLGFBQWE7Ozs7QUFKcEMsV0FBVyxDQUFBOztBQU1YLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixRQUFNLEVBQUU7QUFDTixpQkFBYSxFQUFFO0FBQ2IsV0FBSyxFQUFFLGlCQUFpQjtBQUN4QixpQkFBVyxFQUFFLG9FQUFvRTtBQUNqRixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELG1CQUFlLEVBQUU7QUFDZixXQUFLLEVBQUUsZ0NBQWdDO0FBQ3ZDLGlCQUFXLEVBQUUscUNBQXFDO0FBQ2xELFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztLQUNmO0FBQ0QsdUJBQW1CLEVBQUU7QUFDbkIsV0FBSyxFQUFFLDBCQUEwQjtBQUNqQyxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLElBQUk7S0FDZDtBQUNELDZCQUF5QixFQUFFO0FBQ3pCLFdBQUssRUFBRSx1RUFBdUU7QUFDOUUsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxnQkFBWSxFQUFFO0FBQ1osV0FBSyxFQUFFLGdCQUFnQjtBQUN2QixpQkFBVyxFQUFFLDZEQUE2RDtBQUMxRSxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLEVBQUU7S0FDWjtBQUNELGtCQUFjLEVBQUU7QUFDZCxXQUFLLEVBQUUsK0JBQStCO0FBQ3RDLGlCQUFXLEVBQUUsMENBQTBDO0FBQ3ZELFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsRUFBRTtLQUNaO0FBQ0Qsa0JBQWMsRUFBRTtBQUNkLFdBQUssRUFBRSxrQkFBa0I7QUFDekIsaUJBQVcsRUFBRSxtREFBbUQ7QUFDaEUsVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxFQUFFO0tBQ1o7QUFDRCx1QkFBbUIsRUFB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QVEsS0FBSyxDQUFDLEdBQUcsU0FBUyxHQUFHLE9BQU87QUFDMUMsbUJBQUssRUFBTCxLQUFLO2FBQ04sQ0FBQTtBQUNELGdCQUFJLFFBQVEsRUFBRTtBQUNaLGlCQUFHLENBQUMsSUFBSSxHQUFHLHFDQUFxQyxLQUMzQyxNQUFNLElBQUksT0FBTyxDQUFBLGVBQVUsNkJBQVcsT0FBTyxDQUFDLENBQUUsQ0FBQTthQUN0RCxNQUFNO0FBQ0wsaUJBQUcsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFBO2FBQ25CO0FBQ0QsZ0JBQUksU0FBUyxFQUFFO0FBQ2IsaUJBQUcsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFBO2FBQ3BCO0FBQ0QsbUJBQU8sR0FBRyxDQUFBO1dBQ1gsQ0FBQztTQUFBLENBQ0gsQ0FBQTtPQUNGO0tBQ0YsQ0FBQTtHQUNGO0NBQ0YsQ0FBQSIsImZpbGUiOiIvVXNlcnMvbWsyLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBSYW5nZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBzcGF3bldvcmtlciwgc2hvd0Vycm9yIH0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IGVzY2FwZUhUTUwgZnJvbSAnZXNjYXBlLWh0bWwnXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjb25maWc6IHtcbiAgICBsaW50SHRtbEZpbGVzOiB7XG4gICAgICB0aXRsZTogJ0xpbnQgSFRNTCBGaWxlcycsXG4gICAgICBkZXNjcmlwdGlvbjogJ1lvdSBzaG91bGQgYWxzbyBhZGQgYGVzbGludC1wbHVnaW4taHRtbGAgdG8geW91ciAuZXNsaW50cmMgcGx1Z2lucycsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgdXNlR2xvYmFsRXNsaW50OiB7XG4gICAgICB0aXRsZTogJ1VzZSBnbG9iYWwgRVNMaW50IGluc3RhbGxhdGlvbicsXG4gICAgICBkZXNjcmlwdGlvbjogJ01ha2Ugc3VyZSB5b3UgaGF2ZSBpdCBpbiB5b3VyICRQQVRIJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBzaG93UnVsZUlkSW5NZXNzYWdlOiB7XG4gICAgICB0aXRsZTogJ1Nob3cgUnVsZSBJRCBpbiBNZXNzYWdlcycsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBkaXNhYmxlV2hlbk5vRXNsaW50Q29uZmlnOiB7XG4gICAgICB0aXRsZTogJ0Rpc2FibGUgd2hlbiBubyBFU0xpbnQgY29uZmlnIGlzIGZvdW5kIChpbiBwYWNrYWdlLmpzb24gb3IgLmVzbGludHJjKScsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBlc2xpbnRyY1BhdGg6IHtcbiAgICAgIHRpdGxlOiAnLmVzbGludHJjIFBhdGgnLFxuICAgICAgZGVzY3JpcHRpb246IFwiSXQgd2lsbCBvbmx5IGJlIHVzZWQgd2hlbiB0aGVyZSdzIG5vIGNvbmZpZyBmaWxlIGluIHByb2plY3RcIixcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJydcbiAgICB9LFxuICAgIGdsb2JhbE5vZGVQYXRoOiB7XG4gICAgICB0aXRsZTogJ0dsb2JhbCBOb2RlIEluc3RhbGxhdGlvbiBQYXRoJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnV3JpdGUgdGhlIHZhbHVlIG9mIGBucG0gZ2V0IHByZWZpeGAgaGVyZScsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgfSxcbiAgICBlc2xpbnRSdWxlc0Rpcjoge1xuICAgICAgdGl0bGU6ICdFU0xpbnQgUnVsZXMgRGlyJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3BlY2lmeSBhIGRpcmVjdG9yeSBmb3IgRVNMaW50IHRvIGxvYWQgcnVsZXMgZnJvbScsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgfSxcbiAgICBkaXNhYmxlRXNsaW50SWdub3JlOiB7XG4gICAgICB0aXRsZTogJ0Rpc2FibGUgdXNpbmcgLmVzbGludGlnbm9yZSBmaWxlcycsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgZGlzYWJsZUZTQ2FjaGU6IHtcbiAgICAgIHRpdGxlOiAnRGlzYWJsZSBGaWxlU3lzdGVtIENhY2hlJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUGF0aHMgb2Ygbm9kZV9tb2R1bGVzLCAuZXNsaW50aWdub3JlIGFuZCBvdGhlcnMgYXJlIGNhY2hlZCcsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH1cbiAgfSxcbiAgYWN0aXZhdGUoKSB7XG4gICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgICB0aGlzLndvcmtlciA9IG51bGxcbiAgICB0aGlzLnNjb3BlcyA9IFsnc291cmNlLmpzJywgJ3NvdXJjZS5qc3gnLCAnc291cmNlLmpzLmpzeCcsICdzb3VyY2UuYmFiZWwnLCAnc291cmNlLmpzLXNlbWFudGljJ11cblxuICAgIGNvbnN0IGVtYmVkZGVkU2NvcGUgPSAnc291cmNlLmpzLmVtYmVkZGVkLmh0bWwnXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZXNsaW50LmxpbnRIdG1sRmlsZXMnLCBsaW50SHRtbEZpbGVzID0+IHtcbiAgICAgIGlmIChsaW50SHRtbEZpbGVzKSB7XG4gICAgICAgIHRoaXMuc2NvcGVzLnB1c2goZW1iZWRkZWRTY29wZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLnNjb3Blcy5pbmRleE9mKGVtYmVkZGVkU2NvcGUpICE9PSAtMSkge1xuICAgICAgICAgIHRoaXMuc2NvcGVzLnNwbGljZSh0aGlzLnNjb3Blcy5pbmRleE9mKGVtYmVkZGVkU2NvcGUpLCAxKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICdsaW50ZXItZXNsaW50OmZpeC1maWxlJzogKCkgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcblxuICAgICAgICBpZiAoIXRleHRFZGl0b3IgfHwgdGV4dEVkaXRvci5pc01vZGlmaWVkKCkpIHtcbiAgICAgICAgICAvLyBBYm9ydCBmb3IgaW52YWxpZCBvciB1bnNhdmVkIHRleHQgZWRpdG9yc1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignTGludGVyLUVTTGludDogUGxlYXNlIHNhdmUgYmVmb3JlIGZpeGluZycpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndvcmtlci5yZXF1ZXN0KCdqb2InLCB7XG4gICAgICAgICAgdHlwZTogJ2ZpeCcsXG4gICAgICAgICAgY29uZmlnOiBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1lc2xpbnQnKSxcbiAgICAgICAgICBmaWxlUGF0aFxuICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT5cbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhyZXNwb25zZSlcbiAgICAgICAgKS5jYXRjaCgocmVzcG9uc2UpID0+XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcocmVzcG9uc2UpXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIGNvbnN0IGluaXRpYWxpemVXb3JrZXIgPSAoKSA9PiB7XG4gICAgICBjb25zdCB7IHdvcmtlciwgc3Vic2NyaXB0aW9uIH0gPSBzcGF3bldvcmtlcigpXG4gICAgICB0aGlzLndvcmtlciA9IHdvcmtlclxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChzdWJzY3JpcHRpb24pXG4gICAgICB3b3JrZXIub25EaWRFeGl0KCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICAgICAgc2hvd0Vycm9yKCdXb3JrZXIgZGllZCB1bmV4cGVjdGVkbHknLCAnQ2hlY2sgeW91ciBjb25zb2xlIGZvciBtb3JlICcgK1xuICAgICAgICAgICdpbmZvLiBBIG5ldyB3b3JrZXIgd2lsbCBiZSBzcGF3bmVkIGluc3RhbnRseS4nKVxuICAgICAgICAgIHNldFRpbWVvdXQoaW5pdGlhbGl6ZVdvcmtlciwgMTAwMClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gICAgaW5pdGlhbGl6ZVdvcmtlcigpXG4gIH0sXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfSxcbiAgcHJvdmlkZUxpbnRlcigpIHtcbiAgICBjb25zdCBIZWxwZXJzID0gcmVxdWlyZSgnYXRvbS1saW50ZXInKVxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnRVNMaW50JyxcbiAgICAgIGdyYW1tYXJTY29wZXM6IHRoaXMuc2NvcGVzLFxuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGxpbnRPbkZseTogdHJ1ZSxcbiAgICAgIGxpbnQ6IHRleHRFZGl0b3IgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGV4dEVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgaWYgKHRleHQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSlcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIGNvbnN0IHNob3dSdWxlID0gYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItZXNsaW50LnNob3dSdWxlSWRJbk1lc3NhZ2UnKVxuXG4gICAgICAgIHJldHVybiB0aGlzLndvcmtlci5yZXF1ZXN0KCdqb2InLCB7XG4gICAgICAgICAgY29udGVudHM6IHRleHQsXG4gICAgICAgICAgdHlwZTogJ2xpbnQnLFxuICAgICAgICAgIGNvbmZpZzogYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItZXNsaW50JyksXG4gICAgICAgICAgZmlsZVBhdGhcbiAgICAgICAgfSkudGhlbigocmVzcG9uc2UpID0+XG4gICAgICAgICAgcmVzcG9uc2UubWFwKCh7IG1lc3NhZ2UsIGxpbmUsIHNldmVyaXR5LCBydWxlSWQsIGNvbHVtbiwgZml4IH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRleHRCdWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgICAgICAgICBsZXQgbGludGVyRml4ID0gbnVsbFxuICAgICAgICAgICAgaWYgKGZpeCkge1xuICAgICAgICAgICAgICBjb25zdCBmaXhSYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgoZml4LnJhbmdlWzBdKSxcbiAgICAgICAgICAgICAgICB0ZXh0QnVmZmVyLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgoZml4LnJhbmdlWzFdKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIGxpbnRlckZpeCA9IHtcbiAgICAgICAgICAgICAgICByYW5nZTogZml4UmFuZ2UsXG4gICAgICAgICAgICAgICAgbmV3VGV4dDogZml4LnRleHRcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBIZWxwZXJzLnJhbmdlRnJvbUxpbmVOdW1iZXIodGV4dEVkaXRvciwgbGluZSAtIDEpXG4gICAgICAgICAgICBpZiAoY29sdW1uKSB7XG4gICAgICAgICAgICAgIHJhbmdlWzBdWzFdID0gY29sdW1uIC0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbHVtbiA+IHJhbmdlWzFdWzFdKSB7XG4gICAgICAgICAgICAgIHJhbmdlWzFdWzFdID0gY29sdW1uIC0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmV0ID0ge1xuICAgICAgICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgdHlwZTogc2V2ZXJpdHkgPT09IDEgPyAnV2FybmluZycgOiAnRXJyb3InLFxuICAgICAgICAgICAgICByYW5nZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNob3dSdWxlKSB7XG4gICAgICAgICAgICAgIHJldC5odG1sID0gJzxzcGFuIGNsYXNzPVwiYmFkZ2UgYmFkZ2UtZmxleGlibGVcIj4nICtcbiAgICAgICAgICAgICAgICBgJHtydWxlSWQgfHwgJ0ZhdGFsJ308L3NwYW4+JHtlc2NhcGVIVE1MKG1lc3NhZ2UpfWBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldC50ZXh0ID0gbWVzc2FnZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpbnRlckZpeCkge1xuICAgICAgICAgICAgICByZXQuZml4ID0gbGludGVyRml4XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmV0XG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19
//# sourceURL=/Users/mk2/.atom/packages/linter-eslint/src/main.js
