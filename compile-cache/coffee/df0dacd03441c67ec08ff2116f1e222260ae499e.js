(function() {
  var Provider, deprecate;

  deprecate = require('grim').deprecate;

  module.exports = Provider = (function() {
    Provider.prototype.wordRegex = /\b\w*[a-zA-Z_-]+\w*\b/g;

    function Provider(editor) {
      this.editor = editor;
      if (this.editor.constructor.name === "TextEditorView") {
        deprecate("Use of EditorView is deprecated, construct with a TextEditor model instead");
        this.editorView = this.editor;
        this.editor = this.editorView.getModel();
      }
      this.initialize.apply(this, arguments);
    }

    Provider.prototype.initialize = function() {};

    Provider.prototype.exclusive = false;

    Provider.prototype.buildSuggestions = function() {
      throw new Error("Subclass must implement a buildWordList(prefix) method");
    };

    Provider.prototype.confirm = function(suggestion) {
      return true;
    };

    Provider.prototype.prefixOfSelection = function(selection) {
      var lineRange, prefix, selectionRange;
      selectionRange = selection.getBufferRange();
      lineRange = [[selectionRange.start.row, 0], [selectionRange.end.row, this.editor.lineTextForBufferRow(selectionRange.end.row).length]];
      prefix = "";
      this.editor.getBuffer().scanInRange(this.wordRegex, lineRange, function(_arg) {
        var match, prefixOffset, range, stop;
        match = _arg.match, range = _arg.range, stop = _arg.stop;
        if (range.start.isGreaterThan(selectionRange.end)) {
          stop();
        }
        if (range.intersectsWith(selectionRange)) {
          prefixOffset = selectionRange.start.column - range.start.column;
          if (range.start.isLessThan(selectionRange.start)) {
            return prefix = match[0].slice(0, prefixOffset);
          }
        }
      });
      return prefix;
    };

    return Provider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUMsWUFBYSxPQUFBLENBQVEsTUFBUixFQUFiLFNBQUQsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSix1QkFBQSxTQUFBLEdBQVcsd0JBQVgsQ0FBQTs7QUFFYSxJQUFBLGtCQUFFLE1BQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQXBCLEtBQTRCLGdCQUEvQjtBQUNFLFFBQUEsU0FBQSxDQUFVLDRFQUFWLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsTUFEZixDQUFBO0FBQUEsUUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFBLENBRlYsQ0FERjtPQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsVUFBVSxDQUFDLEtBQVosQ0FBa0IsSUFBbEIsRUFBd0IsU0FBeEIsQ0FKQSxDQURXO0lBQUEsQ0FGYjs7QUFBQSx1QkFVQSxVQUFBLEdBQVksU0FBQSxHQUFBLENBVlosQ0FBQTs7QUFBQSx1QkFlQSxTQUFBLEdBQVcsS0FmWCxDQUFBOztBQUFBLHVCQXNCQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDaEIsWUFBVSxJQUFBLEtBQUEsQ0FBTSx3REFBTixDQUFWLENBRGdCO0lBQUEsQ0F0QmxCLENBQUE7O0FBQUEsdUJBZ0NBLE9BQUEsR0FBUyxTQUFDLFVBQUQsR0FBQTtBQUNQLGFBQU8sSUFBUCxDQURPO0lBQUEsQ0FoQ1QsQ0FBQTs7QUFBQSx1QkF3Q0EsaUJBQUEsR0FBbUIsU0FBQyxTQUFELEdBQUE7QUFDakIsVUFBQSxpQ0FBQTtBQUFBLE1BQUEsY0FBQSxHQUFpQixTQUFTLENBQUMsY0FBVixDQUFBLENBQWpCLENBQUE7QUFBQSxNQUNBLFNBQUEsR0FBWSxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxHQUF0QixFQUEyQixDQUEzQixDQUFELEVBQWdDLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFwQixFQUF5QixJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBaEQsQ0FBb0QsQ0FBQyxNQUE5RSxDQUFoQyxDQURaLENBQUE7QUFBQSxNQUVBLE1BQUEsR0FBUyxFQUZULENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBLENBQW1CLENBQUMsV0FBcEIsQ0FBZ0MsSUFBQyxDQUFBLFNBQWpDLEVBQTRDLFNBQTVDLEVBQXVELFNBQUMsSUFBRCxHQUFBO0FBQ3JELFlBQUEsZ0NBQUE7QUFBQSxRQUR1RCxhQUFBLE9BQU8sYUFBQSxPQUFPLFlBQUEsSUFDckUsQ0FBQTtBQUFBLFFBQUEsSUFBVSxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQVosQ0FBMEIsY0FBYyxDQUFDLEdBQXpDLENBQVY7QUFBQSxVQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7U0FBQTtBQUVBLFFBQUEsSUFBRyxLQUFLLENBQUMsY0FBTixDQUFxQixjQUFyQixDQUFIO0FBQ0UsVUFBQSxZQUFBLEdBQWUsY0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFyQixHQUE4QixLQUFLLENBQUMsS0FBSyxDQUFDLE1BQXpELENBQUE7QUFDQSxVQUFBLElBQXVDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBWixDQUF1QixjQUFjLENBQUMsS0FBdEMsQ0FBdkM7bUJBQUEsTUFBQSxHQUFTLEtBQU0sQ0FBQSxDQUFBLENBQUcsd0JBQWxCO1dBRkY7U0FIcUQ7TUFBQSxDQUF2RCxDQUhBLENBQUE7QUFVQSxhQUFPLE1BQVAsQ0FYaUI7SUFBQSxDQXhDbkIsQ0FBQTs7b0JBQUE7O01BUEYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-plus/lib/provider.coffee