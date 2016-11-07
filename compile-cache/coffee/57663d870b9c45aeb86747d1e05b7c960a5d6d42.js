(function() {
  describe('BottomPanelMount', function() {
    var statusBar, statusBarService, workspaceElement, _ref;
    _ref = [], statusBar = _ref[0], statusBarService = _ref[1], workspaceElement = _ref[2];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar').then(function(pack) {
          statusBar = workspaceElement.querySelector('status-bar');
          return statusBarService = pack.mainModule.provideStatusBar();
        });
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('linter').then(function(pack) {
          return atom.packages.getActivePackage('linter').mainModule.consumeStatusBar(statusBar);
        });
      });
      return waitsForPromise(function() {
        return atom.workspace.open();
      });
    });
    it('can mount to left status-bar', function() {
      var tile;
      tile = statusBar.getLeftTiles()[0];
      return expect(tile.item.localName).toBe('linter-bottom-container');
    });
    return it('can mount to right status-bar', function() {
      var tile;
      atom.config.set('linter.statusIconPosition', 'Right');
      tile = statusBar.getRightTiles()[0];
      return expect(tile.item.localName).toBe('linter-bottom-container');
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy91aS9ib3R0b20tcGFuZWwtbW91bnQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixRQUFBLG1EQUFBO0FBQUEsSUFBQSxPQUFrRCxFQUFsRCxFQUFDLG1CQUFELEVBQVksMEJBQVosRUFBOEIsMEJBQTlCLENBQUE7QUFBQSxJQUNBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBbkIsQ0FBQTtBQUFBLE1BQ0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsWUFBOUIsQ0FBMkMsQ0FBQyxJQUE1QyxDQUFpRCxTQUFDLElBQUQsR0FBQTtBQUMvQyxVQUFBLFNBQUEsR0FBWSxnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixZQUEvQixDQUFaLENBQUE7aUJBQ0EsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBaEIsQ0FBQSxFQUY0QjtRQUFBLENBQWpELEVBRGM7TUFBQSxDQUFoQixDQURBLENBQUE7QUFBQSxNQUtBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFFBQTlCLENBQXVDLENBQUMsSUFBeEMsQ0FBNkMsU0FBQyxJQUFELEdBQUE7aUJBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsUUFBL0IsQ0FBd0MsQ0FBQyxVQUFVLENBQUMsZ0JBQXBELENBQXFFLFNBQXJFLEVBRDJDO1FBQUEsQ0FBN0MsRUFEYztNQUFBLENBQWhCLENBTEEsQ0FBQTthQVFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQUEsRUFEYztNQUFBLENBQWhCLEVBVFM7SUFBQSxDQUFYLENBREEsQ0FBQTtBQUFBLElBYUEsRUFBQSxDQUFHLDhCQUFILEVBQW1DLFNBQUEsR0FBQTtBQUNqQyxVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxTQUFTLENBQUMsWUFBVixDQUFBLENBQXlCLENBQUEsQ0FBQSxDQUFoQyxDQUFBO2FBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBakIsQ0FBMkIsQ0FBQyxJQUE1QixDQUFpQyx5QkFBakMsRUFGaUM7SUFBQSxDQUFuQyxDQWJBLENBQUE7V0FpQkEsRUFBQSxDQUFHLCtCQUFILEVBQW9DLFNBQUEsR0FBQTtBQUNsQyxVQUFBLElBQUE7QUFBQSxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyQkFBaEIsRUFBNkMsT0FBN0MsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFBLEdBQU8sU0FBUyxDQUFDLGFBQVYsQ0FBQSxDQUEwQixDQUFBLENBQUEsQ0FEakMsQ0FBQTthQUVBLE1BQUEsQ0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQWpCLENBQTJCLENBQUMsSUFBNUIsQ0FBaUMseUJBQWpDLEVBSGtDO0lBQUEsQ0FBcEMsRUFsQjJCO0VBQUEsQ0FBN0IsQ0FBQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/mk2/.atom/packages/linter/spec/ui/bottom-panel-mount-spec.coffee
