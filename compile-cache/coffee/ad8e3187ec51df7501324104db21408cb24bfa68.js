(function() {
  var Provider, Range, SnippetsLoader, SnippetsProvider, Suggestion, fuzzaldrin, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Range = require("atom").Range;

  _ref = require("autocomplete-plus"), Provider = _ref.Provider, Suggestion = _ref.Suggestion;

  fuzzaldrin = require("fuzzaldrin");

  _ = require("underscore-plus");

  SnippetsLoader = require("./snippets-loader");

  module.exports = SnippetsProvider = (function(_super) {
    __extends(SnippetsProvider, _super);

    function SnippetsProvider() {
      return SnippetsProvider.__super__.constructor.apply(this, arguments);
    }

    SnippetsProvider.prototype.initialize = function() {
      this.snippetsLoader = new SnippetsLoader(this.editor);
      return this.snippetsLoader.loadAll((function(_this) {
        return function(snippets) {
          var key, val, _ref1;
          _this.snippets = snippets;
          snippets = [];
          _ref1 = _this.snippets;
          for (key in _ref1) {
            val = _ref1[key];
            val.label = key;
            snippets.push(val);
          }
          return _this.snippets = snippets;
        };
      })(this));
    };


    /*
     * Gets called when the document has been changed. Returns an array with
     * suggestions. If `exclusive` is set to true and this method returns suggestions,
     * the suggestions will be the only ones that are displayed.
     * @return {Array}
     * @public
     */

    SnippetsProvider.prototype.buildSuggestions = function() {
      var prefix, selection, suggestions;
      selection = this.editor.getSelection();
      prefix = this.prefixOfSelection(selection);
      if (!prefix.length) {
        return;
      }
      suggestions = this.findSuggestionsForWord(prefix);
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };


    /*
     * Gets called when a suggestion has been confirmed by the user. Return true
     * to replace the word with the suggestion. Return false if you want to handle
     * the behavior yourself.
     * @param  {Suggestion} suggestion
     * @return {Boolean}
     * @public
     */

    SnippetsProvider.prototype.confirm = function(suggestion) {
      this.replaceTextWithMatch(suggestion);
      setTimeout((function(_this) {
        return function() {
          return _this.editorView.trigger("snippets:expand");
        };
      })(this), 1);
      return false;
    };


    /*
     * Replaces the current prefix with the given match
     * @param {Object} match
     * @private
     */

    SnippetsProvider.prototype.replaceTextWithMatch = function(match) {
      var buffer, cursorPosition, selection, startPosition, suffixLength;
      selection = this.editor.getSelection();
      startPosition = selection.getBufferRange().start;
      buffer = this.editor.getBuffer();
      cursorPosition = this.editor.getCursorBufferPosition();
      buffer["delete"](Range.fromPointWithDelta(cursorPosition, 0, -match.prefix.length));
      this.editor.insertText(match.word);
      suffixLength = match.word.length - match.prefix.length;
      return this.editor.setSelectedBufferRange([startPosition, [startPosition.row, startPosition.column + suffixLength]]);
    };


    /*
     * Finds possible matches for the given string / prefix
     * @param  {String} prefix
     * @return {Array}
     * @private
     */

    SnippetsProvider.prototype.findSuggestionsForWord = function(prefix) {
      var prefixes, results, snippet, snippetsByPrefixes, word, words;
      if (this.snippets == null) {
        return [];
      }
      snippetsByPrefixes = {};
      prefixes = _.values(this.snippets).map(function(snippet) {
        snippetsByPrefixes[snippet.prefix] = snippet;
        return snippet.prefix;
      });
      words = fuzzaldrin.filter(prefixes, prefix);
      results = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = words.length; _i < _len; _i++) {
          word = words[_i];
          snippet = snippetsByPrefixes[word];
          _results.push(new Suggestion(this, {
            word: word,
            prefix: prefix,
            label: snippet.label
          }));
        }
        return _results;
      }).call(this);
      return results;
    };

    return SnippetsProvider;

  })(Provider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtGQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxRQUFVLE9BQUEsQ0FBUSxNQUFSLEVBQVYsS0FBRCxDQUFBOztBQUFBLEVBQ0EsT0FBeUIsT0FBQSxDQUFRLG1CQUFSLENBQXpCLEVBQUMsZ0JBQUEsUUFBRCxFQUFXLGtCQUFBLFVBRFgsQ0FBQTs7QUFBQSxFQUVBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQUZiLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBSEosQ0FBQTs7QUFBQSxFQUlBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSLENBSmpCLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLCtCQUFBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxjQUFELEdBQXNCLElBQUEsY0FBQSxDQUFlLElBQUMsQ0FBQSxNQUFoQixDQUF0QixDQUFBO2FBQ0EsSUFBQyxDQUFBLGNBQWMsQ0FBQyxPQUFoQixDQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBRSxRQUFGLEdBQUE7QUFFdEIsY0FBQSxlQUFBO0FBQUEsVUFGdUIsS0FBQyxDQUFBLFdBQUEsUUFFeEIsQ0FBQTtBQUFBLFVBQUEsUUFBQSxHQUFXLEVBQVgsQ0FBQTtBQUNBO0FBQUEsZUFBQSxZQUFBOzZCQUFBO0FBQ0UsWUFBQSxHQUFHLENBQUMsS0FBSixHQUFZLEdBQVosQ0FBQTtBQUFBLFlBQ0EsUUFBUSxDQUFDLElBQVQsQ0FBYyxHQUFkLENBREEsQ0FERjtBQUFBLFdBREE7aUJBSUEsS0FBQyxDQUFBLFFBQUQsR0FBWSxTQU5VO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FB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
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-snippets/lib/snippets-provider.coffee