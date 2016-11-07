(function() {
  var CompositeDisposable, EditorLinter, Emitter, TextEditor, _ref;

  _ref = require('atom'), TextEditor = _ref.TextEditor, Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  EditorLinter = (function() {
    function EditorLinter(editor) {
      this.editor = editor;
      if (!(this.editor instanceof TextEditor)) {
        throw new Error("Given editor isn't really an editor");
      }
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.emitter);
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.emitter.emit('did-destroy');
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidSave((function(_this) {
        return function() {
          return _this.emitter.emit('should-lint', false);
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function(_arg) {
          var newBufferPosition, oldBufferPosition;
          oldBufferPosition = _arg.oldBufferPosition, newBufferPosition = _arg.newBufferPosition;
          if (newBufferPosition.row !== oldBufferPosition.row) {
            _this.emitter.emit('should-update-line-messages');
          }
          return _this.emitter.emit('should-update-bubble');
        };
      })(this)));
      setImmediate((function(_this) {
        return function() {
          return _this.subscriptions.add(_this.editor.onDidStopChanging(function() {
            return _this.lint(true);
          }));
        };
      })(this));
    }

    EditorLinter.prototype.lint = function(onChange) {
      if (onChange == null) {
        onChange = false;
      }
      return this.emitter.emit('should-lint', onChange);
    };

    EditorLinter.prototype.onShouldUpdateBubble = function(callback) {
      return this.emitter.on('should-update-bubble', callback);
    };

    EditorLinter.prototype.onShouldUpdateLineMessages = function(callback) {
      return this.emitter.on('should-update-line-messages', callback);
    };

    EditorLinter.prototype.onShouldLint = function(callback) {
      return this.emitter.on('should-lint', callback);
    };

    EditorLinter.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    EditorLinter.prototype.destroy = function() {
      this.emitter.emit('did-destroy');
      return this.dispose();
    };

    EditorLinter.prototype.dispose = function() {
      return this.subscriptions.dispose();
    };

    return EditorLinter;

  })();

  module.exports = EditorLinter;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2VkaXRvci1saW50ZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDREQUFBOztBQUFBLEVBQUEsT0FBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQyxrQkFBQSxVQUFELEVBQWEsZUFBQSxPQUFiLEVBQXNCLDJCQUFBLG1CQUF0QixDQUFBOztBQUFBLEVBRU07QUFDUyxJQUFBLHNCQUFFLE1BQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsQ0FBOEQsSUFBQyxDQUFBLE1BQUQsWUFBbUIsVUFBakYsQ0FBQTtBQUFBLGNBQVUsSUFBQSxLQUFBLENBQU0scUNBQU4sQ0FBVixDQUFBO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BRFgsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUZqQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE9BQXBCLENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUN0QyxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxhQUFkLEVBRHNDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckIsQ0FBbkIsQ0FKQSxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxT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

//# sourceURL=/Users/mk2/.atom/packages/linter/lib/editor-linter.coffee
