(function() {
  var Range, Validate, helpers;

  Range = require('atom').Range;

  helpers = require('./helpers');

  module.exports = Validate = {
    linter: function(linter) {
      linter.modifiesBuffer = Boolean(linter.modifiesBuffer);
      if (!(linter.grammarScopes instanceof Array)) {
        throw new Error("grammarScopes is not an Array. Got: " + linter.grammarScopes);
      }
      if (linter.lint) {
        if (typeof linter.lint !== 'function') {
          throw new Error("linter.lint isn't a function on provider");
        }
      } else {
        throw new Error('Missing linter.lint on provider');
      }
      return true;
    },
    messages: function(messages) {
      if (!(messages instanceof Array)) {
        throw new Error("Expected messages to be array, provided: " + (typeof messages));
      }
      messages.forEach(function(result) {
        if (result.type) {
          if (typeof result.type !== 'string') {
            throw new Error('Invalid type field on Linter Response');
          }
        } else {
          throw new Error('Missing type field on Linter Response');
        }
        if (result.html) {
          if (typeof result.html !== 'string') {
            throw new Error('Invalid html field on Linter Response');
          }
        } else if (result.text) {
          if (typeof result.text !== 'string') {
            throw new Error('Invalid text field on Linter Response');
          }
        } else {
          throw new Error('Missing html/text field on Linter Response');
        }
        if (result.range != null) {
          result.range = Range.fromObject(result.range);
        }
        result.key = JSON.stringify(result);
        result["class"] = result.type.toLowerCase().replace(' ', '-');
        if (result.trace) {
          return Validate.messages(result.trace);
        }
      });
      return void 0;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL3ZhbGlkYXRlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3QkFBQTs7QUFBQSxFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQUFELENBQUE7O0FBQUEsRUFDQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVIsQ0FEVixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsUUFBQSxHQUVmO0FBQUEsSUFBQSxNQUFBLEVBQVEsU0FBQyxNQUFELEdBQUE7QUFFTixNQUFBLE1BQU0sQ0FBQyxjQUFQLEdBQXdCLE9BQUEsQ0FBUSxNQUFNLENBQUMsY0FBZixDQUF4QixDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsQ0FBTyxNQUFNLENBQUMsYUFBUCxZQUFnQyxLQUF2QyxDQUFBO0FBQ0UsY0FBVSxJQUFBLEtBQUEsQ0FBTyxzQ0FBQSxHQUFzQyxNQUFNLENBQUMsYUFBcEQsQ0FBVixDQURGO09BREE7QUFHQSxNQUFBLElBQUcsTUFBTSxDQUFDLElBQVY7QUFDRSxRQUFBLElBQStELE1BQUEsQ0FBQSxNQUFhLENBQUMsSUFBZCxLQUF3QixVQUF2RjtBQUFBLGdCQUFVLElBQUEsS0FBQSxDQUFNLDBDQUFOLENBQVYsQ0FBQTtTQURGO09BQUEsTUFBQTtBQUdFLGNBQVUsSUFBQSxLQUFBLENBQU0saUNBQU4sQ0FBVixDQUhGO09BSEE7QUFPQSxhQUFPLElBQVAsQ0FUTTtJQUFBLENBQVI7QUFBQSxJQVdBLFFBQUEsRUFBVSxTQUFDLFFBQUQsR0FBQTtBQUNSLE1BQUEsSUFBQSxDQUFBLENBQU8sUUFBQSxZQUFvQixLQUEzQixDQUFBO0FBQ0UsY0FBVSxJQUFBLEtBQUEsQ0FBTywyQ0FBQSxHQUEwQyxDQUFDLE1BQUEsQ0FBQSxRQUFELENBQWpELENBQVYsQ0FERjtPQUFBO0FBQUEsTUFFQSxRQUFRLENBQUMsT0FBVCxDQUFpQixTQUFDLE1BQUQsR0FBQTtBQUNmLFFBQUEsSUFBRyxNQUFNLENBQUMsSUFBVjtBQUNFLFVBQUEsSUFBMkQsTUFBQSxDQUFBLE1BQWEsQ0FBQyxJQUFkLEtBQXdCLFFBQW5GO0FBQUEsa0JBQVUsSUFBQSxLQUFBLENBQU0sdUNBQU4sQ0FBVixDQUFBO1dBREY7U0FBQSxNQUFBO0FBR0UsZ0JBQVUsSUFBQSxLQUFBLENBQU0sdUNBQU4sQ0FBVixDQUhGO1NBQUE7QUFJQSxRQUFBLElBQUcsTUFBTSxDQUFDLElBQVY7QUFDRSxVQUFBLElBQTJELE1BQUEsQ0FBQSxNQUFhLENBQUMsSUFBZCxLQUF3QixRQUFuRjtBQUFBLGtCQUFVLElBQUEsS0FBQSxDQUFNLHVDQUFOLENBQVYsQ0FBQTtXQURGO1NBQUEsTUFFSyxJQUFHLE1BQU0sQ0FBQyxJQUFWO0FBQ0gsVUFBQSxJQUEyRCxNQUFBLENBQUEsTUFBYSxDQUFDLElBQWQsS0FBd0IsUUFBbkY7QUFBQSxrQkFBVSxJQUFBLEtBQUEsQ0FBTSx1Q0FBTixDQUFWLENBQUE7V0FERztTQUFBLE1BQUE7QUFHSCxnQkFBVSxJQUFBLEtBQUEsQ0FBTSw0Q0FBTixDQUFWLENBSEc7U0FOTDtBQVVBLFFBQUEsSUFBZ0Qsb0JBQWhEO0FBQUEsVUFBQSxNQUFNLENBQUMsS0FBUCxHQUFlLEtBQUssQ0FBQyxVQUFOLENBQWlCLE1BQU0sQ0FBQyxLQUF4QixDQUFmLENBQUE7U0FWQTtBQUFBLFFBV0EsTUFBTSxDQUFDLEdBQVAsR0FBYSxJQUFJLENBQUMsU0FBTCxDQUFlLE1BQWYsQ0FYYixDQUFBO0FBQUEsUUFZQSxNQUFNLENBQUMsT0FBRCxDQUFOLEdBQWUsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFaLENBQUEsQ0FBeUIsQ0FBQyxPQUExQixDQUFrQyxHQUFsQyxFQUF1QyxHQUF2QyxDQVpmLENBQUE7QUFhQSxRQUFBLElBQW1DLE1BQU0sQ0FBQyxLQUExQztpQkFBQSxRQUFRLENBQUMsUUFBVCxDQUFrQixNQUFNLENBQUMsS0FBekIsRUFBQTtTQWRlO01BQUEsQ0FBakIsQ0FGQSxDQUFBO0FBaUJBLGFBQU8sTUFBUCxDQWxCUTtJQUFBLENBWFY7R0FMRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/mk2/.atom/packages/linter/lib/validate.coffee
