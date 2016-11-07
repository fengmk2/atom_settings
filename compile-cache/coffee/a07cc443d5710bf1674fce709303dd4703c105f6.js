(function() {
  var CompositeDisposable, Linter, LinterHtmlhint, findFile, linterPath,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  linterPath = atom.packages.getLoadedPackage("linter").path;

  Linter = require("" + linterPath + "/lib/linter");

  findFile = require("" + linterPath + "/lib/utils").findFile;

  CompositeDisposable = require("atom").CompositeDisposable;

  LinterHtmlhint = (function(_super) {
    __extends(LinterHtmlhint, _super);

    LinterHtmlhint.syntax = ['text.html.basic'];

    LinterHtmlhint.prototype.cmd = ['htmlhint', '--verbose', '--extract=auto'];

    LinterHtmlhint.prototype.linterName = 'htmlhint';

    LinterHtmlhint.prototype.regex = 'line (?<line>[0-9]+), col (?<col>[0-9]+): (?<message>.+)';

    LinterHtmlhint.prototype.isNodeExecutable = true;

    LinterHtmlhint.prototype.setupHtmlHintRc = function() {
      var config, fileName, htmlHintRcPath;
      htmlHintRcPath = atom.config.get('linter.linter-htmlhint.htmlhintRcFilePath') || this.cwd;
      fileName = atom.config.get('linter.linter-htmlhint.htmlhintRcFileName') || '.htmlhintrc';
      config = findFile(htmlHintRcPath, [fileName]);
      if (config) {
        return this.cmd = this.cmd.concat(['-c', config]);
      }
    };

    function LinterHtmlhint(editor) {
      this.formatShellCmd = __bind(this.formatShellCmd, this);
      this.setupHtmlHintRc = __bind(this.setupHtmlHintRc, this);
      LinterHtmlhint.__super__.constructor.call(this, editor);
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.config.observe('linter-htmlhint.htmlhintExecutablePath', this.formatShellCmd));
      this.disposables.add(atom.config.observe('linter-htmlhint.htmlHintRcFilePath', this.setupHtmlHintRc));
      this.disposables.add(atom.config.observe('linter-htmlhint.htmlHintRcFileName', this.setupHtmlHintRc));
    }

    LinterHtmlhint.prototype.formatShellCmd = function() {
      var htmlhintExecutablePath;
      htmlhintExecutablePath = atom.config.get('linter-htmlhint.htmlhintExecutablePath');
      return this.executablePath = "" + htmlhintExecutablePath;
    };

    LinterHtmlhint.prototype.formatMessage = function(match) {
      return ("" + match.message).slice(5, -5).replace("<", "&lt;");
    };

    LinterHtmlhint.prototype.destroy = function() {
      LinterHtmlhint.__super__.destroy.apply(this, arguments);
      return this.disposables.dispose();
    };

    return LinterHtmlhint;

  })(Linter);

  module.exports = LinterHtmlhint;

}).call(this);
