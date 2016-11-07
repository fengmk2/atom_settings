(function() {
  var ProviderPackageFactory, SnippetsProvider, _;

  _ = require("underscore-plus");

  ProviderPackageFactory = require("autocomplete-plus").ProviderPackageFactory;

  SnippetsProvider = require("./snippets-provider");

  module.exports = {
    editorSubscription: null,
    providers: [],
    autocomplete: null,

    /*
     * Registers a SnippetProvider for each editor view
     */
    activate: function() {
      return atom.packages.activatePackage("autocomplete-plus").then((function(_this) {
        return function(pkg) {
          _this.autocomplete = pkg.mainModule;
          return _this.registerProviders();
        };
      })(this));
    },

    /*
     * Registers a SnippetProvider for each editor view
     */
    registerProviders: function() {
      return this.editorSubscription = atom.workspaceView.eachEditorView((function(_this) {
        return function(editorView) {
          var provider;
          if (editorView.attached && !editorView.mini) {
            provider = new SnippetsProvider(editorView);
            _this.autocomplete.registerProviderForEditorView(provider, editorView);
            return _this.providers.push(provider);
          }
        };
      })(this));
    },

    /*
     * Cleans everything up, unregisters all SnippetProvider instances
     */
    deactivate: function() {
      var _ref;
      if ((_ref = this.editorSubscription) != null) {
        _ref.off();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJDQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQyx5QkFBMEIsT0FBQSxDQUFRLG1CQUFSLEVBQTFCLHNCQURELENBQUE7O0FBQUEsRUFFQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FGbkIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGtCQUFBLEVBQW9CLElBQXBCO0FBQUEsSUFDQSxTQUFBLEVBQVcsRUFEWDtBQUFBLElBRUEsWUFBQSxFQUFjLElBRmQ7QUFJQTtBQUFBOztPQUpBO0FBQUEsSUFPQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLG1CQUE5QixDQUNFLENBQUMsSUFESCxDQUNRLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEdBQUQsR0FBQTtBQUNKLFVBQUEsS0FBQyxDQUFBLFlBQUQsR0FBZ0IsR0FBRyxDQUFDLFVBQXBCLENBQUE7aUJBQ0EsS0FBQyxDQUFBLGlCQUFELENBQUEsRUFGSTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFIsRUFEUTtJQUFBLENBUFY7QUFhQTtBQUFBOztPQWJBO0FBQUEsSUFnQkEsaUJBQUEsRUFBbUIsU0FBQSxHQUFBO2FBQ2pCLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixJQUFJLENBQUMsYUFBYSxDQUFDLGNBQW5CLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFVBQUQsR0FBQTtBQUN0RCxjQUFBLFFBQUE7QUFBQSxVQUFBLElBQUcsVUFBVSxDQUFDLFFBQVgsSUFBd0IsQ0FBQSxVQUFjLENBQUMsSUFBMUM7QUFDRSxZQUFBLFFBQUEsR0FBZSxJQUFBLGdCQUFBLENBQWlCLFVBQWpCLENBQWYsQ0FBQTtBQUFBLFlBRUEsS0FBQyxDQUFBLFlBQVksQ0FBQyw2QkFBZCxDQUE0QyxRQUE1QyxFQUFzRCxVQUF0RCxDQUZBLENBQUE7bUJBSUEsS0FBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLFFBQWhCLEVBTEY7V0FEc0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxFQURMO0lBQUEsQ0FoQm5CO0FBeUJBO0FBQUE7O09BekJBO0FBQUEsSUE0QkEsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsSUFBQTs7WUFBbUIsQ0FBRSxHQUFyQixDQUFBO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixJQUR0QixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsUUFBRCxHQUFBO2lCQUNqQixLQUFDLENBQUEsWUFBWSxDQUFDLGtCQUFkLENBQWlDLFFBQWpDLEVBRGlCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsQ0FIQSxDQUFBO2FBTUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxHQVBIO0lBQUEsQ0E1Qlo7R0FMRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-snippets/lib/autocomplete-snippets.coffee