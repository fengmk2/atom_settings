(function() {
  var $, BuildStatusView, TravisCi, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $ = _ref.$, View = _ref.View;

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
      atom.commands.add('atom-workspace', 'travis-ci-status:toggle', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      this.on('click', (function(_this) {
        return function() {
          return _this.matrix.toggle();
        };
      })(this));
      this.attach();
      return this.subscribeToRepo();
    };

    BuildStatusView.prototype.serialize = function() {};

    BuildStatusView.prototype.attach = function() {
      var statusBar;
      statusBar = document.querySelector("status-bar");
      if (statusBar != null) {
        return this.statusBarTile = statusBar.addLeftTile({
          item: this,
          priority: 100
        });
      }
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
      var _ref1;
      return (_ref1 = this.getActiveItem()) != null ? typeof _ref1.getPath === "function" ? _ref1.getPath() : void 0 : void 0;
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
        $(repo).on('status-changed', (function(_this) {
          return function(path, status) {
            if (path === _this.getActiveItemPath()) {
              return _this.update();
            }
          };
        })(this));
        $(repo).on('statuses-changed', this.update);
        return this.update();
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
          return atom.travis.repos(details[0], details[1]).get(_this.repoStatus);
        };
      })(this);
      if ((typeof atom.travis !== 'undefined') && (atom.travis === null) && atom.travis.pro) {
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
      if ((typeof atom.travis === 'undefined') || (atom.travis === null) || (atom.travis.pro && (err != null))) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUEsQ0FBRCxFQUFJLFlBQUEsSUFBSixDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxXQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFFSixzQ0FBQSxDQUFBOzs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTywrQkFBUDtPQUFMLEVBQTZDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQzNDLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxZQUFBLE9BQUEsRUFBTyxnQ0FBUDtBQUFBLFlBQXlDLE1BQUEsRUFBUSxRQUFqRDtBQUFBLFlBQTJELFFBQUEsRUFBVSxDQUFBLENBQXJFO1dBQU4sRUFBK0UsRUFBL0UsRUFEMkM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QyxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDhCQVFBLFVBQUEsR0FBWSxTQUFFLEdBQUYsRUFBUSxNQUFSLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxNQUFBLEdBQ1osQ0FBQTtBQUFBLE1BRGlCLElBQUMsQ0FBQSxTQUFBLE1BQ2xCLENBQUE7QUFBQSxNQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MseUJBQXBDLEVBQStELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQSxF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
//# sourceURL=/Users/mk2/.atom/packages/travis-ci-status/lib/build-status-view.coffee