(function() {
  var CompositeDisposable, path,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CompositeDisposable = require('atom').CompositeDisposable;

  path = require('path');

  module.exports = {
    config: {
      executablePath: {
        type: 'string',
        "default": path.join(__dirname, '..', 'node_modules', 'jshint', 'bin', 'jshint'),
        description: 'Path of the `jshint` executable.'
      },
      lintInlineJavaScript: {
        type: 'boolean',
        "default": false,
        description: 'Lint JavaScript inside `<script>` blocks in HTML or PHP files.'
      },
      disableWhenNoJshintrcFileInPath: {
        type: 'boolean',
        "default": false,
        description: 'Disable linter when no `.jshintrc` is found in project.'
      }
    },
    activate: function() {
      var scopeEmbedded;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('linter-jshint.executablePath', (function(_this) {
        return function(executablePath) {
          return _this.executablePath = executablePath;
        };
      })(this)));
      scopeEmbedded = 'source.js.embedded.html';
      this.scopes = ['source.js', 'source.js.jsx', 'source.js-semantic'];
      this.subscriptions.add(atom.config.observe('linter-jshint.lintInlineJavaScript', (function(_this) {
        return function(lintInlineJavaScript) {
          if (lintInlineJavaScript) {
            if (__indexOf.call(_this.scopes, scopeEmbedded) < 0) {
              return _this.scopes.push(scopeEmbedded);
            }
          } else {
            if (__indexOf.call(_this.scopes, scopeEmbedded) >= 0) {
              return _this.scopes.splice(_this.scopes.indexOf(scopeEmbedded), 1);
            }
          }
        };
      })(this)));
      return this.subscriptions.add(atom.config.observe('linter-jshint.disableWhenNoJshintrcFileInPath', (function(_this) {
        return function(disableWhenNoJshintrcFileInPath) {
          return _this.disableWhenNoJshintrcFileInPath = disableWhenNoJshintrcFileInPath;
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    provideLinter: function() {
      var helpers, provider, reporter;
      helpers = require('atom-linter');
      reporter = require('jshint-json');
      return provider = {
        grammarScopes: this.scopes,
        scope: 'file',
        lintOnFly: true,
        lint: (function(_this) {
          return function(textEditor) {
            var filePath, parameters, text;
            filePath = textEditor.getPath();
            if (_this.disableWhenNoJshintrcFileInPath && !helpers.findFile(filePath, '.jshintrc')) {
              return [];
            }
            text = textEditor.getText();
            parameters = ['--reporter', reporter, '--filename', filePath];
            if (textEditor.getGrammar().scopeName.indexOf('text.html') !== -1 && __indexOf.call(_this.scopes, 'source.js.embedded.html') >= 0) {
              parameters.push('--extract', 'always');
            }
            parameters.push('-');
            return helpers.execNode(_this.executablePath, parameters, {
              stdin: text
            }).then(function(output) {
              if (!output.length) {
                return [];
              }
              output = JSON.parse(output).result;
              output = output.filter(function(entry) {
                return entry.error.id;
              });
              return output.map(function(entry) {
                var error, pointEnd, pointStart, type;
                error = entry.error;
                pointStart = [error.line - 1, error.character - 1];
                pointEnd = [error.line - 1, error.character];
                type = error.code.substr(0, 1);
                return {
                  type: type === 'E' ? 'Error' : type === 'W' ? 'Warning' : 'Info',
                  text: "" + error.code + " - " + error.reason,
                  filePath: filePath,
                  range: [pointStart, pointEnd]
                };
              });
            });
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXItanNoaW50L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5QkFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxjQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLElBQXJCLEVBQTJCLGNBQTNCLEVBQTJDLFFBQTNDLEVBQXFELEtBQXJELEVBQTRELFFBQTVELENBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxrQ0FGYjtPQURGO0FBQUEsTUFJQSxvQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxnRUFGYjtPQUxGO0FBQUEsTUFRQSwrQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx5REFGYjtPQVRGO0tBREY7QUFBQSxJQWNBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixVQUFBLGFBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FB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

//# sourceURL=/Users/mk2/.atom/packages/linter-jshint/lib/main.coffee
