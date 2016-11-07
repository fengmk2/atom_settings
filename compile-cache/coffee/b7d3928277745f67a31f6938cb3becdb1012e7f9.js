(function() {
  var Disposable;

  Disposable = require('atom').Disposable;

  module.exports = {
    instance: null,
    config: {
      lintOnFly: {
        title: 'Lint on fly',
        description: 'Lint files while typing, without the need to save them',
        type: 'boolean',
        "default": true
      },
      showErrorPanel: {
        title: 'Show Error Panel at the bottom',
        type: 'boolean',
        "default": true
      },
      showErrorTabLine: {
        title: 'Show Line tab in Bottom Panel',
        type: 'boolean',
        "default": false
      },
      showErrorTabFile: {
        title: 'Show File tab in Bottom Panel',
        type: 'boolean',
        "default": true
      },
      showErrorTabProject: {
        title: 'Show Project tab in Bottom Panel',
        type: 'boolean',
        "default": true
      },
      showErrorInline: {
        title: 'Show Inline Tooltips',
        descriptions: 'Show inline tooltips for errors',
        type: 'boolean',
        "default": true
      },
      underlineIssues: {
        title: 'Underline Issues',
        type: 'boolean',
        "default": true
      },
      ignoredMessageTypes: {
        title: "Ignored message Types",
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        }
      },
      statusIconScope: {
        title: "Scope of messages to show in status icon",
        type: 'string',
        "enum": ['File', 'Line', 'Project'],
        "default": 'Project'
      },
      statusIconPosition: {
        title: 'Position of Status Icon on Bottom Bar',
        "enum": ['Left', 'Right'],
        type: 'string',
        "default": 'Left'
      }
    },
    activate: function(state) {
      var LinterPlus, atomPackage, deprecate, _i, _len, _ref, _results;
      this.state = state;
      LinterPlus = require('./linter.coffee');
      this.instance = new LinterPlus(state);
      deprecate = require('grim').deprecate;
      _ref = atom.packages.getLoadedPackages();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        atomPackage = _ref[_i];
        if (atomPackage.metadata['linter-package']) {
          _results.push(deprecate('AtomLinter legacy API has been removed. Please refer to the Linter docs to update and the latest API: https://github.com/atom-community/linter/wiki/Migrating-to-the-new-API', {
            packageName: atomPackage.name
          }));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    serialize: function() {
      return this.state;
    },
    consumeLinter: function(linters) {
      var linter, _i, _len;
      if (!(linters instanceof Array)) {
        linters = [linters];
      }
      for (_i = 0, _len = linters.length; _i < _len; _i++) {
        linter = linters[_i];
        this.instance.addLinter(linter);
      }
      return new Disposable((function(_this) {
        return function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = linters.length; _j < _len1; _j++) {
            linter = linters[_j];
            _results.push(_this.instance.deleteLinter(linter));
          }
          return _results;
        };
      })(this));
    },
    consumeStatusBar: function(statusBar) {
      return this.instance.views.attachBottom(statusBar);
    },
    provideLinter: function() {
      return this.instance;
    },
    deactivate: function() {
      var _ref;
      return (_ref = this.instance) != null ? _ref.deactivate() : void 0;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFVBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBQ0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLElBQVY7QUFBQSxJQUNBLE1BQUEsRUFDRTtBQUFBLE1BQUEsU0FBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sYUFBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLHdEQURiO0FBQUEsUUFFQSxJQUFBLEVBQU0sU0FGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLElBSFQ7T0FERjtBQUFBLE1BS0EsY0FBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sZ0NBQVA7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsSUFGVDtPQU5GO0FBQUEsTUFTQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sK0JBQVA7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsS0FGVDtPQVZGO0FBQUEsTUFhQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sK0JBQVA7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsSUFGVDtPQWRGO0FBQUEsTUFpQkEsbUJBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGtDQUFQO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLElBRlQ7T0FsQkY7QUFBQSxNQXFCQSxlQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxzQkFBUDtBQUFBLFFBQ0EsWUFBQSxFQUFj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

//# sourceURL=/Users/mk2/.atom/packages/linter/lib/main.coffee
