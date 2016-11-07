(function() {
  var CompositeDisposable, ShowTodoView, url;

  CompositeDisposable = require('atom').CompositeDisposable;

  url = require('url');

  ShowTodoView = require('./show-todo-view');

  module.exports = {
    config: {
      findTheseRegexes: {
        type: 'array',
        "default": ['FIXMEs', '/\\bFIXME:?\\d*($|\\s.*$)/g', 'TODOs', '/\\bTODO:?\\d*($|\\s.*$)/g', 'CHANGEDs', '/\\bCHANGED:?\\d*($|\\s.*$)/g', 'XXXs', '/\\bXXX:?\\d*($|\\s.*$)/g', 'IDEAs', '/\\bIDEA:?\\d*($|\\s.*$)/g', 'HACKs', '/\\bHACK:?\\d*($|\\s.*$)/g', 'NOTEs', '/\\bNOTE:?\\d*($|\\s.*$)/g', 'REVIEWs', '/\\bREVIEW:?\\d*($|\\s.*$)/g'],
        items: {
          type: 'string'
        }
      },
      ignoreThesePaths: {
        type: 'array',
        "default": ['*/node_modules/', '*/vendor/', '*/bower_components/'],
        items: {
          type: 'string'
        }
      },
      openListInDirection: {
        type: 'string',
        "default": 'right',
        "enum": ['up', 'right', 'down', 'left', 'ontop']
      },
      groupMatchesBy: {
        type: 'string',
        "default": 'regex',
        "enum": ['regex', 'file', 'none']
      },
      rememberViewSize: {
        type: 'boolean',
        "default": true
      }
    },
    activate: function() {
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.commands.add('atom-workspace', {
        'todo-show:find-in-project': (function(_this) {
          return function() {
            return _this.show('todolist-preview:///TODOs');
          };
        })(this),
        'todo-show:find-in-open-files': (function(_this) {
          return function() {
            return _this.show('todolist-preview:///Open-TODOs');
          };
        })(this)
      }));
      return this.disposables.add(atom.workspace.addOpener(function(uriToOpen) {
        var host, pathname, protocol, _ref;
        _ref = url.parse(uriToOpen), protocol = _ref.protocol, host = _ref.host, pathname = _ref.pathname;
        if (pathname) {
          pathname = decodeURI(pathname);
        }
        if (protocol !== 'todolist-preview:') {
          return;
        }
        return new ShowTodoView({
          filePath: pathname
        }).getTodos();
      }));
    },
    deactivate: function() {
      var _ref, _ref1;
      if ((_ref = this.paneDisposables) != null) {
        _ref.dispose();
      }
      return (_ref1 = this.disposables) != null ? _ref1.dispose() : void 0;
    },
    destroyPaneItem: function() {
      var pane;
      pane = atom.workspace.paneForItem(this.showTodoView);
      if (!pane) {
        return false;
      }
      pane.destroyItem(this.showTodoView);
      if (pane.getItems().length === 0) {
        pane.destroy();
      }
      return true;
    },
    show: function(uri) {
      var direction, prevPane;
      prevPane = atom.workspace.getActivePane();
      direction = atom.config.get('todo-show.openListInDirection');
      if (this.destroyPaneItem()) {
        return;
      }
      if (direction === 'down') {
        if (prevPane.parent.orientation !== 'vertical') {
          prevPane.splitDown();
        }
      } else if (direction === 'up') {
        if (prevPane.parent.orientation !== 'vertical') {
          prevPane.splitUp();
        }
      }
      return atom.workspace.open(uri, {
        split: direction
      }).done((function(_this) {
        return function(showTodoView) {
          _this.showTodoView = showTodoView;
          return prevPane.activate();
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvbGliL3Nob3ctdG9kby5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0NBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUixDQUROLENBQUE7O0FBQUEsRUFHQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGtCQUFSLENBSGYsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFFRTtBQUFBLE1BQUEsZ0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxRQUVBLFNBQUEsRUFBUyxDQUNQLFFBRE8sRUFFUCw2QkFGTyxFQUdQLE9BSE8sRUFJUCw0QkFKTyxFQUtQLFVBTE8sRUFNUCwrQkFOTyxFQU9QLE1BUE8sRUFRUCwyQkFSTyxFQVNQLE9BVE8sRUFVUCw0QkFWTyxFQVdQLE9BWE8sRUFZUCw0QkFaTyxFQWFQLE9BYk8sRUFjUCw0QkFkTyxFQWVQLFNBZk8sRUFnQlAsOEJBaEJPLENBRlQ7QUFBQSxRQW9CQSxLQUFBLEVBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxRQUFOO1NBckJGO09BREY7QUFBQSxNQXdCQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLENBQ1AsaUJBRE8sRUFFUCxXQUZPLEVBR1AscUJBSE8sQ0FEVDtBQUFBLFFBTUEsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQVBGO09BekJGO0FBQUEsTUFrQ0EsbUJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxPQURUO0FBQUEsUUFFQSxNQUFBLEVBQU0sQ0FBQyxJQUFELEVBQU8sT0FBUCxFQUFnQixNQUFoQixFQUF3QixNQUF4QixFQUFnQyxPQUFoQyxDQUZOO09BbkNGO0FBQUEsTUF1Q0EsY0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLE9BRFQ7QUFBQSxRQUVBLE1BQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLE1BQWxCLENBRk47T0F4Q0Y7QUFBQSxNQTRDQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7T0E3Q0Y7S0FGRjtBQUFBLElBa0RBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLG1CQUFmLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ2Y7QUFBQSxRQUFBLDJCQUFBLEVBQTZCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxJQUFELENBQU0sMkJBQU4sRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCO0FBQUEsUUFDQSw4QkFBQSxFQUFnQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsSUFBRCxDQUFNLGdDQUFOLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURoQztPQURlLENBQWpCLENBREEsQ0FBQTthQU1BLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQWYsQ0FBeUIsU0FBQyxTQUFELEdBQUE7QUFDeEMsWUFBQSw4QkFBQTtBQUFBLFFBQUEsT0FBNkIsR0FBRyxDQUFDLEtBQUosQ0FBVSxTQUFWLENBQTdCLEVBQUMsZ0JBQUEsUUFBRCxFQUFXLFlBQUEsSUFBWCxFQUFpQixnQkFBQSxRQUFqQixDQUFBO0FBQ0EsUUFBQSxJQUFrQyxRQUFsQztBQUFBLFVBQUEsUUFBQSxHQUFXLFNBQUEsQ0FBVSxRQUFWLENBQVgsQ0FBQTtTQURBO0FBRUEsUUFBQSxJQUFjLFFBQUEsS0FBWSxtQkFBMUI7QUFBQSxnQkFBQSxDQUFBO1NBRkE7ZUFHSSxJQUFBLFlBQUEsQ0FBYTtBQUFBLFVBQUEsUUFBQSxFQUFVLFFBQVY7U0FBYixDQUFnQyxDQUFDLFFBQWpDLENBQUEsRUFKb0M7TUFBQSxDQUF6QixDQUFqQixFQVBRO0lBQUEsQ0FsRFY7QUFBQSxJQStEQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxXQUFBOztZQUFnQixDQUFFLE9BQWxCLENBQUE7T0FBQTt1REFDWSxDQUFFLE9BQWQsQ0FBQSxXQUZVO0lBQUEsQ0EvRFo7QUFBQSxJQW1FQSxlQUFBLEVBQWlCLFNBQUEsR0FBQTtBQUNmLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBZixDQUEyQixJQUFDLENBQUEsWUFBNUIsQ0FBUCxDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsSUFBQTtBQUFBLGVBQU8sS0FBUCxDQUFBO09BREE7QUFBQSxNQUdBLElBQUksQ0FBQyxXQUFMLENBQWlCLElBQUMsQ0FBQSxZQUFsQixDQUhBLENBQUE7QUFLQSxNQUFBLElBQWtCLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBZSxDQUFDLE1BQWhCLEtBQTBCLENBQTVDO0FBQUEsUUFBQSxJQUFJLENBQUMsT0FBTCxDQUFBLENBQUEsQ0FBQTtPQUxBO0FBTUEsYUFBTyxJQUFQLENBUGU7SUFBQSxDQW5FakI7QUFBQSxJQTRFQSxJQUFBLEVBQU0sU0FBQyxHQUFELEdBQUE7QUFDSixVQUFBLG1CQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBWCxDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtCQUFoQixDQURaLENBQUE7QUFHQSxNQUFBLElBQVUsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFWO0FBQUEsY0FBQSxDQUFBO09BSEE7QUFLQSxNQUFBLElBQUcsU0FBQSxLQUFhLE1BQWhCO0FBQ0UsUUFBQSxJQUF3QixRQUFRLENBQUMsTUFBTSxDQUFDLFdBQWhCLEtBQWlDLFVBQXpEO0FBQUEsVUFBQSxRQUFRLENBQUMsU0FBVCxDQUFBLENBQUEsQ0FBQTtTQURGO09BQUEsTUFFSyxJQUFHLFNBQUEsS0FBYSxJQUFoQjtBQUNILFFBQUEsSUFBc0IsUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFoQixLQUFpQyxVQUF2RDtBQUFBLFVBQUEsUUFBUSxDQUFDLE9BQVQsQ0FBQSxDQUFBLENBQUE7U0FERztPQVBMO2FBVUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLEdBQXBCLEVBQXlCO0FBQUEsUUFBQSxLQUFBLEVBQU8sU0FBUDtPQUF6QixDQUEwQyxDQUFDLElBQTNDLENBQWdELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFFLFlBQUYsR0FBQTtBQUM5QyxVQUQrQyxLQUFDLENBQUEsZUFBQSxZQUNoRCxDQUFBO2lCQUFBLFFBQVEsQ0FBQyxRQUFULENBQUEsRUFEOEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoRCxFQVhJO0lBQUEsQ0E1RU47R0FORixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/mk2/.atom/packages/todo-show/lib/show-todo.coffee
