(function() {
  module.exports = {
    editorSubscription: null,
    providers: [],
    autocomplete: null,

    /*
     * Activates the package
     */
    activate: function() {
      return atom.packages.activatePackage('autocomplete-plus').then((function(_this) {
        return function(pkg) {
          var Provider;
          _this.autocomplete = pkg.mainModule;
          if (_this.autocomplete == null) {
            return;
          }
          Provider = (require('./snippets-provider')).ProviderClass(_this.autocomplete.Provider, _this.autocomplete.Suggestion);
          if (Provider == null) {
            return;
          }
          return _this.editorSubscription = atom.workspace.observeTextEditors(function(editor) {
            return _this.registerProvider(Provider, editor);
          });
        };
      })(this));
    },

    /*
     * Registers a Provider for an editor
     */
    registerProvider: function(Provider, editor) {
      var editorView, provider;
      if (Provider == null) {
        return;
      }
      if (editor == null) {
        return;
      }
      editorView = atom.views.getView(editor);
      if (editorView == null) {
        return;
      }
      if (!editorView.mini) {
        provider = new Provider(editor);
        this.autocomplete.registerProviderForEditor(provider, editor);
        return this.providers.push(provider);
      }
    },

    /*
     * Cleans everything up, unregisters all Provider instances
     */
    deactivate: function() {
      var _ref;
      if ((_ref = this.editorSubscription) != null) {
        _ref.dispose();
      }
      this.editorSubscription = null;
      this.providers.forEach((function(_this) {
        return function(provider) {
          return _this.autocomplete.unregisterProvider(provider);
        };
      })(this));
      return this.providers = [];
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGtCQUFBLEVBQW9CLElBQXBCO0FBQUEsSUFDQSxTQUFBLEVBQVcsRUFEWDtBQUFBLElBRUEsWUFBQSxFQUFjLElBRmQ7QUFJQTtBQUFBOztPQUpBO0FBQUEsSUFPQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLG1CQUE5QixDQUFrRCxDQUFDLElBQW5ELENBQXdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEdBQUQsR0FBQTtBQUN0RCxjQUFBLFFBQUE7QUFBQSxVQUFBLEtBQUMsQ0FBQSxZQUFELEdBQWdCLEdBQUcsQ0FBQyxVQUFwQixDQUFBO0FBQ0EsVUFBQSxJQUFjLDBCQUFkO0FBQUEsa0JBQUEsQ0FBQTtXQURBO0FBQUEsVUFFQSxRQUFBLEdBQVcsQ0FBQyxPQUFBLENBQVEscUJBQVIsQ0FBRCxDQUErQixDQUFDLGFBQWhDLENBQThDLEtBQUMsQ0FBQSxZQUFZLENBQUMsUUFBNUQsRUFBc0UsS0FBQyxDQUFBLFlBQVksQ0FBQyxVQUFwRixDQUZYLENBQUE7QUFHQSxVQUFBLElBQWMsZ0JBQWQ7QUFBQSxrQkFBQSxDQUFBO1dBSEE7aUJBSUEsS0FBQyxDQUFBLGtCQUFELEdBQXNCLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsU0FBQyxNQUFELEdBQUE7bUJBQVksS0FBQyxDQUFBLGdCQUFELENBQWtCLFFBQWxCLEVBQTRCLE1BQTVCLEVBQVo7VUFBQSxDQUFsQyxFQUxnQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhELEVBRFE7SUFBQSxDQVBWO0FBZUE7QUFBQTs7T0FmQTtBQUFBLElBa0JBLGdCQUFBLEVBQWtCLFNBQUMsUUFBRCxFQUFXLE1BQVgsR0FBQTtBQUNoQixVQUFBLG9CQUFBO0FBQUEsTUFBQSxJQUFjLGdCQUFkO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFDQSxNQUFBLElBQWMsY0FBZDtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBQUEsTUFFQSxVQUFBLEdBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CLENBRmIsQ0FBQTtBQUdBLE1BQUEsSUFBYyxrQkFBZDtBQUFBLGNBQUEsQ0FBQTtPQUhBO0FBSUEsTUFBQSxJQUFHLENBQUEsVUFBYyxDQUFDLElBQWxCO0FBQ0UsUUFBQSxRQUFBLEdBQWUsSUFBQSxRQUFBLENBQVMsTUFBVCxDQUFmLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxZQUFZLENBQUMseUJBQWQsQ0FBd0MsUUFBeEMsRUFBa0QsTUFBbEQsQ0FEQSxDQUFBO2VBRUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLFFBQWhCLEVBSEY7T0FMZ0I7SUFBQSxDQWxCbEI7QUE0QkE7QUFBQTs7T0E1QkE7QUFBQSxJQStCQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxJQUFBOztZQUFtQixDQUFFLE9BQXJCLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGtCQUFELEdBQXNCLElBRHRCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxRQUFELEdBQUE7aUJBQWMsS0FBQyxDQUFBLFlBQVksQ0FBQyxrQkFBZCxDQUFpQyxRQUFqQyxFQUFkO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsQ0FIQSxDQUFBO2FBSUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxHQUxIO0lBQUEsQ0EvQlo7R0FERixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-snippets/lib/autocomplete-snippets.coffee