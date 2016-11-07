(function() {
  var BuildMatrixView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

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
      return atom.commands.add('atom-workspace', 'travis-ci-status:toggle-build-matrix', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
    };

    BuildMatrixView.prototype.serialize = function() {};

    BuildMatrixView.prototype.attach = function() {
      return atom.workspace.addBottomPanel({
        item: this
      });
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsc0JBQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFFQSxPQUFBLENBQVEsY0FBUixDQUZBLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUVNO0FBRUosc0NBQUEsQ0FBQTs7Ozs7OztLQUFBOztBQUFBLElBQUEsZUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8scUVBQVA7QUFBQSxRQUE4RSxRQUFBLEVBQVUsQ0FBQSxDQUF4RjtPQUFMLEVBQWlHLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQy9GLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxvQkFBUDtXQUFMLEVBQWtDLFNBQUEsR0FBQTttQkFDaEMsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFPLFNBQVA7QUFBQSxjQUFrQixNQUFBLEVBQVEsUUFBMUI7YUFBTCxFQUF5QyxTQUFBLEdBQUE7QUFDdkMsY0FBQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsZ0JBQUEsT0FBQSxFQUFPLGNBQVA7QUFBQSxnQkFBdUIsTUFBQSxFQUFRLE9BQS9CO2VBQUgsRUFBMkMseUJBQTNDLENBQUEsQ0FBQTtxQkFDQSxLQUFDLENBQUEsRUFBRCxDQUFJO0FBQUEsZ0JBQUEsT0FBQSxFQUFPLFFBQVA7QUFBQSxnQkFBaUIsTUFBQSxFQUFRLFFBQXpCO2VBQUosRUFGdUM7WUFBQSxDQUF6QyxFQURnQztVQUFBLENBQWxDLEVBRCtGO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEs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
//# sourceURL=/Users/mk2/.atom/packages/travis-ci-status/lib/build-matrix-view.coffee