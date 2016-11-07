(function() {
  var BuildMatrixView, BuildStatusView, TravisCi, fs, path, spawn;

  fs = require('fs');

  path = require('path');

  spawn = require('child_process').spawn;

  TravisCi = require('travis-ci');

  BuildMatrixView = require('./build-matrix-view');

  BuildStatusView = require('./build-status-view');

  module.exports = {
    configDefaults: {
      useTravisCiPro: false,
      personalAccessToken: '<Your personal GitHub access token>'
    },
    buildMatrixView: null,
    buildStatusView: null,
    activate: function() {
      var createStatusEntry;
      if (!(this.isTravisProject() && this.isGitHubRepo())) {
        return;
      }
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
        return createStatusEntry();
      } else {
        return atom.packages.once('activated', function() {
          return createStatusEntry();
        });
      }
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
      return url.replace(/(.)*@github\.com/i, '').replace(/https:\/\/github\.com\//i, '').replace(/\.git/i, '').substr(1);
    },
    isTravisProject: function() {
      var travisConf;
      if (atom.project.path == null) {
        return false;
      }
      travisConf = path.join(atom.project.path, '.travis.yml');
      return fs.existsSync(travisConf);
    },
    openOnTravis: function() {
      var domain, nwo, url;
      nwo = this.getNameWithOwner();
      domain = atom.config.get('travis-ci-status.useTravisCiPro') ? 'magnum.travis-ci.com' : 'travis-ci.org';
      url = "https://" + domain + "/" + nwo;
      return spawn('open', [url]);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJEQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQyxRQUFTLE9BQUEsQ0FBUSxlQUFSLEVBQVQsS0FGRCxDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxXQUFSLENBSlgsQ0FBQTs7QUFBQSxFQU1BLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSLENBTmxCLENBQUE7O0FBQUEsRUFPQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxxQkFBUixDQVBsQixDQUFBOztBQUFBLEVBU0EsTUFBTSxDQUFDLE9BQVAsR0FFRTtBQUFBLElBQUEsY0FBQSxFQUNFO0FBQUEsTUFBQSxjQUFBLEVBQWdCLEtBQWhCO0FBQUEsTUFDQSxtQkFBQSxFQUFxQixxQ0FEckI7S0FERjtBQUFBLElBS0EsZUFBQSxFQUFpQixJQUxqQjtBQUFBLElBUUEsZUFBQSxFQUFpQixJQVJqQjtBQUFBLElBYUEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLFVBQUEsaUJBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxDQUFjLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxJQUF1QixJQUFDLENBQUEsWUFBRCxDQUFBLENBQXJDLENBQUE7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BRUEsSUFBSSxDQUFDLE1BQUwsR0FBa0IsSUFBQSxRQUFBLENBQVM7QUFBQSxRQUN6QixPQUFBLEVBQVMsT0FEZ0I7QUFBQSxRQUV6QixHQUFBLEVBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixDQUZvQjtPQUFULENBRmxCLENBQUE7QUFBQSxNQU9BLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsaUNBQTNCLEVBQThELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQzVELEtBQUMsQ0FBQSxZQUFELENBQUEsRUFENEQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5RCxDQVBBLENBQUE7QUFBQSxNQVVBLGlCQUFBLEdBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDbEIsY0FBQSxHQUFBO0FBQUEsVUFBQSxHQUFBLEdBQU0sS0FBQyxDQUFBLGdCQUFELENBQUEsQ0FBTixDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsZUFBRCxHQUF1QixJQUFBLGVBQUEsQ0FBZ0IsR0FBaEIsQ0FEdkIsQ0FBQTtpQkFFQSxLQUFDLENBQUEsZUFBRCxHQUF1QixJQUFBLGVBQUEsQ0FBZ0IsR0FBaEIsRUFBcUIsS0FBQyxDQUFBLGVBQXRCLEVBSEw7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVZwQixDQUFBO0FBZUEsTUFBQSxJQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBdEI7ZUFDRSxpQkFBQSxDQUFBLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFkLENBQW1CLFdBQW5CLEVBQWdDLFNBQUEsR0FBQTtpQkFDOUIsaUJBQUEsQ0FBQSxFQUQ4QjtRQUFBLENBQWhDLEVBSEY7T0FoQlE7SUFBQSxDQWJWO0FBQUEsSUFzQ0EsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsV0FBQTtBQUFBLE1BQUEsSUFBSSxDQUFDLE1BQUwsR0FBYyxJQUFkLENBQUE7O1lBQ2dCLENBQUUsT0FBbEIsQ0FBQTtPQURBOzJEQUVnQixDQUFFLE9BQWxCLENBQUEsV0FIVTtJQUFBLENBdENaO0FBQUEsSUE4Q0EsU0FBQSxFQUFXLFNBQUEsR0FBQSxDQTlDWDtBQUFBLElBbURBLFlBQUEsRUFBYyxTQUFBLEdBQUE7QUFDWixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBQSxDQUFQLENBQUE7QUFDQSxNQUFBLElBQW9CLFlBQXBCO0FBQUEsZUFBTyxLQUFQLENBQUE7T0FEQTthQUVBLGtCQUFrQixDQUFDLElBQW5CLENBQXdCLElBQUksQ0FBQyxZQUFMLENBQUEsQ0FBeEIsRUFIWTtJQUFBLENBbkRkO0FBQUEsSUE0REEsZ0JBQUEsRUFBa0IsU0FBQSxHQUFBO0FBQ2hCLFVBQUEsU0FBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLENBQVAsQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFPLElBQUksQ0FBQyxZQUFMLENBQUEsQ0FEUCxDQUFBO0FBRUEsTUFBQSxJQUFtQixXQUFuQjtBQUFBLGVBQU8sSUFBUCxDQUFBO09BRkE7YUFHQSxHQUFHLENBQUMsT0FBSixDQUFZLG1CQUFaLEVBQWlDLEVBQWpDLENBQ0UsQ0FBQyxPQURILENBQ1csMEJBRFgsRUFDdUMsRUFEdkMsQ0FFRSxDQUFDLE9BRkgsQ0FFVyxRQUZYLEVBRXFCLEVBRnJCLENBRXdCLENBQUMsTUFGekIsQ0FFZ0MsQ0FGaEMsRUFKZ0I7SUFBQSxDQTVEbEI7QUFBQSxJQXVFQSxlQUFBLEVBQWlCLFNBQUEsR0FBQTtBQUNmLFVBQUEsVUFBQTtBQUFBLE1BQUEsSUFBb0IseUJBQXBCO0FBQUEsZUFBTyxLQUFQLENBQUE7T0FBQTtBQUFBLE1BQ0EsVUFBQSxHQUFhLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUF2QixFQUE2QixhQUE3QixDQURiLENBQUE7YUFFQSxFQUFFLENBQUMsVUFBSCxDQUFjLFVBQWQsRUFIZTtJQUFBLENBdkVqQjtBQUFBLElBK0VBLFlBQUEsRUFBYyxTQUFBLEdBQUE7QUFDWixVQUFBLGdCQUFBO0FBQUEsTUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FBTixDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixDQUFILEdBQ1Asc0JBRE8sR0FHUCxlQUpGLENBQUE7QUFBQSxNQU1BLEdBQUEsR0FBTyxVQUFBLEdBQVMsTUFBVCxHQUFpQixHQUFqQixHQUFtQixHQU4xQixDQUFBO2FBT0EsS0FBQSxDQUFNLE1BQU4sRUFBYyxDQUFDLEdBQUQsQ0FBZCxFQVJZO0lBQUEsQ0EvRWQ7R0FYRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/mk2/.atom/packages/travis-ci-status/lib/travis-ci-status.coffee