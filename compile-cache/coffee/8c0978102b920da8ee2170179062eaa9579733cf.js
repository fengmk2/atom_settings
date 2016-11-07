(function() {
  var BuildMatrixView, BuildStatusView, TravisCi, fs, path, shell;

  fs = require('fs');

  path = require('path');

  shell = require('shell');

  TravisCi = null;

  BuildMatrixView = null;

  BuildStatusView = null;

  module.exports = {
    config: {
      useTravisCiPro: {
        type: 'boolean',
        "default": false
      },
      personalAccessToken: {
        type: 'string',
        "default": '<Your personal GitHub access token>'
      }
    },
    buildMatrixView: null,
    buildStatusView: null,
    activate: function() {
      if (TravisCi == null) {
        TravisCi = require('travis-ci');
      }
      if (BuildStatusView == null) {
        BuildStatusView = require('./build-status-view');
      }
      if (BuildMatrixView == null) {
        BuildMatrixView = require('./build-matrix-view');
      }
      return this.isGitHubRepo() && this.isTravisProject((function(_this) {
        return function(e) {
          return e && _this.init();
        };
      })(this));
    },
    deactivate: function() {
      var _ref, _ref1;
      atom.travis = null;
      if ((_ref = this.buildStatusView) != null) {
        _ref.destroy();
      }
      return (_ref1 = this.buildMatrixView) != null ? _ref1.destroy() : void 0;
    },
    serialize: function() {},
    isGitHubRepo: function() {
      var repo;
      repo = atom.project.getRepo();
      if (repo == null) {
        return false;
      }
      return /(.)*github\.com/i.test(repo.getOriginUrl());
    },
    getNameWithOwner: function() {
      var repo, url;
      repo = atom.project.getRepo();
      url = repo.getOriginUrl();
      if (url == null) {
        return null;
      }
      return /([^\/:]+)\/([^\/]+)$/.exec(url.replace(/\.git$/, ''))[0];
    },
    isTravisProject: function(callback) {
      var conf;
      if (!(callback instanceof Function)) {
        return;
      }
      if (atom.project.path == null) {
        return callback(false);
      }
      conf = path.join(atom.project.path, '.travis.yml');
      return fs.exists(conf, callback);
    },
    init: function() {
      var createStatusEntry, statusBar;
      atom.travis = new TravisCi({
        version: '2.0.0',
        pro: atom.config.get('travis-ci-status.useTravisCiPro')
      });
      atom.commands.add('atom-workspace', 'travis-ci-status:open-on-travis', (function(_this) {
        return function() {
          return _this.openOnTravis();
        };
      })(this));
      createStatusEntry = (function(_this) {
        return function() {
          var nwo;
          nwo = _this.getNameWithOwner();
          _this.buildMatrixView = new BuildMatrixView(nwo);
          return _this.buildStatusView = new BuildStatusView(nwo, _this.buildMatrixView);
        };
      })(this);
      statusBar = document.querySelector("status-bar");
      if (statusBar != null) {
        createStatusEntry();
      } else {
        atom.packages.once('activated', function() {
          return createStatusEntry();
        });
      }
      return null;
    },
    openOnTravis: function() {
      var domain, nwo;
      nwo = this.getNameWithOwner();
      domain = atom.travis.pro ? 'magnum.travis-ci.com' : 'travis-ci.org';
      return shell.openExternal("https://" + domain + "/" + nwo);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJEQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVIsQ0FGUixDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLElBSlgsQ0FBQTs7QUFBQSxFQU1BLGVBQUEsR0FBa0IsSUFObEIsQ0FBQTs7QUFBQSxFQU9BLGVBQUEsR0FBa0IsSUFQbEIsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBRUU7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsY0FBQSxFQUNJO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7T0FESjtBQUFBLE1BR0EsbUJBQUEsRUFDSTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxxQ0FEVDtPQUpKO0tBREY7QUFBQSxJQVNBLGVBQUEsRUFBaUIsSUFUakI7QUFBQSxJQVlBLGVBQUEsRUFBaUIsSUFaakI7QUFBQSxJQWlCQSxRQUFBLEVBQVUsU0FBQSxHQUFBOztRQUNSLFdBQVksT0FBQSxDQUFRLFdBQVI7T0FBWjs7UUFDQSxrQkFBbUIsT0FBQSxDQUFRLHFCQUFSO09BRG5COztRQUVBLGtCQUFtQixPQUFBLENBQVEscUJBQVI7T0FGbkI7YUFHQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBQUEsSUFBb0IsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsQ0FBRCxHQUFBO2lCQUFPLENBQUEsSUFBTSxLQUFDLENBQUEsSUFBRCxDQUFBLEVBQWI7UUFB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
//# sourceURL=/Users/mk2/.atom/packages/travis-ci-status/lib/travis-ci-status.coffee