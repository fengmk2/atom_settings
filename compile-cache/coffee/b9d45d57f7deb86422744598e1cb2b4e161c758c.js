(function() {
  module.exports = {
    provider: null,
    ready: false,
    activate: function() {
      return this.ready = true;
    },
    deactivate: function() {
      return this.provider = null;
    },
    getProvider: function() {
      var SnippetsProvider;
      if (this.provider != null) {
        return this.provider;
      }
      SnippetsProvider = require('./snippets-provider');
      this.provider = new SnippetsProvider();
      return this.provider;
    },
    provide: function() {
      return {
        provider: this.getProvider()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxJQUFWO0FBQUEsSUFDQSxLQUFBLEVBQU8sS0FEUDtBQUFBLElBR0EsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxLQUFELEdBQVMsS0FERDtJQUFBLENBSFY7QUFBQSxJQU1BLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsUUFBRCxHQUFZLEtBREY7SUFBQSxDQU5aO0FBQUEsSUFTQSxXQUFBLEVBQWEsU0FBQSxHQUFBO0FBQ1gsVUFBQSxnQkFBQTtBQUFBLE1BQUEsSUFBb0IscUJBQXBCO0FBQUEsZUFBTyxJQUFDLENBQUEsUUFBUixDQUFBO09BQUE7QUFBQSxNQUNBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUixDQURuQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLGdCQUFBLENBQUEsQ0FGaEIsQ0FBQTtBQUdBLGFBQU8sSUFBQyxDQUFBLFFBQVIsQ0FKVztJQUFBLENBVGI7QUFBQSxJQWVBLE9BQUEsRUFBUyxTQUFBLEdBQUE7QUFDUCxhQUFPO0FBQUEsUUFBQyxRQUFBLEVBQVUsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFYO09BQVAsQ0FETztJQUFBLENBZlQ7R0FERixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/mk2/.atom/packages/autocomplete-snippets/lib/autocomplete-snippets.coffee