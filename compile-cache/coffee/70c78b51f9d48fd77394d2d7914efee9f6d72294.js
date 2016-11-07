(function() {
  var CompositeDisposable, Disposable, Emitter, FuzzyProvider, Provider, ProviderManager, ScopedPropertyStore, Suggestion, Uuid, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable, Emitter = _ref.Emitter;

  ScopedPropertyStore = require('scoped-property-store');

  _ = require('underscore-plus');

  Uuid = require('node-uuid');

  FuzzyProvider = require('./fuzzy-provider');

  Suggestion = require('./suggestion');

  Provider = require('./provider');

  module.exports = ProviderManager = (function() {
    ProviderManager.prototype.fuzzyProvider = null;

    ProviderManager.prototype.fuzzyRegistration = null;

    ProviderManager.prototype.store = null;

    ProviderManager.prototype.subscriptions = null;

    ProviderManager.prototype.legacyProviderRegistrations = null;

    ProviderManager.prototype.globalBlacklist = null;

    function ProviderManager() {
      this.unregisterLegacyProvider = __bind(this.unregisterLegacyProvider, this);
      this.registerLegacyProvider = __bind(this.registerLegacyProvider, this);
      this.registerProvider = __bind(this.registerProvider, this);
      this.removeProvider = __bind(this.removeProvider, this);
      this.providerUuid = __bind(this.providerUuid, this);
      this.addProvider = __bind(this.addProvider, this);
      this.setGlobalBlacklist = __bind(this.setGlobalBlacklist, this);
      this.toggleFuzzyProvider = __bind(this.toggleFuzzyProvider, this);
      this.providersForScopeChain = __bind(this.providersForScopeChain, this);
      this.subscriptions = new CompositeDisposable;
      this.globalBlacklist = new CompositeDisposable;
      this.legacyProviderRegistrations = new WeakMap;
      this.providers = new Map;
      this.store = new ScopedPropertyStore;
      this.subscriptions.add(atom.config.observe('autocomplete-plus.enableBuiltinProvider', (function(_this) {
        return function(value) {
          return _this.toggleFuzzyProvider(value);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.scopeBlacklist', (function(_this) {
        return function(value) {
          return _this.setGlobalBlacklist(value);
        };
      })(this)));
    }

    ProviderManager.prototype.dispose = function() {
      var _ref1, _ref2, _ref3, _ref4, _ref5;
      this.toggleFuzzyProvider(false);
      if ((_ref1 = this.globalBlacklist) != null) {
        _ref1.dispose();
      }
      this.globalBlacklist = null;
      this.blacklist = null;
      if ((_ref2 = this.subscriptions) != null) {
        _ref2.dispose();
      }
      this.subscriptions = null;
      if ((_ref3 = this.store) != null) {
        _ref3.cache = {};
      }
      if ((_ref4 = this.store) != null) {
        _ref4.propertySets = [];
      }
      this.store = null;
      if ((_ref5 = this.providers) != null) {
        _ref5.clear();
      }
      this.providers = null;
      return this.legacyProviderRegistrations = null;
    };

    ProviderManager.prototype.providersForScopeChain = function(scopeChain) {
      var blacklist, blacklistedProviders, fuzzyProviderBlacklisted, providers;
      if (scopeChain == null) {
        return [];
      }
      if (this.store == null) {
        return [];
      }
      providers = [];
      if (_.contains(this.blacklist, scopeChain)) {
        return [];
      }
      providers = this.store.getAll(scopeChain);
      blacklist = _.chain(providers).map(function(p) {
        return p.value.globalBlacklist;
      }).filter(function(p) {
        return (p != null) && p === true;
      }).value();
      if ((blacklist != null) && blacklist.length) {
        return [];
      }
      blacklistedProviders = _.chain(providers).filter(function(p) {
        return (p.value.blacklisted != null) && p.value.blacklisted === true;
      }).map(function(p) {
        return p.value.provider;
      }).value();
      if (this.fuzzyProvider != null) {
        fuzzyProviderBlacklisted = _.chain(providers).filter(function(p) {
          return (p.value.providerblacklisted != null) && p.value.providerblacklisted === 'autocomplete-plus-fuzzyprovider';
        }).map(function(p) {
          return p.value.provider;
        }).value();
      }
      providers = _.chain(providers).filter(function(p) {
        return p.value.blacklisted == null;
      }).sortBy(function(p) {
        return -p.scopeSelector.length;
      }).map(function(p) {
        return p.value.provider;
      }).uniq().difference(blacklistedProviders).value();
      if ((fuzzyProviderBlacklisted != null) && fuzzyProviderBlacklisted.length && (this.fuzzyProvider != null)) {
        providers = _.without(providers, this.fuzzyProvider);
      }
      return providers;
    };

    ProviderManager.prototype.toggleFuzzyProvider = function(enabled) {
      if (enabled == null) {
        return;
      }
      if (enabled) {
        if ((this.fuzzyProvider != null) || (this.fuzzyRegistration != null)) {
          return;
        }
        this.fuzzyProvider = new FuzzyProvider();
        return this.fuzzyRegistration = this.registerProvider(this.fuzzyProvider);
      } else {
        if (this.fuzzyRegistration != null) {
          this.fuzzyRegistration.dispose();
        }
        if (this.fuzzyProvider != null) {
          this.fuzzyProvider.dispose();
        }
        this.fuzzyRegistration = null;
        return this.fuzzyProvider = null;
      }
    };

    ProviderManager.prototype.setGlobalBlacklist = function(blacklist) {
      var properties, registration;
      this.blacklist = blacklist;
      if (this.globalBlacklist != null) {
        this.globalBlacklist.dispose();
      }
      this.globalBlacklist = new CompositeDisposable;
      if (this.blacklist == null) {
        this.blacklist = [];
      }
      if (!this.blacklist.length) {
        return;
      }
      properties = {};
      properties[blacklist.join(',')] = {
        globalBlacklist: true
      };
      registration = this.store.addProperties('globalblacklist', properties);
      return this.globalBlacklist.add(registration);
    };

    ProviderManager.prototype.addProvider = function(provider) {
      var _ref1;
      if (!this.isValidProvider(provider)) {
        return;
      }
      if (!this.providers.has(provider)) {
        this.providers.set(provider, Uuid.v4());
      }
      if ((provider.dispose != null) && !_.contains((_ref1 = this.subscriptions) != null ? _ref1.disposables : void 0, provider)) {
        return this.subscriptions.add(provider);
      }
    };

    ProviderManager.prototype.isValidProvider = function(provider) {
      return (provider != null) && (provider.requestHandler != null) && typeof provider.requestHandler === 'function' && (provider.selector != null) && provider.selector !== '' && provider.selector !== false;
    };

    ProviderManager.prototype.isLegacyProvider = function(provider) {
      return (provider != null) && provider instanceof Provider;
    };

    ProviderManager.prototype.providerUuid = function(provider) {
      if (provider == null) {
        return false;
      }
      if (!this.providers.has(provider)) {
        return false;
      }
      return this.providers.get(provider);
    };

    ProviderManager.prototype.removeProvider = function(provider) {
      var _ref1, _ref2;
      if (!this.isValidProvider(provider)) {
        return;
      }
      if ((_ref1 = this.providers) != null ? _ref1.has(provider) : void 0) {
        this.providers["delete"](provider);
      }
      if ((provider.dispose != null) && _.contains((_ref2 = this.subscriptions) != null ? _ref2.disposables : void 0, provider)) {
        return this.subscriptions.remove(provider);
      }
    };

    ProviderManager.prototype.registerProvider = function(provider) {
      var blacklist, blacklistRegistration, blacklistid, blacklistproperties, id, properties, providerblacklist, providerblacklistRegistration, providerblacklistid, providerblacklistproperties, registration, selectors, _ref1, _ref2, _ref3;
      if (!this.isValidProvider(provider)) {
        return;
      }
      this.addProvider(provider);
      id = this.providerUuid(provider);
      if (id == null) {
        this.removeProvider(provider);
      }
      if (id == null) {
        return;
      }
      selectors = provider.selector.split(',');
      selectors = _.reject(selectors, (function(_this) {
        return function(s) {
          var p;
          p = _this.store.propertiesForSourceAndSelector(id, s);
          return (p != null) && (p.provider != null);
        };
      })(this));
      if (!selectors.length) {
        return;
      }
      properties = {};
      properties[selectors.join(',')] = {
        provider: provider
      };
      registration = this.store.addProperties(id, properties);
      blacklistRegistration = null;
      if ((_ref1 = provider.blacklist) != null ? _ref1.length : void 0) {
        blacklistid = id + '-blacklist';
        blacklist = provider.blacklist.split(',');
        blacklist = _.reject(blacklist, (function(_this) {
          return function(s) {
            var p;
            p = _this.store.propertiesForSourceAndSelector(blacklistid, s);
            return (p != null) && (p.provider != null) && (p.blacklisted != null) && p.blacklisted;
          };
        })(this));
        if (blacklist.length) {
          blacklistproperties = {};
          blacklistproperties[blacklist.join(',')] = {
            provider: provider,
            blacklisted: true
          };
          blacklistRegistration = this.store.addProperties(blacklistid, blacklistproperties);
        }
      }
      if ((_ref2 = provider.providerblacklist) != null ? (_ref3 = _ref2['autocomplete-plus-fuzzyprovider']) != null ? _ref3.length : void 0 : void 0) {
        providerblacklistid = id + '-providerblacklist';
        providerblacklist = provider.providerblacklist['autocomplete-plus-fuzzyprovider'].split(',');
        providerblacklist = _.reject(providerblacklist, (function(_this) {
          return function(s) {
            var p;
            p = _this.store.propertiesForSourceAndSelector(providerblacklistid, s);
            return (p != null) && (p.provider != null) && (p.providerblacklisted != null) && p.providerblacklisted === 'autocomplete-plus-fuzzyprovider';
          };
        })(this));
        if (providerblacklist.length) {
          providerblacklistproperties = {};
          providerblacklistproperties[providerblacklist.join(',')] = {
            provider: provider,
            providerblacklisted: 'autocomplete-plus-fuzzyprovider'
          };
          providerblacklistRegistration = this.store.addProperties(providerblacklistid, providerblacklistproperties);
        }
      }
      if (provider.dispose != null) {
        provider.dispose = _.wrap(provider.dispose, (function(_this) {
          return function(f) {
            if (typeof f === "function") {
              f();
            }
            if (registration != null) {
              registration.dispose();
            }
            if (blacklistRegistration != null) {
              blacklistRegistration.dispose();
            }
            if (typeof providerblacklistRegistation !== "undefined" && providerblacklistRegistation !== null) {
              providerblacklistRegistation.dispose();
            }
            return _this.removeProvider(provider);
          };
        })(this));
      }
      return new Disposable((function(_this) {
        return function() {
          if (registration != null) {
            registration.dispose();
          }
          if (blacklistRegistration != null) {
            blacklistRegistration.dispose();
          }
          if (typeof providerblacklistRegistation !== "undefined" && providerblacklistRegistation !== null) {
            providerblacklistRegistation.dispose();
          }
          return _this.removeProvider(provider);
        };
      })(this));
    };

    ProviderManager.prototype.registerLegacyProvider = function(legacyProvider, selector) {
      var legacyProviderRegistration;
      if (!((legacyProvider != null) && (legacyProvider.buildSuggestionsShim != null))) {
        return;
      }
      if (!((selector != null) && selector.trim() !== '')) {
        return;
      }
      legacyProviderRegistration = this.legacyProviderRegistrations.get(legacyProvider.constructor);
      if (legacyProviderRegistration) {
        legacyProviderRegistration.service.dispose();
        if (legacyProviderRegistration.selectors.indexOf(selector) < 0) {
          legacyProviderRegistration.selectors.push(selector);
        }
      } else {
        legacyProviderRegistration = {
          selectors: [selector]
        };
        this.legacyProviderRegistrations.set(legacyProvider.constructor, legacyProviderRegistration);
      }
      selector = legacyProviderRegistration.selectors.join(',');
      legacyProviderRegistration.shim = this.shimLegacyProvider(legacyProvider, selector);
      legacyProviderRegistration.service = this.registerProvider(legacyProviderRegistration.shim);
      return legacyProviderRegistration.service;
    };

    ProviderManager.prototype.shimLegacyProvider = function(legacyProvider, selector) {
      var shim;
      shim = {
        legacyProvider: legacyProvider,
        requestHandler: legacyProvider.buildSuggestionsShim,
        selector: selector,
        dispose: function() {
          var requestHandler;
          requestHandler = null;
          if (legacyProvider.dispose != null) {
            legacyProvider.dispose();
          }
          legacyProvider = null;
          return selector = null;
        }
      };
      return shim;
    };

    ProviderManager.prototype.unregisterLegacyProvider = function(legacyProvider) {
      var legacyProviderRegistration;
      if (legacyProvider == null) {
        return;
      }
      legacyProviderRegistration = this.legacyProviderRegistrations.get(legacyProvider.constructor);
      if (legacyProviderRegistration) {
        legacyProviderRegistration.service.dispose();
        return this.legacyProviderRegistrations["delete"](legacyProvider.constructor);
      }
    };

    return ProviderManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtJQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxPQUE2QyxPQUFBLENBQVEsTUFBUixDQUE3QyxFQUFDLDJCQUFBLG1CQUFELEVBQXNCLGtCQUFBLFVBQXRCLEVBQWtDLGVBQUEsT0FBbEMsQ0FBQTs7QUFBQSxFQUNBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx1QkFBUixDQUR0QixDQUFBOztBQUFBLEVBRUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUZKLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFdBQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVIsQ0FKaEIsQ0FBQTs7QUFBQSxFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUixDQUxiLENBQUE7O0FBQUEsRUFNQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FOWCxDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDhCQUFBLGFBQUEsR0FBZSxJQUFmLENBQUE7O0FBQUEsOEJBQ0EsaUJBQUEsR0FBbUIsSUFEbkIsQ0FBQTs7QUFBQSw4QkFFQSxLQUFBLEdBQU8sSUFGUCxDQUFBOztBQUFBLDhCQUdBLGFBQUEsR0FBZSxJQUhmLENBQUE7O0FBQUEsOEJBSUEsMkJBQUEsR0FBNkIsSUFKN0IsQ0FBQTs7QUFBQSw4QkFLQSxlQUFBLEdBQWlCLElBTGpCLENBQUE7O0FBT2EsSUFBQSx5QkFBQSxHQUFBO0FBQ1gsaUZBQUEsQ0FBQTtBQUFBLDZFQUFBLENBQUE7QUFBQSxpRUFBQSxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEscUVBQUEsQ0FBQTtBQUFBLHVFQUFBLENBQUE7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
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-plus/lib/provider-manager.coffee