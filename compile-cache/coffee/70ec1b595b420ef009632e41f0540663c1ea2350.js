(function() {
  var path;

  path = require('path');

  module.exports = {
    provideLinter: function() {
      var provider, yaml;
      yaml = require('js-yaml');
      return provider = {
        grammarScopes: ['source.yaml', 'source.yml'],
        scope: 'file',
        lintOnFly: true,
        processMessage: function(type, path, message) {
          var point;
          point = [message.mark.line, message.mark.column];
          return {
            type: type,
            text: message.reason,
            filePath: path,
            range: [point, point]
          };
        },
        lint: function(textEditor) {
          return new Promise(function(resolve) {
            var error, messages;
            messages = [];
            try {
              yaml.safeLoad(textEditor.getText(), {
                onWarning: function(warning) {
                  return messages.push(provider.processMessage('Warning', textEditor.getPath(), warning));
                }
              });
            } catch (_error) {
              error = _error;
              messages.push(provider.processMessage('Error', textEditor.getPath(), error));
            }
            return resolve(messages);
          });
        }
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXItanMteWFtbC9saWIvbGludGVyLWpzLXlhbWwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsYUFBQSxFQUFlLFNBQUEsR0FBQTtBQUNiLFVBQUEsY0FBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSLENBQVAsQ0FBQTthQUNBLFFBQUEsR0FDRTtBQUFBLFFBQUEsYUFBQSxFQUFlLENBQUMsYUFBRCxFQUFnQixZQUFoQixDQUFmO0FBQUEsUUFDQSxLQUFBLEVBQU8sTUFEUDtBQUFBLFFBRUEsU0FBQSxFQUFXLElBRlg7QUFBQSxRQUdBLGNBQUEsRUFBZ0IsU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLE9BQWIsR0FBQTtBQUNkLGNBQUEsS0FBQTtBQUFBLFVBQUEsS0FBQSxHQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFkLEVBQW9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBakMsQ0FBUixDQUFBO2lCQUNBO0FBQUEsWUFDRSxJQUFBLEVBQU0sSUFEUjtBQUFBLFlBRUUsSUFBQSxFQUFNLE9BQU8sQ0FBQyxNQUZoQjtBQUFBLFlBR0UsUUFBQSxFQUFVLElBSFo7QUFBQSxZQUlFLEtBQUEsRUFBTyxDQUFDLEtBQUQsRUFBUSxLQUFSLENBSlQ7WUFGYztRQUFBLENBSGhCO0FBQUEsUUFXQSxJQUFBLEVBQU0sU0FBQyxVQUFELEdBQUE7QUFDSixpQkFBVyxJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsR0FBQTtBQUNqQixnQkFBQSxlQUFBO0FBQUEsWUFBQSxRQUFBLEdBQVcsRUFBWCxDQUFBO0FBQ0E7QUFDRSxjQUFBLElBQUksQ0FBQyxRQUFMLENBQWMsVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQUFkLEVBQW9DO0FBQUEsZ0JBQUEsU0FBQSxFQUFXLFNBQUMsT0FBRCxHQUFBO3lCQUM3QyxRQUFRLENBQUMsSUFBVCxDQUFjLFFBQVEsQ0FBQyxjQUFULENBQXdCLFNBQXhCLEVBQW1DLFVBQVUsQ0FBQyxPQUFYLENBQUEsQ0FBbkMsRUFBeUQsT0FBekQsQ0FBZCxFQUQ2QztnQkFBQSxDQUFYO2VBQXBDLENBQUEsQ0FERjthQUFBLGNBQUE7QUFJRSxjQURJLGNBQ0osQ0FBQTtBQUFBLGNBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxRQUFRLENBQUMsY0FBVCxDQUF3QixPQUF4QixFQUFpQyxVQUFVLENBQUMsT0FBWCxDQUFBLENBQWpDLEVBQXVELEtBQXZELENBQWQsQ0FBQSxDQUpGO2FBREE7bUJBTUEsT0FBQSxDQUFRLFFBQVIsRUFQaUI7VUFBQSxDQUFSLENBQVgsQ0FESTtRQUFBLENBWE47UUFIVztJQUFBLENBQWY7R0FIRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/mk2/.atom/packages/linter-js-yaml/lib/linter-js-yaml.coffee
