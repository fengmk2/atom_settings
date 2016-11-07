(function() {
  var Up2dateView;

  module.exports = Up2dateView = (function() {
    function Up2dateView(serializeState) {
      var message, self;
      self = this;
      this.element = document.createElement('div');
      this.element.classList.add('up2date', 'overlay', 'from-top');
      message = document.createElement('div');
      message.innerHTML = ['<h1>New Atom release available</h1>', '<dl><dt>current atom version: v' + atom.getLoadSettings().appVersion + '</dt>', '<dt>latest atom version: <span id="up2date_latest_tag">...</span></dt>', '<dd id="up2date_latest_desc"></dd>', '</dl><div class="actions"><a class="cancel">cancel</a> <a href="https://github.com/atom/atom/releases">go to download page</a></div>'].join('');
      message.classList.add('message');
      this.element.appendChild(message);
      this.element.querySelector('.cancel').addEventListener('click', function() {
        return self.toggle();
      });
    }

    Up2dateView.prototype.setLatestRelease = function(release) {
      this.element.querySelector('#up2date_latest_tag').innerHTML = release.tag_name;
      return this.element.querySelector('#up2date_latest_desc').innerHTML = release.body.replace(/\n/g, '<br />');
    };

    Up2dateView.prototype.serialize = function() {
      return {
        visible: !!this.element.parentElement
      };
    };

    Up2dateView.prototype.destroy = function() {
      return this.element.remove();
    };

    Up2dateView.prototype.toggle = function() {
      if (this.element.parentElement != null) {
        return this.element.remove();
      } else {
        return atom.workspaceView.append(this.element);
      }
    };

    return Up2dateView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFdBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxxQkFBQyxjQUFELEdBQUE7QUFDWCxVQUFBLGFBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FGWCxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixTQUF2QixFQUFtQyxTQUFuQyxFQUE4QyxVQUE5QyxDQUhBLENBQUE7QUFBQSxNQU1BLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQU5WLENBQUE7QUFBQSxNQU9BLE9BQU8sQ0FBQyxTQUFSLEdBQW9CLENBQ2hCLHFDQURnQixFQUVkLGlDQUFBLEdBQW9DLElBQUksQ0FBQyxlQUFMLENBQUEsQ0FBc0IsQ0FBQyxVQUEzRCxHQUF3RSxPQUYxRCxFQUdkLHdFQUhjLEVBSWQsb0NBSmMsRUFLZCxzSUFMYyxDQU1uQixDQUFDLElBTmtCLENBTWIsRUFOYSxDQVBwQixDQUFBO0FBQUEsTUFlQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQWxCLENBQXNCLFNBQXRCLENBZkEsQ0FBQTtBQUFBLE1BZ0JBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixPQUFyQixDQWhCQSxDQUFBO0FBQUEsTUFpQkEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQXVCLFNBQXZCLENBQWlDLENBQUMsZ0JBQWxDLENBQW1ELE9BQW5ELEVBQTRELFNBQUEsR0FBQTtlQUN4RCxJQUFJLENBQUMsTUFBTCxDQUFBLEVBRHdEO01BQUEsQ0FBNUQsQ0FqQkEsQ0FEVztJQUFBLENBQWI7O0FBQUEsMEJBc0JBLGdCQUFBLEdBQWtCLFNBQUMsT0FBRCxHQUFBO0FBQ2hCLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQXVCLHFCQUF2QixDQUE2QyxDQUFDLFNBQTlDLEdBQTBELE9BQU8sQ0FBQyxRQUFsRSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQXVCLHNCQUF2QixDQUE4QyxDQUFDLFNBQS9DLEdBQTJELE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBYixDQUFxQixLQUFyQixFQUE0QixRQUE1QixFQUYzQztJQUFBLENBdEJsQixDQUFBOztBQUFBLDBCQTJCQSxTQUFBLEdBQVcsU0FBQSxHQUFBO2FBQ1A7QUFBQSxRQUFBLE9BQUEsRUFBUyxDQUFBLENBQUMsSUFBRSxDQUFBLE9BQU8sQ0FBQyxhQUFwQjtRQURPO0lBQUEsQ0EzQlgsQ0FBQTs7QUFBQSwwQkErQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBLEVBRE87SUFBQSxDQS9CVCxDQUFBOztBQUFBLDBCQW1DQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFHLGtDQUFIO2VBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQW5CLENBQTBCLElBQUMsQ0FBQSxPQUEzQixFQUhGO09BRE07SUFBQSxDQW5DUixDQUFBOzt1QkFBQTs7TUFGRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/mk2/.atom/packages/up2date/lib/up2date-view.coffee