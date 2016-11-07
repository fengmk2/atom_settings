(function() {
  var Commands, CompositeDisposable,
    __modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

  CompositeDisposable = require('atom').CompositeDisposable;

  Commands = (function() {
    function Commands(linter) {
      this.linter = linter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'linter:next-error': (function(_this) {
          return function() {
            return _this.nextError();
          };
        })(this),
        'linter:previous-error': (function(_this) {
          return function() {
            return _this.previousError();
          };
        })(this),
        'linter:toggle': (function(_this) {
          return function() {
            return _this.toggleLinter();
          };
        })(this),
        'linter:togglePanel': (function(_this) {
          return function() {
            return _this.togglePanel();
          };
        })(this),
        'linter:set-bubble-transparent': (function(_this) {
          return function() {
            return _this.setBubbleTransparent();
          };
        })(this),
        'linter:expand-multiline-messages': (function(_this) {
          return function() {
            return _this.expandMultilineMessages();
          };
        })(this),
        'linter:lint': (function(_this) {
          return function() {
            return _this.lint();
          };
        })(this)
      }));
      this.index = null;
    }

    Commands.prototype.togglePanel = function() {
      return atom.config.set('linter.showErrorPanel', !atom.config.get('linter.showErrorPanel'));
    };

    Commands.prototype.toggleLinter = function() {
      var activeEditor, editorLinter;
      activeEditor = atom.workspace.getActiveTextEditor();
      if (!activeEditor) {
        return;
      }
      editorLinter = this.linter.getEditorLinter(activeEditor);
      if (editorLinter) {
        return editorLinter.destroy();
      } else {
        return this.linter.createEditorLinter(activeEditor);
      }
    };

    Commands.prototype.setBubbleTransparent = function() {
      var bubble;
      bubble = document.getElementById('linter-inline');
      if (bubble) {
        bubble.classList.add('transparent');
        document.addEventListener('keyup', this.setBubbleOpaque);
        return window.addEventListener('blur', this.setBubbleOpaque);
      }
    };

    Commands.prototype.setBubbleOpaque = function() {
      var bubble;
      bubble = document.getElementById('linter-inline');
      if (bubble) {
        bubble.classList.remove('transparent');
      }
      document.removeEventListener('keyup', this.setBubbleOpaque);
      return window.removeEventListener('blur', this.setBubbleOpaque);
    };

    Commands.prototype.expandMultilineMessages = function() {
      var elem, _i, _len, _ref;
      _ref = document.getElementsByTagName('linter-multiline-message');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elem = _ref[_i];
        elem.classList.add('expanded');
      }
      document.addEventListener('keyup', this.collapseMultilineMessages);
      return window.addEventListener('blur', this.collapseMultilineMessages);
    };

    Commands.prototype.collapseMultilineMessages = function() {
      var elem, _i, _len, _ref;
      _ref = document.getElementsByTagName('linter-multiline-message');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elem = _ref[_i];
        elem.classList.remove('expanded');
      }
      document.removeEventListener('keyup', this.collapseMultilineMessages);
      return window.removeEventListener('blur', this.collapseMultilineMessages);
    };

    Commands.prototype.lint = function() {
      var error, _ref;
      try {
        return (_ref = this.linter.getActiveEditorLinter()) != null ? _ref.lint(false) : void 0;
      } catch (_error) {
        error = _error;
        return atom.notifications.addError(error.message, {
          detail: error.stack,
          dismissable: true
        });
      }
    };

    Commands.prototype.getMessage = function(index) {
      var messages;
      messages = this.linter.views.messages;
      return messages[__modulo(index, messages.length)];
    };

    Commands.prototype.nextError = function() {
      var message;
      if (this.index != null) {
        this.index++;
      } else {
        this.index = 0;
      }
      message = this.getMessage(this.index);
      if (!(message != null ? message.filePath : void 0)) {
        return;
      }
      if (!(message != null ? message.range : void 0)) {
        return;
      }
      return atom.workspace.open(message.filePath).then(function() {
        return atom.workspace.getActiveTextEditor().setCursorBufferPosition(message.range.start);
      });
    };

    Commands.prototype.previousError = function() {
      var message;
      if (this.index != null) {
        this.index--;
      } else {
        this.index = 0;
      }
      message = this.getMessage(this.index);
      if (!(message != null ? message.filePath : void 0)) {
        return;
      }
      if (!(message != null ? message.range : void 0)) {
        return;
      }
      return atom.workspace.open(message.filePath).then(function() {
        return atom.workspace.getActiveTextEditor().setCursorBufferPosition(message.range.start);
      });
    };

    Commands.prototype.dispose = function() {
      this.messages = null;
      return this.subscriptions.dispose();
    };

    return Commands;

  })();

  module.exports = Commands;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2NvbW1hbmRzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2QkFBQTtJQUFBLDZEQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFTTtBQUNTLElBQUEsa0JBQUUsTUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDakI7QUFBQSxRQUFBLG1CQUFBLEVBQXFCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxTQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCO0FBQUEsUUFDQSx1QkFBQSxFQUF5QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsYUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUR6QjtBQUFBLFFBRUEsZUFBQSxFQUFpQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsWUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZqQjtBQUFBLFFBR0Esb0JBQUEsRUFBc0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7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

//# sourceURL=/Users/mk2/.atom/packages/linter/lib/commands.coffee
