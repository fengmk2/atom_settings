var Parsers = {
  JsParser: require("./languages/javascript"),
  CppParser: require("./languages/cpp"),
  RustParser: require("./languages/rust"),
  PhpParser: require("./languages/php"),
  CoffeeParser: require("./languages/coffee"),
  ActionscriptParser: require("./languages/actionscript"),
  ObjCParser: require("./languages/objc"),
  JavaParser: require("./languages/java"),
  TypescriptParser: require("./languages/typescript") };

var escape = require("./utils").escape;
var util = require("util");
//var Snippets = atom.packages.activePackages.snippets.mainModule;

var DocBlockrAtom;
module.exports = DocBlockrAtom = (function () {

  function DocBlockrAtom() {
    var self = this;
    var settings = atom.config.get("docblockr");
    this.editor_settings = settings;

    atom.config.observe("docblockr", function () {
      self.update_config();
    });

    atom.commands.add("atom-workspace", "docblockr:parse-tab", function (event) {
      var regex = {
        // Parse Command
        "parse": /^\s*(\/\*|###)[*!]\s*$/,
        // Indent Command
        "indent": /^\s*\*\s*$/
      };

      // Parse Command
      if (self.validate_request({ preceding: true, preceding_regex: regex.parse })) {
        // console.log('Parse command');
        self.parse_command(false);
      }

      // Indent Command
      else if (self.validate_request({ preceding: true, preceding_regex: regex.indent })) {
        // console.log('Indent command');
        self.indent_command();
      } else event.abortKeyBinding();
    });

    atom.commands.add("atom-workspace", "docblockr:parse-enter", function (event) {
      var regex = {
        // Parse Command
        "parse": /^\s*(\/\*|###)[*!]\s*$/,
        // Trim auto whitespace
        "trim_auto": [/^\s*\*\s*$/, /^\s*$/],
        // Deindent Command
        "deindent": /^\s+\*\//,
        // Snippet-1
        "snippet_1": [/^\s*\/\*$/, /^\*\/\s*$/],
        // Close block comment
        "close_block": /^\s*\/\*$/,
        // extend line
        "extend_line": /^\s*(\/\/[\/!]?|#)/,
        // Extend docblock by adding an asterix at start
        "extend": /^\s*\*/ };

      // Parse Command
      if (self.validate_request({ preceding: true, preceding_regex: regex.parse })) {
        // console.log('Parse command');
        self.parse_command(false);
      }
      // Trim auto whitespace
      else if (self.validate_request({ preceding: true, preceding_regex: regex.trim_auto[0], following: true, following_regex: regex.trim_auto[1], scope: "comment.block" })) {
        // console.log('Auto Trim command');
        self.trim_auto_whitespace_command();
      }
      // Deindent command
      else if (self.validate_request({ preceding: true, preceding_regex: regex.deindent })) {
        // console.log('Deindent command');
        self.deindent_command();
      } else if (self.validate_request({ preceding: true, preceding_regex: regex.snippet_1[0], following: true, following_regex: regex.snippet_1[1] })) {
        // console.log('Snippet-1 command');
        var editor = atom.workspace.getActiveTextEditor();
        self.write(editor, "\n$0\n ");
      }
      // Close block comment
      else if (self.validate_request({ preceding: true, preceding_regex: regex.close_block })) {
        // console.log('Snippet close block comment command');
        var editor = atom.workspace.getActiveTextEditor();
        self.write(editor, "\n$0\n */");
      }
      // extend line comments (// and #)
      else if (self.editor_settings.extend_double_slash == true && self.validate_request({ preceding: true, preceding_regex: regex.extend_line, scope: "comment.line" })) {
        // console.log('Snippet Extend line command');
        var _regex = /^(\s*(?:#|\/\/[\/!]?)\s*).*$/;
        var editor = atom.workspace.getActiveTextEditor();
        var cursor_position = editor.getCursorBufferPosition();
        var line_text = editor.lineTextForBufferRow(cursor_position.row);
        line_text = line_text.replace(_regex, "$1");
        editor.insertText("\n" + line_text);
      }
      // Extend docblock by adding an asterix at start
      else if (self.validate_request({ preceding: true, preceding_regex: regex.extend, scope: "comment.block" })) {
        // console.log('Snippet Extend command');
        var _regex = /^(\s*\*\s*).*$/;
        var editor = atom.workspace.getActiveTextEditor();
        var cursor_position = editor.getCursorBufferPosition();
        var line_text = editor.lineTextForBufferRow(cursor_position.row);
        line_text = line_text.replace(_regex, "$1");
        editor.insertText("\n" + line_text);
      } else event.abortKeyBinding();
    });

    atom.commands.add("atom-workspace", "docblockr:parse-inline", function (event) {
      // console.log('Parse-Inline command');
      var _regex = /^\s*\/\*{2}$/;

      if (self.validate_request({ preceding: true, preceding_regex: _regex })) self.parse_command(true);else {
        var editor = atom.workspace.getActiveTextEditor();
        editor.insertNewline();
        //event.abortKeyBinding();
      }
    });

    atom.commands.add("atom-workspace", "docblockr:join", function (event) {
      // console.log('Join command');
      if (self.validate_request({ scope: "comment.block" })) self.join_command();
    });

    atom.commands.add("atom-workspace", "docblockr:reparse", function (event) {
      // console.log('Reparse command');
      if (self.validate_request({ scope: "comment.block" })) self.reparse_command();
    });

    atom.commands.add("atom-workspace", "docblockr:wrap-lines", function (event) {
      // console.log('Wraplines command');
      if (self.validate_request({ scope: "comment.block" })) self.wrap_lines_command();
    });

    atom.commands.add("atom-workspace", "docblockr:decorate", function (event) {
      // console.log('Decorate command');
      if (self.validate_request({ scope: "comment.line.double-slash" })) self.decorate_command();
    });

    atom.commands.add("atom-workspace", "docblockr:decorate-multiline", function (event) {
      // console.log('Decorate Multiline command');
      if (self.validate_request({ scope: "comment.block" })) self.decorate_multiline_command();
    });
  }

  DocBlockrAtom.prototype.update_config = function () {
    var settings = atom.config.get("docblockr");
    this.editor_settings = settings;
  };

  /**
   * Validate the keypress request
   * @param  {Boolean}  preceding        Check against regex if true
   * @param  {Regex}    preceding_regex  Regex to check preceding text against
   * @param  {Boolean}  following        Check against regex if true
   * @param  {Regex}    following_regex  Regex to check following text against
   * @param  {String}   scope            Check if cursor matches scope
   */
  DocBlockrAtom.prototype.validate_request = function (options) {
    /**
     *  Multiple cursor behaviour:
     *   1. Add mulitple snippets dependent on cursor pos, this makes traversing
     *        snippets not possible
     *   2. So we will iterate over the cursors and find the first among the cursors
     *        that satisfies the regex, the rest of the cursors will be deleted.
     */

    options = typeof options !== "undefined" ? options : {};

    var preceding = typeof options.preceding !== "undefined" ? options.preceding : false;
    var preceding_regex = typeof options.preceding_regex !== "undefined" ? options.preceding_regex : "";
    var following = typeof options.following !== "undefined" ? options.following : false;
    var following_regex = typeof options.following_regex !== "undefined" ? options.following_regex : "";
    var scope = typeof options.scope !== "undefined" ? options.scope : false;

    var editor = atom.workspace.getActiveTextEditor();
    this.cursors = [];
    var cursor, i, len, following_text, preceding_text;

    var cursor_positions = editor.getCursors();

    for (i = 0, len = cursor_positions.length; i < len; i++) {
      var cursor_position = cursor_positions[i].getBufferPosition();

      if (scope) {
        var scope_list = editor.scopeDescriptorForBufferPosition(cursor_position).getScopesArray();
        var _i, _len;
        for (_i = 0; _len = scope_list.length, _i < _len; _i++) {
          if (scope_list[_i].search(scope) > -1) {
            break;
          }
        }

        if (_i === _len) {
          // scope did not succeed
          continue;
        }
      }

      if (preceding) preceding_text = editor.getTextInBufferRange([[cursor_position.row, 0], cursor_position]);

      if (following) {
        var line_length = editor.lineTextForBufferRow(cursor_position.row).length;
        var following_range = [cursor_position, [cursor_position.row, line_length]];
        following_text = editor.getTextInBufferRange(following_range);
      }

      if (preceding && following) {
        if (preceding_text.search(preceding_regex) > -1 && following_text.search(following_regex) > -1) {
          this.cursors.push(cursor_position);
          break;
        }
      } else if (preceding) {
        if (preceding_text.search(preceding_regex) > -1) {
          this.cursors.push(cursor_position);
          break;
        }
      } else if (following) {
        if (following_text.search(following_regex) > -1) {
          this.cursors.push(cursor_position);
          break;
        }
      } else if (scope) {
        /* comes here only if scope is being checked */
        return true;
      }
    }

    if (this.cursors.length > 0) {
      cursor_positions.splice(i, 1);
      cursor_positions.forEach(function (value) {
        value.destroy();
      });
      return true;
    } else return false;
  };

  DocBlockrAtom.prototype.parse_command = function (inline) {
    var editor = atom.workspace.getActiveTextEditor();
    if (typeof editor === "undefined" || editor === null) {
      return;
    }
    this.initialize(editor, inline);
    if (this.parser.is_existing_comment(this.line)) {
      this.write(editor, "\n *" + this.indentSpaces);
      return;
    }

    // erase characters in the view (will be added to the output later)
    this.erase(editor, this.trailing_range);

    // match against a function declaration.
    var out = this.parser.parse(this.line);
    var snippet = this.generate_snippet(out, inline);
    // atom doesnt currently support, snippet end by default
    // so add $0
    if (snippet.search(/\${0:/) < 0 && snippet.search(/\$0/) < 0) snippet += "$0";
    this.write(editor, snippet);
  };

  DocBlockrAtom.prototype.trim_auto_whitespace_command = function () {
    /**
     * Trim the automatic whitespace added when creating a new line in a docblock.
     */
    var editor = atom.workspace.getActiveTextEditor();
    if (typeof editor === "undefined" || editor === null) {
      return;
    }
    var cursor_position = editor.getCursorBufferPosition();
    var line_text = editor.lineTextForBufferRow(cursor_position.row);
    var line_length = editor.lineTextForBufferRow(cursor_position.row).length;
    var spaces = Math.max(0, this.editor_settings.indentation_spaces);

    var regex = /^(\s*\*)\s*$/;
    line_text = line_text.replace(regex, "$1\n$1" + this.repeat(" ", spaces));
    var range = [[cursor_position.row, 0], [cursor_position.row, line_length]];
    editor.setTextInBufferRange(range, line_text);
  };

  DocBlockrAtom.prototype.indent_command = function () {
    var editor = atom.workspace.getActiveTextEditor();
    var current_pos = editor.getCursorBufferPosition();
    var prev_line = editor.lineTextForBufferRow(current_pos.row - 1);
    var spaces = this.get_indent_spaces(editor, prev_line);

    if (spaces !== null) {
      var matches = /^(\s*\*)/.exec(prev_line);
      var to_star = matches[1].length;
      var to_insert = spaces - current_pos.column + to_star;
      if (to_insert <= 0) {
        this.write(editor, "\t");
        return;
      }
      editor.insertText(this.repeat(" ", to_insert));
    } else editor.insertText("\t");
  };

  DocBlockrAtom.prototype.join_command = function () {
    var editor = atom.workspace.getActiveTextEditor();
    var selections = editor.getSelections();
    var i, j, len, row_begin;
    var text_with_ending = function text_with_ending(row) {
      return editor.buffer.lineForRow(row) + editor.buffer.lineEndingForRow(row);
    };

    for (i = 0; len = selections.length, i < len; i++) {
      var selection = selections[i];
      var no_rows;
      var _r = selection.getBufferRowRange();
      no_rows = Math.abs(_r[0] - _r[1]); // no of rows in selection
      row_begin = Math.min(_r[0], _r[1]);
      if (no_rows === 0) {
        // exit if current line is the last one
        if (_r[0] + 1 == editor.getLastBufferRow()) continue;
        no_rows = 2;
      } else no_rows += 1;

      var text = "";
      for (j = 0; j < no_rows; j++) {
        text += text_with_ending(row_begin + j);
      }
      var regex = /[ \t]*\n[ \t]*((?:\*|\/\/[!/]?|#)[ \t]*)?/g;
      text = text.replace(regex, " ");
      var end_line_length = editor.lineTextForBufferRow(row_begin + no_rows - 1).length;
      var range = [[row_begin, 0], [row_begin + no_rows - 1, end_line_length]];
      editor.setTextInBufferRange(range, text);
    }
  };

  DocBlockrAtom.prototype.decorate_command = function () {
    var editor = atom.workspace.getActiveTextEditor();
    var pos = editor.getCursorBufferPosition();
    var whitespace_re = /^(\s*)\/\//;
    var scope_range = this.scope_range(editor, pos, "comment.line.double-slash");

    var max_len = 0;
    var _i, _len, _row, leading_ws, line_text, tab_count;
    _row = scope_range[0].row;
    _len = Math.abs(scope_range[0].row - scope_range[1].row);

    for (_i = 0; _i <= _len; _i++) {
      line_text = editor.lineTextForBufferRow(_row + _i);
      tab_count = line_text.split("\t").length - 1;

      var matches = whitespace_re.exec(line_text);
      if (matches[1] == null) leading_ws = 0;else leading_ws = matches[1].length;

      leading_ws -= tab_count;
      max_len = Math.max(max_len, editor.lineTextForBufferRow(_row + _i).length);
    }

    var line_length = max_len - leading_ws;
    leading_ws = this.repeat("\t", tab_count) + this.repeat(" ", leading_ws);
    editor.buffer.insert(scope_range[1], "\n" + leading_ws + this.repeat("/", line_length + 3) + "\n");

    for (_i = _len; _i >= 0; _i--) {
      line_text = editor.lineTextForBufferRow(_row + _i);
      var _length = editor.lineTextForBufferRow(_row + _i).length;
      var r_padding = 1 + (max_len - _length);
      var _range = [[scope_range[0].row + _i, 0], [scope_range[0].row + _i, _length]];
      editor.setTextInBufferRange(_range, leading_ws + line_text + this.repeat(" ", r_padding) + "//");
    }
    editor.buffer.insert(scope_range[0], this.repeat("/", line_length + 3) + "\n");
  };

  DocBlockrAtom.prototype.decorate_multiline_command = function () {
    var editor = atom.workspace.getActiveTextEditor();
    var pos = editor.getCursorBufferPosition();
    var whitespace_re = /^(\s*)\/\*/;
    var tab_size = atom.config.get("editor.tabLength");
    var scope_range = this.scope_range(editor, pos, "comment.block");
    var line_lengths = {};

    var max_len = 0;
    var _i, _len, _row, block_ws, leading_ws, line_text, block_tab_count, content_tab_count, matches;
    _row = scope_range[0].row;
    _len = Math.abs(scope_range[0].row - scope_range[1].row);

    // get block indent from first line
    line_text = editor.lineTextForBufferRow(_row);
    block_tab_count = line_text.split("\t").length - 1;
    matches = whitespace_re.exec(line_text);
    if (matches == null) block_ws = 0;else block_ws = matches[1].length;
    block_ws -= block_tab_count;

    // get max_len
    for (_i = 1; _i < _len; _i++) {
      var text_length;
      line_text = editor.lineTextForBufferRow(_row + _i);
      text_length = line_text.length;
      content_tab_count = line_text.split("\t").length - 1;
      line_lengths[_i] = text_length - content_tab_count + content_tab_count * tab_size;
      max_len = Math.max(max_len, line_lengths[_i]);
    }

    var line_length = max_len - block_ws;
    block_ws = this.repeat("\t", block_tab_count) + this.repeat(" ", block_ws);

    // last line
    line_text = editor.lineTextForBufferRow(scope_range[1].row);
    line_text = line_text.replace(/^(\s*)(\*)+\//, (function (self) {
      return function (match, p1, stars) {
        var len = stars.length;
        return p1 + self.repeat("*", line_length + 2 - len) + "/" + "\n";
      };
    })(this));
    var _range = [[scope_range[1].row, 0], [scope_range[1].row, line_length]];
    editor.setTextInBufferRange(_range, line_text);

    // first line
    line_text = editor.lineTextForBufferRow(scope_range[0].row);
    line_text = line_text.replace(/^(\s*)\/(\*)+/, (function (self) {
      return function (match, p1, stars) {
        var len = stars.length;
        return p1 + "/" + self.repeat("*", line_length + 2 - len);
      };
    })(this));
    _range = [[scope_range[0].row, 0], [scope_range[0].row, line_length]];
    editor.setTextInBufferRange(_range, line_text);

    // skip first line and last line
    for (_i = _len - 1; _i > 0; _i--) {
      line_text = editor.lineTextForBufferRow(_row + _i);
      var _length = editor.lineTextForBufferRow(_row + _i).length;
      var r_padding = 1 + (max_len - line_lengths[_i]);
      _range = [[scope_range[0].row + _i, 0], [scope_range[0].row + _i, _length]];
      editor.setTextInBufferRange(_range, line_text + this.repeat(" ", r_padding) + "*");
    }
  };

  DocBlockrAtom.prototype.deindent_command = function () {
    /*
     * When pressing enter at the end of a docblock, this takes the cursor back one space.
    /**
     *
     */ /*|   <-- from here
        |      <-- to here
        */
    var editor = atom.workspace.getActiveTextEditor();
    var cursor = editor.getCursorBufferPosition();
    var text = editor.lineTextForBufferRow(cursor.row);
    text = text.replace(/^(\s*)\s\*\/.*/, "\n$1");
    editor.insertText(text, options = { autoIndentNewline: false });
  };

  DocBlockrAtom.prototype.reparse_command = function () {
    // Reparse a docblock to make the fields 'active' again, so that pressing tab will jump to the next one
    var tab_index = this.counter();
    var tab_stop = function tab_stop(m, g1) {
      return util.format("${%d:%s}", tab_index(), g1);
    };
    var editor = atom.workspace.getActiveTextEditor();
    var pos = editor.getCursorBufferPosition();
    var Snippets = atom.packages.activePackages.snippets.mainModule;
    // disable all snippet expansions

    if (editor.snippetExpansion != null) editor.snippetExpansion.destroy();
    var scope_range = this.scope_range(editor, pos, "comment.block");
    var text = editor.getTextInBufferRange([scope_range[0], scope_range[1]]);
    // escape string, so variables starting with $ won't be removed
    text = escape(text);
    // strip out leading spaces, since inserting a snippet keeps the indentation
    text = text.replace(/\n\s+\*/g, "\n *");
    //replace [bracketed] [text] with a tabstop
    text = text.replace(/(\[.+?\])/g, tab_stop);

    editor.buffer["delete"]([scope_range[0], scope_range[1]]);
    editor.setCursorBufferPosition(scope_range[0]);
    if (text.search(/\${0:/) < 0 && text.search(/\$0/) < 0) text += "$0";
    this.write(editor, text);
  };

  DocBlockrAtom.prototype.wrap_lines_command = function () {
    /**
     * Reformat description text inside a comment block to wrap at the correct length.
     *  Wrap column is set by the first ruler (set in Default.sublime-settings), or 80 by default.
     * Shortcut Key: alt+q
     */
    var editor = atom.workspace.getActiveTextEditor();
    var pos = editor.getCursorBufferPosition();
    var tab_size = atom.config.get("editor.tabLength");
    var wrap_len = atom.config.get("editor.preferredLineLength");

    var num_indent_spaces = Math.max(0, this.editor_settings.indentation_spaces ? this.editor_settings.indentation_spaces : 1);
    var indent_spaces = this.repeat(" ", num_indent_spaces);
    var indent_spaces_same_para = this.repeat(" ", this.editor_settings.indentation_spaces_same_para ? this.editor_settings.indentation_spaces_same_para : num_indent_spaces);
    var spacer_between_sections = this.editor_settings.spacer_between_sections === true;
    var spacer_between_desc_tags = this.editor_settings.spacer_between_sections == "after_description";

    var scope_range = this.scope_range(editor, pos, "comment.block");
    //var text = editor.getTextInBufferRange([scope_range[0], scope_range[1]]);

    // find the first word
    var i, len, _col, _text;
    var start_point = {};
    var end_point = {};
    var start_row = scope_range[0].row;
    len = Math.abs(scope_range[0].row - scope_range[1].row);
    for (i = 0; i <= len; i++) {
      _text = editor.lineTextForBufferRow(start_row + i);
      _col = _text.search(/^\s*\* /);
      if (_col > -1) {
        if (i === 0) {
          start_point.column = scope_range[0].column + _col;
        } else {
          start_point.column = _col;
        }
        start_point.row = scope_range[0].row + i;
        break;
      }
    }
    // find the first tag, or the end of the comment
    for (i = 0; i <= len; i++) {
      _text = editor.lineTextForBufferRow(start_row + i);
      _col = _text.search(/^\s*\*(\/)/);
      if (_col > -1) {
        if (i === 0) {
          end_point.column = scope_range[0].column + _col;
        } else {
          end_point.column = _col;
        }
        end_point.row = scope_range[0].row + i;
        break;
      }
    }
    var text = editor.getTextInBufferRange([start_point, end_point]);

    //find the indentation level
    var regex = /\n(\s*\*)/;
    var matches = regex.exec(text);
    var indentation = matches[1].replace(/\t/g, this.repeat(" ", tab_size)).length;
    wrap_len -= indentation - tab_size;

    // join all the lines, collapsing "empty" lines
    text = text.replace(/\n(\s*\*\s*\n)+/g, "\n\n");

    var wrap_para = function wrap_para(para) {
      para = para.replace(/(\n|^)\s*\*\s*/g, " ");
      var _i, _len;
      // split the paragraph into words
      var words = para.trim().split(" ");
      var text = "\n";
      var line = " *" + indent_spaces;
      var line_tagged = false; // indicates if the line contains a doc tag
      var para_tagged = false; // indicates if this paragraph contains a doc tag
      var line_is_new = true;
      var tag = "";
      // join all words to create lines, no longer than wrapLength
      for (_i = 0; _len = words.length, _i < _len; _i++) {
        var word = words[_i];
        if (word == null && !line_tagged) continue;

        if (line_is_new && word[0] == "@") {
          line_tagged = true;
          para_tagged = true;
          tag = word;
        }

        if (line.length + word.length >= wrap_len - 1) {
          // appending the word to the current line would exceed its
          // length requirements
          text += line.replace(/\s+$/, "") + "\n";
          line = " *" + indent_spaces_same_para + word + " ";
          line_tagged = false;
          line_is_new = true;
        } else {
          line += word + " ";
        }
        line_is_new = false;
      }
      text += line.replace(/\s+$/, "");

      return {
        "text": text,
        "line_tagged": line_tagged,
        "tagged": para_tagged,
        "tag": tag
      };
    };

    // split the text into paragraphs, where each paragraph is eighter
    // defined by an empty line or the start of a doc parameter
    var paragraphs = text.split(/\n{2,}|\n\s*\*\s*(?=@)/);
    var wrapped_paras = [];
    text = "";
    for (i = 0; len = paragraphs.length, i < len; i++) {
      // wrap the lines in the current paragraph
      wrapped_paras.push(wrap_para(paragraphs[i]));
    }

    // combine all the paragraphs into a single piece of text
    for (i = 0; len = wrapped_paras.length, i < len; i++) {
      para = wrapped_paras[i];
      last = i == wrapped_paras.length - 1;
      var _tag, _tagged;
      if (i == len - 1) {
        _tag = _tagged = false;
      } else {
        _tag = wrapped_paras[i + 1].tag;
        _tagged = wrapped_paras[i + 1].tagged;
      }
      next_is_tagged = !last && _tagged;
      next_is_same_tag = (next_is_tagged && para.tag) == _tag;

      if (last || (para.line_tagged || next_is_tagged) && !(spacer_between_sections && !next_is_same_tag) && !(!para.line_tagged && next_is_tagged && spacer_between_desc_tags)) {
        text += para.text;
      } else {
        text += para.text + "\n *";
      }
    }
    text = escape(text);
    // strip start \n
    if (text.search(/^\n/) > -1) text = text.replace(/^\n/, "");
    // add end \n
    if (text.search(/\n$/) < 0) text += "\n";
    editor.setTextInBufferRange([start_point, end_point], text);
  };

  DocBlockrAtom.prototype.get_indent_spaces = function (editor, line) {
    var has_types = this.get_parser(editor).settings.typeInfo;
    var extra_indent = has_types == true ? "\\s+\\S+" : "";

    var regex = [new RegExp(util.format("^\\s*\\*(\\s*@(?:param|property)%s\\s+\\S+\\s+)\\S", extra_indent)), new RegExp(util.format("^\\s*\\*(\\s*@(?:returns?|define)%s\\s+\\S+\\s+)\\S", extra_indent)), new RegExp("^\\s*\\*(\\s*@[a-z]+\\s+)\\S"), new RegExp("^\\s*\\*(\\s*)")];

    var i, len, matches;
    for (i = 0; len = regex.length, i < len; i++) {
      matches = regex[i].exec(line);
      if (matches != null) return matches[1].length;
    }
    return null;
  };

  DocBlockrAtom.prototype.initialize = function (editor, inline) {
    inline = typeof inline === "undefined" ? false : inline;
    var cursor_position = editor.getCursorBufferPosition(); // will handle only one instance
    // Get trailing string
    var line_length = editor.lineTextForBufferRow(cursor_position.row).length;
    this.trailing_range = [cursor_position, [cursor_position.row, line_length]];
    this.trailing_string = editor.getTextInBufferRange(this.trailing_range);
    // drop trailing */
    this.trailing_string = this.trailing_string.replace(/\s*\*\/\s*$/, "");
    this.trailing_string = escape(this.trailing_string);

    this.parser = parser = this.get_parser(editor);
    parser.inline = inline;

    this.indentSpaces = this.repeat(" ", Math.max(0, this.editor_settings.indentation_spaces || 1));
    this.prefix = "*";

    settingsAlignTags = this.editor_settings.align_tags || "deep";
    this.deepAlignTags = settingsAlignTags == "deep";
    this.shallowAlignTags = settingsAlignTags == "shallow" || settingsAlignTags === true;

    // use trailing string as a description of the function
    if (this.trailingString) parser.setNameOverride(this.trailingString);

    // read the next line
    cursor_position = cursor_position.copy();
    cursor_position.row += 1;
    this.line = parser.get_definition(editor, cursor_position, this.read_line);
  };

  DocBlockrAtom.prototype.counter = function () {
    var count = 0;
    return function () {
      return ++count;
    };
  };

  DocBlockrAtom.prototype.repeat = function (string, number) {
    return Array(Math.max(0, number) + 1).join(string);
  };

  DocBlockrAtom.prototype.write = function (editor, str) {
    // will insert data at last cursor position
    var Snippets = atom.packages.activePackages.snippets.mainModule;
    Snippets.insert(str, editor);
  };

  DocBlockrAtom.prototype.erase = function (editor, range) {
    var buffer = editor.getBuffer();
    buffer["delete"](range);
  };

  DocBlockrAtom.prototype.fill_array = function (len) {
    var a = [];
    var i = 0;
    while (i < len) {
      a[i] = 0;
      i++;
    }
    return a;
  };

  DocBlockrAtom.prototype.read_line = function (editor, point) {
    // TODO: no longer works
    if (point >= editor.getText().length) return;
    return editor.lineTextForBufferRow(point.row);
  };

  DocBlockrAtom.prototype.scope_range = function (editor, point, scope_name) {
    // find scope starting point
    // checks: ends when row less than zero, column != 0
    // check if current point is valid
    var _range;
    if ((_range = editor.displayBuffer.bufferRangeForScopeAtPosition(scope_name, point)) == null) return null;

    var start, end;
    var _row = point.row;
    var line_length;
    start = _range.start;
    end = _range.end;
    while (_row >= 0) {
      line_length = editor.lineTextForBufferRow(_row).length;
      _range = editor.displayBuffer.bufferRangeForScopeAtPosition(scope_name, [_row, line_length]);
      if (_range == null) break;
      start = _range.start;
      if (start.column > 0) {
        break;
      }
      _row--;
    }
    _row = point.row;
    var last_row = editor.getLastBufferRow();
    while (_row <= last_row) {
      line_length = editor.lineTextForBufferRow(_row).length;
      _range = editor.displayBuffer.bufferRangeForScopeAtPosition(scope_name, [_row, 0]);
      if (_range == null) break;
      end = _range.end;
      if (end.column < line_length) {
        break;
      }
      _row++;
    }
    return [start, end];
  };

  DocBlockrAtom.prototype.get_parser = function (editor) {
    var scope = editor.getGrammar().scopeName;
    var regex = /\bsource\.([a-z+\-]+)/;
    var matches = regex.exec(scope);
    var source_lang = matches === null ? null : matches[1];

    var settings = atom.config.get("docblockr");

    if (source_lang === null && scope == "text.html.php") {
      return new Parsers.PhpParser(settings);
    }

    if (source_lang === "coffee") return new Parsers.CoffeeParser(settings);else if (source_lang === "actionscript" || source_lang == "haxe") return new Parsers.ActionscriptParser(settings);else if (source_lang === "c++" || source_lang === "cpp" || source_lang === "c" || source_lang === "cuda-c++") return new Parsers.CppParser(settings);else if (source_lang === "objc" || source_lang === "objc++") return new Parsers.ObjCParser(settings);else if (source_lang === "java" || source_lang === "groovy") return new Parsers.JavaParser(settings);else if (source_lang === "rust") return new Parsers.RustParser(settings);else if (source_lang === "ts") return new Parsers.TypescriptParser(settings);
    return new Parsers.JsParser(settings);
  };

  DocBlockrAtom.prototype.generate_snippet = function (out, inline) {
    //# substitute any variables in the tags

    if (out) out = this.substitute_variables(out);

    // align the tags
    if (out && (this.shallowAlignTags || this.deepAlignTags) && !inline) out = this.align_tags(out);

    // fix all the tab stops so they're consecutive
    if (out) out = this.fix_tab_stops(out);

    if (inline) {
      if (out) return " " + out[0] + " */";else return " $0 */";
    } else return this.create_snippet(out) + (this.editor_settings.newline_after_block ? "\n" : "");
  };

  DocBlockrAtom.prototype.substitute_variables = function (out) {
    function get_var(match, group, str) {
      var var_name = group;
      if (var_name == "datetime") {
        var datetime = new Date();
        return format_time(datetime);
      } else if (var_name == "date") {
        var datetime = new Date();
        return datetime.toISOString().replace(/T.*/, "");
      } else return match;
    }
    function format_time(datetime) {
      function length_fix(x) {
        if (x < 10) x = "0" + x;
        return x;
      }
      var hour = length_fix(datetime.getHours());
      var min = length_fix(datetime.getMinutes());
      var sec = length_fix(datetime.getSeconds());
      var tz = datetime.getTimezoneOffset() / -60;
      var tz_string;
      if (tz >= 0) tz_string = "+";else tz_string = "-";
      tz_string += length_fix(Math.floor(Math.abs(tz)).toString()) + tz % 1 * 60;
      datetime = datetime.toISOString().replace(/T.*/, "");
      return datetime += "T" + hour + ":" + min + ":" + sec + tz_string;
    }
    function sub_line(line) {
      var regex = new RegExp("{{([^}]+)}}", "g");
      return line.replace(regex, get_var);
    }
    return out.map(sub_line);
  };

  DocBlockrAtom.prototype.align_tags = function (out) {
    var output_width = function output_width(str) {
      // get the length of a string, after it is output as a snippet,
      // "${1:foo}" --> 3
      return str.replace(/[$][{]\d+:([^}]+)[}]/, "$1").replace("\\$", "$").length;
    };
    // count how many columns we have
    var maxCols = 0;
    // this is a 2d list of the widths per column per line
    var widths = [];
    var return_tag;
    // Grab the return tag if required.
    if (this.editor_settings.per_section_indent) return_tag = this.editor_settings.return_tag || "@return";else return_tag = false;

    for (var i = 0; i < out.length; i++) {
      if (out[i].startsWith("@")) {
        // Ignore the return tag if we're doing per-section indenting.
        if (return_tag && out[i].startsWith(return_tag)) continue;
        // ignore all the words after `@author`
        var columns = !out[i].startsWith("@author") ? out[i].split(" ") : ["@author"];
        widths.push(columns.map(output_width));
        maxCols = Math.max(maxCols, widths[widths.length - 1].length);
      }
    }
    // initialise a list to 0
    var maxWidths = this.fill_array(maxCols);

    if (this.shallowAlignTags) maxCols = 1;

    for (i = 0; i < maxCols; i++) {
      for (var j = 0; j < widths.length; j++) {
        if (i < widths[j].length) maxWidths[i] = Math.max(maxWidths[i], widths[j][i]);
      }
    }
    // Convert to a dict so we can use .get()
    // maxWidths = dict(enumerate(maxWidths))

    // Minimum spaces between line columns
    var minColSpaces = this.editor_settings.min_spaces_between_columns || 1;
    for (i = 0; i_len = out.length, i < i_len; i++) {
      // format the spacing of columns, but ignore the author tag. (See #197)
      if (out[i].startsWith("@") && !out[i].startsWith("@author")) {
        var new_out = [];
        var split_array = out[i].split(" ");
        for (var j = 0; j_len = split_array.length, j < j_len; j++) {
          new_out.push(split_array[j]);
          new_out.push(this.repeat(" ", minColSpaces) + this.repeat(" ", (maxWidths[j] || 0) - output_width(split_array[j])));
        }
        out[i] = new_out.join("").trim();
      }
    }
    return out;
  };

  DocBlockrAtom.prototype.fix_tab_stops = function (out) {
    var tab_index = this.counter();
    var swap_tabs = function swap_tabs(match, group1, group2, str) {
      return group1 + tab_index() + group2;
    };
    var i, len;
    for (i = 0; len = out.length, i < len; i++) out[i] = out[i].replace(/(\$\{)\d+(:[^}]+\})/g, swap_tabs);
    return out;
  };

  DocBlockrAtom.prototype.create_snippet = function (out) {
    var snippet = "";
    var closer = this.parser.settings.commentCloser;
    var regex = new RegExp("^s*@([a-zA-Z]+)");
    var i, len;
    if (out) {
      if (this.editor_settings.spacer_between_sections === true) {
        var last_tag = null;
        for (i = 0; len = out.length, i < len; i++) {
          var match = regex.exec(out[i]);
          if (match && last_tag != match[1]) {
            last_tag = match[1];
            out.splice(i, 0, "");
          }
        }
      } else if (this.editor_settings.spacer_between_sections == "after_description") {
        var lastLineIsTag = false;
        for (i = 0; len = out.length, i < len; i++) {
          var match = regex.exec(out[i]);
          if (match) {
            if (!lastLineIsTag) out.splice(i, 0, "");
            lastLineIsTag = true;
          }
        }
      }
      for (i = 0; len = out.length, i < len; i++) {
        snippet += "\n " + this.prefix + (out[i] ? this.indentSpaces + out[i] : "");
      }
    } else snippet += "\n " + this.prefix + this.indentSpaces + "${0:" + this.trailing_string + "}";

    snippet += "\n" + closer;
    return snippet;
  };

  return DocBlockrAtom;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvZG9jYmxvY2tyL2xpYi9kb2NibG9ja3Itd29ya2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksT0FBTyxHQUFHO0FBQ1osVUFBUSxFQUFFLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQztBQUMzQyxXQUFTLEVBQUUsT0FBTyxDQUFDLGlCQUFpQixDQUFDO0FBQ3JDLFlBQVUsRUFBRSxPQUFPLENBQUMsa0JBQWtCLENBQUM7QUFDdkMsV0FBUyxFQUFFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztBQUNyQyxjQUFZLEVBQUUsT0FBTyxDQUFDLG9CQUFvQixDQUFDO0FBQzNDLG9CQUFrQixFQUFFLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQztBQUN2RCxZQUFVLEVBQUUsT0FBTyxDQUFDLGtCQUFrQixDQUFDO0FBQ3ZDLFlBQVUsRUFBRSxPQUFPLENBQUMsa0JBQWtCLENBQUM7QUFDdkMsa0JBQWdCLEVBQUUsT0FBTyxDQUFDLHdCQUF3QixDQUFDLEVBQ3BELENBQUM7O0FBRUYsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUN2QyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7OztBQUczQixJQUFJLGFBQWEsQ0FBQztBQUNsQixNQUFNLENBQUMsT0FBTyxHQUNaLGFBQWEsR0FBRyxDQUFDLFlBQVc7O0FBRTFCLFdBQVMsYUFBYSxHQUFHO0FBQ3ZCLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixRQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM1QyxRQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQzs7QUFFaEMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFlBQVc7QUFDMUMsVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQ3RC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QUMsQ0FBQztPQUM5RTtLQUNGLE1BRUMsT0FBTyxJQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDOztBQUUxRixXQUFPLElBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQztBQUN4QixXQUFPLE9BQU8sQ0FBQztHQUNoQixDQUFDOztBQUVGLFNBQU8sYUFBYSxDQUFDO0NBQ3hCLENBQUEsRUFBRyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvZG9jYmxvY2tyL2xpYi9kb2NibG9ja3Itd29ya2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFBhcnNlcnMgPSB7XG4gIEpzUGFyc2VyOiByZXF1aXJlKFwiLi9sYW5ndWFnZXMvamF2YXNjcmlwdFwiKSxcbiAgQ3BwUGFyc2VyOiByZXF1aXJlKFwiLi9sYW5ndWFnZXMvY3BwXCIpLFxuICBSdXN0UGFyc2VyOiByZXF1aXJlKFwiLi9sYW5ndWFnZXMvcnVzdFwiKSxcbiAgUGhwUGFyc2VyOiByZXF1aXJlKFwiLi9sYW5ndWFnZXMvcGhwXCIpLFxuICBDb2ZmZWVQYXJzZXI6IHJlcXVpcmUoXCIuL2xhbmd1YWdlcy9jb2ZmZWVcIiksXG4gIEFjdGlvbnNjcmlwdFBhcnNlcjogcmVxdWlyZShcIi4vbGFuZ3VhZ2VzL2FjdGlvbnNjcmlwdFwiKSxcbiAgT2JqQ1BhcnNlcjogcmVxdWlyZShcIi4vbGFuZ3VhZ2VzL29iamNcIiksXG4gIEphdmFQYXJzZXI6IHJlcXVpcmUoXCIuL2xhbmd1YWdlcy9qYXZhXCIpLFxuICBUeXBlc2NyaXB0UGFyc2VyOiByZXF1aXJlKFwiLi9sYW5ndWFnZXMvdHlwZXNjcmlwdFwiKSxcbn07XG5cbnZhciBlc2NhcGUgPSByZXF1aXJlKCcuL3V0aWxzJykuZXNjYXBlO1xudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG4vL3ZhciBTbmlwcGV0cyA9IGF0b20ucGFja2FnZXMuYWN0aXZlUGFja2FnZXMuc25pcHBldHMubWFpbk1vZHVsZTtcblxudmFyIERvY0Jsb2NrckF0b207XG5tb2R1bGUuZXhwb3J0cyA9XG4gIERvY0Jsb2NrckF0b20gPSAoZnVuY3Rpb24oKSB7XG5cbiAgICBmdW5jdGlvbiBEb2NCbG9ja3JBdG9tKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIHNldHRpbmdzID0gYXRvbS5jb25maWcuZ2V0KCdkb2NibG9ja3InKTtcbiAgICAgIHRoaXMuZWRpdG9yX3NldHRpbmdzID0gc2V0dGluZ3M7XG5cbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2RvY2Jsb2NrcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnVwZGF0ZV9jb25maWcoKTtcbiAgICAgIH0pO1xuXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnZG9jYmxvY2tyOnBhcnNlLXRhYicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciByZWdleCA9IHtcbiAgICAgICAgICAvLyBQYXJzZSBDb21tYW5kXG4gICAgICAgICAgJ3BhcnNlJzogL15cXHMqKFxcL1xcKnwjIyMpWyohXVxccyokLyxcbiAgICAgICAgICAvLyBJbmRlbnQgQ29tbWFuZFxuICAgICAgICAgICdpbmRlbnQnOiAvXlxccypcXCpcXHMqJC9cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBQYXJzZSBDb21tYW5kXG4gICAgICAgIGlmKHNlbGYudmFsaWRhdGVfcmVxdWVzdCh7cHJlY2VkaW5nOnRydWUsIHByZWNlZGluZ19yZWdleDpyZWdleC5wYXJzZX0pKSB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ1BhcnNlIGNvbW1hbmQnKTtcbiAgICAgICAgICBzZWxmLnBhcnNlX2NvbW1hbmQoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW5kZW50IENvbW1hbmRcbiAgICAgICAgZWxzZSBpZihzZWxmLnZhbGlkYXRlX3JlcXVlc3Qoe3ByZWNlZGluZzp0cnVlLCBwcmVjZWRpbmdfcmVnZXg6cmVnZXguaW5kZW50fSkpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnSW5kZW50IGNvbW1hbmQnKTtcbiAgICAgICAgICBzZWxmLmluZGVudF9jb21tYW5kKCk7XG4gICAgICAgIH1cblxuICAgICAgICBlbHNlXG4gICAgICAgICAgZXZlbnQuYWJvcnRLZXlCaW5kaW5nKCk7XG4gICAgICB9KTtcblxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2RvY2Jsb2NrcjpwYXJzZS1lbnRlcicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciByZWdleCA9IHtcbiAgICAgICAgICAvLyBQYXJzZSBDb21tYW5kXG4gICAgICAgICAgJ3BhcnNlJzogL15cXHMqKFxcL1xcKnwjIyMpWyohXVxccyokLyxcbiAgICAgICAgICAvLyBUcmltIGF1dG8gd2hpdGVzcGFjZVxuICAgICAgICAgICd0cmltX2F1dG8nOiBbL15cXHMqXFwqXFxzKiQvLCAvXlxccyokL10sXG4gICAgICAgICAgLy8gRGVpbmRlbnQgQ29tbWFuZFxuICAgICAgICAgICdkZWluZGVudCc6IC9eXFxzK1xcKlxcLy8sXG4gICAgICAgICAgLy8gU25pcHBldC0xXG4gICAgICAgICAgJ3NuaXBwZXRfMSc6IFsvXlxccypcXC9cXCokLywvXlxcKlxcL1xccyokL10sXG4gICAgICAgICAgLy8gQ2xvc2UgYmxvY2sgY29tbWVudFxuICAgICAgICAgICdjbG9zZV9ibG9jayc6IC9eXFxzKlxcL1xcKiQvLFxuICAgICAgICAgIC8vIGV4dGVuZCBsaW5lXG4gICAgICAgICAgJ2V4dGVuZF9saW5lJzogL15cXHMqKFxcL1xcL1tcXC8hXT98IykvLFxuICAgICAgICAgIC8vIEV4dGVuZCBkb2NibG9jayBieSBhZGRpbmcgYW4gYXN0ZXJpeCBhdCBzdGFydFxuICAgICAgICAgICdleHRlbmQnOiAvXlxccypcXCovLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFBhcnNlIENvbW1hbmRcbiAgICAgICAgaWYoc2VsZi52YWxpZGF0ZV9yZXF1ZXN0KHtwcmVjZWRpbmc6dHJ1ZSwgcHJlY2VkaW5nX3JlZ2V4OnJlZ2V4LnBhcnNlfSkpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnUGFyc2UgY29tbWFuZCcpO1xuICAgICAgICAgIHNlbGYucGFyc2VfY29tbWFuZChmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJpbSBhdXRvIHdoaXRlc3BhY2VcbiAgICAgICAgZWxzZSBpZihzZWxmLnZhbGlkYXRlX3JlcXVlc3Qoe3ByZWNlZGluZzp0cnVlLCBwcmVjZWRpbmdfcmVnZXg6cmVnZXgudHJpbV9hdXRvWzBdLCBmb2xsb3dpbmc6dHJ1ZSwgZm9sbG93aW5nX3JlZ2V4OnJlZ2V4LnRyaW1fYXV0b1sxXSwgc2NvcGU6J2NvbW1lbnQuYmxvY2snfSkpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnQXV0byBUcmltIGNvbW1hbmQnKTtcbiAgICAgICAgICBzZWxmLnRyaW1fYXV0b193aGl0ZXNwYWNlX2NvbW1hbmQoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBEZWluZGVudCBjb21tYW5kXG4gICAgICAgIGVsc2UgaWYoc2VsZi52YWxpZGF0ZV9yZXF1ZXN0KHtwcmVjZWRpbmc6dHJ1ZSwgcHJlY2VkaW5nX3JlZ2V4OnJlZ2V4LmRlaW5kZW50fSkpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnRGVpbmRlbnQgY29tbWFuZCcpO1xuICAgICAgICAgIHNlbGYuZGVpbmRlbnRfY29tbWFuZCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoc2VsZi52YWxpZGF0ZV9yZXF1ZXN0KHtwcmVjZWRpbmc6dHJ1ZSwgcHJlY2VkaW5nX3JlZ2V4OnJlZ2V4LnNuaXBwZXRfMVswXSwgZm9sbG93aW5nOnRydWUsIGZvbGxvd2luZ19yZWdleDpyZWdleC5zbmlwcGV0XzFbMV19KSkge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdTbmlwcGV0LTEgY29tbWFuZCcpO1xuICAgICAgICAgIHZhciBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgICAgc2VsZi53cml0ZShlZGl0b3IsICdcXG4kMFxcbiAnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDbG9zZSBibG9jayBjb21tZW50XG4gICAgICAgIGVsc2UgaWYoc2VsZi52YWxpZGF0ZV9yZXF1ZXN0KHtwcmVjZWRpbmc6dHJ1ZSwgcHJlY2VkaW5nX3JlZ2V4OnJlZ2V4LmNsb3NlX2Jsb2NrfSkpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnU25pcHBldCBjbG9zZSBibG9jayBjb21tZW50IGNvbW1hbmQnKTtcbiAgICAgICAgICB2YXIgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICAgIHNlbGYud3JpdGUoZWRpdG9yLCAnXFxuJDBcXG4gKi8nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBleHRlbmQgbGluZSBjb21tZW50cyAoLy8gYW5kICMpXG4gICAgICAgIGVsc2UgaWYoKHNlbGYuZWRpdG9yX3NldHRpbmdzLmV4dGVuZF9kb3VibGVfc2xhc2ggPT0gdHJ1ZSkgJiYgKHNlbGYudmFsaWRhdGVfcmVxdWVzdCh7cHJlY2VkaW5nOnRydWUsIHByZWNlZGluZ19yZWdleDpyZWdleC5leHRlbmRfbGluZSwgc2NvcGU6J2NvbW1lbnQubGluZSd9KSkpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnU25pcHBldCBFeHRlbmQgbGluZSBjb21tYW5kJyk7XG4gICAgICAgICAgdmFyIF9yZWdleCA9IC9eKFxccyooPzojfFxcL1xcL1tcXC8hXT8pXFxzKikuKiQvO1xuICAgICAgICAgIHZhciBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgICAgdmFyIGN1cnNvcl9wb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICAgICAgICAgIHZhciBsaW5lX3RleHQgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3Vyc29yX3Bvc2l0aW9uLnJvdyk7XG4gICAgICAgICAgbGluZV90ZXh0ID0gbGluZV90ZXh0LnJlcGxhY2UoX3JlZ2V4LCAnJDEnKTtcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnXFxuJyArIGxpbmVfdGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRXh0ZW5kIGRvY2Jsb2NrIGJ5IGFkZGluZyBhbiBhc3Rlcml4IGF0IHN0YXJ0XG4gICAgICAgIGVsc2UgaWYoc2VsZi52YWxpZGF0ZV9yZXF1ZXN0KHtwcmVjZWRpbmc6dHJ1ZSwgcHJlY2VkaW5nX3JlZ2V4OnJlZ2V4LmV4dGVuZCwgc2NvcGU6J2NvbW1lbnQuYmxvY2snfSkpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnU25pcHBldCBFeHRlbmQgY29tbWFuZCcpO1xuICAgICAgICAgIHZhciBfcmVnZXggPSAvXihcXHMqXFwqXFxzKikuKiQvO1xuICAgICAgICAgIHZhciBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgICAgdmFyIGN1cnNvcl9wb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICAgICAgICAgIHZhciBsaW5lX3RleHQgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3Vyc29yX3Bvc2l0aW9uLnJvdyk7XG4gICAgICAgICAgbGluZV90ZXh0ID0gbGluZV90ZXh0LnJlcGxhY2UoX3JlZ2V4LCAnJDEnKTtcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnXFxuJyArIGxpbmVfdGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGV2ZW50LmFib3J0S2V5QmluZGluZygpO1xuICAgICAgfSk7XG5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdkb2NibG9ja3I6cGFyc2UtaW5saW5lJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ1BhcnNlLUlubGluZSBjb21tYW5kJyk7XG4gICAgICAgIHZhciBfcmVnZXggPSAvXlxccypcXC9cXCp7Mn0kLztcblxuICAgICAgICBpZihzZWxmLnZhbGlkYXRlX3JlcXVlc3Qoe3ByZWNlZGluZzp0cnVlLCBwcmVjZWRpbmdfcmVnZXg6X3JlZ2V4fSkpXG4gICAgICAgICAgc2VsZi5wYXJzZV9jb21tYW5kKHRydWUpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB2YXIgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICAgIGVkaXRvci5pbnNlcnROZXdsaW5lKCk7XG4gICAgICAgICAgLy9ldmVudC5hYm9ydEtleUJpbmRpbmcoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdkb2NibG9ja3I6am9pbicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdKb2luIGNvbW1hbmQnKTtcbiAgICAgICAgaWYoc2VsZi52YWxpZGF0ZV9yZXF1ZXN0KHtzY29wZTonY29tbWVudC5ibG9jayd9KSlcbiAgICAgICAgICBzZWxmLmpvaW5fY29tbWFuZCgpO1xuICAgICAgfSk7XG5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdkb2NibG9ja3I6cmVwYXJzZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdSZXBhcnNlIGNvbW1hbmQnKTtcbiAgICAgICAgaWYoc2VsZi52YWxpZGF0ZV9yZXF1ZXN0KHtzY29wZTonY29tbWVudC5ibG9jayd9KSlcbiAgICAgICAgICBzZWxmLnJlcGFyc2VfY29tbWFuZCgpO1xuICAgICAgfSk7XG5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdkb2NibG9ja3I6d3JhcC1saW5lcycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdXcmFwbGluZXMgY29tbWFuZCcpO1xuICAgICAgICBpZihzZWxmLnZhbGlkYXRlX3JlcXVlc3Qoe3Njb3BlOidjb21tZW50LmJsb2NrJ30pKVxuICAgICAgICAgIHNlbGYud3JhcF9saW5lc19jb21tYW5kKCk7XG4gICAgICB9KTtcblxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2RvY2Jsb2NrcjpkZWNvcmF0ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdEZWNvcmF0ZSBjb21tYW5kJyk7XG4gICAgICAgIGlmKHNlbGYudmFsaWRhdGVfcmVxdWVzdCh7c2NvcGU6J2NvbW1lbnQubGluZS5kb3VibGUtc2xhc2gnfSkpXG4gICAgICAgICAgc2VsZi5kZWNvcmF0ZV9jb21tYW5kKCk7XG4gICAgICB9KTtcblxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2RvY2Jsb2NrcjpkZWNvcmF0ZS1tdWx0aWxpbmUnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnRGVjb3JhdGUgTXVsdGlsaW5lIGNvbW1hbmQnKTtcbiAgICAgICAgaWYoc2VsZi52YWxpZGF0ZV9yZXF1ZXN0KHtzY29wZTonY29tbWVudC5ibG9jayd9KSlcbiAgICAgICAgICBzZWxmLmRlY29yYXRlX211bHRpbGluZV9jb21tYW5kKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBEb2NCbG9ja3JBdG9tLnByb3RvdHlwZS51cGRhdGVfY29uZmlnID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2V0dGluZ3MgPSBhdG9tLmNvbmZpZy5nZXQoJ2RvY2Jsb2NrcicpO1xuICAgICAgdGhpcy5lZGl0b3Jfc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVmFsaWRhdGUgdGhlIGtleXByZXNzIHJlcXVlc3RcbiAgICAgKiBAcGFyYW0gIHtCb29sZWFufSAgcHJlY2VkaW5nICAgICAgICBDaGVjayBhZ2FpbnN0IHJlZ2V4IGlmIHRydWVcbiAgICAgKiBAcGFyYW0gIHtSZWdleH0gICAgcHJlY2VkaW5nX3JlZ2V4ICBSZWdleCB0byBjaGVjayBwcmVjZWRpbmcgdGV4dCBhZ2FpbnN0XG4gICAgICogQHBhcmFtICB7Qm9vbGVhbn0gIGZvbGxvd2luZyAgICAgICAgQ2hlY2sgYWdhaW5zdCByZWdleCBpZiB0cnVlXG4gICAgICogQHBhcmFtICB7UmVnZXh9ICAgIGZvbGxvd2luZ19yZWdleCAgUmVnZXggdG8gY2hlY2sgZm9sbG93aW5nIHRleHQgYWdhaW5zdFxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gICBzY29wZSAgICAgICAgICAgIENoZWNrIGlmIGN1cnNvciBtYXRjaGVzIHNjb3BlXG4gICAgICovXG4gICAgRG9jQmxvY2tyQXRvbS5wcm90b3R5cGUudmFsaWRhdGVfcmVxdWVzdCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIC8qKlxuICAgICAgICogIE11bHRpcGxlIGN1cnNvciBiZWhhdmlvdXI6XG4gICAgICAgKiAgIDEuIEFkZCBtdWxpdHBsZSBzbmlwcGV0cyBkZXBlbmRlbnQgb24gY3Vyc29yIHBvcywgdGhpcyBtYWtlcyB0cmF2ZXJzaW5nXG4gICAgICAgKiAgICAgICAgc25pcHBldHMgbm90IHBvc3NpYmxlXG4gICAgICAgKiAgIDIuIFNvIHdlIHdpbGwgaXRlcmF0ZSBvdmVyIHRoZSBjdXJzb3JzIGFuZCBmaW5kIHRoZSBmaXJzdCBhbW9uZyB0aGUgY3Vyc29yc1xuICAgICAgICogICAgICAgIHRoYXQgc2F0aXNmaWVzIHRoZSByZWdleCwgdGhlIHJlc3Qgb2YgdGhlIGN1cnNvcnMgd2lsbCBiZSBkZWxldGVkLlxuICAgICAgICovXG5cbiAgICAgIG9wdGlvbnMgPSAodHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnKSA/IG9wdGlvbnMgOiB7fTtcblxuICAgICAgdmFyIHByZWNlZGluZyA9ICh0eXBlb2Ygb3B0aW9ucy5wcmVjZWRpbmcgIT09ICd1bmRlZmluZWQnKSA/IG9wdGlvbnMucHJlY2VkaW5nIDogZmFsc2U7XG4gICAgICB2YXIgcHJlY2VkaW5nX3JlZ2V4ID0gKHR5cGVvZiBvcHRpb25zLnByZWNlZGluZ19yZWdleCAhPT0gJ3VuZGVmaW5lZCcpID8gb3B0aW9ucy5wcmVjZWRpbmdfcmVnZXggOiAnJztcbiAgICAgIHZhciBmb2xsb3dpbmcgPSAodHlwZW9mIG9wdGlvbnMuZm9sbG93aW5nICE9PSAndW5kZWZpbmVkJykgPyBvcHRpb25zLmZvbGxvd2luZyA6IGZhbHNlO1xuICAgICAgdmFyIGZvbGxvd2luZ19yZWdleCA9ICh0eXBlb2Ygb3B0aW9ucy5mb2xsb3dpbmdfcmVnZXggIT09ICd1bmRlZmluZWQnKSA/IG9wdGlvbnMuZm9sbG93aW5nX3JlZ2V4IDogJyc7XG4gICAgICB2YXIgc2NvcGUgICAgID0gKHR5cGVvZiBvcHRpb25zLnNjb3BlICE9PSAndW5kZWZpbmVkJykgPyBvcHRpb25zLnNjb3BlIDogZmFsc2U7XG5cbiAgICAgIHZhciBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICB0aGlzLmN1cnNvcnMgPSBbXTtcbiAgICAgIHZhciBjdXJzb3IsIGksIGxlbiwgZm9sbG93aW5nX3RleHQsIHByZWNlZGluZ190ZXh0O1xuXG4gICAgICB2YXIgY3Vyc29yX3Bvc2l0aW9ucyA9IGVkaXRvci5nZXRDdXJzb3JzKCk7XG5cbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGN1cnNvcl9wb3NpdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdmFyIGN1cnNvcl9wb3NpdGlvbiA9IGN1cnNvcl9wb3NpdGlvbnNbaV0uZ2V0QnVmZmVyUG9zaXRpb24oKTtcblxuICAgICAgICBpZihzY29wZSkge1xuICAgICAgICAgIHZhciBzY29wZV9saXN0ID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGN1cnNvcl9wb3NpdGlvbikuZ2V0U2NvcGVzQXJyYXkoKTtcbiAgICAgICAgICB2YXIgX2ksIF9sZW47XG4gICAgICAgICAgZm9yKF9pID0gMDsgX2xlbiA9IHNjb3BlX2xpc3QubGVuZ3RoLCBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgIGlmKHNjb3BlX2xpc3RbX2ldLnNlYXJjaChzY29wZSkgPiAtMSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihfaSA9PT0gX2xlbikge1xuICAgICAgICAgICAgLy8gc2NvcGUgZGlkIG5vdCBzdWNjZWVkXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZihwcmVjZWRpbmcpXG4gICAgICAgICAgcHJlY2VkaW5nX3RleHQgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tjdXJzb3JfcG9zaXRpb24ucm93LCAwXSwgY3Vyc29yX3Bvc2l0aW9uXSk7XG5cbiAgICAgICAgaWYoZm9sbG93aW5nKSB7XG4gICAgICAgICAgdmFyIGxpbmVfbGVuZ3RoID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGN1cnNvcl9wb3NpdGlvbi5yb3cpLmxlbmd0aDtcbiAgICAgICAgICB2YXIgZm9sbG93aW5nX3JhbmdlID0gW2N1cnNvcl9wb3NpdGlvbiwgW2N1cnNvcl9wb3NpdGlvbi5yb3csIGxpbmVfbGVuZ3RoXV07XG4gICAgICAgICAgZm9sbG93aW5nX3RleHQgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoZm9sbG93aW5nX3JhbmdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHByZWNlZGluZyAmJiBmb2xsb3dpbmcpIHtcbiAgICAgICAgICBpZigocHJlY2VkaW5nX3RleHQuc2VhcmNoKHByZWNlZGluZ19yZWdleCkgPiAtMSkgJiYgKGZvbGxvd2luZ190ZXh0LnNlYXJjaChmb2xsb3dpbmdfcmVnZXgpID4gLTEpKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnNvcnMucHVzaChjdXJzb3JfcG9zaXRpb24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYocHJlY2VkaW5nKSB7XG4gICAgICAgICAgaWYocHJlY2VkaW5nX3RleHQuc2VhcmNoKHByZWNlZGluZ19yZWdleCkgPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5jdXJzb3JzLnB1c2goY3Vyc29yX3Bvc2l0aW9uKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKGZvbGxvd2luZykge1xuICAgICAgICAgIGlmKGZvbGxvd2luZ190ZXh0LnNlYXJjaChmb2xsb3dpbmdfcmVnZXgpID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuY3Vyc29ycy5wdXNoKGN1cnNvcl9wb3NpdGlvbik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihzY29wZSkge1xuICAgICAgICAgIC8qIGNvbWVzIGhlcmUgb25seSBpZiBzY29wZSBpcyBiZWluZyBjaGVja2VkICovXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYodGhpcy5jdXJzb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY3Vyc29yX3Bvc2l0aW9ucy5zcGxpY2UoaSwxKTtcbiAgICAgICAgY3Vyc29yX3Bvc2l0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgdmFsdWUuZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgRG9jQmxvY2tyQXRvbS5wcm90b3R5cGUucGFyc2VfY29tbWFuZCA9IGZ1bmN0aW9uKGlubGluZSkge1xuICAgICAgdmFyIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgIGlmICh0eXBlb2YgZWRpdG9yID09PSAndW5kZWZpbmVkJyB8fCBlZGl0b3IgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5pbml0aWFsaXplKGVkaXRvciwgaW5saW5lKTtcbiAgICAgIGlmKHRoaXMucGFyc2VyLmlzX2V4aXN0aW5nX2NvbW1lbnQodGhpcy5saW5lKSkge1xuICAgICAgICB0aGlzLndyaXRlKGVkaXRvciwgJ1xcbiAqJyArIHRoaXMuaW5kZW50U3BhY2VzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBlcmFzZSBjaGFyYWN0ZXJzIGluIHRoZSB2aWV3ICh3aWxsIGJlIGFkZGVkIHRvIHRoZSBvdXRwdXQgbGF0ZXIpXG4gICAgICB0aGlzLmVyYXNlKGVkaXRvciwgdGhpcy50cmFpbGluZ19yYW5nZSk7XG5cbiAgICAgIC8vIG1hdGNoIGFnYWluc3QgYSBmdW5jdGlvbiBkZWNsYXJhdGlvbi5cbiAgICAgIHZhciBvdXQgPSB0aGlzLnBhcnNlci5wYXJzZSh0aGlzLmxpbmUpO1xuICAgICAgdmFyIHNuaXBwZXQgPSB0aGlzLmdlbmVyYXRlX3NuaXBwZXQob3V0LCBpbmxpbmUpO1xuICAgICAgLy8gYXRvbSBkb2VzbnQgY3VycmVudGx5IHN1cHBvcnQsIHNuaXBwZXQgZW5kIGJ5IGRlZmF1bHRcbiAgICAgIC8vIHNvIGFkZCAkMFxuICAgICAgaWYoKHNuaXBwZXQuc2VhcmNoKC9cXCR7MDovKSA8IDApICYmIChzbmlwcGV0LnNlYXJjaCgvXFwkMC8pIDwgMCkpXG4gICAgICAgIHNuaXBwZXQrPSAnJDAnO1xuICAgICAgdGhpcy53cml0ZShlZGl0b3IsIHNuaXBwZXQpO1xuICAgIH07XG5cbiAgICBEb2NCbG9ja3JBdG9tLnByb3RvdHlwZS50cmltX2F1dG9fd2hpdGVzcGFjZV9jb21tYW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAvKipcbiAgICAgICAqIFRyaW0gdGhlIGF1dG9tYXRpYyB3aGl0ZXNwYWNlIGFkZGVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgbGluZSBpbiBhIGRvY2Jsb2NrLlxuICAgICAgICovXG4gICAgICB2YXIgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgaWYgKHR5cGVvZiBlZGl0b3IgPT09ICd1bmRlZmluZWQnIHx8IGVkaXRvciA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgY3Vyc29yX3Bvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgICB2YXIgbGluZV90ZXh0ID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGN1cnNvcl9wb3NpdGlvbi5yb3cpO1xuICAgICAgdmFyIGxpbmVfbGVuZ3RoID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGN1cnNvcl9wb3NpdGlvbi5yb3cpLmxlbmd0aDtcbiAgICAgIHZhciBzcGFjZXMgPSBNYXRoLm1heCgwLCB0aGlzLmVkaXRvcl9zZXR0aW5ncy5pbmRlbnRhdGlvbl9zcGFjZXMpO1xuXG4gICAgICB2YXIgcmVnZXggPSAvXihcXHMqXFwqKVxccyokLztcbiAgICAgIGxpbmVfdGV4dCA9IGxpbmVfdGV4dC5yZXBsYWNlKHJlZ2V4LCAoJyQxXFxuJDEnICsgdGhpcy5yZXBlYXQoJyAnLCBzcGFjZXMpKSk7XG4gICAgICB2YXIgcmFuZ2UgPSBbW2N1cnNvcl9wb3NpdGlvbi5yb3csIDBdLCBbY3Vyc29yX3Bvc2l0aW9uLnJvdywgbGluZV9sZW5ndGhdXTtcbiAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSwgbGluZV90ZXh0KTtcbiAgICB9O1xuXG4gICAgRG9jQmxvY2tyQXRvbS5wcm90b3R5cGUuaW5kZW50X2NvbW1hbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICB2YXIgY3VycmVudF9wb3MgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKTtcbiAgICAgIHZhciBwcmV2X2xpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3VycmVudF9wb3Mucm93IC0gMSk7XG4gICAgICB2YXIgc3BhY2VzID0gdGhpcy5nZXRfaW5kZW50X3NwYWNlcyhlZGl0b3IsIHByZXZfbGluZSk7XG5cbiAgICAgIGlmKHNwYWNlcyAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IC9eKFxccypcXCopLy5leGVjKHByZXZfbGluZSk7XG4gICAgICAgIHZhciB0b19zdGFyID0gbWF0Y2hlc1sxXS5sZW5ndGg7XG4gICAgICAgIHZhciB0b19pbnNlcnQgPSBzcGFjZXMgLSBjdXJyZW50X3Bvcy5jb2x1bW4gKyB0b19zdGFyO1xuICAgICAgICBpZih0b19pbnNlcnQgPD0gMCkge1xuICAgICAgICAgIHRoaXMud3JpdGUoZWRpdG9yLCAnXFx0Jyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KHRoaXMucmVwZWF0KCcgJywgdG9faW5zZXJ0KSk7XG4gICAgICB9XG4gICAgICBlbHNlXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdcXHQnKTtcbiAgICB9O1xuXG4gICAgRG9jQmxvY2tyQXRvbS5wcm90b3R5cGUuam9pbl9jb21tYW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgdmFyIHNlbGVjdGlvbnMgPSBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpO1xuICAgICAgdmFyIGksIGosIGxlbiwgcm93X2JlZ2luO1xuICAgICAgdmFyIHRleHRfd2l0aF9lbmRpbmcgPSBmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgcmV0dXJuIGVkaXRvci5idWZmZXIubGluZUZvclJvdyhyb3cpICsgZWRpdG9yLmJ1ZmZlci5saW5lRW5kaW5nRm9yUm93KHJvdyk7XG4gICAgICB9O1xuXG4gICAgICBmb3IoaSA9IDA7IGxlbiA9IHNlbGVjdGlvbnMubGVuZ3RoLCBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHNlbGVjdGlvbnNbaV07XG4gICAgICAgIHZhciBub19yb3dzO1xuICAgICAgICB2YXIgX3IgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKTtcbiAgICAgICAgbm9fcm93cyA9IE1hdGguYWJzKF9yWzBdIC0gX3JbMV0pOyAvLyBubyBvZiByb3dzIGluIHNlbGVjdGlvblxuICAgICAgICByb3dfYmVnaW4gPSBNYXRoLm1pbihfclswXSwgX3JbMV0pO1xuICAgICAgICBpZihub19yb3dzID09PSAwKSB7XG4gICAgICAgICAgLy8gZXhpdCBpZiBjdXJyZW50IGxpbmUgaXMgdGhlIGxhc3Qgb25lXG4gICAgICAgICAgaWYoKF9yWzBdICsgMSkgPT0gZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKSlcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIG5vX3Jvd3MgPSAyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBub19yb3dzKz0gMTtcblxuICAgICAgICB2YXIgdGV4dCA9ICcnO1xuICAgICAgICBmb3IoaiA9IDA7IGogPCBub19yb3dzOyBqKyspIHtcbiAgICAgICAgICB0ZXh0Kz0gdGV4dF93aXRoX2VuZGluZyhyb3dfYmVnaW4gKyBqKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVnZXggPSAvWyBcXHRdKlxcblsgXFx0XSooKD86XFwqfFxcL1xcL1shL10/fCMpWyBcXHRdKik/L2c7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsICcgJyk7XG4gICAgICAgIHZhciBlbmRfbGluZV9sZW5ndGggPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93X2JlZ2luICsgbm9fcm93cyAtIDEpLmxlbmd0aDtcbiAgICAgICAgdmFyIHJhbmdlID0gW1tyb3dfYmVnaW4sIDBdLCBbcm93X2JlZ2luICsgbm9fcm93cyAtIDEsIGVuZF9saW5lX2xlbmd0aF1dO1xuICAgICAgICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UsIHRleHQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBEb2NCbG9ja3JBdG9tLnByb3RvdHlwZS5kZWNvcmF0ZV9jb21tYW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgdmFyIHBvcyA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICAgICAgdmFyIHdoaXRlc3BhY2VfcmUgPSAvXihcXHMqKVxcL1xcLy87XG4gICAgICB2YXIgc2NvcGVfcmFuZ2UgPSB0aGlzLnNjb3BlX3JhbmdlKGVkaXRvciwgcG9zLCAnY29tbWVudC5saW5lLmRvdWJsZS1zbGFzaCcpO1xuXG4gICAgICB2YXIgbWF4X2xlbiA9IDA7XG4gICAgICB2YXIgX2ksIF9sZW4sIF9yb3csIGxlYWRpbmdfd3MsIGxpbmVfdGV4dCwgdGFiX2NvdW50O1xuICAgICAgX3JvdyA9IHNjb3BlX3JhbmdlWzBdLnJvdztcbiAgICAgIF9sZW4gPSBNYXRoLmFicyhzY29wZV9yYW5nZVswXS5yb3cgLSBzY29wZV9yYW5nZVsxXS5yb3cpO1xuXG4gICAgICBmb3IoX2kgPSAwOyBfaSA8PSBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGxpbmVfdGV4dCA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhfcm93ICsgX2kpO1xuICAgICAgICB0YWJfY291bnQgPSBsaW5lX3RleHQuc3BsaXQoJ1xcdCcpLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgdmFyIG1hdGNoZXMgPSB3aGl0ZXNwYWNlX3JlLmV4ZWMobGluZV90ZXh0KTtcbiAgICAgICAgaWYobWF0Y2hlc1sxXSA9PSBudWxsKVxuICAgICAgICAgIGxlYWRpbmdfd3MgPSAwO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbGVhZGluZ193cyA9IG1hdGNoZXNbMV0ubGVuZ3RoO1xuXG4gICAgICAgIGxlYWRpbmdfd3MtPSB0YWJfY291bnQ7XG4gICAgICAgIG1heF9sZW4gPSBNYXRoLm1heChtYXhfbGVuLCBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coX3JvdyArIF9pKS5sZW5ndGgpO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGluZV9sZW5ndGggPSBtYXhfbGVuIC0gbGVhZGluZ193cztcbiAgICAgIGxlYWRpbmdfd3MgPSB0aGlzLnJlcGVhdCgnXFx0JywgdGFiX2NvdW50KSArIHRoaXMucmVwZWF0KCcgJywgbGVhZGluZ193cyk7XG4gICAgICBlZGl0b3IuYnVmZmVyLmluc2VydChzY29wZV9yYW5nZVsxXSwgJ1xcbicgKyBsZWFkaW5nX3dzICsgdGhpcy5yZXBlYXQoJy8nICwgKGxpbmVfbGVuZ3RoICsgMykpICsgJ1xcbicpO1xuXG4gICAgICBmb3IoX2kgPSBfbGVuOyBfaSA+PSAwOyBfaS0tKSB7XG4gICAgICAgIGxpbmVfdGV4dCA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhfcm93ICsgX2kpO1xuICAgICAgICB2YXIgX2xlbmd0aCA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhfcm93ICsgX2kpLmxlbmd0aDtcbiAgICAgICAgdmFyIHJfcGFkZGluZyA9IDEgKyAobWF4X2xlbiAtIF9sZW5ndGgpO1xuICAgICAgICB2YXIgX3JhbmdlID0gW1tzY29wZV9yYW5nZVswXS5yb3cgKyBfaSwgMF0sIFtzY29wZV9yYW5nZVswXS5yb3cgKyBfaSwgX2xlbmd0aF1dO1xuICAgICAgICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoX3JhbmdlLCBsZWFkaW5nX3dzICsgbGluZV90ZXh0ICsgdGhpcy5yZXBlYXQoJyAnLCByX3BhZGRpbmcpICsgJy8vJyk7XG4gICAgICB9XG4gICAgICBlZGl0b3IuYnVmZmVyLmluc2VydChzY29wZV9yYW5nZVswXSwgdGhpcy5yZXBlYXQoJy8nLCBsaW5lX2xlbmd0aCArIDMpICsgJ1xcbicpO1xuICAgIH07XG5cbiAgICBEb2NCbG9ja3JBdG9tLnByb3RvdHlwZS5kZWNvcmF0ZV9tdWx0aWxpbmVfY29tbWFuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgIHZhciBwb3MgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKTtcbiAgICAgIHZhciB3aGl0ZXNwYWNlX3JlID0gL14oXFxzKilcXC9cXCovO1xuICAgICAgdmFyIHRhYl9zaXplID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IudGFiTGVuZ3RoJyk7XG4gICAgICB2YXIgc2NvcGVfcmFuZ2UgPSB0aGlzLnNjb3BlX3JhbmdlKGVkaXRvciwgcG9zLCAnY29tbWVudC5ibG9jaycpO1xuICAgICAgdmFyIGxpbmVfbGVuZ3RocyA9IHt9O1xuXG4gICAgICB2YXIgbWF4X2xlbiA9IDA7XG4gICAgICB2YXIgX2ksIF9sZW4sIF9yb3csIGJsb2NrX3dzLCBsZWFkaW5nX3dzLCBsaW5lX3RleHQsIGJsb2NrX3RhYl9jb3VudCwgY29udGVudF90YWJfY291bnQsIG1hdGNoZXM7XG4gICAgICBfcm93ID0gc2NvcGVfcmFuZ2VbMF0ucm93O1xuICAgICAgX2xlbiA9IE1hdGguYWJzKHNjb3BlX3JhbmdlWzBdLnJvdyAtIHNjb3BlX3JhbmdlWzFdLnJvdyk7XG5cbiAgICAgIC8vIGdldCBibG9jayBpbmRlbnQgZnJvbSBmaXJzdCBsaW5lXG4gICAgICBsaW5lX3RleHQgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coX3Jvdyk7XG4gICAgICBibG9ja190YWJfY291bnQgPSBsaW5lX3RleHQuc3BsaXQoJ1xcdCcpLmxlbmd0aCAtIDE7XG4gICAgICBtYXRjaGVzID0gd2hpdGVzcGFjZV9yZS5leGVjKGxpbmVfdGV4dCk7XG4gICAgICBpZihtYXRjaGVzID09IG51bGwpXG4gICAgICAgIGJsb2NrX3dzID0gMDtcbiAgICAgIGVsc2VcbiAgICAgICAgYmxvY2tfd3MgPSBtYXRjaGVzWzFdLmxlbmd0aDtcbiAgICAgIGJsb2NrX3dzLT0gYmxvY2tfdGFiX2NvdW50O1xuXG4gICAgICAvLyBnZXQgbWF4X2xlblxuICAgICAgZm9yKF9pID0gMTsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIHZhciB0ZXh0X2xlbmd0aDtcbiAgICAgICAgbGluZV90ZXh0ID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KF9yb3cgKyBfaSk7XG4gICAgICAgIHRleHRfbGVuZ3RoID0gbGluZV90ZXh0Lmxlbmd0aDtcbiAgICAgICAgY29udGVudF90YWJfY291bnQgPSBsaW5lX3RleHQuc3BsaXQoJ1xcdCcpLmxlbmd0aCAtIDE7XG4gICAgICAgIGxpbmVfbGVuZ3Roc1tfaV0gPSB0ZXh0X2xlbmd0aCAtIGNvbnRlbnRfdGFiX2NvdW50ICsgKGNvbnRlbnRfdGFiX2NvdW50ICogdGFiX3NpemUpO1xuICAgICAgICBtYXhfbGVuID0gTWF0aC5tYXgobWF4X2xlbiwgbGluZV9sZW5ndGhzW19pXSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBsaW5lX2xlbmd0aCA9IG1heF9sZW4gLSBibG9ja193cztcbiAgICAgIGJsb2NrX3dzID0gdGhpcy5yZXBlYXQoJ1xcdCcsIGJsb2NrX3RhYl9jb3VudCkgKyB0aGlzLnJlcGVhdCgnICcsIGJsb2NrX3dzKTtcblxuICAgICAgLy8gbGFzdCBsaW5lXG4gICAgICBsaW5lX3RleHQgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coc2NvcGVfcmFuZ2VbMV0ucm93KTtcbiAgICAgIGxpbmVfdGV4dCA9IGxpbmVfdGV4dC5yZXBsYWNlKC9eKFxccyopKFxcKikrXFwvLywgZnVuY3Rpb24oc2VsZikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24obWF0Y2gsIHAxLCBzdGFycykge1xuICAgICAgICAgIHZhciBsZW4gPSBzdGFycy5sZW5ndGg7XG4gICAgICAgICAgcmV0dXJuIChwMSArICBzZWxmLnJlcGVhdCgnKicgLCAobGluZV9sZW5ndGggKyAyIC0gbGVuKSkgKyAnLycgKyAnXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH0odGhpcykpO1xuICAgICAgdmFyIF9yYW5nZSA9IFtbc2NvcGVfcmFuZ2VbMV0ucm93LCAwXSwgW3Njb3BlX3JhbmdlWzFdLnJvdywgbGluZV9sZW5ndGhdXTtcbiAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShfcmFuZ2UsIGxpbmVfdGV4dCk7XG5cbiAgICAgIC8vIGZpcnN0IGxpbmVcbiAgICAgIGxpbmVfdGV4dCA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhzY29wZV9yYW5nZVswXS5yb3cpO1xuICAgICAgbGluZV90ZXh0ID0gbGluZV90ZXh0LnJlcGxhY2UoL14oXFxzKilcXC8oXFwqKSsvLCBmdW5jdGlvbihzZWxmKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihtYXRjaCwgcDEsIHN0YXJzKSB7XG4gICAgICAgICAgdmFyIGxlbiA9IHN0YXJzLmxlbmd0aDtcbiAgICAgICAgICByZXR1cm4gKHAxICsgICcvJyArICBzZWxmLnJlcGVhdCgnKicgLCAobGluZV9sZW5ndGggKyAyIC0gbGVuKSkpO1xuICAgICAgICB9XG4gICAgICB9KHRoaXMpKTtcbiAgICAgIF9yYW5nZSA9IFtbc2NvcGVfcmFuZ2VbMF0ucm93LCAwXSwgW3Njb3BlX3JhbmdlWzBdLnJvdywgbGluZV9sZW5ndGhdXTtcbiAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShfcmFuZ2UsIGxpbmVfdGV4dCk7XG5cbiAgICAgIC8vIHNraXAgZmlyc3QgbGluZSBhbmQgbGFzdCBsaW5lXG4gICAgICBmb3IoX2kgPSBfbGVuLTE7IF9pID4gMDsgX2ktLSkge1xuICAgICAgICBsaW5lX3RleHQgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coX3JvdyArIF9pKTtcbiAgICAgICAgdmFyIF9sZW5ndGggPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coX3JvdyArIF9pKS5sZW5ndGg7XG4gICAgICAgIHZhciByX3BhZGRpbmcgPSAxICsgKG1heF9sZW4gLSBsaW5lX2xlbmd0aHNbX2ldKTtcbiAgICAgICAgX3JhbmdlID0gW1tzY29wZV9yYW5nZVswXS5yb3cgKyBfaSwgMF0sIFtzY29wZV9yYW5nZVswXS5yb3cgKyBfaSwgX2xlbmd0aF1dO1xuICAgICAgICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoX3JhbmdlLCBsaW5lX3RleHQgKyB0aGlzLnJlcGVhdCgnICcsIHJfcGFkZGluZykgKyAnKicpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBEb2NCbG9ja3JBdG9tLnByb3RvdHlwZS5kZWluZGVudF9jb21tYW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAvKlxuICAgICAgICogV2hlbiBwcmVzc2luZyBlbnRlciBhdCB0aGUgZW5kIG9mIGEgZG9jYmxvY2ssIHRoaXMgdGFrZXMgdGhlIGN1cnNvciBiYWNrIG9uZSBzcGFjZS5cbiAgICAgIC8qKlxuICAgICAgICpcbiAgICAgICAqLy8qfCAgIDwtLSBmcm9tIGhlcmVcbiAgICAgIHwgICAgICA8LS0gdG8gaGVyZVxuICAgICAgICovXG4gICAgICB2YXIgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgdmFyIGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICAgICAgdmFyIHRleHQgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3Vyc29yLnJvdyk7XG4gICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9eKFxccyopXFxzXFwqXFwvLiovLCAnXFxuJDEnKTtcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KHRleHQsIG9wdGlvbnM9eyBhdXRvSW5kZW50TmV3bGluZTpmYWxzZSB9KTtcbiAgICB9O1xuXG4gICAgRG9jQmxvY2tyQXRvbS5wcm90b3R5cGUucmVwYXJzZV9jb21tYW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBSZXBhcnNlIGEgZG9jYmxvY2sgdG8gbWFrZSB0aGUgZmllbGRzICdhY3RpdmUnIGFnYWluLCBzbyB0aGF0IHByZXNzaW5nIHRhYiB3aWxsIGp1bXAgdG8gdGhlIG5leHQgb25lXG4gICAgICB2YXIgdGFiX2luZGV4ID0gdGhpcy5jb3VudGVyKCk7XG4gICAgICB2YXIgdGFiX3N0b3AgPSBmdW5jdGlvbihtLCBnMSkge1xuICAgICAgICByZXR1cm4gdXRpbC5mb3JtYXQoJyR7JWQ6JXN9JywgdGFiX2luZGV4KCksIGcxKTtcbiAgICAgIH07XG4gICAgICB2YXIgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgdmFyIHBvcyA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICAgICAgdmFyIFNuaXBwZXRzID0gYXRvbS5wYWNrYWdlcy5hY3RpdmVQYWNrYWdlcy5zbmlwcGV0cy5tYWluTW9kdWxlO1xuICAgICAgLy8gZGlzYWJsZSBhbGwgc25pcHBldCBleHBhbnNpb25zXG5cbiAgICAgIGlmKGVkaXRvci5zbmlwcGV0RXhwYW5zaW9uICE9IG51bGwpXG4gICAgICAgIGVkaXRvci5zbmlwcGV0RXhwYW5zaW9uLmRlc3Ryb3koKTtcbiAgICAgIHZhciBzY29wZV9yYW5nZSA9IHRoaXMuc2NvcGVfcmFuZ2UoZWRpdG9yLCBwb3MsICdjb21tZW50LmJsb2NrJyk7XG4gICAgICB2YXIgdGV4dCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbc2NvcGVfcmFuZ2VbMF0sIHNjb3BlX3JhbmdlWzFdXSk7XG4gICAgICAvLyBlc2NhcGUgc3RyaW5nLCBzbyB2YXJpYWJsZXMgc3RhcnRpbmcgd2l0aCAkIHdvbid0IGJlIHJlbW92ZWRcbiAgICAgIHRleHQgPSBlc2NhcGUodGV4dCk7XG4gICAgICAvLyBzdHJpcCBvdXQgbGVhZGluZyBzcGFjZXMsIHNpbmNlIGluc2VydGluZyBhIHNuaXBwZXQga2VlcHMgdGhlIGluZGVudGF0aW9uXG4gICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXG5cXHMrXFwqL2csICdcXG4gKicpO1xuICAgICAgLy9yZXBsYWNlIFticmFja2V0ZWRdIFt0ZXh0XSB3aXRoIGEgdGFic3RvcFxuICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvKFxcWy4rP1xcXSkvZywgdGFiX3N0b3ApO1xuXG4gICAgICBlZGl0b3IuYnVmZmVyLmRlbGV0ZSgoW3Njb3BlX3JhbmdlWzBdLCBzY29wZV9yYW5nZVsxXV0pKTtcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihzY29wZV9yYW5nZVswXSk7XG4gICAgICBpZigodGV4dC5zZWFyY2goL1xcJHswOi8pIDwgMCkgJiYgKHRleHQuc2VhcmNoKC9cXCQwLykgPCAwKSlcbiAgICAgICAgdGV4dCs9ICckMCc7XG4gICAgICB0aGlzLndyaXRlKGVkaXRvciwgdGV4dCk7XG4gICAgfTtcblxuICAgIERvY0Jsb2NrckF0b20ucHJvdG90eXBlLndyYXBfbGluZXNfY29tbWFuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgLyoqXG4gICAgICAgKiBSZWZvcm1hdCBkZXNjcmlwdGlvbiB0ZXh0IGluc2lkZSBhIGNvbW1lbnQgYmxvY2sgdG8gd3JhcCBhdCB0aGUgY29ycmVjdCBsZW5ndGguXG4gICAgICAgKiAgV3JhcCBjb2x1bW4gaXMgc2V0IGJ5IHRoZSBmaXJzdCBydWxlciAoc2V0IGluIERlZmF1bHQuc3VibGltZS1zZXR0aW5ncyksIG9yIDgwIGJ5IGRlZmF1bHQuXG4gICAgICAgKiBTaG9ydGN1dCBLZXk6IGFsdCtxXG4gICAgICAgKi9cbiAgICAgIHZhciBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICB2YXIgcG9zID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgICB2YXIgdGFiX3NpemUgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci50YWJMZW5ndGgnKTtcbiAgICAgIHZhciB3cmFwX2xlbiA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnKTtcblxuICAgICAgdmFyIG51bV9pbmRlbnRfc3BhY2VzID0gTWF0aC5tYXgoMCwgKHRoaXMuZWRpdG9yX3NldHRpbmdzLmluZGVudGF0aW9uX3NwYWNlcyA/IHRoaXMuZWRpdG9yX3NldHRpbmdzLmluZGVudGF0aW9uX3NwYWNlcyA6IDEpKTtcbiAgICAgIHZhciBpbmRlbnRfc3BhY2VzID0gdGhpcy5yZXBlYXQoJyAnLCBudW1faW5kZW50X3NwYWNlcyk7XG4gICAgICB2YXIgaW5kZW50X3NwYWNlc19zYW1lX3BhcmEgPSB0aGlzLnJlcGVhdCgnICcsICh0aGlzLmVkaXRvcl9zZXR0aW5ncy5pbmRlbnRhdGlvbl9zcGFjZXNfc2FtZV9wYXJhID8gdGhpcy5lZGl0b3Jfc2V0dGluZ3MuaW5kZW50YXRpb25fc3BhY2VzX3NhbWVfcGFyYSA6IG51bV9pbmRlbnRfc3BhY2VzKSk7XG4gICAgICB2YXIgc3BhY2VyX2JldHdlZW5fc2VjdGlvbnMgPSAodGhpcy5lZGl0b3Jfc2V0dGluZ3Muc3BhY2VyX2JldHdlZW5fc2VjdGlvbnMgPT09IHRydWUpO1xuICAgICAgdmFyIHNwYWNlcl9iZXR3ZWVuX2Rlc2NfdGFncyA9ICh0aGlzLmVkaXRvcl9zZXR0aW5ncy5zcGFjZXJfYmV0d2Vlbl9zZWN0aW9ucyA9PSAnYWZ0ZXJfZGVzY3JpcHRpb24nKTtcblxuICAgICAgdmFyIHNjb3BlX3JhbmdlID0gdGhpcy5zY29wZV9yYW5nZShlZGl0b3IsIHBvcywgJ2NvbW1lbnQuYmxvY2snKTtcbiAgICAgIC8vdmFyIHRleHQgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW3Njb3BlX3JhbmdlWzBdLCBzY29wZV9yYW5nZVsxXV0pO1xuXG4gICAgICAvLyBmaW5kIHRoZSBmaXJzdCB3b3JkXG4gICAgICB2YXIgaSwgbGVuLCBfY29sLCBfdGV4dDtcbiAgICAgIHZhciBzdGFydF9wb2ludCA9IHt9O1xuICAgICAgdmFyIGVuZF9wb2ludCA9IHt9O1xuICAgICAgdmFyIHN0YXJ0X3JvdyA9IHNjb3BlX3JhbmdlWzBdLnJvdztcbiAgICAgIGxlbiA9IE1hdGguYWJzKHNjb3BlX3JhbmdlWzBdLnJvdyAtIHNjb3BlX3JhbmdlWzFdLnJvdyk7XG4gICAgICBmb3IoaSA9IDA7IGkgPD0gbGVuOyBpKyspIHtcbiAgICAgICAgX3RleHQgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coc3RhcnRfcm93ICsgaSk7XG4gICAgICAgIF9jb2wgPSBfdGV4dC5zZWFyY2goL15cXHMqXFwqIC8pO1xuICAgICAgICBpZihfY29sID4gLTEpIHtcbiAgICAgICAgICBpZihpID09PSAwKSB7XG4gICAgICAgICAgICBzdGFydF9wb2ludC5jb2x1bW4gPSBzY29wZV9yYW5nZVswXS5jb2x1bW4gKyBfY29sO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN0YXJ0X3BvaW50LmNvbHVtbiA9IF9jb2w7XG4gICAgICAgICAgfVxuICAgICAgICAgIHN0YXJ0X3BvaW50LnJvdyA9IHNjb3BlX3JhbmdlWzBdLnJvdyArIGk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGZpbmQgdGhlIGZpcnN0IHRhZywgb3IgdGhlIGVuZCBvZiB0aGUgY29tbWVudFxuICAgICAgZm9yKGkgPSAwOyBpIDw9IGxlbjsgaSsrKSB7XG4gICAgICAgIF90ZXh0ID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHN0YXJ0X3JvdyArIGkpO1xuICAgICAgICBfY29sID0gX3RleHQuc2VhcmNoKC9eXFxzKlxcKihcXC8pLyk7XG4gICAgICAgIGlmKF9jb2wgPiAtMSkge1xuICAgICAgICAgIGlmKGkgPT09IDApIHtcbiAgICAgICAgICAgIGVuZF9wb2ludC5jb2x1bW4gPSBzY29wZV9yYW5nZVswXS5jb2x1bW4gKyBfY29sO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVuZF9wb2ludC5jb2x1bW4gPSBfY29sO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbmRfcG9pbnQucm93ID0gc2NvcGVfcmFuZ2VbMF0ucm93ICsgaTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHRleHQgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW3N0YXJ0X3BvaW50LCBlbmRfcG9pbnRdKTtcblxuICAgICAgLy9maW5kIHRoZSBpbmRlbnRhdGlvbiBsZXZlbFxuICAgICAgdmFyIHJlZ2V4ID0gL1xcbihcXHMqXFwqKS87XG4gICAgICB2YXIgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWModGV4dCk7XG4gICAgICB2YXIgaW5kZW50YXRpb24gPSBtYXRjaGVzWzFdLnJlcGxhY2UoL1xcdC9nLCB0aGlzLnJlcGVhdCgnICcsIHRhYl9zaXplKSkubGVuZ3RoO1xuICAgICAgd3JhcF9sZW4tPSBpbmRlbnRhdGlvbiAtIHRhYl9zaXplO1xuXG4gICAgICAvLyBqb2luIGFsbCB0aGUgbGluZXMsIGNvbGxhcHNpbmcgXCJlbXB0eVwiIGxpbmVzXG4gICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXG4oXFxzKlxcKlxccypcXG4pKy9nLCAnXFxuXFxuJyk7XG5cbiAgICAgIHZhciB3cmFwX3BhcmEgPSBmdW5jdGlvbihwYXJhKSB7XG4gICAgICAgIHBhcmEgPSBwYXJhLnJlcGxhY2UoLyhcXG58XilcXHMqXFwqXFxzKi9nLCAnICcpO1xuICAgICAgICB2YXIgX2ksIF9sZW47XG4gICAgICAgIC8vIHNwbGl0IHRoZSBwYXJhZ3JhcGggaW50byB3b3Jkc1xuICAgICAgICB2YXIgd29yZHMgPSBwYXJhLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgICAgICB2YXIgdGV4dCA9ICdcXG4nO1xuICAgICAgICB2YXIgbGluZSA9ICcgKicgKyBpbmRlbnRfc3BhY2VzO1xuICAgICAgICB2YXIgbGluZV90YWdnZWQgPSBmYWxzZTsgLy8gaW5kaWNhdGVzIGlmIHRoZSBsaW5lIGNvbnRhaW5zIGEgZG9jIHRhZ1xuICAgICAgICB2YXIgcGFyYV90YWdnZWQgPSBmYWxzZTsgLy8gaW5kaWNhdGVzIGlmIHRoaXMgcGFyYWdyYXBoIGNvbnRhaW5zIGEgZG9jIHRhZ1xuICAgICAgICB2YXIgbGluZV9pc19uZXcgPSB0cnVlO1xuICAgICAgICB2YXIgdGFnID0gJyc7XG4gICAgICAgIC8vIGpvaW4gYWxsIHdvcmRzIHRvIGNyZWF0ZSBsaW5lcywgbm8gbG9uZ2VyIHRoYW4gd3JhcExlbmd0aFxuICAgICAgICBmb3IoX2kgPSAwOyBfbGVuID0gd29yZHMubGVuZ3RoLCBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICB2YXIgd29yZCA9IHdvcmRzW19pXTtcbiAgICAgICAgICBpZigod29yZCA9PSBudWxsKSAmJiAoIWxpbmVfdGFnZ2VkKSlcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgaWYoKGxpbmVfaXNfbmV3KSAmJiAod29yZFswXSA9PSAnQCcpKSB7XG4gICAgICAgICAgICBsaW5lX3RhZ2dlZCA9IHRydWU7XG4gICAgICAgICAgICBwYXJhX3RhZ2dlZCA9IHRydWU7XG4gICAgICAgICAgICB0YWcgPSB3b3JkO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKChsaW5lLmxlbmd0aCArIHdvcmQubGVuZ3RoKSA+PSAod3JhcF9sZW4gLSAxKSkge1xuICAgICAgICAgICAgLy8gYXBwZW5kaW5nIHRoZSB3b3JkIHRvIHRoZSBjdXJyZW50IGxpbmUgd291bGQgZXhjZWVkIGl0c1xuICAgICAgICAgICAgLy8gbGVuZ3RoIHJlcXVpcmVtZW50c1xuICAgICAgICAgICAgdGV4dCs9IGxpbmUucmVwbGFjZSgvXFxzKyQvLCAnJykgKyAnXFxuJztcbiAgICAgICAgICAgIGxpbmUgPSAnIConICsgaW5kZW50X3NwYWNlc19zYW1lX3BhcmEgKyB3b3JkICsgJyAnO1xuICAgICAgICAgICAgbGluZV90YWdnZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGxpbmVfaXNfbmV3ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsaW5lKz0gd29yZCArICcgJztcbiAgICAgICAgICB9XG4gICAgICAgICAgbGluZV9pc19uZXcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0ZXh0Kz0gbGluZS5yZXBsYWNlKC9cXHMrJC8sICcnKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICd0ZXh0JzogICAgICAgdGV4dCxcbiAgICAgICAgICAnbGluZV90YWdnZWQnOiBsaW5lX3RhZ2dlZCxcbiAgICAgICAgICAndGFnZ2VkJzogICAgIHBhcmFfdGFnZ2VkLFxuICAgICAgICAgICd0YWcnOiAgICAgICAgdGFnXG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICAvLyBzcGxpdCB0aGUgdGV4dCBpbnRvIHBhcmFncmFwaHMsIHdoZXJlIGVhY2ggcGFyYWdyYXBoIGlzIGVpZ2h0ZXJcbiAgICAgIC8vIGRlZmluZWQgYnkgYW4gZW1wdHkgbGluZSBvciB0aGUgc3RhcnQgb2YgYSBkb2MgcGFyYW1ldGVyXG4gICAgICB2YXIgcGFyYWdyYXBocyA9IHRleHQuc3BsaXQoL1xcbnsyLH18XFxuXFxzKlxcKlxccyooPz1AKS8pO1xuICAgICAgdmFyIHdyYXBwZWRfcGFyYXMgPSBbXTtcbiAgICAgIHRleHQgPSAnJztcbiAgICAgIGZvcihpID0gMDsgbGVuID0gcGFyYWdyYXBocy5sZW5ndGgsIGkgPCBsZW47IGkrKykge1xuICAgICAgICAvLyB3cmFwIHRoZSBsaW5lcyBpbiB0aGUgY3VycmVudCBwYXJhZ3JhcGhcbiAgICAgICAgd3JhcHBlZF9wYXJhcy5wdXNoKHdyYXBfcGFyYShwYXJhZ3JhcGhzW2ldKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbWJpbmUgYWxsIHRoZSBwYXJhZ3JhcGhzIGludG8gYSBzaW5nbGUgcGllY2Ugb2YgdGV4dFxuICAgICAgZm9yKGkgPSAwOyBsZW4gPSB3cmFwcGVkX3BhcmFzLmxlbmd0aCwgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHBhcmEgPSB3cmFwcGVkX3BhcmFzW2ldO1xuICAgICAgICBsYXN0ID0gKGkgPT0gKHdyYXBwZWRfcGFyYXMubGVuZ3RoIC0gMSkpO1xuICAgICAgICB2YXIgX3RhZywgX3RhZ2dlZDtcbiAgICAgICAgaWYoaSA9PSBsZW4gLSAxKSB7XG4gICAgICAgICAgX3RhZyA9IF90YWdnZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBfdGFnID0gd3JhcHBlZF9wYXJhc1tpKzFdLnRhZztcbiAgICAgICAgICBfdGFnZ2VkID0gd3JhcHBlZF9wYXJhc1tpKzFdLnRhZ2dlZDtcbiAgICAgICAgfVxuICAgICAgICBuZXh0X2lzX3RhZ2dlZCA9ICghbGFzdCAmJiBfdGFnZ2VkKTtcbiAgICAgICAgbmV4dF9pc19zYW1lX3RhZyA9ICgobmV4dF9pc190YWdnZWQgJiYgcGFyYS50YWcpID09IF90YWcpO1xuXG4gICAgICAgIGlmKGxhc3QgfHwgKHBhcmEubGluZV90YWdnZWQgfHwgbmV4dF9pc190YWdnZWQpICYmICEoc3BhY2VyX2JldHdlZW5fc2VjdGlvbnMgJiYgKCFuZXh0X2lzX3NhbWVfdGFnKSkgJiYgISgoIXBhcmEubGluZV90YWdnZWQpICYmIG5leHRfaXNfdGFnZ2VkICYmIHNwYWNlcl9iZXR3ZWVuX2Rlc2NfdGFncykpIHtcbiAgICAgICAgICB0ZXh0Kz0gcGFyYS50ZXh0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRleHQrPSBwYXJhLnRleHQgKyAnXFxuIConO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0ZXh0ID0gZXNjYXBlKHRleHQpO1xuICAgICAgLy8gc3RyaXAgc3RhcnQgXFxuXG4gICAgICBpZih0ZXh0LnNlYXJjaCgvXlxcbi8pID4gLTEpXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL15cXG4vLCAnJyk7XG4gICAgICAvLyBhZGQgZW5kIFxcblxuICAgICAgaWYodGV4dC5zZWFyY2goL1xcbiQvKSA8IDApXG4gICAgICAgIHRleHQrPSAnXFxuJztcbiAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbc3RhcnRfcG9pbnQsIGVuZF9wb2ludF0sdGV4dCk7XG4gICAgfTtcblxuICAgIERvY0Jsb2NrckF0b20ucHJvdG90eXBlLmdldF9pbmRlbnRfc3BhY2VzID0gZnVuY3Rpb24oZWRpdG9yLCBsaW5lKSB7XG4gICAgICB2YXIgaGFzX3R5cGVzID0gdGhpcy5nZXRfcGFyc2VyKGVkaXRvcikuc2V0dGluZ3MudHlwZUluZm87XG4gICAgICB2YXIgZXh0cmFfaW5kZW50ID0gKChoYXNfdHlwZXMgPT0gdHJ1ZSkgPyAnXFxcXHMrXFxcXFMrJyA6ICcnKTtcblxuICAgICAgdmFyIHJlZ2V4ID0gW1xuICAgICAgICBuZXcgUmVnRXhwKHV0aWwuZm9ybWF0KCdeXFxcXHMqXFxcXCooXFxcXHMqQCg/OnBhcmFtfHByb3BlcnR5KSVzXFxcXHMrXFxcXFMrXFxcXHMrKVxcXFxTJywgZXh0cmFfaW5kZW50KSksXG4gICAgICAgIG5ldyBSZWdFeHAodXRpbC5mb3JtYXQoJ15cXFxccypcXFxcKihcXFxccypAKD86cmV0dXJucz98ZGVmaW5lKSVzXFxcXHMrXFxcXFMrXFxcXHMrKVxcXFxTJywgZXh0cmFfaW5kZW50KSksXG4gICAgICAgIG5ldyBSZWdFeHAoJ15cXFxccypcXFxcKihcXFxccypAW2Etel0rXFxcXHMrKVxcXFxTJyksXG4gICAgICAgIG5ldyBSZWdFeHAoJ15cXFxccypcXFxcKihcXFxccyopJylcbiAgICAgIF07XG5cbiAgICAgIHZhciBpLCBsZW4sIG1hdGNoZXM7XG4gICAgICBmb3IoaSA9IDA7IGxlbiA9IHJlZ2V4Lmxlbmd0aCwgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIG1hdGNoZXMgPSByZWdleFtpXS5leGVjKGxpbmUpO1xuICAgICAgICBpZihtYXRjaGVzICE9IG51bGwpXG4gICAgICAgICAgcmV0dXJuIG1hdGNoZXNbMV0ubGVuZ3RoO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIERvY0Jsb2NrckF0b20ucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbihlZGl0b3IsIGlubGluZSkge1xuICAgICAgaW5saW5lID0gKHR5cGVvZiBpbmxpbmUgPT09ICd1bmRlZmluZWQnKSA/IGZhbHNlIDogaW5saW5lO1xuICAgICAgdmFyIGN1cnNvcl9wb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpOyAvLyB3aWxsIGhhbmRsZSBvbmx5IG9uZSBpbnN0YW5jZVxuICAgICAgLy8gR2V0IHRyYWlsaW5nIHN0cmluZ1xuICAgICAgdmFyIGxpbmVfbGVuZ3RoID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGN1cnNvcl9wb3NpdGlvbi5yb3cpLmxlbmd0aDtcbiAgICAgIHRoaXMudHJhaWxpbmdfcmFuZ2UgPSBbY3Vyc29yX3Bvc2l0aW9uLCBbY3Vyc29yX3Bvc2l0aW9uLnJvdywgbGluZV9sZW5ndGhdXTtcbiAgICAgIHRoaXMudHJhaWxpbmdfc3RyaW5nID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHRoaXMudHJhaWxpbmdfcmFuZ2UpO1xuICAgICAgLy8gZHJvcCB0cmFpbGluZyAqL1xuICAgICAgdGhpcy50cmFpbGluZ19zdHJpbmcgPSB0aGlzLnRyYWlsaW5nX3N0cmluZy5yZXBsYWNlKC9cXHMqXFwqXFwvXFxzKiQvLCAnJyk7XG4gICAgICB0aGlzLnRyYWlsaW5nX3N0cmluZyA9IGVzY2FwZSh0aGlzLnRyYWlsaW5nX3N0cmluZyk7XG5cbiAgICAgIHRoaXMucGFyc2VyID0gcGFyc2VyID0gdGhpcy5nZXRfcGFyc2VyKGVkaXRvcik7XG4gICAgICBwYXJzZXIuaW5saW5lID0gaW5saW5lO1xuXG4gICAgICB0aGlzLmluZGVudFNwYWNlcyA9IHRoaXMucmVwZWF0KCcgJywgTWF0aC5tYXgoMCwgKHRoaXMuZWRpdG9yX3NldHRpbmdzLmluZGVudGF0aW9uX3NwYWNlcyB8fCAxKSkpO1xuICAgICAgdGhpcy5wcmVmaXggPSAnKic7XG5cbiAgICAgIHNldHRpbmdzQWxpZ25UYWdzID0gdGhpcy5lZGl0b3Jfc2V0dGluZ3MuYWxpZ25fdGFncyB8fCAnZGVlcCc7XG4gICAgICB0aGlzLmRlZXBBbGlnblRhZ3MgPSBzZXR0aW5nc0FsaWduVGFncyA9PSAnZGVlcCc7XG4gICAgICB0aGlzLnNoYWxsb3dBbGlnblRhZ3MgPSAoKHNldHRpbmdzQWxpZ25UYWdzID09ICdzaGFsbG93JykgfHwgKHNldHRpbmdzQWxpZ25UYWdzID09PSB0cnVlKSk7XG5cbiAgICAgIC8vIHVzZSB0cmFpbGluZyBzdHJpbmcgYXMgYSBkZXNjcmlwdGlvbiBvZiB0aGUgZnVuY3Rpb25cbiAgICAgIGlmKHRoaXMudHJhaWxpbmdTdHJpbmcpXG4gICAgICAgICAgcGFyc2VyLnNldE5hbWVPdmVycmlkZSh0aGlzLnRyYWlsaW5nU3RyaW5nKTtcblxuICAgICAgLy8gcmVhZCB0aGUgbmV4dCBsaW5lXG4gICAgICBjdXJzb3JfcG9zaXRpb24gPSBjdXJzb3JfcG9zaXRpb24uY29weSgpO1xuICAgICAgY3Vyc29yX3Bvc2l0aW9uLnJvdys9IDE7XG4gICAgICB0aGlzLmxpbmUgPSBwYXJzZXIuZ2V0X2RlZmluaXRpb24oZWRpdG9yLCBjdXJzb3JfcG9zaXRpb24sIHRoaXMucmVhZF9saW5lKTtcbiAgICB9O1xuXG4gICAgRG9jQmxvY2tyQXRvbS5wcm90b3R5cGUuY291bnRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiArK2NvdW50O1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIERvY0Jsb2NrckF0b20ucHJvdG90eXBlLnJlcGVhdCA9IGZ1bmN0aW9uKHN0cmluZywgbnVtYmVyKSB7XG4gICAgICByZXR1cm4gQXJyYXkoTWF0aC5tYXgoMCwgbnVtYmVyKSArIDEpLmpvaW4oc3RyaW5nKTtcbiAgICB9O1xuXG4gICAgRG9jQmxvY2tyQXRvbS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihlZGl0b3IsIHN0cikge1xuICAgICAgLy8gd2lsbCBpbnNlcnQgZGF0YSBhdCBsYXN0IGN1cnNvciBwb3NpdGlvblxuICAgICAgdmFyIFNuaXBwZXRzID0gYXRvbS5wYWNrYWdlcy5hY3RpdmVQYWNrYWdlcy5zbmlwcGV0cy5tYWluTW9kdWxlO1xuICAgICAgU25pcHBldHMuaW5zZXJ0KHN0ciwgZWRpdG9yKTtcbiAgICB9O1xuXG4gICAgRG9jQmxvY2tyQXRvbS5wcm90b3R5cGUuZXJhc2UgPSBmdW5jdGlvbihlZGl0b3IsIHJhbmdlKSB7XG4gICAgICB2YXIgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgICAgYnVmZmVyLmRlbGV0ZShyYW5nZSk7XG4gICAgfTtcblxuICAgIERvY0Jsb2NrckF0b20ucHJvdG90eXBlLmZpbGxfYXJyYXkgPSBmdW5jdGlvbihsZW4pIHtcbiAgICAgIHZhciBhID0gW107XG4gICAgICB2YXIgaSA9IDA7XG4gICAgICB3aGlsZSAoaSA8IGxlbikge1xuICAgICAgICBhW2ldID0gMDtcbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGE7XG4gICAgfTtcblxuICAgIERvY0Jsb2NrckF0b20ucHJvdG90eXBlLnJlYWRfbGluZSA9IGZ1bmN0aW9uKGVkaXRvciwgcG9pbnQpIHtcbiAgICAgICAgLy8gVE9ETzogbm8gbG9uZ2VyIHdvcmtzXG4gICAgICAgIGlmKHBvaW50ID49IGVkaXRvci5nZXRUZXh0KCkubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICByZXR1cm4gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHBvaW50LnJvdyk7XG4gICAgfTtcblxuICAgIERvY0Jsb2NrckF0b20ucHJvdG90eXBlLnNjb3BlX3JhbmdlID0gZnVuY3Rpb24oZWRpdG9yLCBwb2ludCwgc2NvcGVfbmFtZSkge1xuICAgICAgLy8gZmluZCBzY29wZSBzdGFydGluZyBwb2ludFxuICAgICAgLy8gY2hlY2tzOiBlbmRzIHdoZW4gcm93IGxlc3MgdGhhbiB6ZXJvLCBjb2x1bW4gIT0gMFxuICAgICAgLy8gY2hlY2sgaWYgY3VycmVudCBwb2ludCBpcyB2YWxpZFxuICAgICAgdmFyIF9yYW5nZTtcbiAgICAgIGlmKChfcmFuZ2UgPSBlZGl0b3IuZGlzcGxheUJ1ZmZlci5idWZmZXJSYW5nZUZvclNjb3BlQXRQb3NpdGlvbihzY29wZV9uYW1lLCBwb2ludCkpID09IG51bGwpXG4gICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICB2YXIgc3RhcnQsIGVuZDtcbiAgICAgIHZhciBfcm93ID0gcG9pbnQucm93O1xuICAgICAgdmFyIGxpbmVfbGVuZ3RoO1xuICAgICAgc3RhcnQgPSBfcmFuZ2Uuc3RhcnQ7XG4gICAgICBlbmQgPSBfcmFuZ2UuZW5kO1xuICAgICAgd2hpbGUoX3JvdyA+PSAwKSB7XG4gICAgICAgIGxpbmVfbGVuZ3RoID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KF9yb3cpLmxlbmd0aDtcbiAgICAgICAgX3JhbmdlID0gZWRpdG9yLmRpc3BsYXlCdWZmZXIuYnVmZmVyUmFuZ2VGb3JTY29wZUF0UG9zaXRpb24oc2NvcGVfbmFtZSwgW19yb3csIGxpbmVfbGVuZ3RoXSk7XG4gICAgICAgIGlmKF9yYW5nZSA9PSBudWxsKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBzdGFydCA9IF9yYW5nZS5zdGFydDtcbiAgICAgICAgaWYoc3RhcnQuY29sdW1uID4gMCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIF9yb3ctLTtcbiAgICAgIH1cbiAgICAgIF9yb3cgPSBwb2ludC5yb3c7XG4gICAgICB2YXIgbGFzdF9yb3cgPSBlZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpO1xuICAgICAgd2hpbGUoX3JvdyA8PSBsYXN0X3Jvdykge1xuICAgICAgICBsaW5lX2xlbmd0aCA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhfcm93KS5sZW5ndGg7XG4gICAgICAgIF9yYW5nZSA9IGVkaXRvci5kaXNwbGF5QnVmZmVyLmJ1ZmZlclJhbmdlRm9yU2NvcGVBdFBvc2l0aW9uKHNjb3BlX25hbWUsIFtfcm93LCAwXSk7XG4gICAgICAgIGlmKF9yYW5nZSA9PSBudWxsKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBlbmQgPSBfcmFuZ2UuZW5kO1xuICAgICAgICBpZihlbmQuY29sdW1uIDwgbGluZV9sZW5ndGgpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBfcm93Kys7XG4gICAgICB9XG4gICAgICByZXR1cm4gW3N0YXJ0LCBlbmRdO1xuICAgIH07XG5cbiAgICBEb2NCbG9ja3JBdG9tLnByb3RvdHlwZS5nZXRfcGFyc2VyID0gZnVuY3Rpb24oZWRpdG9yKSB7XG4gICAgICB2YXIgc2NvcGUgPSBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZTtcbiAgICAgIHZhciByZWdleCA9IC9cXGJzb3VyY2VcXC4oW2EteitcXC1dKykvO1xuICAgICAgdmFyIG1hdGNoZXMgPSByZWdleC5leGVjKHNjb3BlKTtcbiAgICAgIHZhciBzb3VyY2VfbGFuZyA9IChtYXRjaGVzID09PSBudWxsKT8gbnVsbDogbWF0Y2hlc1sxXTtcblxuICAgICAgdmFyIHNldHRpbmdzID0gYXRvbS5jb25maWcuZ2V0KCdkb2NibG9ja3InKTtcblxuICAgICAgaWYoKHNvdXJjZV9sYW5nID09PSBudWxsKSAmJiAoc2NvcGUgPT0gXCJ0ZXh0Lmh0bWwucGhwXCIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgUGFyc2Vycy5QaHBQYXJzZXIoc2V0dGluZ3MpO1xuICAgICAgfVxuXG4gICAgICBpZihzb3VyY2VfbGFuZyA9PT0gXCJjb2ZmZWVcIilcbiAgICAgICAgICByZXR1cm4gbmV3IFBhcnNlcnMuQ29mZmVlUGFyc2VyKHNldHRpbmdzKTtcbiAgICAgIGVsc2UgaWYoKHNvdXJjZV9sYW5nID09PSBcImFjdGlvbnNjcmlwdFwiKSB8fCAoc291cmNlX2xhbmcgPT0gJ2hheGUnKSlcbiAgICAgICAgICByZXR1cm4gbmV3IFBhcnNlcnMuQWN0aW9uc2NyaXB0UGFyc2VyKHNldHRpbmdzKTtcbiAgICAgIGVsc2UgaWYoKHNvdXJjZV9sYW5nID09PSBcImMrK1wiKSB8fCAoc291cmNlX2xhbmcgPT09IFwiY3BwXCIpIHx8IChzb3VyY2VfbGFuZyA9PT0gJ2MnKSB8fCAoc291cmNlX2xhbmcgPT09ICdjdWRhLWMrKycpKVxuICAgICAgICAgIHJldHVybiBuZXcgUGFyc2Vycy5DcHBQYXJzZXIoc2V0dGluZ3MpO1xuICAgICAgZWxzZSBpZigoc291cmNlX2xhbmcgPT09ICdvYmpjJykgfHwgKHNvdXJjZV9sYW5nID09PSAnb2JqYysrJykpXG4gICAgICAgICAgcmV0dXJuIG5ldyBQYXJzZXJzLk9iakNQYXJzZXIoc2V0dGluZ3MpO1xuICAgICAgZWxzZSBpZigoc291cmNlX2xhbmcgPT09ICdqYXZhJykgfHwgKHNvdXJjZV9sYW5nID09PSAnZ3Jvb3Z5JykpXG4gICAgICAgICAgcmV0dXJuIG5ldyBQYXJzZXJzLkphdmFQYXJzZXIoc2V0dGluZ3MpO1xuICAgICAgZWxzZSBpZihzb3VyY2VfbGFuZyA9PT0gJ3J1c3QnKVxuICAgICAgICAgIHJldHVybiBuZXcgUGFyc2Vycy5SdXN0UGFyc2VyKHNldHRpbmdzKTtcbiAgICAgIGVsc2UgaWYoc291cmNlX2xhbmcgPT09ICd0cycpXG4gICAgICAgICAgcmV0dXJuIG5ldyBQYXJzZXJzLlR5cGVzY3JpcHRQYXJzZXIoc2V0dGluZ3MpO1xuICAgICAgcmV0dXJuIG5ldyBQYXJzZXJzLkpzUGFyc2VyKHNldHRpbmdzKTtcbiAgICB9O1xuXG4gICAgRG9jQmxvY2tyQXRvbS5wcm90b3R5cGUuZ2VuZXJhdGVfc25pcHBldCA9IGZ1bmN0aW9uKG91dCwgaW5saW5lKSB7XG4gICAgICAvLyMgc3Vic3RpdHV0ZSBhbnkgdmFyaWFibGVzIGluIHRoZSB0YWdzXG5cbiAgICAgIGlmKG91dClcbiAgICAgICAgb3V0ID0gdGhpcy5zdWJzdGl0dXRlX3ZhcmlhYmxlcyhvdXQpO1xuXG4gICAgICAvLyBhbGlnbiB0aGUgdGFnc1xuICAgICAgaWYob3V0ICYmICh0aGlzLnNoYWxsb3dBbGlnblRhZ3MgfHwgdGhpcy5kZWVwQWxpZ25UYWdzKSAmJiAoIWlubGluZSkpXG4gICAgICAgIG91dCA9IHRoaXMuYWxpZ25fdGFncyhvdXQpO1xuXG4gICAgICAvLyBmaXggYWxsIHRoZSB0YWIgc3RvcHMgc28gdGhleSdyZSBjb25zZWN1dGl2ZVxuICAgICAgaWYob3V0KVxuICAgICAgICBvdXQgPSB0aGlzLmZpeF90YWJfc3RvcHMob3V0KTtcblxuICAgICAgaWYoaW5saW5lKSB7XG4gICAgICAgIGlmKG91dClcbiAgICAgICAgICByZXR1cm4gKCcgJyArIG91dFswXSArICcgKi8nKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiAoJyAkMCAqLycpO1xuICAgICAgfVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gKHRoaXMuY3JlYXRlX3NuaXBwZXQob3V0KSArICh0aGlzLmVkaXRvcl9zZXR0aW5ncy5uZXdsaW5lX2FmdGVyX2Jsb2NrID8gJ1xcbicgOiAnJykpO1xuICAgIH07XG5cbiAgICBEb2NCbG9ja3JBdG9tLnByb3RvdHlwZS5zdWJzdGl0dXRlX3ZhcmlhYmxlcyA9IGZ1bmN0aW9uKG91dCkge1xuICAgICAgZnVuY3Rpb24gZ2V0X3ZhcihtYXRjaCwgZ3JvdXAsIHN0cikge1xuICAgICAgICB2YXIgdmFyX25hbWUgPSBncm91cDtcbiAgICAgICAgaWYodmFyX25hbWUgPT0gJ2RhdGV0aW1lJykge1xuICAgICAgICAgICAgdmFyIGRhdGV0aW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRfdGltZShkYXRldGltZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih2YXJfbmFtZSA9PSAnZGF0ZScpIHtcbiAgICAgICAgICB2YXIgZGF0ZXRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgIHJldHVybiBkYXRldGltZS50b0lTT1N0cmluZygpLnJlcGxhY2UoL1QuKi8sICcnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gZm9ybWF0X3RpbWUoZGF0ZXRpbWUpIHtcbiAgICAgICAgZnVuY3Rpb24gbGVuZ3RoX2ZpeCh4KSB7XG4gICAgICAgICAgaWYoeCA8IDEwKVxuICAgICAgICAgICAgeCA9ICcwJyArIHg7XG4gICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGhvdXIgPSBsZW5ndGhfZml4KGRhdGV0aW1lLmdldEhvdXJzKCkpO1xuICAgICAgICB2YXIgbWluID0gbGVuZ3RoX2ZpeChkYXRldGltZS5nZXRNaW51dGVzKCkpO1xuICAgICAgICB2YXIgc2VjID0gbGVuZ3RoX2ZpeChkYXRldGltZS5nZXRTZWNvbmRzKCkpO1xuICAgICAgICB2YXIgdHogPSBkYXRldGltZS5nZXRUaW1lem9uZU9mZnNldCgpIC8gLTYwO1xuICAgICAgICB2YXIgdHpfc3RyaW5nO1xuICAgICAgICBpZih0eiA+PSAwKVxuICAgICAgICAgIHR6X3N0cmluZyA9ICcrJztcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHR6X3N0cmluZyA9ICctJztcbiAgICAgICAgdHpfc3RyaW5nKz0gIGxlbmd0aF9maXgoTWF0aC5mbG9vcihNYXRoLmFicyh0eikpLnRvU3RyaW5nKCkpICsgKCh0eiAlIDEpICogNjApO1xuICAgICAgICBkYXRldGltZSA9IGRhdGV0aW1lLnRvSVNPU3RyaW5nKCkucmVwbGFjZSgvVC4qLywgJycpO1xuICAgICAgICByZXR1cm4gZGF0ZXRpbWUrPSAnVCcgKyBob3VyICsgJzonICsgbWluICsgJzonICsgc2VjICsgdHpfc3RyaW5nO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gc3ViX2xpbmUobGluZSkge1xuICAgICAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKCdcXHtcXHsoW159XSspXFx9XFx9JywgJ2cnKTtcbiAgICAgICAgcmV0dXJuIGxpbmUucmVwbGFjZShyZWdleCwgZ2V0X3Zhcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0Lm1hcChzdWJfbGluZSk7XG4gICAgfTtcblxuICAgIERvY0Jsb2NrckF0b20ucHJvdG90eXBlLmFsaWduX3RhZ3MgPSBmdW5jdGlvbihvdXQpIHtcbiAgICAgIHZhciBvdXRwdXRfd2lkdGggPSBmdW5jdGlvbihzdHIpe1xuICAgICAgICAvLyBnZXQgdGhlIGxlbmd0aCBvZiBhIHN0cmluZywgYWZ0ZXIgaXQgaXMgb3V0cHV0IGFzIGEgc25pcHBldCxcbiAgICAgICAgLy8gXCIkezE6Zm9vfVwiIC0tPiAzXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvWyRdW3tdXFxkKzooW159XSspW31dLywgJyQxJykucmVwbGFjZSgnXFxcXCQnLCAnJCcpLmxlbmd0aDtcbiAgICAgIH07XG4gICAgICAvLyBjb3VudCBob3cgbWFueSBjb2x1bW5zIHdlIGhhdmVcbiAgICAgIHZhciBtYXhDb2xzID0gMDtcbiAgICAgIC8vIHRoaXMgaXMgYSAyZCBsaXN0IG9mIHRoZSB3aWR0aHMgcGVyIGNvbHVtbiBwZXIgbGluZVxuICAgICAgdmFyIHdpZHRocyA9IFtdO1xuICAgICAgdmFyIHJldHVybl90YWc7XG4gICAgICAvLyBHcmFiIHRoZSByZXR1cm4gdGFnIGlmIHJlcXVpcmVkLlxuICAgICAgaWYodGhpcy5lZGl0b3Jfc2V0dGluZ3MucGVyX3NlY3Rpb25faW5kZW50KVxuICAgICAgICAgIHJldHVybl90YWcgPSB0aGlzLmVkaXRvcl9zZXR0aW5ncy5yZXR1cm5fdGFnIHx8ICdAcmV0dXJuJztcbiAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm5fdGFnID0gZmFsc2U7XG5cbiAgICAgIGZvcih2YXIgaT0wOyBpPG91dC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZihvdXRbaV0uc3RhcnRzV2l0aCgnQCcpKSB7XG4gICAgICAgICAgLy8gSWdub3JlIHRoZSByZXR1cm4gdGFnIGlmIHdlJ3JlIGRvaW5nIHBlci1zZWN0aW9uIGluZGVudGluZy5cbiAgICAgICAgICBpZihyZXR1cm5fdGFnICYmIG91dFtpXS5zdGFydHNXaXRoKHJldHVybl90YWcpKVxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAvLyBpZ25vcmUgYWxsIHRoZSB3b3JkcyBhZnRlciBgQGF1dGhvcmBcbiAgICAgICAgICB2YXIgY29sdW1ucyA9ICghb3V0W2ldLnN0YXJ0c1dpdGgoJ0BhdXRob3InKSkgPyBvdXRbaV0uc3BsaXQoJyAnKSA6IFsnQGF1dGhvciddO1xuICAgICAgICAgIHdpZHRocy5wdXNoKGNvbHVtbnMubWFwKG91dHB1dF93aWR0aCkpO1xuICAgICAgICAgIG1heENvbHMgPSBNYXRoLm1heChtYXhDb2xzLCB3aWR0aHNbd2lkdGhzLmxlbmd0aCAtIDFdLmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGluaXRpYWxpc2UgYSBsaXN0IHRvIDBcbiAgICAgIHZhciBtYXhXaWR0aHMgPSB0aGlzLmZpbGxfYXJyYXkobWF4Q29scyk7XG5cbiAgICAgIGlmKHRoaXMuc2hhbGxvd0FsaWduVGFncylcbiAgICAgICAgICBtYXhDb2xzID0gMTtcblxuICAgICAgZm9yKGkgPSAwOyBpIDwgbWF4Q29sczsgaSsrKSB7XG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB3aWR0aHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZihpIDwgd2lkdGhzW2pdLmxlbmd0aClcbiAgICAgICAgICAgIG1heFdpZHRoc1tpXSA9IE1hdGgubWF4KG1heFdpZHRoc1tpXSwgd2lkdGhzW2pdW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gQ29udmVydCB0byBhIGRpY3Qgc28gd2UgY2FuIHVzZSAuZ2V0KClcbiAgICAgIC8vIG1heFdpZHRocyA9IGRpY3QoZW51bWVyYXRlKG1heFdpZHRocykpXG5cbiAgICAgIC8vIE1pbmltdW0gc3BhY2VzIGJldHdlZW4gbGluZSBjb2x1bW5zXG4gICAgICB2YXIgbWluQ29sU3BhY2VzID0gdGhpcy5lZGl0b3Jfc2V0dGluZ3MubWluX3NwYWNlc19iZXR3ZWVuX2NvbHVtbnMgfHwgMTtcbiAgICAgIGZvcihpID0gMDsgaV9sZW4gPSBvdXQubGVuZ3RoLCBpIDwgaV9sZW47IGkrKykge1xuICAgICAgICAvLyBmb3JtYXQgdGhlIHNwYWNpbmcgb2YgY29sdW1ucywgYnV0IGlnbm9yZSB0aGUgYXV0aG9yIHRhZy4gKFNlZSAjMTk3KVxuICAgICAgICBpZigob3V0W2ldLnN0YXJ0c1dpdGgoJ0AnKSkgJiYgKCFvdXRbaV0uc3RhcnRzV2l0aCgnQGF1dGhvcicpKSkge1xuICAgICAgICAgIHZhciBuZXdfb3V0ID0gW107XG4gICAgICAgICAgdmFyIHNwbGl0X2FycmF5ID0gb3V0W2ldLnNwbGl0KCcgJyk7XG4gICAgICAgICAgZm9yKHZhciBqPTA7IGpfbGVuID0gc3BsaXRfYXJyYXkubGVuZ3RoLCBqIDwgal9sZW47IGorKykge1xuICAgICAgICAgICAgbmV3X291dC5wdXNoKHNwbGl0X2FycmF5W2pdKTtcbiAgICAgICAgICAgIG5ld19vdXQucHVzaCh0aGlzLnJlcGVhdCgnICcsIG1pbkNvbFNwYWNlcykgKyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVwZWF0KCcgJywgKChtYXhXaWR0aHNbal0gfHwgMCkgLSBvdXRwdXRfd2lkdGgoc3BsaXRfYXJyYXlbal0pKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRbaV0gPSBuZXdfb3V0LmpvaW4oJycpLnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuXG4gICAgRG9jQmxvY2tyQXRvbS5wcm90b3R5cGUuZml4X3RhYl9zdG9wcyA9IGZ1bmN0aW9uKG91dCkge1xuICAgICAgdmFyIHRhYl9pbmRleCA9IHRoaXMuY291bnRlcigpO1xuICAgICAgdmFyIHN3YXBfdGFicyA9IGZ1bmN0aW9uKG1hdGNoLCBncm91cDEsIGdyb3VwMiwgc3RyKSB7XG4gICAgICAgIHJldHVybiAoZ3JvdXAxICsgdGFiX2luZGV4KCkgKyBncm91cDIpO1xuICAgICAgfTtcbiAgICAgIHZhciBpLCBsZW47XG4gICAgICBmb3IoaT0wOyBsZW4gPSBvdXQubGVuZ3RoLCBpPGxlbjsgaSsrKVxuICAgICAgICBvdXRbaV0gPSBvdXRbaV0ucmVwbGFjZSgvKFxcJFxceylcXGQrKDpbXn1dK1xcfSkvZywgc3dhcF90YWJzKTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcblxuICAgIERvY0Jsb2NrckF0b20ucHJvdG90eXBlLmNyZWF0ZV9zbmlwcGV0ID0gZnVuY3Rpb24ob3V0KSB7XG4gICAgICB2YXIgc25pcHBldCA9ICcnO1xuICAgICAgdmFyIGNsb3NlciA9IHRoaXMucGFyc2VyLnNldHRpbmdzLmNvbW1lbnRDbG9zZXI7XG4gICAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKCdeXFxzKkAoW2EtekEtWl0rKScpO1xuICAgICAgdmFyIGksIGxlbjtcbiAgICAgIGlmKG91dCkge1xuICAgICAgICBpZih0aGlzLmVkaXRvcl9zZXR0aW5ncy5zcGFjZXJfYmV0d2Vlbl9zZWN0aW9ucyA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBsYXN0X3RhZyA9IG51bGw7XG4gICAgICAgICAgZm9yKGk9MDsgbGVuID0gb3V0Lmxlbmd0aCwgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbWF0Y2ggPSByZWdleC5leGVjKG91dFtpXSk7XG4gICAgICAgICAgICBpZihtYXRjaCAmJiAobGFzdF90YWcgIT0gbWF0Y2hbMV0pKSB7XG4gICAgICAgICAgICAgIGxhc3RfdGFnID0gbWF0Y2hbMV07XG4gICAgICAgICAgICAgIG91dC5zcGxpY2UoaSwgMCAsICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLmVkaXRvcl9zZXR0aW5ncy5zcGFjZXJfYmV0d2Vlbl9zZWN0aW9ucyA9PSAnYWZ0ZXJfZGVzY3JpcHRpb24nKSB7XG4gICAgICAgICAgdmFyIGxhc3RMaW5lSXNUYWcgPSBmYWxzZTtcbiAgICAgICAgICBmb3IoaT0wOyBsZW4gPSBvdXQubGVuZ3RoLCBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBtYXRjaCA9IHJlZ2V4LmV4ZWMob3V0W2ldKTtcbiAgICAgICAgICAgIGlmKG1hdGNoKSB7XG4gICAgICAgICAgICAgIGlmKCFsYXN0TGluZUlzVGFnKVxuICAgICAgICAgICAgICAgIG91dC5zcGxpY2UoaSwgMCwgJycpO1xuICAgICAgICAgICAgICBsYXN0TGluZUlzVGFnID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yKGk9MDsgbGVuID0gb3V0Lmxlbmd0aCwgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgc25pcHBldCs9ICdcXG4gJyArIHRoaXMucHJlZml4ICsgKG91dFtpXSA/ICh0aGlzLmluZGVudFNwYWNlcyArIG91dFtpXSkgOiAnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2VcbiAgICAgICAgc25pcHBldCs9ICdcXG4gJyArIHRoaXMucHJlZml4ICsgdGhpcy5pbmRlbnRTcGFjZXMgKyAnJHswOicgKyB0aGlzLnRyYWlsaW5nX3N0cmluZyArICd9JztcblxuICAgICAgc25pcHBldCs9ICdcXG4nICsgY2xvc2VyO1xuICAgICAgcmV0dXJuIHNuaXBwZXQ7XG4gICAgfTtcblxuICAgIHJldHVybiBEb2NCbG9ja3JBdG9tO1xufSkoKTtcbiJdfQ==