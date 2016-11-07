var DocsParser = require('../docsparser');
var xregexp = require('../xregexp').XRegExp;
var util = require('util');

function TypescriptParser(settings) {
    DocsParser.call(this, settings);
}

TypescriptParser.prototype = Object.create(DocsParser.prototype);

TypescriptParser.prototype.setup_settings = function () {
    var identifier = '[a-zA-Z_$][a-zA-Z_$0-9]*';
    var base_type_identifier = util.format('%s(\\.%s)*(\\[\\])?', identifier, identifier);
    var parametric_type_identifier = util.format('%s(\\s*<\\s*%s(\\s*,\\s*%s\\s*)*>)?', base_type_identifier, base_type_identifier, base_type_identifier);
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
        'function': 'Function',
        'functionRE':
        // Modifiers
        '(?:public|private|static)?\\s*' +
        // Method name
        '(?P<name>' + identifier + ')\\s*' +
        // Params
        '\\((?P<args>.*)\\)\\s*' +
        // Return value
        '(:\\s*(?P<retval>' + parametric_type_identifier + '))?',
        'var_re': '((public|private|static|var)\\s+)?(?P<name>' + identifier + ')\\s*(:\\s*(?P<type>' + parametric_type_identifier + '))?(\\s*=\\s*(?P<val>.*?))?([;,]|$)'
    };
};

TypescriptParser.prototype.parse_function = function (line) {
    line = line.trim();
    var regex = xregexp(this.settings.function_re);
    var matches = xregexp.exec(line, regex);
    if (matches !== null) return null;

    return [matches.name, matches.args, matches.retval];
};

TypescriptParser.prototype.get_arg_type = function (arg) {
    if (arg.indexOf(':') > -1) {
        var arg_list = arg.split(':');
        return arg[arg_list.length].trim();
    }
    return null;
};

TypescriptParser.prototype.get_arg_name = function (arg) {
    if (arg.indexOf(':') > -1) arg = arg.split(':')[0];

    var regex = /[ \?]/g;
    return arg.replace(regex, '');
};

TypescriptParser.prototype.parse_var = function (line) {
    var regex = xregexp(this.settings.var_re);
    var matches = xregexp.exec(line, regex);
    if (matches == null) return null;
    var val = matches.val;
    if (val != null) val = val.trim();

    return [matches.name, val, matches.type];
};

TypescriptParser.prototype.get_function_return_type = function (name, retval) {
    return retval != 'void' ? retval : null;
};

TypescriptParser.prototype.guess_type_from_value = function (val) {
    var lowerPrimitives = this.editor_settings.lower_case_primitives || false;
    if (this.is_numeric(val)) return lowerPrimitives ? 'number' : 'Number';
    if (val[0] == '\'' || val[0] == '"') return lowerPrimitives ? 'string' : 'String';
    if (val[0] == '[') return 'Array';
    if (val[0] == '{') return 'Object';
    if (val == 'true' || val == 'false') return lowerPrimitives ? 'boolean' : 'Boolean';
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

module.exports = TypescriptParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvZG9jYmxvY2tyL2xpYi9sYW5ndWFnZXMvdHlwZXNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDMUMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUM1QyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTNCLFNBQVMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFO0FBQ2hDLGNBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0NBQ25DOztBQUVELGdCQUFnQixDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFakUsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxZQUFXO0FBQ25ELFFBQUksVUFBVSxHQUFHLDBCQUEwQixDQUFDO0FBQzVDLFFBQUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdEYsUUFBSSwwQkFBMEIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHFDQUFxQyxFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixDQUFDLENBQUM7QUFDdEosUUFBSSxDQUFDLFFBQVEsR0FBRzs7QUFFWixvQkFBWSxFQUFFLElBQUk7QUFDbEIsa0JBQVUsRUFBRSxJQUFJO0FBQ2hCLGlCQUFTLEVBQUUsTUFBTTs7QUFFakIsdUJBQWUsRUFBRSxVQUFVO0FBQzNCLHNCQUFjLEVBQUUsVUFBVTtBQUMxQixrQkFBVSxFQUFFLGlCQUFpQixHQUFHLFVBQVUsR0FBRyxXQUFXO0FBQ3hELHVCQUFlLEVBQUUsS0FBSztBQUN0QixjQUFNLEVBQUUsU0FBUztBQUNqQixrQkFBVSxFQUFFLFVBQVU7QUFDdEIsb0JBQVk7O0FBRVIsd0NBQWdDOztBQUVoQyxtQkFBVyxHQUFHLFVBQVUsR0FBRyxPQUFPOztBQUVsQyxnQ0FBd0I7O0FBRXhCLDJCQUFtQixHQUFHLDBCQUEwQixHQUFHLEtBQUs7QUFDNUQsZ0JBQVEsRUFDSiw2Q0FBNkMsR0FBRyxVQUFVLEdBQzFELHNCQUFzQixHQUFHLDBCQUEwQixHQUNuRCxxQ0FBcUM7S0FDNUMsQ0FBQztDQUNMLENBQUM7O0FBRUYsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxVQUFTLElBQUksRUFBRTtBQUN2RCxRQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLFFBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQy9DLFFBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3hDLFFBQUcsT0FBTyxLQUFLLElBQUksRUFDZixPQUFPLElBQUksQ0FBQzs7QUFFaEIsV0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDdkQsQ0FBQzs7QUFFRixnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVMsR0FBRyxFQUFFO0FBQ3BELFFBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUN0QixZQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLGVBQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUN0QztBQUNELFdBQU8sSUFBSSxDQUFDO0NBQ2YsQ0FBQzs7QUFFRixnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVMsR0FBRyxFQUFFO0FBQ3BELFFBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDcEIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTVCLFFBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQztBQUNyQixXQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQ2pDLENBQUM7O0FBRUYsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFTLElBQUksRUFBRTtBQUNsRCxRQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxQyxRQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN4QyxRQUFHLE9BQU8sSUFBSSxJQUFJLEVBQ2QsT0FBTyxJQUFJLENBQUM7QUFDaEIsUUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUN0QixRQUFHLEdBQUcsSUFBSSxJQUFJLEVBQ1YsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFckIsV0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM1QyxDQUFDOztBQUVGLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsR0FBRyxVQUFTLElBQUksRUFBRSxNQUFNLEVBQUU7QUFDekUsV0FBUSxBQUFDLE1BQU0sSUFBSSxNQUFNLEdBQUksTUFBTSxHQUFHLElBQUksQ0FBRTtDQUMvQyxDQUFDOztBQUVGLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsR0FBRyxVQUFTLEdBQUcsRUFBRTtBQUM3RCxRQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFxQixJQUFJLEtBQUssQ0FBQztBQUMxRSxRQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQ25CLE9BQVEsZUFBZSxHQUFHLFFBQVEsR0FBRyxRQUFRLENBQUU7QUFDbkQsUUFBRyxBQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQUFBQyxFQUNsQyxPQUFRLGVBQWUsR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFFO0FBQ25ELFFBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFDWixPQUFPLE9BQU8sQ0FBQztBQUNuQixRQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQ1osT0FBTyxRQUFRLENBQUM7QUFDcEIsUUFBRyxBQUFDLEdBQUcsSUFBSSxNQUFNLElBQU0sR0FBRyxJQUFJLE9BQU8sQUFBQyxFQUNsQyxPQUFRLGVBQWUsR0FBRyxTQUFTLEdBQUcsU0FBUyxDQUFFO0FBQ3JELFFBQUksS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDOUMsUUFBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2hCLGVBQU8sUUFBUSxDQUFDO0tBQ25CO0FBQ0QsUUFBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxNQUFNLEVBQUU7QUFDekIsYUFBSyxHQUFHLElBQUksTUFBTSxDQUNkLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQ3pDLENBQUM7QUFDTixZQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLGVBQU8sQUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFLLElBQUksQ0FBQztLQUM3QztBQUNELFdBQU8sSUFBSSxDQUFDO0NBQ2YsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLGdCQUFnQixDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvZG9jYmxvY2tyL2xpYi9sYW5ndWFnZXMvdHlwZXNjcmlwdC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBEb2NzUGFyc2VyID0gcmVxdWlyZShcIi4uL2RvY3NwYXJzZXJcIik7XG52YXIgeHJlZ2V4cCA9IHJlcXVpcmUoJy4uL3hyZWdleHAnKS5YUmVnRXhwO1xudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbmZ1bmN0aW9uIFR5cGVzY3JpcHRQYXJzZXIoc2V0dGluZ3MpIHtcbiAgICBEb2NzUGFyc2VyLmNhbGwodGhpcywgc2V0dGluZ3MpO1xufVxuXG5UeXBlc2NyaXB0UGFyc2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRG9jc1BhcnNlci5wcm90b3R5cGUpO1xuXG5UeXBlc2NyaXB0UGFyc2VyLnByb3RvdHlwZS5zZXR1cF9zZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpZGVudGlmaWVyID0gJ1thLXpBLVpfJF1bYS16QS1aXyQwLTldKic7XG4gICAgdmFyIGJhc2VfdHlwZV9pZGVudGlmaWVyID0gdXRpbC5mb3JtYXQoJyVzKFxcXFwuJXMpKihcXFxcW1xcXFxdKT8nLCBpZGVudGlmaWVyLCBpZGVudGlmaWVyKTtcbiAgICB2YXIgcGFyYW1ldHJpY190eXBlX2lkZW50aWZpZXIgPSB1dGlsLmZvcm1hdCgnJXMoXFxcXHMqPFxcXFxzKiVzKFxcXFxzKixcXFxccyolc1xcXFxzKikqPik/JywgYmFzZV90eXBlX2lkZW50aWZpZXIsIGJhc2VfdHlwZV9pZGVudGlmaWVyLCBiYXNlX3R5cGVfaWRlbnRpZmllcik7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHtcbiAgICAgICAgLy8gY3VybHkgYnJhY2tldHMgYXJvdW5kIHRoZSB0eXBlIGluZm9ybWF0aW9uXG4gICAgICAgICdjdXJseVR5cGVzJzogdHJ1ZSxcbiAgICAgICAgJ3R5cGVJbmZvJzogdHJ1ZSxcbiAgICAgICAgJ3R5cGVUYWcnOiAndHlwZScsXG4gICAgICAgIC8vIHRlY2huaWNhbGx5LCB0aGV5IGNhbiBjb250YWluIGFsbCBzb3J0cyBvZiB1bmljb2RlLCBidXQgdy9lXG4gICAgICAgICd2YXJJZGVudGlmaWVyJzogaWRlbnRpZmllcixcbiAgICAgICAgJ2ZuSWRlbnRpZmllcic6IGlkZW50aWZpZXIsXG4gICAgICAgICdmbk9wZW5lcic6ICdmdW5jdGlvbig/OlxcXFxzKycgKyBpZGVudGlmaWVyICsgJyk/XFxcXHMqXFxcXCgnLFxuICAgICAgICAnY29tbWVudENsb3Nlcic6ICcgKi8nLFxuICAgICAgICAnYm9vbCc6ICdCb29sZWFuJyxcbiAgICAgICAgJ2Z1bmN0aW9uJzogJ0Z1bmN0aW9uJyxcbiAgICAgICAgJ2Z1bmN0aW9uUkUnOlxuICAgICAgICAgICAgLy8gTW9kaWZpZXJzXG4gICAgICAgICAgICAnKD86cHVibGljfHByaXZhdGV8c3RhdGljKT9cXFxccyonICtcbiAgICAgICAgICAgIC8vIE1ldGhvZCBuYW1lXG4gICAgICAgICAgICAnKD9QPG5hbWU+JyArIGlkZW50aWZpZXIgKyAnKVxcXFxzKicgK1xuICAgICAgICAgICAgLy8gUGFyYW1zXG4gICAgICAgICAgICAnXFxcXCgoP1A8YXJncz4uKilcXFxcKVxcXFxzKicgK1xuICAgICAgICAgICAgLy8gUmV0dXJuIHZhbHVlXG4gICAgICAgICAgICAnKDpcXFxccyooP1A8cmV0dmFsPicgKyBwYXJhbWV0cmljX3R5cGVfaWRlbnRpZmllciArICcpKT8nLFxuICAgICAgICAndmFyX3JlJzpcbiAgICAgICAgICAgICcoKHB1YmxpY3xwcml2YXRlfHN0YXRpY3x2YXIpXFxcXHMrKT8oP1A8bmFtZT4nICsgaWRlbnRpZmllciArXG4gICAgICAgICAgICAnKVxcXFxzKig6XFxcXHMqKD9QPHR5cGU+JyArIHBhcmFtZXRyaWNfdHlwZV9pZGVudGlmaWVyICtcbiAgICAgICAgICAgICcpKT8oXFxcXHMqPVxcXFxzKig/UDx2YWw+Lio/KSk/KFs7LF18JCknXG4gICAgfTtcbn07XG5cblR5cGVzY3JpcHRQYXJzZXIucHJvdG90eXBlLnBhcnNlX2Z1bmN0aW9uID0gZnVuY3Rpb24obGluZSkge1xuICAgIGxpbmUgPSBsaW5lLnRyaW0oKTtcbiAgICB2YXIgcmVnZXggPSB4cmVnZXhwKHRoaXMuc2V0dGluZ3MuZnVuY3Rpb25fcmUpO1xuICAgIHZhciBtYXRjaGVzID0geHJlZ2V4cC5leGVjKGxpbmUsIHJlZ2V4KTtcbiAgICBpZihtYXRjaGVzICE9PSBudWxsKVxuICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgIHJldHVybiBbbWF0Y2hlcy5uYW1lLCBtYXRjaGVzLmFyZ3MsIG1hdGNoZXMucmV0dmFsXTtcbn07XG5cblR5cGVzY3JpcHRQYXJzZXIucHJvdG90eXBlLmdldF9hcmdfdHlwZSA9IGZ1bmN0aW9uKGFyZykge1xuICAgIGlmKGFyZy5pbmRleE9mKCc6JykgPiAtMSkge1xuICAgICAgICB2YXIgYXJnX2xpc3QgPSBhcmcuc3BsaXQoJzonKTtcbiAgICAgICAgcmV0dXJuIGFyZ1thcmdfbGlzdC5sZW5ndGhdLnRyaW0oKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5UeXBlc2NyaXB0UGFyc2VyLnByb3RvdHlwZS5nZXRfYXJnX25hbWUgPSBmdW5jdGlvbihhcmcpIHtcbiAgICBpZihhcmcuaW5kZXhPZignOicpID4gLTEpXG4gICAgICAgIGFyZyA9IGFyZy5zcGxpdCgnOicpWzBdO1xuXG4gICAgdmFyIHJlZ2V4ID0gL1sgXFw/XS9nO1xuICAgIHJldHVybiBhcmcucmVwbGFjZShyZWdleCwgJycpO1xufTtcblxuVHlwZXNjcmlwdFBhcnNlci5wcm90b3R5cGUucGFyc2VfdmFyID0gZnVuY3Rpb24obGluZSkge1xuICAgIHZhciByZWdleCA9IHhyZWdleHAodGhpcy5zZXR0aW5ncy52YXJfcmUpO1xuICAgIHZhciBtYXRjaGVzID0geHJlZ2V4cC5leGVjKGxpbmUsIHJlZ2V4KTtcbiAgICBpZihtYXRjaGVzID09IG51bGwpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIHZhciB2YWwgPSBtYXRjaGVzLnZhbDtcbiAgICBpZih2YWwgIT0gbnVsbClcbiAgICAgICAgdmFsID0gdmFsLnRyaW0oKTtcblxuICAgIHJldHVybiBbbWF0Y2hlcy5uYW1lLCB2YWwsIG1hdGNoZXMudHlwZV07XG59O1xuXG5UeXBlc2NyaXB0UGFyc2VyLnByb3RvdHlwZS5nZXRfZnVuY3Rpb25fcmV0dXJuX3R5cGUgPSBmdW5jdGlvbihuYW1lLCByZXR2YWwpIHtcbiAgICByZXR1cm4gKChyZXR2YWwgIT0gJ3ZvaWQnKSA/IHJldHZhbCA6IG51bGwpO1xufTtcblxuVHlwZXNjcmlwdFBhcnNlci5wcm90b3R5cGUuZ3Vlc3NfdHlwZV9mcm9tX3ZhbHVlID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIGxvd2VyUHJpbWl0aXZlcyA9IHRoaXMuZWRpdG9yX3NldHRpbmdzLmxvd2VyX2Nhc2VfcHJpbWl0aXZlcyB8fCBmYWxzZTtcbiAgICBpZih0aGlzLmlzX251bWVyaWModmFsKSlcbiAgICAgICAgcmV0dXJuIChsb3dlclByaW1pdGl2ZXMgPyAnbnVtYmVyJyA6ICdOdW1iZXInKTtcbiAgICBpZigodmFsWzBdID09ICdcXCcnKSB8fCAodmFsWzBdID09ICdcIicpKVxuICAgICAgICByZXR1cm4gKGxvd2VyUHJpbWl0aXZlcyA/ICdzdHJpbmcnIDogJ1N0cmluZycpO1xuICAgIGlmKHZhbFswXSA9PSAnWycpXG4gICAgICAgIHJldHVybiAnQXJyYXknO1xuICAgIGlmKHZhbFswXSA9PSAneycpXG4gICAgICAgIHJldHVybiAnT2JqZWN0JztcbiAgICBpZigodmFsID09ICd0cnVlJykgfHwgKHZhbCA9PSAnZmFsc2UnKSlcbiAgICAgICAgcmV0dXJuIChsb3dlclByaW1pdGl2ZXMgPyAnYm9vbGVhbicgOiAnQm9vbGVhbicpO1xuICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAoJ1JlZ0V4cFxcXFxifFxcXFwvW15cXFxcL10nKTtcbiAgICBpZihyZWdleC50ZXN0KHZhbCkpIHtcbiAgICAgICAgcmV0dXJuICdSZWdFeHAnO1xuICAgIH1cbiAgICBpZih2YWwuc2xpY2UoMCw0KSA9PSAnbmV3ICcpIHtcbiAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKFxuICAgICAgICAgICAgJ25ldyAoJyArIHRoaXMuc2V0dGluZ3MuZm5JZGVudGlmaWVyICsgJyknXG4gICAgICAgICAgICApO1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWModmFsKTtcbiAgICAgICAgcmV0dXJuIChtYXRjaGVzWzBdICYmIG1hdGNoZXNbMV0pIHx8IG51bGw7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlc2NyaXB0UGFyc2VyO1xuIl19