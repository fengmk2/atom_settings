(function() {
  var Helpers, Range, child_process, path,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Range = require('atom').Range;

  path = require('path');

  child_process = require('child_process');

  Helpers = module.exports = {
    error: function(e) {
      return atom.notifications.addError(e.toString(), {
        detail: e.stack || '',
        dismissable: true
      });
    },
    shouldTriggerLinter: function(linter, bufferModifying, onChange, scopes) {
      if (onChange && !linter.lintOnFly) {
        return false;
      }
      if (!scopes.some(function(entry) {
        return __indexOf.call(linter.grammarScopes, entry) >= 0;
      })) {
        return false;
      }
      if (linter.modifiesBuffer !== bufferModifying) {
        return false;
      }
      return true;
    },
    requestUpdateFrame: function(callback) {
      return setTimeout(callback, 100);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2hlbHBlcnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVIsQ0FGaEIsQ0FBQTs7QUFBQSxFQUlBLE9BQUEsR0FBVSxNQUFNLENBQUMsT0FBUCxHQUNSO0FBQUEsSUFBQSxLQUFBLEVBQU8sU0FBQyxDQUFELEdBQUE7YUFDTCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLENBQUMsQ0FBQyxRQUFGLENBQUEsQ0FBNUIsRUFBMEM7QUFBQSxRQUFDLE1BQUEsRUFBUSxDQUFDLENBQUMsS0FBRixJQUFXLEVBQXBCO0FBQUEsUUFBd0IsV0FBQSxFQUFhLElBQXJDO09BQTFDLEVBREs7SUFBQSxDQUFQO0FBQUEsSUFFQSxtQkFBQSxFQUFxQixTQUFDLE1BQUQsRUFBUyxlQUFULEVBQTBCLFFBQTFCLEVBQW9DLE1BQXBDLEdBQUE7QUFJbkIsTUFBQSxJQUFnQixRQUFBLElBQWEsQ0FBQSxNQUFVLENBQUMsU0FBeEM7QUFBQSxlQUFPLEtBQVAsQ0FBQTtPQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsTUFBMEIsQ0FBQyxJQUFQLENBQVksU0FBQyxLQUFELEdBQUE7ZUFBVyxlQUFTLE1BQU0sQ0FBQyxhQUFoQixFQUFBLEtBQUEsT0FBWDtNQUFBLENBQVosQ0FBcEI7QUFBQSxlQUFPLEtBQVAsQ0FBQTtPQURBO0FBRUEsTUFBQSxJQUFnQixNQUFNLENBQUMsY0FBUCxLQUEyQixlQUEzQztBQUFBLGVBQU8sS0FBUCxDQUFBO09BRkE7QUFHQSxhQUFPLElBQVAsQ0FQbUI7SUFBQSxDQUZyQjtBQUFBLElBVUEsa0JBQUEsRUFBb0IsU0FBQyxRQUFELEdBQUE7YUFDbEIsVUFBQSxDQUFXLFFBQVgsRUFBcUIsR0FBckIsRUFEa0I7SUFBQSxDQVZwQjtHQUxGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/mk2/.atom/packages/linter/lib/helpers.coffee
