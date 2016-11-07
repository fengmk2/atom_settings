(function() {
  describe('validate', function() {
    var validate;
    validate = require('../lib/validate');
    describe('::linter', function() {
      it('throws error if grammarScopes is not an array', function() {
        return expect(function() {
          return validate.linter({
            lint: function() {}
          });
        }).toThrow("grammarScopes is not an Array. Got: undefined");
      });
      it('throws if lint is missing', function() {
        return expect(function() {
          return validate.linter({
            grammarScopes: []
          });
        }).toThrow();
      });
      return it('throws if lint is not a function', function() {
        return expect(function() {
          return validate.linter({
            grammarScopes: [],
            lint: true
          });
        }).toThrow();
      });
    });
    return describe('::messages', function() {
      it('throws if messages is not an array', function() {
        expect(function() {
          return validate.messages();
        }).toThrow("Expected messages to be array, provided: undefined");
        return expect(function() {
          return validate.messages(true);
        }).toThrow("Expected messages to be array, provided: boolean");
      });
      it('throws if type field is not present', function() {
        return expect(function() {
          return validate.messages([{}]);
        }).toThrow();
      });
      it("throws if type field is invalid", function() {
        return expect(function() {
          return validate.messages([
            {
              type: 1
            }
          ]);
        }).toThrow();
      });
      it("throws if there's no html/text field on message", function() {
        return expect(function() {
          return validate.messages([
            {
              type: 'Error'
            }
          ]);
        }).toThrow();
      });
      return it("throws if html/text is invalid", function() {
        expect(function() {
          return validate.messages([
            {
              type: 'Error',
              html: 1
            }
          ]);
        }).toThrow();
        expect(function() {
          return validate.messages([
            {
              type: 'Error',
              text: 1
            }
          ]);
        }).toThrow();
        expect(function() {
          return validate.messages([
            {
              type: 'Error',
              html: false
            }
          ]);
        }).toThrow();
        expect(function() {
          return validate.messages([
            {
              type: 'Error',
              text: false
            }
          ]);
        }).toThrow();
        expect(function() {
          return validate.messages([
            {
              type: 'Error',
              html: []
            }
          ]);
        }).toThrow();
        return expect(function() {
          return validate.messages([
            {
              type: 'Error',
              text: []
            }
          ]);
        }).toThrow();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy92YWxpZGF0ZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsUUFBQSxRQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBQVgsQ0FBQTtBQUFBLElBQ0EsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLE1BQUEsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUEsR0FBQTtlQUNsRCxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxNQUFULENBQWdCO0FBQUEsWUFBQyxJQUFBLEVBQU0sU0FBQSxHQUFBLENBQVA7V0FBaEIsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FFUywrQ0FGVCxFQURrRDtNQUFBLENBQXBELENBQUEsQ0FBQTtBQUFBLE1BSUEsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUEsR0FBQTtlQUM5QixNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxNQUFULENBQWdCO0FBQUEsWUFBQyxhQUFBLEVBQWUsRUFBaEI7V0FBaEIsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FBQSxFQUQ4QjtNQUFBLENBQWhDLENBSkEsQ0FBQTthQVFBLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBLEdBQUE7ZUFDckMsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxRQUFRLENBQUMsTUFBVCxDQUFnQjtBQUFBLFlBQUMsYUFBQSxFQUFlLEVBQWhCO0FBQUEsWUFBb0IsSUFBQSxFQUFNLElBQTFCO1dBQWhCLEVBREs7UUFBQSxDQUFQLENBRUEsQ0FBQyxPQUZELENBQUEsRUFEcUM7TUFBQSxDQUF2QyxFQVRtQjtJQUFBLENBQXJCLENBREEsQ0FBQTtXQWVBLFFBQUEsQ0FBUyxZQUFULEVBQXVCLFNBQUEsR0FBQTtBQUNyQixNQUFBLEVBQUEsQ0FBRyxvQ0FBSCxFQUF5QyxTQUFBLEdBQUE7QUFDdkMsUUFBQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQUEsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FFUyxvREFGVCxDQUFBLENBQUE7ZUFHQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQWtCLElBQWxCLEVBREs7UUFBQSxDQUFQLENBRUEsQ0FBQyxPQUZELENBRVMsa0RBRlQsRUFKdUM7TUFBQSxDQUF6QyxDQUFBLENBQUE7QUFBQSxNQU9BLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBLEdBQUE7ZUFDeEMsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxRQUFRLENBQUMsUUFBVCxDQUFrQixDQUFDLEVBQUQsQ0FBbEIsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FBQSxFQUR3QztNQUFBLENBQTFDLENBUEEsQ0FBQTtBQUFBLE1BV0EsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUEsR0FBQTtlQUNwQyxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQWtCO1lBQUM7QUFBQSxjQUFDLElBQUEsRUFBTSxDQUFQO2FBQUQ7V0FBbEIsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FBQSxFQURvQztNQUFBLENBQXRDLENBWEEsQ0FBQTtBQUFBLE1BZUEsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUEsR0FBQTtlQUNwRCxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQWtCO1lBQUM7QUFBQSxjQUFDLElBQUEsRUFBTSxPQUFQO2FBQUQ7V0FBbEIsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FBQSxFQURvRDtNQUFBLENBQXRELENBZkEsQ0FBQTthQW1CQSxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQSxHQUFBO0FBQ25DLFFBQUEsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxRQUFRLENBQUMsUUFBVCxDQUFrQjtZQUFDO0FBQUEsY0FBQyxJQUFBLEVBQU0sT0FBUDtBQUFBLGNBQWdCLElBQUEsRUFBTSxDQUF0QjthQUFEO1dBQWxCLEVBREs7UUFBQSxDQUFQLENBRUEsQ0FBQyxPQUZELENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFHQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQWtCO1lBQUM7QUFBQSxjQUFDLElBQUEsRUFBTSxPQUFQO0FBQUEsY0FBZ0IsSUFBQSxFQUFNLENBQXRCO2FBQUQ7V0FBbEIsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FBQSxDQUhBLENBQUE7QUFBQSxRQU1BLE1BQUEsQ0FBTyxTQUFBLEdBQUE7aUJBQ0wsUUFBUSxDQUFDLFFBQVQsQ0FBa0I7WUFBQztBQUFBLGNBQUMsSUFBQSxFQUFNLE9BQVA7QUFBQSxjQUFnQixJQUFBLEVBQU0sS0FBdEI7YUFBRDtXQUFsQixFQURLO1FBQUEsQ0FBUCxDQUVBLENBQUMsT0FGRCxDQUFBLENBTkEsQ0FBQTtBQUFBLFFBU0EsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFDTCxRQUFRLENBQUMsUUFBVCxDQUFrQjtZQUFDO0FBQUEsY0FBQyxJQUFBLEVBQU0sT0FBUDtBQUFBLGNBQWdCLElBQUEsRUFBTSxLQUF0QjthQUFEO1dBQWxCLEVBREs7UUFBQSxDQUFQLENBRUEsQ0FBQyxPQUZELENBQUEsQ0FUQSxDQUFBO0FBQUEsUUFZQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQWtCO1lBQUM7QUFBQSxjQUFDLElBQUEsRUFBTSxPQUFQO0FBQUEsY0FBZ0IsSUFBQSxFQUFNLEVBQXRCO2FBQUQ7V0FBbEIsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FBQSxDQVpBLENBQUE7ZUFlQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUNMLFFBQVEsQ0FBQyxRQUFULENBQWtCO1lBQUM7QUFBQSxjQUFDLElBQUEsRUFBTSxPQUFQO0FBQUEsY0FBZ0IsSUFBQSxFQUFNLEVBQXRCO2FBQUQ7V0FBbEIsRUFESztRQUFBLENBQVAsQ0FFQSxDQUFDLE9BRkQsQ0FBQSxFQWhCbUM7TUFBQSxDQUFyQyxFQXBCcUI7SUFBQSxDQUF2QixFQWhCbUI7RUFBQSxDQUFyQixDQUFBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/mk2/.atom/packages/linter/spec/validate-spec.coffee
