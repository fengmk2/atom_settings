(function() {
  module.exports = {
    configDefaults: {
      golintExecutablePath: ""
    },
    activate: function() {
      return console.log('activate linter-golint');
    }
  };

}).call(this);
