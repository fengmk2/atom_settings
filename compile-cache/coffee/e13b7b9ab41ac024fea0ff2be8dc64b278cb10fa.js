(function() {
  var BuildStatusView, TravisCi, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  TravisCi = require('travis-ci');

  module.exports = BuildStatusView = (function(_super) {
    __extends(BuildStatusView, _super);

    function BuildStatusView() {
      this.repoStatus = __bind(this.repoStatus, this);
      this.update = __bind(this.update, this);
      this.subscribeToRepo = __bind(this.subscribeToRepo, this);
      return BuildStatusView.__super__.constructor.apply(this, arguments);
    }

    BuildStatusView.content = function() {
      return this.div({
        "class": 'travis-ci-status inline-block'
      }, (function(_this) {
        return function() {
          return _this.span({
            "class": 'build-status icon icon-history',
            outlet: 'status',
            tabindex: -1
          }, '');
        };
      })(this));
    };

    BuildStatusView.prototype.initialize = function(nwo, matrix) {
      this.nwo = nwo;
      this.matrix = matrix;
      atom.workspaceView.command('travis-ci-status:toggle', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      this.attach();
      return this.subscribeToRepo();
    };

    BuildStatusView.prototype.serialize = function() {};

    BuildStatusView.prototype.attach = function() {
      return atom.workspaceView.statusBar.appendLeft(this);
    };

    BuildStatusView.prototype.destroy = function() {
      return this.detach();
    };

    BuildStatusView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        return this.attach();
      }
    };

    BuildStatusView.prototype.getActiveItemPath = function() {
      var _ref;
      return (_ref = this.getActiveItem()) != null ? typeof _ref.getPath === "function" ? _ref.getPath() : void 0 : void 0;
    };

    BuildStatusView.prototype.getActiveItem = function() {
      return atom.workspaceView.getActivePaneItem();
    };

    BuildStatusView.prototype.subscribeToRepo = function() {
      var repo;
      if (this.repo != null) {
        this.unsubscribe(this.repo);
      }
      if (repo = atom.project.getRepo()) {
        this.repo = repo;
        this.subscribe(repo, 'status-changed', (function(_this) {
          return function(path, status) {
            if (path === _this.getActiveItemPath()) {
              return _this.update();
            }
          };
        })(this));
        return this.subscribe(repo, 'statuses-changed', this.update);
      }
    };

    BuildStatusView.prototype.update = function() {
      var details, token, updateRepo;
      if (!this.hasParent()) {
        return;
      }
      this.status.addClass('pending');
      details = this.nwo.split('/');
      updateRepo = (function(_this) {
        return function() {
          return atom.travis.repos({
            owner_name: details[0],
            name: details[1]
          }, _this.repoStatus);
        };
      })(this);
      if (atom.travis.pro) {
        token = atom.config.get('travis-ci-status.personalAccessToken');
        return atom.travis.authenticate({
          github_token: token
        }, updateRepo);
      } else {
        return updateRepo();
      }
    };

    BuildStatusView.prototype.fallback = function() {
      atom.travis = new TravisCi({
        version: '2.0.0',
        pro: false
      });
      return this.update();
    };

    BuildStatusView.prototype.repoStatus = function(err, data) {
      if (atom.travis.pro && (err != null)) {
        return this.fallback();
      }
      if (err != null) {
        return console.log("Error:", err);
      }
      if (data['files'] === 'not found') {
        return;
      }
      data = data['repo'];
      this.status.removeClass('pending success fail');
      if (data && data['last_build_state'] === "passed") {
        this.matrix.update(data['last_build_id']);
        return this.status.addClass('success');
      } else {
        return this.status.addClass('fail');
      }
    };

    return BuildStatusView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsV0FBUixDQUZYLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUVNO0FBRUosc0NBQUEsQ0FBQTs7Ozs7OztLQUFBOztBQUFBLElBQUEsZUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sK0JBQVA7T0FBTCxFQUE2QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUMzQyxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsWUFBQSxPQUFBLEVBQU8sZ0NBQVA7QUFBQSxZQUF5QyxNQUFBLEVBQVEsUUFBakQ7QUFBQSxZQUEyRCxRQUFBLEVBQVUsQ0FBQSxDQUFyRTtXQUFOLEVBQStFLEVBQS9FLEVBRDJDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0MsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSw4QkFRQSxVQUFBLEdBQVksU0FBRSxHQUFGLEVBQVEsTUFBUixHQUFBO0FBQ1YsTUFEVyxJQUFDLENBQUEsTUFBQSxHQUNaLENBQUE7QUFBQSxNQURpQixJQUFDLENBQUEsU0FBQSxNQUNsQixDQUFBO0FBQUEsTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHlCQUEzQixFQUFzRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNwRCxLQUFDLENBQUEsTUFBRCxDQUFBLEVBRG9EO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElB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
//# sourceURL=/Users/mk2/.atom/packages/travis-ci-status/lib/build-status-view.coffee