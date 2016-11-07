(function() {
  var EditorLinter, LinterRegistry;

  LinterRegistry = require('../lib/linter-registry');

  EditorLinter = require('../lib/editor-linter');

  module.exports = {
    getLinter: function() {
      return {
        grammarScopes: ['*'],
        lintOnFly: false,
        modifiesBuffer: false,
        scope: 'project',
        lint: function() {}
      };
    },
    getMessage: function(type, filePath) {
      return {
        type: type,
        text: "Some Message",
        filePath: filePath
      };
    },
    getLinterRegistry: function() {
      var editorLinter, linter, linterRegistry;
      linterRegistry = new LinterRegistry;
      editorLinter = new EditorLinter(atom.workspace.getActiveTextEditor());
      linter = {
        grammarScopes: ['*'],
        lintOnFly: false,
        modifiesBuffer: false,
        scope: 'project',
        lint: function() {
          return [
            {
              type: "Error",
              text: "Something"
            }
          ];
        }
      };
      linterRegistry.addLinter(linter);
      return {
        linterRegistry: linterRegistry,
        editorLinter: editorLinter,
        linter: linter
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9jb21tb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBOztBQUFBLEVBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEsd0JBQVIsQ0FBakIsQ0FBQTs7QUFBQSxFQUNBLFlBQUEsR0FBZSxPQUFBLENBQVEsc0JBQVIsQ0FEZixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsU0FBQSxFQUFXLFNBQUEsR0FBQTtBQUNULGFBQU87QUFBQSxRQUFDLGFBQUEsRUFBZSxDQUFDLEdBQUQsQ0FBaEI7QUFBQSxRQUF1QixTQUFBLEVBQVcsS0FBbEM7QUFBQSxRQUF5QyxjQUFBLEVBQWdCLEtBQXpEO0FBQUEsUUFBZ0UsS0FBQSxFQUFPLFNBQXZFO0FBQUEsUUFBa0YsSUFBQSxFQUFNLFNBQUEsR0FBQSxDQUF4RjtPQUFQLENBRFM7SUFBQSxDQUFYO0FBQUEsSUFFQSxVQUFBLEVBQVksU0FBQyxJQUFELEVBQU8sUUFBUCxHQUFBO0FBQ1YsYUFBTztBQUFBLFFBQUMsTUFBQSxJQUFEO0FBQUEsUUFBTyxJQUFBLEVBQU0sY0FBYjtBQUFBLFFBQTZCLFVBQUEsUUFBN0I7T0FBUCxDQURVO0lBQUEsQ0FGWjtBQUFBLElBSUEsaUJBQUEsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLFVBQUEsb0NBQUE7QUFBQSxNQUFBLGNBQUEsR0FBaUIsR0FBQSxDQUFBLGNBQWpCLENBQUE7QUFBQSxNQUNBLFlBQUEsR0FBbUIsSUFBQSxZQUFBLENBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQWIsQ0FEbkIsQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTO0FBQUEsUUFDUCxhQUFBLEVBQWUsQ0FBQyxHQUFELENBRFI7QUFBQSxRQUVQLFNBQUEsRUFBVyxLQUZKO0FBQUEsUUFHUCxjQUFBLEVBQWdCLEtBSFQ7QUFBQSxRQUlQLEtBQUEsRUFBTyxTQUpBO0FBQUEsUUFLUCxJQUFBLEVBQU0sU0FBQSxHQUFBO0FBQUcsaUJBQU87WUFBQztBQUFBLGNBQUMsSUFBQSxFQUFNLE9BQVA7QUFBQSxjQUFnQixJQUFBLEVBQU0sV0FBdEI7YUFBRDtXQUFQLENBQUg7UUFBQSxDQUxDO09BRlQsQ0FBQTtBQUFBLE1BU0EsY0FBYyxDQUFDLFNBQWYsQ0FBeUIsTUFBekIsQ0FUQSxDQUFBO0FBVUEsYUFBTztBQUFBLFFBQUMsZ0JBQUEsY0FBRDtBQUFBLFFBQWlCLGNBQUEsWUFBakI7QUFBQSxRQUErQixRQUFBLE1BQS9CO09BQVAsQ0FYaUI7SUFBQSxDQUpuQjtHQUpGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/mk2/.atom/packages/linter/spec/common.coffee
