(function() {
  var FocusedContactsStore, GithubUserStore, Reflux, _, request;

  _ = require('underscore-plus');

  Reflux = require('reflux');

  request = require('request');

  FocusedContactsStore = require('nylas-exports').FocusedContactsStore;

  module.exports = GithubUserStore = Reflux.createStore({
    init: function() {
      this._profile = null;
      this._cache = {};
      this._loading = false;
      this._error = null;
      return this.listenTo(FocusedContactsStore, this._onFocusedContactChanged);
    },
    profileForFocusedContact: function() {
      return this._profile;
    },
    loading: function() {
      return this._loading;
    },
    error: function() {
      return this._error;
    },
    _onFocusedContactChanged: function() {
      var contact;
      contact = FocusedContactsStore.focusedContact();
      this._error = null;
      this._profile = null;
      if (contact) {
        this._profile = this._cache[contact.email];
        if (this._profile == null) {
          this._githubFetchProfile(contact.email);
        }
      }
      return this.trigger(this);
    },
    _githubFetchProfile: function(email) {
      this._loading = true;
      return this._githubRequest("https://api.github.com/search/users?q=" + email, (function(_this) {
        return function(err, resp, data) {
          var profile, ref, ref1;
          if (err || !data) {
            return;
          }
          if (data.message != null) {
            console.warn(data.message);
          }
          profile = (ref = data != null ? (ref1 = data.items) != null ? ref1[0] : void 0 : void 0) != null ? ref : false;
          if (profile) {
            profile.repos = [];
            _this._githubRequest(profile.repos_url, function(err, resp, repos) {
              profile.repos = _.sortBy(repos, function(repo) {
                return -repo.stargazers_count;
              });
              return _this.trigger(_this);
            });
          }
          _this._loading = false;
          _this._profile = _this._cache[email] = profile;
          return _this.trigger(_this);
        };
      })(this));
    },
    _githubRequest: function(url, callback) {
      return request({
        url: url,
        headers: {
          'User-Agent': 'request'
        },
        json: true
      }, callback);
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVCx1QkFBd0IsT0FBQSxDQUFRLGVBQVIsRUFBeEI7O0VBRUQsTUFBTSxDQUFDLE9BQVAsR0FNQSxlQUFBLEdBQWtCLE1BQU0sQ0FBQyxXQUFQLENBRWhCO0lBQUEsSUFBQSxFQUFNLFNBQUE7TUFDSixJQUFDLENBQUEsUUFBRCxHQUFZO01BQ1osSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsTUFBRCxHQUFVO2FBSVYsSUFBQyxDQUFBLFFBQUQsQ0FBVSxvQkFBVixFQUFnQyxJQUFDLENBQUEsd0JBQWpDO0lBUkksQ0FBTjtJQVlBLHdCQUFBLEVBQTBCLFNBQUE7YUFDeEIsSUFBQyxDQUFBO0lBRHVCLENBWjFCO0lBZUEsT0FBQSxFQUFTLFNBQUE7YUFDUCxJQUFDLENBQUE7SUFETSxDQWZUO0lBa0JBLEtBQUEsRUFBTyxTQUFBO2FBQ0wsSUFBQyxDQUFBO0lBREksQ0FsQlA7SUF1QkEsd0JBQUEsRUFBMEIsU0FBQTtBQUV4QixVQUFBO01BQUEsT0FBQSxHQUFVLG9CQUFvQixDQUFDLGNBQXJCLENBQUE7TUFLVixJQUFDLENBQUEsTUFBRCxHQUFVO01BQ1YsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUVaLElBQUcsT0FBSDtRQUNFLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLE1BQU8sQ0FBQSxPQUFPLENBQUMsS0FBUjtRQUVwQixJQUEyQyxxQkFBM0M7VUFBQSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsT0FBTyxDQUFDLEtBQTdCLEVBQUE7U0FIRjs7YUFLQSxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQ7SUFmd0IsQ0F2QjFCO0lBd0NBLG1CQUFBLEVBQXFCLFNBQUMsS0FBRDtNQUNuQixJQUFDLENBQUEsUUFBRCxHQUFZO2FBQ1osSUFBQyxDQUFBLGNBQUQsQ0FBZ0Isd0NBQUEsR0FBeUMsS0FBekQsRUFBa0UsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksSUFBWjtBQUNoRSxjQUFBO1VBQUEsSUFBVSxHQUFBLElBQU8sQ0FBSSxJQUFyQjtBQUFBLG1CQUFBOztVQUVBLElBQThCLG9CQUE5QjtZQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBSSxDQUFDLE9BQWxCLEVBQUE7O1VBSUEsT0FBQSxrR0FBNEI7VUFJNUIsSUFBRyxPQUFIO1lBQ0UsT0FBTyxDQUFDLEtBQVIsR0FBZ0I7WUFDaEIsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsT0FBTyxDQUFDLFNBQXhCLEVBQW1DLFNBQUMsR0FBRCxFQUFNLElBQU4sRUFBWSxLQUFaO2NBRWpDLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLENBQUMsQ0FBQyxNQUFGLENBQVMsS0FBVCxFQUFnQixTQUFDLElBQUQ7dUJBQVUsQ0FBQyxJQUFJLENBQUM7Y0FBaEIsQ0FBaEI7cUJBR2hCLEtBQUMsQ0FBQSxPQUFELENBQVMsS0FBVDtZQUxpQyxDQUFuQyxFQUZGOztVQVNBLEtBQUMsQ0FBQSxRQUFELEdBQVk7VUFDWixLQUFDLENBQUEsUUFBRCxHQUFZLEtBQUMsQ0FBQSxNQUFPLENBQUEsS0FBQSxDQUFSLEdBQWlCO2lCQUM3QixLQUFDLENBQUEsT0FBRCxDQUFTLEtBQVQ7UUF0QmdFO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsRTtJQUZtQixDQXhDckI7SUFxRUMsY0FBQSxFQUFnQixTQUFDLEdBQUQsRUFBTSxRQUFOO2FBQ2IsT0FBQSxDQUFRO1FBQUMsR0FBQSxFQUFLLEdBQU47UUFBVyxPQUFBLEVBQVM7VUFBQyxZQUFBLEVBQWMsU0FBZjtTQUFwQjtRQUErQyxJQUFBLEVBQU0sSUFBckQ7T0FBUixFQUFvRSxRQUFwRTtJQURhLENBckVqQjtHQUZnQjtBQVhsQiIKfQ==
//# sourceURL=/Users/mk2/.nylas/packages/N1-Github-Contact-Card-Section/lib/github-user-store.coffee