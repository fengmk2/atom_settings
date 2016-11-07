(function() {
  var CompositeDisposable, path,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    config: {
      executablePath: {
        "default": path.join(__dirname, '..', 'node_modules', 'htmlhint', 'bin', 'htmlhint'),
        type: 'string',
        description: 'HTMLHint Executable Path'
      }
    },
    activate: function() {
      console.log('activate linter-htmlhint');
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.observe('linter-htmlhint.executablePath', (function(_this) {
        return function(executablePath) {
          return _this.executablePath = executablePath;
        };
      })(this)));
      return this.scopes = ['text.html.angular', 'text.html.basic', 'text.html.erb', 'text.html.gohtml', 'text.html.jsp', 'text.html.mustache', 'text.html.php', 'text.html.ruby'];
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    provideLinter: function() {
      var helpers, provider;
      helpers = require('atom-linter');
      return provider = {
        grammarScopes: this.scopes,
        scope: 'file',
        lintOnFly: true,
        lint: function(textEditor) {
          var filePath, htmlhintrc, parameters, text;
          filePath = textEditor.getPath();
          htmlhintrc = helpers.findFile(filePath, '.htmlhintrc');
          text = textEditor.getText();
          parameters = [filePath];
          if (htmlhintrc && __indexOf.call(parameters, '-c') < 0) {
            parameters = parameters.concat(['-c', htmlhintrc]);
          }
          return helpers.execNode(atom.config.get('linter-htmlhint.executablePath'), parameters, {}).then(function(output) {
            var parsed;
            parsed = helpers.parse(output, 'line (?<line>[0-9]+), col (?<col>[0-9]+): (?<message>.+)');
            parsed.map(function(match) {
              if (match.text.slice(1, 5) === "[33m") {
                match.type = 'warning';
              } else if (match.text.slice(1, 5) === "[31m") {
                match.type = 'error';
              } else {
                match.type = 'info';
              }
              match.text = match.text.slice(5, -5);
              match.filePath = filePath;
              return match;
            });
            return parsed;
          });
        }
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXItaHRtbGhpbnQvbGliL2luaXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlCQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUZELENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGNBQUEsRUFDRTtBQUFBLFFBQUEsU0FBQSxFQUFTLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixJQUFyQixFQUEyQixjQUEzQixFQUEyQyxVQUEzQyxFQUF1RCxLQUF2RCxFQUE4RCxVQUE5RCxDQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLFFBRUEsV0FBQSxFQUFhLDBCQUZiO09BREY7S0FERjtBQUFBLElBS0EsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNOLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSwwQkFBWixDQUFBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFIakIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixnQ0FBcEIsRUFDakIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsY0FBRCxHQUFBO2lCQUNFLEtBQUMsQ0FBQSxjQUFELEdBQWtCLGVBRHBCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEaUIsQ0FBbkIsQ0FKQSxDQUFBO2FBT0EsSUFBQyxDQUFBLE1BQUQs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

//# sourceURL=/Users/mk2/.atom/packages/linter-htmlhint/lib/init.coffee
