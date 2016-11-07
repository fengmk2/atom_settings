(function() {
  var BuildMatrixView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  require('./extensions');

  module.exports = BuildMatrixView = (function(_super) {
    __extends(BuildMatrixView, _super);

    function BuildMatrixView() {
      this.addBuild = __bind(this.addBuild, this);
      this.buildMatrix = __bind(this.buildMatrix, this);
      this.update = __bind(this.update, this);
      return BuildMatrixView.__super__.constructor.apply(this, arguments);
    }

    BuildMatrixView.content = function() {
      return this.div({
        "class": 'travis-ci-status tool-panel panel-bottom padded native-key-bindings',
        tabIndex: -1
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'build-matrix block'
          }, function() {
            return _this.div({
              "class": 'message',
              outlet: 'matrix'
            }, function() {
              _this.p({
                "class": 'matrix-title',
                outlet: 'title'
              }, 'No build matrix fetched');
              return _this.ul({
                "class": 'builds',
                outlet: 'builds'
              });
            });
          });
        };
      })(this));
    };

    BuildMatrixView.prototype.initialize = function(nwo) {
      this.nwo = nwo;
      this.matrix.css('font-size', "" + (atom.config.get('editor.fontSize')) + "px");
      return atom.workspaceView.command('travis-ci-status:toggle-build-matrix', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
    };

    BuildMatrixView.prototype.serialize = function() {};

    BuildMatrixView.prototype.attach = function() {
      return atom.workspaceView.prependToBottom(this);
    };

    BuildMatrixView.prototype.destroy = function() {
      return this.detach();
    };

    BuildMatrixView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        return this.attach();
      }
    };

    BuildMatrixView.prototype.update = function(buildId) {
      var details;
      this.title.text('Fetching build matrix...');
      details = this.nwo.split('/');
      return atom.travis.repos(details[0], details[1]).builds(buildId).get(this.buildMatrix);
    };

    BuildMatrixView.prototype.buildMatrix = function(err, data) {
      var build, duration, number, _i, _len, _ref, _results;
      this.matrix.removeClass('pending success fail');
      if (err != null) {
        return console.log("Error:", err);
      }
      number = data['build']['number'];
      if (data['build']['duration']) {
        duration = data['build']['duration'].toString();
        this.title.text("Build " + number + " took " + (duration.formattedDuration()));
        this.builds.empty();
        _ref = data['jobs'];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          build = _ref[_i];
          _results.push(this.addBuild(build));
        }
        return _results;
      }
    };

    BuildMatrixView.prototype.addBuild = function(build) {
      var duration, finished, started, status;
      status = build['state'] === 'passed' ? 'success' : 'fail';
      started = new Date(build['started_at']);
      finished = new Date(build['finished_at']);
      duration = ((finished - started) / 1000).toString();
      return this.builds.append("<li class='" + status + "'>\n  " + build['number'] + " - " + (duration.formattedDuration()) + " >>> <a target=\"_new\" href=\"https://travis-ci.org/" + this.nwo + "/builds/" + build['build_id'] + "\">Full Report...</a>\n</li>");
    };

    return BuildMatrixView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUVBLE9BQUEsQ0FBUSxjQUFSLENBRkEsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFFSixzQ0FBQSxDQUFBOzs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxxRUFBUDtBQUFBLFFBQThFLFFBQUEsRUFBVSxDQUFBLENBQXhGO09BQUwsRUFBaUcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDL0YsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLG9CQUFQO1dBQUwsRUFBa0MsU0FBQSxHQUFBO21CQUNoQyxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU8sU0FBUDtBQUFBLGNBQWtCLE1BQUEsRUFBUSxRQUExQjthQUFMLEVBQXlDLFNBQUEsR0FBQTtBQUN2QyxjQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxnQkFBQSxPQUFBLEVBQU8sY0FBUDtBQUFBLGdCQUF1QixNQUFBLEVBQVEsT0FBL0I7ZUFBSCxFQUEyQyx5QkFBM0MsQ0FBQSxDQUFBO3FCQUNBLEtBQUMsQ0FBQSxFQUFELENBQUk7QUFBQSxnQkFBQSxPQUFBLEVBQU8sUUFBUDtBQUFBLGdCQUFpQixNQUFBLEVBQVEsUUFBekI7ZUFBSixFQUZ1QztZQUFBLENBQXpDLEVBRGdDO1VBQUEsQ0FBbEMsRUFEK0Y7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxD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
//# sourceURL=/Users/mk2/.atom/packages/travis-ci-status/lib/build-matrix-view.coffee