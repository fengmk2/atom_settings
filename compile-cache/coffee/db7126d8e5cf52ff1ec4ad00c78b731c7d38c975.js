(function() {
  var Up2dateView, getLatestRelease, releasesCache, semver;

  Up2dateView = require('./up2date-view');

  semver = require('semver');

  releasesCache = getLatestRelease = function(releaseList) {
    return releaseList.sort(semver.rcompare)[0];
  };

  module.exports = {
    up2dateView: null,
    activate: function(state) {
      var view;
      view = this.up2dateView = new Up2dateView(state.up2dateViewState);
      return new Promise(function(resolve, reject) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.github.com/repos/atom/atom/releases', true);
        xhr.onload = function() {
          return resolve(releasesCache = JSON.parse(xhr.response));
        };
        xhr.onerror = reject;
        return xhr.send();
      }).then(getLatestRelease).then(function(release) {
        return view.setLatestRelease(release);
      }).then(function() {
        if (releasesCache[0].tag_name > 'v' + atom.getLoadSettings().appVersion) {
          return view.toggle();
        }
      });
    },
    deactivate: function() {
      return this.up2dateView.destroy();
    },
    serialize: function() {
      return {
        up2dateViewState: this.up2dateView.serialize()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9EQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUFkLENBQUE7O0FBQUEsRUFDQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FEVCxDQUFBOztBQUFBLEVBRUEsYUFBQSxHQUNBLGdCQUFBLEdBQW1CLFNBQUMsV0FBRCxHQUFBO1dBQ2YsV0FBVyxDQUFDLElBQVosQ0FBaUIsTUFBTSxDQUFDLFFBQXhCLENBQWtDLENBQUEsQ0FBQSxFQURuQjtFQUFBLENBSG5CLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxXQUFBLEVBQWEsSUFBYjtBQUFBLElBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxXQUFBLENBQVksS0FBSyxDQUFDLGdCQUFsQixDQUExQixDQUFBO2FBQ0ksSUFBQSxPQUFBLENBQ0EsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ0ksWUFBQSxHQUFBO0FBQUEsUUFBQSxHQUFBLEdBQVUsSUFBQSxjQUFBLENBQUEsQ0FBVixDQUFBO0FBQUEsUUFDQSxHQUFHLENBQUMsSUFBSixDQUFTLEtBQVQsRUFBZ0IsaURBQWhCLEVBQW1FLElBQW5FLENBREEsQ0FBQTtBQUFBLFFBRUEsR0FBRyxDQUFDLE1BQUosR0FBYSxTQUFBLEdBQUE7aUJBQU0sT0FBQSxDQUFRLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFHLENBQUMsUUFBZixDQUF4QixFQUFOO1FBQUEsQ0FGYixDQUFBO0FBQUEsUUFHQSxHQUFHLENBQUMsT0FBSixHQUFjLE1BSGQsQ0FBQTtlQUlBLEdBQUcsQ0FBQyxJQUFKLENBQUEsRUFMSjtNQUFBLENBREEsQ0FRSixDQUFDLElBUkcsQ0FRRyxnQkFSSCxDQVNKLENBQUMsSUFURyxDQVNFLFNBQUMsT0FBRCxHQUFBO2VBQWEsSUFBSSxDQUFDLGdCQUFMLENBQXNCLE9BQXRCLEVBQWI7TUFBQSxDQVRGLENBVUosQ0FBQyxJQVZHLENBVUUsU0FBQSxHQUFBO0FBQ0YsUUFBQSxJQUFHLGFBQWMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUFqQixHQUE0QixHQUFBLEdBQU0sSUFBSSxDQUFDLGVBQUwsQ0FBQSxDQUFzQixDQUFDLFVBQTVEO2lCQUNJLElBQUksQ0FBQyxNQUFMLENBQUEsRUFESjtTQURFO01BQUEsQ0FWRixFQUZJO0lBQUEsQ0FGVjtBQUFBLElBbUJBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQSxFQURVO0lBQUEsQ0FuQlo7QUFBQSxJQXNCQSxTQUFBLEVBQVcsU0FBQSxHQUFBO2FBQ1Q7QUFBQSxRQUFBLGdCQUFBLEVBQWtCLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixDQUFBLENBQWxCO1FBRFM7SUFBQSxDQXRCWDtHQVBGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/mk2/.atom/packages/up2date/lib/up2date.coffee