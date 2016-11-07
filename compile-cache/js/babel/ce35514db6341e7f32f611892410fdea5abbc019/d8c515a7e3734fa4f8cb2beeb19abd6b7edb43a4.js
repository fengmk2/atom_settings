function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

'use babel';

module.exports = {
  config: {
    executablePath: {
      type: 'string',
      'default': _path2['default'].join(__dirname, '..', 'node_modules', 'jshint', 'bin', 'jshint'),
      description: 'Path of the `jshint` node script'
    },
    lintInlineJavaScript: {
      type: 'boolean',
      'default': false,
      description: 'Lint JavaScript inside `<script>` blocks in HTML or PHP files.'
    },
    disableWhenNoJshintrcFileInPath: {
      type: 'boolean',
      'default': false,
      description: 'Disable linter when no `.jshintrc` is found in project.'
    },
    lintJSXFiles: {
      title: 'Lint JSX Files',
      type: 'boolean',
      'default': false
    }
  },

  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install('linter-jshint');
    this.scopes = ['source.js', 'source.js-semantic'];
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-jshint.executablePath', function (executablePath) {
      _this.executablePath = executablePath;
    }));
    this.subscriptions.add(atom.config.observe('linter-jshint.disableWhenNoJshintrcFileInPath', function (disableWhenNoJshintrcFileInPath) {
      _this.disableWhenNoJshintrcFileInPath = disableWhenNoJshintrcFileInPath;
    }));

    var scopeJSX = 'source.js.jsx';
    this.subscriptions.add(atom.config.observe('linter-jshint.lintJSXFiles', function (lintJSXFiles) {
      _this.lintJSXFiles = lintJSXFiles;
      if (lintJSXFiles) {
        _this.scopes.push(scopeJSX);
      } else {
        if (_this.scopes.indexOf(scopeJSX) !== -1) {
          _this.scopes.splice(_this.scopes.indexOf(scopeJSX), 1);
        }
      }
    }));

    var scopeEmbedded = 'source.js.embedded.html';
    this.subscriptions.add(atom.config.observe('linter-jshint.lintInlineJavaScript', function (lintInlineJavaScript) {
      _this.lintInlineJavaScript = lintInlineJavaScript;
      if (lintInlineJavaScript) {
        _this.scopes.push(scopeEmbedded);
      } else {
        if (_this.scopes.indexOf(scopeEmbedded) !== -1) {
          _this.scopes.splice(_this.scopes.indexOf(scopeEmbedded), 1);
        }
      }
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    var Helpers = require('atom-linter');
    var Reporter = require('jshint-json');

    return {
      name: 'JSHint',
      grammarScopes: this.scopes,
      scope: 'file',
      lintOnFly: true,
      lint: _asyncToGenerator(function* (textEditor) {
        var results = [];
        var filePath = textEditor.getPath();
        var fileContents = textEditor.getText();
        var parameters = ['--reporter', Reporter, '--filename', filePath];

        var configFile = null;
        if (_this2.disableWhenNoJshintrcFileInPath) {
          configFile = yield Helpers.findCachedAsync(_path2['default'].dirname(filePath), '.jshintrc');
          if (configFile) {
            parameters.push('--config', configFile);
          } else {
            return results;
          }
        }
        if (_this2.lintInlineJavaScript && textEditor.getGrammar().scopeName.indexOf('text.html') !== -1) {
          parameters.push('--extract', 'always');
        }
        parameters.push('-');

        var result = yield Helpers.execNode(_this2.executablePath, parameters, { stdin: fileContents });
        var parsed = undefined;
        try {
          parsed = JSON.parse(result);
        } catch (_) {
          console.error('[Linter-JSHint]', _, result);
          atom.notifications.addWarning('[Linter-JSHint]', { detail: 'JSHint return an invalid response, check your console for more info' });
          return results;
        }

        for (var entry of parsed.result) {
          if (!entry.error.id) {
            continue;
          }

          var error = entry.error;
          var errorType = error.code.substr(0, 1);
          var errorLine = error.line > 0 ? error.line - 1 : 0;
          var range = undefined;

          // TODO: Remove workaround of jshint/jshint#2846
          if (error.character === null) {
            range = Helpers.rangeFromLineNumber(textEditor, errorLine);
          } else {
            var character = error.character > 0 ? error.character - 1 : 0;
            // TODO: Remove workaround of jquery/esprima#1457
            var maxCharacter = textEditor.getBuffer().lineLengthForRow(errorLine);
            if (character > maxCharacter) {
              character = maxCharacter;
            }
            range = Helpers.rangeFromLineNumber(textEditor, errorLine, character);
          }

          results.push({
            type: errorType === 'E' ? 'Error' : errorType === 'W' ? 'Warning' : 'Info',
            text: error.code + ' - ' + error.reason,
            filePath: filePath,
            range: range
          });
        }
        return results;
      })
    };
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvbGludGVyLWpzaGludC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUlpQixNQUFNOzs7O29CQUNhLE1BQU07O0FBTDFDLFdBQVcsQ0FBQTs7QUFTWCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsUUFBTSxFQUFFO0FBQ04sa0JBQWMsRUFBRTtBQUNkLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO0FBQzlFLGlCQUFXLEVBQUUsa0NBQWtDO0tBQ2hEO0FBQ0Qsd0JBQW9CLEVBQUU7QUFDcEIsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0FBQ2QsaUJBQVcsRUFBRSxnRUFBZ0U7S0FDOUU7QUFDRCxtQ0FBK0IsRUFBRTtBQUMvQixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7QUFDZCxpQkFBVyxFQUFFLHlEQUF5RDtLQUN2RTtBQUNELGdCQUFZLEVBQUU7QUFDWixXQUFLLEVBQUUsZ0JBQWdCO0FBQ3ZCLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztLQUNmO0dBQ0Y7O0FBRUQsVUFBUSxFQUFBLG9CQUFHOzs7QUFDVCxXQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDckQsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsQ0FBQyxDQUFBO0FBQ2pELFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsOEJBQThCLEVBQUUsVUFBQSxjQUFjLEVBQUk7QUFDM0YsWUFBSyxjQUFjLEdBQUcsY0FBYyxDQUFBO0tBQ3JD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QUMsQ0FBQTtBQUNyRCxjQUFJLEtBQUssWUFBQSxDQUFBOzs7QUFHVCxjQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO0FBQzVCLGlCQUFLLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQTtXQUMzRCxNQUFNO0FBQ0wsZ0JBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFN0QsZ0JBQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUN2RSxnQkFBSSxTQUFTLEdBQUcsWUFBWSxFQUFFO0FBQzVCLHVCQUFTLEdBQUcsWUFBWSxDQUFBO2FBQ3pCO0FBQ0QsaUJBQUssR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQTtXQUN0RTs7QUFFRCxpQkFBTyxDQUFDLElBQUksQ0FBQztBQUNYLGdCQUFJLEVBQUUsU0FBUyxLQUFLLEdBQUcsR0FBRyxPQUFPLEdBQUcsU0FBUyxLQUFLLEdBQUcsR0FBRyxTQUFTLEdBQUcsTUFBTTtBQUMxRSxnQkFBSSxFQUFLLEtBQUssQ0FBQyxJQUFJLFdBQU0sS0FBSyxDQUFDLE1BQU0sQUFBRTtBQUN2QyxvQkFBUSxFQUFSLFFBQVE7QUFDUixpQkFBSyxFQUFMLEtBQUs7V0FDTixDQUFDLENBQUE7U0FDSDtBQUNELGVBQU8sT0FBTyxDQUFBO09BQ2YsQ0FBQTtLQUNGLENBQUE7R0FDRjtDQUNGLENBQUEiLCJmaWxlIjoiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXItanNoaW50L2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuLyogQGZsb3cgKi9cblxuaW1wb3J0IFBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG50eXBlIExpbnRlciRQcm92aWRlciA9IE9iamVjdFxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29uZmlnOiB7XG4gICAgZXhlY3V0YWJsZVBhdGg6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogUGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ25vZGVfbW9kdWxlcycsICdqc2hpbnQnLCAnYmluJywgJ2pzaGludCcpLFxuICAgICAgZGVzY3JpcHRpb246ICdQYXRoIG9mIHRoZSBganNoaW50YCBub2RlIHNjcmlwdCdcbiAgICB9LFxuICAgIGxpbnRJbmxpbmVKYXZhU2NyaXB0OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTGludCBKYXZhU2NyaXB0IGluc2lkZSBgPHNjcmlwdD5gIGJsb2NrcyBpbiBIVE1MIG9yIFBIUCBmaWxlcy4nXG4gICAgfSxcbiAgICBkaXNhYmxlV2hlbk5vSnNoaW50cmNGaWxlSW5QYXRoOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRGlzYWJsZSBsaW50ZXIgd2hlbiBubyBgLmpzaGludHJjYCBpcyBmb3VuZCBpbiBwcm9qZWN0LidcbiAgICB9LFxuICAgIGxpbnRKU1hGaWxlczoge1xuICAgICAgdGl0bGU6ICdMaW50IEpTWCBGaWxlcycsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH1cbiAgfSxcblxuICBhY3RpdmF0ZSgpIHtcbiAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ2xpbnRlci1qc2hpbnQnKVxuICAgIHRoaXMuc2NvcGVzID0gWydzb3VyY2UuanMnLCAnc291cmNlLmpzLXNlbWFudGljJ11cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItanNoaW50LmV4ZWN1dGFibGVQYXRoJywgZXhlY3V0YWJsZVBhdGggPT4ge1xuICAgICAgdGhpcy5leGVjdXRhYmxlUGF0aCA9IGV4ZWN1dGFibGVQYXRoXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1qc2hpbnQuZGlzYWJsZVdoZW5Ob0pzaGludHJjRmlsZUluUGF0aCcsXG4gICAgICAgIGRpc2FibGVXaGVuTm9Kc2hpbnRyY0ZpbGVJblBhdGggPT4ge1xuICAgICAgICAgIHRoaXMuZGlzYWJsZVdoZW5Ob0pzaGludHJjRmlsZUluUGF0aCA9IGRpc2FibGVXaGVuTm9Kc2hpbnRyY0ZpbGVJblBhdGhcbiAgICAgICAgfVxuICAgICAgKVxuICAgIClcblxuICAgIGNvbnN0IHNjb3BlSlNYID0gJ3NvdXJjZS5qcy5qc3gnXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItanNoaW50LmxpbnRKU1hGaWxlcycsIGxpbnRKU1hGaWxlcyA9PiB7XG4gICAgICB0aGlzLmxpbnRKU1hGaWxlcyA9IGxpbnRKU1hGaWxlc1xuICAgICAgaWYgKGxpbnRKU1hGaWxlcykge1xuICAgICAgICB0aGlzLnNjb3Blcy5wdXNoKHNjb3BlSlNYKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuc2NvcGVzLmluZGV4T2Yoc2NvcGVKU1gpICE9PSAtMSkge1xuICAgICAgICAgIHRoaXMuc2NvcGVzLnNwbGljZSh0aGlzLnNjb3Blcy5pbmRleE9mKHNjb3BlSlNYKSwgMSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgY29uc3Qgc2NvcGVFbWJlZGRlZCA9ICdzb3VyY2UuanMuZW1iZWRkZWQuaHRtbCdcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1qc2hpbnQubGludElubGluZUphdmFTY3JpcHQnLFxuICAgICAgbGludElubGluZUphdmFTY3JpcHQgPT4ge1xuICAgICAgICB0aGlzLmxpbnRJbmxpbmVKYXZhU2NyaXB0ID0gbGludElubGluZUphdmFTY3JpcHRcbiAgICAgICAgaWYgKGxpbnRJbmxpbmVKYXZhU2NyaXB0KSB7XG4gICAgICAgICAgdGhpcy5zY29wZXMucHVzaChzY29wZUVtYmVkZGVkKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0aGlzLnNjb3Blcy5pbmRleE9mKHNjb3BlRW1iZWRkZWQpICE9PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5zY29wZXMuc3BsaWNlKHRoaXMuc2NvcGVzLmluZGV4T2Yoc2NvcGVFbWJlZGRlZCksIDEpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgKSlcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfSxcblxuICBwcm92aWRlTGludGVyKCk6IExpbnRlciRQcm92aWRlciB7XG4gICAgY29uc3QgSGVscGVycyA9IHJlcXVpcmUoJ2F0b20tbGludGVyJylcbiAgICBjb25zdCBSZXBvcnRlciA9IHJlcXVpcmUoJ2pzaGludC1qc29uJylcblxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnSlNIaW50JyxcbiAgICAgIGdyYW1tYXJTY29wZXM6IHRoaXMuc2NvcGVzLFxuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGxpbnRPbkZseTogdHJ1ZSxcbiAgICAgIGxpbnQ6IGFzeW5jICh0ZXh0RWRpdG9yKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIGNvbnN0IGZpbGVDb250ZW50cyA9IHRleHRFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBbJy0tcmVwb3J0ZXInLCBSZXBvcnRlciwgJy0tZmlsZW5hbWUnLCBmaWxlUGF0aF1cblxuICAgICAgICBsZXQgY29uZmlnRmlsZSA9IG51bGxcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZVdoZW5Ob0pzaGludHJjRmlsZUluUGF0aCkge1xuICAgICAgICAgIGNvbmZpZ0ZpbGUgPSBhd2FpdCBIZWxwZXJzLmZpbmRDYWNoZWRBc3luYyhQYXRoLmRpcm5hbWUoZmlsZVBhdGgpLCAnLmpzaGludHJjJylcbiAgICAgICAgICBpZiAoY29uZmlnRmlsZSkge1xuICAgICAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctLWNvbmZpZycsIGNvbmZpZ0ZpbGUpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxpbnRJbmxpbmVKYXZhU2NyaXB0ICYmXG4gICAgICAgICAgdGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLmluZGV4T2YoJ3RleHQuaHRtbCcpICE9PSAtMVxuICAgICAgICApIHtcbiAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tZXh0cmFjdCcsICdhbHdheXMnKVxuICAgICAgICB9XG4gICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLScpXG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgSGVscGVycy5leGVjTm9kZShcbiAgICAgICAgICB0aGlzLmV4ZWN1dGFibGVQYXRoLCBwYXJhbWV0ZXJzLCB7IHN0ZGluOiBmaWxlQ29udGVudHMgfVxuICAgICAgICApXG4gICAgICAgIGxldCBwYXJzZWRcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwYXJzZWQgPSBKU09OLnBhcnNlKHJlc3VsdClcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tMaW50ZXItSlNIaW50XScsIF8sIHJlc3VsdClcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnW0xpbnRlci1KU0hpbnRdJyxcbiAgICAgICAgICAgIHsgZGV0YWlsOiAnSlNIaW50IHJldHVybiBhbiBpbnZhbGlkIHJlc3BvbnNlLCBjaGVjayB5b3VyIGNvbnNvbGUgZm9yIG1vcmUgaW5mbycgfVxuICAgICAgICAgIClcbiAgICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBwYXJzZWQucmVzdWx0KSB7XG4gICAgICAgICAgaWYgKCFlbnRyeS5lcnJvci5pZCkge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBlcnJvciA9IGVudHJ5LmVycm9yXG4gICAgICAgICAgY29uc3QgZXJyb3JUeXBlID0gZXJyb3IuY29kZS5zdWJzdHIoMCwgMSlcbiAgICAgICAgICBjb25zdCBlcnJvckxpbmUgPSBlcnJvci5saW5lID4gMCA/IGVycm9yLmxpbmUgLSAxIDogMFxuICAgICAgICAgIGxldCByYW5nZVxuXG4gICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIHdvcmthcm91bmQgb2YganNoaW50L2pzaGludCMyODQ2XG4gICAgICAgICAgaWYgKGVycm9yLmNoYXJhY3RlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmFuZ2UgPSBIZWxwZXJzLnJhbmdlRnJvbUxpbmVOdW1iZXIodGV4dEVkaXRvciwgZXJyb3JMaW5lKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgY2hhcmFjdGVyID0gZXJyb3IuY2hhcmFjdGVyID4gMCA/IGVycm9yLmNoYXJhY3RlciAtIDEgOiAwXG4gICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgd29ya2Fyb3VuZCBvZiBqcXVlcnkvZXNwcmltYSMxNDU3XG4gICAgICAgICAgICBjb25zdCBtYXhDaGFyYWN0ZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpLmxpbmVMZW5ndGhGb3JSb3coZXJyb3JMaW5lKVxuICAgICAgICAgICAgaWYgKGNoYXJhY3RlciA+IG1heENoYXJhY3Rlcikge1xuICAgICAgICAgICAgICBjaGFyYWN0ZXIgPSBtYXhDaGFyYWN0ZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJhbmdlID0gSGVscGVycy5yYW5nZUZyb21MaW5lTnVtYmVyKHRleHRFZGl0b3IsIGVycm9yTGluZSwgY2hhcmFjdGVyKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiBlcnJvclR5cGUgPT09ICdFJyA/ICdFcnJvcicgOiBlcnJvclR5cGUgPT09ICdXJyA/ICdXYXJuaW5nJyA6ICdJbmZvJyxcbiAgICAgICAgICAgIHRleHQ6IGAke2Vycm9yLmNvZGV9IC0gJHtlcnJvci5yZWFzb259YCxcbiAgICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICAgICAgcmFuZ2VcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=
//# sourceURL=/Users/mk2/.atom/packages/linter-jshint/lib/main.js
