(function() {
  var AFTERPROPS, AutoIndent, BRACE_CLOSE, BRACE_OPEN, CompositeDisposable, File, JSXBRACE_CLOSE, JSXBRACE_OPEN, JSXTAG_CLOSE, JSXTAG_CLOSE_ATTRS, JSXTAG_OPEN, JSXTAG_SELFCLOSE_END, JSXTAG_SELFCLOSE_START, LINEALIGNED, NO_TOKEN, PROPSALIGNED, Point, Range, TAGALIGNED, TERNARY_ELSE, TERNARY_IF, YAML, autoCompleteJSX, fs, path, stripJsonComments, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, File = _ref.File, Range = _ref.Range, Point = _ref.Point;

  fs = require('fs-plus');

  path = require('path');

  autoCompleteJSX = require('./auto-complete-jsx');

  stripJsonComments = require('strip-json-comments');

  YAML = require('js-yaml');

  NO_TOKEN = 0;

  JSXTAG_SELFCLOSE_START = 1;

  JSXTAG_SELFCLOSE_END = 2;

  JSXTAG_OPEN = 3;

  JSXTAG_CLOSE_ATTRS = 4;

  JSXTAG_CLOSE = 5;

  JSXBRACE_OPEN = 6;

  JSXBRACE_CLOSE = 7;

  BRACE_OPEN = 8;

  BRACE_CLOSE = 9;

  TERNARY_IF = 10;

  TERNARY_ELSE = 11;

  TAGALIGNED = 'tag-aligned';

  LINEALIGNED = 'line-aligned';

  AFTERPROPS = 'after-props';

  PROPSALIGNED = 'props-aligned';

  module.exports = AutoIndent = (function() {
    function AutoIndent(editor) {
      this.editor = editor;
      this.changedCursorPosition = __bind(this.changedCursorPosition, this);
      this.eslintIndentOptions = {
        jsxClosingBracketLocation: [
          1, {
            selfClosing: TAGALIGNED,
            nonEmpty: TAGALIGNED
          }
        ],
        jsxIndent: [1, 1],
        jsxIndentProps: [1, 1],
        indent: [1, 1]
      };
      this.JSXREGEXP = /(<)([$_A-Za-z](?:[$_.:\-A-Za-z0-9])*)|(\/>)|(<\/)([$_A-Za-z](?:[$._:\-A-Za-z0-9])*)(>)|(>)|({)|(})|(\?)|(:)/g;
      this.autoJsx = true;
      this.mouseUp = true;
      this.multipleCursorTrigger = 1;
      this.disposables = new CompositeDisposable();
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'language-babel:auto-indent-react-jsx': (function(_this) {
          return function(event) {
            return _this.autoIndentJsxCommand();
          };
        })(this)
      }));
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'language-babel:toggle-auto-indent-jsx': (function(_this) {
          return function(event) {
            return _this.autoJsx = !_this.autoJsx;
          };
        })(this)
      }));
      document.addEventListener('mousedown', (function(_this) {
        return function() {
          return _this.mouseUp = false;
        };
      })(this));
      document.addEventListener('mouseup', (function(_this) {
        return function() {
          return _this.mouseUp = true;
        };
      })(this));
      this.disposables.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function(event) {
          return _this.changedCursorPosition(event);
        };
      })(this)));
      this.disposables.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          return _this.didStopChanging();
        };
      })(this)));
      this.atomTabLength = this.editor.getTabLength();
      if (this.eslintrcFilename = this.getEslintrcFilename()) {
        this.eslintrcFilename = new File(this.eslintrcFilename);
        this.getEslintrcOptions(this.eslintrcFilename.getPath());
        this.disposables.add(this.eslintrcFilename.onDidChange((function(_this) {
          return function() {
            return _this.getEslintrcOptions(_this.eslintrcFilename.getPath());
          };
        })(this)));
      }
    }

    AutoIndent.prototype.destroy = function() {
      this.disposables.dispose();
      document.removeEventListener('mousedown');
      return document.removeEventListener('mouseup');
    };

    AutoIndent.prototype.autoIndentJsxCommand = function() {
      var bufferRow, cursorPosition, endPointOfJsx, startPointOfJsx;
      cursorPosition = this.editor.getCursorBufferPosition();
      bufferRow = cursorPosition.row;
      if (!this.jsxInScope(bufferRow)) {
        return;
      }
      endPointOfJsx = new Point(bufferRow, 0);
      startPointOfJsx = autoCompleteJSX.getStartOfJSX(this.editor, cursorPosition);
      return this.editor.transact(300, (function(_this) {
        return function() {
          return _this.indentJSX(new Range(startPointOfJsx, endPointOfJsx));
        };
      })(this));
    };

    AutoIndent.prototype.changedCursorPosition = function(event) {
      var bufferRow, columnToMoveTo, cursorPosition, cursorPositions, endPointOfJsx, startPointOfJsx, _i, _len, _ref1;
      if (!this.mouseUp) {
        return;
      }
      if (event.oldBufferPosition.row === event.newBufferPosition.row) {
        return;
      }
      if (!this.autoJsx) {
        return;
      }
      bufferRow = event.newBufferPosition.row;
      if (this.editor.hasMultipleCursors()) {
        cursorPositions = this.editor.getCursorBufferPositions();
        if (cursorPositions.length === this.multipleCursorTrigger) {
          this.multipleCursorTrigger = 1;
          bufferRow = 0;
          for (_i = 0, _len = cursorPositions.length; _i < _len; _i++) {
            cursorPosition = cursorPositions[_i];
            if (cursorPosition.row > bufferRow) {
              bufferRow = cursorPosition.row;
            }
          }
        } else {
          this.multipleCursorTrigger++;
          return;
        }
      } else {
        cursorPosition = event.newBufferPosition;
      }
      if (!this.jsxInScope(bufferRow)) {
        return;
      }
      endPointOfJsx = new Point(bufferRow + 1, 0);
      startPointOfJsx = autoCompleteJSX.getStartOfJSX(this.editor, cursorPosition);
      this.editor.transact(300, (function(_this) {
        return function() {
          return _this.indentJSX(new Range(startPointOfJsx, endPointOfJsx));
        };
      })(this));
      columnToMoveTo = (_ref1 = /^\s*$/.exec(this.editor.lineTextForBufferRow(bufferRow))) != null ? _ref1[0].length : void 0;
      if (columnToMoveTo != null) {
        return this.editor.setCursorBufferPosition([bufferRow, columnToMoveTo]);
      }
    };

    AutoIndent.prototype.didStopChanging = function() {
      var endPointOfJsx, highestRow, scope, selectedRange, startPointOfJsx;
      if (!this.autoJsx) {
        return;
      }
      selectedRange = this.editor.getSelectedBufferRange();
      highestRow = Math.max(selectedRange.start.row, selectedRange.end.row);
      if (highestRow !== this.highestSelectedRow) {
        this.highestSelectedRow = highestRow;
        scope = this.editor.scopeDescriptorForBufferPosition([highestRow, 0]).getScopesArray();
        if (__indexOf.call(scope, 'meta.tag.jsx') >= 0) {
          endPointOfJsx = new Point(highestRow, 0);
          startPointOfJsx = autoCompleteJSX.getStartOfJSX(this.editor, endPointOfJsx);
          return this.editor.transact(300, (function(_this) {
            return function() {
              return _this.indentJSX(new Range(startPointOfJsx, endPointOfJsx));
            };
          })(this));
        }
      }
    };

    AutoIndent.prototype.jsxInScope = function(bufferRow) {
      var scopes;
      scopes = this.editor.scopeDescriptorForBufferPosition([bufferRow, 0]).getScopesArray();
      return __indexOf.call(scopes, 'meta.tag.jsx') >= 0;
    };

    AutoIndent.prototype.indentJSX = function(range) {
      var firstCharIndentation, firstTagInLineIndentation, idxOfToken, indent, indentRecalc, isFirstTagOfBlock, isFirstTokenOfLine, line, match, matchColumn, matchPointEnd, matchPointStart, matchRange, parentTokenIdx, row, stackOfTokensStillOpen, tagIndentation, token, tokenOnThisLine, tokenStack, _i, _ref1, _ref2, _results;
      tokenStack = [];
      idxOfToken = 0;
      stackOfTokensStillOpen = [];
      indent = 0;
      isFirstTagOfBlock = true;
      this.JSXREGEXP.lastIndex = 0;
      _results = [];
      for (row = _i = _ref1 = range.start.row, _ref2 = range.end.row; _ref1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; row = _ref1 <= _ref2 ? ++_i : --_i) {
        isFirstTokenOfLine = true;
        tokenOnThisLine = false;
        indentRecalc = false;
        line = this.editor.lineTextForBufferRow(row);
        while ((match = this.JSXREGEXP.exec(line)) !== null) {
          matchColumn = match.index;
          matchPointStart = new Point(row, matchColumn);
          matchPointEnd = new Point(row, matchColumn + match[0].length - 1);
          matchRange = new Range(matchPointStart, matchPointEnd);
          if (!(token = this.getToken(row, match))) {
            continue;
          }
          firstCharIndentation = this.editor.indentationForBufferRow(row);
          if (this.editor.getSoftTabs()) {
            tagIndentation = matchColumn / this.atomTabLength;
          } else {
            tagIndentation = (function() {
              var hardTabsFound, i, _j;
              hardTabsFound = 0;
              for (i = _j = 0; 0 <= matchColumn ? _j < matchColumn : _j > matchColumn; i = 0 <= matchColumn ? ++_j : --_j) {
                hardTabsFound += (line.substr(i, 1)) === '\t';
              }
              return hardTabsFound;
            })();
          }
          if (isFirstTokenOfLine) {
            firstTagInLineIndentation = tagIndentation;
          }
          switch (token) {
            case JSXTAG_OPEN:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (isFirstTagOfBlock && (parentTokenIdx != null) && tokenStack[parentTokenIdx].type === BRACE_OPEN && tokenStack[parentTokenIdx].row === (row - 1)) {
                  tagIndentation = firstCharIndentation = firstTagInLineIndentation = this.getEslintIndent() + this.getIndentOfPreviousRow(row);
                  indentRecalc = this.indentRow({
                    row: row
                  }, firstCharIndentation);
                } else if (isFirstTagOfBlock && (parentTokenIdx != null)) {
                  indentRecalc = this.indentRow({
                    row: row
                  }, this.getIndentOfPreviousRow(row), 1);
                } else if (parentTokenIdx != null) {
                  indentRecalc = this.indentRow({
                    row: row
                  }, tokenStack[parentTokenIdx].firstCharIndentation, 1);
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              isFirstTagOfBlock = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: JSXTAG_OPEN,
                name: match[2],
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tagIndentation: tagIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case JSXTAG_CLOSE:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                indentRecalc = this.indentRow({
                  row: row
                }, tokenStack[parentTokenIdx].firstCharIndentation);
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              isFirstTagOfBlock = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              tokenStack.push({
                type: JSXTAG_CLOSE,
                name: match[5],
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case JSXTAG_SELFCLOSE_END:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (firstTagInLineIndentation === firstCharIndentation) {
                  indentRecalc = this.indentForClosingBracket(row, tokenStack[parentTokenIdx], this.eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing);
                } else {
                  indentRecalc = this.indentRow({
                    row: row
                  }, tokenStack[parentTokenIdx].firstTagInLineIndentation, 0, 1);
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = false;
              isFirstTokenOfLine = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              tokenStack.push({
                type: JSXTAG_SELFCLOSE_END,
                name: tokenStack[parentTokenIdx].name,
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagsAttributesIdx = idxOfToken;
                tokenStack[parentTokenIdx].type = JSXTAG_SELFCLOSE_START;
                tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case JSXTAG_CLOSE_ATTRS:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (firstTagInLineIndentation === firstCharIndentation) {
                  indentRecalc = this.indentForClosingBracket(row, tokenStack[parentTokenIdx], this.eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty);
                } else {
                  indentRecalc = this.indentRow({
                    row: row
                  }, tokenStack[parentTokenIdx].firstTagInLineIndentation, 0, 1);
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = false;
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: JSXTAG_CLOSE_ATTRS,
                name: tokenStack[parentTokenIdx].name,
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagsAttributesIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case JSXBRACE_OPEN:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (parentTokenIdx != null) {
                  indentRecalc = this.indentRow({
                    row: row
                  }, tokenStack[parentTokenIdx].firstCharIndentation, 1);
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = true;
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: JSXBRACE_OPEN,
                name: '',
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tagIndentation: tagIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case JSXBRACE_CLOSE:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                indentRecalc = this.indentRow({
                  row: row,
                  allowAdditionalIndents: false
                }, tokenStack[parentTokenIdx].firstCharIndentation);
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTagOfBlock = false;
              isFirstTokenOfLine = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              tokenStack.push({
                type: JSXBRACE_CLOSE,
                name: '',
                row: row,
                parentTokenIdx: parentTokenIdx
              });
              if (parentTokenIdx >= 0) {
                tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
              }
              idxOfToken++;
              break;
            case BRACE_OPEN:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (isFirstTagOfBlock && (parentTokenIdx != null) && tokenStack[parentTokenIdx].type === BRACE_OPEN && tokenStack[parentTokenIdx].row === (row - 1)) {
                  tagIndentation = firstCharIndentation = this.getEslintIndent() + this.getIndentOfPreviousRow(row);
                  indentRecalc = this.indentRow({
                    row: row
                  }, firstCharIndentation);
                } else if (parentTokenIdx != null) {
                  indentRecalc = this.indentRow({
                    row: row
                  }, tokenStack[parentTokenIdx].firstCharIndentation, 1);
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
              tokenStack.push({
                type: BRACE_OPEN,
                name: '',
                row: row,
                firstTagInLineIndentation: firstTagInLineIndentation,
                tagIndentation: tagIndentation,
                firstCharIndentation: firstCharIndentation,
                parentTokenIdx: parentTokenIdx,
                termsThisTagsAttributesIdx: null,
                termsThisTagIdx: null
              });
              stackOfTokensStillOpen.push(idxOfToken);
              idxOfToken++;
              break;
            case BRACE_CLOSE:
              tokenOnThisLine = true;
              if (isFirstTokenOfLine) {
                stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
                if (parentTokenIdx != null) {
                  indentRecalc = this.indentRow({
                    row: row,
                    allowAdditionalIndents: false
                  }, tokenStack[parentTokenIdx].firstCharIndentation);
                }
              }
              if (indentRecalc) {
                line = this.editor.lineTextForBufferRow(row);
                this.JSXREGEXP.lastIndex = 0;
                continue;
              }
              isFirstTokenOfLine = false;
              parentTokenIdx = stackOfTokensStillOpen.pop();
              if (parentTokenIdx != null) {
                tokenStack.push({
                  type: BRACE_CLOSE,
                  name: '',
                  row: row,
                  parentTokenIdx: parentTokenIdx
                });
                if (parentTokenIdx >= 0) {
                  tokenStack[parentTokenIdx].termsThisTagIdx = idxOfToken;
                }
                idxOfToken++;
              }
              break;
            case TERNARY_IF:
            case TERNARY_ELSE:
              isFirstTagOfBlock = true;
          }
        }
        if (idxOfToken && !tokenOnThisLine && row !== range.end.row) {
          _results.push(this.indentUntokenisedLine(row, tokenStack, stackOfTokensStillOpen));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    AutoIndent.prototype.indentUntokenisedLine = function(row, tokenStack, stackOfTokensStillOpen) {
      var parentTokenIdx, token;
      stackOfTokensStillOpen.push(parentTokenIdx = stackOfTokensStillOpen.pop());
      token = tokenStack[parentTokenIdx];
      switch (token.type) {
        case JSXTAG_SELFCLOSE_START:
        case JSXTAG_OPEN:
        case JSXBRACE_OPEN:
          return this.indentRow({
            row: row,
            allowAdditionalIndents: false
          }, token.firstCharIndentation, 0, 1);
        case BRACE_OPEN:
          return this.indentRow({
            row: row,
            allowAdditionalIndents: false
          }, token.firstCharIndentation + this.getEslintIndent());
        case JSXTAG_SELFCLOSE_END:
        case JSXBRACE_CLOSE:
        case JSXTAG_CLOSE_ATTRS:
          return this.indentRow({
            row: row,
            allowAdditionalIndents: false
          }, tokenStack[token.parentTokenIdx].firstCharIndentation, 0, 1);
        case BRACE_CLOSE:
          return this.indentRow({
            row: row,
            allowAdditionalIndents: false
          }, tokenStack[token.parentTokenIdx].firstCharIndentation + this.getEslintIndent());
      }
    };

    AutoIndent.prototype.getToken = function(bufferRow, match) {
      var scope;
      scope = this.editor.scopeDescriptorForBufferPosition([bufferRow, match.index]).getScopesArray().pop();
      if ('punctuation.definition.tag.jsx' === scope) {
        if (match[1] != null) {
          return JSXTAG_OPEN;
        } else if (match[3] != null) {
          return JSXTAG_SELFCLOSE_END;
        }
      } else if ('JSXEndTagStart' === scope) {
        if (match[4] != null) {
          return JSXTAG_CLOSE;
        }
      } else if ('JSXStartTagEnd' === scope) {
        if (match[7] != null) {
          return JSXTAG_CLOSE_ATTRS;
        }
      } else if (match[8] != null) {
        if ('punctuation.section.embedded.begin.jsx' === scope) {
          return JSXBRACE_OPEN;
        } else if ('meta.brace.curly.js' === scope) {
          return BRACE_OPEN;
        }
      } else if (match[9] != null) {
        if ('punctuation.section.embedded.end.jsx' === scope) {
          return JSXBRACE_CLOSE;
        } else if ('meta.brace.curly.js' === scope) {
          return BRACE_CLOSE;
        }
      } else if (match[10] != null) {
        if ('keyword.operator.ternary.js' === scope) {
          return TERNARY_IF;
        }
      } else if (match[11] != null) {
        if ('keyword.operator.ternary.js' === scope) {
          return TERNARY_ELSE;
        }
      }
      return NO_TOKEN;
    };

    AutoIndent.prototype.getIndentOfPreviousRow = function(row) {
      var line, _i, _ref1;
      if (!row) {
        return 0;
      }
      for (row = _i = _ref1 = row - 1; _ref1 <= 0 ? _i < 0 : _i > 0; row = _ref1 <= 0 ? ++_i : --_i) {
        line = this.editor.lineTextForBufferRow(row);
        if (/.*\S/.test(line)) {
          return this.editor.indentationForBufferRow(row);
        }
      }
      return 0;
    };

    AutoIndent.prototype.getEslintrcFilename = function() {
      var projectContainingSource;
      projectContainingSource = atom.project.relativizePath(this.editor.getPath());
      if (projectContainingSource[0] != null) {
        return path.join(projectContainingSource[0], '.eslintrc');
      }
    };

    AutoIndent.prototype.getEslintrcOptions = function(eslintrcFile) {
      var err, eslintRules, fileContent, rule;
      if (fs.existsSync(eslintrcFile)) {
        fileContent = stripJsonComments(fs.readFileSync(eslintrcFile, 'utf8'));
        try {
          eslintRules = (YAML.safeLoad(fileContent)).rules;
        } catch (_error) {
          err = _error;
          atom.notifications.addError("LB: Error reading .eslintrc at " + eslintrcFile, {
            dismissable: true,
            detail: "" + err.message
          });
          return;
        }
        if (eslintRules == null) {
          return;
        }
        rule = eslintRules['indent'];
        if (typeof rule === 'number') {
          this.eslintIndentOptions.indent[0] = rule;
          this.eslintIndentOptions.indent[1] = 4 / this.atomTabLength;
        } else if (typeof rule === 'object') {
          this.eslintIndentOptions.indent[0] = rule[0];
          if (typeof rule[1] === 'number') {
            this.eslintIndentOptions.indent[1] = rule[1] / this.atomTabLength;
          } else {
            this.eslintIndentOptions.indent[1] = 1;
          }
        }
        rule = eslintRules['react/jsx-indent'];
        if (typeof rule === 'number') {
          this.eslintIndentOptions.jsxIndent[0] = rule;
          this.eslintIndentOptions.jsxIndent[1] = 4 / this.atomTabLength;
        } else if (typeof rule === 'object') {
          this.eslintIndentOptions.jsxIndent[0] = rule[0];
          if (typeof rule[1] === 'number') {
            this.eslintIndentOptions.jsxIndent[1] = rule[1] / this.atomTabLength;
          } else {
            this.eslintIndentOptions.jsxIndent[1] = 1;
          }
        }
        rule = eslintRules['react/jsx-indent-props'];
        if (typeof rule === 'number') {
          this.eslintIndentOptions.jsxIndentProps[0] = rule;
          this.eslintIndentOptions.jsxIndentProps[1] = 4 / this.atomTabLength;
        } else if (typeof rule === 'object') {
          this.eslintIndentOptions.jsxIndentProps[0] = rule[0];
          if (typeof rule[1] === 'number') {
            this.eslintIndentOptions.jsxIndentProps[1] = rule[1] / this.atomTabLength;
          } else {
            this.eslintIndentOptions.jsxIndentProps[1] = 1;
          }
        }
        rule = eslintRules['react/jsx-closing-bracket-location'];
        this.eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing = TAGALIGNED;
        this.eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty = TAGALIGNED;
        if (typeof rule === 'number') {
          return this.eslintIndentOptions.jsxClosingBracketLocation[0] = rule;
        } else if (typeof rule === 'object') {
          this.eslintIndentOptions.jsxClosingBracketLocation[0] = rule[0];
          if (typeof rule[1] === 'string') {
            return this.eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing = this.eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty = rule[1];
          } else {
            if (rule[1].selfClosing != null) {
              this.eslintIndentOptions.jsxClosingBracketLocation[1].selfClosing = rule[1].selfClosing;
            }
            if (rule[1].nonEmpty != null) {
              return this.eslintIndentOptions.jsxClosingBracketLocation[1].nonEmpty = rule[1].nonEmpty;
            }
          }
        }
      }
    };

    AutoIndent.prototype.getEslintIndent = function() {
      var jsIndent;
      if (this.eslintIndentOptions.indent[0]) {
        jsIndent = this.eslintIndentOptions.indent[1];
      } else {
        jsIndent = 0;
      }
      return jsIndent;
    };

    AutoIndent.prototype.indentForClosingBracket = function(row, parentTag, closingBracketRule) {
      if (this.eslintIndentOptions.jsxClosingBracketLocation[0]) {
        if (closingBracketRule === TAGALIGNED) {
          return this.indentRow({
            row: row
          }, parentTag.tagIndentation);
        } else if (closingBracketRule === LINEALIGNED) {
          return this.indentRow({
            row: row
          }, parentTag.firstCharIndentation);
        } else if (closingBracketRule === AFTERPROPS) {
          if (this.eslintIndentOptions.jsxIndentProps[0]) {
            return this.indentRow({
              row: row
            }, parentTag.tagIndentation, this.eslintIndentOptions.jsxIndentProps[1]);
          } else {
            return this.indentRow({
              row: row
            }, parentTag.tagIndentation);
          }
        } else if (closingBracketRule === PROPSALIGNED) {
          if (this.eslintIndentOptions.jsxIndentProps[0]) {
            return this.indentRow({
              row: row
            }, parentTag.firstTagInLineIndentation, 0, 1);
          } else {
            return this.indentRow({
              row: row
            }, parentTag.firstTagInLineIndentation);
          }
        }
      }
    };

    AutoIndent.prototype.indentRow = function(options, jsxBlockIndent, jsxTagIndent, jsxPropsIndent) {
      var allowAdditionalIndents, jsxIndentTabs, row, _ref1;
      row = options.row;
      allowAdditionalIndents = (_ref1 = options.allowAdditionalIndents) != null ? _ref1 : false;
      jsxIndentTabs = jsxBlockIndent;
      if (jsxTagIndent) {
        if (this.eslintIndentOptions.jsxIndent[0]) {
          if (this.eslintIndentOptions.jsxIndent[1]) {
            jsxIndentTabs += jsxTagIndent * this.eslintIndentOptions.jsxIndent[1];
          }
        }
      }
      if (jsxPropsIndent) {
        if (this.eslintIndentOptions.jsxIndentProps[0]) {
          if (this.eslintIndentOptions.jsxIndentProps[1]) {
            jsxIndentTabs += jsxPropsIndent * this.eslintIndentOptions.jsxIndentProps[1];
          }
        }
      }
      if (allowAdditionalIndents) {
        if (this.editor.indentationForBufferRow(row) < jsxIndentTabs) {
          this.editor.setIndentationForBufferRow(row, jsxIndentTabs, {
            preserveLeadingWhitespace: false
          });
          return true;
        }
      } else {
        if (this.editor.indentationForBufferRow(row) !== jsxIndentTabs) {
          this.editor.setIndentationForBufferRow(row, jsxIndentTabs, {
            preserveLeadingWhitespace: false
          });
          return true;
        }
      }
      return false;
    };

    return AutoIndent;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9sYW5ndWFnZS1iYWJlbC9saWIvYXV0by1pbmRlbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlWQUFBO0lBQUE7eUpBQUE7O0FBQUEsRUFBQSxPQUE0QyxPQUFBLENBQVEsTUFBUixDQUE1QyxFQUFDLDJCQUFBLG1CQUFELEVBQXNCLFlBQUEsSUFBdEIsRUFBNEIsYUFBQSxLQUE1QixFQUFtQyxhQUFBLEtBQW5DLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUdBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSLENBSGxCLENBQUE7O0FBQUEsRUFJQSxpQkFBQSxHQUFvQixPQUFBLENBQVEscUJBQVIsQ0FKcEIsQ0FBQTs7QUFBQSxFQUtBLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUixDQUxQLENBQUE7O0FBQUEsRUFRQSxRQUFBLEdBQTBCLENBUjFCLENBQUE7O0FBQUEsRUFTQSxzQkFBQSxHQUEwQixDQVQxQixDQUFBOztBQUFBLEVBVUEsb0JBQUEsR0FBMEIsQ0FWMUIsQ0FBQTs7QUFBQSxFQVdBLFdBQUEsR0FBMEIsQ0FYMUIsQ0FBQTs7QUFBQSxFQVlBLGtCQUFBLEdBQTBCLENBWjFCLENBQUE7O0FBQUEsRUFhQSxZQUFBLEdBQTBCLENBYjFCLENBQUE7O0FBQUEsRUFjQSxhQUFBLEdBQTBCLENBZDFCLENBQUE7O0FBQUEsRUFlQSxjQUFBLEdBQTBCLENBZjFCLENBQUE7O0FBQUEsRUFnQkEsVUFBQSxHQUEwQixDQWhCMUIsQ0FBQTs7QUFBQSxFQWlCQSxXQUFBLEdBQTBCLENBakIxQixDQUFBOztBQUFBLEVBa0JB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

//# sourceURL=/Users/mk2/.atom/packages/language-babel/lib/auto-indent.coffee
