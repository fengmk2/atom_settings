(function() {
  var Actions, DatabaseStore, DraftStore, Message, NylasStore, React, TemplateStore, fs, path, ref, shell,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('nylas-exports'), DatabaseStore = ref.DatabaseStore, DraftStore = ref.DraftStore, Actions = ref.Actions, Message = ref.Message, React = ref.React;

  NylasStore = require('nylas-store');

  shell = require('shell');

  path = require('path');

  fs = require('fs');

  TemplateStore = (function(superClass) {
    extend(TemplateStore, superClass);

    function TemplateStore() {
      this._onInsertTemplateId = bind(this._onInsertTemplateId, this);
      this._writeTemplate = bind(this._writeTemplate, this);
      this._displayError = bind(this._displayError, this);
      this._onShowTemplates = bind(this._onShowTemplates, this);
      this._onCreateTemplate = bind(this._onCreateTemplate, this);
      this._populate = bind(this._populate, this);
      this._registerListeners = bind(this._registerListeners, this);
      this._setStoreDefaults = bind(this._setStoreDefaults, this);
      this.templatesDirectory = bind(this.templatesDirectory, this);
      this.items = bind(this.items, this);
      this._setStoreDefaults();
      this._registerListeners();
      this._templatesDir = path.join(atom.getConfigDirPath(), 'templates');
      this._welcomeName = 'Welcome to Templates.html';
      this._welcomePath = path.join(__dirname, '..', 'assets', this._welcomeName);
      fs.exists(this._templatesDir, (function(_this) {
        return function(exists) {
          if (exists) {
            _this._populate();
            return fs.watch(_this._templatesDir, function() {
              return _this._populate();
            });
          } else {
            return fs.mkdir(_this._templatesDir, function() {
              return fs.readFile(_this._welcomePath, function(err, welcome) {
                return fs.writeFile(path.join(_this._templatesDir, _this._welcomeName), welcome, function(err) {
                  return fs.watch(_this._templatesDir, function() {
                    return _this._populate();
                  });
                });
              });
            });
          }
        };
      })(this));
    }

    TemplateStore.prototype.items = function() {
      return this._items;
    };

    TemplateStore.prototype.templatesDirectory = function() {
      return this._templatesDir;
    };

    TemplateStore.prototype._setStoreDefaults = function() {
      return this._items = [];
    };

    TemplateStore.prototype._registerListeners = function() {
      this.listenTo(Actions.insertTemplateId, this._onInsertTemplateId);
      this.listenTo(Actions.createTemplate, this._onCreateTemplate);
      return this.listenTo(Actions.showTemplates, this._onShowTemplates);
    };

    TemplateStore.prototype._populate = function() {
      return fs.readdir(this._templatesDir, (function(_this) {
        return function(err, filenames) {
          var displayname, filename, i, len;
          _this._items = [];
          for (i = 0, len = filenames.length; i < len; i++) {
            filename = filenames[i];
            if (filename[0] === '.') {
              continue;
            }
            displayname = path.basename(filename, path.extname(filename));
            _this._items.push({
              id: filename,
              name: displayname,
              path: path.join(_this._templatesDir, filename)
            });
          }
          return _this.trigger(_this);
        };
      })(this));
    };

    TemplateStore.prototype._onCreateTemplate = function(arg) {
      var contents, draftClientId, name, ref1;
      ref1 = arg != null ? arg : {}, draftClientId = ref1.draftClientId, name = ref1.name, contents = ref1.contents;
      if (draftClientId) {
        return DraftStore.sessionForClientId(draftClientId).then((function(_this) {
          return function(session) {
            var draft;
            draft = session.draft();
            if (name == null) {
              name = draft.subject;
            }
            if (contents == null) {
              contents = draft.body;
            }
            if (!name || name.length === 0) {
              return _this._displayError("Give your draft a subject to name your template.");
            }
            if (!contents || contents.length === 0) {
              return _this._displayError("To create a template you need to fill the body of the current draft.");
            }
            return _this._writeTemplate(name, contents);
          };
        })(this));
      } else {
        if (!name || name.length === 0) {
          return this._displayError("You must provide a name for your template.");
        }
        if (!contents || contents.length === 0) {
          return this._displayError("You must provide contents for your template.");
        }
        return this._writeTemplate(name, contents);
      }
    };

    TemplateStore.prototype._onShowTemplates = function() {
      var ref1;
      return shell.showItemInFolder(((ref1 = this._items[0]) != null ? ref1.path : void 0) || this._templatesDir);
    };

    TemplateStore.prototype._displayError = function(message) {
      var dialog;
      dialog = require('remote').require('dialog');
      return dialog.showErrorBox('Template Creation Error', message);
    };

    TemplateStore.prototype._writeTemplate = function(name, contents) {
      var filename, templatePath;
      filename = name + ".html";
      templatePath = path.join(this._templatesDir, filename);
      return fs.writeFile(templatePath, contents, (function(_this) {
        return function(err) {
          if (err) {
            _this._displayError(err);
          }
          shell.showItemInFolder(templatePath);
          _this._items.push({
            id: filename,
            name: name,
            path: templatePath
          });
          return _this.trigger(_this);
        };
      })(this));
    };

    TemplateStore.prototype._onInsertTemplateId = function(arg) {
      var draftClientId, i, item, len, ref1, ref2, template, templateId;
      ref1 = arg != null ? arg : {}, templateId = ref1.templateId, draftClientId = ref1.draftClientId;
      template = null;
      ref2 = this._items;
      for (i = 0, len = ref2.length; i < len; i++) {
        item = ref2[i];
        if (item.id === templateId) {
          template = item;
        }
      }
      if (!template) {
        return;
      }
      return fs.readFile(template.path, function(err, data) {
        var body;
        body = data.toString();
        return DraftStore.sessionForClientId(draftClientId).then(function(session) {
          return session.changes.add({
            body: body
          });
        });
      });
    };

    return TemplateStore;

  })(NylasStore);

  module.exports = new TemplateStore();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1HQUFBO0lBQUE7Ozs7RUFBQSxNQUF1RCxPQUFBLENBQVEsZUFBUixDQUF2RCxFQUFDLG9CQUFBLGFBQUQsRUFBZ0IsaUJBQUEsVUFBaEIsRUFBNEIsY0FBQSxPQUE1QixFQUFxQyxjQUFBLE9BQXJDLEVBQThDLFlBQUE7O0VBQzlDLFVBQUEsR0FBYSxPQUFBLENBQVEsYUFBUjs7RUFDYixLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBQ1IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFQzs7O0lBQ1MsdUJBQUE7Ozs7Ozs7Ozs7O01BQ1gsSUFBQyxDQUFBLGlCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtNQUVBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLGdCQUFMLENBQUEsQ0FBVixFQUFtQyxXQUFuQztNQUNqQixJQUFDLENBQUEsWUFBRCxHQUFnQjtNQUNoQixJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsSUFBckIsRUFBMkIsUUFBM0IsRUFBcUMsSUFBQyxDQUFBLFlBQXRDO01BSWhCLEVBQUUsQ0FBQyxNQUFILENBQVUsSUFBQyxDQUFBLGFBQVgsRUFBMEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7VUFDeEIsSUFBRyxNQUFIO1lBQ0UsS0FBQyxDQUFBLFNBQUQsQ0FBQTttQkFDQSxFQUFFLENBQUMsS0FBSCxDQUFTLEtBQUMsQ0FBQSxhQUFWLEVBQXlCLFNBQUE7cUJBQUcsS0FBQyxDQUFBLFNBQUQsQ0FBQTtZQUFILENBQXpCLEVBRkY7V0FBQSxNQUFBO21CQUlFLEVBQUUsQ0FB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
//# sourceURL=/Users/mk2/.nylas/packages/N1-Composer-Templates/lib/template-store.coffee