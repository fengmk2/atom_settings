(function() {
  var TabsToSpaces, tabsToSpaces;

  TabsToSpaces = null;

  tabsToSpaces = null;

  module.exports = {
    config: {
      onSave: {
        type: 'string',
        "default": 'none',
        "enum": ['none', 'tabify', 'untabify'],
        description: 'Setting this to anything other than "none" can significantly impact the time it takes to\nsave large files.'
      }
    },
    activate: function() {
      this.commands = atom.commands.add('atom-workspace', {
        'tabs-to-spaces:tabify': (function(_this) {
          return function() {
            _this.loadModule();
            return tabsToSpaces.tabify();
          };
        })(this),
        'tabs-to-spaces:untabify': (function(_this) {
          return function() {
            _this.loadModule();
            return tabsToSpaces.untabify();
          };
        })(this),
        'tabs-to-spaces:untabify-all': (function(_this) {
          return function() {
            _this.loadModule();
            return tabsToSpaces.untabifyAll();
          };
        })(this)
      });
      return this.editorObserver = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.handleEvents(editor);
        };
      })(this));
    },
    deactivate: function() {
      this.commands.dispose();
      return this.editorObserver.dispose();
    },
    handleEvents: function(editor) {
      return editor.getBuffer().onWillSave((function(_this) {
        return function() {
          if (editor.getPath() === atom.config.getUserConfigPath()) {
            return;
          }
          switch (atom.config.get('tabs-to-spaces.onSave', {
                scope: editor.getRootScopeDescriptor()
              })) {
            case 'untabify':
              _this.loadModule();
              return tabsToSpaces.untabify();
            case 'tabify':
              _this.loadModule();
              return tabsToSpaces.tabify();
          }
        };
      })(this));
    },
    loadModule: function() {
      if (TabsToSpaces == null) {
        TabsToSpaces = require('./tabs-to-spaces');
      }
      return tabsToSpaces != null ? tabsToSpaces : tabsToSpaces = new TabsToSpaces();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy90YWJzLXRvLXNwYWNlcy9saWIvaW5kZXguY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBCQUFBOztBQUFBLEVBQUEsWUFBQSxHQUFlLElBQWYsQ0FBQTs7QUFBQSxFQUNBLFlBQUEsR0FBZSxJQURmLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLE1BQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxNQURUO0FBQUEsUUFFQSxNQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixVQUFuQixDQUZOO0FBQUEsUUFHQSxXQUFBLEVBQWEsNkdBSGI7T0FERjtLQURGO0FBQUEsSUFXQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDVjtBQUFBLFFBQUEsdUJBQUEsRUFBeUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDdkIsWUFBQSxLQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsQ0FBQTttQkFDQSxZQUFZLENBQUMsTUFBYixDQUFBLEVBRnVCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7QUFBQSxRQUlBLHlCQUFBLEVBQTJCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO0FBQ3pCLFlBQUEsS0FBQyxDQUFBLFVBQUQsQ0FBQSxDQUFBLENBQUE7bUJBQ0EsWUFBWSxDQUFDLFFBQWIsQ0FBQSxFQUZ5QjtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSjNCO0FBQUEsUUFRQSw2QkFBQSxFQUErQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTtBQUM3QixZQUFBLEtBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxDQUFBO21CQUNBLFlBQVksQ0FBQyxXQUFiLENBQUEsRUFGNkI7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVIvQjtPQURVLENBQVosQ0FBQTthQWFBLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUNsRCxLQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsRUFEa0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxFQWRWO0lBQUEsQ0FYVjtBQUFBLElBNEJBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxjQUFjLENBQUMsT0FBaEIsQ0FBQSxFQUZVO0lBQUEsQ0E1Qlo7QUFBQSxJQW1DQSxZQUFBLEVBQWMsU0FBQyxNQUFELEdBQUE7YUFDWixNQUFNLENBQUMsU0FBUCxDQUFBLENBQWtCLENBQUMsVUFBbkIsQ0FBOEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUM1QixVQUFBLElBQVUsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLEtBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQVosQ0FBQSxDQUE5QjtBQUFBLGtCQUFBLENBQUE7V0FBQTtBQUVBLGtCQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsRUFBeUM7QUFBQSxnQkFBQSxLQUFBLEVBQU8sTUFBTSxDQUFDLHNCQUFQLENBQUEsQ0FBUDtlQUF6QyxDQUFQO0FBQUEsaUJBQ08sVUFEUDtBQUVJLGNBQUEsS0FBQyxDQUFBLFVBQUQsQ0FBQSxDQUFBLENBQUE7cUJBQ0EsWUFBWSxDQUFDLFFBQWIsQ0FBQSxFQUhKO0FBQUEsaUJBSU8sUUFKUDtBQUtJLGNBQUEsS0FBQyxDQUFBLFVBQUQsQ0FBQSxDQUFBLENBQUE7cUJBQ0EsWUFBWSxDQUFDLE1BQWIsQ0FBQSxFQU5KO0FBQUEsV0FINEI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QixFQURZO0lBQUEsQ0FuQ2Q7QUFBQSxJQWdEQSxVQUFBLEVBQVksU0FBQSxHQUFBOztRQUNWLGVBQWdCLE9BQUEsQ0FBUSxrQkFBUjtPQUFoQjtvQ0FDQSxlQUFBLGVBQW9CLElBQUEsWUFBQSxDQUFBLEVBRlY7SUFBQSxDQWhEWjtHQUpGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/mk2/.atom/packages/tabs-to-spaces/lib/index.coffee
