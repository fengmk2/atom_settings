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
      this.subscribe(this, 'click', (function(_this) {
        return function() {
          return _this.matrix.toggle();
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
      return atom.workspace.getActivePaneItem();
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