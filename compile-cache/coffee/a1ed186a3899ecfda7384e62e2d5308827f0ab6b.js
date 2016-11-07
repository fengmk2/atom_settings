(function() {
  var path;

  path = require('path');

  module.exports = {
    config: {
      jsYamlExecutablePath: {
        "default": path.join(__dirname, '..', 'node_modules', 'js-yaml', 'bin'),
        title: 'Js Yaml Executable Path',
        type: 'string'
      }
    },
    activate: function() {
      return console.log('activate linter-js-yaml');
    }
  };

}).call(this);
