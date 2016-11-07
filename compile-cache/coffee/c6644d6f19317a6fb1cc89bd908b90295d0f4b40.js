(function() {
  var RangeFinder, sortLines;

  RangeFinder = require('./range-finder');

  module.exports = {
    activate: function() {
      return atom.workspaceView.command('sort-lines:sort', '.editor', function() {
        var editor;
        editor = atom.workspaceView.getActivePaneItem();
        return sortLines(editor);
      });
    }
  };

  sortLines = function(editor) {
    var sortableRanges;
    sortableRanges = RangeFinder.rangesFor(editor);
    return sortableRanges.forEach(function(range) {
      var textLines;
      textLines = editor.getTextInBufferRange(range).split("\n");
      textLines.sort(function(a, b) {
        return a.localeCompare(b);
      });
      return editor.setTextInBufferRange(range, textLines.join("\n"));
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNCQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUFkLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixpQkFBM0IsRUFBOEMsU0FBOUMsRUFBeUQsU0FBQSxHQUFBO0FBQ3ZELFlBQUEsTUFBQTtBQUFBLFFBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQW5CLENBQUEsQ0FBVCxDQUFBO2VBQ0EsU0FBQSxDQUFVLE1BQVYsRUFGdUQ7TUFBQSxDQUF6RCxFQURRO0lBQUEsQ0FBVjtHQUhGLENBQUE7O0FBQUEsRUFRQSxTQUFBLEdBQVksU0FBQyxNQUFELEdBQUE7QUFDVixRQUFBLGNBQUE7QUFBQSxJQUFBLGNBQUEsR0FBaUIsV0FBVyxDQUFDLFNBQVosQ0FBc0IsTUFBdEIsQ0FBakIsQ0FBQTtXQUNBLGNBQWMsQ0FBQyxPQUFmLENBQXVCLFNBQUMsS0FBRCxHQUFBO0FBQ3JCLFVBQUEsU0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixLQUE1QixDQUFrQyxDQUFDLEtBQW5DLENBQXlDLElBQXpDLENBQVosQ0FBQTtBQUFBLE1BQ0EsU0FBUyxDQUFDLElBQVYsQ0FBZSxTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7ZUFBVSxDQUFDLENBQUMsYUFBRixDQUFnQixDQUFoQixFQUFWO01BQUEsQ0FBZixDQURBLENBQUE7YUFFQSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsS0FBNUIsRUFBbUMsU0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFmLENBQW5DLEVBSHFCO0lBQUEsQ0FBdkIsRUFGVTtFQUFBLENBUlosQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/mk2/.atom/packages/sort-lines/lib/sort-lines.coffee