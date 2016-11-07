(function() {
  var Commands, CompositeDisposable, EditorLinter, Emitter, Helpers, Linter, LinterViews, Path, deprecate, _ref;

  Path = require('path');

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

  LinterViews = require('./linter-views');

  EditorLinter = require('./editor-linter');

  Helpers = require('./helpers');

  Commands = require('./commands');

  deprecate = require('grim').deprecate;

  Linter = (function() {
    function Linter(state) {
      var _base;
      this.state = state;
      if ((_base = this.state).scope == null) {
        _base.scope = 'File';
      }
      this.lintOnFly = true;
      this.emitter = new Emitter;
      this.linters = new (require('./linter-registry'))();
      this.editors = new (require('./editor-registry'))();
      this.messages = new (require('./message-registry'))();
      this.views = new LinterViews(this);
      this.commands = new Commands(this);
      this.subscriptions = new CompositeDisposable(this.views, this.editors, this.linters, this.messages, this.commands);
      this.subscriptions.add(this.linters.onDidUpdateMessages((function(_this) {
        return function(info) {
          return _this.messages.set(info);
        };
      })(this)));
      this.subscriptions.add(this.messages.onDidUpdateMessages((function(_this) {
        return function(messages) {
          return _this.views.render(messages);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter.lintOnFly', (function(_this) {
        return function(value) {
          return _this.lintOnFly = value;
        };
      })(this)));
      this.subscriptions.add(atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.commands.lint();
        };
      })(this)));
      this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.createEditorLinter(editor);
        };
      })(this)));
    }

    Linter.prototype.addLinter = function(linter) {
      return this.linters.addLinter(linter);
    };

    Linter.prototype.deleteLinter = function(linter) {
      if (!this.hasLinter(linter)) {
        return;
      }
      this.linters.deleteLinter(linter);
      return this.deleteMessages(linter);
    };

    Linter.prototype.hasLinter = function(linter) {
      return this.linters.hasLinter(linter);
    };

    Linter.prototype.getLinters = function() {
      return this.linters.getLinters();
    };

    Linter.prototype.setMessages = function(linter, messages) {
      return this.messages.set({
        linter: linter,
        messages: messages
      });
    };

    Linter.prototype.deleteMessages = function(linter) {
      return this.messages.deleteMessages(linter);
    };

    Linter.prototype.getMessages = function() {
      return this.messages.publicMessages;
    };

    Linter.prototype.onDidUpdateMessages = function(callback) {
      return this.messages.onDidUpdateMessages(callback);
    };

    Linter.prototype.onDidChangeMessages = function(callback) {
      deprecate("Linter::onDidChangeMessages is deprecated, use Linter::onDidUpdateMessages instead");
      return this.onDidUpdateMessages(callback);
    };

    Linter.prototype.onDidChangeProjectMessages = function(callback) {
      deprecate("Linter::onDidChangeProjectMessages is deprecated, use Linter::onDidChangeMessages instead");
      return this.onDidChangeMessages(callback);
    };

    Linter.prototype.getProjectMessages = function() {
      deprecate("Linter::getProjectMessages is deprecated, use Linter::getMessages instead");
      return this.getMessages();
    };

    Linter.prototype.setProjectMessages = function(linter, messages) {
      deprecate("Linter::setProjectMessages is deprecated, use Linter::setMessages instead");
      return this.setMessages(linter, messages);
    };

    Linter.prototype.deleteProjectMessages = function(linter) {
      deprecate("Linter::deleteProjectMessages is deprecated, use Linter::deleteMessages instead");
      return this.deleteMessages(linter);
    };

    Linter.prototype.getActiveEditorLinter = function() {
      return this.editors.ofActiveTextEditor();
    };

    Linter.prototype.getEditorLinter = function(editor) {
      return this.editors.ofTextEditor(editor);
    };

    Linter.prototype.eachEditorLinter = function(callback) {
      return this.editors.forEach(callback);
    };

    Linter.prototype.observeEditorLinters = function(callback) {
      return this.editors.observe(callback);
    };

    Linter.prototype.createEditorLinter = function(editor) {
      var editorLinter;
      editorLinter = this.editors.create(editor);
      editorLinter.onShouldUpdateBubble((function(_this) {
        return function() {
          return _this.views.renderBubble();
        };
      })(this));
      editorLinter.onShouldUpdateLineMessages((function(_this) {
        return function() {
          return _this.views.renderLineMessages(true);
        };
      })(this));
      editorLinter.onShouldLint((function(_this) {
        return function(onChange) {
          return _this.linters.lint({
            onChange: onChange,
            editorLinter: editorLinter
          });
        };
      })(this));
      return editorLinter.onDidDestroy((function(_this) {
        return function() {
          return _this.messages.deleteEditorMessages(editor);
        };
      })(this));
    };

    Linter.prototype.deactivate = function() {
      return this.subscriptions.dispose();
    };

    return Linter;

  })();

  module.exports = Linter;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2xpbnRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseUdBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixlQUFBLE9BRHRCLENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUdBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FIZixDQUFBOztBQUFBLEVBSUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSLENBSlYsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUxYLENBQUE7O0FBQUEsRUFNQyxZQUFhLE9BQUEsQ0FBUSxNQUFSLEVBQWIsU0FORCxDQUFBOztBQUFBLEVBUU07QUFFUyxJQUFBLGdCQUFFLEtBQUYsR0FBQTtBQUNYLFVBQUEsS0FBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFFBQUEsS0FDYixDQUFBOzthQUFNLENBQUMsUUFBUztPQUFoQjtBQUFBLE1BR0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUhiLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BTlgsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLENBQUMsT0FBQSxDQUFRLG1CQUFSLENBQUQsQ0FBQSxDQUFBLENBUGYsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLENBQUMsT0FBQSxDQUFRLG1CQUFSLENBQUQsQ0FBQSxDQUFBLENBUmYsQ0FBQTtBQUFB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

//# sourceURL=/Users/mk2/.atom/packages/linter/lib/linter.coffee
