(function() {
  var BufferedProcess, PlantUml, fs;

  BufferedProcess = require('atom').BufferedProcess;

  fs = require('fs-plus');

  module.exports = PlantUml = (function() {
    function PlantUml() {}

    PlantUml.writeAndOpenPng = function(umlFilePath, pngFilePath, charset) {
      var args, command, exit, startTime;
      command = 'plantuml';
      args = ['-failfast2', umlFilePath];
      if (charset) {
        args = args.concat('-charset', charset);
      }
      exit = function(code) {
        if (PlantUml.isRegeneratedPng(pngFilePath, startTime)) {
          return atom.workspace.open(pngFilePath, {
            split: 'right',
            activatePane: false
          });
        } else {
          return atom.notifications.addWarning('PlantUml could not generate file.', {
            detail: 'Please make sure PlantUml can write to location of original file.'
          });
        }
      };
      startTime = Date.now();
      return new BufferedProcess({
        command: command,
        args: args,
        exit: exit
      });
    };

    PlantUml.isRegeneratedPng = function(pngFilePath, startTime) {
      return fs.isFileSync(pngFilePath) && fs.statSync(pngFilePath).mtime > startTime;
    };

    return PlantUml;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9wbGFudHVtbC1nZW5lcmF0b3IvbGliL3BsYW50dW1sLXV0aWxzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2QkFBQTs7QUFBQSxFQUFDLGtCQUFtQixPQUFBLENBQVEsTUFBUixFQUFuQixlQUFELENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FETCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsa0JBQUEsR0FBQSxDQUFiOztBQUFBLElBQ0EsUUFBQyxDQUFBLGVBQUQsR0FBaUIsU0FBQyxXQUFELEVBQWMsV0FBZCxFQUEyQixPQUEzQixHQUFBO0FBQ2YsVUFBQSw4QkFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLFVBQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLENBQUMsWUFBRCxFQUFlLFdBQWYsQ0FEUCxDQUFBO0FBRUEsTUFBQSxJQUFHLE9BQUg7QUFDRSxRQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsTUFBTCxDQUFZLFVBQVosRUFBd0IsT0FBeEIsQ0FBUCxDQURGO09BRkE7QUFBQSxNQUlBLElBQUEsR0FBTyxTQUFDLElBQUQsR0FBQTtBQUNMLFFBQUEsSUFBRyxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsV0FBMUIsRUFBdUMsU0FBdkMsQ0FBSDtpQkFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsV0FBcEIsRUFBaUM7QUFBQSxZQUMvQixLQUFBLEVBQU8sT0FEd0I7QUFBQSxZQUUvQixZQUFBLEVBQWMsS0FGaUI7V0FBakMsRUFERjtTQUFBLE1BQUE7aUJBTUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QixtQ0FBOUIsRUFBbUU7QUFBQSxZQUNqRSxNQUFBLEVBQU8sbUVBRDBEO1dBQW5FLEVBTkY7U0FESztNQUFBLENBSlAsQ0FBQTtBQUFBLE1BZUEsU0FBQSxHQUFZLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FmWixDQUFBO2FBZ0JJLElBQUEsZUFBQSxDQUFnQjtBQUFBLFFBQUMsU0FBQSxPQUFEO0FBQUEsUUFBVSxNQUFBLElBQVY7QUFBQSxRQUFnQixNQUFBLElBQWhCO09BQWhCLEVBakJXO0lBQUEsQ0FEakIsQ0FBQTs7QUFBQSxJQW9CQSxRQUFDLENBQUEsZ0JBQUQsR0FBa0IsU0FBQyxXQUFELEVBQWMsU0FBZCxHQUFBO2FBQ2hCLEVBQUUsQ0FBQyxVQUFILENBQWMsV0FBZCxDQUFBLElBQStCLEVBQUUsQ0FBQyxRQUFILENBQVksV0FBWixDQUF3QixDQUFDLEtBQXpCLEdBQWlDLFVBRGhEO0lBQUEsQ0FwQmxCLENBQUE7O29CQUFBOztNQUxGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/mk2/.atom/packages/plantuml-generator/lib/plantuml-utils.coffee
