(function() {
  var AutocompleteManager, CompositeDisposable, Disposable, ProviderManager, Range, SuggestionList, SuggestionListElement, TextEditor, minimatch, path, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), Range = _ref.Range, TextEditor = _ref.TextEditor, CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  _ = require('underscore-plus');

  minimatch = require('minimatch');

  path = require('path');

  ProviderManager = require('./provider-manager');

  SuggestionList = require('./suggestion-list');

  SuggestionListElement = require('./suggestion-list-element');

  module.exports = AutocompleteManager = (function() {
    AutocompleteManager.prototype.autosaveEnabled = false;

    AutocompleteManager.prototype.backspaceTriggersAutocomplete = true;

    AutocompleteManager.prototype.buffer = null;

    AutocompleteManager.prototype.compositionInProgress = false;

    AutocompleteManager.prototype.disposed = false;

    AutocompleteManager.prototype.editor = null;

    AutocompleteManager.prototype.editorSubscriptions = null;

    AutocompleteManager.prototype.editorView = null;

    AutocompleteManager.prototype.providerManager = null;

    AutocompleteManager.prototype.ready = false;

    AutocompleteManager.prototype.subscriptions = null;

    AutocompleteManager.prototype.suggestionDelay = 50;

    AutocompleteManager.prototype.suggestionList = null;

    AutocompleteManager.prototype.shouldDisplaySuggestions = false;

    function AutocompleteManager() {
      this.dispose = __bind(this.dispose, this);
      this.bufferChanged = __bind(this.bufferChanged, this);
      this.bufferSaved = __bind(this.bufferSaved, this);
      this.cursorMoved = __bind(this.cursorMoved, this);
      this.requestNewSuggestions = __bind(this.requestNewSuggestions, this);
      this.isCurrentFileBlackListed = __bind(this.isCurrentFileBlackListed, this);
      this.replaceTextWithMatch = __bind(this.replaceTextWithMatch, this);
      this.hideSuggestionList = __bind(this.hideSuggestionList, this);
      this.confirm = __bind(this.confirm, this);
      this.prefixForCursor = __bind(this.prefixForCursor, this);
      this.displaySuggestions = __bind(this.displaySuggestions, this);
      this.getSuggestionsFromProviders = __bind(this.getSuggestionsFromProviders, this);
      this.findSuggestions = __bind(this.findSuggestions, this);
      this.handleCommands = __bind(this.handleCommands, this);
      this.handleEvents = __bind(this.handleEvents, this);
      this.updateCurrentEditor = __bind(this.updateCurrentEditor, this);
      this.subscriptions = new CompositeDisposable;
      this.providerManager = new ProviderManager;
      this.suggestionList = new SuggestionList;
      this.subscriptions.add(this.providerManager);
      this.subscriptions.add(atom.views.addViewProvider(SuggestionList, function(model) {
        return new SuggestionListElement().initialize(model);
      }));
      this.handleEvents();
      this.handleCommands();
      this.subscriptions.add(this.suggestionList);
      this.ready = true;
    }

    AutocompleteManager.prototype.updateCurrentEditor = function(currentPaneItem) {
      var compositionEnd, compositionStart, _ref1;
      if ((currentPaneItem == null) || currentPaneItem === this.editor) {
        return;
      }
      if ((_ref1 = this.editorSubscriptions) != null) {
        _ref1.dispose();
      }
      this.editorSubscriptions = null;
      this.editor = null;
      this.editorView = null;
      this.buffer = null;
      if (!this.paneItemIsValid(currentPaneItem)) {
        return;
      }
      this.editor = currentPaneItem;
      this.editorView = atom.views.getView(this.editor);
      this.buffer = this.editor.getBuffer();
      this.editorSubscriptions = new CompositeDisposable;
      this.editorSubscriptions.add(this.buffer.onDidSave(this.bufferSaved));
      this.editorSubscriptions.add(this.buffer.onDidChange(this.bufferChanged));
      compositionStart = (function(_this) {
        return function() {
          return _this.compositionInProgress = true;
        };
      })(this);
      compositionEnd = (function(_this) {
        return function() {
          return _this.compositionInProgress = false;
        };
      })(this);
      this.editorView.addEventListener('compositionstart', compositionStart);
      this.editorView.addEventListener('compositionend', compositionEnd);
      this.editorSubscriptions.add(new Disposable(function() {
        var _ref2, _ref3;
        if ((_ref2 = this.editorView) != null) {
          _ref2.removeEventListener('compositionstart', compositionStart);
        }
        return (_ref3 = this.editorView) != null ? _ref3.removeEventListener('compositionend', compositionEnd) : void 0;
      }));
      return this.editorSubscriptions.add(this.editor.onDidChangeCursorPosition(this.cursorMoved));
    };

    AutocompleteManager.prototype.paneItemIsValid = function(paneItem) {
      if (paneItem == null) {
        return false;
      }
      return paneItem instanceof TextEditor;
    };

    AutocompleteManager.prototype.handleEvents = function() {
      this.subscriptions.add(atom.workspace.observeActivePaneItem(this.updateCurrentEditor));
      this.subscriptions.add(atom.config.observe('autosave.enabled', (function(_this) {
        return function(value) {
          return _this.autosaveEnabled = value;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.backspaceTriggersAutocomplete', (function(_this) {
        return function(value) {
          return _this.backspaceTriggersAutocomplete = value;
        };
      })(this)));
      this.subscriptions.add(this.suggestionList.onDidConfirm(this.confirm));
      return this.subscriptions.add(this.suggestionList.onDidCancel(this.hideSuggestionList));
    };

    AutocompleteManager.prototype.handleCommands = function() {
      return this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'autocomplete-plus:activate': (function(_this) {
          return function() {
            _this.shouldDisplaySuggestions = true;
            return _this.findSuggestions();
          };
        })(this)
      }));
    };

    AutocompleteManager.prototype.findSuggestions = function() {
      var currentScope, currentScopeChain, cursor, cursorPosition, options;
      if (this.disposed) {
        return;
      }
      if (!((this.providerManager != null) && (this.editor != null) && (this.buffer != null))) {
        return;
      }
      if (this.isCurrentFileBlackListed()) {
        return;
      }
      cursor = this.editor.getLastCursor();
      if (cursor == null) {
        return;
      }
      cursorPosition = cursor.getBufferPosition();
      currentScope = cursor.getScopeDescriptor();
      if (currentScope == null) {
        return;
      }
      currentScopeChain = currentScope.getScopeChain();
      if (currentScopeChain == null) {
        return;
      }
      options = {
        editor: this.editor,
        buffer: this.buffer,
        cursor: cursor,
        position: cursorPosition,
        scope: currentScope,
        scopeChain: currentScopeChain,
        prefix: this.prefixForCursor(cursor)
      };
      return this.getSuggestionsFromProviders(options);
    };

    AutocompleteManager.prototype.getSuggestionsFromProviders = function(options) {
      var providerPromises, providers, suggestionsPromise;
      providers = this.providerManager.providersForScopeChain(options.scopeChain);
      providerPromises = providers != null ? providers.map(function(provider) {
        return provider != null ? provider.requestHandler(options) : void 0;
      }) : void 0;
      if (!(providerPromises != null ? providerPromises.length : void 0)) {
        return;
      }
      return this.currentSuggestionsPromise = suggestionsPromise = Promise.all(providerPromises).then(this.mergeSuggestionsFromProviders).then((function(_this) {
        return function(suggestions) {
          if (_this.currentSuggestionsPromise === suggestionsPromise) {
            return _this.displaySuggestions(suggestions, options);
          }
        };
      })(this));
    };

    AutocompleteManager.prototype.mergeSuggestionsFromProviders = function(providerSuggestions) {
      return providerSuggestions.reduce(function(suggestions, providerSuggestions) {
        if (providerSuggestions != null ? providerSuggestions.length : void 0) {
          suggestions = suggestions.concat(providerSuggestions);
        }
        return suggestions;
      }, []);
    };

    AutocompleteManager.prototype.displaySuggestions = function(suggestions, options) {
      suggestions = _.uniq(suggestions, function(s) {
        return s.word;
      });
      if (this.shouldDisplaySuggestions && suggestions.length) {
        return this.showSuggestionList(suggestions);
      } else {
        return this.hideSuggestionList();
      }
    };

    AutocompleteManager.prototype.prefixForCursor = function(cursor) {
      var end, start;
      if (!((this.buffer != null) && (cursor != null))) {
        return '';
      }
      start = cursor.getBeginningOfCurrentWordBufferPosition();
      end = cursor.getBufferPosition();
      if (!((start != null) && (end != null))) {
        return '';
      }
      return this.buffer.getTextInRange(new Range(start, end));
    };

    AutocompleteManager.prototype.confirm = function(match) {
      var _ref1;
      if (!((this.editor != null) && (match != null) && !this.disposed)) {
        return;
      }
      if (typeof match.onWillConfirm === "function") {
        match.onWillConfirm();
      }
      if ((_ref1 = this.editor.getSelections()) != null) {
        _ref1.forEach(function(selection) {
          return selection != null ? selection.clear() : void 0;
        });
      }
      this.hideSuggestionList();
      this.replaceTextWithMatch(match);
      if (match.isSnippet) {
        setTimeout((function(_this) {
          return function() {
            return atom.commands.dispatch(atom.views.getView(_this.editor), 'snippets:expand');
          };
        })(this), 1);
      }
      return typeof match.onDidConfirm === "function" ? match.onDidConfirm() : void 0;
    };

    AutocompleteManager.prototype.showSuggestionList = function(suggestions) {
      if (this.disposed) {
        return;
      }
      this.suggestionList.changeItems(suggestions);
      return this.suggestionList.show(this.editor);
    };

    AutocompleteManager.prototype.hideSuggestionList = function() {
      if (this.disposed) {
        return;
      }
      this.suggestionList.hide();
      return this.shouldDisplaySuggestions = false;
    };

    AutocompleteManager.prototype.requestHideSuggestionList = function(command) {
      this.hideTimeout = setTimeout(this.hideSuggestionList, 0);
      return this.shouldDisplaySuggestions = false;
    };

    AutocompleteManager.prototype.cancelHideSuggestionListRequest = function() {
      return clearTimeout(this.hideTimeout);
    };

    AutocompleteManager.prototype.replaceTextWithMatch = function(match) {
      var newSelectedBufferRanges, selections;
      if (this.editor == null) {
        return;
      }
      newSelectedBufferRanges = [];
      selections = this.editor.getSelections();
      if (selections == null) {
        return;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var _ref1;
          if (((_ref1 = match.prefix) != null ? _ref1.length : void 0) > 0) {
            _this.editor.selectLeft(match.prefix.length);
            _this.editor["delete"]();
          }
          return _this.editor.insertText(match.word);
        };
      })(this));
    };

    AutocompleteManager.prototype.isCurrentFileBlackListed = function() {
      var blacklist, blacklistGlob, fileName, _i, _len, _ref1;
      blacklist = (_ref1 = atom.config.get('autocomplete-plus.fileBlacklist')) != null ? _ref1.map(function(s) {
        return s.trim();
      }) : void 0;
      if (!((blacklist != null) && blacklist.length)) {
        return false;
      }
      fileName = path.basename(this.buffer.getPath());
      for (_i = 0, _len = blacklist.length; _i < _len; _i++) {
        blacklistGlob = blacklist[_i];
        if (minimatch(fileName, blacklistGlob)) {
          return true;
        }
      }
      return false;
    };

    AutocompleteManager.prototype.requestNewSuggestions = function() {
      var delay;
      delay = atom.config.get('autocomplete-plus.autoActivationDelay');
      clearTimeout(this.delayTimeout);
      if (this.suggestionList.isActive()) {
        delay = this.suggestionDelay;
      }
      this.delayTimeout = setTimeout(this.findSuggestions, delay);
      return this.shouldDisplaySuggestions = true;
    };

    AutocompleteManager.prototype.cancelNewSuggestionsRequest = function() {
      clearTimeout(this.delayTimeout);
      return this.shouldDisplaySuggestions = false;
    };

    AutocompleteManager.prototype.cursorMoved = function(_arg) {
      var textChanged;
      textChanged = _arg.textChanged;
      if (!textChanged) {
        return this.requestHideSuggestionList();
      }
    };

    AutocompleteManager.prototype.bufferSaved = function() {
      if (!this.autosaveEnabled) {
        return this.hideSuggestionList();
      }
    };

    AutocompleteManager.prototype.bufferChanged = function(_arg) {
      var autoActivationEnabled, newText, oldText, wouldAutoActivate;
      newText = _arg.newText, oldText = _arg.oldText;
      if (this.disposed) {
        return;
      }
      if (this.compositionInProgress) {
        return this.hideSuggestionList();
      }
      autoActivationEnabled = atom.config.get('autocomplete-plus.enableAutoActivation');
      wouldAutoActivate = newText.trim().length === 1 || ((this.backspaceTriggersAutocomplete || this.suggestionList.isActive()) && oldText.trim().length === 1);
      if (autoActivationEnabled && wouldAutoActivate) {
        this.cancelHideSuggestionListRequest();
        return this.requestNewSuggestions();
      } else {
        this.cancelNewSuggestionsRequest();
        return this.hideSuggestionList();
      }
    };

    AutocompleteManager.prototype.dispose = function() {
      var _ref1, _ref2;
      this.hideSuggestionList();
      this.disposed = true;
      this.ready = false;
      if ((_ref1 = this.editorSubscriptions) != null) {
        _ref1.dispose();
      }
      this.editorSubscriptions = null;
      if ((_ref2 = this.subscriptions) != null) {
        _ref2.dispose();
      }
      this.subscriptions = null;
      this.suggestionList = null;
      return this.providerManager = null;
    };

    return AutocompleteManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlKQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxPQUF3RCxPQUFBLENBQVEsTUFBUixDQUF4RCxFQUFDLGFBQUEsS0FBRCxFQUFRLGtCQUFBLFVBQVIsRUFBb0IsMkJBQUEsbUJBQXBCLEVBQXlDLGtCQUFBLFVBQXpDLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUVBLFNBQUEsR0FBWSxPQUFBLENBQVEsV0FBUixDQUZaLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVIsQ0FKbEIsQ0FBQTs7QUFBQSxFQUtBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSLENBTGpCLENBQUE7O0FBQUEsRUFNQSxxQkFBQSxHQUF3QixPQUFBLENBQVEsMkJBQVIsQ0FOeEIsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixrQ0FBQSxlQUFBLEdBQWlCLEtBQWpCLENBQUE7O0FBQUEsa0NBQ0EsNkJBQUEsR0FBK0IsSUFEL0IsQ0FBQTs7QUFBQSxrQ0FFQSxNQUFBLEdBQVEsSUFGUixDQUFBOztBQUFBLGtDQUdBLHFCQUFBLEdBQXVCLEtBSHZCLENBQUE7O0FBQUEsa0NBSUEsUUFBQSxHQUFVLEtBSlYsQ0FBQTs7QUFBQSxrQ0FLQSxNQUFBLEdBQVEsSUFMUixDQUFBOztBQUFBLGtDQU1BLG1CQUFBLEdBQXFCLElBTnJCLENBQUE7O0FBQUEsa0NBT0EsVUFBQSxHQUFZLElBUFosQ0FBQTs7QUFBQSxrQ0FRQSxlQUFBLEdBQWlCLElBUmpCLENBQUE7O0FBQUEsa0NBU0EsS0FBQSxHQUFPLEtBVFAsQ0FB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
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-plus/lib/autocomplete-manager.coffee