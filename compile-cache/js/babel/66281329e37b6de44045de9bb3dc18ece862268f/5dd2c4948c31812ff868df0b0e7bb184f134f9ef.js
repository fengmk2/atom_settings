Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

var _atomLinter = require('atom-linter');

var helper = _interopRequireWildcard(_atomLinter);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

'use babel';

exports['default'] = {
  config: {
    customTags: {
      type: 'array',
      'default': [],
      items: {
        type: 'string'
      },
      description: 'List of YAML custom tags.'
    }
  },

  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install('linter-js-yaml');
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-js-yaml.customTags', function (customTags) {
      _this.Schema = _jsYaml2['default'].Schema.create(customTags.map(function (tag) {
        return new _jsYaml2['default'].Type(tag, { kind: 'scalar' });
      }));
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      grammarScopes: ['source.yaml', 'source.yml'],
      scope: 'file',
      name: 'Js-YAML',
      lintOnFly: true,
      lint: function lint(TextEditor) {
        var filePath = TextEditor.getPath();
        var fileText = TextEditor.getText();

        var messages = [];
        var processMessage = function processMessage(type, message) {
          var line = message.mark.line;
          // Workaround for https://github.com/nodeca/js-yaml/issues/218
          var maxLine = TextEditor.getLineCount() - 1;
          if (line > maxLine) {
            line = maxLine;
          }
          var column = message.mark.column;
          return {
            type: type,
            text: message.reason,
            filePath: filePath,
            range: helper.rangeFromLineNumber(TextEditor, line, column)
          };
        };

        try {
          _jsYaml2['default'].safeLoadAll(fileText, function () {}, {
            filename: _path2['default'].basename(filePath),
            schema: _this2.Schema,
            onWarning: function onWarning(warning) {
              messages.push(processMessage('Warning', warning));
            }
          });
        } catch (error) {
          messages.push(processMessage('Error', error));
        }

        return messages;
      }
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvbGludGVyLWpzLXlhbWwvbGliL2xpbnRlci1qcy15YW1sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUVpQixNQUFNOzs7O29CQUNhLE1BQU07OzBCQUNsQixhQUFhOztJQUF6QixNQUFNOztzQkFDRCxTQUFTOzs7O0FBTDFCLFdBQVcsQ0FBQzs7cUJBT0c7QUFDYixRQUFNLEVBQUU7QUFDTixjQUFVLEVBQUU7QUFDVixVQUFJLEVBQUUsT0FBTztBQUNiLGlCQUFTLEVBQUU7QUFDWCxXQUFLLEVBQUU7QUFDTCxZQUFJLEVBQUUsUUFBUTtPQUNmO0FBQ0QsaUJBQVcsRUFBRSwyQkFBMkI7S0FDekM7R0FDRjs7QUFFRCxVQUFRLEVBQUEsb0JBQUc7OztBQUNULFdBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3ZELFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7QUFDL0MsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsMkJBQTJCLEVBQUUsVUFBQSxVQUFVLEVBQUk7QUFDcEYsWUFBSyxNQUFNLEdBQUcsb0JBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQ3JELGVBQU8sSUFBSSxvQkFBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7T0FDL0MsQ0FBQyxDQUFDLENBQUM7S0FDTCxDQUFDLENBQUMsQ0FBQztHQUNMOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDOUI7O0FBRUQsZUFBYSxFQUFBLHlCQUFHOzs7QUFDZCxXQUFPO0FBQ0wsbUJBQWEsRUFBRSxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUM7QUFDNUMsV0FBSyxFQUFFLE1BQU07QUFDYixVQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsRUFBRSxJQUFJO0FBQ2YsVUFBSSxFQUFFLGNBQUMsVUFBVSxFQUFLO0FBQ3BCLFlBQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN0QyxZQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRXRDLFlBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNwQixZQUFNLGNBQWMsR0FBRyxTQUFqQixjQUFjLENBQUksSUFBSSxFQUFFLE9BQU8sRUFBSztBQUN4QyxjQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7QUFFN0IsY0FBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM5QyxjQUFJLElBQUksR0FBRyxPQUFPLEVBQUU7QUFDbEIsZ0JBQUksR0FBRyxPQUFPLENBQUM7V0FDaEI7QUFDRCxjQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUNuQyxpQkFBTztBQUNMLGdCQUFJLEVBQUUsSUFBSTtBQUNWLGdCQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU07QUFDcEIsb0JBQVEsRUFBRSxRQUFRO0FBQ2xCLGlCQUFLLEVBQUUsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDO1dBQzVELENBQUM7U0FDSCxDQUFDOztBQUVGLFlBQUk7QUFDRiw4QkFBSyxXQUFXLENBQUMsUUFBUSxFQUFFLFlBQU0sRUFBRSxFQUFFO0FBQ25DLG9CQUFRLEVBQUUsa0JBQUssUUFBUSxDQUFDLFFBQVEsQ0FBQztBQUNqQyxrQkFBTSxFQUFFLE9BQUssTUFBTTtBQUNuQixxQkFBUyxFQUFFLG1CQUFBLE9BQU8sRUFBSTtBQUNwQixzQkFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDbkQ7V0FDRixDQUFDLENBQUM7U0FDSixDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2Qsa0JBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQy9DOztBQUVELGVBQU8sUUFBUSxDQUFDO09BQ2pCO0tBQ0YsQ0FBQztHQUNIO0NBQ0YiLCJmaWxlIjoiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXItanMteWFtbC9saWIvbGludGVyLWpzLXlhbWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgKiBhcyBoZWxwZXIgZnJvbSAnYXRvbS1saW50ZXInO1xuaW1wb3J0IHlhbWwgZnJvbSAnanMteWFtbCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY29uZmlnOiB7XG4gICAgY3VzdG9tVGFnczoge1xuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGRlZmF1bHQ6IFtdLFxuICAgICAgaXRlbXM6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICB9LFxuICAgICAgZGVzY3JpcHRpb246ICdMaXN0IG9mIFlBTUwgY3VzdG9tIHRhZ3MuJyxcbiAgICB9LFxuICB9LFxuXG4gIGFjdGl2YXRlKCkge1xuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyLWpzLXlhbWwnKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWpzLXlhbWwuY3VzdG9tVGFncycsIGN1c3RvbVRhZ3MgPT4ge1xuICAgICAgdGhpcy5TY2hlbWEgPSB5YW1sLlNjaGVtYS5jcmVhdGUoY3VzdG9tVGFncy5tYXAodGFnID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyB5YW1sLlR5cGUodGFnLCB7IGtpbmQ6ICdzY2FsYXInIH0pO1xuICAgICAgfSkpO1xuICAgIH0pKTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH0sXG5cbiAgcHJvdmlkZUxpbnRlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UueWFtbCcsICdzb3VyY2UueW1sJ10sXG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgbmFtZTogJ0pzLVlBTUwnLFxuICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgbGludDogKFRleHRFZGl0b3IpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBUZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICAgICAgY29uc3QgZmlsZVRleHQgPSBUZXh0RWRpdG9yLmdldFRleHQoKTtcblxuICAgICAgICBjb25zdCBtZXNzYWdlcyA9IFtdO1xuICAgICAgICBjb25zdCBwcm9jZXNzTWVzc2FnZSA9ICh0eXBlLCBtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgbGV0IGxpbmUgPSBtZXNzYWdlLm1hcmsubGluZTtcbiAgICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwvaXNzdWVzLzIxOFxuICAgICAgICAgIGNvbnN0IG1heExpbmUgPSBUZXh0RWRpdG9yLmdldExpbmVDb3VudCgpIC0gMTtcbiAgICAgICAgICBpZiAobGluZSA+IG1heExpbmUpIHtcbiAgICAgICAgICAgIGxpbmUgPSBtYXhMaW5lO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBjb2x1bW4gPSBtZXNzYWdlLm1hcmsuY29sdW1uO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgdGV4dDogbWVzc2FnZS5yZWFzb24sXG4gICAgICAgICAgICBmaWxlUGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgICByYW5nZTogaGVscGVyLnJhbmdlRnJvbUxpbmVOdW1iZXIoVGV4dEVkaXRvciwgbGluZSwgY29sdW1uKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgeWFtbC5zYWZlTG9hZEFsbChmaWxlVGV4dCwgKCkgPT4ge30sIHtcbiAgICAgICAgICAgIGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKSxcbiAgICAgICAgICAgIHNjaGVtYTogdGhpcy5TY2hlbWEsXG4gICAgICAgICAgICBvbldhcm5pbmc6IHdhcm5pbmcgPT4ge1xuICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKHByb2Nlc3NNZXNzYWdlKCdXYXJuaW5nJywgd2FybmluZykpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBtZXNzYWdlcy5wdXNoKHByb2Nlc3NNZXNzYWdlKCdFcnJvcicsIGVycm9yKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWVzc2FnZXM7XG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59O1xuIl19
//# sourceURL=/Users/mk2/.atom/packages/linter-js-yaml/lib/linter-js-yaml.js
