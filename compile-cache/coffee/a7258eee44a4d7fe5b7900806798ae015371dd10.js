(function() {
  var DraftStoreExtension, TemplatesDraftStoreExtension,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  DraftStoreExtension = require('nylas-exports').DraftStoreExtension;

  TemplatesDraftStoreExtension = (function(superClass) {
    extend(TemplatesDraftStoreExtension, superClass);

    function TemplatesDraftStoreExtension() {
      return TemplatesDraftStoreExtension.__super__.constructor.apply(this, arguments);
    }

    TemplatesDraftStoreExtension.warningsForSending = function(draft) {
      var warnings;
      warnings = [];
      if (draft.body.search(/<code[^>]*empty[^>]*>/i) > 0) {
        warnings.push("with an empty template area");
      }
      return warnings;
    };

    TemplatesDraftStoreExtension.finalizeSessionBeforeSending = function(session) {
      var body, clean;
      body = session.draft().body;
      clean = body.replace(/<\/?code[^>]*>/g, '');
      if (body !== clean) {
        return session.changes.add({
          body: clean
        });
      }
    };

    TemplatesDraftStoreExtension.onMouseUp = function(editableNode, range, event) {
      var isSinglePoint, parent, parentCodeNode, ref, ref1, selection;
      parent = (ref = range.startContainer) != null ? ref.parentNode : void 0;
      parentCodeNode = null;
      while (parent && parent !== editableNode) {
        if (((ref1 = parent.classList) != null ? ref1.contains('var') : void 0) && parent.tagName === 'CODE') {
          parentCodeNode = parent;
          break;
        }
        parent = parent.parentNode;
      }
      isSinglePoint = range.startContainer === range.endContainer && range.startOffset === range.endOffset;
      if (isSinglePoint && parentCodeNode) {
        range.selectNode(parentCodeNode);
        selection = document.getSelection();
        selection.removeAllRanges();
        return selection.addRange(range);
      }
    };

    TemplatesDraftStoreExtension.onTabDown = function(editableNode, range, event) {
      if (event.shiftKey) {
        return this.onTabSelectNextVar(editableNode, range, event, -1);
      } else {
        return this.onTabSelectNextVar(editableNode, range, event, 1);
      }
    };

    TemplatesDraftStoreExtension.onTabSelectNextVar = function(editableNode, range, event, delta) {
      var i, idx, j, len, len1, match, matchIndex, matches, node, nodes, parentCodeNode, selectNode, selection;
      if (!range) {
        return;
      }
      parentCodeNode = null;
      nodes = editableNode.querySelectorAll('code.var');
      for (i = 0, len = nodes.length; i < len; i++) {
        node = nodes[i];
        if (range.intersectsNode(node)) {
          parentCodeNode = node;
        }
      }
      if (parentCodeNode) {
        if (range.startOffset === range.endOffset && parentCodeNode.classList.contains('empty')) {
          selectNode = parentCodeNode;
        } else {
          matches = editableNode.querySelectorAll('code.var');
          matchIndex = -1;
          for (idx = j = 0, len1 = matches.length; j < len1; idx = ++j) {
            match = matches[idx];
            if (match === parentCodeNode) {
              matchIndex = idx;
              break;
            }
          }
          if (matchIndex !== -1 && matchIndex + delta >= 0 && matchIndex + delta < matches.length) {
            selectNode = matches[matchIndex + delta];
          }
        }
      }
      if (selectNode) {
        range.selectNode(selectNode);
        selection = document.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        event.preventDefault();
        return event.stopPropagation();
      }
    };

    TemplatesDraftStoreExtension.onInput = function(editableNode, event) {
      var codeTag, codeTags, i, isWithinNode, len, results, selection;
      selection = document.getSelection();
      isWithinNode = function(node) {
        var test;
        test = selection.baseNode;
        while (test !== editableNode) {
          if (test === node) {
            return true;
          }
          test = test.parentNode;
        }
        return false;
      };
      codeTags = editableNode.querySelectorAll('code.var.empty');
      results = [];
      for (i = 0, len = codeTags.length; i < len; i++) {
        codeTag = codeTags[i];
        if (selection.containsNode(codeTag) || isWithinNode(codeTag)) {
          results.push(codeTag.classList.remove('empty'));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return TemplatesDraftStoreExtension;

  })(DraftStoreExtension);

  module.exports = TemplatesDraftStoreExtension;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlEQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsZUFBUixFQUF2Qjs7RUFFSzs7Ozs7OztJQUVKLDRCQUFDLENBQUEsa0JBQUQsR0FBcUIsU0FBQyxLQUFEO0FBQ25CLFVBQUE7TUFBQSxRQUFBLEdBQVc7TUFDWCxJQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBWCxDQUFrQix3QkFBbEIsQ0FBQSxHQUE4QyxDQUFqRDtRQUNFLFFBQVEsQ0FBQyxJQUFULENBQWMsNkJBQWQsRUFERjs7YUFFQTtJQUptQjs7SUFNckIsNEJBQUMsQ0FBQSw0QkFBRCxHQUErQixTQUFDLE9BQUQ7QUFDN0IsVUFBQTtNQUFBLElBQUEsR0FBTyxPQUFPLENBQUMsS0FBUixDQUFBLENBQWUsQ0FBQztNQUN2QixLQUFBLEdBQVEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxpQkFBYixFQUFnQyxFQUFoQztNQUNSLElBQUcsSUFBQSxLQUFRLEtBQVg7ZUFDRSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQWhCLENBQW9CO1VBQUEsSUFBQSxFQUFNLEtBQU47U0FBcEIsRUFERjs7SUFINkI7O0lBTS9CLDRCQUFDLENBQUEsU0FBRCxHQUFZLFNBQUMsWUFBRCxFQUFlLEtBQWYsRUFBc0IsS0FBdEI7QUFDVixVQUFBO01BQUEsTUFBQSw2Q0FBNkIsQ0FBRTtNQUMvQixjQUFBLEdBQWlCO0FBRWpCLGFBQU0sTUFBQSxJQUFXLE1BQUEsS0FBWSxZQUE3QjtRQUNFLDZDQUFtQixDQUFFLFFBQWxCLENBQTJCLEtBQTNCLFdBQUEsSUFBc0MsTUFBTSxDQUFDLE9BQVAsS0FBa0IsTUFBM0Q7VUFDRSxjQUFBLEdBQWlCO0FBQ2pCLGdCQUZGOztRQUdBLE1BQUEsR0FBUyxNQUFNLENBQUM7TUFKbEI7TUFNQSxhQUFBLEdB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
//# sourceURL=/Users/mk2/.nylas/packages/N1-Composer-Templates/lib/template-draft-extension.coffee