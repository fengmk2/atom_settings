var DocsParser = require('../docsparser');
var xregexp = require('../xregexp').XRegExp;

function JsParser(settings) {
    // this.setup_settings();
    // call parent constructor
    DocsParser.call(this, settings);
}

JsParser.prototype = Object.create(DocsParser.prototype);

JsParser.prototype.setup_settings = function () {
    var identifier = '[a-zA-Z_$][a-zA-Z_$0-9]*';
    this.settings = {
        // curly brackets around the type information
        'curlyTypes': true,
        'typeInfo': true,
        'typeTag': 'type',
        // technically, they can contain all sorts of unicode, but w/e
        'varIdentifier': identifier,
        'fnIdentifier': identifier,
        'fnOpener': 'function(?:\\s+' + identifier + ')?\\s*\\(',
        'commentCloser': ' */',
        'bool': 'Boolean',
        'function': 'Function'
    };
};

JsParser.prototype.parse_function = function (line) {
    // (?:([a-zA-Z_$][a-zA-Z_$0-9]*)\\s*[:=]\\s*)?function(?:\\s+([a-zA-Z_$][a-zA-Z_$0-9]*))?\\s*\\(\\s*(.*)\\)
    var regex = xregexp(
    //   fnName = function,  fnName : function
    '(?:(?P<name1>' + this.settings.varIdentifier + ')\\s*[:=]\\s*)?' + 'function' +
    // function fnName
    '(?:\\s+(?P<name2>' + this.settings.fnIdentifier + '))?' +
    // (arg1, arg2)
    '\\s*\\(\\s*(?P<args>.*)\\)');

    var matches = xregexp.exec(line, regex);
    if (matches === null) {
        return null;
    }
    // grab the name out of "name1 = function name2(foo)" preferring name1
    var name = matches.name1 || matches.name2 || '';
    var args = matches.args;
    return [name, args, null];
};

JsParser.prototype.parse_var = function (line) {
    //   var foo = blah,
    //       foo = blah;
    //   baz.foo = blah;
    //   baz = {
    //        foo : blah
    //   }
    var regex = xregexp('(?P<name>' + this.settings.varIdentifier + ')\\s*[=:]\\s*(?P<val>.*?)(?:[;,]|$)');
    var matches = xregexp.exec(line, regex);
    if (matches === null) {
        return null;
    }
    // variable name, variable value
    return [matches.name, matches.val.trim()];
};

JsParser.prototype.guess_type_from_value = function (val) {
    var lower_primitives = this.editor_settings.lower_case_primitives || false;
    var short_primitives = this.editor_settings.short_primitives || false;
    var var_type;
    var capitalize = function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    if (this.is_numeric(val)) {
        var_type = 'number';
        return lower_primitives ? var_type : capitalize(var_type);
    }
    if (val[0] === '\'' || val[0] === '"') {
        var_type = 'string';
        return lower_primitives ? var_type : capitalize(var_type);
    }
    if (val[0] == '[') {
        return 'Array';
    }
    if (val[0] == '{') {
        return 'Object';
    }
    if (val == 'true' || val == 'false') {
        var ret_val = short_primitives ? 'Bool' : 'Boolean';
        return lower_primitives ? ret_val : capitalize(ret_val);
    }
    var regex = new RegExp('RegExp\\b|\\/[^\\/]');
    if (regex.test(val)) {
        return 'RegExp';
    }
    if (val.slice(0, 4) == 'new ') {
        regex = new RegExp('new (' + this.settings.fnIdentifier + ')');
        var matches = regex.exec(val);
        return matches[0] && matches[1] || null;
    }
    return null;
};

module.exports = JsParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvZG9jYmxvY2tyL2xpYi9sYW5ndWFnZXMvamF2YXNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDMUMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQzs7QUFFNUMsU0FBUyxRQUFRLENBQUMsUUFBUSxFQUFFOzs7QUFHeEIsY0FBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDbkM7O0FBRUQsUUFBUSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFekQsUUFBUSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsWUFBVztBQUMzQyxRQUFJLFVBQVUsR0FBRywwQkFBMEIsQ0FBQztBQUM1QyxRQUFJLENBQUMsUUFBUSxHQUFHOztBQUVaLG9CQUFZLEVBQUUsSUFBSTtBQUNsQixrQkFBVSxFQUFFLElBQUk7QUFDaEIsaUJBQVMsRUFBRSxNQUFNOztBQUVqQix1QkFBZSxFQUFFLFVBQVU7QUFDM0Isc0JBQWMsRUFBRyxVQUFVO0FBQzNCLGtCQUFVLEVBQUUsaUJBQWlCLEdBQUcsVUFBVSxHQUFHLFdBQVc7QUFDeEQsdUJBQWUsRUFBRSxLQUFLO0FBQ3RCLGNBQU0sRUFBRSxTQUFTO0FBQ2pCLGtCQUFVLEVBQUUsVUFBVTtLQUN6QixDQUFDO0NBQ0wsQ0FBQzs7QUFFRixRQUFRLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxVQUFTLElBQUksRUFBRTs7QUFFL0MsUUFBSSxLQUFLLEdBQUcsT0FBTzs7QUFFZixtQkFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxHQUFHLGlCQUFpQixHQUNqRSxVQUFVOztBQUVWLHVCQUFtQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMs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QVEsQ0FBQztLQUNuQjtBQUNELFFBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxFQUFFO0FBQzFCLGFBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDL0QsWUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixlQUFPLEFBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSyxJQUFJLENBQUM7S0FDN0M7QUFDRCxXQUFPLElBQUksQ0FBQztDQUNmLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMiLCJmaWxlIjoiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9kb2NibG9ja3IvbGliL2xhbmd1YWdlcy9qYXZhc2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIERvY3NQYXJzZXIgPSByZXF1aXJlKFwiLi4vZG9jc3BhcnNlclwiKTtcbnZhciB4cmVnZXhwID0gcmVxdWlyZSgnLi4veHJlZ2V4cCcpLlhSZWdFeHA7XG5cbmZ1bmN0aW9uIEpzUGFyc2VyKHNldHRpbmdzKSB7XG4gICAgLy8gdGhpcy5zZXR1cF9zZXR0aW5ncygpO1xuICAgIC8vIGNhbGwgcGFyZW50IGNvbnN0cnVjdG9yXG4gICAgRG9jc1BhcnNlci5jYWxsKHRoaXMsIHNldHRpbmdzKTtcbn1cblxuSnNQYXJzZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEb2NzUGFyc2VyLnByb3RvdHlwZSk7XG5cbkpzUGFyc2VyLnByb3RvdHlwZS5zZXR1cF9zZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpZGVudGlmaWVyID0gJ1thLXpBLVpfJF1bYS16QS1aXyQwLTldKic7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHtcbiAgICAgICAgLy8gY3VybHkgYnJhY2tldHMgYXJvdW5kIHRoZSB0eXBlIGluZm9ybWF0aW9uXG4gICAgICAgICdjdXJseVR5cGVzJzogdHJ1ZSxcbiAgICAgICAgJ3R5cGVJbmZvJzogdHJ1ZSxcbiAgICAgICAgJ3R5cGVUYWcnOiAndHlwZScsXG4gICAgICAgIC8vIHRlY2huaWNhbGx5LCB0aGV5IGNhbiBjb250YWluIGFsbCBzb3J0cyBvZiB1bmljb2RlLCBidXQgdy9lXG4gICAgICAgICd2YXJJZGVudGlmaWVyJzogaWRlbnRpZmllcixcbiAgICAgICAgJ2ZuSWRlbnRpZmllcic6ICBpZGVudGlmaWVyLFxuICAgICAgICAnZm5PcGVuZXInOiAnZnVuY3Rpb24oPzpcXFxccysnICsgaWRlbnRpZmllciArICcpP1xcXFxzKlxcXFwoJyxcbiAgICAgICAgJ2NvbW1lbnRDbG9zZXInOiAnICovJyxcbiAgICAgICAgJ2Jvb2wnOiAnQm9vbGVhbicsXG4gICAgICAgICdmdW5jdGlvbic6ICdGdW5jdGlvbidcbiAgICB9O1xufTtcblxuSnNQYXJzZXIucHJvdG90eXBlLnBhcnNlX2Z1bmN0aW9uID0gZnVuY3Rpb24obGluZSkge1xuICAgIC8vICg/OihbYS16QS1aXyRdW2EtekEtWl8kMC05XSopXFxcXHMqWzo9XVxcXFxzKik/ZnVuY3Rpb24oPzpcXFxccysoW2EtekEtWl8kXVthLXpBLVpfJDAtOV0qKSk/XFxcXHMqXFxcXChcXFxccyooLiopXFxcXClcbiAgICB2YXIgcmVnZXggPSB4cmVnZXhwKFxuICAgICAgICAvLyAgIGZuTmFtZSA9IGZ1bmN0aW9uLCAgZm5OYW1lIDogZnVuY3Rpb25cbiAgICAgICAgJyg/Oig/UDxuYW1lMT4nICsgdGhpcy5zZXR0aW5ncy52YXJJZGVudGlmaWVyICsgJylcXFxccypbOj1dXFxcXHMqKT8nICtcbiAgICAgICAgJ2Z1bmN0aW9uJyArXG4gICAgICAgIC8vIGZ1bmN0aW9uIGZuTmFtZVxuICAgICAgICAnKD86XFxcXHMrKD9QPG5hbWUyPicgKyB0aGlzLnNldHRpbmdzLmZuSWRlbnRpZmllciArICcpKT8nICtcbiAgICAgICAgLy8gKGFyZzEsIGFyZzIpXG4gICAgICAgICdcXFxccypcXFxcKFxcXFxzKig/UDxhcmdzPi4qKVxcXFwpJ1xuICAgICk7XG5cbiAgICB2YXIgbWF0Y2hlcyA9IHhyZWdleHAuZXhlYyhsaW5lLCByZWdleCk7XG4gICAgaWYobWF0Y2hlcyA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gZ3JhYiB0aGUgbmFtZSBvdXQgb2YgXCJuYW1lMSA9IGZ1bmN0aW9uIG5hbWUyKGZvbylcIiBwcmVmZXJyaW5nIG5hbWUxXG4gICAgdmFyIG5hbWUgPSBtYXRjaGVzLm5hbWUxIHx8IG1hdGNoZXMubmFtZTIgfHwgJyc7XG4gICAgdmFyIGFyZ3MgPSBtYXRjaGVzLmFyZ3M7XG4gICAgcmV0dXJuIFtuYW1lLCBhcmdzLCBudWxsXTtcbn07XG5cbkpzUGFyc2VyLnByb3RvdHlwZS5wYXJzZV92YXIgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgIC8vICAgdmFyIGZvbyA9IGJsYWgsXG4gICAgICAgIC8vICAgICAgIGZvbyA9IGJsYWg7XG4gICAgICAgIC8vICAgYmF6LmZvbyA9IGJsYWg7XG4gICAgICAgIC8vICAgYmF6ID0ge1xuICAgICAgICAvLyAgICAgICAgZm9vIDogYmxhaFxuICAgICAgICAvLyAgIH1cbiAgICB2YXIgcmVnZXggPSB4cmVnZXhwKCcoP1A8bmFtZT4nICsgdGhpcy5zZXR0aW5ncy52YXJJZGVudGlmaWVyICsgJylcXFxccypbPTpdXFxcXHMqKD9QPHZhbD4uKj8pKD86WzssXXwkKScpO1xuICAgIHZhciBtYXRjaGVzID0geHJlZ2V4cC5leGVjKGxpbmUsIHJlZ2V4KTtcbiAgICBpZihtYXRjaGVzID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyB2YXJpYWJsZSBuYW1lLCB2YXJpYWJsZSB2YWx1ZVxuICAgIHJldHVybiBbbWF0Y2hlcy5uYW1lLCBtYXRjaGVzLnZhbC50cmltKCldO1xufTtcblxuSnNQYXJzZXIucHJvdG90eXBlLmd1ZXNzX3R5cGVfZnJvbV92YWx1ZSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHZhciBsb3dlcl9wcmltaXRpdmVzID0gdGhpcy5lZGl0b3Jfc2V0dGluZ3MubG93ZXJfY2FzZV9wcmltaXRpdmVzIHx8IGZhbHNlO1xuICAgIHZhciBzaG9ydF9wcmltaXRpdmVzID0gdGhpcy5lZGl0b3Jfc2V0dGluZ3Muc2hvcnRfcHJpbWl0aXZlcyB8fCBmYWxzZTtcbiAgICB2YXIgdmFyX3R5cGU7XG4gICAgdmFyIGNhcGl0YWxpemUgPSBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKTtcbiAgICB9O1xuICAgIGlmKHRoaXMuaXNfbnVtZXJpYyh2YWwpKSB7XG4gICAgICAgIHZhcl90eXBlID0gJ251bWJlcic7XG4gICAgICAgIHJldHVybiAobG93ZXJfcHJpbWl0aXZlcyA/IHZhcl90eXBlIDogY2FwaXRhbGl6ZSh2YXJfdHlwZSkpO1xuICAgIH1cbiAgICBpZigodmFsWzBdID09PSAnXFwnJykgfHwgKHZhbFswXSA9PT0gJ1wiJykpIHtcbiAgICAgICAgdmFyX3R5cGUgPSAnc3RyaW5nJztcbiAgICAgICAgcmV0dXJuIChsb3dlcl9wcmltaXRpdmVzID8gdmFyX3R5cGUgOiBjYXBpdGFsaXplKHZhcl90eXBlKSk7XG4gICAgfVxuICAgIGlmKHZhbFswXSA9PSAnWycpIHtcbiAgICAgICAgcmV0dXJuICdBcnJheSc7XG4gICAgfVxuICAgIGlmKHZhbFswXSA9PSAneycpIHtcbiAgICAgICAgcmV0dXJuICdPYmplY3QnO1xuICAgIH1cbiAgICBpZigodmFsID09ICd0cnVlJykgfHwgKHZhbCA9PSAnZmFsc2UnKSkge1xuICAgICAgICB2YXIgcmV0X3ZhbCA9IChzaG9ydF9wcmltaXRpdmVzID8gJ0Jvb2wnIDogJ0Jvb2xlYW4nKTtcbiAgICAgICAgcmV0dXJuIChsb3dlcl9wcmltaXRpdmVzID8gcmV0X3ZhbCA6IGNhcGl0YWxpemUocmV0X3ZhbCkpO1xuICAgIH1cbiAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKCdSZWdFeHBcXFxcYnxcXFxcXFwvW15cXFxcL10nKTtcbiAgICBpZihyZWdleC50ZXN0KHZhbCkpIHtcbiAgICAgICAgcmV0dXJuICdSZWdFeHAnO1xuICAgIH1cbiAgICBpZih2YWwuc2xpY2UoMCwgNCkgPT0gJ25ldyAnKSB7XG4gICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnbmV3ICgnICsgdGhpcy5zZXR0aW5ncy5mbklkZW50aWZpZXIgKyAnKScpO1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWModmFsKTtcbiAgICAgICAgcmV0dXJuIChtYXRjaGVzWzBdICYmIG1hdGNoZXNbMV0pIHx8IG51bGw7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBKc1BhcnNlcjtcbiJdfQ==