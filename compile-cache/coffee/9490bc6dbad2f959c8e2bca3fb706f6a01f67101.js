(function() {
  var Provider, deprecate,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  deprecate = require('grim').deprecate;

  module.exports = Provider = (function() {
    Provider.prototype.wordRegex = /\b\w*[a-zA-Z_-]+\w*\b/g;

    function Provider() {
      this.buildSuggestionsShim = __bind(this.buildSuggestionsShim, this);
      deprecate('`Provider` is no longer supported. Please switch to the new API: https://github.com/atom-community/autocomplete-plus/wiki/Provider-API');
      this.initialize.apply(this, arguments);
    }

    Provider.prototype.initialize = function() {};

    Provider.prototype.exclusive = false;

    Provider.prototype.buildSuggestionsShim = function(options) {
      if ((options != null ? options.editor : void 0) == null) {
        return;
      }
      this.editor = options.editor;
      return this.buildSuggestions.apply(this, arguments);
    };

    Provider.prototype.buildSuggestions = function() {
      throw new Error('Subclass must implement a buildSuggestions(options) method');
    };

    Provider.prototype.confirm = function(suggestion) {
      return true;
    };

    Provider.prototype.prefixOfSelection = function(selection) {
      var lineRange, prefix, selectionRange;
      selectionRange = selection.getBufferRange();
      lineRange = [[selectionRange.start.row, 0], [selectionRange.end.row, this.editor.lineTextForBufferRow(selectionRange.end.row).length]];
      prefix = '';
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxZQUFhLE9BQUEsQ0FBUSxNQUFSLEVBQWIsU0FBRCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHVCQUFBLFNBQUEsR0FBVyx3QkFBWCxDQUFBOztBQUVhLElBQUEsa0JBQUEsR0FBQTtBQUNYLHlFQUFBLENBQUE7QUFBQSxNQUFBLFNBQUEsQ0FBVSx3SUFBVixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBWixDQUFrQixJQUFsQixFQUF3QixTQUF4QixDQURBLENBRFc7SUFBQSxDQUZiOztBQUFBLHVCQU9BLFVBQUEsR0FBWSxTQUFBLEdBQUEsQ0FQWixDQUFBOztBQUFBLHVCQVlBLFNBQUEsR0FBVyxLQVpYLENBQUE7O0FBQUEsdUJBY0Esb0JBQUEsR0FBc0IsU0FBQyxPQUFELEdBQUE7QUFDcEIsTUFBQSxJQUFjLG1EQUFkO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDLE1BRGxCLENBQUE7YUFFQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsS0FBbEIsQ0FBd0IsSUFBeEIsRUFBOEIsU0FBOUIsRUFIb0I7SUFBQSxDQWR0QixDQUFBOztBQUFBLHVCQXdCQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDaEIsWUFBVSxJQUFBLEtBQUEsQ0FBTSw0REFBTixDQUFWLENBRGdCO0lBQUEsQ0F4QmxCLENBQUE7O0FBQUEsdUJBa0NBLE9BQUEsR0FBUyxTQUFDLFVBQUQsR0FBQTtBQUNQLGFBQU8sSUFBUCxDQURPO0lBQUEsQ0FsQ1QsQ0FBQTs7QUFBQSx1QkEwQ0EsaUJBQUEsR0FBbUIsU0FBQyxTQUFELEdBQUE7QUFDakIsVUFBQSxpQ0FBQTtBQUFBLE1BQUEsY0FBQSxHQUFpQixTQUFTLENBQUMsY0FBVixDQUFBLENBQWpCLENBQUE7QUFBQSxNQUNBLFNBQUEsR0FBWSxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxHQUF0QixFQUEyQixDQUEzQixDQUFELEVBQWdDLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFwQixFQUF5QixJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBaEQsQ0FBb0QsQ0FBQyxNQUE5RSxDQUFoQyxDQURaLENBQUE7QUFBQSxNQUVBLE1BQUEsR0FBUyxFQUZULENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBLENBQW1CLENBQUMsV0FBcEIsQ0FBZ0MsSUFBQyxDQUFBLFNBQWpDLEVBQTRDLFNBQTVDLEVBQXVELFNBQUMsSUFBRCxHQUFBO0FBQ3JELFlBQUEsZ0NBQUE7QUFBQSxRQUR1RCxhQUFBLE9BQU8sYUFBQSxPQUFPLFlBQUEsSUFDckUsQ0FBQTtBQUFBLFFBQUEsSUFBVSxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQVosQ0FBMEIsY0FBYyxDQUFDLEdBQXpDLENBQVY7QUFBQSxVQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7U0FBQTtBQUVBLFFBQUEsSUFBRyxLQUFLLENBQUMsY0FBTixDQUFxQixjQUFyQixDQUFIO0FBQ0UsVUFBQSxZQUFBLEdBQWUsY0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFyQixHQUE4QixLQUFLLENBQUMsS0FBSyxDQUFDLE1BQXpELENBQUE7QUFDQSxVQUFBLElBQXVDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBWixDQUF1QixjQUFjLENBQUMsS0FBdEMsQ0FBdkM7bUJBQUEsTUFBQSxHQUFTLEtBQU0sQ0FBQSxDQUFBLENBQUcsd0JBQWxCO1dBRkY7U0FIcUQ7TUFBQSxDQUF2RCxDQUhBLENBQUE7QUFVQSxhQUFPLE1BQVAsQ0FYaUI7SUFBQSxDQTFDbkIsQ0FBQTs7b0JBQUE7O01BUEYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-plus/lib/provider.coffee