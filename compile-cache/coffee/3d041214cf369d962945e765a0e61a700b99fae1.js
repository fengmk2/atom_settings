(function() {
  var CSON, SnippetsLoader, async, fs, path;

  CSON = require("season");

  async = require("async");

  path = require("path");

  fs = require("fs-plus");

  module.exports = SnippetsLoader = (function() {
    SnippetsLoader.prototype.loaded = false;

    function SnippetsLoader(editor) {
      this.editor = editor;
      return;
    }

    SnippetsLoader.prototype.getUserSnippetsPath = function() {
      var userSnippetsPath;
      userSnippetsPath = CSON.resolve(path.join(atom.getConfigDirPath(), "snippets"));
      return userSnippetsPath != null ? userSnippetsPath : path.join(atom.getConfigDirPath(), "snippets.cson");
    };

    SnippetsLoader.prototype.loadAll = function(callback) {
      this.snippets = {};
      return this.loadUserSnippets((function(_this) {
        return function() {
          return _this.loadSyntaxPackages(function() {
            atom.packages.emit("autocomplete-snippets:loaded");
            _this.loaded = true;
            return typeof callback === "function" ? callback(_this.snippets) : void 0;
          });
        };
      })(this));
    };

    SnippetsLoader.prototype.loadUserSnippets = function(callback) {
      var userSnippetsPath, _ref;
      if ((_ref = this.userSnippetsFile) != null) {
        _ref.off();
      }
      userSnippetsPath = this.getUserSnippetsPath();
      return fs.stat(userSnippetsPath, (function(_this) {
        return function(error, stat) {
          if (stat != null ? stat.isFile() : void 0) {
            return _this.loadSnippetsFile(userSnippetsPath, callback);
          } else {
            return typeof callback === "function" ? callback() : void 0;
          }
        };
      })(this));
    };

    SnippetsLoader.prototype.loadSyntaxPackages = function(callback) {
      var grammar, grammarPath, packagePath;
      grammar = this.editor.getGrammar();
      grammarPath = grammar.path;
      if (grammarPath) {
        packagePath = path.resolve(grammarPath, "../..");
        return this.loadSnippetsDirectory(path.join(packagePath, "snippets"), (function(_this) {
          return function() {
            return typeof callback === "function" ? callback() : void 0;
          };
        })(this));
      } else {
        return typeof callback === "function" ? callback() : void 0;
      }
    };

    SnippetsLoader.prototype.loadSnippetsDirectory = function(snippetsDirPath, callback) {
      if (!fs.isDirectorySync(snippetsDirPath)) {
        return typeof callback === "function" ? callback() : void 0;
      }
      return fs.readdir(snippetsDirPath, (function(_this) {
        return function(error, entries) {
          var paths;
          if (error != null) {
            console.warn(error);
            return typeof callback === "function" ? callback() : void 0;
          } else {
            paths = entries.map(function(file) {
              return path.join(snippetsDirPath, file);
            });
            return async.eachSeries(paths, _this.loadSnippetsFile.bind(_this), function() {
              return typeof callback === "function" ? callback() : void 0;
            });
          }
        };
      })(this));
    };

    SnippetsLoader.prototype.loadSnippetsFile = function(filePath, callback) {
      if (!CSON.isObjectPath(filePath)) {
        return typeof callback === "function" ? callback() : void 0;
      }
      return CSON.readFile(filePath, (function(_this) {
        return function(error, object) {
          if (object == null) {
            object = {};
          }
          if (error == null) {
            _this.add(filePath, object);
          }
          return typeof callback === "function" ? callback() : void 0;
        };
      })(this));
    };

    SnippetsLoader.prototype.add = function(filePath, snippetsBySelector) {
      var label, selector, snippet, snippetsByName, _results;
      _results = [];
      for (selector in snippetsBySelector) {
        snippetsByName = snippetsBySelector[selector];
        _results.push((function() {
          var _results1;
          _results1 = [];
          for (label in snippetsByName) {
            snippet = snippetsByName[label];
            snippet.label = label;
            _results1.push(this.snippets[label] = snippet);
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    return SnippetsLoader;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFDQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUixDQURSLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw2QkFBQSxNQUFBLEdBQVEsS0FBUixDQUFBOztBQUNhLElBQUEsd0JBQUUsTUFBRixHQUFBO0FBQWEsTUFBWixJQUFDLENBQUEsU0FBQSxNQUFXLENBQUE7QUFBQSxZQUFBLENBQWI7SUFBQSxDQURiOztBQUFBLDZCQUdBLG1CQUFBLEdBQXFCLFNBQUEsR0FBQTtBQUNuQixVQUFBLGdCQUFBO0FBQUEsTUFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsT0FBTCxDQUFhLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLGdCQUFMLENBQUEsQ0FBVixFQUFtQyxVQUFuQyxDQUFiLENBQW5CLENBQUE7d0NBQ0EsbUJBQW1CLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLGdCQUFMLENBQUEsQ0FBVixFQUFtQyxlQUFuQyxFQUZBO0lBQUEsQ0FIckIsQ0FBQTs7QUFBQSw2QkFPQSxPQUFBLEdBQVMsU0FBQyxRQUFELEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksRUFBWixDQUFBO2FBQ0EsSUFBQyxDQUFBLGdCQUFELENBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ2hCLEtBQUMsQ0FBQSxrQkFBRCxDQUFvQixTQUFBLEdBQUE7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
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-snippets/lib/snippets-loader.coffee