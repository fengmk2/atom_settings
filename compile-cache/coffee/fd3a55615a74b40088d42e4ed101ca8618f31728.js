(function() {
  var Up2dateView;

  module.exports = Up2dateView = (function() {
    function Up2dateView(serializeState) {
      var message, self;
      self = this;
      this.element = document.createElement('div');
      this.element.classList.add('up2date', 'overlay', 'from-top');
      message = document.createElement('div');
      message.innerHTML = ['<h1>New Atom release available</h1>', '<dl><dt>current atom version: v' + atom.getLoadSettings().appVersion + '</dt>', '<dt>latest atom version: <span id="up2date_latest_tag">...</span></dt>', '<dd id="up2date_latest_desc"></dd>', '</dl><div class="actions"><a class="cancel">cancel</a> <a href="https://github.com/atom/atom/releases" class="ok">go to download page</a></div>'].join('');
      message.classList.add('message');
      this.element.appendChild(message);
      this.element.querySelector('.actions .cancel').addEventListener('click', function() {
        return self.toggle();
      });
      this.element.querySelector('.actions .ok').addEventListener('click', function() {
        return self.asyncToggle();
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

    Up2dateView.prototype.asyncToggle = function() {
      return setTimeout(this.toggle.bind(this), 10);
    };

    Up2dateView.prototype.toggle = function() {
      if (this.element.parentElement != null) {
        return this.element.remove();
      } else {
        return atom.workspace.addTopPanel({
          item: this.element
        });
      }
    };

    return Up2dateView;

  })();

}).call(this);
