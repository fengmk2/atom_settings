(function() {
  var AutoIndent, CompositeDisposable, INTERFILESAVETIME, LB, autoCompleteJSX;

  CompositeDisposable = require('atom').CompositeDisposable;

  autoCompleteJSX = require('./auto-complete-jsx');

  AutoIndent = require('./auto-indent');

  INTERFILESAVETIME = 1000;

  LB = 'language-babel';

  module.exports = {
    config: require('./config'),
    activate: function(state) {
      if (this.transpiler == null) {
        this.transpiler = new (require('./transpiler'));
      }
      this.disposable = new CompositeDisposable;
      this.textEditors = {};
      this.fileSaveTimes = {};
      this.disposable.add(atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.transpiler.stopUnusedTasks();
        };
      })(this)));
      return this.disposable.add(atom.workspace.observeTextEditors((function(_this) {
        return function(textEditor) {
          _this.textEditors[textEditor.id] = new CompositeDisposable;
          _this.textEditors[textEditor.id].add(textEditor.observeGrammar(function(grammar) {
            var _ref, _ref1, _ref2;
            if (textEditor.getGrammar().packageName === LB) {
              if (atom.config.get(LB).autoIndentJSX) {
                return _this.textEditors[textEditor.id].autoIndent = new AutoIndent(textEditor);
              }
            } else {
              if ((_ref = _this.textEditors[textEditor.id]) != null) {
                if ((_ref1 = _ref.autoIndent) != null) {
                  _ref1.destroy();
                }
              }
              return delete (((_ref2 = _this.textEditors[textEditor.id]) != null ? _ref2.autoIndent : void 0) != null);
            }
          }));
          _this.textEditors[textEditor.id].add(textEditor.onDidSave(function(event) {
            var filePath, lastSaveTime, _ref;
            if (textEditor.getGrammar().packageName === LB) {
              filePath = textEditor.getPath();
              lastSaveTime = (_ref = _this.fileSaveTimes[filePath]) != null ? _ref : 0;
              _this.fileSaveTimes[filePath] = Date.now();
              if (lastSaveTime < (_this.fileSaveTimes[filePath] - INTERFILESAVETIME)) {
                return _this.transpiler.transpile(filePath, textEditor);
              }
            }
          }));
          return _this.textEditors[textEditor.id].add(textEditor.onDidDestroy(function() {
            var filePath, _ref, _ref1, _ref2;
            if ((_ref = _this.textEditors[textEditor.id]) != null) {
              if ((_ref1 = _ref.autoIndent) != null) {
                _ref1.destroy();
              }
            }
            delete (((_ref2 = _this.textEditors[textEditor.id]) != null ? _ref2.autoIndent : void 0) != null);
            filePath = textEditor.getPath();
            if (_this.fileSaveTimes[filePath] != null) {
              delete _this.fileSaveTimes[filePath];
            }
            _this.textEditors[textEditor.id].dispose();
            return delete _this.textEditors[textEditor.id];
          }));
        };
      })(this)));
    },
    deactivate: function() {
      var disposeable, id, _ref;
      this.disposable.dispose();
      _ref = this.textEditors;
      for (id in _ref) {
        disposeable = _ref[id];
        if (this.textEditors[id].autoIndent != null) {
          this.textEditors[id].autoIndent.destroy();
          delete this.textEditors[id].autoIndent;
        }
        disposeable.dispose();
      }
      return this.transpiler.stopAllTranspilerTask();
    },
    JSXCompleteProvider: function() {
      return autoCompleteJSX;
    },
    provide: function() {
      return this.transpiler;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1iYWJlbC9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdUVBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSLENBRGxCLENBQUE7O0FBQUEsRUFFQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FGYixDQUFBOztBQUFBLEVBSUEsaUJBQUEsR0FBb0IsSUFKcEIsQ0FBQTs7QUFBQSxFQUtBLEVBQUEsR0FBSyxnQkFMTCxDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUFRLE9BQUEsQ0FBUSxVQUFSLENBQVI7QUFBQSxJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTs7UUFDUixJQUFDLENBQUEsYUFBYyxHQUFBLENBQUEsQ0FBSyxPQUFBLENBQVEsY0FBUixDQUFEO09BQW5CO0FBQUEsTUFFQSxJQUFDLENBQUEsVUFBRCxHQUFjLEdBQUEsQ0FBQSxtQkFGZCxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsV0FBRCxHQUFlLEVBSGYsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsRUFKakIsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWIsQ0FBOEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDNUMsS0FBQyxDQUFBLFVBQVUsQ0FBQyxlQUFaLENBQUEsRUFENEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QixDQUFoQixDQU5B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

//# sourceURL=/Users/mk2/.atom/packages/language-babel/lib/main.coffee
