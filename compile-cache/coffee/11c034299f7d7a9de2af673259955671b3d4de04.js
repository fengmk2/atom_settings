(function() {
  var BottomContainer, BottomPanel, BottomStatus, CompositeDisposable, LinterViews, Message;

  CompositeDisposable = require('atom').CompositeDisposable;

  BottomPanel = require('./ui/bottom-panel').BottomPanel;

  BottomContainer = require('./ui/bottom-container');

  BottomStatus = require('./ui/bottom-status');

  Message = require('./ui/message-element').Message;

  LinterViews = (function() {
    function LinterViews(linter) {
      this.linter = linter;
      this.state = this.linter.state;
      this.subscriptions = new CompositeDisposable;
      this.messages = [];
      this.markers = new WeakMap();
      this.panel = new BottomPanel(this.state.scope);
      this.bottomContainer = new BottomContainer().prepare(this.linter.state);
      this.bottomBar = null;
      this.bubble = null;
      this.count = {
        File: 0,
        Line: 0,
        Project: 0
      };
      this.subscriptions.add(this.panel);
      this.subscriptions.add(atom.config.observe('linter.underlineIssues', (function(_this) {
        return function(underlineIssues) {
          return _this.underlineIssues = underlineIssues;
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('linter.showErrorInline', (function(_this) {
        return function(showBubble) {
          return _this.showBubble = showBubble;
        };
      })(this)));
      this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          _this.classifyMessages(_this.messages);
          _this.renderPanelMarkers({
            added: _this.messages,
            removed: _this.messages
          });
          _this.renderBubble();
          _this.renderCount();
          return _this.panel.refresh(_this.state.scope);
        };
      })(this)));
      this.subscriptions.add(this.bottomContainer.onDidChangeTab((function(_this) {
        return function() {
          atom.config.set('linter.showErrorPanel', true);
          return _this.panel.refresh(_this.state.scope);
        };
      })(this)));
      this.subscriptions.add(this.bottomContainer.onShouldTogglePanel((function(_this) {
        return function() {
          return atom.config.set('linter.showErrorPanel', !atom.config.get('linter.showErrorPanel'));
        };
      })(this)));
    }

    LinterViews.prototype.render = function(_arg) {
      var added, messages, removed;
      added = _arg.added, removed = _arg.removed, messages = _arg.messages;
      this.messages = this.classifyMessages(messages);
      this.panel.setMessages({
        added: added,
        removed: removed
      });
      this.renderPanelMarkers({
        added: added,
        removed: removed
      });
      this.renderBubble();
      return this.renderCount();
    };

    LinterViews.prototype.renderLineMessages = function(render) {
      if (render == null) {
        render = false;
      }
      this.classifyMessagesByLine(this.messages);
      if (render) {
        this.renderCount();
        return this.panel.refresh(this.state.scope);
      }
    };

    LinterViews.prototype.classifyMessages = function(messages) {
      var filePath, key, message, _ref;
      filePath = (_ref = atom.workspace.getActiveTextEditor()) != null ? _ref.getPath() : void 0;
      this.count.File = 0;
      this.count.Project = 0;
      for (key in messages) {
        message = messages[key];
        if (message.currentFile = filePath && message.filePath === filePath) {
          this.count.File++;
        }
        this.count.Project++;
      }
      return this.classifyMessagesByLine(messages);
    };

    LinterViews.prototype.classifyMessagesByLine = function(messages) {
      var key, message, row, _ref;
      row = (_ref = atom.workspace.getActiveTextEditor()) != null ? _ref.getCursorBufferPosition().row : void 0;
      this.count.Line = 0;
      for (key in messages) {
        message = messages[key];
        if (message.currentLine = message.currentFile && message.range && message.range.intersectsRow(row)) {
          this.count.Line++;
        }
      }
      return messages;
    };

    LinterViews.prototype.renderBubble = function() {
      var activeEditor, message, point, _i, _len, _ref, _results;
      this.removeBubble();
      if (!this.showBubble) {
        return;
      }
      activeEditor = atom.workspace.getActiveTextEditor();
      if (!(activeEditor != null ? typeof activeEditor.getPath === "function" ? activeEditor.getPath() : void 0 : void 0)) {
        return;
      }
      point = activeEditor.getCursorBufferPosition();
      _ref = this.messages;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        message = _ref[_i];
        if (!message.currentLine) {
          continue;
        }
        if (!message.range.containsPoint(point)) {
          continue;
        }
        this.bubble = activeEditor.markBufferRange([point, point], {
          invalidate: 'inside'
        });
        activeEditor.decorateMarker(this.bubble, {
          type: 'overlay',
          position: 'tail',
          item: this.renderBubbleContent(message)
        });
        break;
      }
      return _results;
    };

    LinterViews.prototype.renderBubbleContent = function(message) {
      var bubble;
      bubble = document.createElement('div');
      bubble.id = 'linter-inline';
      bubble.appendChild(Message.fromMessage(message));
      if (message.trace) {
        message.trace.forEach(function(trace) {
          var element;
          element = Message.fromMessage(trace);
          bubble.appendChild(element);
          return element.updateVisibility('Project');
        });
      }
      return bubble;
    };

    LinterViews.prototype.renderCount = function() {
      return this.bottomContainer.setCount(this.count);
    };

    LinterViews.prototype.renderPanelMarkers = function(_arg) {
      var activeEditor, added, removed;
      added = _arg.added, removed = _arg.removed;
      this.removeMarkers(removed);
      activeEditor = atom.workspace.getActiveTextEditor();
      if (!activeEditor) {
        return;
      }
      return added.forEach((function(_this) {
        return function(message) {
          var marker;
          if (!message.currentFile) {
            return;
          }
          _this.markers.set(message, marker = activeEditor.markBufferRange(message.range, {
            invalidate: 'inside'
          }));
          activeEditor.decorateMarker(marker, {
            type: 'line-number',
            "class": "linter-highlight " + message["class"]
          });
          if (_this.underlineIssues) {
            return activeEditor.decorateMarker(marker, {
              type: 'highlight',
              "class": "linter-highlight " + message["class"]
            });
          }
        };
      })(this));
    };

    LinterViews.prototype.attachBottom = function(statusBar) {
      return this.subscriptions.add(atom.config.observe('linter.statusIconPosition', (function(_this) {
        return function(statusIconPosition) {
          var _ref;
          if ((_ref = _this.bottomBar) != null) {
            _ref.destroy();
          }
          return _this.bottomBar = statusBar["add" + statusIconPosition + "Tile"]({
            item: _this.bottomContainer,
            priority: statusIconPosition === 'Left' ? -100 : 100
          });
        };
      })(this)));
    };

    LinterViews.prototype.removeMarkers = function(messages) {
      if (messages == null) {
        messages = this.messages;
      }
      return messages.forEach((function(_this) {
        return function(message) {
          var marker;
          if (!_this.markers.has(message)) {
            return;
          }
          marker = _this.markers.get(message);
          marker.destroy();
          return _this.markers["delete"](message);
        };
      })(this));
    };

    LinterViews.prototype.removeBubble = function() {
      var _ref;
      if ((_ref = this.bubble) != null) {
        _ref.destroy();
      }
      return this.bubble = null;
    };

    LinterViews.prototype.dispose = function() {
      this.removeMarkers();
      this.removeBubble();
      this.subscriptions.dispose();
      if (this.bottomBar) {
        return this.bottomBar.destroy();
      }
    };

    return LinterViews;

  })();

  module.exports = LinterViews;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2xpbnRlci12aWV3cy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUZBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVDLGNBQWUsT0FBQSxDQUFRLG1CQUFSLEVBQWYsV0FGRCxDQUFBOztBQUFBLEVBR0EsZUFBQSxHQUFrQixPQUFBLENBQVEsdUJBQVIsQ0FIbEIsQ0FBQTs7QUFBQSxFQUlBLFlBQUEsR0FBZSxPQUFBLENBQVEsb0JBQVIsQ0FKZixDQUFBOztBQUFBLEVBS0MsVUFBVyxPQUFBLENBQVEsc0JBQVIsRUFBWCxPQUxELENBQUE7O0FBQUEsRUFPTTtBQUNTLElBQUEscUJBQUUsTUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBRGpCLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxRQUFELEdBQVksRUFGWixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsT0FBQSxDQUFBLENBSGYsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLFdBQUEsQ0FBWSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQW5CLENBSmIsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxlQUFBLENBQUEsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQWxDLENBTHZCLENBQUE7QUFBQSxN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

//# sourceURL=/Users/mk2/.atom/packages/linter/lib/linter-views.coffee
