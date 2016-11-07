(function() {
  var TabsToSpaces;

  TabsToSpaces = null;

  module.exports = {
    config: {
      onSave: {
        type: 'string',
        "default": 'none',
        "enum": ['none', 'tabify', 'untabify'],
        description: 'Setting this to anything other than `none` can **significantly** impact the time it takes to save large files.'
      }
    },
    activate: function() {
      this.commands = atom.commands.add('atom-workspace', {
        'tabs-to-spaces:tabify': (function(_this) {
          return function() {
            _this.loadModule();
            return TabsToSpaces.tabify();
          };
        })(this),
        'tabs-to-spaces:untabify': (function(_this) {
          return function() {
            _this.loadModule();
            return TabsToSpaces.untabify();
          };
        })(this),
        'tabs-to-spaces:untabify-all': (function(_this) {
          return function() {
            _this.loadModule();
            return TabsToSpaces.untabifyAll();
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
      this.editorObserver.dispose();
      return TabsToSpaces = null;
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
              return TabsToSpaces.untabify();
            case 'tabify':
              _this.loadModule();
              return TabsToSpaces.tabify();
          }
        };
      })(this));
    },
    loadModule: function() {
      return TabsToSpaces != null ? TabsToSpaces : TabsToSpaces = require('./tabs-to-spaces');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy90YWJzLXRvLXNwYWNlcy9saWIvaW5kZXguY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFlBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsSUFBZixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxNQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsTUFEVDtBQUFBLFFBRUEsTUFBQSxFQUFNLENBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsVUFBbkIsQ0FGTjtBQUFBLFFBR0EsV0FBQSxFQUFhLGdIQUhiO09BREY7S0FERjtBQUFBLElBUUEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ1Y7QUFBQSxRQUFBLHVCQUFBLEVBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO0FBQ3ZCLFlBQUEsS0FBQyxDQUFBLFVBQUQsQ0FBQSxDQUFBLENBQUE7bUJBQ0EsWUFBWSxDQUFDLE1BQWIsQ0FBQSxFQUZ1QjtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO0FBQUEsUUFJQSx5QkFBQSxFQUEyQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTtBQUN6QixZQUFBLEtBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxDQUFBO21CQUNBLFlBQVksQ0FBQyxRQUFiLENBQUEsRUFGeUI7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUozQjtBQUFBLFFBUUEsNkJBQUEsRUFBK0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDN0IsWUFBQSxLQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsQ0FBQTttQkFDQSxZQUFZLENBQUMsV0FBYixDQUFBLEVBRjZCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FSL0I7T0FEVSxDQUFaLENBQUE7YUFhQSxJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtpQkFDbEQsS0FBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkLEVBRGtEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsRUFkVjtJQUFBLENBUlY7QUFBQSxJQTBCQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxjQUFjLENBQUMsT0FBaEIsQ0FBQSxDQURBLENBQUE7YUFJQSxZQUFBLEdBQWUsS0FMTDtJQUFBLENBMUJaO0FBQUEsSUFvQ0EsWUFBQSxFQUFjLFNBQUMsTUFBRCxHQUFBO2FBQ1osTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUFrQixDQUFDLFVBQW5CLENBQThCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDNUIsVUFBQSxJQUFVLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBQSxLQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFaLENBQUEsQ0FBOUI7QUFBQSxrQkFBQSxDQUFBO1dBQUE7QUFFQSxrQkFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLEVBQXlDO0FBQUEsZ0JBQUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxzQkFBUCxDQUFBLENBQVA7ZUFBekMsQ0FBUDtBQUFBLGlCQUNPLFVBRFA7QUFFSSxjQUFBLEtBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxDQUFBO3FCQUNBLFlBQVksQ0FBQyxRQUFiLENBQUEsRUFISjtBQUFBLGlCQUlPLFFBSlA7QUFLSSxjQUFBLEtBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxDQUFBO3FCQUNBLFlBQVksQ0FBQyxNQUFiLENBQUEsRUFOSjtBQUFBLFdBSDRCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUIsRUFEWTtJQUFBLENBcENkO0FBQUEsSUFpREEsVUFBQSxFQUFZLFNBQUEsR0FBQTtvQ0FDVixlQUFBLGVBQWdCLE9BQUEsQ0FBUSxrQkFBUixFQUROO0lBQUEsQ0FqRFo7R0FIRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/mk2/.atom/packages/tabs-to-spaces/lib/index.coffee
