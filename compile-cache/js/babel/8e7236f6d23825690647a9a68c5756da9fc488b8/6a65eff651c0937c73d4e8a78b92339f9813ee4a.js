'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Promise = require('bluebird');
var readdir = Promise.promisify(require('fs').readdir);
var path = require('path');
var fuzzaldrin = require('fuzzaldrin');
var escapeRegExp = require('lodash.escaperegexp');
var internalModules = require('./internal-modules');

var CompletionProvider = (function () {
  function CompletionProvider() {
    _classCallCheck(this, CompletionProvider);

    this.selector = '.source.js .string.quoted, .source.coffee .string.quoted';
    this.disableForSelector = '.source.js .comment, source.js .keyword';
    this.inclusionPriority = 1;
  }

  _createClass(CompletionProvider, [{
    key: 'getSuggestions',
    value: function getSuggestions(_ref) {
      var editor = _ref.editor;
      var bufferPosition = _ref.bufferPosition;
      var prefix = _ref.prefix;

      var line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      if (!/require|import/.test(line)) {
        return [];
      }

      var realPrefixRegExp = new RegExp('[\'"]((?:.+?)*' + escapeRegExp(prefix) + ')');
      try {
        var realPrefixMathes = realPrefixRegExp.exec(line);
        if (!realPrefixMathes) {
          return [];
        }

        var realPrefix = realPrefixMathes[1];

        if (realPrefix[0] === '.') {
          return this.lookupLocal(realPrefix, path.dirname(editor.getPath()));
        }

        return this.lookupGlobal(realPrefix);
      } catch (e) {
        return [];
      }
    }
  }, {
    key: 'filterSuggestions',
    value: function filterSuggestions(prefix, suggestions) {
      return fuzzaldrin.filter(suggestions, prefix, {
        key: 'text'
      });
    }
  }, {
    key: 'lookupLocal',
    value: function lookupLocal(prefix, dirname) {
      var _this = this;

      var filterPrefix = prefix.replace(path.dirname(prefix), '').replace('/', '');
      if (filterPrefix[filterPrefix.length - 1] === '/') {
        filterPrefix = '';
      }
      var lookupDirname = path.resolve(dirname, prefix).replace(new RegExp(filterPrefix + '$'), '');

      return readdir(lookupDirname).filter(function (filename) {
        return filename[0] !== '.';
      }).map(function (pathname) {
        return {
          text: _this.normalizeLocal(pathname),
          displayText: pathname,
          type: 'package'
        };
      }).then(function (suggestions) {
        return _this.filterSuggestions(filterPrefix, suggestions);
      })['catch'](function (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }
      });
    }
  }, {
    key: 'normalizeLocal',
    value: function normalizeLocal(filename) {
      return filename.replace(/\.(js|es6|jsx|coffee)$/, '');
    }
  }, {
    key: 'lookupGlobal',
    value: function lookupGlobal(prefix) {
      var _this2 = this;

      var projectPath = atom.project.getPaths()[0];
      if (!projectPath) {
        return [];
      }

      var nodeModulesPath = path.join(projectPath, 'node_modules');
      if (prefix.indexOf('/') !== -1) {
        return this.lookupLocal('./' + prefix, nodeModulesPath);
      }

      return readdir(nodeModulesPath).then(function (libs) {
        return libs.concat(internalModules);
      }).map(function (lib) {
        return {
          text: lib,
          type: 'package'
        };
      }).then(function (suggestions) {
        return _this2.filterSuggestions(prefix, suggestions);
      })['catch'](function (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }
      });
    }
  }]);

  return CompletionProvider;
})();

module.exports = CompletionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLW1vZHVsZXMvc3JjL2NvbXBsZXRpb24tcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7QUFFWixJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDcEMsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekQsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN6QyxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNwRCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7SUFFaEQsa0JBQWtCO0FBQ1gsV0FEUCxrQkFBa0IsR0FDUjswQkFEVixrQkFBa0I7O0FBRXBCLFFBQUksQ0FBQyxRQUFRLEdBQUcsMERBQTBELENBQUM7QUFDM0UsUUFBSSxDQUFDLGtCQUFrQixHQUFHLHlDQUF5QyxDQUFDO0FBQ3BFLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7R0FDNUI7O2VBTEcsa0JBQWtCOztXQU9SLHdCQUFDLElBQWdDLEVBQUU7VUFBakMsTUFBTSxHQUFQLElBQWdDLENBQS9CLE1BQU07VUFBRSxjQUFjLEdBQXZCLElBQWdDLENBQXZCLGNBQWM7VUFBRSxNQUFNLEdBQS9CLElBQWdDLENBQVAsTUFBTTs7QUFDNUMsVUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO0FBQzlFLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJ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VyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQy9ELFVBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUM5QixlQUFPLElBQUksQ0FBQyxXQUFXLFFBQU0sTUFBTSxFQUFJLGVBQWUsQ0FBQyxDQUFDO09BQ3pEOztBQUVELGFBQU8sT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSztBQUM3QyxlQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7T0FDckMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUNkLGVBQU87QUFDTCxjQUFJLEVBQUUsR0FBRztBQUNULGNBQUksRUFBRSxTQUFTO1NBQ2hCLENBQUM7T0FDSCxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsV0FBVyxFQUFLO0FBQ3ZCLGVBQU8sT0FBSyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7T0FDcEQsQ0FBQyxTQUFNLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDZCxZQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ3ZCLGdCQUFNLENBQUMsQ0FBQztTQUNUO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztTQTNGRyxrQkFBa0I7OztBQThGeEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiIvVXNlcnMvbWsyLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1tb2R1bGVzL3NyYy9jb21wbGV0aW9uLXByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuY29uc3QgcmVhZGRpciA9IFByb21pc2UucHJvbWlzaWZ5KHJlcXVpcmUoJ2ZzJykucmVhZGRpcik7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgZnV6emFsZHJpbiA9IHJlcXVpcmUoJ2Z1enphbGRyaW4nKTtcbmNvbnN0IGVzY2FwZVJlZ0V4cCA9IHJlcXVpcmUoJ2xvZGFzaC5lc2NhcGVyZWdleHAnKTtcbmNvbnN0IGludGVybmFsTW9kdWxlcyA9IHJlcXVpcmUoJy4vaW50ZXJuYWwtbW9kdWxlcycpO1xuXG5jbGFzcyBDb21wbGV0aW9uUHJvdmlkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gJy5zb3VyY2UuanMgLnN0cmluZy5xdW90ZWQsIC5zb3VyY2UuY29mZmVlIC5zdHJpbmcucXVvdGVkJztcbiAgICB0aGlzLmRpc2FibGVGb3JTZWxlY3RvciA9ICcuc291cmNlLmpzIC5jb21tZW50LCBzb3VyY2UuanMgLmtleXdvcmQnO1xuICAgIHRoaXMuaW5jbHVzaW9uUHJpb3JpdHkgPSAxO1xuICB9XG5cbiAgZ2V0U3VnZ2VzdGlvbnMoe2VkaXRvciwgYnVmZmVyUG9zaXRpb24sIHByZWZpeH0pIHtcbiAgICBjb25zdCBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKTtcbiAgICBpZiAoIS9yZXF1aXJlfGltcG9ydC8udGVzdChsaW5lKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IHJlYWxQcmVmaXhSZWdFeHAgPSBuZXcgUmVnRXhwKGBbJ1wiXSgoPzouKz8pKiR7ZXNjYXBlUmVnRXhwKHByZWZpeCl9KWApO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZWFsUHJlZml4TWF0aGVzID0gcmVhbFByZWZpeFJlZ0V4cC5leGVjKGxpbmUpO1xuICAgICAgaWYgKCFyZWFsUHJlZml4TWF0aGVzKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVhbFByZWZpeCA9IHJlYWxQcmVmaXhNYXRoZXNbMV07XG5cbiAgICAgIGlmIChyZWFsUHJlZml4WzBdID09PSAnLicpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9va3VwTG9jYWwocmVhbFByZWZpeCwgcGF0aC5kaXJuYW1lKGVkaXRvci5nZXRQYXRoKCkpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMubG9va3VwR2xvYmFsKHJlYWxQcmVmaXgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICBmaWx0ZXJTdWdnZXN0aW9ucyhwcmVmaXgsIHN1Z2dlc3Rpb25zKSB7XG4gICAgcmV0dXJuIGZ1enphbGRyaW4uZmlsdGVyKHN1Z2dlc3Rpb25zLCBwcmVmaXgsIHtcbiAgICAgIGtleTogJ3RleHQnXG4gICAgfSk7XG4gIH1cblxuICBsb29rdXBMb2NhbChwcmVmaXgsIGRpcm5hbWUpIHtcbiAgICBsZXQgZmlsdGVyUHJlZml4ID0gcHJlZml4LnJlcGxhY2UocGF0aC5kaXJuYW1lKHByZWZpeCksICcnKS5yZXBsYWNlKCcvJywgJycpO1xuICAgIGlmIChmaWx0ZXJQcmVmaXhbZmlsdGVyUHJlZml4Lmxlbmd0aCAtIDFdID09PSAnLycpIHtcbiAgICAgIGZpbHRlclByZWZpeCA9ICcnO1xuICAgIH1cbiAgICBjb25zdCBsb29rdXBEaXJuYW1lID0gcGF0aC5yZXNvbHZlKGRpcm5hbWUsIHByZWZpeCkucmVwbGFjZShuZXcgUmVnRXhwKGAke2ZpbHRlclByZWZpeH0kYCksICcnKTtcblxuICAgIHJldHVybiByZWFkZGlyKGxvb2t1cERpcm5hbWUpLmZpbHRlcigoZmlsZW5hbWUpID0+IHtcbiAgICAgIHJldHVybiBmaWxlbmFtZVswXSAhPT0gJy4nO1xuICAgIH0pLm1hcCgocGF0aG5hbWUpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRleHQ6IHRoaXMubm9ybWFsaXplTG9jYWwocGF0aG5hbWUpLFxuICAgICAgICBkaXNwbGF5VGV4dDogcGF0aG5hbWUsXG4gICAgICAgIHR5cGU6ICdwYWNrYWdlJ1xuICAgICAgfTtcbiAgICB9KS50aGVuKChzdWdnZXN0aW9ucykgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyU3VnZ2VzdGlvbnMoZmlsdGVyUHJlZml4LCBzdWdnZXN0aW9ucyk7XG4gICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgIGlmIChlLmNvZGUgIT09ICdFTk9FTlQnKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBub3JtYWxpemVMb2NhbChmaWxlbmFtZSkge1xuICAgIHJldHVybiBmaWxlbmFtZS5yZXBsYWNlKC9cXC4oanN8ZXM2fGpzeHxjb2ZmZWUpJC8sICcnKTtcbiAgfVxuXG4gIGxvb2t1cEdsb2JhbChwcmVmaXgpIHtcbiAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdO1xuICAgIGlmICghcHJvamVjdFBhdGgpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlTW9kdWxlc1BhdGggPSBwYXRoLmpvaW4ocHJvamVjdFBhdGgsICdub2RlX21vZHVsZXMnKTtcbiAgICBpZiAocHJlZml4LmluZGV4T2YoJy8nKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvb2t1cExvY2FsKGAuLyR7cHJlZml4fWAsIG5vZGVNb2R1bGVzUGF0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlYWRkaXIobm9kZU1vZHVsZXNQYXRoKS50aGVuKChsaWJzKSA9PiB7XG4gICAgICByZXR1cm4gbGlicy5jb25jYXQoaW50ZXJuYWxNb2R1bGVzKTtcbiAgICB9KS5tYXAoKGxpYikgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGV4dDogbGliLFxuICAgICAgICB0eXBlOiAncGFja2FnZSdcbiAgICAgIH07XG4gICAgfSkudGhlbigoc3VnZ2VzdGlvbnMpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmZpbHRlclN1Z2dlc3Rpb25zKHByZWZpeCwgc3VnZ2VzdGlvbnMpO1xuICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICBpZiAoZS5jb2RlICE9PSAnRU5PRU5UJykge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcGxldGlvblByb3ZpZGVyO1xuIl19
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-modules/src/completion-provider.js
