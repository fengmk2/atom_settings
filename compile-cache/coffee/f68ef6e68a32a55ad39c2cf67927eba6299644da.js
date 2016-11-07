(function() {
  var CompositeDisposable, Linter, LinterJshint, findFile, linterPath, warn, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  linterPath = atom.packages.getLoadedPackage("linter").path;

  Linter = require("" + linterPath + "/lib/linter");

  _ref = require("" + linterPath + "/lib/utils"), findFile = _ref.findFile, warn = _ref.warn;

  CompositeDisposable = require("atom").CompositeDisposable;

  LinterJshint = (function(_super) {
    __extends(LinterJshint, _super);

    LinterJshint.syntax = 'source.js';

    LinterJshint.prototype.disableWhenNoJshintrcFileInPath = false;

    LinterJshint.prototype.cmd = ['jshint', '--verbose', '--extract=auto'];

    LinterJshint.prototype.linterName = 'jshint';

    LinterJshint.prototype.defaultLevel = 'info';

    LinterJshint.prototype.regex = '((?<fail>ERROR: .+)|' + '.+?: line (?<line>[0-9]+), col (?<col>[0-9]+), ' + '(?<message>.+) ' + '\\((?<type>(?<error>E)|(?<warning>W)|(?<level>I))(?<code>[0-9]+)\\)' + ')';

    LinterJshint.prototype.isNodeExecutable = true;

    function LinterJshint(editor) {
      this.formatShellCmd = __bind(this.formatShellCmd, this);
      var config, ignore;
      LinterJshint.__super__.constructor.call(this, editor);
      this.disposables = new CompositeDisposable;
      config = findFile(this.cwd, ['.jshintrc']);
      ignore = findFile(this.cwd, ['.jshintignore']);
      if (config) {
        this.cmd = this.cmd.concat(['-c', config]);
      }
      if (ignore) {
        this.cmd = this.cmd.concat(['--exclude-path', ignore]);
      }
      this.disposables.add(atom.config.observe('linter-jshint.jshintExecutablePath', this.formatShellCmd));
      this.disposables.add(atom.config.observe('linter-jshint.disableWhenNoJshintrcFileInPath', (function(_this) {
        return function(skipNonJshint) {
          return _this.disableWhenNoJshintrcFileInPath = skipNonJshint;
        };
      })(this)));
    }

    LinterJshint.prototype.lintFile = function(filePath, callback) {
      if (!this.config && this.disableWhenNoJshintrcFileInPath) {
        return;
      }
      return LinterJshint.__super__.lintFile.call(this, filePath, callback);
    };

    LinterJshint.prototype.formatShellCmd = function() {
      var jshintExecutablePath;
      jshintExecutablePath = atom.config.get('linter-jshint.jshintExecutablePath');
      return this.executablePath = "" + jshintExecutablePath;
    };

    LinterJshint.prototype.formatMessage = function(match) {
      if (!match.type) {
        warn("Regex does not match lint output", match);
      }
      return "" + match.message + " (" + match.type + match.code + ")";
    };

    LinterJshint.prototype.destroy = function() {
      LinterJshint.__super__.destroy.apply(this, arguments);
      return this.disposables.dispose();
    };

    return LinterJshint;

  })(Linter);

  module.exports = LinterJshint;

}).call(this);
