(function() {
  describe('linter-registry', function() {
    var EditorLinter, LinterRegistry, getLinter, getMessage, linterRegistry, _ref;
    LinterRegistry = require('../lib/linter-registry');
    EditorLinter = require('../lib/editor-linter');
    linterRegistry = null;
    _ref = require('./common'), getLinter = _ref.getLinter, getMessage = _ref.getMessage;
    beforeEach(function() {
      waitsForPromise(function() {
        atom.workspace.destroyActivePaneItem();
        return atom.workspace.open('file.txt');
      });
      if (linterRegistry != null) {
        linterRegistry.dispose();
      }
      return linterRegistry = new LinterRegistry;
    });
    describe('::addLinter', function() {
      it('adds error notification if linter is invalid', function() {
        linterRegistry.addLinter({});
        return expect(atom.notifications.getNotifications().length).toBe(1);
      });
      it('pushes linter into registry when valid', function() {
        var linter;
        linter = getLinter();
        linterRegistry.addLinter(linter);
        return expect(linterRegistry.linters.length).toBe(1);
      });
      return it('set deactivated to false on linter', function() {
        var linter;
        linter = getLinter();
        linterRegistry.addLinter(linter);
        return expect(linter.deactivated).toBe(false);
      });
    });
    describe('::hasLinter', function() {
      it('returns true if present', function() {
        var linter;
        linter = getLinter();
        linterRegistry.addLinter(linter);
        return expect(linterRegistry.hasLinter(linter)).toBe(true);
      });
      return it('returns false if not', function() {
        var linter;
        linter = getLinter();
        return expect(linterRegistry.hasLinter(linter)).toBe(false);
      });
    });
    describe('::deleteLinter', function() {
      it('deletes the linter from registry', function() {
        var linter;
        linter = getLinter();
        linterRegistry.addLinter(linter);
        expect(linterRegistry.hasLinter(linter)).toBe(true);
        linterRegistry.deleteLinter(linter);
        return expect(linterRegistry.hasLinter(linter)).toBe(false);
      });
      return it('sets deactivated to true on linter', function() {
        var linter;
        linter = getLinter();
        linterRegistry.addLinter(linter);
        linterRegistry.deleteLinter(linter);
        return expect(linter.deactivated).toBe(true);
      });
    });
    describe('::lint', function() {
      it("doesn't lint if textEditor isn't active one", function() {
        var editorLinter, linter;
        editorLinter = new EditorLinter(atom.workspace.getActiveTextEditor());
        linter = {
          grammarScopes: ['*'],
          lintOnFly: false,
          modifiesBuffer: false,
          scope: 'file',
          lint: function() {}
        };
        linterRegistry.addLinter(linter);
        return waitsForPromise(function() {
          return atom.workspace.open('test2.txt').then(function() {
            return expect(linterRegistry.lint({
              onChange: false,
              editorLinter: editorLinter
            })).toBeUndefined();
          });
        });
      });
      it("doesn't lint if textEditor doesn't have a path", function() {
        var editorLinter, linter;
        editorLinter = new EditorLinter(atom.workspace.getActiveTextEditor());
        linter = {
          grammarScopes: ['*'],
          lintOnFly: false,
          modifiesBuffer: false,
          scope: 'file',
          lint: function() {}
        };
        linterRegistry.addLinter(linter);
        return waitsForPromise(function() {
          return atom.workspace.open('someNonExistingFile.txt').then(function() {
            return expect(linterRegistry.lint({
              onChange: false,
              editorLinter: editorLinter
            })).toBeUndefined();
          });
        });
      });
      it('disallows two co-current lints of same type', function() {
        var editorLinter, linter;
        editorLinter = new EditorLinter(atom.workspace.getActiveTextEditor());
        linter = {
          grammarScopes: ['*'],
          lintOnFly: false,
          modifiesBuffer: false,
          scope: 'file',
          lint: function() {}
        };
        linterRegistry.addLinter(linter);
        expect(linterRegistry.lint({
          onChange: false,
          editorLinter: editorLinter
        })).toBeDefined();
        return expect(linterRegistry.lint({
          onChange: false,
          editorLinter: editorLinter
        })).toBeUndefined();
      });
      return describe('buffer modifying linter', function() {
        it('triggers before other linters', function() {
          var bufferModifying, editorLinter, last, normalLinter;
          last = null;
          normalLinter = {
            grammarScopes: ['*'],
            lintOnFly: false,
            modifiesBuffer: false,
            scope: 'file',
            lint: function() {
              return last = 'normal';
            }
          };
          bufferModifying = {
            grammarScopes: ['*'],
            lintOnFly: false,
            modifiesBuffer: true,
            scope: 'file',
            lint: function() {
              return last = 'bufferModifying';
            }
          };
          editorLinter = new EditorLinter(atom.workspace.getActiveTextEditor());
          linterRegistry.addLinter(normalLinter);
          linterRegistry.addLinter(bufferModifying);
          return waitsForPromise(function() {
            return linterRegistry.lint({
              onChange: false,
              editorLinter: editorLinter
            }).then(function() {
              return expect(last).toBe('normal');
            });
          });
        });
        return it('runs in sequence', function() {
          var editorLinter, first, order, second, third;
          order = [];
          first = {
            grammarScopes: ['*'],
            lintOnFly: false,
            modifiesBuffer: true,
            scope: 'file',
            lint: function() {
              return order.push('first');
            }
          };
          second = {
            grammarScopes: ['*'],
            lintOnFly: false,
            modifiesBuffer: true,
            scope: 'file',
            lint: function() {
              return order.push('second');
            }
          };
          third = {
            grammarScopes: ['*'],
            lintOnFly: false,
            modifiesBuffer: true,
            scope: 'file',
            lint: function() {
              return order.push('third');
            }
          };
          editorLinter = new EditorLinter(atom.workspace.getActiveTextEditor());
          linterRegistry.addLinter(first);
          linterRegistry.addLinter(second);
          linterRegistry.addLinter(third);
          return waitsForPromise(function() {
            return linterRegistry.lint({
              onChange: false,
              editorLinter: editorLinter
            }).then(function() {
              expect(order[0]).toBe('first');
              expect(order[1]).toBe('second');
              return expect(order[2]).toBe('third');
            });
          });
        });
      });
    });
    return describe('::onDidUpdateMessages', function() {
      return it('is triggered whenever messages change', function() {
        var editorLinter, info, linter;
        editorLinter = new EditorLinter(atom.workspace.getActiveTextEditor());
        linter = {
          grammarScopes: ['*'],
          lintOnFly: false,
          modifiesBuffer: false,
          scope: 'file',
          lint: function() {
            return [
              {
                type: "Error",
                text: "Something"
              }
            ];
          }
        };
        info = void 0;
        linterRegistry.addLinter(linter);
        linterRegistry.onDidUpdateMessages(function(linterInfo) {
          return info = linterInfo;
        });
        return waitsForPromise(function() {
          return linterRegistry.lint({
            onChange: false,
            editorLinter: editorLinter
          }).then(function() {
            expect(info).toBeDefined();
            return expect(info.messages.length).toBe(1);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9saW50ZXItcmVnaXN0cnktc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixRQUFBLHlFQUFBO0FBQUEsSUFBQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSx3QkFBUixDQUFqQixDQUFBO0FBQUEsSUFDQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBRGYsQ0FBQTtBQUFBLElBRUEsY0FBQSxHQUFpQixJQUZqQixDQUFBO0FBQUEsSUFHQSxPQUEwQixPQUFBLENBQVEsVUFBUixDQUExQixFQUFDLGlCQUFBLFNBQUQsRUFBWSxrQkFBQSxVQUhaLENBQUE7QUFBQSxJQUtBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO0FBQ2QsUUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFmLENBQUEsQ0FBQSxDQUFBO2VBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFVBQXBCLEVBRmM7TUFBQSxDQUFoQixDQUFBLENBQUE7O1FBR0EsY0FBYyxDQUFFLE9BQWhCLENBQUE7T0FIQTthQUlBLGNBQUEsR0FBaUIsR0FBQSxDQUFBLGVBTFI7SUFBQSxDQUFYLENBTEEsQ0FBQTtBQUFBLElBWUEsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLE1BQUEsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUEsR0FBQTtBQUNqRCxRQUFBLGNBQWMsQ0FBQyxTQUFmLENBQXlCLEVBQXpCLENBQUEsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFuQixDQUFBLENBQXFDLENBQUMsTUFBN0MsQ0FB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

//# sourceURL=/Users/mk2/.atom/packages/linter/spec/linter-registry-spec.coffee
