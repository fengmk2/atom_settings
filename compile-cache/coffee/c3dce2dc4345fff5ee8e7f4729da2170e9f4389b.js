(function() {
  var Linter, LinterGolint, linterPath,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  linterPath = atom.packages.getLoadedPackage("linter").path;

  Linter = require("" + linterPath + "/lib/linter");

  LinterGolint = (function(_super) {
    __extends(LinterGolint, _super);

    LinterGolint.syntax = 'source.go';

    LinterGolint.prototype.cmd = 'golint';

    LinterGolint.prototype.linterName = 'golint';

    LinterGolint.prototype.regex = '.+?:(?<line>\\d+):(?<col>\\d+): (?<message>.+)';

    function LinterGolint(editor) {
      LinterGolint.__super__.constructor.call(this, editor);
      atom.config.observe('linter-golint.golintExecutablePath', (function(_this) {
        return function() {
          return _this.executablePath = atom.config.get('linter-golint.golintExecutablePath');
        };
      })(this));
    }

    LinterGolint.prototype.destroy = function() {
      return atom.config.unobserve('linter-golint.golintExecutablePath');
    };

    return LinterGolint;

  })(Linter);

  module.exports = LinterGolint;

}).call(this);
