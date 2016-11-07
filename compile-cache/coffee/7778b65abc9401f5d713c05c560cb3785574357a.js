(function() {
  var AutocompleteManager, Provider, SelectListElement, Suggestion, deprecate, _;

  _ = require('underscore-plus');

  AutocompleteManager = require('./autocomplete-manager');

  SelectListElement = require('./select-list-element');

  Provider = require('./provider');

  Suggestion = require('./suggestion');

  deprecate = require('grim').deprecate;

  module.exports = {
    config: {
      enableAutoActivation: {
        title: 'Show Suggestions On Keystroke',
        description: 'Suggestions will show as you type if this preference is enabled. If it is disabled, you can still see suggestions by using the keybinding for autocomplete-plus:activate (shown below).',
        type: "boolean",
        "default": true,
        order: 1
      },
      autoActivationDelay: {
        title: 'Delay Before Suggestions Are Shown',
        description: 'This prevents suggestions from being shown too frequently. Usually, the default works well. A lower value than the default has performance implications, and is not advised.',
        type: "integer",
        "default": 100,
        order: 2
      },
      maxSuggestions: {
        title: 'Maximum Suggestions',
        description: 'The list of suggestions will be limited to this number.',
        type: "integer",
        "default": 10,
        order: 3
      },
      confirmCompletion: {
        title: 'Keybinding(s) For Confirming A Suggestion',
        description: 'You should use the key(s) indicated here to confirm a suggestion from the suggestion list and have it inserted into the file.',
        type: "string",
        "default": "tab",
        "enum": ["tab", "enter", "tab and enter"],
        order: 4
      },
      navigateCompletions: {
        title: 'Keybindings For Navigating The Suggestion List',
        description: 'You should use the keys indicated here to select suggestions in the suggestion list (moving up or down).',
        type: "string",
        "default": "up,down",
        "enum": ["up,down", "ctrl-p,ctrl-n"],
        order: 5
      },
      fileBlacklist: {
        type: "string",
        "default": ".*, *.md",
        order: 90
      },
      includeCompletionsFromAllBuffers: {
        type: "boolean",
        "default": false,
        order: 100
      }
    },
    autocompleteManagers: [],
    editorSubscription: null,
    activate: function() {
      atom.views.addViewProvider(AutocompleteManager, (function(_this) {
        return function(model) {
          var element;
          element = new SelectListElement();
          element.setModel(model);
          return element;
        };
      })(this));
      return this.editorSubscription = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var autocompleteManager;
          autocompleteManager = new AutocompleteManager(editor);
          editor.onDidDestroy(function() {
            autocompleteManager.dispose();
            return _.remove(_this.autocompleteManagers, autocompleteManager);
          });
          return _this.autocompleteManagers.push(autocompleteManager);
        };
      })(this));
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.editorSubscription) != null) {
        _ref.dispose();
      }
      this.editorSubscription = null;
      this.autocompleteManagers.forEach(function(autocompleteManager) {
        return autocompleteManager.dispose();
      });
      return this.autocompleteManagers = [];
    },
    registerProviderForEditorView: function(provider, editorView) {
      deprecate('Use of editorView is deprecated, use registerProviderForEditor instead');
      return this.registerProviderForEditor(provider, editorView != null ? editorView.getModel() : void 0);
    },
    registerProviderForEditor: function(provider, editor) {
      var autocompleteManager;
      if (provider == null) {
        return;
      }
      if (editor == null) {
        return;
      }
      autocompleteManager = _.findWhere(this.autocompleteManagers, {
        editor: editor
      });
      if (autocompleteManager == null) {
        throw new Error("Could not register provider", provider.constructor.name);
      }
      return autocompleteManager.registerProvider(provider);
    },
    unregisterProvider: function(provider) {
      var autocompleteManager, _i, _len, _ref, _results;
      _ref = this.autocompleteManagers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        autocompleteManager = _ref[_i];
        _results.push(autocompleteManager.unregisterProvider(provider));
      }
      return _results;
    },
    Provider: Provider,
    Suggestion: Suggestion
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBFQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxtQkFBQSxHQUFzQixPQUFBLENBQVEsd0JBQVIsQ0FEdEIsQ0FBQTs7QUFBQSxFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx1QkFBUixDQUZwQixDQUFBOztBQUFBLEVBR0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBSFgsQ0FBQTs7QUFBQSxFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUixDQUpiLENBQUE7O0FBQUEsRUFLQyxZQUFhLE9BQUEsQ0FBUSxNQUFSLEVBQWIsU0FMRCxDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxvQkFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sK0JBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSx5TEFEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxJQUhUO0FBQUEsUUFJQSxLQUFBLEVBQU8sQ0FKUDtPQURGO0FBQUEsTUFNQSxtQkFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sb0NBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSw4S0FEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxHQUhUO0FBQUEsUUFJQSxLQUFBLEVBQU8sQ0FKUDtPQVBGO0FBQUEsTUFZQSxjQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxxQkFBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLHlEQURiO0FBQUEsUUFFQSxJQUFBLEVBQU0sU0FGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLEVBSFQ7QUFBQSxR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
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-plus/lib/main.coffee