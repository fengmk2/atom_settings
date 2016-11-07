(function() {
  var FuzzyProvider, Provider, Suggestion, fuzzaldrin, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  Suggestion = require('./suggestion');

  fuzzaldrin = require('fuzzaldrin');

  Provider = require('./provider');

  module.exports = FuzzyProvider = (function(_super) {
    __extends(FuzzyProvider, _super);

    function FuzzyProvider() {
      this.onChanged = __bind(this.onChanged, this);
      this.onSaved = __bind(this.onSaved, this);
      return FuzzyProvider.__super__.constructor.apply(this, arguments);
    }

    FuzzyProvider.prototype.wordList = null;

    FuzzyProvider.prototype.debug = false;

    FuzzyProvider.prototype.initialize = function() {
      this.buildWordList();
      this.currentBuffer = this.editor.getBuffer();
      return this.disposableEvents = [this.currentBuffer.onDidSave(this.onSaved), this.currentBuffer.onDidChange(this.onChanged)];
    };

    FuzzyProvider.prototype.buildSuggestions = function() {
      var prefix, selection, suggestions;
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

    FuzzyProvider.prototype.confirm = function(item) {
      return true;
    };

    FuzzyProvider.prototype.onSaved = function() {
      return this.buildWordList();
    };

    FuzzyProvider.prototype.onChanged = function(e) {
      var newline, wordChars;
      wordChars = "ąàáäâãåæăćęèéëêìíïîłńòóöôõøśșțùúüûñçżź" + "abcdefghijklmnopqrstuvwxyz1234567890";
      if (wordChars.indexOf(e.newText.toLowerCase()) === -1) {
        newline = e.newText === "\n";
        return this.addLastWordToList(e.newRange.start.row, e.newRange.start.column, newline);
      }
    };

    FuzzyProvider.prototype.addLastWordToList = function(row, column, newline) {
      var lastWord;
      lastWord = this.lastTypedWord(row, column, newline);
      if (!lastWord) {
        return;
      }
      if (this.wordList.indexOf(lastWord) < 0) {
        return this.wordList.push(lastWord);
      }
    };

    FuzzyProvider.prototype.lastTypedWord = function(row, column, newline) {
      var lastWord, lineRange, maxColumn;
      if (newline) {
        if (!(column = 0)) {
          maxColumn = column - 1;
        }
      } else {
        maxColumn = column;
      }
      lineRange = [[row, 0], [row, column]];
      lastWord = null;
      this.currentBuffer.scanInRange(this.wordRegex, lineRange, function(_arg) {
        var match, range, stop;
        match = _arg.match, range = _arg.range, stop = _arg.stop;
        return lastWord = match[0];
      });
      return lastWord;
    };

    FuzzyProvider.prototype.buildWordList = function() {
      var buffer, buffers, matches, minimumWordLength, wordList, _i, _len;
      wordList = [];
      if (atom.config.get("autocomplete-plus.includeCompletionsFromAllBuffers")) {
        buffers = atom.project.getBuffers();
      } else {
        buffers = [this.editor.getBuffer()];
      }
      matches = [];
      for (_i = 0, _len = buffers.length; _i < _len; _i++) {
        buffer = buffers[_i];
        matches.push(buffer.getText().match(this.wordRegex));
      }
      wordList = _.uniq(_.flatten(matches));
      minimumWordLength = atom.config.get("autocomplete-plus.minimumWordLength");
      if (minimumWordLength) {
        wordList = wordList.filter(function(word) {
          return (word != null ? word.length : void 0) >= minimumWordLength;
        });
      }
      return this.wordList = wordList;
    };

    FuzzyProvider.prototype.findSuggestionsForWord = function(prefix) {
      var results, word, wordList, words;
      wordList = this.wordList.concat(this.getCompletionsForCursorScope());
      words = atom.config.get("autocomplete-plus.strictMatching") ? this.wordList.filter(function(word) {
        return word.indexOf(prefix) === 0;
      }) : fuzzaldrin.filter(wordList, prefix);
      results = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = words.length; _i < _len; _i++) {
          word = words[_i];
          if (word !== prefix) {
            _results.push(new Suggestion(this, {
              word: word,
              prefix: prefix
            }));
          }
        }
        return _results;
      }).call(this);
      return results;
    };

    FuzzyProvider.prototype.getCompletionsForCursorScope = function() {
      var completions, cursorScope;
      cursorScope = this.editor.scopeDescriptorForBufferPosition(this.editor.getCursorBufferPosition());
      completions = atom.config.settingsForScopeDescriptor(cursorScope.getScopesArray(), "editor.completions");
      completions = completions.map(function(properties) {
        return _.valueForKeyPath(properties, "editor.completions");
      });
      return _.uniq(_.flatten(completions));
    };

    FuzzyProvider.prototype.dispose = function() {
      var disposable, _i, _len, _ref, _results;
      _ref = this.disposableEvents;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        disposable = _ref[_i];
        _results.push(disposable.dispose());
      }
      return _results;
    };

    return FuzzyProvider;

  })(Provider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FEYixDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSLENBRmIsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUhYLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osb0NBQUEsQ0FBQTs7Ozs7O0tBQUE7O0FBQUEsNEJBQUEsUUFBQSxHQUFVLElBQVYsQ0FBQTs7QUFBQSw0QkFDQSxLQUFBLEdBQU8sS0FEUCxDQUFBOztBQUFBLDRCQUdBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQUZqQixDQUFBO2FBR0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLENBQ2xCLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBZixDQUF5QixJQUFDLENBQUEsT0FBMUIsQ0FEa0IsRUFFbEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxXQUFmLENBQTJCLElBQUMsQ0FBQSxTQUE1QixDQUZrQixFQUpWO0lBQUEsQ0FIWixDQUFBOztBQUFBLDRCQWlCQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDaEIsVUFBQSw4QkFBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQSxDQUFaLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEs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
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-plus/lib/fuzzy-provider.coffee