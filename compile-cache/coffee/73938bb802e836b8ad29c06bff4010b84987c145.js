(function() {
  var Plantuml, fs, path, temp;

  temp = require('temp').track();

  fs = require("fs");

  path = require("path");

  Plantuml = require('../lib/plantuml');

  describe("Plantuml", function() {
    var activationPromise, buffer, directory, editor, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], activationPromise = _ref[1], directory = _ref[2], editor = _ref[3], buffer = _ref[4];
    beforeEach(function() {
      directory = temp.mkdirSync();
      workspaceElement = atom.views.getView(atom.workspace);
      return activationPromise = atom.packages.activatePackage('plantuml');
    });
    describe("when no editor is open and plantuml:generate event is triggered", function() {
      return it("prints an warning if its called not inside some editor window", function() {
        atom.commands.dispatch(workspaceElement, 'plantuml:generate');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var warning;
          warning = atom.notifications.getNotifications()[0];
          expect(warning).toBeDefined();
          return expect(warning.type).toEqual("warning");
        });
      });
    });
    return describe("when editor is open and plantuml:generate event is triggered", function() {
      beforeEach(function() {
        var filePath;
        filePath = path.join(directory, 'plantuml.plantuml');
        fs.writeFileSync(filePath, '');
        return waitsForPromise(function() {
          return atom.workspace.open(filePath).then(function(e) {
            editor = e;
            buffer = editor.getBuffer();
            return buffer.setText('@startuml\n(*) --> (*)\n@enduml');
          });
        });
      });
      it("saves the file if it is new", function() {
        var done, newFilePath;
        newFilePath = path.join(directory, "newPlantuml.plantuml");
        done = false;
        atom.workspace.open(newFilePath).then(function(e) {
          editor = e;
          buffer = editor.getBuffer();
          return buffer.setText('@startuml\n(*) --> (*)\n@enduml');
        });
        buffer.onDidSave(function(event) {
          return done = true;
        });
        atom.commands.dispatch(workspaceElement, 'plantuml:generate');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          return waitsFor(function() {
            return done === true;
          });
        });
      });
      it("saves the file if it is modified", function() {
        var done;
        done = false;
        buffer.onDidSave(function(event) {
          return done = true;
        });
        atom.commands.dispatch(workspaceElement, 'plantuml:generate');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          return waitsFor(function() {
            return done === true;
          });
        });
      });
      return it("opens a window to show the generated png", function() {
        var done;
        done = false;
        atom.workspace.onDidOpen(function(event) {
          if (event.uri.indexOf("plantuml.png") > -1) {
            return done = true;
          }
        });
        atom.commands.dispatch(workspaceElement, 'plantuml:generate');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          return waitsFor(function() {
            return done === true;
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9wbGFudHVtbC1nZW5lcmF0b3Ivc3BlYy9wbGFudHVtbC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3QkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFlLENBQUMsS0FBaEIsQ0FBQSxDQUFQLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVIsQ0FKWCxDQUFBOztBQUFBLEVBTUEsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFFBQUEsb0VBQUE7QUFBQSxJQUFBLE9BQW1FLEVBQW5FLEVBQUMsMEJBQUQsRUFBbUIsMkJBQW5CLEVBQXNDLG1CQUF0QyxFQUFpRCxnQkFBakQsRUFBeUQsZ0JBQXpELENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLFNBQUEsR0FBWSxJQUFJLENBQUMsU0FBTCxDQUFBLENBQVosQ0FBQTtBQUFBLE1BRUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUZuQixDQUFBO2FBR0EsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFVBQTlCLEVBSlg7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBUUEsUUFBQSxDQUFTLGlFQUFULEVBQTRFLFNBQUEsR0FBQTthQUMxRSxFQUFBLENBQUcsK0RBQUgsRUFBb0UsU0FBQSxHQUFBO0FBQ2xFLFFBQUEsSUFBSSxDQUFDLFFBQVEs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

//# sourceURL=/Users/mk2/.atom/packages/plantuml-generator/spec/plantuml-spec.coffee
