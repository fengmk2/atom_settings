(function() {
  var helpers, path;

  helpers = null;

  path = null;

  module.exports = {
    activate: function() {
      return require('atom-package-deps').install('linter-csslint');
    },
    provideLinter: function() {
      var provider;
      return provider = {
        name: 'CSSLint',
        grammarScopes: ['source.css', 'source.html'],
        scope: 'file',
        lintOnFly: true,
        lint: function(textEditor) {
          var cwd, exec, filePath, parameters, paths, text;
          if (helpers == null) {
            helpers = require('atom-linter');
          }
          if (path == null) {
            path = require('path');
          }
          filePath = textEditor.getPath();
          text = textEditor.getText();
          if (text.length === 0) {
            return Promise.resolve([]);
          }
          parameters = ['--format=json', '-'];
          exec = path.join(__dirname, '..', 'node_modules', 'atomlinter-csslint', 'cli.js');
          paths = atom.project.relativizePath(filePath);
          cwd = paths[0];
          if (!cwd) {
            cwd = path.dirname(textEditor.getPath());
          }
          return helpers.execNode(exec, parameters, {
            stdin: text,
            cwd: cwd
          }).then(function(output) {
            var col, data, line, lintResult, msg, toReturn, _i, _len, _ref;
            lintResult = JSON.parse(output);
            toReturn = [];
            if (lintResult.messages.length < 1) {
              return toReturn;
            }
            _ref = lintResult.messages;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              data = _ref[_i];
              msg = {};
              if (!(data.line && data.col)) {
                msg.range = helpers.rangeFromLineNumber(textEditor, 0);
              } else {
                line = data.line - 1;
                col = data.col - 1;
                msg.range = [[line, col], [line, col]];
              }
              msg.type = data.type.charAt(0).toUpperCase() + data.type.slice(1);
              msg.text = data.message;
              msg.filePath = filePath;
              if (data.rule.id && data.rule.desc) {
                msg.trace = [
                  {
                    type: "Trace",
                    text: '[' + data.rule.id + '] ' + data.rule.desc
                  }
                ];
              }
              toReturn.push(msg);
            }
            return toReturn;
          });
        }
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXItY3NzbGludC9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsYUFBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sSUFEUCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLE9BQUEsQ0FBUSxtQkFBUixDQUE0QixDQUFDLE9BQTdCLENBQXFDLGdCQUFyQyxFQURRO0lBQUEsQ0FBVjtBQUFBLElBR0EsYUFBQSxFQUFlLFNBQUEsR0FBQTtBQUNiLFVBQUEsUUFBQTthQUFBLFFBQUEsR0FDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLGFBQUEsRUFBZSxDQUFDLFlBQUQsRUFBZSxhQUFmLENBRGY7QUFBQSxRQUVBLEtBQUEsRUFBTyxNQUZQO0FBQUEsUUFHQSxTQUFBLEVBQVcsSUFIWDtBQUFBLFFBSUEsSUFBQSxFQUFNLFNBQUMsVUFBRCxHQUFBO0FBQ0osY0FBQSw0Q0FBQTs7WUFBQSxVQUFXLE9BQUEsQ0FBUSxhQUFSO1dBQVg7O1lBQ0EsT0FBUSxPQUFBLENBQVEsTUFBUjtXQURSO0FBQUEsVUFFQSxRQUFBLEdBQVcsVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQUZYLENBQUE7QUFBQSxVQUdBLElBQUEsR0FBTyxVQUFVLENBQUMsT0FBWCxDQUFBLENBSFAsQ0FBQTtBQUlBLFVBQUEsSUFBOEIsSUFBSSxDQUFDLE1BQUwsS0FBZSxDQUE3QztBQUFBLG1CQUFPLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEVBQWhCLENBQVAsQ0FBQTtXQUpBO0FBQUEsVUFLQSxVQUFBLEdBQWEsQ0FBQyxlQUFELEVBQWtCLEdB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

//# sourceURL=/Users/mk2/.atom/packages/linter-csslint/lib/main.coffee
