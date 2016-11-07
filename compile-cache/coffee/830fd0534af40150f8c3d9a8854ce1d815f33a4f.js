(function() {
  var CompositeDisposable, Emitter, LinterRegistry, helpers, validate, _ref;

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  validate = require('./validate');

  helpers = require('./helpers');

  LinterRegistry = (function() {
    function LinterRegistry() {
      this.linters = [];
      this.locks = {
        Regular: new WeakSet,
        Fly: new WeakSet
      };
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.emitter);
    }

    LinterRegistry.prototype.getLinters = function() {
      return this.linters.slice();
    };

    LinterRegistry.prototype.hasLinter = function(linter) {
      return this.linters.indexOf(linter) !== -1;
    };

    LinterRegistry.prototype.addLinter = function(linter) {
      var e;
      try {
        validate.linter(linter);
        linter.deactivated = false;
        return this.linters.push(linter);
      } catch (_error) {
        e = _error;
        return helpers.error(e);
      }
    };

    LinterRegistry.prototype.deleteLinter = function(linter) {
      if (!this.hasLinter(linter)) {
        return;
      }
      linter.deactivated = true;
      return this.linters.splice(this.linters.indexOf(linter), 1);
    };

    LinterRegistry.prototype.lint = function(_arg) {
      var editor, editorLinter, lockKey, onChange, scopes;
      onChange = _arg.onChange, editorLinter = _arg.editorLinter;
      editor = editorLinter.editor;
      lockKey = onChange ? 'Fly' : 'Regular';
      if (onChange && !atom.config.get('linter.lintOnFly')) {
        return;
      }
      if (editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      if (!editor.getPath()) {
        return;
      }
      if (this.locks[lockKey].has(editorLinter)) {
        return;
      }
      this.locks[lockKey].add(editorLinter);
      scopes = editor.scopeDescriptorForBufferPosition(editor.getCursorBufferPosition()).scopes;
      scopes.push('*');
      return this.linters.reduce((function(_this) {
        return function(promise, linter) {
          if (!helpers.shouldTriggerLinter(linter, true, onChange, scopes)) {
            return promise;
          }
          return promise.then(function() {
            return _this.triggerLinter(linter, editor, scopes);
          });
        };
      })(this), Promise.resolve()).then((function(_this) {
        return function() {
          var Promises;
          Promises = _this.linters.map(function(linter) {
            if (!helpers.shouldTriggerLinter(linter, false, onChange, scopes)) {
              return;
            }
            return _this.triggerLinter(linter, editor, scopes);
          });
          return Promise.all(Promises);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.locks[lockKey]["delete"](editorLinter);
        };
      })(this));
    };

    LinterRegistry.prototype.triggerLinter = function(linter, editor, scopes) {
      return new Promise(function(resolve) {
        return resolve(linter.lint(editor));
      }).then((function(_this) {
        return function(results) {
          if (results) {
            return _this.emitter.emit('did-update-messages', {
              linter: linter,
              messages: results,
              editor: editor
            });
          }
        };
      })(this))["catch"](function(e) {
        return helpers.error(e);
      });
    };

    LinterRegistry.prototype.onDidUpdateMessages = function(callback) {
      return this.emitter.on('did-update-messages', callback);
    };

    LinterRegistry.prototype.dispose = function() {
      this.subscriptions.dispose();
      return this.linters = [];
    };

    return LinterRegistry;

  })();

  module.exports = LinterRegistry;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2xpbnRlci1yZWdpc3RyeS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUVBQUE7O0FBQUEsRUFBQSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLGVBQUEsT0FBRCxFQUFVLDJCQUFBLG1CQUFWLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSLENBRlYsQ0FBQTs7QUFBQSxFQUlNO0FBQ1MsSUFBQSx3QkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUQsR0FDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLEdBQUEsQ0FBQSxPQUFUO0FBQUEsUUFDQSxHQUFBLEVBQUssR0FBQSxDQUFBLE9BREw7T0FGRixDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUpYLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFMakIsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxPQUFwQixDQU5BLENBRFc7SUFBQSxDQUFiOztBQUFBLDZCQVNBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixhQUFPLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxDQUFBLENBQVAsQ0FEVTtJQUFBLENBVFosQ0FBQTs7QUFBQSw2QkFZQSxTQUFBLEdBQVcsU0FBQyxNQUFELEdBQUE7YUFDVCxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsTUFBakIsQ0FBQSxL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

//# sourceURL=/Users/mk2/.atom/packages/linter/lib/linter-registry.coffee
