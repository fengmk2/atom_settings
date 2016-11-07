function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _path = require('path');

var path = _interopRequireWildcard(_path);

'use babel';

describe('The htmlhint provider for Linter', function () {
  var lint = require(path.join('..', 'lib', 'index.js')).provideLinter().lint;

  beforeEach(function () {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(function () {
      return atom.packages.activatePackage('linter-htmlhint').then(function () {
        return atom.packages.activatePackage('language-html');
      });
    });
  });

  it('detects invalid coding style in bad.html and report as error', function () {
    waitsForPromise(function () {
      var bad = path.join(__dirname, 'fixtures', 'bad.html');
      return atom.workspace.open(bad).then(function (editor) {
        return lint(editor);
      }).then(function (messages) {
        expect(messages.length).toEqual(1);

        // test only the first error
        expect(messages[0].type).toEqual('error');
        expect(messages[0].text).toEqual('Doctype must be declared first.');
        expect(messages[0].filePath).toMatch(/.+bad\.html$/);
        expect(messages[0].range).toEqual([[0, 0], [0, 13]]);
      });
    });
  });

  it('finds nothing wrong with a valid file (good.html)', function () {
    waitsForPromise(function () {
      var good = path.join(__dirname, 'fixtures', 'good.html');
      return atom.workspace.open(good).then(function (editor) {
        return lint(editor);
      }).then(function (messages) {
        expect(messages.length).toEqual(0);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvbGludGVyLWh0bWxoaW50L3NwZWMvbGludGVyLWh0bWxoaW50LXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7b0JBRXNCLE1BQU07O0lBQWhCLElBQUk7O0FBRmhCLFdBQVcsQ0FBQzs7QUFJWixRQUFRLENBQUMsa0NBQWtDLEVBQUUsWUFBTTtBQUNqRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDOztBQUU5RSxZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUN2QyxtQkFBZSxDQUFDO2FBQ2QsSUFBSSxDQUNELFFBQVEsQ0FDUixlQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FDbEMsSUFBSSxDQUFDO2VBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDO09BQUEsQ0FBQztLQUFBLENBQzlELENBQUM7R0FDSCxDQUFDLENBQUM7O0FBRUgsSUFBRSxDQUFDLDhEQUE4RCxFQUFFLFlBQU07QUFDdkUsbUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLFVBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN6RCxhQUFPLElBQUksQ0FDUixTQUFTLENBQ1QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUNULElBQUksQ0FBQyxVQUFBLE1BQU07ZUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDO09BQUEsQ0FBQyxDQUM1QixJQUFJLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDaEIsY0FBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7OztBQUduQyxjQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQyxjQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQ3BFLGNBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3JELGNBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3RELENBQUMsQ0FBQztLQUNOLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxJQUFFLENBQUMsbURBQW1ELEVBQUUsWUFBTTtBQUM1RCxtQkFBZSxDQUFDLFlBQU07QUFDcEIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzNELGFBQU8sSUFBSSxDQUNSLFNBQVMsQ0FDVCxJQUFJLENBQUMsSUFBSSxDQUFDLENBQ1YsSUFBSSxDQUFDLFVBQUEsTUFBTTtlQUFJLElBQUksQ0FBQyxNQUFNLENBQUM7T0FBQSxDQUFDLENBQzVCLElBQUksQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUNoQixjQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNwQyxDQUFDLENBQUM7S0FDTixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSixDQUFDLENBQUMiLCJmaWxlIjoiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXItaHRtbGhpbnQvc3BlYy9saW50ZXItaHRtbGhpbnQtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5kZXNjcmliZSgnVGhlIGh0bWxoaW50IHByb3ZpZGVyIGZvciBMaW50ZXInLCAoKSA9PiB7XG4gIGNvbnN0IGxpbnQgPSByZXF1aXJlKHBhdGguam9pbignLi4nLCAnbGliJywgJ2luZGV4LmpzJykpLnByb3ZpZGVMaW50ZXIoKS5saW50O1xuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lSXRlbSgpO1xuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgYXRvbVxuICAgICAgICAucGFja2FnZXNcbiAgICAgICAgLmFjdGl2YXRlUGFja2FnZSgnbGludGVyLWh0bWxoaW50JylcbiAgICAgICAgLnRoZW4oKCkgPT4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWh0bWwnKSlcbiAgICApO1xuICB9KTtcblxuICBpdCgnZGV0ZWN0cyBpbnZhbGlkIGNvZGluZyBzdHlsZSBpbiBiYWQuaHRtbCBhbmQgcmVwb3J0IGFzIGVycm9yJywgKCkgPT4ge1xuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICBjb25zdCBiYWQgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMnLCAnYmFkLmh0bWwnKTtcbiAgICAgIHJldHVybiBhdG9tXG4gICAgICAgIC53b3Jrc3BhY2VcbiAgICAgICAgLm9wZW4oYmFkKVxuICAgICAgICAudGhlbihlZGl0b3IgPT4gbGludChlZGl0b3IpKVxuICAgICAgICAudGhlbihtZXNzYWdlcyA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9FcXVhbCgxKTtcblxuICAgICAgICAgIC8vIHRlc3Qgb25seSB0aGUgZmlyc3QgZXJyb3JcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0udHlwZSkudG9FcXVhbCgnZXJyb3InKTtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0udGV4dCkudG9FcXVhbCgnRG9jdHlwZSBtdXN0IGJlIGRlY2xhcmVkIGZpcnN0LicpO1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5maWxlUGF0aCkudG9NYXRjaCgvLitiYWRcXC5odG1sJC8pO1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5yYW5nZSkudG9FcXVhbChbWzAsIDBdLCBbMCwgMTNdXSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBpdCgnZmluZHMgbm90aGluZyB3cm9uZyB3aXRoIGEgdmFsaWQgZmlsZSAoZ29vZC5odG1sKScsICgpID0+IHtcbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgY29uc3QgZ29vZCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycsICdnb29kLmh0bWwnKTtcbiAgICAgIHJldHVybiBhdG9tXG4gICAgICAgIC53b3Jrc3BhY2VcbiAgICAgICAgLm9wZW4oZ29vZClcbiAgICAgICAgLnRoZW4oZWRpdG9yID0+IGxpbnQoZWRpdG9yKSlcbiAgICAgICAgLnRoZW4obWVzc2FnZXMgPT4ge1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvRXF1YWwoMCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19
//# sourceURL=/Users/mk2/.atom/packages/linter-htmlhint/spec/linter-htmlhint-spec.js
