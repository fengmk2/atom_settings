'use strict';
var fs = require('fs');
var path = require('path');
var shjs = require('shelljs');
var cli = require('jshint/src/cli');
var userHome = require('user-home');

// from JSHint //
// Storage for memoized results from find file
// Should prevent lots of directory traversal &
// lookups when liniting an entire project
var findFileResults = {};

/**
 * Searches for a file with a specified name starting with
 * 'dir' and going all the way up either until it finds the file
 * or hits the root.
 *
 * @param {string} name filename to search for (e.g. .jshintrc)
 * @param {string} dir  directory to start search from (default:
 *                      current working directory)
 *
 * @returns {string} normalized filename
 */
function findFile(_x, _x2) {
  var _again = true;

  _function: while (_again) {
    var name = _x,
        dir = _x2;
    filename = parent = undefined;
    _again = false;

    dir = dir || process.cwd();

    var filename = path.normalize(path.join(dir, name));
    if (findFileResults[filename] !== undefined) {
      return findFileResults[filename];
    }

    var parent = path.resolve(dir, '../');

    if (shjs.test('-e', filename)) {
      findFileResults[filename] = filename;
      return filename;
    }

    if (dir === parent) {
      findFileResults[filename] = null;
      return null;
    }

    _x = name;
    _x2 = parent;
    _again = true;
    continue _function;
  }
}

/**
 * Tries to find a configuration file in either project directory
 * or in the home directory. Configuration files are named
 * '.jshintrc'.
 *
 * @param {string} file path to the file to be linted
 * @returns {string} a path to the config file
 */
function findConfig(file) {
  var dir = path.dirname(path.resolve(file));
  var home = path.normalize(path.join(userHome, '.jshintrc'));

  var proj = findFile('.jshintrc', dir);
  if (proj) {
    return proj;
  }

  if (shjs.test('-e', home)) {
    return home;
  }

  return null;
}

/**
 * Tries to find JSHint configuration within a package.json file
 * (if any). It search in the current directory and then goes up
 * all the way to the root just like findFile.
 *
 * @param   {string} file path to the file to be linted
 * @returns {object} config object
 */
function loadNpmConfig(file) {
  var dir = path.dirname(path.resolve(file));
  var fp = findFile('package.json', dir);

  if (!fp) {
    return null;
  }

  try {
    return require(fp).jshintConfig;
  } catch (e) {
    return null;
  }
}
// / //

function loadConfigIfValid(filename) {
  var strip = require('strip-json-comments');
  try {
    JSON.parse(strip(fs.readFileSync(filename, 'utf8')));
    return cli.loadConfig(filename);
  } catch (e) {}
  return {};
}

module.exports = function (file) {
  var config = loadNpmConfig(file) || loadConfigIfValid(findConfig(file));
  if (config && config.dirname) {
    delete config.dirname;
  }
  return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvanNoaW50L2xvYWQtY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUNiLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0IsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzlCLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3BDLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7Ozs7O0FBTXBDLElBQUksZUFBZSxHQUFHLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7OztBQWF6QixTQUFTLFFBQVE7Ozs0QkFBWTtRQUFYLElBQUk7UUFBRSxHQUFHO0FBR3JCLFlBQVEsR0FLUixNQUFNOzs7QUFQVixPQUFHLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFM0IsUUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3BELFFBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFNBQVMsRUFBRTtBQUMzQyxhQUFPLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNsQzs7QUFFRCxRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFdEMsUUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsRUFBRTtBQUM3QixxQkFBZSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUNyQyxhQUFPLFFBQVEsQ0FBQztLQUNqQjs7QUFFRCxRQUFJLEdBQUcsS0FBSyxNQUFNLEVBQUU7QUFDbEIscUJBQWUsQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDakMsYUFBTyxJQUFJLENBQUM7S0FDYjs7U0FFZSxJQUFJO1VBQUUsTUFBTTs7O0dBQzdCO0NBQUE7Ozs7Ozs7Ozs7QUFVRCxTQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUU7QUFDeEIsTUFBSSxHQUFHLEdBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDOztBQUU1RCxNQUFJLElBQUksR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLE1BQUksSUFBSSxFQUFFO0FBQ1IsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxNQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ3pCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsU0FBTyxJQUFJLENBQUM7Q0FDYjs7Ozs7Ozs7OztBQVVELFNBQVMsYUFBYSxDQUFDLElBQUksRUFBRTtBQUMzQixNQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMzQyxNQUFJLEVBQUUsR0FBSSxRQUFRLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUV4QyxNQUFJLENBQUMsRUFBRSxFQUFFO0FBQ1AsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxNQUFJO0FBQ0YsV0FBTyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDO0dBQ2pDLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixXQUFPLElBQUksQ0FBQztHQUNiO0NBQ0Y7OztBQUdELFNBQVMsaUJBQWlCLENBQUMsUUFBUSxFQUFFO0FBQ3BDLE1BQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzNDLE1BQUk7QUFDSCxRQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckQsV0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQ2hDLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFDWDtBQUNELFNBQU8sRUFBRSxDQUFDO0NBQ1Y7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLElBQUksRUFBRTtBQUNoQyxNQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDeEUsTUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtBQUM3QixXQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUM7R0FDdEI7QUFDRCxTQUFPLE1BQU0sQ0FBQztDQUNkLENBQUMiLCJmaWxlIjoiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9qc2hpbnQvbG9hZC1jb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG52YXIgZnMgPSByZXF1aXJlKCdmcycpO1xudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG52YXIgc2hqcyA9IHJlcXVpcmUoJ3NoZWxsanMnKTtcbnZhciBjbGkgPSByZXF1aXJlKCdqc2hpbnQvc3JjL2NsaScpO1xudmFyIHVzZXJIb21lID0gcmVxdWlyZSgndXNlci1ob21lJyk7XG5cbi8vIGZyb20gSlNIaW50IC8vXG4vLyBTdG9yYWdlIGZvciBtZW1vaXplZCByZXN1bHRzIGZyb20gZmluZCBmaWxlXG4vLyBTaG91bGQgcHJldmVudCBsb3RzIG9mIGRpcmVjdG9yeSB0cmF2ZXJzYWwgJlxuLy8gbG9va3VwcyB3aGVuIGxpbml0aW5nIGFuIGVudGlyZSBwcm9qZWN0XG52YXIgZmluZEZpbGVSZXN1bHRzID0ge307XG5cbi8qKlxuICogU2VhcmNoZXMgZm9yIGEgZmlsZSB3aXRoIGEgc3BlY2lmaWVkIG5hbWUgc3RhcnRpbmcgd2l0aFxuICogJ2RpcicgYW5kIGdvaW5nIGFsbCB0aGUgd2F5IHVwIGVpdGhlciB1bnRpbCBpdCBmaW5kcyB0aGUgZmlsZVxuICogb3IgaGl0cyB0aGUgcm9vdC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBmaWxlbmFtZSB0byBzZWFyY2ggZm9yIChlLmcuIC5qc2hpbnRyYylcbiAqIEBwYXJhbSB7c3RyaW5nfSBkaXIgIGRpcmVjdG9yeSB0byBzdGFydCBzZWFyY2ggZnJvbSAoZGVmYXVsdDpcbiAqICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkpXG4gKlxuICogQHJldHVybnMge3N0cmluZ30gbm9ybWFsaXplZCBmaWxlbmFtZVxuICovXG5mdW5jdGlvbiBmaW5kRmlsZShuYW1lLCBkaXIpIHtcbiAgZGlyID0gZGlyIHx8IHByb2Nlc3MuY3dkKCk7XG5cbiAgdmFyIGZpbGVuYW1lID0gcGF0aC5ub3JtYWxpemUocGF0aC5qb2luKGRpciwgbmFtZSkpO1xuICBpZiAoZmluZEZpbGVSZXN1bHRzW2ZpbGVuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGZpbmRGaWxlUmVzdWx0c1tmaWxlbmFtZV07XG4gIH1cblxuICB2YXIgcGFyZW50ID0gcGF0aC5yZXNvbHZlKGRpciwgJy4uLycpO1xuXG4gIGlmIChzaGpzLnRlc3QoJy1lJywgZmlsZW5hbWUpKSB7XG4gICAgZmluZEZpbGVSZXN1bHRzW2ZpbGVuYW1lXSA9IGZpbGVuYW1lO1xuICAgIHJldHVybiBmaWxlbmFtZTtcbiAgfVxuXG4gIGlmIChkaXIgPT09IHBhcmVudCkge1xuICAgIGZpbmRGaWxlUmVzdWx0c1tmaWxlbmFtZV0gPSBudWxsO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIGZpbmRGaWxlKG5hbWUsIHBhcmVudCk7XG59XG5cbi8qKlxuICogVHJpZXMgdG8gZmluZCBhIGNvbmZpZ3VyYXRpb24gZmlsZSBpbiBlaXRoZXIgcHJvamVjdCBkaXJlY3RvcnlcbiAqIG9yIGluIHRoZSBob21lIGRpcmVjdG9yeS4gQ29uZmlndXJhdGlvbiBmaWxlcyBhcmUgbmFtZWRcbiAqICcuanNoaW50cmMnLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlIHBhdGggdG8gdGhlIGZpbGUgdG8gYmUgbGludGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBhIHBhdGggdG8gdGhlIGNvbmZpZyBmaWxlXG4gKi9cbmZ1bmN0aW9uIGZpbmRDb25maWcoZmlsZSkge1xuICB2YXIgZGlyICA9IHBhdGguZGlybmFtZShwYXRoLnJlc29sdmUoZmlsZSkpO1xuICB2YXIgaG9tZSA9IHBhdGgubm9ybWFsaXplKHBhdGguam9pbih1c2VySG9tZSwgJy5qc2hpbnRyYycpKTtcblxuICB2YXIgcHJvaiA9IGZpbmRGaWxlKCcuanNoaW50cmMnLCBkaXIpO1xuICBpZiAocHJvaikge1xuICAgIHJldHVybiBwcm9qO1xuICB9XG5cbiAgaWYgKHNoanMudGVzdCgnLWUnLCBob21lKSkge1xuICAgIHJldHVybiBob21lO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogVHJpZXMgdG8gZmluZCBKU0hpbnQgY29uZmlndXJhdGlvbiB3aXRoaW4gYSBwYWNrYWdlLmpzb24gZmlsZVxuICogKGlmIGFueSkuIEl0IHNlYXJjaCBpbiB0aGUgY3VycmVudCBkaXJlY3RvcnkgYW5kIHRoZW4gZ29lcyB1cFxuICogYWxsIHRoZSB3YXkgdG8gdGhlIHJvb3QganVzdCBsaWtlIGZpbmRGaWxlLlxuICpcbiAqIEBwYXJhbSAgIHtzdHJpbmd9IGZpbGUgcGF0aCB0byB0aGUgZmlsZSB0byBiZSBsaW50ZWRcbiAqIEByZXR1cm5zIHtvYmplY3R9IGNvbmZpZyBvYmplY3RcbiAqL1xuZnVuY3Rpb24gbG9hZE5wbUNvbmZpZyhmaWxlKSB7XG4gIHZhciBkaXIgPSBwYXRoLmRpcm5hbWUocGF0aC5yZXNvbHZlKGZpbGUpKTtcbiAgdmFyIGZwICA9IGZpbmRGaWxlKCdwYWNrYWdlLmpzb24nLCBkaXIpO1xuXG4gIGlmICghZnApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoZnApLmpzaGludENvbmZpZztcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4vLyAvIC8vXG5cbmZ1bmN0aW9uIGxvYWRDb25maWdJZlZhbGlkKGZpbGVuYW1lKSB7XG5cdHZhciBzdHJpcCA9IHJlcXVpcmUoJ3N0cmlwLWpzb24tY29tbWVudHMnKTtcblx0dHJ5IHtcblx0XHRKU09OLnBhcnNlKHN0cmlwKGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKSkpO1xuXHRcdHJldHVybiBjbGkubG9hZENvbmZpZyhmaWxlbmFtZSk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0fVxuXHRyZXR1cm4ge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZpbGUpIHtcblx0dmFyIGNvbmZpZyA9IGxvYWROcG1Db25maWcoZmlsZSkgfHwgbG9hZENvbmZpZ0lmVmFsaWQoZmluZENvbmZpZyhmaWxlKSk7XG5cdGlmIChjb25maWcgJiYgY29uZmlnLmRpcm5hbWUpIHtcblx0XHRkZWxldGUgY29uZmlnLmRpcm5hbWU7XG5cdH1cblx0cmV0dXJuIGNvbmZpZztcbn07XG4iXX0=