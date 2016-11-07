var DocsParser = require('../docsparser');
var xregexp = require('../xregexp').XRegExp;
var util = require('util');

function JavaParser(settings) {
    DocsParser.call(this, settings);
}

JavaParser.prototype = Object.create(DocsParser.prototype);

JavaParser.prototype.setup_settings = function () {
    var identifier = '[a-zA-Z_$][a-zA-Z_$0-9]*';
    this.settings = {
        'curlyTypes': false,
        'typeInfo': false,
        'typeTag': 'type',
        'varIdentifier': identifier,
        'fnIdentifier': identifier,
        'fnOpener': identifier + '(?:\\s+' + identifier + ')?\\s*\\(',
        'commentCloser': ' */',
        'bool': 'Boolean',
        'function': 'Function'
    };
};

JavaParser.prototype.parse_function = function (line) {
    line = line.trim();
    var regex = xregexp(
    // Modifiers
    '(?:(public|protected|private|static|abstract|final|transient|synchronized|native|strictfp)\\s+)*' +
    // Return value
    '(?P<retval>[a-zA-Z_$][\\<\\>\\., a-zA-Z_$0-9]+)\\s+' +
    // Method name
    '(?P<name>' + this.settings.fnIdentifier + ')\\s*' +
    // Params
    '\\((?P<args>.*)\\)\\s*' +
    // # Throws ,
    '(?:throws){0,1}\\s*(?P<throwed>[a-zA-Z_$0-9\\.,\\s]*)');

    var matches = xregexp.exec(line, regex);
    if (matches == null) return null;

    var name = matches.name;
    var retval = matches.retval;
    var full_args = matches.args;
    var arg_throws = matches.throwed || '';

    var arg_list = [];
    var full_args_list = full_args.split(',');
    var i, len;
    for (i = 0; len = full_args_list.length, i < len; i++) {
        var arg = full_args_list[i];
        arg_list.push(arg.trim().split(' ')[len]);
    }
    var args = arg_list.join(',');

    var throws_list = [];
    var arg_throws_list = arg_throws.split(',');
    for (i = 0; len = arg_throws_list.length, i < len; i++) {
        arg = arg_throws_list[i];
        throws_list.push(arg.trim().split(' ')[len]);
    }
    arg_throws = throws_list.join(',');
    return [name, args, retval, arg_throws];
};

JavaParser.prototype.parse_var = function (line) {
    return null;
};

JavaParser.prototype.guess_type_from_value = function (val) {
    return null;
};

JavaParser.prototype.format_function = function (name, args, retval, throws_args, options) {
    options = typeof options !== 'undefined' ? options : {};
    var out = DocsParser.prototype.format_function.call(this, name, args, retval, options);
    if (throws_args !== '') {
        var list = this.parse_args(throws_args);
        for (var key in list) {
            var unused = key;
            var exceptionName = list.key;
            var type_info = this.get_type_info(unused, exceptionName);
            out.push(util.format('@throws %s%s ${1:[description]}', type_info, this.escape(exceptionName)));
        }
    }
    return out;
};

JavaParser.prototype.get_function_return_type = function (name, retval) {
    if (retval == 'void') return null;else return retval;
};

JavaParser.prototype.get_definition = function (editor, pos, read_line) {
    var maxLines = 25; // don't go further than this

    var definition = '';
    var open_curly_annotation = false;
    var open_paren_annotation = false;

    var i, len;
    for (i = 0; i < maxLines; i++) {
        var line = read_line(editor, pos);
        if (line == null) break;

        pos.row += 1;
        // Move past empty lines
        if (line.search(/^\s*$/) > -1) continue;

        // strip comments
        line = line.replace(/\/\/.*/, '');
        line = line.replace(/\/\*.*\*\//, '');
        if (definition === '') {
            // Must check here for function opener on same line as annotation
            if (this.settings.fnOpener && line.search(RegExp(this.settings.fnOpener)) > -1) {}
            // Handle Annotations
            else if (line.search(/^\s*@/) > -1) {
                if (line.search('{') > -1 && !(line.search('}') > -1)) open_curly_annotation = true;
                if (line.search('(') > -1 && !(line.search(')') > -1)) open_paren_annotation = true;
                continue;
            } else if (open_curly_annotation) {
                if (line.search('}') > -1) open_curly_annotation = false;
                continue;
            } else if (open_paren_annotation) {
                if (line.search(')') > -1) open_paren_annotation = false;
            } else if (line.search(/^\s*$/) > -1) continue;
            // Check for function
            else if (!this.settings.fnOpener || !(line.search(RegExp(this.settings.fnOpener)) > -1)) {
                definition = line;
                break;
            }
        }
        definition += line;
        if (line.indexOf(';') > -1 || line.indexOf('{') > -1) {
            var regex = new RegExp('\\s*[;{]\\s*$', 'g');
            definition = definition.replace(regex, '');
            break;
        }
    }
    return definition;
};

module.exports = JavaParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvZG9jYmxvY2tyL2xpYi9sYW5ndWFnZXMvamF2YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDMUMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUM1QyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTNCLFNBQVMsVUFBVSxDQUFDLFFBQVEsRUFBRTtBQUMxQixjQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztDQUNuQzs7QUFFRCxVQUFVLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUzRCxVQUFVLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxZQUFXO0FBQzdDLFFBQUksVUFBVSxHQUFHLDBCQUEwQixDQUFDO0FBQzVDLFFBQUksQ0FBQyxRQUFRLEdBQUc7QUFDWixvQkFBWSxFQUFFLEtBQUs7QUFDbkIsa0JBQVUsRUFBRSxLQUFLO0FBQ2pCLGlCQUFTLEVBQUUsTUFBTTtBQUNqQix1QkFBZSxFQUFFLFVBQVU7QUFDM0Isc0JBQWMsRUFBRyxVQUFVO0FBQzNCLGtCQUFVLEVBQUUsVUFBVSxHQUFHLFNBQVMsR0FBRyxVQUFVLEdBQUcsV0FBVztBQUM3RCx1QkFBZSxFQUFFLEtBQUs7QUFDdEIsY0FBTSxFQUFFLFNBQVM7QUFDakIsa0JBQVUsRUFBRSxVQUFVO0tBQ3pCLENBQUM7Q0FDTCxDQUFDOztBQUVGLFVBQVUsQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ2pELFFBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsUUFBSSxLQUFLLEdBQUcsT0FBTzs7QUFFZixzR0FBa0c7O0FBRWxH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QUMsR0FBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ3JCLHFCQUFxQixHQUFHLEtBQUssQ0FBQzthQUNyQyxNQUNJLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDN0IsU0FBUzs7aUJBRVIsSUFBRyxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxBQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUEsQUFBQyxFQUFFO0FBQ3RGLDBCQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLHNCQUFNO2FBQ1Q7U0FDSjtBQUNELGtCQUFVLElBQUcsSUFBSSxDQUFDO0FBQ2xCLFlBQUcsQUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEFBQUMsRUFBRTtBQUNyRCxnQkFBSSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzdDLHNCQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDM0Msa0JBQU07U0FDVDtLQUNKO0FBQ0QsV0FBTyxVQUFVLENBQUM7Q0FDckIsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiIvVXNlcnMvbWsyLy5hdG9tL3BhY2thZ2VzL2RvY2Jsb2Nrci9saWIvbGFuZ3VhZ2VzL2phdmEuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgRG9jc1BhcnNlciA9IHJlcXVpcmUoXCIuLi9kb2NzcGFyc2VyXCIpO1xudmFyIHhyZWdleHAgPSByZXF1aXJlKCcuLi94cmVnZXhwJykuWFJlZ0V4cDtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5mdW5jdGlvbiBKYXZhUGFyc2VyKHNldHRpbmdzKSB7XG4gICAgRG9jc1BhcnNlci5jYWxsKHRoaXMsIHNldHRpbmdzKTtcbn1cblxuSmF2YVBhcnNlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERvY3NQYXJzZXIucHJvdG90eXBlKTtcblxuSmF2YVBhcnNlci5wcm90b3R5cGUuc2V0dXBfc2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaWRlbnRpZmllciA9ICdbYS16QS1aXyRdW2EtekEtWl8kMC05XSonO1xuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICAgICdjdXJseVR5cGVzJzogZmFsc2UsXG4gICAgICAgICd0eXBlSW5mbyc6IGZhbHNlLFxuICAgICAgICAndHlwZVRhZyc6ICd0eXBlJyxcbiAgICAgICAgJ3ZhcklkZW50aWZpZXInOiBpZGVudGlmaWVyLFxuICAgICAgICAnZm5JZGVudGlmaWVyJzogIGlkZW50aWZpZXIsXG4gICAgICAgICdmbk9wZW5lcic6IGlkZW50aWZpZXIgKyAnKD86XFxcXHMrJyArIGlkZW50aWZpZXIgKyAnKT9cXFxccypcXFxcKCcsXG4gICAgICAgICdjb21tZW50Q2xvc2VyJzogJyAqLycsXG4gICAgICAgICdib29sJzogJ0Jvb2xlYW4nLFxuICAgICAgICAnZnVuY3Rpb24nOiAnRnVuY3Rpb24nXG4gICAgfTtcbn07XG5cbkphdmFQYXJzZXIucHJvdG90eXBlLnBhcnNlX2Z1bmN0aW9uID0gZnVuY3Rpb24obGluZSkge1xuICAgIGxpbmUgPSBsaW5lLnRyaW0oKTtcbiAgICB2YXIgcmVnZXggPSB4cmVnZXhwKFxuICAgICAgICAvLyBNb2RpZmllcnNcbiAgICAgICAgJyg/OihwdWJsaWN8cHJvdGVjdGVkfHByaXZhdGV8c3RhdGljfGFic3RyYWN0fGZpbmFsfHRyYW5zaWVudHxzeW5jaHJvbml6ZWR8bmF0aXZlfHN0cmljdGZwKVxcXFxzKykqJyArXG4gICAgICAgIC8vIFJldHVybiB2YWx1ZVxuICAgICAgICAnKD9QPHJldHZhbD5bYS16QS1aXyRdW1xcXFw8XFxcXD5cXFxcLiwgYS16QS1aXyQwLTldKylcXFxccysnICtcbiAgICAgICAgLy8gTWV0aG9kIG5hbWVcbiAgICAgICAgJyg/UDxuYW1lPicgKyB0aGlzLnNldHRpbmdzLmZuSWRlbnRpZmllciArICcpXFxcXHMqJyArXG4gICAgICAgIC8vIFBhcmFtc1xuICAgICAgICAnXFxcXCgoP1A8YXJncz4uKilcXFxcKVxcXFxzKicgK1xuICAgICAgICAvLyAjIFRocm93cyAsXG4gICAgICAgICcoPzp0aHJvd3MpezAsMX1cXFxccyooP1A8dGhyb3dlZD5bYS16QS1aXyQwLTlcXFxcLixcXFxcc10qKSdcbiAgICAgICAgKTtcblxuICAgIHZhciBtYXRjaGVzID0geHJlZ2V4cC5leGVjKGxpbmUsIHJlZ2V4KTtcbiAgICBpZihtYXRjaGVzID09IG51bGwpXG4gICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgdmFyIG5hbWUgPSBtYXRjaGVzLm5hbWU7XG4gICAgdmFyIHJldHZhbCA9IG1hdGNoZXMucmV0dmFsO1xuICAgIHZhciBmdWxsX2FyZ3MgPSBtYXRjaGVzLmFyZ3M7XG4gICAgdmFyIGFyZ190aHJvd3MgPSBtYXRjaGVzLnRocm93ZWQgfHwgJyc7XG5cbiAgICB2YXIgYXJnX2xpc3QgPSBbXTtcbiAgICB2YXIgZnVsbF9hcmdzX2xpc3QgPSBmdWxsX2FyZ3Muc3BsaXQoJywnKTtcbiAgICB2YXIgaSwgbGVuO1xuICAgIGZvcihpPTA7IGxlbiA9IGZ1bGxfYXJnc19saXN0Lmxlbmd0aCwgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHZhciBhcmcgPSBmdWxsX2FyZ3NfbGlzdFtpXTtcbiAgICAgICAgYXJnX2xpc3QucHVzaChhcmcudHJpbSgpLnNwbGl0KCcgJylbbGVuXSk7XG4gICAgfVxuICAgIHZhciBhcmdzID0gYXJnX2xpc3Quam9pbignLCcpO1xuXG4gICAgdmFyIHRocm93c19saXN0ID0gW107XG4gICAgdmFyIGFyZ190aHJvd3NfbGlzdCA9IGFyZ190aHJvd3Muc3BsaXQoJywnKTtcbiAgICBmb3IoaT0wOyBsZW4gPSBhcmdfdGhyb3dzX2xpc3QubGVuZ3RoLCBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgYXJnID0gYXJnX3Rocm93c19saXN0W2ldO1xuICAgICAgICB0aHJvd3NfbGlzdC5wdXNoKGFyZy50cmltKCkuc3BsaXQoJyAnKVtsZW5dKTtcbiAgICB9XG4gICAgYXJnX3Rocm93cyA9IHRocm93c19saXN0LmpvaW4oJywnKTtcbiAgICByZXR1cm4gW25hbWUsIGFyZ3MsIHJldHZhbCwgYXJnX3Rocm93c107XG59O1xuXG5KYXZhUGFyc2VyLnByb3RvdHlwZS5wYXJzZV92YXIgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5KYXZhUGFyc2VyLnByb3RvdHlwZS5ndWVzc190eXBlX2Zyb21fdmFsdWUgPSBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkphdmFQYXJzZXIucHJvdG90eXBlLmZvcm1hdF9mdW5jdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIGFyZ3MsIHJldHZhbCwgdGhyb3dzX2FyZ3MsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gKHR5cGVvZiBvcHRpb25zICE9PSAndW5kZWZpbmVkJykgPyBvcHRpb25zIDoge307XG4gICAgdmFyIG91dCA9IERvY3NQYXJzZXIucHJvdG90eXBlLmZvcm1hdF9mdW5jdGlvbi5jYWxsKHRoaXMsIG5hbWUsIGFyZ3MsIHJldHZhbCwgb3B0aW9ucyk7XG4gICAgaWYodGhyb3dzX2FyZ3MgIT09ICcnKSB7XG4gICAgICAgIHZhciBsaXN0ID0gdGhpcy5wYXJzZV9hcmdzKHRocm93c19hcmdzKTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGxpc3QpIHtcbiAgICAgICAgICAgIHZhciB1bnVzZWQgPSBrZXk7XG4gICAgICAgICAgICB2YXIgZXhjZXB0aW9uTmFtZSA9IGxpc3Qua2V5O1xuICAgICAgICAgICAgdmFyIHR5cGVfaW5mbyA9IHRoaXMuZ2V0X3R5cGVfaW5mbyh1bnVzZWQsIGV4Y2VwdGlvbk5hbWUpO1xuICAgICAgICAgICAgb3V0LnB1c2goXG4gICAgICAgICAgICAgICAgICAgIHV0aWwuZm9ybWF0KCdAdGhyb3dzICVzJXMgJHsxOltkZXNjcmlwdGlvbl19JywgdHlwZV9pbmZvLCB0aGlzLmVzY2FwZShleGNlcHRpb25OYW1lKSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59O1xuXG5KYXZhUGFyc2VyLnByb3RvdHlwZS5nZXRfZnVuY3Rpb25fcmV0dXJuX3R5cGUgPSBmdW5jdGlvbihuYW1lLCByZXR2YWwpIHtcbiAgICBpZihyZXR2YWwgPT0gJ3ZvaWQnKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiByZXR2YWw7XG59O1xuXG5KYXZhUGFyc2VyLnByb3RvdHlwZS5nZXRfZGVmaW5pdGlvbiA9IGZ1bmN0aW9uKGVkaXRvciwgcG9zLCByZWFkX2xpbmUpIHtcbiAgICB2YXIgbWF4TGluZXMgPSAyNTsgIC8vIGRvbid0IGdvIGZ1cnRoZXIgdGhhbiB0aGlzXG5cbiAgICB2YXIgZGVmaW5pdGlvbiA9ICcnO1xuICAgIHZhciBvcGVuX2N1cmx5X2Fubm90YXRpb24gPSBmYWxzZTtcbiAgICB2YXIgb3Blbl9wYXJlbl9hbm5vdGF0aW9uID0gZmFsc2U7XG5cbiAgICB2YXIgaSwgbGVuO1xuICAgIGZvcihpPTA7IGkgPCBtYXhMaW5lczsgaSsrKSB7XG4gICAgICAgIHZhciBsaW5lID0gcmVhZF9saW5lKGVkaXRvciwgcG9zKTtcbiAgICAgICAgaWYobGluZSA9PSBudWxsKVxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgcG9zLnJvdys9IDE7XG4gICAgICAgIC8vIE1vdmUgcGFzdCBlbXB0eSBsaW5lc1xuICAgICAgICBpZihsaW5lLnNlYXJjaCgvXlxccyokLykgPiAtMSlcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIC8vIHN0cmlwIGNvbW1lbnRzXG4gICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoL1xcL1xcLy4qLywgJycpO1xuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKC9cXC9cXCouKlxcKlxcLy8sICcnKTtcbiAgICAgICAgaWYoZGVmaW5pdGlvbiA9PT0gJycpIHtcbiAgICAgICAgICAgIC8vIE11c3QgY2hlY2sgaGVyZSBmb3IgZnVuY3Rpb24gb3BlbmVyIG9uIHNhbWUgbGluZSBhcyBhbm5vdGF0aW9uXG4gICAgICAgICAgICBpZih0aGlzLnNldHRpbmdzLmZuT3BlbmVyICYmIChsaW5lLnNlYXJjaChSZWdFeHAodGhpcy5zZXR0aW5ncy5mbk9wZW5lcikpID4gLTEpKSB7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEhhbmRsZSBBbm5vdGF0aW9uc1xuICAgICAgICAgICAgZWxzZSBpZihsaW5lLnNlYXJjaCgvXlxccypALykgPiAtMSkge1xuICAgICAgICAgICAgICAgIGlmKChsaW5lLnNlYXJjaCgneycpID4gLTEpICYmICEoKGxpbmUuc2VhcmNoKCd9JykgPiAtMSkpKVxuICAgICAgICAgICAgICAgICAgICBvcGVuX2N1cmx5X2Fubm90YXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmKChsaW5lLnNlYXJjaCgnXFwoJykgPiAtMSkgJiYgIShsaW5lLnNlYXJjaCgnXFwpJykgPiAtMSkpXG4gICAgICAgICAgICAgICAgICAgIG9wZW5fcGFyZW5fYW5ub3RhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKG9wZW5fY3VybHlfYW5ub3RhdGlvbikge1xuICAgICAgICAgICAgICAgIGlmKGxpbmUuc2VhcmNoKCd9JykgPiAtMSlcbiAgICAgICAgICAgICAgICAgICAgb3Blbl9jdXJseV9hbm5vdGF0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKG9wZW5fcGFyZW5fYW5ub3RhdGlvbikge1xuICAgICAgICAgICAgICAgIGlmKGxpbmUuc2VhcmNoKCdcXCknKSA+IC0xKVxuICAgICAgICAgICAgICAgICAgICBvcGVuX3BhcmVuX2Fubm90YXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYobGluZS5zZWFyY2goL15cXHMqJC8pID4gLTEpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgZnVuY3Rpb25cbiAgICAgICAgICAgIGVsc2UgaWYoISh0aGlzLnNldHRpbmdzLmZuT3BlbmVyKSB8fCAhKGxpbmUuc2VhcmNoKFJlZ0V4cCh0aGlzLnNldHRpbmdzLmZuT3BlbmVyKSkgPiAtMSkpIHtcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uID0gbGluZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkZWZpbml0aW9uKz0gbGluZTtcbiAgICAgICAgaWYoKGxpbmUuaW5kZXhPZignOycpID4gLTEpIHx8IChsaW5lLmluZGV4T2YoJ3snKSA+IC0xKSkge1xuICAgICAgICAgICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnXFxcXHMqWzt7XVxcXFxzKiQnLCAnZycpO1xuICAgICAgICAgICAgZGVmaW5pdGlvbiA9IGRlZmluaXRpb24ucmVwbGFjZShyZWdleCwgJycpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlZmluaXRpb247XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEphdmFQYXJzZXI7XG4iXX0=