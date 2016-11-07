(function() {
  describe('editor-registry', function() {
    var EditorRegistry, editorRegistry;
    EditorRegistry = require('../lib/editor-registry');
    editorRegistry = null;
    beforeEach(function() {
      waitsForPromise(function() {
        atom.workspace.destroyActivePaneItem();
        return atom.workspace.open('test.txt');
      });
      if (editorRegistry != null) {
        editorRegistry.dispose();
      }
      return editorRegistry = new EditorRegistry;
    });
    describe('::create', function() {
      it('cries when invalid TextEditor was provided', function() {
        expect(function() {
          return editorRegistry.create();
        }).toThrow("Given editor isn't really an editor");
        return expect(function() {
          return editorRegistry.create(5);
        }).toThrow("Given editor isn't really an editor");
      });
      it("adds TextEditor to it's registry", function() {
        editorRegistry.create(atom.workspace.getActiveTextEditor());
        return expect(editorRegistry.editorLinters.size).toBe(1);
      });
      return it('automatically clears the TextEditor from registry when destroyed', function() {
        editorRegistry.create(atom.workspace.getActiveTextEditor());
        atom.workspace.destroyActivePaneItem();
        return expect(editorRegistry.editorLinters.size).toBe(0);
      });
    });
    describe('::forEach', function() {
      return it('calls the callback once per editorLinter', function() {
        var timesCalled;
        editorRegistry.create(atom.workspace.getActiveTextEditor());
        timesCalled = 0;
        editorRegistry.forEach(function() {
          return ++timesCalled;
        });
        editorRegistry.forEach(function() {
          return ++timesCalled;
        });
        return expect(timesCalled).toBe(2);
      });
    });
    describe('::ofTextEditor', function() {
      it('returns undefined when invalid key is provided', function() {
        expect(editorRegistry.ofTextEditor(null)).toBeUndefined();
        expect(editorRegistry.ofTextEditor(1)).toBeUndefined();
        expect(editorRegistry.ofTextEditor(5)).toBeUndefined();
        return expect(editorRegistry.ofTextEditor("asd")).toBeUndefined();
      });
      return it('returns editorLinter when valid key is provided', function() {
        var activeEditor;
        activeEditor = atom.workspace.getActiveTextEditor();
        editorRegistry.create(activeEditor);
        return expect(editorRegistry.ofTextEditor(activeEditor)).toBeDefined();
      });
    });
    describe('::observe', function() {
      it('calls with the current editorLinters', function() {
        var timesCalled;
        timesCalled = 0;
        editorRegistry.create(atom.workspace.getActiveTextEditor());
        editorRegistry.observe(function() {
          return ++timesCalled;
        });
        return expect(timesCalled).toBe(1);
      });
      return it('calls in the future with new editorLinters', function() {
        var timesCalled;
        timesCalled = 0;
        editorRegistry.observe(function() {
          return ++timesCalled;
        });
        editorRegistry.create(atom.workspace.getActiveTextEditor());
        return waitsForPromise(function() {
          return atom.workspace.open('someNonExistingFile').then(function() {
            editorRegistry.create(atom.workspace.getActiveTextEditor());
            return expect(timesCalled).toBe(2);
          });
        });
      });
    });
    return describe('::ofActiveTextEditor', function() {
      it('returns undefined if active pane is not a text editor', function() {
        return expect(editorRegistry.ofActiveTextEditor()).toBeUndefined();
      });
      return it('returns editorLinter when active pane is a text editor', function() {
        editorRegistry.create(atom.workspace.getActiveTextEditor());
        return expect(editorRegistry.ofActiveTextEditor()).toBeDefined();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9lZGl0b3ItcmVnaXN0cnktc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixRQUFBLDhCQUFBO0FBQUEsSUFBQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSx3QkFBUixDQUFqQixDQUFBO0FBQUEsSUFDQSxjQUFBLEdBQWlCLElBRGpCLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO0FBQ2QsUUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFmLENBQUEsQ0FBQSxDQUFBO2VBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFVBQXBCLEVBRmM7TUFBQSxDQUFoQixDQUFBLENBQUE7O1FBR0EsY0FBYyxDQUFFLE9BQWhCLENBQUE7T0FIQTthQUlBLGNBQUEsR0FBaUIsR0FBQSxDQUFBLGVBTFI7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBU0EsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLE1BQUEsRUFBQSxDQUFHLDRDQUFILEVBQWlELFNBQUEsR0FBQTtBQUMvQyxRQUFBLE1BQUEsQ0FBTyxTQUFBLEdBQUE7aUJBQ0wsY0FBYyxDQUFDLE1BQWYsQ0FBQSxFQURLO1FBQUEsQ0FBUCxDQUVBLENBQUMsT0FGRCxDQUVTLHFDQUZULENBQUEsQ0FBQTtlQUdBLE1BQUEsQ0FBTyxTQUFBLEdBQUE7aUJBQ0wsY0FBYyxDQUFDLE1BQWYsQ0FBc0IsQ0FBdEIsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FFUyxxQ0FGVCxFQUorQztNQUFBLENBQWpELENBQUEsQ0FBQTtB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

//# sourceURL=/Users/mk2/.atom/packages/linter/spec/editor-registry-spec.coffee
