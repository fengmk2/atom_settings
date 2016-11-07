Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.provideLinter = provideLinter;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _atomLinter = require('atom-linter');

'use babel';

var GRAMMAR_SCOPES = ['text.html.angular', 'text.html.basic', 'text.html.erb', 'text.html.gohtml', 'text.html.jsp', 'text.html.mustache', 'text.html.handlebars', 'text.html.ruby'];

var config = {
  executablePath: {
    title: 'Executable Path',
    description: 'HTMLHint Node Script Path',
    type: 'string',
    'default': path.join(__dirname, '..', 'node_modules', 'htmlhint', 'bin', 'htmlhint')
  }
};

exports.config = config;
var executablePath = '';

function activate() {
  require('atom-package-deps').install('linter-htmlhint');

  executablePath = atom.config.get('linter-htmlhint.executablePath');

  atom.config.observe('linter-htmlhint.executablePath', function (newValue) {
    executablePath = newValue;
  });
}

function provideLinter() {
  return {
    name: 'htmlhint',
    grammarScopes: GRAMMAR_SCOPES,
    scope: 'file',
    lintOnFly: false,
    lint: function lint(editor) {
      var text = editor.getText();
      var filePath = editor.getPath();

      if (!text) {
        return Promise.resolve([]);
      }

      var parameters = [filePath, '--format', 'json'];
      var htmlhintrc = (0, _atomLinter.find)(path.dirname(filePath), '.htmlhintrc');

      if (htmlhintrc) {
        parameters.push('-c');
        parameters.push(htmlhintrc);
      }

      return (0, _atomLinter.execNode)(executablePath, parameters, {}).then(function (output) {
        var results = JSON.parse(output);

        if (!results.length) {
          return [];
        }

        var messages = results[0].messages;

        return messages.map(function (message) {
          return {
            range: (0, _atomLinter.rangeFromLineNumber)(editor, message.line - 1, message.col - 1),
            type: message.type,
            text: message.message,
            filePath: filePath
          };
        });
      });
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvbGludGVyLWh0bWxoaW50L2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFFc0IsTUFBTTs7SUFBaEIsSUFBSTs7MEJBQ29DLGFBQWE7O0FBSGpFLFdBQVcsQ0FBQzs7QUFLWixJQUFNLGNBQWMsR0FBRyxDQUNyQixtQkFBbUIsRUFDbkIsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixrQkFBa0IsRUFDbEIsZUFBZSxFQUNmLG9CQUFvQixFQUNwQixzQkFBc0IsRUFDdEIsZ0JBQWdCLENBQ2pCLENBQUM7O0FBRUssSUFBTSxNQUFNLEdBQUc7QUFDcEIsZ0JBQWMsRUFBRTtBQUNkLFNBQUssRUFBRSxpQkFBaUI7QUFDeEIsZUFBVyxFQUFFLDJCQUEyQjtBQUN4QyxRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQztHQUNuRjtDQUNGLENBQUM7OztBQUVGLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQzs7QUFFakIsU0FBUyxRQUFRLEdBQUc7QUFDekIsU0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0FBRXhELGdCQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQzs7QUFFbkUsTUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0NBQWdDLEVBQUUsVUFBQSxRQUFRLEVBQUk7QUFDaEUsa0JBQWMsR0FBRyxRQUFRLENBQUM7R0FDM0IsQ0FBQyxDQUFDO0NBQ0o7O0FBRU0sU0FBUyxhQUFhLEdBQUc7QUFDOUIsU0FBTztBQUNMLFFBQUksRUFBRSxVQUFVO0FBQ2hCLGlCQUFhLEVBQUUsY0FBYztBQUM3QixTQUFLLEVBQUUsTUFBTTtBQUNiLGFBQVMsRUFBRSxLQUFLO0FBQ2hCLFFBQUksRUFBRSxjQUFBLE1BQU0sRUFBSTtBQUNkLFVBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixVQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRWxDLFVBQUksQ0FBQyxJQUFJLEVBQUU7QUFDVCxlQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7T0FDNUI7O0FBRUQsVUFBTSxVQUFVLEdBQUcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2xELFVBQU0sVUFBVSxHQUFHLHNCQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7O0FBRS9ELFVBQUksVUFBVSxFQUFFO0FBQ2Qsa0JBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEIsa0JBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDN0I7O0FBRUQsYUFBTywwQkFBUyxjQUFjLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUM3RCxZQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVuQyxZQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUNuQixpQkFBTyxFQUFFLENBQUM7U0FDWDs7QUFFRCxZQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDOztBQUVyQyxlQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxPQUFPO2lCQUFLO0FBQzlCLGlCQUFLLEVBQUUscUNBQW9CLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNyRSxnQkFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO0FBQ2xCLGdCQUFJLEVBQUUsT0FBTyxDQUFDLE9BQU87QUFDckIsb0JBQVEsRUFBUixRQUFRO1dBQ1Q7U0FBQyxDQUFDLENBQUM7T0FDTCxDQUFDLENBQUM7S0FDSjtHQUNGLENBQUM7Q0FDSCIsImZpbGUiOiIvVXNlcnMvbWsyLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1odG1saGludC9saWIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4ZWNOb2RlLCBmaW5kLCByYW5nZUZyb21MaW5lTnVtYmVyIH0gZnJvbSAnYXRvbS1saW50ZXInO1xuXG5jb25zdCBHUkFNTUFSX1NDT1BFUyA9IFtcbiAgJ3RleHQuaHRtbC5hbmd1bGFyJyxcbiAgJ3RleHQuaHRtbC5iYXNpYycsXG4gICd0ZXh0Lmh0bWwuZXJiJyxcbiAgJ3RleHQuaHRtbC5nb2h0bWwnLFxuICAndGV4dC5odG1sLmpzcCcsXG4gICd0ZXh0Lmh0bWwubXVzdGFjaGUnLFxuICAndGV4dC5odG1sLmhhbmRsZWJhcnMnLFxuICAndGV4dC5odG1sLnJ1YnknXG5dO1xuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBleGVjdXRhYmxlUGF0aDoge1xuICAgIHRpdGxlOiAnRXhlY3V0YWJsZSBQYXRoJyxcbiAgICBkZXNjcmlwdGlvbjogJ0hUTUxIaW50IE5vZGUgU2NyaXB0IFBhdGgnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdub2RlX21vZHVsZXMnLCAnaHRtbGhpbnQnLCAnYmluJywgJ2h0bWxoaW50JylcbiAgfVxufTtcblxubGV0IGV4ZWN1dGFibGVQYXRoID0gJyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcbiAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXItaHRtbGhpbnQnKTtcblxuICBleGVjdXRhYmxlUGF0aCA9IGF0b20uY29uZmlnLmdldCgnbGludGVyLWh0bWxoaW50LmV4ZWN1dGFibGVQYXRoJyk7XG5cbiAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWh0bWxoaW50LmV4ZWN1dGFibGVQYXRoJywgbmV3VmFsdWUgPT4ge1xuICAgIGV4ZWN1dGFibGVQYXRoID0gbmV3VmFsdWU7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUxpbnRlcigpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnaHRtbGhpbnQnLFxuICAgIGdyYW1tYXJTY29wZXM6IEdSQU1NQVJfU0NPUEVTLFxuICAgIHNjb3BlOiAnZmlsZScsXG4gICAgbGludE9uRmx5OiBmYWxzZSxcbiAgICBsaW50OiBlZGl0b3IgPT4ge1xuICAgICAgY29uc3QgdGV4dCA9IGVkaXRvci5nZXRUZXh0KCk7XG4gICAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG5cbiAgICAgIGlmICghdGV4dCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IFtmaWxlUGF0aCwgJy0tZm9ybWF0JywgJ2pzb24nXTtcbiAgICAgIGNvbnN0IGh0bWxoaW50cmMgPSBmaW5kKHBhdGguZGlybmFtZShmaWxlUGF0aCksICcuaHRtbGhpbnRyYycpO1xuXG4gICAgICBpZiAoaHRtbGhpbnRyYykge1xuICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy1jJyk7XG4gICAgICAgIHBhcmFtZXRlcnMucHVzaChodG1saGludHJjKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGV4ZWNOb2RlKGV4ZWN1dGFibGVQYXRoLCBwYXJhbWV0ZXJzLCB7fSkudGhlbihvdXRwdXQgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gSlNPTi5wYXJzZShvdXRwdXQpO1xuXG4gICAgICAgIGlmICghcmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtZXNzYWdlcyA9IHJlc3VsdHNbMF0ubWVzc2FnZXM7XG5cbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzLm1hcChtZXNzYWdlID0+ICh7XG4gICAgICAgICAgcmFuZ2U6IHJhbmdlRnJvbUxpbmVOdW1iZXIoZWRpdG9yLCBtZXNzYWdlLmxpbmUgLSAxLCBtZXNzYWdlLmNvbCAtIDEpLFxuICAgICAgICAgIHR5cGU6IG1lc3NhZ2UudHlwZSxcbiAgICAgICAgICB0ZXh0OiBtZXNzYWdlLm1lc3NhZ2UsXG4gICAgICAgICAgZmlsZVBhdGhcbiAgICAgICAgfSkpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuIl19
//# sourceURL=/Users/mk2/.atom/packages/linter-htmlhint/lib/index.js
