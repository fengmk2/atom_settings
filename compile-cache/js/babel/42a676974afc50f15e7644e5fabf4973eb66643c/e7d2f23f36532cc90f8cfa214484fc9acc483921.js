var DocsParser = require('../docsparser');
var xregexp = require('../xregexp').XRegExp;

function ActionscriptParser(settings) {
    DocsParser.call(this, settings);
}

ActionscriptParser.prototype = Object.create(DocsParser.prototype);

ActionscriptParser.prototype.setup_settings = function () {
    var nameToken = '[a-zA-Z_][a-zA-Z0-9_]*';
    this.settings = {
        'typeInfo': false,
        'curlyTypes': false,
        'typeTag': '',
        'commentCloser': ' */',
        'fnIdentifier': nameToken,
        'varIdentifier': '(%s)(?::%s)?' % (nameToken, nameToken),
        'fnOpener': 'function(?:\\s+[gs]et)?(?:\\s+' + nameToken + ')?\\s*\\(',
        'bool': 'bool',
        'function': 'function'
    };
};

ActionscriptParser.prototype.parse_function = function (line) {
    var regex = xregexp(
    // fnName = function,  fnName : function
    '(?:(?P<name1>' + this.settings.varIdentifier + ')\\s*[:=]\\s*)?' + 'function(?:\\s+(?P<getset>[gs]et))?' +
    // function fnName
    '(?:\\s+(?P<name2>' + this.settings.fnIdentifier + '))?' +
    // (arg1, arg2)
    '\\s*\\(\\s*(?P<args>.*)\\)');
    var matches = xregexp.exec(line, xregexp);
    if (matches === null) return null;

    regex = new RegExp(this.settings.varIdentifier, 'g');
    var name = matches.name1 && (matches.name1 || matches.name2 || '').replace(regex, '\\1');
    var args = matches.args;
    var options = {};
    if (matches.getset == 'set') options.as_setter = true;

    return [name, args, null, options];
};

ActionscriptParser.prototype.parse_var = function (line) {
    return null;
};

ActionscriptParser.prototype.get_arg_name = function (arg) {
    var regex = new RegExp(this.settings.varIdentifier + '(\\s*=.*)?', 'g');
    return arg.replace(regex, '\\1');
};

ActionscriptParser.prototype.get_arg_type = function (arg) {
    // could actually figure it out easily, but it's not important for the documentation
    return null;
};

module.exports = ActionscriptParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvZG9jYmxvY2tyL2xpYi9sYW5ndWFnZXMvYWN0aW9uc2NyaXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUMxQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDOztBQUU1QyxTQUFTLGtCQUFrQixDQUFDLFFBQVEsRUFBRTtBQUNsQyxjQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztDQUNuQzs7QUFFRCxrQkFBa0IsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRW5FLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsWUFBVztBQUNyRCxRQUFJLFNBQVMsR0FBRyx3QkFBd0IsQ0FBQztBQUN6QyxRQUFJLENBQUMsUUFBUSxHQUFHO0FBQ1osa0JBQVUsRUFBRSxLQUFLO0FBQ2pCLG9CQUFZLEVBQUUsS0FBSztBQUNuQixpQkFBUyxFQUFFLEVBQUU7QUFDYix1QkFBZSxFQUFFLEtBQUs7QUFDdEIsc0JBQWMsRUFBRSxTQUFTO0FBQ3pCLHVCQUFlLEVBQUUsY0FBYyxJQUFJLFNBQVMsRUFBRSxTQUFTLENBQUEsQUFBQztBQUN4RCxrQkFBVSxFQUFFLGdDQUFnQyxHQUFHLFNBQVMsR0FBRyxXQUFXO0FBQ3RFLGNBQU0sRUFBRSxNQUFNO0FBQ2Qsa0JBQVUsRUFBRSxVQUFVO0tBQ3pCLENBQUM7Q0FDTCxDQUFDOztBQUVGLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDekQsUUFBSSxLQUFLLEdBQUcsT0FBTzs7QUFFZixtQkFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxHQUFHLGlCQUFpQixHQUNqRSxxQ0FBcUM7O0FBRXJDLHVCQUFtQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxHQUFHLEtBQUs7O0FBRXhELGdDQUE0QixDQUMvQixDQUFDO0FBQ0YsUUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDMUMsUUFBRyxPQUFPLEtBQUssSUFBSSxFQUNmLE9BQU8sSUFBSSxDQUFDOztBQUVoQixTQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDckQsUUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUEsQ0FBRSxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3pGLFFBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDeEIsUUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLFFBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQ3RCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOztBQUU3QixXQUFNLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDckMsQ0FBQzs7QUFFRixrQkFBa0IsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ3BELFdBQU8sSUFBSSxDQUFDO0NBQ2YsQ0FBQzs7QUFFRixrQkFBa0IsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVMsR0FBRyxFQUFFO0FBQ3RELFFBQUksS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxHQUFHLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN4RSxXQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQ3BDLENBQUM7O0FBRUYsa0JBQWtCLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFTLEdBQUcsRUFBRTs7QUFFdEQsV0FBTyxJQUFJLENBQUM7Q0FDZixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9kb2NibG9ja3IvbGliL2xhbmd1YWdlcy9hY3Rpb25zY3JpcHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgRG9jc1BhcnNlciA9IHJlcXVpcmUoXCIuLi9kb2NzcGFyc2VyXCIpO1xudmFyIHhyZWdleHAgPSByZXF1aXJlKCcuLi94cmVnZXhwJykuWFJlZ0V4cDtcblxuZnVuY3Rpb24gQWN0aW9uc2NyaXB0UGFyc2VyKHNldHRpbmdzKSB7XG4gICAgRG9jc1BhcnNlci5jYWxsKHRoaXMsIHNldHRpbmdzKTtcbn1cblxuQWN0aW9uc2NyaXB0UGFyc2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRG9jc1BhcnNlci5wcm90b3R5cGUpO1xuXG5BY3Rpb25zY3JpcHRQYXJzZXIucHJvdG90eXBlLnNldHVwX3NldHRpbmdzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5hbWVUb2tlbiA9ICdbYS16QS1aX11bYS16QS1aMC05X10qJztcbiAgICB0aGlzLnNldHRpbmdzID0ge1xuICAgICAgICAndHlwZUluZm8nOiBmYWxzZSxcbiAgICAgICAgJ2N1cmx5VHlwZXMnOiBmYWxzZSxcbiAgICAgICAgJ3R5cGVUYWcnOiAnJyxcbiAgICAgICAgJ2NvbW1lbnRDbG9zZXInOiAnICovJyxcbiAgICAgICAgJ2ZuSWRlbnRpZmllcic6IG5hbWVUb2tlbixcbiAgICAgICAgJ3ZhcklkZW50aWZpZXInOiAnKCVzKSg/Ojolcyk/JyAlIChuYW1lVG9rZW4sIG5hbWVUb2tlbiksXG4gICAgICAgICdmbk9wZW5lcic6ICdmdW5jdGlvbig/OlxcXFxzK1tnc11ldCk/KD86XFxcXHMrJyArIG5hbWVUb2tlbiArICcpP1xcXFxzKlxcXFwoJyxcbiAgICAgICAgJ2Jvb2wnOiAnYm9vbCcsXG4gICAgICAgICdmdW5jdGlvbic6ICdmdW5jdGlvbidcbiAgICB9O1xufTtcblxuQWN0aW9uc2NyaXB0UGFyc2VyLnByb3RvdHlwZS5wYXJzZV9mdW5jdGlvbiA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgcmVnZXggPSB4cmVnZXhwKFxuICAgICAgICAvLyBmbk5hbWUgPSBmdW5jdGlvbiwgIGZuTmFtZSA6IGZ1bmN0aW9uXG4gICAgICAgICcoPzooP1A8bmFtZTE+JyArIHRoaXMuc2V0dGluZ3MudmFySWRlbnRpZmllciArICcpXFxcXHMqWzo9XVxcXFxzKik/JyArXG4gICAgICAgICdmdW5jdGlvbig/OlxcXFxzKyg/UDxnZXRzZXQ+W2dzXWV0KSk/JyArXG4gICAgICAgIC8vIGZ1bmN0aW9uIGZuTmFtZVxuICAgICAgICAnKD86XFxcXHMrKD9QPG5hbWUyPicgKyB0aGlzLnNldHRpbmdzLmZuSWRlbnRpZmllciArICcpKT8nICtcbiAgICAgICAgLy8gKGFyZzEsIGFyZzIpXG4gICAgICAgICdcXFxccypcXFxcKFxcXFxzKig/UDxhcmdzPi4qKVxcXFwpJ1xuICAgICk7XG4gICAgdmFyIG1hdGNoZXMgPSB4cmVnZXhwLmV4ZWMobGluZSwgeHJlZ2V4cCk7XG4gICAgaWYobWF0Y2hlcyA9PT0gbnVsbClcbiAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICByZWdleCA9IG5ldyBSZWdFeHAodGhpcy5zZXR0aW5ncy52YXJJZGVudGlmaWVyLCAnZycpO1xuICAgIHZhciBuYW1lID0gbWF0Y2hlcy5uYW1lMSAmJiAobWF0Y2hlcy5uYW1lMSB8fCBtYXRjaGVzLm5hbWUyIHx8ICcnKS5yZXBsYWNlKHJlZ2V4LCAnXFxcXDEnKTtcbiAgICB2YXIgYXJncyA9IG1hdGNoZXMuYXJncztcbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xuICAgIGlmKG1hdGNoZXMuZ2V0c2V0ID09ICdzZXQnKVxuICAgICAgICBvcHRpb25zLmFzX3NldHRlciA9IHRydWU7XG5cbiAgICByZXR1cm5bbmFtZSwgYXJncywgbnVsbCwgb3B0aW9uc107XG59O1xuXG5BY3Rpb25zY3JpcHRQYXJzZXIucHJvdG90eXBlLnBhcnNlX3ZhciA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkFjdGlvbnNjcmlwdFBhcnNlci5wcm90b3R5cGUuZ2V0X2FyZ19uYW1lID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLnNldHRpbmdzLnZhcklkZW50aWZpZXIgKyAnKFxcXFxzKj0uKik/JywgJ2cnKTtcbiAgICByZXR1cm4gYXJnLnJlcGxhY2UocmVnZXgsICdcXFxcMScpO1xufTtcblxuQWN0aW9uc2NyaXB0UGFyc2VyLnByb3RvdHlwZS5nZXRfYXJnX3R5cGUgPSBmdW5jdGlvbihhcmcpIHtcbiAgICAvLyBjb3VsZCBhY3R1YWxseSBmaWd1cmUgaXQgb3V0IGVhc2lseSwgYnV0IGl0J3Mgbm90IGltcG9ydGFudCBmb3IgdGhlIGRvY3VtZW50YXRpb25cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aW9uc2NyaXB0UGFyc2VyO1xuIl19