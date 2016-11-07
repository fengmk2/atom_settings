(function() {
  var CSON, SnippetsLoader, async, fs, path;

  CSON = require('season');

  async = require('async');

  path = require('path');

  fs = require('fs-plus');

  module.exports = SnippetsLoader = (function() {
    SnippetsLoader.prototype.loaded = false;

    function SnippetsLoader(editor) {
      this.editor = editor;
      this.grammar = this.editor.getGrammar();
    }

    SnippetsLoader.prototype.getUserSnippetsPath = function() {
      var userSnippetsPath;
      userSnippetsPath = CSON.resolve(path.join(atom.getConfigDirPath(), 'snippets'));
      return userSnippetsPath != null ? userSnippetsPath : path.join(atom.getConfigDirPath(), 'snippets.cson');
    };

    SnippetsLoader.prototype.loadAll = function(callback) {
      this.snippets = {};
      return this.loadUserSnippets((function(_this) {
        return function() {
          return _this.loadSyntaxPackages(function() {
            atom.packages.emit('autocomplete-snippets:loaded');
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
      var grammarPath, packagePath;
      grammarPath = this.grammar.path;
      if (grammarPath) {
        packagePath = path.resolve(grammarPath, '..' + path.sep + '..');
        return this.loadSnippetsDirectory(path.join(packagePath, 'snippets'), (function(_this) {
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
        if (selector.indexOf(this.grammar.scopeName) === -1 && selector.indexOf('*') === -1) {
          continue;
        }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFDQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUixDQURSLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw2QkFBQSxNQUFBLEdBQVEsS0FBUixDQUFBOztBQUNhLElBQUEsd0JBQUUsTUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FBWCxDQURXO0lBQUEsQ0FEYjs7QUFBQSw2QkFJQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7QUFDbkIsVUFBQSxnQkFBQTtBQUFBLE1BQUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxnQkFBTCxDQUFBLENBQVYsRUFBbUMsVUFBbkMsQ0FBYixDQUFuQixDQUFBO3dDQUNBLG1CQUFtQixJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxnQkFBTCxDQUFBLENBQVYsRUFBbUMsZUFBbkMsRUFGQTtJQUFBLENBSnJCLENBQUE7O0FBQUEsNkJBUUEsT0FBQSxHQUFTLFNBQUMsUUFBRCxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLEVBQVosQ0FBQTthQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNoQixLQUFDLENBQUEsa0JBQUQsQ0FBb0IsU0FBQSxHQUFBO0FBQ2xCLFlBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFkLENBQW1CLDhCQUFuQixDQUFBLENBQUE7QUFBQSxZQUNBLEtBQUMsQ0FBQSxNQUFELEdBQVUsSUFEVixDQUFBO29EQUVBLFNBQVUsS0FBQyxDQUFBLG1CQUhPO1VBQUEsQ0FBcEIsRUFEZ0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQixFQUZPO0lBQUEsQ0FSVCxDQUFBOztBQUFBLDZCQWdCQSxnQkFBQSxHQUFrQixTQUFDLFFBQUQsR0FBQTtBQUNoQixVQUFBLHNCQUFBOztZQUFpQixDQUFFLEdBQW5CLENBQUE7T0FBQTtBQUFBLE1BQ0EsZ0JBQUEsR0FBbUIsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FEbkIsQ0FBQTthQUVBLEVBQUUsQ0FBQyxJQUFILENBQVEsZ0JBQVIsRUFBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUN4QixVQUFBLG1CQUFHLElBQUksQ0FBRSxNQUFOLENBQUEsVUFBSDttQkFDRSxLQUFDLENBQUEsZ0JBQUQsQ0FBa0IsZ0JBQWxCLEVBQW9DLFFBQXBDLEVBREY7V0FBQSxNQUFBO29EQUdFLG9CQUhGO1dBRHdCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUIsRUFIZ0I7SUFBQSxDQWhCbEIsQ0FBQTs7QUFBQSw2QkF5QkEsa0JBQUEsR0FBb0IsU0FBQyxRQUFELEdBQUE7QUFDbEIsVUFBQSx3QkFBQTtBQUFBLE1BQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBdkIsQ0FBQTtBQUVBLE1BQUEsSUFBRyxXQUFIO0FBQ0UsUUFBQSxXQUFBLEdBQWMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxXQUFiLEVBQTBCLElBQUEsR0FBTyxJQUFJLENBQUMsR0FBWixHQUFrQixJQUE1QyxDQUFkLENBQUE7ZUFDQSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsSUFBSSxDQUFDLElBQUwsQ0FBVSxXQUFWLEVBQXVCLFVBQXZCLENBQXZCLEVBQTJELENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO29EQUFHLG9CQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0QsRUFGRjtPQUFBLE1BQUE7Z0RBSUUsb0JBSkY7T0FIa0I7SUFBQSxDQXpCcEIsQ0FBQTs7QUFBQSw2QkFrQ0EscUJBQUEsR0FBdUIsU0FBQyxlQUFELEVBQWtCLFFBQWxCLEdBQUE7QUFDckIsTUFBQSxJQUFBLENBQUEsRUFBNEIsQ0FBQyxlQUFILENBQW1CLGVBQW5CLENBQTFCO0FBQUEsZ0RBQU8sbUJBQVAsQ0FBQTtPQUFBO2FBRUEsRUFBRSxDQUFDLE9BQUgsQ0FBVyxlQUFYLEVBQTRCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsRUFBUSxPQUFSLEdBQUE7QUFDMUIsY0FBQSxLQUFBO0FBQUEsVUFBQSxJQUFHLGFBQUg7QUFDRSxZQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsS0FBYixDQUFBLENBQUE7b0RBQ0Esb0JBRkY7V0FBQSxNQUFBO0FBSUUsWUFBQSxLQUFBLEdBQVEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxTQUFDLElBQUQsR0FBQTtxQkFBVSxJQUFJLENBQUMsSUFBTCxDQUFVLGVBQVYsRUFBMkIsSUFBM0IsRUFBVjtZQUFBLENBQVosQ0FBUixDQUFBO21CQUNBLEtBQUssQ0FBQyxVQUFOLENBQWlCLEtBQWpCLEVBQXdCLEtBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixLQUF2QixDQUF4QixFQUFzRCxTQUFBLEdBQUE7c0RBQUcsb0JBQUg7WUFBQSxDQUF0RCxFQUxGO1dBRDBCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUIsRUFIcUI7SUFBQSxDQWxDdkIsQ0FBQTs7QUFBQSw2QkE2Q0EsZ0JBQUEsR0FBa0IsU0FBQyxRQUFELEVBQVcsUUFBWCxHQUFBO0FBQ2hCLE1BQUEsSUFBQSxDQUFBLElBQThCLENBQUMsWUFBTCxDQUFrQixRQUFsQixDQUExQjtBQUFBLGdEQUFPLG1CQUFQLENBQUE7T0FBQTthQUVBLElBQUksQ0FBQyxRQUFMLENBQWMsUUFBZCxFQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBOztZQUFRLFNBQU87V0FDckM7QUFBQSxVQUFBLElBQU8sYUFBUDtBQUNFLFlBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSyxRQUFMLEVBQWUsTUFBZixDQUFBLENBREY7V0FBQTtrREFHQSxvQkFKc0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QixFQUhnQjtJQUFBLENBN0NsQixDQUFBOztBQUFBLDZCQXNEQSxHQUFBLEdBQUssU0FBQyxRQUFELEVBQVcsa0JBQVgsR0FBQTtBQUNILFVBQUEsa0RBQUE7QUFBQTtXQUFBLDhCQUFBO3NEQUFBO0FBRUUsUUFBQSxJQUFHLFFBQVEsQ0FBQyxPQUFULENBQWlCLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBMUIsQ0FBQSxLQUF3QyxDQUFBLENBQXhDLElBQ0gsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsR0FBakIsQ0FBQSxLQUF5QixDQUFBLENBRHpCO0FBRUUsbUJBRkY7U0FBQTtBQUFBOztBQUlBO2VBQUEsdUJBQUE7NENBQUE7QUFDRSxZQUFBLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLEtBQWhCLENBQUE7QUFBQSwyQkFDQSxJQUFDLENBQUEsUUFBUyxDQUFBLEtBQUEsQ0FBVixHQUFtQixRQURuQixDQURGO0FBQUE7O3NCQUpBLENBRkY7QUFBQTtzQkFERztJQUFBLENBdERMLENBQUE7OzBCQUFBOztNQVBGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-snippets/lib/snippets-loader.coffee