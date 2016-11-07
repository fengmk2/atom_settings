(function() {
  describe('message-registry', function() {
    var EditorLinter, LinterRegistry, MessageRegistry, getLinterRegistry, getMessage, messageRegistry, objectSize, _ref;
    messageRegistry = null;
    MessageRegistry = require('../lib/message-registry');
    EditorLinter = require('../lib/editor-linter');
    LinterRegistry = require('../lib/linter-registry');
    objectSize = function(obj) {
      var size, value;
      size = 0;
      for (value in obj) {
        size++;
      }
      return size;
    };
    _ref = require('./common'), getLinterRegistry = _ref.getLinterRegistry, getMessage = _ref.getMessage;
    beforeEach(function() {
      return waitsForPromise(function() {
        atom.workspace.destroyActivePaneItem();
        return atom.workspace.open('test.txt').then(function() {
          if (messageRegistry != null) {
            messageRegistry.dispose();
          }
          return messageRegistry = new MessageRegistry();
        });
      });
    });
    describe('::set', function() {
      it('accepts info from LinterRegistry::lint', function() {
        var editorLinter, linterRegistry, wasUpdated, _ref1;
        _ref1 = getLinterRegistry(), linterRegistry = _ref1.linterRegistry, editorLinter = _ref1.editorLinter;
        wasUpdated = false;
        linterRegistry.onDidUpdateMessages(function(linterInfo) {
          wasUpdated = true;
          messageRegistry.set(linterInfo);
          return expect(messageRegistry.hasChanged).toBe(true);
        });
        return waitsForPromise(function() {
          return linterRegistry.lint({
            onChange: false,
            editorLinter: editorLinter
          }).then(function() {
            expect(wasUpdated).toBe(true);
            return linterRegistry.dispose();
          });
        });
      });
      return it('ignores deactivated linters', function() {
        var editorLinter, linter, linterRegistry, _ref1;
        _ref1 = getLinterRegistry(), linterRegistry = _ref1.linterRegistry, editorLinter = _ref1.editorLinter, linter = _ref1.linter;
        messageRegistry.set({
          linter: linter,
          messages: [getMessage('Error'), getMessage('Warning')]
        });
        messageRegistry.updatePublic();
        expect(messageRegistry.publicMessages.length).toBe(2);
        linter.deactivated = true;
        messageRegistry.set({
          linter: linter,
          messages: [getMessage('Error')]
        });
        messageRegistry.updatePublic();
        expect(messageRegistry.publicMessages.length).toBe(2);
        linter.deactivated = false;
        messageRegistry.set({
          linter: linter,
          messages: [getMessage('Error')]
        });
        messageRegistry.updatePublic();
        return expect(messageRegistry.publicMessages.length).toBe(1);
      });
    });
    describe('::onDidUpdateMessages', function() {
      it('is triggered asyncly with results and provides a diff', function() {
        var editorLinter, linterRegistry, wasUpdated, _ref1;
        wasUpdated = false;
        _ref1 = getLinterRegistry(), linterRegistry = _ref1.linterRegistry, editorLinter = _ref1.editorLinter;
        linterRegistry.onDidUpdateMessages(function(linterInfo) {
          messageRegistry.set(linterInfo);
          expect(messageRegistry.hasChanged).toBe(true);
          return messageRegistry.updatePublic();
        });
        messageRegistry.onDidUpdateMessages(function(_arg) {
          var added, messages, removed;
          added = _arg.added, removed = _arg.removed, messages = _arg.messages;
          wasUpdated = true;
          expect(added.length).toBe(1);
          expect(removed.length).toBe(0);
          return expect(messages.length).toBe(1);
        });
        return waitsForPromise(function() {
          return linterRegistry.lint({
            onChange: false,
            editorLinter: editorLinter
          }).then(function() {
            expect(wasUpdated).toBe(true);
            return linterRegistry.dispose();
          });
        });
      });
      return it('provides the same objects when they dont change', function() {
        var disposable, editorLinter, linterRegistry, wasUpdated, _ref1;
        wasUpdated = false;
        _ref1 = getLinterRegistry(), linterRegistry = _ref1.linterRegistry, editorLinter = _ref1.editorLinter;
        linterRegistry.onDidUpdateMessages(function(linterInfo) {
          messageRegistry.set(linterInfo);
          return messageRegistry.updatePublic();
        });
        disposable = messageRegistry.onDidUpdateMessages(function(_arg) {
          var added, obj;
          added = _arg.added;
          expect(added.length).toBe(1);
          obj = added[0];
          disposable.dispose();
          return messageRegistry.onDidUpdateMessages(function(_arg1) {
            var messages;
            messages = _arg1.messages;
            wasUpdated = true;
            return expect(messages[0]).toBe(obj);
          });
        });
        return waitsForPromise(function() {
          return linterRegistry.lint({
            onChange: false,
            editorLinter: editorLinter
          }).then(function() {
            return linterRegistry.lint({
              onChange: false,
              editorLinter: editorLinter
            });
          }).then(function() {
            expect(wasUpdated).toBe(true);
            return linterRegistry.dispose();
          });
        });
      });
    });
    describe('::deleteEditorMessages', function() {
      return it('removes messages for that editor', function() {
        var editor, editorLinter, linterRegistry, wasUpdated, _ref1;
        wasUpdated = 0;
        _ref1 = getLinterRegistry(), linterRegistry = _ref1.linterRegistry, editorLinter = _ref1.editorLinter;
        editor = editorLinter.editor;
        linterRegistry.onDidUpdateMessages(function(linterInfo) {
          messageRegistry.set(linterInfo);
          expect(messageRegistry.hasChanged).toBe(true);
          return messageRegistry.updatePublic();
        });
        messageRegistry.onDidUpdateMessages(function(_arg) {
          var messages;
          messages = _arg.messages;
          wasUpdated = 1;
          expect(objectSize(messages)).toBe(1);
          return messageRegistry.deleteEditorMessages(editor);
        });
        return waitsForPromise(function() {
          return linterRegistry.lint({
            onChange: false,
            editorLinter: editorLinter
          }).then(function() {
            expect(wasUpdated).toBe(1);
            return linterRegistry.dispose();
          });
        });
      });
    });
    return describe('handles multiple panes resulting in multiple editors', function() {
      var leftEditorLinter, leftPane, linter, linterRegistry, messageUpdateDetails, rightEditorLinter, rightPane, runLint;
      leftPane = rightPane = linterRegistry = linter = null;
      leftEditorLinter = rightEditorLinter = messageUpdateDetails = null;
      beforeEach(function() {
        var lintCount, _ref1;
        _ref1 = getLinterRegistry(), linterRegistry = _ref1.linterRegistry, linter = _ref1.linter, leftEditorLinter = _ref1.editorLinter;
        linter.scope = 'file';
        lintCount = 0;
        linter.lint = function() {
          var lintId;
          lintId = lintCount++;
          return [
            {
              key: lintId,
              type: "Error " + lintId,
              text: "Something"
            }
          ];
        };
        leftPane = atom.workspace.getActivePane();
        rightPane = leftPane.splitRight({
          copyActiveItem: true
        });
        rightEditorLinter = new EditorLinter(rightPane.getActiveItem());
        expect(leftEditorLinter.editor).not.toBe(rightEditorLinter.editor);
        linterRegistry.onDidUpdateMessages(function(linterInfo) {
          messageRegistry.set(linterInfo);
          return messageRegistry.updatePublic();
        });
        return messageRegistry.onDidUpdateMessages(function(updateDetails) {
          return messageUpdateDetails = updateDetails;
        });
      });
      afterEach(function() {
        return linterRegistry.dispose();
      });
      runLint = function(editorLinter) {
        atom.workspace.paneForItem(editorLinter.editor).activate();
        return linterRegistry.lint({
          onChange: false,
          editorLinter: editorLinter
        }).then(function() {
          var returnDetails;
          returnDetails = messageUpdateDetails;
          messageUpdateDetails = null;
          return returnDetails;
        });
      };
      return it('stores messages on a per-buffer basis', function() {
        expect(messageRegistry.publicMessages.length).toBe(0);
        return waitsForPromise(function() {
          return runLint(leftEditorLinter).then(function(_arg) {
            var added, removed;
            added = _arg.added, removed = _arg.removed;
            expect(added.length).toBe(1);
            expect(removed.length).toBe(0);
            expect(messageRegistry.publicMessages.length).toBe(1);
            return runLint(rightEditorLinter);
          }).then(function(_arg) {
            var added, removed;
            added = _arg.added, removed = _arg.removed;
            expect(added.length).toBe(1);
            expect(removed.length).toBe(1);
            return expect(messageRegistry.publicMessages.length).toBe(1);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9tZXNzYWdlLXJlZ2lzdHJ5LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsUUFBQSwrR0FBQTtBQUFBLElBQUEsZUFBQSxHQUFrQixJQUFsQixDQUFBO0FBQUEsSUFDQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSx5QkFBUixDQURsQixDQUFBO0FBQUEsSUFFQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBRmYsQ0FBQTtBQUFBLElBR0EsY0FBQSxHQUFpQixPQUFBLENBQVEsd0JBQVIsQ0FIakIsQ0FBQTtBQUFBLElBSUEsVUFBQSxHQUFhLFNBQUMsR0FBRCxHQUFBO0FBQ1gsVUFBQSxXQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sQ0FBUCxDQUFBO0FBQ0EsV0FBQSxZQUFBLEdBQUE7QUFBQSxRQUFBLElBQUEsRUFBQSxDQUFBO0FBQUEsT0FEQTtBQUVBLGFBQU8sSUFBUCxDQUhXO0lBQUEsQ0FKYixDQUFBO0FBQUEsSUFRQSxPQUFrQyxPQUFBLENBQVEsVUFBUixDQUFsQyxFQUFDLHlCQUFBLGlCQUFELEVBQW9CLGtCQUFBLFVBUnBCLENBQUE7QUFBQSxJQVVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxlQUFBLENBQWdCLFNBQUEsR0FBQTtBQUNkLFFBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBZixDQUFBLENBQUEsQ0FBQTtlQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixVQUFwQixDQUErQixDQUFDLElBQWhDLENBQXFDLFNBQUEsR0FBQTs7WUFDbkMsZUFBZSxDQUFFLE9BQWpCLENBQUE7V0FBQTtpQkFDQSxlQUFBLEdBQXNCLElBQUEsZUFB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

//# sourceURL=/Users/mk2/.atom/packages/linter/spec/message-registry-spec.coffee
