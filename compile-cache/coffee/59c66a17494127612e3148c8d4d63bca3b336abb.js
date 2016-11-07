(function() {
  var BuildStatusView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

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
      if (atom.config.get('travis-ci-status.useTravisCiPro')) {
        token = atom.config.get('travis-ci-status.personalAccessToken');
        return atom.travis.authenticate({
          github_token: token
        }, updateRepo);
      } else {
        return updateRepo();
      }
    };

    BuildStatusView.prototype.repoStatus = function(err, data) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFFSixzQ0FBQSxDQUFBOzs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTywrQkFBUDtPQUFMLEVBQTZDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQzNDLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxZQUFBLE9BQUEsRUFBTyxnQ0FBUDtBQUFBLFlBQXlDLE1BQUEsRUFBUSxRQUFqRDtBQUFBLFlBQTJELFFBQUEsRUFBVSxDQUFBLENBQXJFO1dBQU4sRUFBK0UsRUFBL0UsRUFEMkM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QyxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDhCQVFBLFVBQUEsR0FBWSxTQUFFLEdBQUYsRUFBUSxNQUFSLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxNQUFBLEdBQ1osQ0FBQTtBQUFBLE1BRGlCLElBQUMsQ0FBQSxTQUFBLE1BQ2xCLENBQUE7QUFBQSxNQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIseUJBQTNCLEVBQXNELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3BELEtBQUMsQ0FBQSxNQUFELENBQUEsRUFEb0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RCxDQUFBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxNQUFELENB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
//# sourceURL=/Users/mk2/.atom/packages/travis-ci-status/lib/build-status-view.coffee