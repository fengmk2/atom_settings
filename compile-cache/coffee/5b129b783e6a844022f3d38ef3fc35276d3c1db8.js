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
      this.title.text('Fetching build matrix...');
      return atom.travis.builds({
        id: buildId
      }, this.buildMatrix);
    };

    BuildMatrixView.prototype.buildMatrix = function(err, data) {
      var build, duration, number, _i, _len, _ref, _results;
      this.matrix.removeClass('pending success fail');
      if (err != null) {
        return console.log("Error:", err);
      }
      number = data['build']['number'];
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
    };

    BuildMatrixView.prototype.addBuild = function(build) {
      var duration, finished, started, status;
      status = build['state'] === 'passed' ? 'success' : 'fail';
      started = new Date(build['started_at']);
      finished = new Date(build['finished_at']);
      duration = ((finished - started) / 1000).toString();
      return this.builds.append("<li class='" + status + "'>\n  " + build['number'] + " - " + (duration.formattedDuration()) + "\n</li>");
    };

    return BuildMatrixView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUVBLE9BQUEsQ0FBUSxjQUFSLENBRkEsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFFSixzQ0FBQSxDQUFBOzs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxxRUFBUDtBQUFBLFFBQThFLFFBQUEsRUFBVSxDQUFBLENBQXhGO09BQUwsRUFBaUcsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDL0YsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLG9CQUFQO1dBQUwsRUFBa0MsU0FBQSxHQUFBO21CQUNoQyxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU8sU0FBUDtBQUFBLGNBQWtCLE1BQUEsRUFBUSxRQUExQjthQUFMLEVBQXlDLFNBQUEsR0FBQTtBQUN2QyxjQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxnQkFBQSxPQUFBLEVBQU8sY0FBUDtBQUFBLGdCQUF1QixNQUFBLEVBQVEsT0FBL0I7ZUFBSCxFQUEyQyx5QkFBM0MsQ0FBQSxDQUFBO3FCQUNBLEtBQUMsQ0FBQSxFQUFELENBQUk7QUFBQSxnQkFBQSxPQUFBLEVBQU8sUUFBUDtBQUFBLGdCQUFpQixNQUFBLEVBQVEsUUFBekI7ZUFBSixFQUZ1QztZQUFBLENBQXpDLEVBRGdDO1VBQUEsQ0FBbEMsRUFEK0Y7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxD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
//# sourceURL=/Users/mk2/.atom/packages/travis-ci-status/lib/build-matrix-view.coffee