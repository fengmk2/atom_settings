(function() {
  var Range, SnippetsLoader, fuzzaldrin,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Range = require('atom').Range;

  fuzzaldrin = require('fuzzaldrin');

  SnippetsLoader = require('./snippets-loader');

  module.exports = {
    ProviderClass: function(Provider, Suggestion) {
      var SnippetsProvider;
      return SnippetsProvider = (function(_super) {
        __extends(SnippetsProvider, _super);

        function SnippetsProvider() {
          this.initialize = __bind(this.initialize, this);
          return SnippetsProvider.__super__.constructor.apply(this, arguments);
        }

        SnippetsProvider.prototype.initialize = function(editor) {
          this.ready = false;
          this.editor = editor;
          this.snippetsLoader = new SnippetsLoader(this.editor);
          return this.snippetsLoader.loadAll((function(_this) {
            return function(snippets) {
              var key, val, _ref;
              _this.snippets = snippets;
              snippets = [];
              _ref = _this.snippets;
              for (key in _ref) {
                val = _ref[key];
                val.label = key;
                snippets.push(val);
              }
              _this.snippets = snippets;
              return _this.ready = true;
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
          if (!this.ready) {
            return;
          }
          selection = this.editor.getLastSelection();
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
              return atom.commands.dispatch(atom.views.getView(_this.editor), 'snippets:expand');
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
          var buffer, cursorPosition, selection, startPosition;
          selection = this.editor.getSelection();
          startPosition = selection.getBufferRange().start;
          buffer = this.editor.getBuffer();
          cursorPosition = this.editor.getCursorBufferPosition();
          buffer["delete"](Range.fromPointWithDelta(cursorPosition, 0, -match.prefix.length));
          return this.editor.insertText(match.word);
        };


        /*
         * Finds possible matches for the given string / prefix
         * @param  {String} prefix
         * @return {Array}
         * @private
         */

        SnippetsProvider.prototype.findSuggestionsForWord = function(prefix) {
          var label, matchesPrefix, results, snippet, word;
          if (this.snippets == null) {
            return [];
          }
          matchesPrefix = function(snippet) {
            return snippet.prefix.lastIndexOf(prefix, 0) !== -1;
          };
          results = (function() {
            var _i, _len, _ref, _results;
            _ref = this.snippets;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              snippet = _ref[_i];
              if (!(matchesPrefix(snippet))) {
                continue;
              }
              word = snippet.prefix;
              label = snippet.label;
              _results.push(new Suggestion(this, {
                word: word,
                prefix: prefix,
                label: label
              }));
            }
            return _results;
          }).call(this);
          return results;
        };

        return SnippetsProvider;

      })(Provider);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsUUFBVSxPQUFBLENBQVEsTUFBUixFQUFWLEtBQUQsQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQURiLENBQUE7O0FBQUEsRUFFQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxtQkFBUixDQUZqQixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDQTtBQUFBLElBQUEsYUFBQSxFQUFlLFNBQUMsUUFBRCxFQUFXLFVBQVgsR0FBQTtBQUNiLFVBQUEsZ0JBQUE7YUFBTTtBQUNKLDJDQUFBLENBQUE7Ozs7O1NBQUE7O0FBQUEsbUNBQUEsVUFBQSxHQUFZLFNBQUMsTUFBRCxHQUFBO0FBQ1YsVUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLEtBQVQsQ0FBQTtBQUFBLFVBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQURWLENBQUE7QUFBQSxVQUVBLElBQUMsQ0FBQSxjQUFELEdBQXNCLElBQUEsY0FBQSxDQUFlLElBQUMsQ0FBQSxNQUFoQixDQUZ0QixDQUFBO2lCQUdBLElBQUMsQ0FBQSxjQUFjLENBQUMsT0FBaEIsQ0FBd0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTttQkFBQSxTQUFFLFFBQUYsR0FBQTtBQUV0QixrQkFBQSxjQUFBO0FBQUEsY0FGdUIsS0FBQyxDQUFBLFdBQUEsUUFFeEIsQ0FBQTtBQUFBLGNBQUEsUUFBQSxHQUFXLEVBQVgsQ0FBQTtBQUNBO0FBQUEsbUJBQUEsV0FBQTtnQ0FBQTtBQUNFLGdCQUFBLEdBQUcsQ0FBQyxLQUFKLEdBQVksR0FBWixDQUFBO0FBQUEsZ0JBQ0EsUUFBUSxDQUFDLElBQVQsQ0FBYyxHQUFkLENBREEsQ0FERjtBQUFBLGVBREE7QUFBQSxjQUlBLEtBQUMsQ0FB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
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-snippets/lib/snippets-provider.coffee