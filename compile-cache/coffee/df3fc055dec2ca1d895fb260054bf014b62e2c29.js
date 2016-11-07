(function() {
  var ShowTodoView, path;

  path = require('path');

  ShowTodoView = require('../lib/show-todo-view');

  describe('ShowTodoView fetching logic and data handling', function() {
    var defaultLookup, defaultRegexes, showTodoView, _ref;
    _ref = [], showTodoView = _ref[0], defaultRegexes = _ref[1], defaultLookup = _ref[2];
    beforeEach(function() {
      defaultRegexes = ['FIXMEs', '/\\bFIXME:?\\d*($|\\s.*$)/g', 'TODOs', '/\\bTODO:?\\d*($|\\s.*$)/g'];
      defaultLookup = {
        title: defaultRegexes[2],
        regex: defaultRegexes[3]
      };
      showTodoView = new ShowTodoView('dummyPath');
      showTodoView.matches = [];
      return atom.project.setPaths([path.join(__dirname, 'fixtures/sample1')]);
    });
    describe('buildRegexLookups(regexes)', function() {
      return it('should return an array of lookup objects when passed an array of regexes', function() {
        var lookups, regexes;
        regexes = showTodoView.buildRegexLookups(defaultRegexes);
        lookups = [
          {
            title: defaultRegexes[0],
            regex: defaultRegexes[1]
          }, {
            title: defaultRegexes[2],
            regex: defaultRegexes[3]
          }
        ];
        return expect(regexes).toEqual(lookups);
      });
    });
    describe('makeRegexObj(regexStr)', function() {
      it('should return a RegExp obj when passed a regex literal (string)', function() {
        var regexObj, regexStr;
        regexStr = defaultLookup.regex;
        regexObj = showTodoView.makeRegexObj(regexStr);
        expect(typeof regexObj.test).toBe('function');
        return expect(typeof regexObj.exec).toBe('function');
      });
      return it('should return false bool when passed an invalid regex literal (string)', function() {
        var regexObj, regexStr;
        regexStr = 'arstastTODO:.+$)/g';
        regexObj = showTodoView.makeRegexObj(regexStr);
        return expect(regexObj).toBe(false);
      });
    });
    describe('handleScanMatch(match, regex)', function() {
      var match, regex, _ref1;
      _ref1 = [], match = _ref1.match, regex = _ref1.regex;
      beforeEach(function() {
        regex = /\b@?TODO:?\d*($|\s.*$)/g;
        return match = {
          path: "" + (atom.project.getPaths()[0]) + "/sample.c",
          matchText: ' TODO: Comment in C ',
          range: [[0, 1], [0, 20]]
        };
      });
      it('should handle results from workspace scan (also tested in fetchRegexItem)', function() {
        var output;
        output = showTodoView.handleScanMatch(match);
        return expect(output.matchText).toEqual('TODO: Comment in C');
      });
      it('should remove regex part', function() {
        var output;
        output = showTodoView.handleScanMatch(match, regex);
        return expect(output.matchText).toEqual('Comment in C');
      });
      return it('should serialize range and relativize path', function() {
        var output;
        output = showTodoView.handleScanMatch(match, regex);
        expect(output.relativePath).toEqual('sample.c');
        return expect(output.rangeString).toEqual('0,1,0,20');
      });
    });
    describe('fetchRegexItem(lookupObj)', function() {
      it('should scan the workspace for the regex that is passed and fill lookup results', function() {
        waitsForPromise(function() {
          return showTodoView.fetchRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(3);
          expect(showTodoView.matches[0].matchText).toBe('Comment in C');
          expect(showTodoView.matches[1].matchText).toBe('This is the first todo');
          return expect(showTodoView.matches[2].matchText).toBe('This is the second todo');
        });
      });
      it('should respect ignored paths', function() {
        atom.config.set('todo-show.ignoreThesePaths', '*/sample.js');
        waitsForPromise(function() {
          return showTodoView.fetchRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(1);
          return expect(showTodoView.matches[0].matchText).toBe('Comment in C');
        });
      });
      it('should handle other regexes', function() {
        var lookup;
        lookup = {
          title: 'Includes',
          regex: '/#include(.+)/g'
        };
        waitsForPromise(function() {
          return showTodoView.fetchRegexItem(lookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(1);
          return expect(showTodoView.matches[0].matchText).toBe('<stdio.h>');
        });
      });
      it('should handle special character regexes', function() {
        var lookup;
        lookup = {
          title: 'Todos',
          regex: '/ This is the (?:first|second) todo/g'
        };
        waitsForPromise(function() {
          return showTodoView.fetchRegexItem(lookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(2);
          expect(showTodoView.matches[0].matchText).toBe('This is the first todo');
          return expect(showTodoView.matches[1].matchText).toBe('This is the second todo');
        });
      });
      it('should handle regex without capture group', function() {
        var lookup;
        lookup = {
          title: 'This is Code',
          regex: '/[\\w\\s]+code[\\w\\s]*/g'
        };
        waitsForPromise(function() {
          return showTodoView.fetchRegexItem(lookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(1);
          return expect(showTodoView.matches[0].matchText).toBe('Sample quicksort code');
        });
      });
      it('should handle post-annotations with special regex', function() {
        var lookup;
        lookup = {
          title: 'Pre-DEBUG',
          regex: '/(.+).{3}DEBUG\\s*$/g'
        };
        waitsForPromise(function() {
          return showTodoView.fetchRegexItem(lookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(1);
          return expect(showTodoView.matches[0].matchText).toBe('return sort(Array.apply(this, arguments));');
        });
      });
      it('should handle post-annotations with non-capturing group', function() {
        var lookup;
        lookup = {
          title: 'Pre-DEBUG',
          regex: '/(.+?(?=.{3}DEBUG\\s*$))/'
        };
        waitsForPromise(function() {
          return showTodoView.fetchRegexItem(lookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(1);
          return expect(showTodoView.matches[0].matchText).toBe('return sort(Array.apply(this, arguments));');
        });
      });
      it('should truncate matches longer than the defined max length of 120', function() {
        var lookup;
        lookup = {
          title: 'Long Annotation',
          regex: '/LOONG:?(.+$)/g'
        };
        waitsForPromise(function() {
          return showTodoView.fetchRegexItem(lookup);
        });
        return runs(function() {
          var matchText, matchText2;
          matchText = 'Lorem ipsum dolor sit amet, dapibus rhoncus. Scelerisque quam,';
          matchText += ' id ante molestias, ipsum lorem magnis et. A eleifend i...';
          matchText2 = '_SpgLE84Ms1K4DSumtJDoNn8ZECZLL+VR0DoGydy54vUoSpgLE84Ms1K4DSum';
          matchText2 += 'tJDoNn8ZECZLLVR0DoGydy54vUonRClXwLbFhX2gMwZgjx250ay+V0lF...';
          expect(showTodoView.matches[0].matchText).toHaveLength(120);
          expect(showTodoView.matches[0].matchText).toBe(matchText);
          expect(showTodoView.matches[1].matchText).toHaveLength(120);
          return expect(showTodoView.matches[1].matchText).toBe(matchText2);
        });
      });
      return it('should strip common block comment endings', function() {
        atom.project.setPaths([path.join(__dirname, 'fixtures/sample2')]);
        waitsForPromise(function() {
          return showTodoView.fetchRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(6);
          expect(showTodoView.matches[0].matchText).toBe('C block comment');
          expect(showTodoView.matches[1].matchText).toBe('HTML comment');
          expect(showTodoView.matches[2].matchText).toBe('PowerShell comment');
          expect(showTodoView.matches[3].matchText).toBe('Haskell comment');
          expect(showTodoView.matches[4].matchText).toBe('Lua comment');
          return expect(showTodoView.matches[5].matchText).toBe('PHP comment');
        });
      });
    });
    describe('fetchOpenRegexItem(lookupObj)', function() {
      var editor;
      editor = null;
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('sample.c');
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
      it('scans open files for the regex that is passed and fill lookup results', function() {
        waitsForPromise(function() {
          return showTodoView.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(1);
          expect(showTodoView.matches.length).toBe(1);
          return expect(showTodoView.matches[0].matchText).toBe('Comment in C');
        });
      });
      it('works with files outside of workspace', function() {
        waitsForPromise(function() {
          return atom.workspace.open('../sample2/sample.txt');
        });
        return runs(function() {
          waitsForPromise(function() {
            return showTodoView.fetchOpenRegexItem(defaultLookup);
          });
          return runs(function() {
            expect(showTodoView.matches).toHaveLength(7);
            expect(showTodoView.matches[0].matchText).toBe('Comment in C');
            expect(showTodoView.matches[1].matchText).toBe('C block comment');
            return expect(showTodoView.matches[6].matchText).toBe('PHP comment');
          });
        });
      });
      it('handles unsaved documents', function() {
        editor.setText('TODO: New todo');
        waitsForPromise(function() {
          return showTodoView.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(1);
          expect(showTodoView.matches[0].title).toBe('TODOs');
          return expect(showTodoView.matches[0].matchText).toBe('New todo');
        });
      });
      it('respects imdone syntax (https://github.com/imdone/imdone-atom)', function() {
        editor.setText('TODO:10 todo1\nTODO:0 todo2');
        waitsForPromise(function() {
          return showTodoView.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(2);
          expect(showTodoView.matches[0].title).toBe('TODOs');
          expect(showTodoView.matches[0].matchText).toBe('todo1');
          return expect(showTodoView.matches[1].matchText).toBe('todo2');
        });
      });
      it('handles number in todo (as long as its not without space)', function() {
        editor.setText("Line 1 //TODO: 1 2 3\nLine 1 // TODO:1 2 3");
        waitsForPromise(function() {
          return showTodoView.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(2);
          expect(showTodoView.matches[0].matchText).toBe('1 2 3');
          return expect(showTodoView.matches[1].matchText).toBe('2 3');
        });
      });
      it('handles empty todos', function() {
        editor.setText("Line 1 // TODO\nLine 2 //TODO");
        waitsForPromise(function() {
          return showTodoView.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(2);
          expect(showTodoView.matches[0].matchText).toBe('No details');
          return expect(showTodoView.matches[1].matchText).toBe('No details');
        });
      });
      it('handles empty block todos', function() {
        editor.setText("/* TODO */\nLine 2 /* TODO */");
        waitsForPromise(function() {
          return showTodoView.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(2);
          expect(showTodoView.matches[0].matchText).toBe('No details');
          return expect(showTodoView.matches[1].matchText).toBe('No details');
        });
      });
      it('handles todos with @ in front', function() {
        editor.setText("Line 1 //@TODO: text\nLine 2 //@TODO: text\nLine 3 @TODO: text");
        waitsForPromise(function() {
          return showTodoView.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          expect(showTodoView.matches).toHaveLength(3);
          expect(showTodoView.matches[0].matchText).toBe('text');
          expect(showTodoView.matches[1].matchText).toBe('text');
          return expect(showTodoView.matches[2].matchText).toBe('text');
        });
      });
      it('handles tabs in todos', function() {
        editor.setText('Line //TODO:\ttext');
        waitsForPromise(function() {
          return showTodoView.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          return expect(showTodoView.matches[0].matchText).toBe('text');
        });
      });
      it('handles todo without semicolon', function() {
        editor.setText('A line // TODO text');
        waitsForPromise(function() {
          return showTodoView.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          return expect(showTodoView.matches[0].matchText).toBe('text');
        });
      });
      it('ignores todos without leading space', function() {
        editor.setText('A line // TODO:text');
        waitsForPromise(function() {
          return showTodoView.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          return expect(showTodoView.matches).toHaveLength(0);
        });
      });
      it('ignores todo if unwanted chars are present', function() {
        editor.setText('define("_JS_TODO_ALERT_", "js:alert(&quot;TODO&quot;);");');
        waitsForPromise(function() {
          return showTodoView.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          return expect(showTodoView.matches).toHaveLength(0);
        });
      });
      return it('ignores binary data', function() {
        editor.setText('// TODOe�d��RPPP0�');
        waitsForPromise(function() {
          return showTodoView.fetchOpenRegexItem(defaultLookup);
        });
        return runs(function() {
          return expect(showTodoView.matches).toHaveLength(0);
        });
      });
    });
    return describe('getMarkdown()', function() {
      var matches;
      matches = [];
      beforeEach(function() {
        atom.config.set('todo-show.findTheseRegexes', defaultRegexes);
        return matches = [
          {
            matchText: 'fixme #1',
            relativePath: 'file1.txt',
            title: 'FIXMEs',
            range: [[3, 6], [3, 10]]
          }, {
            matchText: 'todo #1',
            relativePath: 'file1.txt',
            title: 'TODOs',
            range: [[4, 5], [4, 9]]
          }, {
            matchText: 'fixme #2',
            relativePath: 'file2.txt',
            title: 'FIXMEs',
            range: [[5, 7], [5, 11]]
          }
        ];
      });
      it('creates a markdown string from regexes', function() {
        var markdown;
        markdown = '\n## FIXMEs\n\n- fixme #1 `file1.txt` `:4`\n- fixme #2 `file2.txt` `:6`\n';
        markdown += '\n## TODOs\n\n- todo #1 `file1.txt` `:5`\n';
        return expect(showTodoView.getMarkdown(matches)).toEqual(markdown);
      });
      it('creates markdown with file grouping', function() {
        var markdown;
        atom.config.set('todo-show.groupMatchesBy', 'file');
        markdown = '\n## file1.txt\n\n- fixme #1 `FIXMEs`\n- todo #1 `TODOs`\n';
        markdown += '\n## file2.txt\n\n- fixme #2 `FIXMEs`\n';
        return expect(showTodoView.getMarkdown(matches)).toEqual(markdown);
      });
      it('creates markdown with non grouping', function() {
        var markdown;
        atom.config.set('todo-show.groupMatchesBy', 'none');
        markdown = '\n## All Matches\n\n- fixme #1 _(FIXMEs)_ `file1.txt` `:4`';
        markdown += '\n- fixme #2 _(FIXMEs)_ `file2.txt` `:6`\n- todo #1 _(TODOs)_ `file1.txt` `:5`\n';
        return expect(showTodoView.getMarkdown(matches)).toEqual(markdown);
      });
      it('accepts missing ranges and paths in regexes', function() {
        var markdown;
        matches = [
          {
            matchText: 'fixme #1',
            title: 'FIXMEs'
          }
        ];
        markdown = '\n## FIXMEs\n\n- fixme #1\n';
        expect(showTodoView.getMarkdown(matches)).toEqual(markdown);
        atom.config.set('todo-show.groupMatchesBy', 'file');
        markdown = '\n## Unknown File\n\n- fixme #1 `FIXMEs`\n';
        expect(showTodoView.getMarkdown(matches)).toEqual(markdown);
        atom.config.set('todo-show.groupMatchesBy', 'none');
        markdown = '\n## All Matches\n\n- fixme #1 _(FIXMEs)_\n';
        return expect(showTodoView.getMarkdown(matches)).toEqual(markdown);
      });
      return it('accepts missing title in regexes', function() {
        var markdown;
        matches = [
          {
            matchText: 'fixme #1',
            relativePath: 'file1.txt'
          }
        ];
        markdown = '\n## No Title\n\n- fixme #1 `file1.txt`\n';
        expect(showTodoView.getMarkdown(matches)).toEqual(markdown);
        atom.config.set('todo-show.groupMatchesBy', 'file');
        markdown = '\n## file1.txt\n\n- fixme #1\n';
        expect(showTodoView.getMarkdown(matches)).toEqual(markdown);
        atom.config.set('todo-show.groupMatchesBy', 'none');
        markdown = '\n## All Matches\n\n- fixme #1 `file1.txt`\n';
        return expect(showTodoView.getMarkdown(matches)).toEqual(markdown);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy90b2RvLXNob3cvc3BlYy9zaG93LXRvZG8tdmlldy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrQkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHVCQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUywrQ0FBVCxFQUEwRCxTQUFBLEdBQUE7QUFDeEQsUUFBQSxpREFBQTtBQUFBLElBQUEsT0FBZ0QsRUFBaEQsRUFBQyxzQkFBRCxFQUFlLHdCQUFmLEVBQStCLHVCQUEvQixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxjQUFBLEdBQWlCLENBQ2YsUUFEZSxFQUVmLDZCQUZlLEVBR2YsT0FIZSxFQUlmLDRCQUplLENBQWpCLENBQUE7QUFBQSxNQU1BLGFBQUEsR0FDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGNBQWUsQ0FBQSxDQUFBLENBQXRCO0FBQUEsUUFDQSxLQUFBLEVBQU8sY0FBZSxDQUFBLENBQUEsQ0FEdEI7T0FQRixDQUFBO0FBQUEsTUFVQSxZQUFBLEdBQW1CLElBQUEsWUFBQSxDQUFhLFdBQWIsQ0FWbkIsQ0FBQTtBQUFBLE1BV0EsWUFBWSxDQUFDLE9BQWIsR0FBdUIsRUFYdkIsQ0FBQTthQVlBLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFzQixDQUFDLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixrQkFBckIsQ0FBRCxDQUF0QixFQWJTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQWlCQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO2FBQ3JDLEVBQUEsQ0FBRywwRUFB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

//# sourceURL=/Users/mk2/.atom/packages/todo-show/spec/show-todo-view-spec.coffee
