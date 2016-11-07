(function() {
  var CompositeDisposable, SelectListElement, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('event-kit').CompositeDisposable;

  _ = require('underscore-plus');

  SelectListElement = (function(_super) {
    __extends(SelectListElement, _super);

    function SelectListElement() {
      return SelectListElement.__super__.constructor.apply(this, arguments);
    }

    SelectListElement.prototype.maxItems = 10;

    SelectListElement.prototype.createdCallback = function() {
      this.subscriptions = new CompositeDisposable;
      this.classList.add("popover-list");
      this.classList.add("select-list");
      this.classList.add("autocomplete-plus");
      this.classList.add("autocomplete-suggestion-list");
      this.subscriptions.add(atom.config.observe('autocomplete-plus.maxSuggestions', (function(_this) {
        return function() {
          return _this.maxItems = atom.config.get('autocomplete-plus.maxSuggestions');
        };
      })(this)));
      return this.registerMouseHandling();
    };

    SelectListElement.prototype.registerMouseHandling = function() {
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

    SelectListElement.prototype.attachedCallback = function() {
      var _ref;
      if (!((_ref = this.component) != null ? _ref.isMounted() : void 0)) {
        return this.mountComponent();
      }
    };

    SelectListElement.prototype.getModel = function() {
      return this.model;
    };

    SelectListElement.prototype.setModel = function(model) {
      this.model = model;
      this.subscriptions.add(this.model.onDidChangeItems(this.itemsChanged.bind(this)));
      this.subscriptions.add(this.model.onDoSelectNext(this.moveSelectionDown.bind(this)));
      this.subscriptions.add(this.model.onDoSelectPrevious(this.moveSelectionUp.bind(this)));
      this.subscriptions.add(this.model.onDoConfirmSelection(this.confirmSelection.bind(this)));
      return this.subscriptions.add(this.model.onDidDispose(this.dispose.bind(this)));
    };

    SelectListElement.prototype.itemsChanged = function() {
      this.selectedIndex = 0;
      this.renderItems();
      return setTimeout((function(_this) {
        return function() {
          return _this.input.focus();
        };
      })(this), 0);
    };

    SelectListElement.prototype.moveSelectionUp = function() {
      if (!(this.selectedIndex <= 0)) {
        return this.setSelectedIndex(this.selectedIndex - 1);
      } else {
        return this.setSelectedIndex(this.visibleItems().length - 1);
      }
    };

    SelectListElement.prototype.moveSelectionDown = function() {
      if (!(this.selectedIndex >= (this.visibleItems().length - 1))) {
        return this.setSelectedIndex(this.selectedIndex + 1);
      } else {
        return this.setSelectedIndex(0);
      }
    };

    SelectListElement.prototype.setSelectedIndex = function(index) {
      this.selectedIndex = index;
      return this.renderItems();
    };

    SelectListElement.prototype.visibleItems = function() {
      var _ref, _ref1;
      return (_ref = this.model) != null ? (_ref1 = _ref.items) != null ? _ref1.slice(0, this.maxItems) : void 0 : void 0;
    };

    SelectListElement.prototype.getSelectedItem = function() {
      var _ref, _ref1;
      return (_ref = this.model) != null ? (_ref1 = _ref.items) != null ? _ref1[this.selectedIndex] : void 0 : void 0;
    };

    SelectListElement.prototype.confirmSelection = function() {
      var item;
      item = this.getSelectedItem();
      if (item != null) {
        return this.model.confirm(item);
      } else {
        return this.model.cancel();
      }
    };

    SelectListElement.prototype.mountComponent = function() {
      if (!this.input) {
        this.renderInput();
      }
      if (!this.ol) {
        this.renderList();
      }
      return this.itemsChanged();
    };

    SelectListElement.prototype.renderInput = function() {
      this.input = document.createElement('input');
      this.appendChild(this.input);
      this.input.addEventListener('compositionstart', (function(_this) {
        return function() {
          _this.model.compositionInProgress = true;
          return null;
        };
      })(this));
      return this.input.addEventListener('compositionend', (function(_this) {
        return function() {
          _this.model.compositionInProgress = false;
          return null;
        };
      })(this));
    };

    SelectListElement.prototype.renderList = function() {
      this.ol = document.createElement('ol');
      this.appendChild(this.ol);
      return this.ol.className = "list-group";
    };

    SelectListElement.prototype.renderItems = function() {
      var itemToRemove, items, li, _ref;
      items = this.visibleItems() || [];
      items.forEach((function(_this) {
        return function(_arg, index) {
          var className, label, labelSpan, li, renderLabelAsHtml, word, wordSpan;
          word = _arg.word, label = _arg.label, renderLabelAsHtml = _arg.renderLabelAsHtml, className = _arg.className;
          li = _this.ol.childNodes[index];
          if (!li) {
            li = document.createElement('li');
            _this.ol.appendChild(li);
            li.dataset.index = index;
          }
          li.className = '';
          li.classList.add(className);
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
            wordSpan.className = "word";
          }
          wordSpan.textContent = word;
          labelSpan = li.childNodes[1];
          if (label) {
            if (!labelSpan) {
              labelSpan = document.createElement('span');
              if (label) {
                li.appendChild(labelSpan);
              }
              labelSpan.className = "label";
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
      itemToRemove = items.length;
      while (li = this.ol.childNodes[itemToRemove++]) {
        li.remove();
      }
      return (_ref = this.selectedLi) != null ? _ref.scrollIntoView(false) : void 0;
    };

    SelectListElement.prototype.unmountComponent = function() {
      return this.dispose();
    };

    SelectListElement.prototype.dispose = function() {
      var _ref;
      this.subscriptions.dispose();
      return (_ref = this.parentNode) != null ? _ref.removeChild(this) : void 0;
    };

    return SelectListElement;

  })(HTMLElement);

  module.exports = SelectListElement = document.registerElement('autocomplete-suggestion-list', {
    prototype: SelectListElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLFdBQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBR007QUFDSix3Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsZ0NBQUEsUUFBQSxHQUFVLEVBQVYsQ0FBQTs7QUFBQSxnQ0FFQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxjQUFmLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsYUFBZixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLG1CQUFmLENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsOEJBQWYsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLGtDQUFwQixFQUF3RCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtDQUFoQixFQUFmO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEQsQ0FBbkIsQ0FMQSxDQUFBO2FBTUEsSUFBQyxDQUFBLHFCQUFELENBQUEsRUFQZTtJQUFBLENBRmpC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
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-plus/lib/select-list-element.coffee