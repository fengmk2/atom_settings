var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var Validate = require('./validate');
var Helpers = require('./helpers');

var MessageRegistry = (function () {
  function MessageRegistry() {
    var _this = this;

    _classCallCheck(this, MessageRegistry);

    this.hasChanged = false;
    this.shouldRefresh = true;
    this.publicMessages = [];
    this.subscriptions = new _atom.CompositeDisposable();
    this.emitter = new _atom.Emitter();
    this.linterResponses = new Map();
    // We track messages by the underlying TextBuffer the lint was run against
    // rather than the TextEditor because there may be multiple TextEditors per
    // TextBuffer when multiple panes are in use.  For each buffer, we store a
    // map whose values are messages and whose keys are the linter that produced
    // the messages.  (Note that we are talking about linter instances, not
    // EditorLinter instances.  EditorLinter instances are per-TextEditor and
    // could result in duplicated sets of messages.)
    this.bufferMessages = new Map();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter.ignoredMessageTypes', function (value) {
      return _this.ignoredMessageTypes = value || [];
    }));

    var UpdateMessages = function UpdateMessages() {
      if (_this.shouldRefresh) {
        if (_this.hasChanged) {
          _this.hasChanged = false;
          _this.updatePublic();
        }
        Helpers.requestUpdateFrame(UpdateMessages);
      }
    };
    Helpers.requestUpdateFrame(UpdateMessages);
  }

  _createClass(MessageRegistry, [{
    key: 'set',
    value: function set(_ref) {
      var _this2 = this;

      var linter = _ref.linter;
      var messages = _ref.messages;
      var editor = _ref.editor;

      if (linter.deactivated) return;
      try {
        Validate.messages(messages);
      } catch (e) {
        return Helpers.error(e);
      }
      messages = messages.filter(function (i) {
        return _this2.ignoredMessageTypes.indexOf(i.type) === -1;
      });
      if (linter.scope === 'file') {
        if (!editor.alive) return;
        if (!(editor instanceof _atom.TextEditor)) throw new Error("Given editor isn't really an editor");
        var buffer = editor.getBuffer();
        if (!this.bufferMessages.has(buffer)) this.bufferMessages.set(buffer, new Map());
        this.bufferMessages.get(buffer).set(linter, messages);
      } else {
        // It's project
        this.linterResponses.set(linter, messages);
      }
      this.hasChanged = true;
    }
  }, {
    key: 'updatePublic',
    value: function updatePublic() {
      var latestMessages = [];
      var publicMessages = [];
      var added = [];
      var removed = [];
      var currentKeys = undefined;
      var lastKeys = undefined;

      this.linterResponses.forEach(function (messages) {
        return latestMessages = latestMessages.concat(messages);
      });
      this.bufferMessages.forEach(function (bufferMessages) {
        return bufferMessages.forEach(function (messages) {
          return latestMessages = latestMessages.concat(messages);
        });
      });

      currentKeys = latestMessages.map(function (i) {
        return i.key;
      });
      lastKeys = this.publicMessages.map(function (i) {
        return i.key;
      });

      for (var i of latestMessages) {
        if (lastKeys.indexOf(i.key) === -1) {
          added.push(i);
          publicMessages.push(i);
        }
      }

      for (var i of this.publicMessages) {
        if (currentKeys.indexOf(i.key) === -1) removed.push(i);else publicMessages.push(i);
      }this.publicMessages = publicMessages;
      this.emitter.emit('did-update-messages', { added: added, removed: removed, messages: publicMessages });
    }
  }, {
    key: 'onDidUpdateMessages',
    value: function onDidUpdateMessages(callback) {
      return this.emitter.on('did-update-messages', callback);
    }
  }, {
    key: 'deleteMessages',
    value: function deleteMessages(linter) {
      if (linter.scope === 'file') {
        this.bufferMessages.forEach(function (r) {
          return r['delete'](linter);
        });
        this.hasChanged = true;
      } else if (this.linterResponses.has(linter)) {
        this.linterResponses['delete'](linter);
        this.hasChanged = true;
      }
    }
  }, {
    key: 'deleteEditorMessages',
    value: function deleteEditorMessages(editor) {
      // Caveat: in the event that there are multiple TextEditor instances open
      // referring to the same underlying buffer and those instances are not also
      // closed, the linting results for this buffer will be temporarily removed
      // until such time as a lint is re-triggered by one of the other
      // corresponding EditorLinter instances.  There are ways to mitigate this,
      // but they all involve some complexity that does not yet seem justified.
      var buffer = editor.getBuffer();
      if (!this.bufferMessages.has(buffer)) return;
      this.bufferMessages['delete'](buffer);
      this.hasChanged = true;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.shouldRefresh = false;
      this.subscriptions.dispose();
      this.linterResponses.clear();
      this.bufferMessages.clear();
    }
  }]);

  return MessageRegistry;
})();

module.exports = MessageRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9tZXNzYWdlLXJlZ2lzdHJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBQ3VELE1BQU07O0FBRDdELFdBQVcsQ0FBQTs7QUFHWCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDdEMsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBOztJQUU5QixlQUFlO0FBQ1IsV0FEUCxlQUFlLEdBQ0w7OzswQkFEVixlQUFlOztBQUVqQixRQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQTtBQUN2QixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtBQUN6QixRQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQTtBQUN4QixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0FBQzlDLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7Ozs7Ozs7O0FBUWhDLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTs7QUFFL0IsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDRCQUE0QixFQUFFLFVBQUEsS0FBSzthQUFJLE1BQUssbUJBQW1CLEdBQUksS0FBSyxJQUFJLEVBQUUsQUFBQztLQUFBLENBQUMsQ0FBQyxDQUFBOztBQUU1SCxRQUFNLGNBQWMsR0FBRyxTQUFqQixjQUFjLEdBQVM7QUFDM0IsVUFBSSxNQUFLLGFBQWEsRUFBRTtBQUN0QixZQUFJLE1BQUssVUFBVSxFQUFFO0FBQ25CLGdCQUFLLFVBQVUsR0FBRyxLQUFLLENBQUE7QUFDdkIs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QUksQ0FBQTtPQUN2QjtLQUNGOzs7V0FDbUIsOEJBQUMsTUFBTSxFQUFFOzs7Ozs7O0FBTzNCLFVBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNoQyxVQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTTtBQUM1QyxVQUFJLENBQUMsY0FBYyxVQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDbEMsVUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUE7S0FDdkI7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUE7QUFDMUIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QixVQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQzVCLFVBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUE7S0FDNUI7OztTQTlHRyxlQUFlOzs7QUFpSHJCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9tZXNzYWdlLXJlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbmltcG9ydCB7RW1pdHRlciwgVGV4dEVkaXRvciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcblxuY29uc3QgVmFsaWRhdGUgPSByZXF1aXJlKCcuL3ZhbGlkYXRlJylcbmNvbnN0IEhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKVxuXG5jbGFzcyBNZXNzYWdlUmVnaXN0cnkge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmhhc0NoYW5nZWQgPSBmYWxzZVxuICAgIHRoaXMuc2hvdWxkUmVmcmVzaCA9IHRydWVcbiAgICB0aGlzLnB1YmxpY01lc3NhZ2VzID0gW11cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMubGludGVyUmVzcG9uc2VzID0gbmV3IE1hcCgpXG4gICAgLy8gV2UgdHJhY2sgbWVzc2FnZXMgYnkgdGhlIHVuZGVybHlpbmcgVGV4dEJ1ZmZlciB0aGUgbGludCB3YXMgcnVuIGFnYWluc3RcbiAgICAvLyByYXRoZXIgdGhhbiB0aGUgVGV4dEVkaXRvciBiZWNhdXNlIHRoZXJlIG1heSBiZSBtdWx0aXBsZSBUZXh0RWRpdG9ycyBwZXJcbiAgICAvLyBUZXh0QnVmZmVyIHdoZW4gbXVsdGlwbGUgcGFuZXMgYXJlIGluIHVzZS4gIEZvciBlYWNoIGJ1ZmZlciwgd2Ugc3RvcmUgYVxuICAgIC8vIG1hcCB3aG9zZSB2YWx1ZXMgYXJlIG1lc3NhZ2VzIGFuZCB3aG9zZSBrZXlzIGFyZSB0aGUgbGludGVyIHRoYXQgcHJvZHVjZWRcbiAgICAvLyB0aGUgbWVzc2FnZXMuICAoTm90ZSB0aGF0IHdlIGFyZSB0YWxraW5nIGFib3V0IGxpbnRlciBpbnN0YW5jZXMsIG5vdFxuICAgIC8vIEVkaXRvckxpbnRlciBpbnN0YW5jZXMuICBFZGl0b3JMaW50ZXIgaW5zdGFuY2VzIGFyZSBwZXItVGV4dEVkaXRvciBhbmRcbiAgICAvLyBjb3VsZCByZXN1bHQgaW4gZHVwbGljYXRlZCBzZXRzIG9mIG1lc3NhZ2VzLilcbiAgICB0aGlzLmJ1ZmZlck1lc3NhZ2VzID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci5pZ25vcmVkTWVzc2FnZVR5cGVzJywgdmFsdWUgPT4gdGhpcy5pZ25vcmVkTWVzc2FnZVR5cGVzID0gKHZhbHVlIHx8IFtdKSkpXG5cbiAgICBjb25zdCBVcGRhdGVNZXNzYWdlcyA9ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLnNob3VsZFJlZnJlc2gpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzQ2hhbmdlZCkge1xuICAgICAgICAgIHRoaXMuaGFzQ2hhbmdlZCA9IGZhbHNlXG4gICAgICAgICAgdGhpcy51cGRhdGVQdWJsaWMoKVxuICAgICAgICB9XG4gICAgICAgIEhlbHBlcnMucmVxdWVzdFVwZGF0ZUZyYW1lKFVwZGF0ZU1lc3NhZ2VzKVxuICAgICAgfVxuICAgIH1cbiAgICBIZWxwZXJzLnJlcXVlc3RVcGRhdGVGcmFtZShVcGRhdGVNZXNzYWdlcylcbiAgfVxuICBzZXQoe2xpbnRlciwgbWVzc2FnZXMsIGVkaXRvcn0pIHtcbiAgICBpZiAobGludGVyLmRlYWN0aXZhdGVkKSByZXR1cm5cbiAgICB0cnkge1xuICAgICAgVmFsaWRhdGUubWVzc2FnZXMobWVzc2FnZXMpXG4gICAgfSBjYXRjaCAoZSkgeyByZXR1cm4gSGVscGVycy5lcnJvcihlKSB9XG4gICAgbWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIoaSA9PiB0aGlzLmlnbm9yZWRNZXNzYWdlVHlwZXMuaW5kZXhPZihpLnR5cGUpID09PSAtMSlcbiAgICBpZiAobGludGVyLnNjb3BlID09PSAnZmlsZScpIHtcbiAgICAgIGlmICghZWRpdG9yLmFsaXZlKSByZXR1cm5cbiAgICAgIGlmICghKGVkaXRvciBpbnN0YW5jZW9mIFRleHRFZGl0b3IpKSB0aHJvdyBuZXcgRXJyb3IoXCJHaXZlbiBlZGl0b3IgaXNuJ3QgcmVhbGx5IGFuIGVkaXRvclwiKVxuICAgICAgbGV0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgaWYgKCF0aGlzLmJ1ZmZlck1lc3NhZ2VzLmhhcyhidWZmZXIpKVxuICAgICAgICB0aGlzLmJ1ZmZlck1lc3NhZ2VzLnNldChidWZmZXIsIG5ldyBNYXAoKSlcbiAgICAgIHRoaXMuYnVmZmVyTWVzc2FnZXMuZ2V0KGJ1ZmZlcikuc2V0KGxpbnRlciwgbWVzc2FnZXMpXG4gICAgfSBlbHNlIHsgLy8gSXQncyBwcm9qZWN0XG4gICAgICB0aGlzLmxpbnRlclJlc3BvbnNlcy5zZXQobGludGVyLCBtZXNzYWdlcylcbiAgICB9XG4gICAgdGhpcy5oYXNDaGFuZ2VkID0gdHJ1ZVxuICB9XG4gIHVwZGF0ZVB1YmxpYygpIHtcbiAgICBsZXQgbGF0ZXN0TWVzc2FnZXMgPSBbXVxuICAgIGxldCBwdWJsaWNNZXNzYWdlcyA9IFtdXG4gICAgbGV0IGFkZGVkID0gW11cbiAgICBsZXQgcmVtb3ZlZCA9IFtdXG4gICAgbGV0IGN1cnJlbnRLZXlzXG4gICAgbGV0IGxhc3RLZXlzXG5cbiAgICB0aGlzLmxpbnRlclJlc3BvbnNlcy5mb3JFYWNoKG1lc3NhZ2VzID0+IGxhdGVzdE1lc3NhZ2VzID0gbGF0ZXN0TWVzc2FnZXMuY29uY2F0KG1lc3NhZ2VzKSlcbiAgICB0aGlzLmJ1ZmZlck1lc3NhZ2VzLmZvckVhY2goYnVmZmVyTWVzc2FnZXMgPT5cbiAgICAgIGJ1ZmZlck1lc3NhZ2VzLmZvckVhY2gobWVzc2FnZXMgPT4gbGF0ZXN0TWVzc2FnZXMgPSBsYXRlc3RNZXNzYWdlcy5jb25jYXQobWVzc2FnZXMpKVxuICAgIClcblxuICAgIGN1cnJlbnRLZXlzID0gbGF0ZXN0TWVzc2FnZXMubWFwKGkgPT4gaS5rZXkpXG4gICAgbGFzdEtleXMgPSB0aGlzLnB1YmxpY01lc3NhZ2VzLm1hcChpID0+IGkua2V5KVxuXG4gICAgZm9yIChsZXQgaSBvZiBsYXRlc3RNZXNzYWdlcykge1xuICAgICAgaWYgKGxhc3RLZXlzLmluZGV4T2YoaS5rZXkpID09PSAtMSkge1xuICAgICAgICBhZGRlZC5wdXNoKGkpXG4gICAgICAgIHB1YmxpY01lc3NhZ2VzLnB1c2goaSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGxldCBpIG9mIHRoaXMucHVibGljTWVzc2FnZXMpXG4gICAgICBpZiAoY3VycmVudEtleXMuaW5kZXhPZihpLmtleSkgPT09IC0xKVxuICAgICAgICByZW1vdmVkLnB1c2goaSlcbiAgICAgIGVsc2VcbiAgICAgICAgcHVibGljTWVzc2FnZXMucHVzaChpKVxuXG4gICAgdGhpcy5wdWJsaWNNZXNzYWdlcyA9IHB1YmxpY01lc3NhZ2VzXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC11cGRhdGUtbWVzc2FnZXMnLCB7YWRkZWQsIHJlbW92ZWQsIG1lc3NhZ2VzOiBwdWJsaWNNZXNzYWdlc30pXG4gIH1cbiAgb25EaWRVcGRhdGVNZXNzYWdlcyhjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC11cGRhdGUtbWVzc2FnZXMnLCBjYWxsYmFjaylcbiAgfVxuICBkZWxldGVNZXNzYWdlcyhsaW50ZXIpIHtcbiAgICBpZiAobGludGVyLnNjb3BlID09PSAnZmlsZScpIHtcbiAgICAgIHRoaXMuYnVmZmVyTWVzc2FnZXMuZm9yRWFjaChyID0+IHIuZGVsZXRlKGxpbnRlcikpXG4gICAgICB0aGlzLmhhc0NoYW5nZWQgPSB0cnVlXG4gICAgfSBlbHNlIGlmKHRoaXMubGludGVyUmVzcG9uc2VzLmhhcyhsaW50ZXIpKSB7XG4gICAgICB0aGlzLmxpbnRlclJlc3BvbnNlcy5kZWxldGUobGludGVyKVxuICAgICAgdGhpcy5oYXNDaGFuZ2VkID0gdHJ1ZVxuICAgIH1cbiAgfVxuICBkZWxldGVFZGl0b3JNZXNzYWdlcyhlZGl0b3IpIHtcbiAgICAvLyBDYXZlYXQ6IGluIHRoZSBldmVudCB0aGF0IHRoZXJlIGFyZSBtdWx0aXBsZSBUZXh0RWRpdG9yIGluc3RhbmNlcyBvcGVuXG4gICAgLy8gcmVmZXJyaW5nIHRvIHRoZSBzYW1lIHVuZGVybHlpbmcgYnVmZmVyIGFuZCB0aG9zZSBpbnN0YW5jZXMgYXJlIG5vdCBhbHNvXG4gICAgLy8gY2xvc2VkLCB0aGUgbGludGluZyByZXN1bHRzIGZvciB0aGlzIGJ1ZmZlciB3aWxsIGJlIHRlbXBvcmFyaWx5IHJlbW92ZWRcbiAgICAvLyB1bnRpbCBzdWNoIHRpbWUgYXMgYSBsaW50IGlzIHJlLXRyaWdnZXJlZCBieSBvbmUgb2YgdGhlIG90aGVyXG4gICAgLy8gY29ycmVzcG9uZGluZyBFZGl0b3JMaW50ZXIgaW5zdGFuY2VzLiAgVGhlcmUgYXJlIHdheXMgdG8gbWl0aWdhdGUgdGhpcyxcbiAgICAvLyBidXQgdGhleSBhbGwgaW52b2x2ZSBzb21lIGNvbXBsZXhpdHkgdGhhdCBkb2VzIG5vdCB5ZXQgc2VlbSBqdXN0aWZpZWQuXG4gICAgbGV0IGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKTtcbiAgICBpZiAoIXRoaXMuYnVmZmVyTWVzc2FnZXMuaGFzKGJ1ZmZlcikpIHJldHVyblxuICAgIHRoaXMuYnVmZmVyTWVzc2FnZXMuZGVsZXRlKGJ1ZmZlcilcbiAgICB0aGlzLmhhc0NoYW5nZWQgPSB0cnVlXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnNob3VsZFJlZnJlc2ggPSBmYWxzZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLmxpbnRlclJlc3BvbnNlcy5jbGVhcigpXG4gICAgdGhpcy5idWZmZXJNZXNzYWdlcy5jbGVhcigpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNZXNzYWdlUmVnaXN0cnlcbiJdfQ==
//# sourceURL=/Users/mk2/.atom/packages/linter/lib/message-registry.js
