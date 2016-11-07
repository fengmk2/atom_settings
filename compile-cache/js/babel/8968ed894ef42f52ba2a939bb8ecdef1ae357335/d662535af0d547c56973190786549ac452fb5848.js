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
    // (?:(?([a-zA-Z_$][a-zA-Z_$0-9]*)\\s*[:=]\\s*)?(?:function\\*|get|set)\\s+)(?:([a-zA-Z_$][a-zA-Z_$0-9]*))?\\s*\\(\\s*(.*)\\)
    var regex = xregexp(
    //   fnName = function,  fnName : function
    '(?:(?:(?P<name1>' + this.settings.varIdentifier + ')\\s*[:=]\\s*)?' + '(?:function\\*?|get|set)\\s+)?' +
    // function fnName
    '(?:(?P<name2>' + this.settings.fnIdentifier + '))?' +
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
    if (val[0] === '[') {
        return 'Array';
    }
    if (val[0] === '{') {
        return 'Object';
    }
    if (val === 'true' || val === 'false') {
        var ret_val = short_primitives ? 'Bool' : 'Boolean';
        return lower_primitives ? ret_val : capitalize(ret_val);
    }
    var regex = new RegExp('RegExp\\b|\\/[^\\/]');
    if (regex.test(val)) {
        return 'RegExp';
    }
    if (val.slice(0, 4) === 'new ') {
        regex = new RegExp('new (' + this.settings.fnIdentifier + ')');
        var matches = regex.exec(val);
        return matches[0] && matches[1] || null;
    }
    return null;
};

module.exports = JsParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvZG9jYmxvY2tyL2xpYi9sYW5ndWFnZXMvamF2YXNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDMUMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQzs7QUFFNUMsU0FBUyxRQUFRLENBQUMsUUFBUSxFQUFFOzs7QUFHeEIsY0FBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDbkM7O0FBRUQsUUFBUSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFekQsUUFBUSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsWUFBVztBQUMzQyxRQUFJLFVBQVUsR0FBRywwQkFBMEIsQ0FBQztBQUM1QyxRQUFJLENBQUMsUUFBUSxHQUFHOztBQUVaLG9CQUFZLEVBQUUsSUFBSTtBQUNsQixrQkFBVSxFQUFFLElBQUk7QUFDaEIsaUJBQVMsRUFBRSxNQUFNOztBQUVqQix1QkFBZSxFQUFFLFVBQVU7QUFDM0Isc0JBQWMsRUFBRyxVQUFVO0FBQzNCLGtCQUFVLEVBQUUsaUJBQWlCLEdBQUcsVUFBVSxHQUFHLFdBQVc7QUFDeEQsdUJBQWUsRUFBRSxLQUFLO0FBQ3RCLGNBQU0sRUFBRSxTQUFTO0FBQ2pCLGtCQUFVLEVBQUUsVUFBVTtLQUN6QixDQUFDO0NBQ0wsQ0FBQzs7QUFFRixRQUFRLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxVQUFTLElBQUksRUFBRTs7QUFFL0MsUUFBSSxLQUFLLEdBQUcsT0FBTzs7QUFFZixzQkFBa0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsR0FBRyxpQkFBaUIsR0FDcEUsZ0NBQWdDOztBQUVoQyxtQkFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLENB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LFFBQVEsQ0FBQztLQUNuQjtBQUNELFFBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssTUFBTSxFQUFFO0FBQzNCLGFBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDL0QsWUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixlQUFPLEFBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSyxJQUFJLENBQUM7S0FDN0M7QUFDRCxXQUFPLElBQUksQ0FBQztDQUNmLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMiLCJmaWxlIjoiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9kb2NibG9ja3IvbGliL2xhbmd1YWdlcy9qYXZhc2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIERvY3NQYXJzZXIgPSByZXF1aXJlKFwiLi4vZG9jc3BhcnNlclwiKTtcbnZhciB4cmVnZXhwID0gcmVxdWlyZSgnLi4veHJlZ2V4cCcpLlhSZWdFeHA7XG5cbmZ1bmN0aW9uIEpzUGFyc2VyKHNldHRpbmdzKSB7XG4gICAgLy8gdGhpcy5zZXR1cF9zZXR0aW5ncygpO1xuICAgIC8vIGNhbGwgcGFyZW50IGNvbnN0cnVjdG9yXG4gICAgRG9jc1BhcnNlci5jYWxsKHRoaXMsIHNldHRpbmdzKTtcbn1cblxuSnNQYXJzZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEb2NzUGFyc2VyLnByb3RvdHlwZSk7XG5cbkpzUGFyc2VyLnByb3RvdHlwZS5zZXR1cF9zZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpZGVudGlmaWVyID0gJ1thLXpBLVpfJF1bYS16QS1aXyQwLTldKic7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHtcbiAgICAgICAgLy8gY3VybHkgYnJhY2tldHMgYXJvdW5kIHRoZSB0eXBlIGluZm9ybWF0aW9uXG4gICAgICAgICdjdXJseVR5cGVzJzogdHJ1ZSxcbiAgICAgICAgJ3R5cGVJbmZvJzogdHJ1ZSxcbiAgICAgICAgJ3R5cGVUYWcnOiAndHlwZScsXG4gICAgICAgIC8vIHRlY2huaWNhbGx5LCB0aGV5IGNhbiBjb250YWluIGFsbCBzb3J0cyBvZiB1bmljb2RlLCBidXQgdy9lXG4gICAgICAgICd2YXJJZGVudGlmaWVyJzogaWRlbnRpZmllcixcbiAgICAgICAgJ2ZuSWRlbnRpZmllcic6ICBpZGVudGlmaWVyLFxuICAgICAgICAnZm5PcGVuZXInOiAnZnVuY3Rpb24oPzpcXFxccysnICsgaWRlbnRpZmllciArICcpP1xcXFxzKlxcXFwoJyxcbiAgICAgICAgJ2NvbW1lbnRDbG9zZXInOiAnICovJyxcbiAgICAgICAgJ2Jvb2wnOiAnQm9vbGVhbicsXG4gICAgICAgICdmdW5jdGlvbic6ICdGdW5jdGlvbidcbiAgICB9O1xufTtcblxuSnNQYXJzZXIucHJvdG90eXBlLnBhcnNlX2Z1bmN0aW9uID0gZnVuY3Rpb24obGluZSkge1xuICAgIC8vICg/Oig/KFthLXpBLVpfJF1bYS16QS1aXyQwLTldKilcXFxccypbOj1dXFxcXHMqKT8oPzpmdW5jdGlvblxcXFwqfGdldHxzZXQpXFxcXHMrKSg/OihbYS16QS1aXyRdW2EtekEtWl8kMC05XSopKT9cXFxccypcXFxcKFxcXFxzKiguKilcXFxcKVxuICAgIHZhciByZWdleCA9IHhyZWdleHAoXG4gICAgICAgIC8vICAgZm5OYW1lID0gZnVuY3Rpb24sICBmbk5hbWUgOiBmdW5jdGlvblxuICAgICAgICAnKD86KD86KD9QPG5hbWUxPicgKyB0aGlzLnNldHRpbmdzLnZhcklkZW50aWZpZXIgKyAnKVxcXFxzKls6PV1cXFxccyopPycgK1xuICAgICAgICAnKD86ZnVuY3Rpb25cXFxcKj98Z2V0fHNldClcXFxccyspPycgK1xuICAgICAgICAvLyBmdW5jdGlvbiBmbk5hbWVcbiAgICAgICAgJyg/Oig/UDxuYW1lMj4nICsgdGhpcy5zZXR0aW5ncy5mbklkZW50aWZpZXIgKyAnKSk/JyArXG4gICAgICAgIC8vIChhcmcxLCBhcmcyKVxuICAgICAgICAnXFxcXHMqXFxcXChcXFxccyooP1A8YXJncz4uKilcXFxcKSdcbiAgICApO1xuXG4gICAgdmFyIG1hdGNoZXMgPSB4cmVnZXhwLmV4ZWMobGluZSwgcmVnZXgpO1xuICAgIGlmKG1hdGNoZXMgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIGdyYWIgdGhlIG5hbWUgb3V0IG9mIFwibmFtZTEgPSBmdW5jdGlvbiBuYW1lMihmb28pXCIgcHJlZmVycmluZyBuYW1lMVxuICAgIHZhciBuYW1lID0gbWF0Y2hlcy5uYW1lMSB8fCBtYXRjaGVzLm5hbWUyIHx8ICcnO1xuICAgIHZhciBhcmdzID0gbWF0Y2hlcy5hcmdzO1xuICAgIHJldHVybiBbbmFtZSwgYXJncywgbnVsbF07XG59O1xuXG5Kc1BhcnNlci5wcm90b3R5cGUucGFyc2VfdmFyID0gZnVuY3Rpb24obGluZSkge1xuICAgICAgICAvLyAgIHZhciBmb28gPSBibGFoLFxuICAgICAgICAvLyAgICAgICBmb28gPSBibGFoO1xuICAgICAgICAvLyAgIGJhei5mb28gPSBibGFoO1xuICAgICAgICAvLyAgIGJheiA9IHtcbiAgICAgICAgLy8gICAgICAgIGZvbyA6IGJsYWhcbiAgICAgICAgLy8gICB9XG4gICAgdmFyIHJlZ2V4ID0geHJlZ2V4cCgnKD9QPG5hbWU+JyArIHRoaXMuc2V0dGluZ3MudmFySWRlbnRpZmllciArICcpXFxcXHMqWz06XVxcXFxzKig/UDx2YWw+Lio/KSg/Ols7LF18JCknKTtcbiAgICB2YXIgbWF0Y2hlcyA9IHhyZWdleHAuZXhlYyhsaW5lLCByZWdleCk7XG4gICAgaWYobWF0Y2hlcyA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gdmFyaWFibGUgbmFtZSwgdmFyaWFibGUgdmFsdWVcbiAgICByZXR1cm4gW21hdGNoZXMubmFtZSwgbWF0Y2hlcy52YWwudHJpbSgpXTtcbn07XG5cbkpzUGFyc2VyLnByb3RvdHlwZS5ndWVzc190eXBlX2Zyb21fdmFsdWUgPSBmdW5jdGlvbih2YWwpIHtcbiAgICB2YXIgbG93ZXJfcHJpbWl0aXZlcyA9IHRoaXMuZWRpdG9yX3NldHRpbmdzLmxvd2VyX2Nhc2VfcHJpbWl0aXZlcyB8fCBmYWxzZTtcbiAgICB2YXIgc2hvcnRfcHJpbWl0aXZlcyA9IHRoaXMuZWRpdG9yX3NldHRpbmdzLnNob3J0X3ByaW1pdGl2ZXMgfHwgZmFsc2U7XG4gICAgdmFyIHZhcl90eXBlO1xuICAgIHZhciBjYXBpdGFsaXplID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XG4gICAgfTtcbiAgICBpZih0aGlzLmlzX251bWVyaWModmFsKSkge1xuICAgICAgICB2YXJfdHlwZSA9ICdudW1iZXInO1xuICAgICAgICByZXR1cm4gKGxvd2VyX3ByaW1pdGl2ZXMgPyB2YXJfdHlwZSA6IGNhcGl0YWxpemUodmFyX3R5cGUpKTtcbiAgICB9XG4gICAgaWYoKHZhbFswXSA9PT0gJ1xcJycpIHx8ICh2YWxbMF0gPT09ICdcIicpKSB7XG4gICAgICAgIHZhcl90eXBlID0gJ3N0cmluZyc7XG4gICAgICAgIHJldHVybiAobG93ZXJfcHJpbWl0aXZlcyA/IHZhcl90eXBlIDogY2FwaXRhbGl6ZSh2YXJfdHlwZSkpO1xuICAgIH1cbiAgICBpZih2YWxbMF0gPT09ICdbJykge1xuICAgICAgICByZXR1cm4gJ0FycmF5JztcbiAgICB9XG4gICAgaWYodmFsWzBdID09PSAneycpIHtcbiAgICAgICAgcmV0dXJuICdPYmplY3QnO1xuICAgIH1cbiAgICBpZigodmFsID09PSAndHJ1ZScpIHx8ICh2YWwgPT09ICdmYWxzZScpKSB7XG4gICAgICAgIHZhciByZXRfdmFsID0gKHNob3J0X3ByaW1pdGl2ZXMgPyAnQm9vbCcgOiAnQm9vbGVhbicpO1xuICAgICAgICByZXR1cm4gKGxvd2VyX3ByaW1pdGl2ZXMgPyByZXRfdmFsIDogY2FwaXRhbGl6ZShyZXRfdmFsKSk7XG4gICAgfVxuICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAoJ1JlZ0V4cFxcXFxifFxcXFxcXC9bXlxcXFwvXScpO1xuICAgIGlmKHJlZ2V4LnRlc3QodmFsKSkge1xuICAgICAgICByZXR1cm4gJ1JlZ0V4cCc7XG4gICAgfVxuICAgIGlmKHZhbC5zbGljZSgwLCA0KSA9PT0gJ25ldyAnKSB7XG4gICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnbmV3ICgnICsgdGhpcy5zZXR0aW5ncy5mbklkZW50aWZpZXIgKyAnKScpO1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWModmFsKTtcbiAgICAgICAgcmV0dXJuIChtYXRjaGVzWzBdICYmIG1hdGNoZXNbMV0pIHx8IG51bGw7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBKc1BhcnNlcjtcbiJdfQ==