Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.install = install;

var _helpers = require('./helpers');

// Renamed for backward compatibility
'use babel';
var FS = require('fs');
var Path = require('path');

var _require = require('./view');

var View = _require.View;
if (typeof window.__steelbrain_package_deps === 'undefined') {
  window.__steelbrain_package_deps = new Set();
}

function install() {
  var name = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
  var enablePackages = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  if (!name) {
    var filePath = require('sb-callsite').capture()[1].file;
    name = (0, _helpers.guessName)(filePath);
    if (!name) {
      console.log('Unable to get package name for file: ' + filePath);
      return Promise.resolve();
    }
  }

  var _packagesToInstall = (0, _helpers.packagesToInstall)(name);

  var toInstall = _packagesToInstall.toInstall;
  var toEnable = _packagesToInstall.toEnable;

  var promise = Promise.resolve();

  if (enablePackages && toEnable.length) {
    promise = toEnable.reduce(function (promise, name) {
      atom.packages.enablePackage(name);
      return atom.packages.activatePackage(name);
    }, promise);
  }
  if (toInstall.length) {
    (function () {
      var view = new View(name, toInstall);
      promise = Promise.all([view.show(), promise]).then(function () {
        return (0, _helpers.installPackages)(toInstall, function (name, status) {
          if (status) {
            view.advance();
          } else {
            atom.notifications.addError('Error Installing ' + name, { detail: 'Something went wrong. Try installing this package manually.' });
          }
        });
      });
    })();
  }

  return promise;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvbGludGVyLWpzLXlhbWwvbm9kZV9tb2R1bGVzL2F0b20tcGFja2FnZS1kZXBzL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O3VCQUk0RCxXQUFXOzs7QUFKdkUsV0FBVyxDQUFBO0FBQ1gsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3hCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTs7ZUFDYixPQUFPLENBQUMsUUFBUSxDQUFDOztJQUF6QixJQUFJLFlBQUosSUFBSTtBQUlYLElBQUksT0FBTyxNQUFNLENBQUMseUJBQXlCLEtBQUssV0FBVyxFQUFFO0FBQzNELFFBQU0sQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0NBQzdDOztBQUVNLFNBQVMsT0FBTyxHQUFzQztNQUFyQyxJQUFJLHlEQUFHLElBQUk7TUFBRSxjQUFjLHlEQUFHLEtBQUs7O0FBQ3pELE1BQUksQ0FBQyxJQUFJLEVBQUU7QUFDVCxRQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO0FBQ3pELFFBQUksR0FBRyx3QkFBVSxRQUFRLENBQUMsQ0FBQTtBQUMxQixRQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1QsYUFBTyxDQUFDLEdBQUcsMkNBQXlDLFFBQVEsQ0FBRyxDQUFBO0FBQy9ELGFBQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQ3pCO0dBQ0Y7OzJCQUM2QixnQ0FBa0IsSUFBSSxDQUFDOztNQUE5QyxTQUFTLHNCQUFULFNBQVM7TUFBRSxRQUFRLHNCQUFSLFFBQVE7O0FBQzFCLE1BQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQTs7QUFFL0IsTUFBSSxjQUFjLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUNyQyxXQUFPLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFTLE9BQU8sRUFBRSxJQUFJLEVBQUU7QUFDaEQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDakMsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUMzQyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQ1o7QUFDRCxNQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUU7O0FBQ3BCLFVBQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUN0QyxhQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFXO0FBQzVELGVBQU8sOEJBQWdCLFNBQVMsRUFBRSxVQUFTLElBQUksRUFBRSxNQUFNLEVBQUU7QUFDdkQsY0FBSSxNQUFNLEVBQUU7QUFDVixnQkFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1dBQ2YsTUFBTTtBQUNMLGdCQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsdUJBQXFCLElBQUksRUFBSSxFQUFDLE1BQU0sRUFBRSw2REFBNkQsRUFBQyxDQUFDLENBQUE7V0FDakk7U0FDRixDQUFDLENBQUE7T0FDSCxDQUFDLENBQUE7O0dBQ0g7O0FBRUQsU0FBTyxPQUFPLENBQUE7Q0FDZiIsImZpbGUiOiIvVXNlcnMvbWsyLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1qcy15YW1sL25vZGVfbW9kdWxlcy9hdG9tLXBhY2thZ2UtZGVwcy9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXHJcbmNvbnN0IEZTID0gcmVxdWlyZSgnZnMnKVxyXG5jb25zdCBQYXRoID0gcmVxdWlyZSgncGF0aCcpXHJcbmNvbnN0IHtWaWV3fSA9IHJlcXVpcmUoJy4vdmlldycpXHJcbmltcG9ydCB7Z3Vlc3NOYW1lLCBpbnN0YWxsUGFja2FnZXMsIHBhY2thZ2VzVG9JbnN0YWxsfSBmcm9tICcuL2hlbHBlcnMnXHJcblxyXG4vLyBSZW5hbWVkIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XHJcbmlmICh0eXBlb2Ygd2luZG93Ll9fc3RlZWxicmFpbl9wYWNrYWdlX2RlcHMgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgd2luZG93Ll9fc3RlZWxicmFpbl9wYWNrYWdlX2RlcHMgPSBuZXcgU2V0KClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGwobmFtZSA9IG51bGwsIGVuYWJsZVBhY2thZ2VzID0gZmFsc2UpIHtcclxuICBpZiAoIW5hbWUpIHtcclxuICAgIGNvbnN0IGZpbGVQYXRoID0gcmVxdWlyZSgnc2ItY2FsbHNpdGUnKS5jYXB0dXJlKClbMV0uZmlsZVxyXG4gICAgbmFtZSA9IGd1ZXNzTmFtZShmaWxlUGF0aClcclxuICAgIGlmICghbmFtZSkge1xyXG4gICAgICBjb25zb2xlLmxvZyhgVW5hYmxlIHRvIGdldCBwYWNrYWdlIG5hbWUgZm9yIGZpbGU6ICR7ZmlsZVBhdGh9YClcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICB9XHJcbiAgfVxyXG4gIGNvbnN0IHt0b0luc3RhbGwsIHRvRW5hYmxlfSA9IHBhY2thZ2VzVG9JbnN0YWxsKG5hbWUpXHJcbiAgbGV0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKVxyXG5cclxuICBpZiAoZW5hYmxlUGFja2FnZXMgJiYgdG9FbmFibGUubGVuZ3RoKSB7XHJcbiAgICBwcm9taXNlID0gdG9FbmFibGUucmVkdWNlKGZ1bmN0aW9uKHByb21pc2UsIG5hbWUpIHtcclxuICAgICAgYXRvbS5wYWNrYWdlcy5lbmFibGVQYWNrYWdlKG5hbWUpXHJcbiAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShuYW1lKVxyXG4gICAgfSwgcHJvbWlzZSlcclxuICB9XHJcbiAgaWYgKHRvSW5zdGFsbC5sZW5ndGgpIHtcclxuICAgIGNvbnN0IHZpZXcgPSBuZXcgVmlldyhuYW1lLCB0b0luc3RhbGwpXHJcbiAgICBwcm9taXNlID0gUHJvbWlzZS5hbGwoW3ZpZXcuc2hvdygpLCBwcm9taXNlXSkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIGluc3RhbGxQYWNrYWdlcyh0b0luc3RhbGwsIGZ1bmN0aW9uKG5hbWUsIHN0YXR1cykge1xyXG4gICAgICAgIGlmIChzdGF0dXMpIHtcclxuICAgICAgICAgIHZpZXcuYWR2YW5jZSgpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgRXJyb3IgSW5zdGFsbGluZyAke25hbWV9YCwge2RldGFpbDogJ1NvbWV0aGluZyB3ZW50IHdyb25nLiBUcnkgaW5zdGFsbGluZyB0aGlzIHBhY2thZ2UgbWFudWFsbHkuJ30pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHJldHVybiBwcm9taXNlXHJcbn1cclxuIl19
//# sourceURL=/Users/mk2/.atom/packages/linter-js-yaml/node_modules/atom-package-deps/lib/main.js
