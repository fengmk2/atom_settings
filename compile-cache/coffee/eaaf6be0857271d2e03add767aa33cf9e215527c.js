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
      atom.config.observe('linter-golint.golintExecutablePath', function(newValue) {
        return this.executablePath = atom.config.get('linter-golint.golintExecutablePath');
      });
    }

    return LinterGolint;

  })(Linter);

  module.exports = LinterGolint;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXItZ29saW50L2xpYi9saW50ZXItZ29saW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnQ0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsUUFBL0IsQ0FBd0MsQ0FBQyxJQUF0RCxDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxFQUFBLEdBQUcsVUFBSCxHQUFjLGFBQXRCLENBRFQsQ0FBQTs7QUFBQSxFQUdNO0FBR0osbUNBQUEsQ0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxNQUFELEdBQVMsV0FBVCxDQUFBOztBQUFBLDJCQUlBLEdBQUEsR0FBSyxRQUpMLENBQUE7O0FBQUEsMkJBTUEsVUFBQSxHQUFZLFFBTlosQ0FBQTs7QUFBQSwyQkFTQSxLQUFBLEdBQ0UsZ0RBVkYsQ0FBQTs7QUFZYSxJQUFBLHNCQUFDLE1BQUQsR0FBQTtBQUNYLE1BQUEsOENBQU0sTUFBTixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixvQ0FBcEIsRUFBMEQsU0FBQyxRQUFELEdBQUE7ZUFDeEQsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9DQUFoQixFQURzQztNQUFBLENBQTFELENBREEsQ0FEVztJQUFBLENBWmI7O3dCQUFBOztLQUh5QixPQUgzQixDQUFBOztBQUFBLEVBdUJBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFlBdkJqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/mk2/.atom/packages/linter-golint/lib/linter-golint.coffee
