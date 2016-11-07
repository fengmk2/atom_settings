(function() {
  describe('editor-linter', function() {
    var EditorLinter, editorLinter, textEditor;
    EditorLinter = require('../lib/editor-linter');
    editorLinter = null;
    textEditor = null;
    beforeEach(function() {
      return waitsForPromise(function() {
        atom.workspace.destroyActivePaneItem();
        return atom.workspace.open('/tmp/test.txt').then(function() {
          if (editorLinter != null) {
            editorLinter.dispose();
          }
          textEditor = atom.workspace.getActiveTextEditor();
          return editorLinter = new EditorLinter(textEditor);
        });
      });
    });
    describe('::constructor', function() {
      return it("cries when provided argument isn't a TextEditor", function() {
        expect(function() {
          return new EditorLinter;
        }).toThrow("Given editor isn't really an editor");
        expect(function() {
          return new EditorLinter(null);
        }).toThrow("Given editor isn't really an editor");
        return expect(function() {
          return new EditorLinter(55);
        }).toThrow("Given editor isn't really an editor");
      });
    });
    describe('::onShouldLint', function() {
      return it('ignores instant save requests', function() {
        var timesTriggered;
        timesTriggered = 0;
        editorLinter.onShouldLint(function() {
          return timesTriggered++;
        });
        textEditor.save();
        textEditor.save();
        textEditor.save();
        textEditor.save();
        textEditor.save();
        return expect(timesTriggered).toBe(5);
      });
    });
    return describe('::onDidDestroy', function() {
      return it('is called when TextEditor is destroyed', function() {
        var didDestroy;
        didDestroy = false;
        editorLinter.onDidDestroy(function() {
          return didDestroy = true;
        });
        textEditor.destroy();
        return expect(didDestroy).toBe(true);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9lZGl0b3ItbGludGVyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLHNDQUFBO0FBQUEsSUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBQWYsQ0FBQTtBQUFBLElBQ0EsWUFBQSxHQUFlLElBRGYsQ0FBQTtBQUFBLElBRUEsVUFBQSxHQUFhLElBRmIsQ0FBQTtBQUFBLElBR0EsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO0FBQ2QsUUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFmLENBQUEsQ0FBQSxDQUFBO2VBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLGVBQXBCLENBQW9DLENBQUMsSUFBckMsQ0FBMEMsU0FBQSxHQUFBOztZQUN4QyxZQUFZLENBQUUsT0FBZCxDQUFBO1dBQUE7QUFBQSxVQUNBLFVBQUEsR0FBYSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FEYixDQUFBO2lCQUVBLFlBQUEsR0FBbUIsSUFBQSxZQUFBLENBQWEsVUFBYixFQUhxQjtRQUFBLENBQTFDLEVBRmM7TUFBQSxDQUFoQixFQURTO0lBQUEsQ0FBWCxDQUhBLENBQUE7QUFBQSxJQVdBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTthQUN4QixFQUFBLENBQUcsaURBQUgsRUFBc0QsU0FBQSxHQUFBO0FBQ3BELFFBQUEsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxHQUFBLENBQUEsYUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FFUyxxQ0FGVCxDQUFBLENBQUE7QUFBQSxRQUdBLE1BQUEsQ0FBTyxTQUFBLEdBQUE7aUJBQ0QsSUFBQSxZQUFBLENBQWEsSUFBYixFQURDO1FBQUEsQ0FBUCxDQUVBLENBQUMsT0FGRCxDQUVTLHFDQUZULENBSEEsQ0FBQTtlQU1BLE1BQUEsQ0FBTyxTQUFBLEdBQUE7aUJBQ0QsSUFBQSxZQUFBLENBQWEsRUFBYixFQURDO1FBQUEsQ0FBUCxDQUVBLENBQUMsT0FGRCxDQUVTLHFDQUZULEVBUG9EO01BQUEsQ0FBdEQsRUFEd0I7SUFBQSxDQUExQixDQVhBLENBQUE7QUFBQSxJQXVCQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQSxHQUFBO2FBQ3pCLEVBQUEsQ0FBRywrQkFBSCxFQUFvQyxTQUFBLEdBQUE7QUFDbEMsWUFBQSxjQUFBO0FBQUEsUUFBQSxjQUFBLEdBQWlCLENBQWpCLENBQUE7QUFBQSxRQUNBLFlBQVksQ0FBQyxZQUFiLENBQTBCLFNBQUEsR0FBQTtpQkFDeEIsY0FBQSxHQUR3QjtRQUFBLENBQTFCLENBREEsQ0FBQTtBQUFBLFFBR0EsVUFBVSxDQUFDLElBQVgsQ0FBQSxDQUhBLENBQUE7QUFBQSxRQUlBLFVBQVUsQ0FBQyxJQUFYLENBQUEsQ0FKQSxDQUFBO0FBQUEsUUFLQSxVQUFVLENBQUMsSUFBWCxDQUFBLENBTEEsQ0FBQTtBQUFBLFFBTUEsVUFBVSxDQUFDLElBQVgsQ0FBQSxDQU5BLENBQUE7QUFBQSxRQU9BLFVBQVUsQ0FBQyxJQUFYLENBQUEsQ0FQQSxDQUFBO2VBUUEsTUFBQSxDQUFPLGNBQVAsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixDQUE1QixFQVRrQztNQUFBLENBQXBDLEVBRHlCO0lBQUEsQ0FBM0IsQ0F2QkEsQ0FBQTtXQW1DQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQSxHQUFBO2FBQ3pCLEVBQUEsQ0FBRyx3Q0FBSCxFQUE2QyxTQUFBLEdBQUE7QUFDM0MsWUFBQSxVQUFBO0FBQUEsUUFBQSxVQUFBLEdBQWEsS0FBYixDQUFBO0FBQUEsUUFDQSxZQUFZLENBQUMsWUFBYixDQUEwQixTQUFBLEdBQUE7aUJBQ3hCLFVBQUEsR0FBYSxLQURXO1FBQUEsQ0FBMUIsQ0FEQSxDQUFBO0FBQUEsUUFHQSxVQUFVLENBQUMsT0FBWCxDQUFBLENBSEEsQ0FBQTtlQUlBLE1BQUEsQ0FBTyxVQUFQLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsSUFBeEIsRUFMMkM7TUFBQSxDQUE3QyxFQUR5QjtJQUFBLENBQTNCLEVBcEN3QjtFQUFBLENBQTFCLENBQUEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/mk2/.atom/packages/linter/spec/editor-linter-spec.coffee
