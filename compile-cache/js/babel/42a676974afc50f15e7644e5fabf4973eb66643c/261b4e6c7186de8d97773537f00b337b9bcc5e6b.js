var DocsParser = require('../docsparser');
var xregexp = require('../xregexp').XRegExp;

function PhpParser(settings) {
    DocsParser.call(this, settings);
}

PhpParser.prototype = Object.create(DocsParser.prototype);

PhpParser.prototype.setup_settings = function () {
    var shortPrimitives = this.editor_settings.short_primitives || false;
    var nameToken = '[a-zA-Z_\\x7f-\\xff][a-zA-Z0-9_\\x7f-\\xff]*';
    this.settings = {
        // curly brackets around the type information
        'curlyTypes': false,
        'typeInfo': true,
        'typeTag': 'var',
        'varIdentifier': '[$]' + nameToken + '(?:->' + nameToken + ')*',
        'fnIdentifier': nameToken,
        'fnOpener': 'function(?:\\s+' + nameToken + ')?\\s*\\(',
        'commentCloser': ' */',
        'bool': shortPrimitives ? 'bool' : 'boolean',
        'function': 'function'
    };
};

PhpParser.prototype.parse_function = function (line) {
    var regex = xregexp('function\\s+&?(?:\\s+)?' + '(?P<name>' + this.settings.fnIdentifier + ')' +
    // function fnName
    // (arg1, arg2)
    '\\s*\\(\\s*(?P<args>.*)\\)');

    var matches = xregexp.exec(line, regex);
    if (matches === null) return null;

    return [matches.name, matches.args, null];
};

PhpParser.prototype.get_arg_type = function (arg) {
    // function add($x, $y = 1)
    var regex = xregexp('(?P<name>' + this.settings.varIdentifier + ')\\s*=\\s*(?P<val>.*)');

    var matches = xregexp.exec(arg, regex);
    if (matches !== null) return this.guess_type_from_value(matches.val);

    // function sum(Array $x)
    if (arg.search(/\S\s/) > -1) {
        matches = /^(\S+)/.exec(arg);
        return matches[1];
    } else return null;
};

PhpParser.prototype.get_arg_name = function (arg) {
    var regex = new RegExp('(' + this.settings.varIdentifier + ')(?:\\s*=.*)?$');
    var matches = regex.exec(arg);
    return matches[1];
};

PhpParser.prototype.parse_var = function (line) {
    /*
        var $foo = blah,
            $foo = blah;
        $baz->foo = blah;
        $baz = array(
             'foo' => blah
        )
    */
    var regex = xregexp('(?P<name>' + this.settings.varIdentifier + ')\\s*=>?\\s*(?P<val>.*?)(?:[;,]|$)');
    var matches = xregexp.exec(line, regex);
    if (matches !== null) return [matches.name, matches.val.trim()];

    regex = xregexp('\\b(?:var|public|private|protected|static)\\s+(?P<name>' + this.settings.varIdentifier + ')');
    matches = xregexp.exec(line, regex);
    if (matches !== null) return [matches.name, null];

    return null;
};

PhpParser.prototype.guess_type_from_value = function (val) {
    var short_primitives = this.editor_settings.short_primitives || false;
    if (this.is_numeric(val)) {
        if (val.indexOf('.') > -1) return 'float';

        return short_primitives ? 'int' : 'integer';
    }
    if (val[0] == '"' || val[0] == '\'') return 'string';
    if (val.slice(0, 5) == 'array') return 'array';

    var values = ['true', 'false', 'filenotfound'];
    var i, len;
    for (i = 0; len = values.length, i < len; i++) {
        if (name == values[i]) return short_primitives ? 'bool' : 'boolean';
    }

    if (val.slice(0, 4) == 'new ') {
        var regex = new RegExp('new (' + this.settings.fnIdentifier + ')');
        var matches = regex.exec(val);
        return matches[0] && matches[1] || null;
    }
    return null;
};

PhpParser.prototype.get_function_return_type = function (name, retval) {
    var shortPrimitives = this.editor_settings.short_primitives || false;
    if (name.slice(0, 2) == '__') {
        var values = ['__construct', '__destruct', '__set', '__unset', '__wakeup'];
        var i, len;
        for (i = 0; len = values.length, i < len; i++) {
            if (name == values[i]) return null;
        }
        if (name == '__sleep') return 'array';
        if (name == '__toString') return 'string';
        if (name == '__isset') return shortPrimitives ? 'bool' : 'boolean';
    }
    return DocsParser.prototype.get_function_return_type.call(this, name, retval);
};

module.exports = PhpParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvZG9jYmxvY2tyL2xpYi9sYW5ndWFnZXMvcGhwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUMxQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDOztBQUU1QyxTQUFTLFNBQVMsQ0FBQyxRQUFRLEVBQUU7QUFDekIsY0FBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDbkM7O0FBRUQsU0FBUyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFMUQsU0FBUyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsWUFBVztBQUM1QyxRQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixJQUFJLEtBQUssQ0FBQztBQUNyRSxRQUFJLFNBQVMsR0FBRyw4Q0FBOEMsQ0FBQTtBQUM5RCxRQUFJLENBQUMsUUFBUSxHQUFHOztBQUVaLG9CQUFZLEVBQUUsS0FBSztBQUNuQixrQkFBVSxFQUFFLElBQUk7QUFDaEIsaUJBQVMsRUFBRSxLQUFLO0FBQ2hCLHVCQUFlLEVBQUUsS0FBSyxHQUFHLFNBQVMsR0FBRyxPQUFPLEdBQUcsU0FBUyxHQUFHLElBQUk7QUFDL0Qsc0JBQWMsRUFBRSxTQUFTO0FBQ3pCLGtCQUFVLEVBQUUsaUJBQWlCLEdBQUcsU0FBUyxHQUFHLFdBQVc7QUFDdkQsdUJBQWUsRUFBRSxLQUFLO0FBQ3RCLGNBQU0sRUFBRyxlQUFlLEdBQUcsTUFBTSxHQUFHLFNBQVMsQUFBQztBQUM5QyxrQkFBVSxFQUFFLFVBQVU7S0FDekIsQ0FBQztDQUNMLENBQUM7O0FBRUYsU0FBUyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDaEQsUUFBSSxL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QkFBd0IsR0FBRyxVQUFTLElBQUksRUFBRSxNQUFNLEVBQUU7QUFDbEUsUUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsSUFBSSxLQUFLLENBQUM7QUFDckUsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUM7QUFDeEIsWUFBSSxNQUFNLEdBQUcsQ0FBQyxhQUFhLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDM0UsWUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDO0FBQ1gsYUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUMsZ0JBQUcsSUFBSSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFDaEIsT0FBTyxJQUFJLENBQUM7U0FDbkI7QUFDRCxZQUFHLElBQUksSUFBSSxTQUFTLEVBQ2hCLE9BQU8sT0FBTyxDQUFDO0FBQ25CLFlBQUcsSUFBSSxJQUFJLFlBQVksRUFDbkIsT0FBTyxRQUFRLENBQUM7QUFDcEIsWUFBRyxJQUFJLElBQUksU0FBUyxFQUNoQixPQUFRLGVBQWUsR0FBRyxNQUFNLEdBQUcsU0FBUyxDQUFFO0tBQ3JEO0FBQ0QsV0FBTyxVQUFVLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQ2pGLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMiLCJmaWxlIjoiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9kb2NibG9ja3IvbGliL2xhbmd1YWdlcy9waHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgRG9jc1BhcnNlciA9IHJlcXVpcmUoXCIuLi9kb2NzcGFyc2VyXCIpO1xudmFyIHhyZWdleHAgPSByZXF1aXJlKCcuLi94cmVnZXhwJykuWFJlZ0V4cDtcblxuZnVuY3Rpb24gUGhwUGFyc2VyKHNldHRpbmdzKSB7XG4gICAgRG9jc1BhcnNlci5jYWxsKHRoaXMsIHNldHRpbmdzKTtcbn1cblxuUGhwUGFyc2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRG9jc1BhcnNlci5wcm90b3R5cGUpO1xuXG5QaHBQYXJzZXIucHJvdG90eXBlLnNldHVwX3NldHRpbmdzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNob3J0UHJpbWl0aXZlcyA9IHRoaXMuZWRpdG9yX3NldHRpbmdzLnNob3J0X3ByaW1pdGl2ZXMgfHwgZmFsc2U7XG4gICAgdmFyIG5hbWVUb2tlbiA9ICdbYS16QS1aX1xcXFx4N2YtXFxcXHhmZl1bYS16QS1aMC05X1xcXFx4N2YtXFxcXHhmZl0qJ1xuICAgIHRoaXMuc2V0dGluZ3MgPSB7XG4gICAgICAgIC8vIGN1cmx5IGJyYWNrZXRzIGFyb3VuZCB0aGUgdHlwZSBpbmZvcm1hdGlvblxuICAgICAgICAnY3VybHlUeXBlcyc6IGZhbHNlLFxuICAgICAgICAndHlwZUluZm8nOiB0cnVlLFxuICAgICAgICAndHlwZVRhZyc6ICd2YXInLFxuICAgICAgICAndmFySWRlbnRpZmllcic6ICdbJF0nICsgbmFtZVRva2VuICsgJyg/Oi0+JyArIG5hbWVUb2tlbiArICcpKicsXG4gICAgICAgICdmbklkZW50aWZpZXInOiBuYW1lVG9rZW4sXG4gICAgICAgICdmbk9wZW5lcic6ICdmdW5jdGlvbig/OlxcXFxzKycgKyBuYW1lVG9rZW4gKyAnKT9cXFxccypcXFxcKCcsXG4gICAgICAgICdjb21tZW50Q2xvc2VyJzogJyAqLycsXG4gICAgICAgICdib29sJzogKHNob3J0UHJpbWl0aXZlcyA/ICdib29sJyA6ICdib29sZWFuJyksXG4gICAgICAgICdmdW5jdGlvbic6ICdmdW5jdGlvbidcbiAgICB9O1xufTtcblxuUGhwUGFyc2VyLnByb3RvdHlwZS5wYXJzZV9mdW5jdGlvbiA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgcmVnZXggPSB4cmVnZXhwKFxuICAgICAgICAnZnVuY3Rpb25cXFxccysmPyg/OlxcXFxzKyk/JyArXG4gICAgICAgICcoP1A8bmFtZT4nICsgdGhpcy5zZXR0aW5ncy5mbklkZW50aWZpZXIgKyAnKScgK1xuICAgICAgICAvLyBmdW5jdGlvbiBmbk5hbWVcbiAgICAgICAgLy8gKGFyZzEsIGFyZzIpXG4gICAgICAgICdcXFxccypcXFxcKFxcXFxzKig/UDxhcmdzPi4qKVxcXFwpJ1xuICAgICAgICApO1xuXG4gICAgdmFyIG1hdGNoZXMgPSB4cmVnZXhwLmV4ZWMobGluZSwgcmVnZXgpO1xuICAgIGlmKG1hdGNoZXMgPT09IG51bGwpXG4gICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgcmV0dXJuIFttYXRjaGVzLm5hbWUsIG1hdGNoZXMuYXJncywgbnVsbF07XG59O1xuXG5QaHBQYXJzZXIucHJvdG90eXBlLmdldF9hcmdfdHlwZSA9IGZ1bmN0aW9uKGFyZykge1xuICAgIC8vIGZ1bmN0aW9uIGFkZCgkeCwgJHkgPSAxKVxuICAgIHZhciByZWdleCA9IHhyZWdleHAoXG4gICAgICAgICcoP1A8bmFtZT4nICsgdGhpcy5zZXR0aW5ncy52YXJJZGVudGlmaWVyICsgJylcXFxccyo9XFxcXHMqKD9QPHZhbD4uKiknXG4gICAgICAgICk7XG5cbiAgICB2YXIgbWF0Y2hlcyA9IHhyZWdleHAuZXhlYyhhcmcsIHJlZ2V4KTtcbiAgICBpZihtYXRjaGVzICE9PSBudWxsKVxuICAgICAgICByZXR1cm4gdGhpcy5ndWVzc190eXBlX2Zyb21fdmFsdWUobWF0Y2hlcy52YWwpO1xuXG4gICAgLy8gZnVuY3Rpb24gc3VtKEFycmF5ICR4KVxuICAgIGlmKGFyZy5zZWFyY2goL1xcU1xccy8pID4gLTEpIHtcbiAgICAgICAgbWF0Y2hlcyA9IC9eKFxcUyspLy5leGVjKGFyZyk7XG4gICAgICAgIHJldHVybiBtYXRjaGVzWzFdO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBudWxsO1xufTtcblxuUGhwUGFyc2VyLnByb3RvdHlwZS5nZXRfYXJnX25hbWUgPSBmdW5jdGlvbihhcmcpIHtcbiAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKFxuICAgICAgICAnKCcgKyB0aGlzLnNldHRpbmdzLnZhcklkZW50aWZpZXIgKyAnKSg/OlxcXFxzKj0uKik/JCdcbiAgICAgICAgKTtcbiAgICB2YXIgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWMoYXJnKTtcbiAgICByZXR1cm4gbWF0Y2hlc1sxXTtcbn07XG5cblBocFBhcnNlci5wcm90b3R5cGUucGFyc2VfdmFyID0gZnVuY3Rpb24obGluZSkge1xuICAgIC8qXG4gICAgICAgIHZhciAkZm9vID0gYmxhaCxcbiAgICAgICAgICAgICRmb28gPSBibGFoO1xuICAgICAgICAkYmF6LT5mb28gPSBibGFoO1xuICAgICAgICAkYmF6ID0gYXJyYXkoXG4gICAgICAgICAgICAgJ2ZvbycgPT4gYmxhaFxuICAgICAgICApXG4gICAgKi9cbiAgICB2YXIgcmVnZXggPSB4cmVnZXhwKFxuICAgICAgICAnKD9QPG5hbWU+JyArIHRoaXMuc2V0dGluZ3MudmFySWRlbnRpZmllciArICcpXFxcXHMqPT4/XFxcXHMqKD9QPHZhbD4uKj8pKD86WzssXXwkKSdcbiAgICAgICAgKTtcbiAgICB2YXIgbWF0Y2hlcyA9IHhyZWdleHAuZXhlYyhsaW5lLCByZWdleCk7XG4gICAgaWYobWF0Y2hlcyAhPT0gbnVsbClcbiAgICAgICAgcmV0dXJuIFttYXRjaGVzLm5hbWUsIG1hdGNoZXMudmFsLnRyaW0oKV07XG5cbiAgICByZWdleCA9IHhyZWdleHAoXG4gICAgICAgICdcXFxcYig/OnZhcnxwdWJsaWN8cHJpdmF0ZXxwcm90ZWN0ZWR8c3RhdGljKVxcXFxzKyg/UDxuYW1lPicgKyB0aGlzLnNldHRpbmdzLnZhcklkZW50aWZpZXIgKyAnKSdcbiAgICAgICAgKTtcbiAgICBtYXRjaGVzID0geHJlZ2V4cC5leGVjKGxpbmUsIHJlZ2V4KTtcbiAgICBpZihtYXRjaGVzICE9PSBudWxsKVxuICAgICAgICByZXR1cm4gW21hdGNoZXMubmFtZSwgbnVsbF07XG5cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cblBocFBhcnNlci5wcm90b3R5cGUuZ3Vlc3NfdHlwZV9mcm9tX3ZhbHVlID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIHNob3J0X3ByaW1pdGl2ZXMgPSB0aGlzLmVkaXRvcl9zZXR0aW5ncy5zaG9ydF9wcmltaXRpdmVzIHx8IGZhbHNlO1xuICAgIGlmKHRoaXMuaXNfbnVtZXJpYyh2YWwpKSB7XG4gICAgICAgIGlmKHZhbC5pbmRleE9mKCcuJykgPiAtMSlcbiAgICAgICAgICAgIHJldHVybiAnZmxvYXQnO1xuXG4gICAgICAgIHJldHVybiAoc2hvcnRfcHJpbWl0aXZlcyA/ICdpbnQnIDogJ2ludGVnZXInKTtcbiAgICB9XG4gICAgaWYoKHZhbFswXSA9PSAnXCInKSB8fCAodmFsWzBdID09ICdcXCcnKSlcbiAgICAgICAgcmV0dXJuICdzdHJpbmcnO1xuICAgIGlmKHZhbC5zbGljZSgwLDUpID09ICdhcnJheScpXG4gICAgICAgIHJldHVybiAnYXJyYXknO1xuXG4gICAgdmFyIHZhbHVlcyA9IFsndHJ1ZScsICdmYWxzZScsICdmaWxlbm90Zm91bmQnXTtcbiAgICB2YXIgaSwgbGVuO1xuICAgIGZvcihpID0gMDsgbGVuID0gdmFsdWVzLmxlbmd0aCwgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmKG5hbWUgPT0gdmFsdWVzW2ldKVxuICAgICAgICAgICAgcmV0dXJuIChzaG9ydF9wcmltaXRpdmVzID8gJ2Jvb2wnIDogJ2Jvb2xlYW4nKTtcbiAgICB9XG5cbiAgICBpZih2YWwuc2xpY2UoMCw0KSA9PSAnbmV3ICcpIHtcbiAgICAgICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgICAgICAgICAgICduZXcgKCcgKyB0aGlzLnNldHRpbmdzLmZuSWRlbnRpZmllciArICcpJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgdmFyIG1hdGNoZXMgPSByZWdleC5leGVjKHZhbCk7XG4gICAgICAgIHJldHVybiAobWF0Y2hlc1swXSAmJiBtYXRjaGVzWzFdKSB8fCBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cblBocFBhcnNlci5wcm90b3R5cGUuZ2V0X2Z1bmN0aW9uX3JldHVybl90eXBlID0gZnVuY3Rpb24obmFtZSwgcmV0dmFsKSB7XG4gICAgdmFyIHNob3J0UHJpbWl0aXZlcyA9IHRoaXMuZWRpdG9yX3NldHRpbmdzLnNob3J0X3ByaW1pdGl2ZXMgfHwgZmFsc2U7XG4gICAgaWYgKG5hbWUuc2xpY2UoMCwyKSA9PSAnX18nKXtcbiAgICAgICAgdmFyIHZhbHVlcyA9IFsnX19jb25zdHJ1Y3QnLCAnX19kZXN0cnVjdCcsICdfX3NldCcsICdfX3Vuc2V0JywgJ19fd2FrZXVwJ107XG4gICAgICAgIHZhciBpLCBsZW47XG4gICAgICAgIGZvcihpID0gMDsgbGVuID0gdmFsdWVzLmxlbmd0aCwgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBpZihuYW1lID09IHZhbHVlc1tpXSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZihuYW1lID09ICdfX3NsZWVwJylcbiAgICAgICAgICAgIHJldHVybiAnYXJyYXknO1xuICAgICAgICBpZihuYW1lID09ICdfX3RvU3RyaW5nJylcbiAgICAgICAgICAgIHJldHVybiAnc3RyaW5nJztcbiAgICAgICAgaWYobmFtZSA9PSAnX19pc3NldCcpXG4gICAgICAgICAgICByZXR1cm4gKHNob3J0UHJpbWl0aXZlcyA/ICdib29sJyA6ICdib29sZWFuJyk7XG4gICAgfVxuICAgIHJldHVybiBEb2NzUGFyc2VyLnByb3RvdHlwZS5nZXRfZnVuY3Rpb25fcmV0dXJuX3R5cGUuY2FsbCh0aGlzLCBuYW1lLCByZXR2YWwpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQaHBQYXJzZXI7XG4iXX0=