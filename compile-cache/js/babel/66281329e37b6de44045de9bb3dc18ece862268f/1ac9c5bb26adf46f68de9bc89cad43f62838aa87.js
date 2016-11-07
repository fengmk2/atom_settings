'use babel';
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var View = (function () {
  function View(name, dependencies) {
    _classCallCheck(this, View);

    this.name = name;
    this.dependencies = dependencies;

    var progress = this.progress = document.createElement('progress');
    progress.max = dependencies.length;
    progress.value = 0;
    progress.classList.add('display-inline');
    progress.style.width = '100%';

    this.notification = this.element = null;
  }

  _createClass(View, [{
    key: 'show',
    value: function show() {
      var _this = this;

      this.notification = atom.notifications.addInfo('Installing ' + this.name + ' dependencies', {
        detail: 'Installing ' + this.dependencies.join(', '),
        dismissable: true
      });
      this.element = document.createElement('div'); // placeholder
      setTimeout(function () {
        try {
          _this.element = atom.views.getView(_this.notification);

          var content = _this.element.querySelector('.detail-content');
          if (content) {
            content.appendChild(_this.progress);
          }
        } catch (_) {}
      }, 20);
    }
  }, {
    key: 'advance',
    value: function advance() {
      this.progress.value++;
      if (this.progress.value === this.progress.max) {
        var content = this.element.querySelector('.detail-content');
        var title = this.element.querySelector('.message p');

        if (content) {
          content.textContent = 'Installed ' + this.dependencies.join(', ');
        }
        if (title) {
          title.textContent = 'Installed ' + this.name + ' dependencies';
        }

        this.element.classList.remove('info');
        this.element.classList.remove('icon-info');
        this.element.classList.add('success');
        this.element.classList.add('icon-check');
      }
    }
  }]);

  return View;
})();

exports.View = View;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvbGludGVyLWpzLXlhbWwvbm9kZV9tb2R1bGVzL2F0b20tcGFja2FnZS1kZXBzL2xpYi92aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7O0lBQ0UsSUFBSTtBQUNKLFdBREEsSUFBSSxDQUNILElBQUksRUFBRSxZQUFZLEVBQUU7MEJBRHJCLElBQUk7O0FBRWIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsUUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUE7O0FBRWhDLFFBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUNuRSxZQUFRLENBQUMsR0FBRyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUE7QUFDbEMsWUFBUSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUE7QUFDbEIsWUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtBQUN4QyxZQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUE7O0FBRTdCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7R0FDeEM7O2VBWlUsSUFBSTs7V0FhWCxnQkFBRzs7O0FBQ0wsVUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8saUJBQWUsSUFBSSxDQUFDLElBQUksb0JBQWlCO0FBQ3JGLGNBQU0sa0JBQWdCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxBQUFFO0FBQ3BELG1CQUFXLEVBQUUsSUFBSTtPQUNsQixDQUFDLENBQUE7QUFDRixVQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDNUMsZ0JBQVUsQ0FBQyxZQUFNO0FBQ2YsWUFBSTtBQUNGLGdCQUFLLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFLLFlBQVksQ0FBQyxDQUFBOztBQUVwRCxjQUFNLE9BQU8sR0FBRyxNQUFLLE9BQU8sQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtBQUM3RCxjQUFJLE9BQU8sRUFBRTtBQUNYLG1CQUFPLENBQUMsV0FBVyxDQUFDLE1BQUssUUFBUSxDQUFDLENBQUE7V0FDbkM7U0FDRixDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUc7T0FDaEIsRUFBRSxFQUFFLENBQUMsQ0FBQTtLQUNQOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDckIsVUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtBQUM3QyxZQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQzdELFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFBOztBQUV0RCxZQUFJLE9BQU8sRUFBRTtBQUNYLGlCQUFPLENBQUMsV0FBVyxrQkFBZ0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEFBQUUsQ0FBQTtTQUNsRTtBQUNELFlBQUksS0FBSyxFQUFFO0FBQ1QsZUFBSyxDQUFDLFdBQVcsa0JBQWdCLElBQUksQ0FBQyxJQUFJLGtCQUFlLENBQUE7U0FDMUQ7O0FBRUQsWUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3JDLFlBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUMxQyxZQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDckMsWUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO09BQ3pDO0tBQ0Y7OztTQWhEVSxJQUFJIiwiZmlsZSI6Ii9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvbGludGVyLWpzLXlhbWwvbm9kZV9tb2R1bGVzL2F0b20tcGFja2FnZS1kZXBzL2xpYi92aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcclxuZXhwb3J0IGNsYXNzIFZpZXcge1xyXG4gIGNvbnN0cnVjdG9yKG5hbWUsIGRlcGVuZGVuY2llcykge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXNcclxuXHJcbiAgICBjb25zdCBwcm9ncmVzcyA9IHRoaXMucHJvZ3Jlc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcm9ncmVzcycpXHJcbiAgICBwcm9ncmVzcy5tYXggPSBkZXBlbmRlbmNpZXMubGVuZ3RoXHJcbiAgICBwcm9ncmVzcy52YWx1ZSA9IDBcclxuICAgIHByb2dyZXNzLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXktaW5saW5lJylcclxuICAgIHByb2dyZXNzLnN0eWxlLndpZHRoID0gJzEwMCUnXHJcblxyXG4gICAgdGhpcy5ub3RpZmljYXRpb24gPSB0aGlzLmVsZW1lbnQgPSBudWxsXHJcbiAgfVxyXG4gIHNob3coKSB7XHJcbiAgICB0aGlzLm5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKGBJbnN0YWxsaW5nICR7dGhpcy5uYW1lfSBkZXBlbmRlbmNpZXNgLCB7XHJcbiAgICAgIGRldGFpbDogYEluc3RhbGxpbmcgJHt0aGlzLmRlcGVuZGVuY2llcy5qb2luKCcsICcpfWAsXHJcbiAgICAgIGRpc21pc3NhYmxlOiB0cnVlXHJcbiAgICB9KVxyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykgLy8gcGxhY2Vob2xkZXJcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLm5vdGlmaWNhdGlvbilcclxuXHJcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZGV0YWlsLWNvbnRlbnQnKVxyXG4gICAgICAgIGlmIChjb250ZW50KSB7XHJcbiAgICAgICAgICBjb250ZW50LmFwcGVuZENoaWxkKHRoaXMucHJvZ3Jlc3MpXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChfKSB7IH1cclxuICAgIH0sIDIwKVxyXG4gIH1cclxuICBhZHZhbmNlKCkge1xyXG4gICAgdGhpcy5wcm9ncmVzcy52YWx1ZSsrXHJcbiAgICBpZiAodGhpcy5wcm9ncmVzcy52YWx1ZSA9PT0gdGhpcy5wcm9ncmVzcy5tYXgpIHtcclxuICAgICAgY29uc3QgY29udGVudCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZGV0YWlsLWNvbnRlbnQnKVxyXG4gICAgICBjb25zdCB0aXRsZSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcubWVzc2FnZSBwJylcclxuXHJcbiAgICAgIGlmIChjb250ZW50KSB7XHJcbiAgICAgICAgY29udGVudC50ZXh0Q29udGVudCA9IGBJbnN0YWxsZWQgJHt0aGlzLmRlcGVuZGVuY2llcy5qb2luKCcsICcpfWBcclxuICAgICAgfVxyXG4gICAgICBpZiAodGl0bGUpIHtcclxuICAgICAgICB0aXRsZS50ZXh0Q29udGVudCA9IGBJbnN0YWxsZWQgJHt0aGlzLm5hbWV9IGRlcGVuZGVuY2llc2BcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2luZm8nKVxyXG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaWNvbi1pbmZvJylcclxuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3N1Y2Nlc3MnKVxyXG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaWNvbi1jaGVjaycpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==
//# sourceURL=/Users/mk2/.atom/packages/linter-js-yaml/node_modules/atom-package-deps/lib/view.js
