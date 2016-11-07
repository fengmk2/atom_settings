(function() {
  var CompositeDisposable, SuggestionListElement, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  _ = require('underscore-plus');

  SuggestionListElement = (function(_super) {
    __extends(SuggestionListElement, _super);

    function SuggestionListElement() {
      return SuggestionListElement.__super__.constructor.apply(this, arguments);
    }

    SuggestionListElement.prototype.maxItems = 10;

    SuggestionListElement.prototype.createdCallback = function() {
      this.subscriptions = new CompositeDisposable;
      this.classList.add('popover-list', 'select-list', 'autocomplete-suggestion-list');
      this.subscriptions.add(atom.config.observe('autocomplete-plus.maxSuggestions', (function(_this) {
        return function() {
          return _this.maxItems = atom.config.get('autocomplete-plus.maxSuggestions');
        };
      })(this)));
      return this.registerMouseHandling();
    };

    SuggestionListElement.prototype.attachedCallback = function() {
      this.parentElement.classList.add('autocomplete-plus');
      this.addActiveClassToEditor();
      if (!this.ol) {
        this.renderList();
      }
      return this.itemsChanged();
    };

    SuggestionListElement.prototype.detachedCallback = function() {
      return this.removeActiveClassFromEditor();
    };

    SuggestionListElement.prototype.initialize = function(model) {
      this.model = model;
      if (model == null) {
        return;
      }
      this.subscriptions.add(this.model.onDidChangeItems(this.itemsChanged.bind(this)));
      this.subscriptions.add(this.model.onDidSelectNext(this.moveSelectionDown.bind(this)));
      this.subscriptions.add(this.model.onDidSelectPrevious(this.moveSelectionUp.bind(this)));
      this.subscriptions.add(this.model.onDidConfirmSelection(this.confirmSelection.bind(this)));
      this.subscriptions.add(this.model.onDidDispose(this.dispose.bind(this)));
      return this;
    };

    SuggestionListElement.prototype.registerMouseHandling = function() {
      this.onmousewheel = function(event) {
        return event.stopPropagation();
      };
      this.onmousedown = function(event) {
        var item, _ref, _ref1;
        item = event.target;
        while (!((_ref = item.dataset) != null ? _ref.index : void 0) && item !== this) {
          item = item.parentNode;
        }
        this.selectedIndex = (_ref1 = item.dataset) != null ? _ref1.index : void 0;
        return event.stopPropagation();
      };
      return this.onmouseup = function(event) {
        event.stopPropagation();
        return this.confirmSelection();
      };
    };

    SuggestionListElement.prototype.itemsChanged = function() {
      this.selectedIndex = 0;
      return this.renderItems();
    };

    SuggestionListElement.prototype.addActiveClassToEditor = function() {
      var editorElement, _ref;
      editorElement = atom.views.getView(atom.workspace.getActiveTextEditor());
      return editorElement != null ? (_ref = editorElement.classList) != null ? _ref.add('autocomplete-active') : void 0 : void 0;
    };

    SuggestionListElement.prototype.removeActiveClassFromEditor = function() {
      var editorElement, _ref;
      editorElement = atom.views.getView(atom.workspace.getActiveTextEditor());
      return editorElement != null ? (_ref = editorElement.classList) != null ? _ref.remove('autocomplete-active') : void 0 : void 0;
    };

    SuggestionListElement.prototype.moveSelectionUp = function() {
      if (!(this.selectedIndex <= 0)) {
        return this.setSelectedIndex(this.selectedIndex - 1);
      } else {
        return this.setSelectedIndex(this.visibleItems().length - 1);
      }
    };

    SuggestionListElement.prototype.moveSelectionDown = function() {
      if (!(this.selectedIndex >= (this.visibleItems().length - 1))) {
        return this.setSelectedIndex(this.selectedIndex + 1);
      } else {
        return this.setSelectedIndex(0);
      }
    };

    SuggestionListElement.prototype.setSelectedIndex = function(index) {
      this.selectedIndex = index;
      return this.renderItems();
    };

    SuggestionListElement.prototype.visibleItems = function() {
      var _ref, _ref1;
      return (_ref = this.model) != null ? (_ref1 = _ref.items) != null ? _ref1.slice(0, this.maxItems) : void 0 : void 0;
    };

    SuggestionListElement.prototype.getSelectedItem = function() {
      var _ref, _ref1;
      return (_ref = this.model) != null ? (_ref1 = _ref.items) != null ? _ref1[this.selectedIndex] : void 0 : void 0;
    };

    SuggestionListElement.prototype.confirmSelection = function() {
      var item;
      if (!this.model.isActive()) {
        return;
      }
      item = this.getSelectedItem();
      if (item != null) {
        return this.model.confirm(item);
      } else {
        return this.model.cancel();
      }
    };

    SuggestionListElement.prototype.renderList = function() {
      this.ol = document.createElement('ol');
      this.appendChild(this.ol);
      return this.ol.className = 'list-group';
    };

    SuggestionListElement.prototype.renderItems = function() {
      var items, li, _ref;
      items = this.visibleItems() || [];
      items.forEach((function(_this) {
        return function(_arg, index) {
          var ch, className, i, label, labelSpan, li, prefix, renderLabelAsHtml, word, wordIndex, wordSpan, _i, _len, _ref;
          word = _arg.word, label = _arg.label, renderLabelAsHtml = _arg.renderLabelAsHtml, className = _arg.className, prefix = _arg.prefix;
          li = _this.ol.childNodes[index];
          if (!li) {
            li = document.createElement('li');
            _this.ol.appendChild(li);
            li.dataset.index = index;
          }
          li.className = '';
          if (className) {
            li.classList.add(className);
          }
          if (index === _this.selectedIndex) {
            li.classList.add('selected');
          }
          if (index === _this.selectedIndex) {
            _this.selectedLi = li;
          }
          wordSpan = li.childNodes[0];
          if (!wordSpan) {
            wordSpan = document.createElement('span');
            li.appendChild(wordSpan);
            wordSpan.className = 'word';
          }
          wordSpan.innerHTML = ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = word.length; _i < _len; _i++) {
              ch = word[_i];
              _results.push("<span>" + ch + "</span>");
            }
            return _results;
          })()).join('');
          wordIndex = 0;
          for (i = _i = 0, _len = prefix.length; _i < _len; i = ++_i) {
            ch = prefix[i];
            while (wordIndex < word.length && word[wordIndex].toLowerCase() !== ch.toLowerCase()) {
              wordIndex += 1;
            }
            if ((_ref = wordSpan.childNodes[wordIndex]) != null) {
              _ref.classList.add('character-match');
            }
            wordIndex += 1;
          }
          labelSpan = li.childNodes[1];
          if (label) {
            if (!labelSpan) {
              labelSpan = document.createElement('span');
              if (label) {
                li.appendChild(labelSpan);
              }
              labelSpan.className = 'completion-label text-smaller text-subtle';
            }
            if (renderLabelAsHtml) {
              return labelSpan.innerHTML = label;
            } else {
              return labelSpan.textContent = label;
            }
          } else {
            return labelSpan != null ? labelSpan.remove() : void 0;
          }
        };
      })(this));
      while (li = this.ol.childNodes[items.length]) {
        li.remove();
      }
      return (_ref = this.selectedLi) != null ? _ref.scrollIntoView(false) : void 0;
    };

    SuggestionListElement.prototype.dispose = function() {
      var _ref;
      this.subscriptions.dispose();
      return (_ref = this.parentNode) != null ? _ref.removeChild(this) : void 0;
    };

    return SuggestionListElement;

  })(HTMLElement);

  module.exports = SuggestionListElement = document.registerElement('autocomplete-suggestion-list', {
    prototype: SuggestionListElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBR007QUFDSiw0Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsb0NBQUEsUUFBQSxHQUFVLEVBQVYsQ0FBQTs7QUFBQSxvQ0FFQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxjQUFmLEVBQStCLGFBQS9CLEVBQThDLDhCQUE5QyxDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0Isa0NBQXBCLEVBQXdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0NBQWhCLEVBQWY7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RCxDQUFuQixDQUZBLENBQUE7YUFHQSxJQUFDLENBQUEscUJBQUQsQ0FBQSxFQUplO0lBQUEsQ0FGakIsQ0FBQTs7QUFBQSxvQ0FRQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFFaEIsTUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUF6QixDQUE2QixtQkFBN0IsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsc0JBQUQsQ0FBQSxD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
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-plus/lib/suggestion-list-element.coffee