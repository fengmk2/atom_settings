(function() {
  var Range, SnippetsProvider, fuzzaldrin;

  Range = require('atom').Range;

  fuzzaldrin = require('fuzzaldrin');

  module.exports = SnippetsProvider = (function() {
    function SnippetsProvider() {}

    SnippetsProvider.prototype.id = 'autocomplete-snippets-snippetsprovider';

    SnippetsProvider.prototype.selector = '*';

    SnippetsProvider.prototype.requestHandler = function(options) {
      var key, scopeSnippets, snippets, suggestions, val, _ref;
      if (!(((options != null ? options.cursor : void 0) != null) && ((_ref = options.prefix) != null ? _ref.length : void 0))) {
        return;
      }
      scopeSnippets = atom.config.get('snippets', {
        scope: options.cursor.getScopeDescriptor()
      });
      snippets = [];
      for (key in scopeSnippets) {
        val = scopeSnippets[key];
        val.label = key;
        snippets.push(val);
      }
      suggestions = this.findSuggestionsForWord(snippets, options.prefix);
      if (!(suggestions != null ? suggestions.length : void 0)) {
        return;
      }
      return suggestions;
    };

    SnippetsProvider.prototype.findSuggestionsForWord = function(snippets, prefix) {
      var matchesPrefix, results, snippet, suggestion;
      if (!((snippets != null) && (prefix != null))) {
        return [];
      }
      matchesPrefix = function(snippet) {
        return snippet.prefix.lastIndexOf(prefix, 0) !== -1;
      };
      results = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = snippets.length; _i < _len; _i++) {
          snippet = snippets[_i];
          if (!(matchesPrefix(snippet))) {
            continue;
          }
          suggestion = {
            snippet: snippet,
            word: snippet.prefix,
            prefix: prefix,
            label: snippet.name,
            isSnippet: true
          };
          _results.push(suggestion);
        }
        return _results;
      })();
      return results;
    };

    return SnippetsProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBOztBQUFBLEVBQUMsUUFBVSxPQUFBLENBQVEsTUFBUixFQUFWLEtBQUQsQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQURiLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO2tDQUNKOztBQUFBLCtCQUFBLEVBQUEsR0FBSSx3Q0FBSixDQUFBOztBQUFBLCtCQUNBLFFBQUEsR0FBVSxHQURWLENBQUE7O0FBQUEsK0JBR0EsY0FBQSxHQUFnQixTQUFDLE9BQUQsR0FBQTtBQUNkLFVBQUEsb0RBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxDQUFjLHFEQUFBLDJDQUFtQyxDQUFFLGdCQUFuRCxDQUFBO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLFVBQWhCLEVBQTRCO0FBQUEsUUFBQyxLQUFBLEVBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxrQkFBZixDQUFBLENBQVI7T0FBNUIsQ0FEaEIsQ0FBQTtBQUFBLE1BRUEsUUFBQSxHQUFXLEVBRlgsQ0FBQTtBQUdBLFdBQUEsb0JBQUE7aUNBQUE7QUFDRSxRQUFBLEdBQUcsQ0FBQyxLQUFKLEdBQVksR0FBWixDQUFBO0FBQUEsUUFDQSxRQUFRLENBQUMsSUFBVCxDQUFjLEdBQWQsQ0FEQSxDQURGO0FBQUEsT0FIQTtBQUFBLE1BT0EsV0FBQSxHQUFjLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixRQUF4QixFQUFrQyxPQUFPLENBQUMsTUFBMUMsQ0FQZCxDQUFBO0FBUUEsTUFBQSxJQUFBLENBQUEsdUJBQWMsV0FBVyxDQUFFLGdCQUEzQjtBQUFBLGNBQUEsQ0FBQTtPQVJBO0FBU0EsYUFBTyxXQUFQLENBVmM7SUFBQSxDQUhoQixDQUFBOztBQUFBLCtCQWVBLHNCQUFBLEdBQXdCLFNBQUMsUUFBRCxFQUFXLE1BQVgsR0FBQTtBQUN0QixVQUFBLDJDQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsQ0FBaUIsa0JBQUEsSUFBYyxnQkFBL0IsQ0FBQTtBQUFBLGVBQU8sRUFBUCxDQUFBO09BQUE7QUFBQSxNQUdBLGFBQUEsR0FBZ0IsU0FBQyxPQUFELEdBQUE7ZUFDZCxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQWYsQ0FBMkIsTUFBM0IsRUFBbUMsQ0FBbkMsQ0FBQSxLQUEyQyxDQUFBLEVBRDdCO01BQUEsQ0FIaEIsQ0FBQTtBQUFBLE1BTUEsT0FBQTs7QUFBVTthQUFBLCtDQUFBO2lDQUFBO2dCQUE2QixhQUFBLENBQWMsT0FBZDs7V0FDckM7QUFBQSxVQUFBLFVBQUEsR0FDRTtBQUFBLFlBQUEsT0FBQSxFQUFTLE9BQVQ7QUFBQSxZQUNBLElBQUEsRUFBTSxPQUFPLENBQUMsTUFEZDtBQUFBLFlBRUEsTUFBQSxFQUFRLE1BRlI7QUFBQSxZQUdBLEtBQUEsRUFBTyxPQUFPLENBQUMsSUFIZjtBQUFBLFlBSUEsU0FBQSxFQUFXLElBSlg7V0FERixDQUFBO0FBQUEsd0JBTUEsV0FOQSxDQURRO0FBQUE7O1VBTlYsQ0FBQTtBQWVBLGFBQU8sT0FBUCxDQWhCc0I7SUFBQSxDQWZ4QixDQUFBOzs0QkFBQTs7TUFMRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-snippets/lib/snippets-provider.coffee