(function() {
  var BufferedNodeProcess, BufferedProcess, Helpers, XRegExp, fs, path, xcache, _ref;

  _ref = require('atom'), BufferedProcess = _ref.BufferedProcess, BufferedNodeProcess = _ref.BufferedNodeProcess;

  path = require('path');

  fs = require('fs');

  path = require('path');

  xcache = new Map;

  XRegExp = null;

  module.exports = Helpers = {
    exec: function(command, args, options) {
      if (args == null) {
        args = [];
      }
      if (options == null) {
        options = {};
      }
      if (!arguments.length) {
        throw new Error("Nothing to execute.");
      }
      return this._exec(command, args, options, false);
    },
    execNode: function(filePath, args, options) {
      if (args == null) {
        args = [];
      }
      if (options == null) {
        options = {};
      }
      if (!arguments.length) {
        throw new Error("Nothing to execute.");
      }
      return this._exec(filePath, args, options, true);
    },
    _exec: function(command, args, options, isNodeExecutable) {
      if (args == null) {
        args = [];
      }
      if (options == null) {
        options = {};
      }
      if (isNodeExecutable == null) {
        isNodeExecutable = false;
      }
      if (options.stream == null) {
        options.stream = 'stdout';
      }
      if (options.throwOnStdErr == null) {
        options.throwOnStdErr = false;
      }
      return new Promise(function(resolve, reject) {
        var data, exit, prop, spawnedProcess, stderr, stdout, value, _ref1;
        data = {
          stdout: [],
          stderr: []
        };
        stdout = function(output) {
          return data.stdout.push(output.toString());
        };
        stderr = function(output) {
          return data.stderr.push(output.toString());
        };
        exit = function() {
          if (options.stream === 'stdout') {
            if (data.stderr.length && options.throwOnStdErr) {
              return reject(data.stderr.join(''));
            } else {
              return resolve(data.stdout.join(''));
            }
          } else {
            return resolve(data.stderr.join(''));
          }
        };
        if (isNodeExecutable) {
          if (options.env == null) {
            options.env = {};
          }
          _ref1 = process.env;
          for (prop in _ref1) {
            value = _ref1[prop];
            if (prop !== 'OS') {
              options.env[prop] = value;
            }
          }
          spawnedProcess = new BufferedNodeProcess({
            command: command,
            args: args,
            options: options,
            stdout: stdout,
            stderr: stderr,
            exit: exit
          });
        } else {
          spawnedProcess = new BufferedProcess({
            command: command,
            args: args,
            stdout: stdout,
            stderr: stderr,
            exit: exit
          });
        }
        spawnedProcess.onWillThrowError(reject);
        if (options.stdin) {
          spawnedProcess.process.stdin.write(options.stdin.toString());
          return spawnedProcess.process.stdin.end();
        }
      });
    },
    parse: function(data, rawRegex, options) {
      var colEnd, colStart, filePath, line, lineEnd, lineStart, match, regex, toReturn, _i, _len, _ref1;
      if (options == null) {
        options = {
          baseReduction: 1
        };
      }
      if (!arguments.length) {
        throw new Error("Nothing to parse");
      }
      if (XRegExp == null) {
        XRegExp = require('xregexp').XRegExp;
      }
      toReturn = [];
      if (xcache.has(rawRegex)) {
        regex = xcache.get(rawRegex);
      } else {
        xcache.set(rawRegex, regex = XRegExp(rawRegex));
      }
      if (typeof data !== 'string') {
        throw new Error("Input must be a string");
      }
      _ref1 = data.split(/\r?\n/);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        line = _ref1[_i];
        match = XRegExp.exec(line, regex);
        if (match) {
          if (!options.baseReduction) {
            options.baseReduction = 1;
          }
          lineStart = 0;
          if (match.line) {
            lineStart = match.line - options.baseReduction;
          }
          if (match.lineStart) {
            lineStart = match.lineStart - options.baseReduction;
          }
          colStart = 0;
          if (match.col) {
            colStart = match.col - options.baseReduction;
          }
          if (match.colStart) {
            colStart = match.colStart - options.baseReduction;
          }
          lineEnd = 0;
          if (match.line) {
            lineEnd = match.line - options.baseReduction;
          }
          if (match.lineEnd) {
            lineEnd = match.lineEnd - options.baseReduction;
          }
          colEnd = 0;
          if (match.col) {
            colEnd = match.col - options.baseReduction;
          }
          if (match.colEnd) {
            colEnd = match.colEnd - options.baseReduction;
          }
          filePath = match.file;
          if (options.filePath) {
            filePath = options.filePath;
          }
          toReturn.push({
            type: match.type,
            text: match.message,
            filePath: filePath,
            range: [[lineStart, colStart], [lineEnd, colEnd]]
          });
        }
      }
      return toReturn;
    },
    findFile: function(startDir, names) {
      var currentDir, filePath, name, _i, _len;
      if (!arguments.length) {
        throw new Error("Specify a filename to find");
      }
      if (!(names instanceof Array)) {
        names = [names];
      }
      startDir = startDir.split(path.sep);
      while (startDir.length) {
        currentDir = startDir.join(path.sep);
        for (_i = 0, _len = names.length; _i < _len; _i++) {
          name = names[_i];
          filePath = path.join(currentDir, name);
          try {
            fs.accessSync(filePath, fs.R_OK);
            return filePath;
          } catch (_error) {}
        }
        startDir.pop();
      }
      return null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L25vZGVfbW9kdWxlcy9hdG9tLWxpbnRlci9saWIvaGVscGVycy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOEVBQUE7O0FBQUEsRUFBQSxPQUF5QyxPQUFBLENBQVEsTUFBUixDQUF6QyxFQUFDLHVCQUFBLGVBQUQsRUFBa0IsMkJBQUEsbUJBQWxCLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUhQLENBQUE7O0FBQUEsRUFJQSxNQUFBLEdBQVMsR0FBQSxDQUFBLEdBSlQsQ0FBQTs7QUFBQSxFQUtBLE9BQUEsR0FBVSxJQUxWLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUFpQixPQUFBLEdBSWY7QUFBQSxJQUFBLElBQUEsRUFBTSxTQUFDLE9BQUQsRUFBVSxJQUFWLEVBQXFCLE9BQXJCLEdBQUE7O1FBQVUsT0FBTztPQUNyQjs7UUFEeUIsVUFBVTtPQUNuQztBQUFBLE1BQUEsSUFBQSxDQUFBLFNBQXNELENBQUMsTUFBdkQ7QUFBQSxjQUFVLElBQUEsS0FBQSxDQUFNLHFCQUFOLENBQVYsQ0FBQTtPQUFBO0FBQ0EsYUFBTyxJQUFDLENBQUEsS0FBRCxDQUFPLE9BQVAsRUFBZ0IsSUFBaEIsRUFBc0IsT0FBdEIsRUFBK0IsS0FBL0IsQ0FBUCxDQUZJO0lBQUEsQ0FBTjtBQUFBLElBSUEsUUFBQSxFQUFVLFNBQUMsUUFBRCxFQUFXLElBQVgsRUFBc0IsT0FBdEIsR0FBQTs7UUFBVyxPQUFPO09BQzFCOztRQUQ4QixVQUFVO09BQ3hD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

//# sourceURL=/Users/mk2/.atom/packages/linter-eslint/node_modules/atom-linter/lib/helpers.coffee
