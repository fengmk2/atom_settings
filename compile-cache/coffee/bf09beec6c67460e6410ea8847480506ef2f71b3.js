(function() {
  var CompositeDisposable, Plantuml, getPngFilePath, prepareFile, writeAndOpenPng, _ref;

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('./file-utils'), prepareFile = _ref.prepareFile, getPngFilePath = _ref.getPngFilePath;

  writeAndOpenPng = require('./plantuml-utils').writeAndOpenPng;

  module.exports = Plantuml = {
    subscriptions: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'plantuml:generate': (function(_this) {
          return function() {
            return _this.generate();
          };
        })(this)
      }));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    generate: function() {
      var buffer, charset, pngFilePath, prepared, umlFilePath;
      if (atom.workspace.getActivePaneItem() == null) {
        return atom.notifications.addWarning('Could not read data.', {
          detail: 'Please make sure to open the plantuml file first.'
        });
      } else {
        buffer = atom.workspace.getActivePaneItem().buffer;
        prepared = prepareFile(buffer);
        if (prepared) {
          pngFilePath = getPngFilePath(buffer.file);
          umlFilePath = buffer.file.path;
          charset = buffer.file.getEncoding();
          return writeAndOpenPng(umlFilePath, pngFilePath, charset);
        } else {
          return atom.notifications.addWarning('Could not write file.', {
            detail: 'Please make sure file can be written to disk.'
          });
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9wbGFudHVtbC1nZW5lcmF0b3IvbGliL3BsYW50dW1sLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpRkFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBRUEsT0FBZ0MsT0FBQSxDQUFRLGNBQVIsQ0FBaEMsRUFBQyxtQkFBQSxXQUFELEVBQWMsc0JBQUEsY0FGZCxDQUFBOztBQUFBLEVBR0Msa0JBQW1CLE9BQUEsQ0FBUSxrQkFBUixFQUFuQixlQUhELENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFBLEdBQ2Y7QUFBQSxJQUFBLGFBQUEsRUFBZSxJQUFmO0FBQUEsSUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ2pCO0FBQUEsUUFBQSxtQkFBQSxFQUFxQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsUUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtPQURpQixDQUFuQixFQUZRO0lBQUEsQ0FGVjtBQUFBLElBT0EsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLEVBRFU7SUFBQSxDQVBaO0FBQUEsSUFVQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsVUFBQSxtREFBQTtBQUFBLE1BQUEsSUFBSSwwQ0FBSjtlQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsc0JBQTlCLEVBQXNEO0FBQUEsVUFDcEQsTUFBQSxFQUFPLG1EQUQ2QztTQUF0RCxFQURGO09BQUEsTUFBQTtBQUlFLFFBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWYsQ0FBQSxDQUFrQyxDQUFDLE1BQTVDLENBQUE7QUFBQSxRQUNBLFFBQUEsR0FBVyxXQUFBLENBQVksTUFBWixDQURYLENBQUE7QUFFQSxRQUFBLElBQUcsUUFBSDtBQUNFLFVBQUEsV0FBQSxHQUFjLGNBQUEsQ0FBZSxNQUFNLENBQUMsSUFBdEIsQ0FBZCxDQUFBO0FBQUEsVUFDQSxXQUFBLEdBQWMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUQxQixDQUFBO0FBQUEsVUFFQSxPQUFBLEdBQVUsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFaLENBQUEsQ0FGVixDQUFBO2lCQUdBLGVBQUEsQ0FBZ0IsV0FBaEIsRUFBNkIsV0FBN0IsRUFBMEMsT0FBMUMsRUFKRjtTQUFBLE1BQUE7aUJBTUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4Qix1QkFBOUIsRUFBdUQ7QUFBQSxZQUNyRCxNQUFBLEVBQU8sK0NBRDhDO1dBQXZELEVBTkY7U0FORjtPQURRO0lBQUEsQ0FWVjtHQU5GLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/mk2/.atom/packages/plantuml-generator/lib/plantuml.coffee
