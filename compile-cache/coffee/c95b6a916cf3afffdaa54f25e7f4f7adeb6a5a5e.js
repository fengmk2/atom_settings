(function() {
  var CompositeDisposable, FuzzyProvider, Suggestion, TextEditor, fuzzaldrin, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  Suggestion = require('./suggestion');

  fuzzaldrin = require('fuzzaldrin');

  _ref = require('atom'), TextEditor = _ref.TextEditor, CompositeDisposable = _ref.CompositeDisposable;

  module.exports = FuzzyProvider = (function() {
    FuzzyProvider.prototype.wordRegex = /\b\w*[a-zA-Z_-]+\w*\b/g;

    FuzzyProvider.prototype.wordList = null;

    FuzzyProvider.prototype.editor = null;

    FuzzyProvider.prototype.buffer = null;

    function FuzzyProvider() {
      this.dispose = __bind(this.dispose, this);
      this.getCompletionsForCursorScope = __bind(this.getCompletionsForCursorScope, this);
      this.findSuggestionsForWord = __bind(this.findSuggestionsForWord, this);
      this.buildWordList = __bind(this.buildWordList, this);
      this.lastTypedWord = __bind(this.lastTypedWord, this);
      this.addLastWordToList = __bind(this.addLastWordToList, this);
      this.bufferChanged = __bind(this.bufferChanged, this);
      this.bufferSaved = __bind(this.bufferSaved, this);
      this.requestHandler = __bind(this.requestHandler, this);
      this.updateCurrentEditor = __bind(this.updateCurrentEditor, this);
      var builtinProviderBlacklist;
      this.id = 'autocomplete-plus-fuzzyprovider';
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.workspace.observeActivePaneItem(this.updateCurrentEditor));
      this.buildWordList();
      this.selector = '*';
      builtinProviderBlacklist = atom.config.get('autocomplete-plus.builtinProviderBlacklist');
      if ((builtinProviderBlacklist != null) && builtinProviderBlacklist.length) {
        this.blacklist = builtinProviderBlacklist;
      }
    }

    FuzzyProvider.prototype.updateCurrentEditor = function(currentPaneItem) {
      var _ref1, _ref2;
      if (currentPaneItem == null) {
        return;
      }
      if (currentPaneItem === this.editor) {
        return;
      }
      if ((_ref1 = this.bufferSavedSubscription) != null) {
        _ref1.dispose();
      }
      if ((_ref2 = this.bufferChangedSubscription) != null) {
        _ref2.dispose();
      }
      this.editor = null;
      this.buffer = null;
      if (!this.paneItemIsValid(currentPaneItem)) {
        return;
      }
      this.editor = currentPaneItem;
      this.buffer = this.editor.getBuffer();
      this.bufferSavedSubscription = this.buffer.onDidSave(this.bufferSaved);
      this.bufferChangedSubscription = this.buffer.onDidChange(this.bufferChanged);
      return this.buildWordList();
    };

    FuzzyProvider.prototype.paneItemIsValid = function(paneItem) {
      if (paneItem == null) {
        return false;
      }
      return paneItem instanceof TextEditor;
    };

    FuzzyProvider.prototype.requestHandler = function(options) {
      var prefix, selection, suggestions;
      if (options == null) {
        return;
      }
      if (options.editor == null) {
        return;
      }
      selection = options.editor.getLastSelection();
      prefix = options.prefix;
      if (!prefix.length) {
        return;
      }
      suggestions = this.findSuggestionsForWord(prefix);
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };

    FuzzyProvider.prototype.bufferSaved = function() {
      return this.buildWordList();
    };

    FuzzyProvider.prototype.bufferChanged = function(e) {
      var newline, wordChars;
      wordChars = 'ąàáäâãåæăćęèéëêìíïîłńòóöôõøśșțùúüûñçżź' + 'abcdefghijklmnopqrstuvwxyz1234567890';
      if (wordChars.indexOf(e.newText.toLowerCase()) === -1) {
        newline = e.newText === '\n';
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
      this.buffer.scanInRange(this.wordRegex, lineRange, function(_arg) {
        var match, range, stop;
        match = _arg.match, range = _arg.range, stop = _arg.stop;
        return lastWord = match[0];
      });
      return lastWord;
    };

    FuzzyProvider.prototype.buildWordList = function() {
      var editor, editors, matches, minimumWordLength, wordList, _i, _len;
      if (this.editor == null) {
        return;
      }
      wordList = [];
      if (atom.config.get('autocomplete-plus.includeCompletionsFromAllBuffers')) {
        editors = atom.workspace.getEditors();
      } else {
        editors = [this.editor];
      }
      matches = [];
      for (_i = 0, _len = editors.length; _i < _len; _i++) {
        editor = editors[_i];
        matches.push(editor.getText().match(this.wordRegex));
      }
      wordList = _.uniq(_.flatten(matches));
      minimumWordLength = atom.config.get('autocomplete-plus.minimumWordLength');
      if (minimumWordLength) {
        wordList = wordList.filter(function(word) {
          return (word != null ? word.length : void 0) >= minimumWordLength;
        });
      }
      return this.wordList = wordList;
    };

    FuzzyProvider.prototype.findSuggestionsForWord = function(prefix) {
      var results, word, wordList, words;
      if (this.wordList == null) {
        return;
      }
      wordList = this.wordList.concat(this.getCompletionsForCursorScope());
      words = atom.config.get('autocomplete-plus.strictMatching') ? wordList.filter(function(word) {
        return (word != null ? word.indexOf(prefix) : void 0) === 0;
      }) : fuzzaldrin.filter(wordList, prefix);
      results = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = words.length; _i < _len; _i++) {
          word = words[_i];
          if (word !== prefix) {
            _results.push({
              word: word,
              prefix: prefix
            });
          }
        }
        return _results;
      })();
      return results;
    };

    FuzzyProvider.prototype.settingsForScopeDescriptor = function(scopeDescriptor, keyPath) {
      var entries, value, _i, _len, _results;
      if (!(((typeof atom !== "undefined" && atom !== null ? atom.config : void 0) != null) && (scopeDescriptor != null) && (keyPath != null))) {
        return [];
      }
      entries = atom.config.getAll(null, {
        scope: scopeDescriptor
      });
      _results = [];
      for (_i = 0, _len = entries.length; _i < _len; _i++) {
        value = entries[_i].value;
        if (_.valueForKeyPath(value, keyPath) != null) {
          _results.push(value);
        }
      }
      return _results;
    };

    FuzzyProvider.prototype.getCompletionsForCursorScope = function() {
      var completions, cursorScope;
      cursorScope = this.editor.scopeDescriptorForBufferPosition(this.editor.getCursorBufferPosition());
      completions = this.settingsForScopeDescriptor(cursorScope != null ? cursorScope.getScopesArray() : void 0, 'editor.completions');
      completions = completions.map(function(properties) {
        return _.valueForKeyPath(properties, 'editor.completions');
      });
      return _.uniq(_.flatten(completions));
    };

    FuzzyProvider.prototype.dispose = function() {
      var _ref1, _ref2;
      if ((_ref1 = this.bufferSavedSubscription) != null) {
        _ref1.dispose();
      }
      if ((_ref2 = this.bufferChangedSubscription) != null) {
        _ref2.dispose();
      }
      return this.subscriptions.dispose();
    };

    return FuzzyProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtFQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUixDQURiLENBQUE7O0FBQUEsRUFFQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVIsQ0FGYixDQUFBOztBQUFBLEVBR0EsT0FBcUMsT0FBQSxDQUFRLE1BQVIsQ0FBckMsRUFBQyxrQkFBQSxVQUFELEVBQWEsMkJBQUEsbUJBSGIsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw0QkFBQSxTQUFBLEdBQVcsd0JBQVgsQ0FBQTs7QUFBQSw0QkFDQSxRQUFBLEdBQVUsSUFEVixDQUFBOztBQUFBLDRCQUVBLE1BQUEsR0FBUSxJQUZSLENBQUE7O0FBQUEsNEJBR0EsTUFBQSxHQUFRLElBSFIsQ0FBQTs7QUFLYSxJQUFBLHVCQUFBLEdBQUE7QUFDWCwrQ0FBQSxDQUFBO0FBQUEseUZBQUEsQ0FBQTtBQUFBLDZFQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLG1FQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSx1RUFBQSxDQUFBO0FBQUEsVUFBQSx3QkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEVBQUQsR0FBTSxpQ0FBTixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBRGpCLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFmLENBQXFDLElBQUMsQ0FBQSxtQkFBdEMsQ0FB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
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-plus/lib/fuzzy-provider.coffee