(function() {
  var AutocompleteManager, CompositeDisposable, Emitter, FuzzyProvider, Range, minimatch, path, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Range = require('atom').Range;

  _ref = require('event-kit'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  _ = require('underscore-plus');

  path = require('path');

  minimatch = require('minimatch');

  FuzzyProvider = require('./fuzzy-provider');

  module.exports = AutocompleteManager = (function() {
    AutocompleteManager.prototype.currentBuffer = null;

    AutocompleteManager.prototype.debug = false;

    function AutocompleteManager(editor) {
      this.editor = editor;
      this.editorChanged = __bind(this.editorChanged, this);
      this.editorSaved = __bind(this.editorSaved, this);
      this.editorHasFocus = __bind(this.editorHasFocus, this);
      this.cursorMoved = __bind(this.cursorMoved, this);
      this.contentsModified = __bind(this.contentsModified, this);
      this.runAutocompletion = __bind(this.runAutocompletion, this);
      this.cancel = __bind(this.cancel, this);
      this.selectPrevious = __bind(this.selectPrevious, this);
      this.selectNext = __bind(this.selectNext, this);
      this.confirmSelection = __bind(this.confirmSelection, this);
      this.updateCurrentEditor = __bind(this.updateCurrentEditor, this);
      this.editorView = atom.views.getView(this.editor);
      this.compositeDisposable = new CompositeDisposable;
      this.emitter = new Emitter;
      this.providers = [];
      if (this.currentFileBlacklisted()) {
        return;
      }
      this.registerProvider(new FuzzyProvider(this.editor));
      this.handleEvents();
      this.setCurrentBuffer(this.editor.getBuffer());
      this.compositeDisposable.add(atom.workspace.observeActivePaneItem(this.updateCurrentEditor));
      this.compositeDisposable.add(atom.commands.add('atom-text-editor', {
        "autocomplete-plus:activate": this.runAutocompletion
      }));
      this.compositeDisposable.add(atom.commands.add('autocomplete-suggestion-list', {
        "autocomplete-plus:confirm": this.confirmSelection,
        "autocomplete-plus:select-next": this.selectNext,
        "autocomplete-plus:select-previous": this.selectPrevious,
        "autocomplete-plus:cancel": this.cancel
      }));
    }

    AutocompleteManager.prototype.addKeyboardInteraction = function() {
      var completionKey, keys, navigationKey, _ref1;
      this.removeKeyboardInteraction();
      keys = {
        "escape": "autocomplete-plus:cancel"
      };
      completionKey = atom.config.get("autocomplete-plus.confirmCompletion") || '';
      navigationKey = atom.config.get("autocomplete-plus.navigateCompletions") || '';
      if (completionKey.indexOf('tab') > -1) {
        keys['tab'] = "autocomplete-plus:confirm";
      }
      if (completionKey.indexOf('enter') > -1) {
        keys['enter'] = "autocomplete-plus:confirm";
      }
      if (((_ref1 = this.items) != null ? _ref1.length : void 0) > 1 && navigationKey === "up,down") {
        keys['up'] = "autocomplete-plus:select-previous";
        keys['down'] = "autocomplete-plus:select-next";
      } else {
        keys["ctrl-n"] = "autocomplete-plus:select-next";
        keys["ctrl-p"] = "autocomplete-plus:select-previous";
      }
      this.keymaps = atom.keymaps.add('AutocompleteManager', {
        'atom-text-editor:not(.mini) .autocomplete-plus': keys
      });
      return this.compositeDisposable.add(this.keymaps);
    };

    AutocompleteManager.prototype.removeKeyboardInteraction = function() {
      var _ref1;
      if ((_ref1 = this.keymaps) != null) {
        _ref1.dispose();
      }
      return this.compositeDisposable.remove(this.keymaps);
    };

    AutocompleteManager.prototype.updateCurrentEditor = function(currentPaneItem) {
      if (currentPaneItem !== this.editor) {
        return this.cancel();
      }
    };

    AutocompleteManager.prototype.confirmSelection = function() {
      return this.emitter.emit('do-confirm-selection');
    };

    AutocompleteManager.prototype.onDoConfirmSelection = function(cb) {
      return this.emitter.on('do-confirm-selection', cb);
    };

    AutocompleteManager.prototype.selectNext = function() {
      return this.emitter.emit('do-select-next');
    };

    AutocompleteManager.prototype.onDoSelectNext = function(cb) {
      return this.emitter.on('do-select-next', cb);
    };

    AutocompleteManager.prototype.selectPrevious = function() {
      return this.emitter.emit('do-select-previous');
    };

    AutocompleteManager.prototype.onDoSelectPrevious = function(cb) {
      return this.emitter.on('do-select-previous', cb);
    };

    AutocompleteManager.prototype.currentFileBlacklisted = function() {
      var blacklist, blacklistGlob, fileName, _i, _len;
      blacklist = (atom.config.get("autocomplete-plus.fileBlacklist") || "").split(",").map(function(s) {
        return s.trim();
      });
      fileName = path.basename(this.editor.getBuffer().getPath());
      for (_i = 0, _len = blacklist.length; _i < _len; _i++) {
        blacklistGlob = blacklist[_i];
        if (minimatch(fileName, blacklistGlob)) {
          return true;
        }
      }
      return false;
    };

    AutocompleteManager.prototype.handleEvents = function() {
      this.compositeDisposable.add(this.editor.onDidChangeCursorPosition(this.cursorMoved));
      return this.compositeDisposable.add(this.editor.onDidChangeTitle(this.cancel));
    };

    AutocompleteManager.prototype.registerProvider = function(provider) {
      if (_.findWhere(this.providers, provider) == null) {
        this.providers.push(provider);
        if (provider.dispose != null) {
          return this.compositeDisposable.add(provider);
        }
      }
    };

    AutocompleteManager.prototype.unregisterProvider = function(provider) {
      _.remove(this.providers, provider);
      return this.compositeDisposable.remove(provider);
    };

    AutocompleteManager.prototype.confirm = function(match) {
      var replace, _ref1, _ref2;
      if (!this.editorHasFocus()) {
        return;
      }
      if ((match != null ? match.provider : void 0) == null) {
        return;
      }
      if (this.editor == null) {
        return;
      }
      replace = match.provider.confirm(match);
      if ((_ref1 = this.editor.getSelections()) != null) {
        _ref1.forEach(function(selection) {
          return selection != null ? selection.clear() : void 0;
        });
      }
      this.cancel();
      if (!replace) {
        return;
      }
      this.replaceTextWithMatch(match);
      return (_ref2 = this.editor.getCursors()) != null ? _ref2.forEach(function(cursor) {
        var position;
        position = cursor != null ? cursor.getBufferPosition() : void 0;
        if (position != null) {
          return cursor.setBufferPosition([position.row, position.column]);
        }
      }) : void 0;
    };

    AutocompleteManager.prototype.cancel = function() {
      var _ref1;
      if (!this.active) {
        return;
      }
      if ((_ref1 = this.overlayDecoration) != null) {
        _ref1.destroy();
      }
      this.overlayDecoration = void 0;
      this.removeKeyboardInteraction();
      this.editorView.focus();
      return this.active = false;
    };

    AutocompleteManager.prototype.runAutocompletion = function() {
      var buffer, marker, options, provider, providerSuggestions, suggestions, _i, _len, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
      this.cancel();
      this.originalSelectionBufferRanges = this.editor.getSelections().map(function(selection) {
        return selection.getBufferRange();
      });
      this.originalCursorPosition = this.editor.getCursorScreenPosition();
      if (this.originalCursorPosition == null) {
        return;
      }
      buffer = (_ref1 = this.editor) != null ? _ref1.getBuffer() : void 0;
      if (buffer == null) {
        return;
      }
      options = {
        path: buffer.getPath(),
        text: buffer.getText(),
        pos: this.originalCursorPosition
      };
      suggestions = [];
      _ref4 = (_ref2 = this.providers) != null ? (_ref3 = _ref2.slice()) != null ? _ref3.reverse() : void 0 : void 0;
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        provider = _ref4[_i];
        providerSuggestions = provider != null ? provider.buildSuggestions(options) : void 0;
        if (!(providerSuggestions != null ? providerSuggestions.length : void 0)) {
          continue;
        }
        if (provider.exclusive) {
          suggestions = providerSuggestions;
          break;
        } else {
          suggestions = suggestions.concat(providerSuggestions);
        }
      }
      if (!suggestions.length) {
        return;
      }
      if (this.overlayDecoration == null) {
        marker = (_ref5 = this.editor.getLastCursor()) != null ? _ref5.getMarker() : void 0;
        this.overlayDecoration = (_ref6 = this.editor) != null ? _ref6.decorateMarker(marker, {
          type: 'overlay',
          item: this
        }) : void 0;
      }
      this.changeItems(suggestions);
      return this.setActive();
    };

    AutocompleteManager.prototype.changeItems = function(items) {
      this.items = items;
      return this.emitter.emit('did-change-items', items);
    };

    AutocompleteManager.prototype.onDidChangeItems = function(cb) {
      return this.emitter.on('did-change-items', cb);
    };

    AutocompleteManager.prototype.setActive = function() {
      this.addKeyboardInteraction();
      return this.active = true;
    };

    AutocompleteManager.prototype.contentsModified = function() {
      var delay;
      delay = parseInt(atom.config.get("autocomplete-plus.autoActivationDelay"));
      if (this.delayTimeout) {
        clearTimeout(this.delayTimeout);
      }
      return this.delayTimeout = setTimeout(this.runAutocompletion, delay);
    };

    AutocompleteManager.prototype.cursorMoved = function(data) {
      if (!data.textChanged) {
        return this.cancel();
      }
    };

    AutocompleteManager.prototype.editorHasFocus = function() {
      var editorView;
      editorView = this.editorView;
      if (editorView.jquery) {
        editorView = editorView[0];
      }
      return editorView.hasFocus();
    };

    AutocompleteManager.prototype.editorSaved = function() {
      if (!this.editorHasFocus()) {
        return;
      }
      return this.cancel();
    };

    AutocompleteManager.prototype.editorChanged = function(e) {
      if (this.compositionInProgress) {
        return;
      }
      if (!this.editorHasFocus()) {
        return;
      }
      if (atom.config.get("autocomplete-plus.enableAutoActivation") && (e.newText.trim().length === 1 || e.oldText.trim().length === 1)) {
        return this.contentsModified();
      } else {
        return this.cancel();
      }
    };

    AutocompleteManager.prototype.replaceTextWithMatch = function(match) {
      var buffer, newSelectedBufferRanges, selections;
      if (this.editor == null) {
        return;
      }
      newSelectedBufferRanges = [];
      buffer = this.editor.getBuffer();
      if (buffer == null) {
        return;
      }
      selections = this.editor.getSelections();
      if (selections == null) {
        return;
      }
      selections.forEach((function(_this) {
        return function(selection, i) {
          var cursorPosition, infixLength, startPosition, _ref1, _ref2, _ref3;
          if (selection != null) {
            startPosition = (_ref1 = selection.getBufferRange()) != null ? _ref1.start : void 0;
            selection.deleteSelectedText();
            cursorPosition = (_ref2 = _this.editor.getCursors()) != null ? (_ref3 = _ref2[i]) != null ? _ref3.getBufferPosition() : void 0 : void 0;
            buffer["delete"](Range.fromPointWithDelta(cursorPosition, 0, -match.prefix.length));
            infixLength = match.word.length - match.prefix.length;
            return newSelectedBufferRanges.push([startPosition, [startPosition.row, startPosition.column + infixLength]]);
          }
        };
      })(this));
      this.editor.insertText(match.word);
      return this.editor.setSelectedBufferRanges(newSelectedBufferRanges);
    };

    AutocompleteManager.prototype.setCurrentBuffer = function(currentBuffer) {
      this.currentBuffer = currentBuffer;
      this.compositeDisposable.add(this.currentBuffer.onDidSave(this.editorSaved));
      return this.compositeDisposable.add(this.currentBuffer.onDidChange(this.editorChanged));
    };

    AutocompleteManager.prototype.dispose = function() {
      this.compositeDisposable.dispose();
      return this.emitter.emit('did-dispose');
    };

    AutocompleteManager.prototype.onDidDispose = function(cb) {
      return this.emitter.on('did-dispose', cb);
    };

    return AutocompleteManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlHQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxRQUFVLE9BQUEsQ0FBUSxNQUFSLEVBQVYsS0FBRCxDQUFBOztBQUFBLEVBQ0EsT0FBaUMsT0FBQSxDQUFRLFdBQVIsQ0FBakMsRUFBQyxlQUFBLE9BQUQsRUFBVSwyQkFBQSxtQkFEVixDQUFBOztBQUFBLEVBRUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUZKLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSLENBSlosQ0FBQTs7QUFBQSxFQUtBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSLENBTGhCLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osa0NBQUEsYUFBQSxHQUFlLElBQWYsQ0FBQTs7QUFBQSxrQ0FDQSxLQUFBLEdBQU8sS0FEUCxDQUFBOztBQU9hLElBQUEsNkJBQUUsTUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsaUVBQUEsQ0FBQTtBQUFBLG1FQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSxpRUFBQSxDQUFBO0FBQUEsdUVBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBQyxDQUFBLE1BQXBCLENBQWQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLG1CQUFELEdBQXVC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
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-plus/lib/autocomplete-manager.coffee