(function() {
  var CompositeDisposable, Emitter, SuggestionList, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  module.exports = SuggestionList = (function() {
    function SuggestionList() {
      this.destroyOverlay = __bind(this.destroyOverlay, this);
      this.hide = __bind(this.hide, this);
      this.show = __bind(this.show, this);
      this.cancel = __bind(this.cancel, this);
      this.selectPrevious = __bind(this.selectPrevious, this);
      this.selectNext = __bind(this.selectNext, this);
      this.confirm = __bind(this.confirm, this);
      this.confirmSelection = __bind(this.confirmSelection, this);
      this.active = false;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-text-editor.autocomplete-active', {
        'autocomplete-plus:confirm': this.confirmSelection,
        'autocomplete-plus:select-next': this.selectNext,
        'autocomplete-plus:select-previous': this.selectPrevious,
        'autocomplete-plus:cancel': this.cancel
      }));
    }

    SuggestionList.prototype.addKeyboardInteraction = function() {
      var completionKey, keys, navigationKey, _ref1;
      this.removeKeyboardInteraction();
      keys = {
        'escape': 'autocomplete-plus:cancel'
      };
      completionKey = atom.config.get('autocomplete-plus.confirmCompletion') || '';
      navigationKey = atom.config.get('autocomplete-plus.navigateCompletions') || '';
      if (completionKey.indexOf('tab') > -1) {
        keys['tab'] = 'autocomplete-plus:confirm';
      }
      if (completionKey.indexOf('enter') > -1) {
        keys['enter'] = 'autocomplete-plus:confirm';
      }
      if (((_ref1 = this.items) != null ? _ref1.length : void 0) > 1 && navigationKey === 'up,down') {
        keys['up'] = 'autocomplete-plus:select-previous';
        keys['down'] = 'autocomplete-plus:select-next';
      } else {
        keys['ctrl-n'] = 'autocomplete-plus:select-next';
        keys['ctrl-p'] = 'autocomplete-plus:select-previous';
      }
      this.keymaps = atom.keymaps.add('atom-text-editor.autocomplete-active', {
        'atom-text-editor.autocomplete-active': keys
      });
      return this.subscriptions.add(this.keymaps);
    };

    SuggestionList.prototype.removeKeyboardInteraction = function() {
      var _ref1;
      if ((_ref1 = this.keymaps) != null) {
        _ref1.dispose();
      }
      return this.subscriptions.remove(this.keymaps);
    };

    SuggestionList.prototype.confirmSelection = function() {
      return this.emitter.emit('did-confirm-selection');
    };

    SuggestionList.prototype.onDidConfirmSelection = function(fn) {
      return this.emitter.on('did-confirm-selection', fn);
    };

    SuggestionList.prototype.confirm = function(match) {
      return this.emitter.emit('did-confirm', match);
    };

    SuggestionList.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    SuggestionList.prototype.selectNext = function() {
      return this.emitter.emit('did-select-next');
    };

    SuggestionList.prototype.onDidSelectNext = function(fn) {
      return this.emitter.on('did-select-next', fn);
    };

    SuggestionList.prototype.selectPrevious = function() {
      return this.emitter.emit('did-select-previous');
    };

    SuggestionList.prototype.onDidSelectPrevious = function(fn) {
      return this.emitter.on('did-select-previous', fn);
    };

    SuggestionList.prototype.cancel = function() {
      this.subscriptions.remove(this.marker);
      return this.emitter.emit('did-cancel');
    };

    SuggestionList.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    SuggestionList.prototype.isActive = function() {
      return this.active;
    };

    SuggestionList.prototype.show = function(editor) {
      var cursor, position, _ref1;
      if (this.active) {
        return;
      }
      if (editor == null) {
        return;
      }
      this.destroyOverlay();
      if (atom.config.get('autocomplete-plus.suggestionListFollows') === 'Cursor') {
        this.marker = (_ref1 = editor.getLastCursor()) != null ? _ref1.getMarker() : void 0;
        if (this.marker == null) {
          return;
        }
      } else {
        cursor = editor.getLastCursor();
        if (cursor == null) {
          return;
        }
        position = cursor.getBeginningOfCurrentWordBufferPosition();
        this.marker = editor.markBufferPosition(position);
        this.subscriptions.add(this.marker);
      }
      this.overlayDecoration = editor.decorateMarker(this.marker, {
        type: 'overlay',
        item: this
      });
      this.addKeyboardInteraction();
      return this.active = true;
    };

    SuggestionList.prototype.hide = function() {
      if (!this.active) {
        return;
      }
      this.destroyOverlay();
      this.removeKeyboardInteraction();
      return this.active = false;
    };

    SuggestionList.prototype.destroyOverlay = function() {
      var _ref1;
      if ((_ref1 = this.overlayDecoration) != null) {
        _ref1.destroy();
      }
      return this.overlayDecoration = void 0;
    };

    SuggestionList.prototype.changeItems = function(items) {
      this.items = items;
      return this.emitter.emit('did-change-items', items);
    };

    SuggestionList.prototype.onDidChangeItems = function(fn) {
      return this.emitter.on('did-change-items', fn);
    };

    SuggestionList.prototype.dispose = function() {
      this.subscriptions.dispose();
      this.emitter.emit('did-dispose');
      return this.emitter.dispose();
    };

    SuggestionList.prototype.onDidDispose = function(fn) {
      return this.emitter.on('did-dispose', fn);
    };

    return SuggestionList;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxPQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLGVBQUEsT0FBRCxFQUFVLDJCQUFBLG1CQUFWLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSx3QkFBQSxHQUFBO0FBQ1gsNkRBQUEsQ0FBQTtBQUFBLHlDQUFBLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSxxREFBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLGlFQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsS0FBVixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQURYLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFGakIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixzQ0FBbEIsRUFDakI7QUFBQSxRQUFBLDJCQUFBLEVBQTZCLElBQUMsQ0FBQSxnQkFBOUI7QUFBQSxRQUNBLCtCQUFBLEVBQWlDLElBQUMsQ0FBQSxVQURsQztBQUFBLFFBRUEsbUNBQUEsRUFBcUMsSUFBQyxDQUFBLGNBRnRDO0FBQUEsUUFHQSwwQkFBQSxFQUE0QixJQUFDLENBQUEsTUFIN0I7T0FEaUIsQ0FBbkIsQ0FKQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSw2QkFZQSxzQkFBQSxHQUF3QixTQUFBLEdBQUE7QUFDdEIsVUFBQSx5Q0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLHlCQUFELENBQUEsQ0FBQSxDQUFB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
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-plus/lib/suggestion-list.coffee