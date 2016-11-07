var DocsParser = require('../docsparser');
var xregexp = require('../xregexp').XRegExp;
var util = require('util');

function CppParser(settings) {
    //this.setup_settings();
    // call parent constructor
    DocsParser.call(this, settings);
}

CppParser.prototype = Object.create(DocsParser.prototype);

CppParser.prototype.setup_settings = function () {
    var name_token = '[a-zA-Z_][a-zA-Z0-9_]*';
    var identifier = util.format('(%s)(::%s)?', name_token, name_token);
    this.settings = {
        'typeInfo': false,
        'curlyTypes': false,
        'typeTag': 'param',
        'commentCloser': ' */',
        'fnIdentifier': identifier,
        'varIdentifier': '(' + identifier + ')\\s*(?:\\[(?:' + identifier + ')?\\]|\\((?:(?:\\s*,\\s*)?[a-z]+)+\\s*\\))?',
        'fnOpener': identifier + '\\s+' + identifier + '\\s*\\(',
        'bool': 'bool',
        'function': 'function'
    };
};

CppParser.prototype.parse_function = function (line) {
    var regex = xregexp('(?P<retval>' + this.settings.varIdentifier + ')[&*\\s]+' + '(?P<name>' + this.settings.varIdentifier + ');?' +
    // void fnName
    // (arg1, arg2)
    '\\s*\\(\\s*(?P<args>.*)\\)');

    var matches = xregexp.exec(line, regex);
    if (matches === null) {
        return null;
    }

    return [matches.name, matches.args, matches.retval];
};

CppParser.prototype.parse_args = function (args) {
    if (args.trim() == 'void') return [];
    return DocsParser.prototype.parse_args.call(this, args);
    //return super(JsdocsCPP, self).parseArgs(args)
};

CppParser.prototype.get_arg_type = function (arg) {
    return null;
};

CppParser.prototype.get_arg_name = function (arg) {
    var regex = new RegExp(this.settings.varIdentifier + '(?:s*=.*)?$');
    var matches = regex.exec(arg);
    return matches[1];
};

CppParser.prototype.parse_var = function (line) {
    return null;
};

CppParser.prototype.guess_type_from_value = function (val) {
    return null;
};

CppParser.prototype.get_function_return_type = function (name, retval) {
    return retval != 'void' ? retval : null;
};

module.exports = CppParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvZG9jYmxvY2tyL2xpYi9sYW5ndWFnZXMvY3BwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUMxQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQzVDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFM0IsU0FBUyxTQUFTLENBQUMsUUFBUSxFQUFFOzs7QUFHekIsY0FBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDbkM7O0FBRUQsU0FBUyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFMUQsU0FBUyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsWUFBVztBQUM1QyxRQUFJLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQztBQUMxQyxRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDcEUsUUFBSSxDQUFDLFFBQVEsR0FBRztBQUNaLGtCQUFVLEVBQUUsS0FBSztBQUNqQixvQkFBWSxFQUFFLEtBQUs7QUFDbkIsaUJBQVMsRUFBRSxPQUFPO0FBQ2xCLHVCQUFlLEVBQUUsS0FBSztBQUN0QixzQkFBYyxFQUFFLFVBQVU7QUFDMUIsdUJBQWUsRUFBRSxHQUFHLEdBQUcsVUFBVSxHQUFHLGdCQUFnQixHQUFHLFVBQVUsR0FBRyw2Q0FBNkM7QUFDakgsa0JBQVUsRUFBRSxVQUFVLEdBQUcsTUFBTSxHQUFHLFVBQVUsR0FBRyxTQUFTO0FBQ3hELGNBQU0sRUFBRSxNQUFNO0FBQ2Qsa0JBQVUsRUFBRSxVQUFVO0tBQ3pCLENBQUM7Q0FDTCxDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ2hELFFBQUksS0FBSyxHQUFHLE9BQU8sQ0FDZixhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsV0FBVyxHQUN6RCxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsS0FBSzs7O0FBR2pELGdDQUE0QixDQUMvQixDQUFDOztBQUVGLFFBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3hDLFFBQUcsT0FBTyxLQUFLLElBQUksRUFBRTtBQUNqQixlQUFPLElBQUksQ0FBQztLQUNmOztBQUVELFdBQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQ3ZELENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDNUMsUUFBRyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksTUFBTSxFQUNwQixPQUFPLEVBQUUsQ0FBQztBQUNkLFdBQU8sVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzs7Q0FFM0QsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFTLEdBQUcsRUFBRTtBQUM3QyxXQUFPLElBQUksQ0FBQztDQUNmLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBUyxHQUFHLEVBQUU7QUFDN0MsUUFBSSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsYUFBYyxDQUFDLENBQUM7QUFDckUsUUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixXQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNyQixDQUFDOztBQUVGLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQzNDLFdBQU8sSUFBSSxDQUFDO0NBQ2YsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLHFCQUFxQixHQUFHLFVBQVMsR0FBRyxFQUFFO0FBQ3RELFdBQU8sSUFBSSxDQUFDO0NBQ2YsQ0FBQzs7QUFFRixTQUFTLENBQUMsU0FBUyxDQUFDLHdCQUF3QixHQUFHLFVBQVMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUNsRSxXQUFRLEFBQUMsTUFBTSxJQUFJLE1BQU0sR0FBSSxNQUFNLEdBQUcsSUFBSSxDQUFFO0NBQy9DLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMiLCJmaWxlIjoiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9kb2NibG9ja3IvbGliL2xhbmd1YWdlcy9jcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgRG9jc1BhcnNlciA9IHJlcXVpcmUoXCIuLi9kb2NzcGFyc2VyXCIpO1xudmFyIHhyZWdleHAgPSByZXF1aXJlKCcuLi94cmVnZXhwJykuWFJlZ0V4cDtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG5mdW5jdGlvbiBDcHBQYXJzZXIoc2V0dGluZ3MpIHtcbiAgICAvL3RoaXMuc2V0dXBfc2V0dGluZ3MoKTtcbiAgICAvLyBjYWxsIHBhcmVudCBjb25zdHJ1Y3RvclxuICAgIERvY3NQYXJzZXIuY2FsbCh0aGlzLCBzZXR0aW5ncyk7XG59XG5cbkNwcFBhcnNlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKERvY3NQYXJzZXIucHJvdG90eXBlKTtcblxuQ3BwUGFyc2VyLnByb3RvdHlwZS5zZXR1cF9zZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBuYW1lX3Rva2VuID0gJ1thLXpBLVpfXVthLXpBLVowLTlfXSonO1xuICAgIHZhciBpZGVudGlmaWVyID0gdXRpbC5mb3JtYXQoJyglcykoOjolcyk/JywgbmFtZV90b2tlbiwgbmFtZV90b2tlbik7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHtcbiAgICAgICAgJ3R5cGVJbmZvJzogZmFsc2UsXG4gICAgICAgICdjdXJseVR5cGVzJzogZmFsc2UsXG4gICAgICAgICd0eXBlVGFnJzogJ3BhcmFtJyxcbiAgICAgICAgJ2NvbW1lbnRDbG9zZXInOiAnICovJyxcbiAgICAgICAgJ2ZuSWRlbnRpZmllcic6IGlkZW50aWZpZXIsXG4gICAgICAgICd2YXJJZGVudGlmaWVyJzogJygnICsgaWRlbnRpZmllciArICcpXFxcXHMqKD86XFxcXFsoPzonICsgaWRlbnRpZmllciArICcpP1xcXFxdfFxcXFwoKD86KD86XFxcXHMqLFxcXFxzKik/W2Etel0rKStcXFxccypcXFxcKSk/JyxcbiAgICAgICAgJ2ZuT3BlbmVyJzogaWRlbnRpZmllciArICdcXFxccysnICsgaWRlbnRpZmllciArICdcXFxccypcXFxcKCcsXG4gICAgICAgICdib29sJzogJ2Jvb2wnLFxuICAgICAgICAnZnVuY3Rpb24nOiAnZnVuY3Rpb24nXG4gICAgfTtcbn07XG5cbkNwcFBhcnNlci5wcm90b3R5cGUucGFyc2VfZnVuY3Rpb24gPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgdmFyIHJlZ2V4ID0geHJlZ2V4cChcbiAgICAgICAgJyg/UDxyZXR2YWw+JyArIHRoaXMuc2V0dGluZ3MudmFySWRlbnRpZmllciArICcpWyYqXFxcXHNdKycgK1xuICAgICAgICAnKD9QPG5hbWU+JyArIHRoaXMuc2V0dGluZ3MudmFySWRlbnRpZmllciArICcpOz8nICtcbiAgICAgICAgLy8gdm9pZCBmbk5hbWVcbiAgICAgICAgLy8gKGFyZzEsIGFyZzIpXG4gICAgICAgICdcXFxccypcXFxcKFxcXFxzKig/UDxhcmdzPi4qKVxcXFwpJ1xuICAgICk7XG5cbiAgICB2YXIgbWF0Y2hlcyA9IHhyZWdleHAuZXhlYyhsaW5lLCByZWdleCk7XG4gICAgaWYobWF0Y2hlcyA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gW21hdGNoZXMubmFtZSwgbWF0Y2hlcy5hcmdzLCBtYXRjaGVzLnJldHZhbF07XG59O1xuXG5DcHBQYXJzZXIucHJvdG90eXBlLnBhcnNlX2FyZ3MgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgaWYoYXJncy50cmltKCkgPT0gJ3ZvaWQnKVxuICAgICAgICByZXR1cm4gW107XG4gICAgcmV0dXJuIERvY3NQYXJzZXIucHJvdG90eXBlLnBhcnNlX2FyZ3MuY2FsbCh0aGlzLCBhcmdzKTtcbiAgICAvL3JldHVybiBzdXBlcihKc2RvY3NDUFAsIHNlbGYpLnBhcnNlQXJncyhhcmdzKVxufTtcblxuQ3BwUGFyc2VyLnByb3RvdHlwZS5nZXRfYXJnX3R5cGUgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkNwcFBhcnNlci5wcm90b3R5cGUuZ2V0X2FyZ19uYW1lID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLnNldHRpbmdzLnZhcklkZW50aWZpZXIgKyAnKD86XFxzKj0uKik/JCcpO1xuICAgIHZhciBtYXRjaGVzID0gcmVnZXguZXhlYyhhcmcpO1xuICAgIHJldHVybiBtYXRjaGVzWzFdO1xufTtcblxuQ3BwUGFyc2VyLnByb3RvdHlwZS5wYXJzZV92YXIgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5DcHBQYXJzZXIucHJvdG90eXBlLmd1ZXNzX3R5cGVfZnJvbV92YWx1ZSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiBudWxsO1xufTtcblxuQ3BwUGFyc2VyLnByb3RvdHlwZS5nZXRfZnVuY3Rpb25fcmV0dXJuX3R5cGUgPSBmdW5jdGlvbihuYW1lLCByZXR2YWwpIHtcbiAgICByZXR1cm4gKChyZXR2YWwgIT0gJ3ZvaWQnKSA/IHJldHZhbCA6IG51bGwpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDcHBQYXJzZXI7XG4iXX0=