Object.defineProperty(exports, '__esModule', {
  value: true
});

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _configSchema = require('./config-schema');

var _configSchema2 = _interopRequireDefault(_configSchema);

var _toggleQuotes = require('./toggle-quotes');

'use babel';

exports['default'] = {
  config: _configSchema2['default'],

  activate: function activate() {
    _this.subscription = atom.commands.add('atom-text-editor', 'toggle-quotes:toggle', function () {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        (0, _toggleQuotes.toggleQuotes)(editor);
      }
    });
  },

  deactivate: function deactivate() {
    _this.subscription.dispose();
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvdG9nZ2xlLXF1b3Rlcy9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs0QkFFeUIsaUJBQWlCOzs7OzRCQUNmLGlCQUFpQjs7QUFINUMsV0FBVyxDQUFBOztxQkFLSTtBQUNiLFFBQU0sMkJBQWM7O0FBRXBCLFVBQVEsRUFBRSxvQkFBTTtBQUNkLFVBQUssWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLHNCQUFzQixFQUFFLFlBQU07QUFDdEYsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO0FBQ2pELFVBQUksTUFBTSxFQUFFO0FBQ1Ysd0NBQWEsTUFBTSxDQUFDLENBQUE7T0FDckI7S0FDRixDQUFDLENBQUE7R0FDSDs7QUFFRCxZQUFVLEVBQUUsc0JBQU07QUFDaEIsVUFBSyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUE7R0FDNUI7Q0FDRiIsImZpbGUiOiIvVXNlcnMvbWsyLy5hdG9tL3BhY2thZ2VzL3RvZ2dsZS1xdW90ZXMvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgY29uZmlnU2NoZW1hIGZyb20gJy4vY29uZmlnLXNjaGVtYSdcbmltcG9ydCB7dG9nZ2xlUXVvdGVzfSBmcm9tICcuL3RvZ2dsZS1xdW90ZXMnXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY29uZmlnOiBjb25maWdTY2hlbWEsXG5cbiAgYWN0aXZhdGU6ICgpID0+IHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ3RvZ2dsZS1xdW90ZXM6dG9nZ2xlJywgKCkgPT4ge1xuICAgICAgbGV0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgaWYgKGVkaXRvcikge1xuICAgICAgICB0b2dnbGVRdW90ZXMoZWRpdG9yKVxuICAgICAgfVxuICAgIH0pXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZTogKCkgPT4ge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICB9XG59XG4iXX0=
//# sourceURL=/Users/mk2/.atom/packages/toggle-quotes/lib/main.js
