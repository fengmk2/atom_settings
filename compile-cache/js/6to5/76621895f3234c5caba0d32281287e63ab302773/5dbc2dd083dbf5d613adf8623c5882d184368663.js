"use strict";
var fs = require("fs");
var path = require("path");
var shjs = require("shelljs");
var cli = require("jshint/src/cli");
var userHome = require("user-home");

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
function findFile(name, dir) {
  dir = dir || process.cwd();

  var filename = path.normalize(path.join(dir, name));
  if (findFileResults[filename] !== undefined) {
    return findFileResults[filename];
  }

  var parent = path.resolve(dir, "../");

  if (shjs.test("-e", filename)) {
    findFileResults[filename] = filename;
    return filename;
  }

  if (dir === parent) {
    findFileResults[filename] = null;
    return null;
  }

  return findFile(name, parent);
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
  var home = path.normalize(path.join(userHome, ".jshintrc"));

  var proj = findFile(".jshintrc", dir);
  if (proj) {
    return proj;
  }

  if (shjs.test("-e", home)) {
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
  var fp = findFile("package.json", dir);

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
  var strip = require("strip-json-comments");
  try {
    JSON.parse(strip(fs.readFileSync(filename, "utf8")));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvanNoaW50L2xvYWQtY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0EsSUFBSSxLQUFLLFFBQVE7QUFDakIsSUFBSSxPQUFPLFFBQVE7QUFDbkIsSUFBSSxPQUFPLFFBQVE7QUFDbkIsSUFBSSxNQUFNLFFBQVE7QUFDbEIsSUFBSSxXQUFXLFFBQVE7Ozs7OztBQU12QixJQUFJLGtCQUFrQjs7Ozs7Ozs7Ozs7OztBQWF0QixTQUFTLFNBQVMsTUFBTSxLQUFLO0FBQzNCLFFBQU0sT0FBTyxRQUFROztBQUVyQixNQUFJLFdBQVcsS0FBSyxVQUFVLEtBQUssS0FBSyxLQUFLO0FBQzdDLE1BQUksZ0JBQWdCLGNBQWMsV0FBVztBQUMzQyxXQUFPLGdCQUFnQjs7O0FBR3pCLE1BQUksU0FBUyxLQUFLLFFBQVEsS0FBSzs7QUFFL0IsTUFBSSxLQUFLLEtBQUssTUFBTSxXQUFXO0FBQzdCLG9CQUFnQixZQUFZO0FBQzVCLFdBQU87OztBQUdULE1BQUksUUFBUSxRQUFRO0FBQ2xCLG9CQUFnQixZQUFZO0FBQzVCLFdBQU87OztBQUdULFNBQU8sU0FBUyxNQUFNOzs7Ozs7Ozs7OztBQVd4QixTQUFTLFdBQVcsTUFBTTtBQUN4QixNQUFJLE1BQU8sS0FBSyxRQUFRLEtBQUssUUFBUTtBQUNyQyxNQUFJLE9BQU8sS0FBSyxVQUFVLEtBQUssS0FBSyxVQUFVOztBQUU5QyxNQUFJLE9BQU8sU0FBUyxhQUFhO0FBQ2pDLE1BQUksTUFBTTtBQUNSLFdBQU87OztBQUdULE1BQUksS0FBSyxLQUFLLE1BQU0sT0FBTztBQUN6QixXQUFPOzs7QUFHVCxTQUFPOzs7Ozs7Ozs7OztBQVdULFNBQVMsY0FBYyxNQUFNO0FBQzNCLE1BQUksTUFBTSxLQUFLLFFBQVEsS0FBSyxRQUFRO0FBQ3BDLE1BQUksS0FBTSxTQUFTLGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLElBQUk7QUFDUCxXQUFPOzs7QUFHVCxNQUFJO0FBQ0YsV0FBTyxRQUFRLElBQUk7SUFDbkIsT0FBTyxHQUFHO0FBQ1YsV0FBTzs7Ozs7QUFLWCxTQUFTLGtCQUFrQixVQUFVO0FBQ3BDLE1BQUksUUFBUSxRQUFRO0FBQ3BCLE1BQUk7QUFDSCxTQUFLLE1BQU0sTUFBTSxHQUFHLGFBQWEsVUFBVTtBQUMzQyxXQUFPLElBQUksV0FBVztJQUNyQixPQUFPLEdBQUc7QUFFWixTQUFPOzs7QUFHUixPQUFPLFVBQVUsVUFBVSxNQUFNO0FBQ2hDLE1BQUksU0FBUyxjQUFjLFNBQVMsa0JBQWtCLFdBQVc7QUFDakUsTUFBSSxVQUFVLE9BQU8sU0FBUztBQUM3QixXQUFPLE9BQU87O0FBRWYsU0FBTyIsImZpbGUiOiIvVXNlcnMvbWsyLy5hdG9tL3BhY2thZ2VzL2pzaGludC9sb2FkLWNvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbnZhciBzaGpzID0gcmVxdWlyZSgnc2hlbGxqcycpO1xudmFyIGNsaSA9IHJlcXVpcmUoJ2pzaGludC9zcmMvY2xpJyk7XG52YXIgdXNlckhvbWUgPSByZXF1aXJlKCd1c2VyLWhvbWUnKTtcblxuLy8gZnJvbSBKU0hpbnQgLy9cbi8vIFN0b3JhZ2UgZm9yIG1lbW9pemVkIHJlc3VsdHMgZnJvbSBmaW5kIGZpbGVcbi8vIFNob3VsZCBwcmV2ZW50IGxvdHMgb2YgZGlyZWN0b3J5IHRyYXZlcnNhbCAmXG4vLyBsb29rdXBzIHdoZW4gbGluaXRpbmcgYW4gZW50aXJlIHByb2plY3RcbnZhciBmaW5kRmlsZVJlc3VsdHMgPSB7fTtcblxuLyoqXG4gKiBTZWFyY2hlcyBmb3IgYSBmaWxlIHdpdGggYSBzcGVjaWZpZWQgbmFtZSBzdGFydGluZyB3aXRoXG4gKiAnZGlyJyBhbmQgZ29pbmcgYWxsIHRoZSB3YXkgdXAgZWl0aGVyIHVudGlsIGl0IGZpbmRzIHRoZSBmaWxlXG4gKiBvciBoaXRzIHRoZSByb290LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIGZpbGVuYW1lIHRvIHNlYXJjaCBmb3IgKGUuZy4gLmpzaGludHJjKVxuICogQHBhcmFtIHtzdHJpbmd9IGRpciAgZGlyZWN0b3J5IHRvIHN0YXJ0IHNlYXJjaCBmcm9tIChkZWZhdWx0OlxuICogICAgICAgICAgICAgICAgICAgICAgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSlcbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBub3JtYWxpemVkIGZpbGVuYW1lXG4gKi9cbmZ1bmN0aW9uIGZpbmRGaWxlKG5hbWUsIGRpcikge1xuICBkaXIgPSBkaXIgfHwgcHJvY2Vzcy5jd2QoKTtcblxuICB2YXIgZmlsZW5hbWUgPSBwYXRoLm5vcm1hbGl6ZShwYXRoLmpvaW4oZGlyLCBuYW1lKSk7XG4gIGlmIChmaW5kRmlsZVJlc3VsdHNbZmlsZW5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZmluZEZpbGVSZXN1bHRzW2ZpbGVuYW1lXTtcbiAgfVxuXG4gIHZhciBwYXJlbnQgPSBwYXRoLnJlc29sdmUoZGlyLCAnLi4vJyk7XG5cbiAgaWYgKHNoanMudGVzdCgnLWUnLCBmaWxlbmFtZSkpIHtcbiAgICBmaW5kRmlsZVJlc3VsdHNbZmlsZW5hbWVdID0gZmlsZW5hbWU7XG4gICAgcmV0dXJuIGZpbGVuYW1lO1xuICB9XG5cbiAgaWYgKGRpciA9PT0gcGFyZW50KSB7XG4gICAgZmluZEZpbGVSZXN1bHRzW2ZpbGVuYW1lXSA9IG51bGw7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gZmluZEZpbGUobmFtZSwgcGFyZW50KTtcbn1cblxuLyoqXG4gKiBUcmllcyB0byBmaW5kIGEgY29uZmlndXJhdGlvbiBmaWxlIGluIGVpdGhlciBwcm9qZWN0IGRpcmVjdG9yeVxuICogb3IgaW4gdGhlIGhvbWUgZGlyZWN0b3J5LiBDb25maWd1cmF0aW9uIGZpbGVzIGFyZSBuYW1lZFxuICogJy5qc2hpbnRyYycuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGUgcGF0aCB0byB0aGUgZmlsZSB0byBiZSBsaW50ZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IGEgcGF0aCB0byB0aGUgY29uZmlnIGZpbGVcbiAqL1xuZnVuY3Rpb24gZmluZENvbmZpZyhmaWxlKSB7XG4gIHZhciBkaXIgID0gcGF0aC5kaXJuYW1lKHBhdGgucmVzb2x2ZShmaWxlKSk7XG4gIHZhciBob21lID0gcGF0aC5ub3JtYWxpemUocGF0aC5qb2luKHVzZXJIb21lLCAnLmpzaGludHJjJykpO1xuXG4gIHZhciBwcm9qID0gZmluZEZpbGUoJy5qc2hpbnRyYycsIGRpcik7XG4gIGlmIChwcm9qKSB7XG4gICAgcmV0dXJuIHByb2o7XG4gIH1cblxuICBpZiAoc2hqcy50ZXN0KCctZScsIGhvbWUpKSB7XG4gICAgcmV0dXJuIGhvbWU7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBUcmllcyB0byBmaW5kIEpTSGludCBjb25maWd1cmF0aW9uIHdpdGhpbiBhIHBhY2thZ2UuanNvbiBmaWxlXG4gKiAoaWYgYW55KS4gSXQgc2VhcmNoIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeSBhbmQgdGhlbiBnb2VzIHVwXG4gKiBhbGwgdGhlIHdheSB0byB0aGUgcm9vdCBqdXN0IGxpa2UgZmluZEZpbGUuXG4gKlxuICogQHBhcmFtICAge3N0cmluZ30gZmlsZSBwYXRoIHRvIHRoZSBmaWxlIHRvIGJlIGxpbnRlZFxuICogQHJldHVybnMge29iamVjdH0gY29uZmlnIG9iamVjdFxuICovXG5mdW5jdGlvbiBsb2FkTnBtQ29uZmlnKGZpbGUpIHtcbiAgdmFyIGRpciA9IHBhdGguZGlybmFtZShwYXRoLnJlc29sdmUoZmlsZSkpO1xuICB2YXIgZnAgID0gZmluZEZpbGUoJ3BhY2thZ2UuanNvbicsIGRpcik7XG5cbiAgaWYgKCFmcCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gcmVxdWlyZShmcCkuanNoaW50Q29uZmlnO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbi8vIC8gLy9cblxuZnVuY3Rpb24gbG9hZENvbmZpZ0lmVmFsaWQoZmlsZW5hbWUpIHtcblx0dmFyIHN0cmlwID0gcmVxdWlyZSgnc3RyaXAtanNvbi1jb21tZW50cycpO1xuXHR0cnkge1xuXHRcdEpTT04ucGFyc2Uoc3RyaXAoZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpKSk7XG5cdFx0cmV0dXJuIGNsaS5sb2FkQ29uZmlnKGZpbGVuYW1lKTtcblx0fSBjYXRjaCAoZSkge1xuXHR9XG5cdHJldHVybiB7fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZmlsZSkge1xuXHR2YXIgY29uZmlnID0gbG9hZE5wbUNvbmZpZyhmaWxlKSB8fCBsb2FkQ29uZmlnSWZWYWxpZChmaW5kQ29uZmlnKGZpbGUpKTtcblx0aWYgKGNvbmZpZyAmJiBjb25maWcuZGlybmFtZSkge1xuXHRcdGRlbGV0ZSBjb25maWcuZGlybmFtZTtcblx0fVxuXHRyZXR1cm4gY29uZmlnO1xufTtcbiJdfQ==