(function() {
  var Suggestion, deprecate;

  deprecate = require('grim').deprecate;

  module.exports = Suggestion = (function() {
    function Suggestion(provider, options) {
      this.provider = provider;
      deprecate('`Suggestion` is no longer supported. Please switch to the new API: https://github.com/atom-community/autocomplete-plus/wiki/Provider-API');
      if (options.word != null) {
        this.word = options.word;
      }
      if (options.prefix != null) {
        this.prefix = options.prefix;
      }
      if (options.label != null) {
        this.label = options.label;
      }
      if (options.data != null) {
        this.data = options.data;
      }
      if (options.renderLabelAsHtml != null) {
        this.renderLabelAsHtml = options.renderLabelAsHtml;
      }
      if (options.className != null) {
        this.className = options.className;
      }
    }

    return Suggestion;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBOztBQUFBLEVBQUMsWUFBYSxPQUFBLENBQVEsTUFBUixFQUFiLFNBQUQsQ0FBQTs7QUFBQSxFQUNBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLG9CQUFFLFFBQUYsRUFBWSxPQUFaLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUEsU0FBQSxDQUFVLDBJQUFWLENBQUEsQ0FBQTtBQUNBLE1BQUEsSUFBd0Isb0JBQXhCO0FBQUEsUUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLE9BQU8sQ0FBQyxJQUFoQixDQUFBO09BREE7QUFFQSxNQUFBLElBQTRCLHNCQUE1QjtBQUFBLFFBQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFPLENBQUMsTUFBbEIsQ0FBQTtPQUZBO0FBR0EsTUFBQSxJQUEwQixxQkFBMUI7QUFBQSxRQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDLEtBQWpCLENBQUE7T0FIQTtBQUlBLE1BQUEsSUFBd0Isb0JBQXhCO0FBQUEsUUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLE9BQU8sQ0FBQyxJQUFoQixDQUFBO09BSkE7QUFLQSxNQUFBLElBQWtELGlDQUFsRDtBQUFBLFFBQUEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLE9BQU8sQ0FBQyxpQkFBN0IsQ0FBQTtPQUxBO0FBTUEsTUFBQSxJQUFrQyx5QkFBbEM7QUFBQSxRQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDLFNBQXJCLENBQUE7T0FQVztJQUFBLENBQWI7O3NCQUFBOztNQUhGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-plus/lib/suggestion.coffee