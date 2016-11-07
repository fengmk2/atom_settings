(function() {
  var Up2dateView, getLatestRelease, releasesCache, semver;

  Up2dateView = require('./up2date-view');

  semver = require('semver');

  releasesCache = getLatestRelease = function(releaseList) {
    return releaseList.sort(function(a, b) {
      return semver.rcompare(a.tag_name, b.tag_name);
    })[0];
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
