(function() {
  var BuildMatrixView, BuildStatusView, TravisCi, fs, path, shell;

  fs = require('fs');

  path = require('path');

  shell = require('shell');

  TravisCi = null;

  BuildMatrixView = null;

  BuildStatusView = null;

  module.exports = {
    configDefaults: {
      useTravisCiPro: false,
      personalAccessToken: '<Your personal GitHub access token>'
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
      var createStatusEntry;
      atom.travis = new TravisCi({
        version: '2.0.0',
        pro: atom.config.get('travis-ci-status.useTravisCiPro')
      });
      atom.workspaceView.command('travis-ci-status:open-on-travis', (function(_this) {
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
      if (atom.workspaceView.statusBar) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJEQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVIsQ0FGUixDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLElBSlgsQ0FBQTs7QUFBQSxFQU1BLGVBQUEsR0FBa0IsSUFObEIsQ0FBQTs7QUFBQSxFQU9BLGVBQUEsR0FBa0IsSUFQbEIsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBRUU7QUFBQSxJQUFBLGNBQUEsRUFDRTtBQUFBLE1BQUEsY0FBQSxFQUFnQixLQUFoQjtBQUFBLE1BQ0EsbUJBQUEsRUFBcUIscUNBRHJCO0tBREY7QUFBQSxJQUtBLGVBQUEsRUFBaUIsSUFMakI7QUFBQSxJQVFBLGVBQUEsRUFBaUIsSUFSakI7QUFBQSxJQWFBLFFBQUEsRUFBVSxTQUFBLEdBQUE7O1FBQ1IsV0FBWSxPQUFBLENBQVEsV0FBUjtPQUFaOztRQUNBLGtCQUFtQixPQUFBLENBQVEscUJBQVI7T0FEbkI7O1FBRUEsa0JBQW1CLE9BQUEsQ0FBUSxxQkFBUjtPQUZuQjthQUdBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBQSxJQUFvQixJQUFDLENBQUEsZUFBRCxDQUFpQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxDQUFELEdBQUE7aUJBQU8sQ0FBQSxJQUFNLEtBQUMsQ0FBQSxJQUFELENBQUEsRUFBYjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCLEVBSlo7SUFBQSxDQWJWO0FBQUEsSUFzQkEsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsV0FB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
//# sourceURL=/Users/mk2/.atom/packages/travis-ci-status/lib/travis-ci-status.coffee