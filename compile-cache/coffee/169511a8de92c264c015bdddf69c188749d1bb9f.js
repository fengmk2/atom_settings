(function() {
  var path;

  path = require('path');

  module.exports = {
    config: {
      jshintExecutablePath: {
        "default": path.join(__dirname, '..', 'node_modules', 'jshint', 'bin'),
        title: 'JSHint Executable Path',
        type: 'string'
      },
      disableWhenNoJshintrcFileInPath: {
        "default": false,
        title: 'Disable when no .jshintrc file found in path',
        type: 'boolean'
      }
    },
    activate: function() {
      return console.log('activate linter-jshint');
    }
  };

}).call(this);
