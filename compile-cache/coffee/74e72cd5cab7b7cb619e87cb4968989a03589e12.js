(function() {
  var path;

  path = require('path');

  module.exports = {
    configDefaults: {
      csslintExecutablePath: path.join(__dirname, '..', 'node_modules', '.bin')
    },
    activate: function() {
      return console.log('activate linter-csslint');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsY0FBQSxFQUNFO0FBQUEsTUFBQSxxQkFBQSxFQUF1QixJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsSUFBckIsRUFBMkIsY0FBM0IsRUFBMkMsTUFBM0MsQ0FBdkI7S0FERjtBQUFBLElBR0EsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLE9BQU8sQ0FBQyxHQUFSLENBQVkseUJBQVosRUFEUTtJQUFBLENBSFY7R0FIRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/mk2/.atom/packages/linter-csslint/lib/init.coffee