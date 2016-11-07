(function() {
  var CompositeDisposable, EditorLinter, EditorRegistry, Emitter, _ref;

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  EditorLinter = require('./editor-linter');

  EditorRegistry = (function() {
    function EditorRegistry() {
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.emitter);
      this.editorLinters = new Map();
    }

    EditorRegistry.prototype.create = function(textEditor) {
      var editorLinter;
      this.editorLinters.set(textEditor, editorLinter = new EditorLinter(textEditor));
      editorLinter.onDidDestroy((function(_this) {
        return function() {
          _this.editorLinters["delete"](textEditor);
          return editorLinter.dispose();
        };
      })(this));
      this.emitter.emit('observe', editorLinter);
      return editorLinter;
    };

    EditorRegistry.prototype.forEach = function(callback) {
      return this.editorLinters.forEach(callback);
    };

    EditorRegistry.prototype.ofTextEditor = function(editor) {
      return this.editorLinters.get(editor);
    };

    EditorRegistry.prototype.ofActiveTextEditor = function() {
      return this.ofTextEditor(atom.workspace.getActiveTextEditor());
    };

    EditorRegistry.prototype.observe = function(callback) {
      this.forEach(callback);
      return this.emitter.on('observe', callback);
    };

    EditorRegistry.prototype.dispose = function() {
      this.subscriptions.dispose();
      this.editorLinters.forEach(function(editorLinter) {
        return editorLinter.dispose();
      });
      return this.editorLinters.clear();
    };

    return EditorRegistry;

  })();

  module.exports = EditorRegistry;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2VkaXRvci1yZWdpc3RyeS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0VBQUE7O0FBQUEsRUFBQSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLGVBQUEsT0FBRCxFQUFVLDJCQUFBLG1CQUFWLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUdNO0FBQ1MsSUFBQSx3QkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFEakIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxPQUFwQixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsR0FBQSxDQUFBLENBSHJCLENBRFc7SUFBQSxDQUFiOztBQUFBLDZCQU1BLE1BQUEsR0FBUSxTQUFDLFVBQUQsR0FBQTtBQUNOLFVBQUEsWUFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLFVBQW5CLEVBQStCLFlBQUEsR0FBbUIsSUFBQSxZQUFBLENBQWEsVUFBYixDQUFsRCxDQUFBLENBQUE7QUFBQSxNQUNBLFlBQVksQ0FBQyxZQUFiLENBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDeEIsVUFBQSxLQUFDLENBQUEsYUFBYSxDQUFDLFFBQUQsQ0FBZCxDQUFzQixVQUF0QixDQUFBLENBQUE7aUJBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQSxFQUZ3QjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLENBREEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsU0FBZCxFQUF5QixZQUF6QixDQUpBLENBQUE7QUFLQSxhQUFPLFlBQVAsQ0FOTTtJQUFBLENBTlIsQ0FBQTs7QUFBQSw2QkFjQSxPQUFBLEdBQVMsU0FBQyxRQUFELEdBQUE7YUFDUCxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBdUIsUUFBdkIsRUFETztJQUFBLENBZFQsQ0FBQTs7QUFBQSw2QkFpQkEsWUFBQSxHQUFjLFNBQUMsTUFBRCxHQUFBO0FBQ1osYUFBTyxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsTUFBbkIsQ0FBUCxDQURZO0lBQUEsQ0FqQmQsQ0FBQTs7QUFBQSw2QkFvQkEsa0JBQUEsR0FBb0IsU0FBQSxHQUFBO0FBQ2xCLGFBQU8sSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBZCxDQUFQLENBRGtCO0lBQUEsQ0FwQnBCLENBQUE7O0FBQUEsNkJBdUJBLE9BQUEsR0FBUyxTQUFDLFFBQUQsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxRQUFULENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFNBQVosRUFBdUIsUUFBdkIsRUFGTztJQUFBLENBdkJULENBQUE7O0FBQUEsNkJBMkJBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQXVCLFNBQUMsWUFBRCxHQUFBO2VBQ3JCLFlBQVksQ0FBQyxPQUFiLENBQUEsRUFEcUI7TUFBQSxDQUF2QixDQURBLENBQUE7YUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsQ0FBQSxFQUpPO0lBQUEsQ0EzQlQsQ0FBQTs7MEJBQUE7O01BSkYsQ0FBQTs7QUFBQSxFQXFDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixjQXJDakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/mk2/.atom/packages/linter/lib/editor-registry.coffee
