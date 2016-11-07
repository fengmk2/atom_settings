
/***** xregexp.js *****/

/*!
 * XRegExp v2.0.0
 * (c) 2007-2012 Steven Levithan <http://xregexp.com/>
 * MIT License
 */

/**
 * XRegExp provides augmented, extensible JavaScript regular expressions. You get new syntax,
 * flags, and methods beyond what browsers support natively. XRegExp is also a regex utility belt
 * with tools to make your client-side grepping simpler and more powerful, while freeing you from
 * worrying about pesky cross-browser inconsistencies and the dubious `lastIndex` property. See
 * XRegExp's documentation (http://xregexp.com/) for more details.
 * @module xregexp
 * @requires N/A
 */
var XRegExp;

// Avoid running twice; that would reset tokens and could break references to native globals
XRegExp = XRegExp || (function (undef) {
    "use strict";

    /*--------------------------------------
     *  Private variables
     *------------------------------------*/

    var self,
        addToken,
        add,

    // Optional features; can be installed and uninstalled
    features = {
        natives: false,
        extensibility: false
    },

    // Store native methods to use and restore ("native" is an ES3 reserved keyword)
    nativ = {
        exec: RegExp.prototype.exec,
        test: RegExp.prototype.test,
        match: String.prototype.match,
        replace: String.prototype.replace,
        split: String.prototype.split
    },

    // Storage for fixed/extended native methods
    fixed = {},

    // Storage for cached regexes
    cache = {},

    // Storage for addon tokens
    tokens = [],

    // Token scopes
    defaultScope = "default",
        classScope = "class",

    // Regexes that match native regex syntax
    nativeTokens = {
        // Any native multicharacter token in default scope (includes octals, excludes character classes)
        "default": /^(?:\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??)/,
        // Any native multicharacter token in character class scope (includes octals)
        "class": /^(?:\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S]))/
    },

    // Any backreference in replacement strings
    replacementToken = /\$(?:{([\w$]+)}|(\d\d?|[\s\S]))/g,

    // Any character with a later instance in the string
    duplicateFlags = /([\s\S])(?=[\s\S]*\1)/g,

    // Any greedy/lazy quantifier
    quantifier = /^(?:[?*+]|{\d+(?:,\d*)?})\??/,

    // Check for correct `exec` handling of nonparticipating capturing groups
    compliantExecNpcg = nativ.exec.call(/()??/, "")[1] === undef,

    // Check for flag y support (Firefox 3+)
    hasNativeY = RegExp.prototype.sticky !== undef,

    // Used to kill infinite recursion during XRegExp construction
    isInsideConstructor = false,

    // Storage for known flags, including addon flags
    registeredFlags = "gim" + (hasNativeY ? "y" : "");

    /*--------------------------------------
     *  Private helper functions
     *------------------------------------*/

    /**
     * Attaches XRegExp.prototype properties and named capture supporting data to a regex object.
     * @private
     * @param {RegExp} regex Regex to augment.
     * @param {Array} captureNames Array with capture names, or null.
     * @param {Boolean} [isNative] Whether the regex was created by `RegExp` rather than `XRegExp`.
     * @returns {RegExp} Augmented regex.
     */
    function augment(regex, captureNames, isNative) {
        var p;
        // Can't auto-inherit these since the XRegExp constructor returns a nonprimitive value
        for (p in self.prototype) {
            if (self.prototype.hasOwnProperty(p)) {
                regex[p] = self.prototype[p];
            }
        }
        regex.xregexp = { captureNames: captureNames, isNative: !!isNative };
        return regex;
    }

    /**
     * Returns native `RegExp` flags used by a regex object.
     * @private
     * @param {RegExp} regex Regex to check.
     * @returns {String} Native flags in use.
     */
    function getNativeFlags(regex) {
        //return nativ.exec.call(/\/([a-z]*)$/i, String(regex))[1];
        return (regex.global ? "g" : "") + (regex.ignoreCase ? "i" : "") + (regex.multiline ? "m" : "") + (regex.extended ? "x" : "") + (regex.sticky ? "y" : ""); // Proposed for ES6, included in Firefox 3+
    }

    /**
     * Copies a regex object while preserving special properties for named capture and augmenting with
     * `XRegExp.prototype` methods. The copy has a fresh `lastIndex` property (set to zero). Allows
     * adding and removing flags while copying the regex.
     * @private
     * @param {RegExp} regex Regex to copy.
     * @param {String} [addFlags] Flags to be added while copying the regex.
     * @param {String} [removeFlags] Flags to be removed while copying the regex.
     * @returns {RegExp} Copy of the provided regex, possibly with modified flags.
     */
    function copy(regex, addFlags, removeFlags) {
        if (!self.isRegExp(regex)) {
            throw new TypeError("type RegExp expected");
        }
        var flags = nativ.replace.call(getNativeFlags(regex) + (addFlags || ""), duplicateFlags, "");
        if (removeFlags) {
            // Would need to escape `removeFlags` if this was public
            flags = nativ.replace.call(flags, new RegExp("[" + removeFlags + "]+", "g"), "");
        }
        if (regex.xregexp && !regex.xregexp.isNative) {
            // Compiling the current (rather than precompilation) source preserves the effects of nonnative source flags
            regex = augment(self(regex.source, flags), regex.xregexp.captureNames ? regex.xregexp.captureNames.slice(0) : null);
        } else {
            // Augment with `XRegExp.prototype` methods, but use native `RegExp` (avoid searching for special tokens)
            regex = augment(new RegExp(regex.source, flags), null, true);
        }
        return regex;
    }

    /*
     * Returns the last index at which a given value can be found in an array, or `-1` if it's not
     * present. The array is searched backwards.
     * @private
     * @param {Array} array Array to search.
     * @param {*} value Value to locate in the array.
     * @returns {Number} Last zero-based index at which the item is found, or -1.
     */
    function lastIndexOf(array, value) {
        var i = array.length;
        if (Array.prototype.lastIndexOf) {
            return array.lastIndexOf(value); // Use the native method if available
        }
        while (i--) {
            if (array[i] === value) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Determines whether an object is of the specified type.
     * @private
     * @param {*} value Object to check.
     * @param {String} type Type to check for, in lowercase.
     * @returns {Boolean} Whether the object matches the type.
     */
    function isType(value, type) {
        return Object.prototype.toString.call(value).toLowerCase() === "[object " + type + "]";
    }

    /**
     * Prepares an options object from the given value.
     * @private
     * @param {String|Object} value Value to convert to an options object.
     * @returns {Object} Options object.
     */
    function prepareOptions(value) {
        value = value || {};
        if (value === "all" || value.all) {
            value = { natives: true, extensibility: true };
        } else if (isType(value, "string")) {
            value = self.forEach(value, /[^\s,]+/, function (m) {
                this[m] = true;
            }, {});
        }
        return value;
    }

    /**
     * Runs built-in/custom tokens in reverse insertion order, until a match is found.
     * @private
     * @param {String} pattern Original pattern from which an XRegExp object is being built.
     * @param {Number} pos Position to search for tokens within `pattern`.
     * @param {Number} scope Current regex scope.
     * @param {Object} context Context object assigned to token handler functions.
     * @returns {Object} Object with properties `output` (the substitution string returned by the
     *   successful token handler) and `match` (the token's match array), or null.
     */
    function runTokens(pattern, pos, scope, context) {
        var i = tokens.length,
            result = null,
            match,
            t;
        // Protect against constructing XRegExps within token handler and trigger functions
        isInsideConstructor = true;
        // Must reset `isInsideConstructor`, even if a `trigger` or `handler` throws
        try {
            while (i--) {
                // Run in reverse order
                t = tokens[i];
                if ((t.scope === "all" || t.scope === scope) && (!t.trigger || t.trigger.call(context))) {
                    t.pattern.lastIndex = pos;
                    match = fixed.exec.call(t.pattern, pattern); // Fixed `exec` here allows use of named backreferences, etc.
                    if (match && match.index === pos) {
                        result = {
                            output: t.handler.call(context, match, scope),
                            match: match
                        };
                        break;
                    }
                }
            }
        } catch (err) {
            throw err;
        } finally {
            isInsideConstructor = false;
        }
        return result;
    }

    /**
     * Enables or disables XRegExp syntax and flag extensibility.
     * @private
     * @param {Boolean} on `true` to enable; `false` to disable.
     */
    function setExtensibility(on) {
        self.addToken = addToken[on ? "on" : "off"];
        features.extensibility = on;
    }

    /**
     * Enables or disables native method overrides.
     * @private
     * @param {Boolean} on `true` to enable; `false` to disable.
     */
    function setNatives(on) {
        RegExp.prototype.exec = (on ? fixed : nativ).exec;
        RegExp.prototype.test = (on ? fixed : nativ).test;
        String.prototype.match = (on ? fixed : nativ).match;
        String.prototype.replace = (on ? fixed : nativ).replace;
        String.prototype.split = (on ? fixed : nativ).split;
        features.natives = on;
    }

    /*--------------------------------------
     *  Constructor
     *------------------------------------*/

    /**
     * Creates an extended regular expression object for matching text with a pattern. Differs from a
     * native regular expression in that additional syntax and flags are supported. The returned object
     * is in fact a native `RegExp` and works with all native methods.
     * @class XRegExp
     * @constructor
     * @param {String|RegExp} pattern Regex pattern string, or an existing `RegExp` object to copy.
     * @param {String} [flags] Any combination of flags:
     *   <li>`g` - global
     *   <li>`i` - ignore case
     *   <li>`m` - multiline anchors
     *   <li>`n` - explicit capture
     *   <li>`s` - dot matches all (aka singleline)
     *   <li>`x` - free-spacing and line comments (aka extended)
     *   <li>`y` - sticky (Firefox 3+ only)
     *   Flags cannot be provided when constructing one `RegExp` from another.
     * @returns {RegExp} Extended regular expression object.
     * @example
     *
     * // With named capture and flag x
     * date = XRegExp('(?<year>  [0-9]{4}) -?  # year  \n\
     *                 (?<month> [0-9]{2}) -?  # month \n\
     *                 (?<day>   [0-9]{2})     # day   ', 'x');
     *
     * // Passing a regex object to copy it. The copy maintains special properties for named capture,
     * // is augmented with `XRegExp.prototype` methods, and has a fresh `lastIndex` property (set to
     * // zero). Native regexes are not recompiled using XRegExp syntax.
     * XRegExp(/regex/);
     */
    self = function (pattern, flags) {
        if (self.isRegExp(pattern)) {
            if (flags !== undef) {
                throw new TypeError("can't supply flags when constructing one RegExp from another");
            }
            return copy(pattern);
        }
        // Tokens become part of the regex construction process, so protect against infinite recursion
        // when an XRegExp is constructed within a token handler function
        if (isInsideConstructor) {
            throw new Error("can't call the XRegExp constructor within token definition functions");
        }

        var output = [],
            scope = defaultScope,
            tokenContext = {
            hasNamedCapture: false,
            captureNames: [],
            hasFlag: function hasFlag(flag) {
                return flags.indexOf(flag) > -1;
            }
        },
            pos = 0,
            tokenResult,
            match,
            chr;
        pattern = pattern === undef ? "" : String(pattern);
        flags = flags === undef ? "" : String(flags);

        if (nativ.match.call(flags, duplicateFlags)) {
            // Don't use test/exec because they would update lastIndex
            throw new SyntaxError("invalid duplicate regular expression flag");
        }
        // Strip/apply leading mode modifier with any combination of flags except g or y: (?imnsx)
        pattern = nativ.replace.call(pattern, /^\(\?([\w$]+)\)/, function ($0, $1) {
            if (nativ.test.call(/[gy]/, $1)) {
                throw new SyntaxError("can't use flag g or y in mode modifier");
            }
            flags = nativ.replace.call(flags + $1, duplicateFlags, "");
            return "";
        });
        self.forEach(flags, /[\s\S]/, function (m) {
            if (registeredFlags.indexOf(m[0]) < 0) {
                throw new SyntaxError("invalid regular expression flag " + m[0]);
            }
        });

        while (pos < pattern.length) {
            // Check for custom tokens at the current position
            tokenResult = runTokens(pattern, pos, scope, tokenContext);
            if (tokenResult) {
                output.push(tokenResult.output);
                pos += tokenResult.match[0].length || 1;
            } else {
                // Check for native tokens (except character classes) at the current position
                match = nativ.exec.call(nativeTokens[scope], pattern.slice(pos));
                if (match) {
                    output.push(match[0]);
                    pos += match[0].length;
                } else {
                    chr = pattern.charAt(pos);
                    if (chr === "[") {
                        scope = classScope;
                    } else if (chr === "]") {
                        scope = defaultScope;
                    }
                    // Advance position by one character
                    output.push(chr);
                    ++pos;
                }
            }
        }

        return augment(new RegExp(output.join(""), nativ.replace.call(flags, /[^gimy]+/g, "")), tokenContext.hasNamedCapture ? tokenContext.captureNames : null);
    };

    /*--------------------------------------
     *  Public methods/properties
     *------------------------------------*/

    // Installed and uninstalled states for `XRegExp.addToken`
    addToken = {
        on: function on(regex, handler, options) {
            options = options || {};
            if (regex) {
                tokens.push({
                    pattern: copy(regex, "g" + (hasNativeY ? "y" : "")),
                    handler: handler,
                    scope: options.scope || defaultScope,
                    trigger: options.trigger || null
                });
            }
            // Providing `customFlags` with null `regex` and `handler` allows adding flags that do
            // nothing, but don't throw an error
            if (options.customFlags) {
                registeredFlags = nativ.replace.call(registeredFlags + options.customFlags, duplicateFlags, "");
            }
        },
        off: function off() {
            throw new Error("extensibility must be installed before using addToken");
        }
    };

    /**
     * Extends or changes XRegExp syntax and allows custom flags. This is used internally and can be
     * used to create XRegExp addons. `XRegExp.install('extensibility')` must be run before calling
     * this function, or an error is thrown. If more than one token can match the same string, the last
     * added wins.
     * @memberOf XRegExp
     * @param {RegExp} regex Regex object that matches the new token.
     * @param {Function} handler Function that returns a new pattern string (using native regex syntax)
     *   to replace the matched token within all future XRegExp regexes. Has access to persistent
     *   properties of the regex being built, through `this`. Invoked with two arguments:
     *   <li>The match array, with named backreference properties.
     *   <li>The regex scope where the match was found.
     * @param {Object} [options] Options object with optional properties:
     *   <li>`scope` {String} Scopes where the token applies: 'default', 'class', or 'all'.
     *   <li>`trigger` {Function} Function that returns `true` when the token should be applied; e.g.,
     *     if a flag is set. If `false` is returned, the matched string can be matched by other tokens.
     *     Has access to persistent properties of the regex being built, through `this` (including
     *     function `this.hasFlag`).
     *   <li>`customFlags` {String} Nonnative flags used by the token's handler or trigger functions.
     *     Prevents XRegExp from throwing an invalid flag error when the specified flags are used.
     * @example
     *
     * // Basic usage: Adds \a for ALERT character
     * XRegExp.addToken(
     *   /\\a/,
     *   function () {return '\\x07';},
     *   {scope: 'all'}
     * );
     * XRegExp('\\a[\\a-\\n]+').test('\x07\n\x07'); // -> true
     */
    self.addToken = addToken.off;

    /**
     * Caches and returns the result of calling `XRegExp(pattern, flags)`. On any subsequent call with
     * the same pattern and flag combination, the cached copy is returned.
     * @memberOf XRegExp
     * @param {String} pattern Regex pattern string.
     * @param {String} [flags] Any combination of XRegExp flags.
     * @returns {RegExp} Cached XRegExp object.
     * @example
     *
     * while (match = XRegExp.cache('.', 'gs').exec(str)) {
     *   // The regex is compiled once only
     * }
     */
    self.cache = function (pattern, flags) {
        var key = pattern + "/" + (flags || "");
        return cache[key] || (cache[key] = self(pattern, flags));
    };

    /**
     * Escapes any regular expression metacharacters, for use when matching literal strings. The result
     * can safely be used at any point within a regex that uses any flags.
     * @memberOf XRegExp
     * @param {String} str String to escape.
     * @returns {String} String with regex metacharacters escaped.
     * @example
     *
     * XRegExp.escape('Escaped? <.>');
     * // -> 'Escaped\?\ <\.>'
     */
    self.escape = function (str) {
        return nativ.replace.call(str, /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    /**
     * Executes a regex search in a specified string. Returns a match array or `null`. If the provided
     * regex uses named capture, named backreference properties are included on the match array.
     * Optional `pos` and `sticky` arguments specify the search start position, and whether the match
     * must start at the specified position only. The `lastIndex` property of the provided regex is not
     * used, but is updated for compatibility. Also fixes browser bugs compared to the native
     * `RegExp.prototype.exec` and can be used reliably cross-browser.
     * @memberOf XRegExp
     * @param {String} str String to search.
     * @param {RegExp} regex Regex to search with.
     * @param {Number} [pos=0] Zero-based index at which to start the search.
     * @param {Boolean|String} [sticky=false] Whether the match must start at the specified position
     *   only. The string `'sticky'` is accepted as an alternative to `true`.
     * @returns {Array} Match array with named backreference properties, or null.
     * @example
     *
     * // Basic use, with named backreference
     * var match = XRegExp.exec('U+2620', XRegExp('U\\+(?<hex>[0-9A-F]{4})'));
     * match.hex; // -> '2620'
     *
     * // With pos and sticky, in a loop
     * var pos = 2, result = [], match;
     * while (match = XRegExp.exec('<1><2><3><4>5<6>', /<(\d)>/, pos, 'sticky')) {
     *   result.push(match[1]);
     *   pos = match.index + match[0].length;
     * }
     * // result -> ['2', '3', '4']
     */
    self.exec = function (str, regex, pos, sticky) {
        var r2 = copy(regex, "g" + (sticky && hasNativeY ? "y" : ""), sticky === false ? "y" : ""),
            match;
        r2.lastIndex = pos = pos || 0;
        match = fixed.exec.call(r2, str); // Fixed `exec` required for `lastIndex` fix, etc.
        if (sticky && match && match.index !== pos) {
            match = null;
        }
        if (regex.global) {
            regex.lastIndex = match ? r2.lastIndex : 0;
        }
        return match;
    };

    /**
     * Executes a provided function once per regex match.
     * @memberOf XRegExp
     * @param {String} str String to search.
     * @param {RegExp} regex Regex to search with.
     * @param {Function} callback Function to execute for each match. Invoked with four arguments:
     *   <li>The match array, with named backreference properties.
     *   <li>The zero-based match index.
     *   <li>The string being traversed.
     *   <li>The regex object being used to traverse the string.
     * @param {*} [context] Object to use as `this` when executing `callback`.
     * @returns {*} Provided `context` object.
     * @example
     *
     * // Extracts every other digit from a string
     * XRegExp.forEach('1a2345', /\d/, function (match, i) {
     *   if (i % 2) this.push(+match[0]);
     * }, []);
     * // -> [2, 4]
     */
    self.forEach = function (str, regex, callback, context) {
        var pos = 0,
            i = -1,
            match;
        while (match = self.exec(str, regex, pos)) {
            callback.call(context, match, ++i, str, regex);
            pos = match.index + (match[0].length || 1);
        }
        return context;
    };

    /**
     * Copies a regex object and adds flag `g`. The copy maintains special properties for named
     * capture, is augmented with `XRegExp.prototype` methods, and has a fresh `lastIndex` property
     * (set to zero). Native regexes are not recompiled using XRegExp syntax.
     * @memberOf XRegExp
     * @param {RegExp} regex Regex to globalize.
     * @returns {RegExp} Copy of the provided regex with flag `g` added.
     * @example
     *
     * var globalCopy = XRegExp.globalize(/regex/);
     * globalCopy.global; // -> true
     */
    self.globalize = function (regex) {
        return copy(regex, "g");
    };

    /**
     * Installs optional features according to the specified options.
     * @memberOf XRegExp
     * @param {Object|String} options Options object or string.
     * @example
     *
     * // With an options object
     * XRegExp.install({
     *   // Overrides native regex methods with fixed/extended versions that support named
     *   // backreferences and fix numerous cross-browser bugs
     *   natives: true,
     *
     *   // Enables extensibility of XRegExp syntax and flags
     *   extensibility: true
     * });
     *
     * // With an options string
     * XRegExp.install('natives extensibility');
     *
     * // Using a shortcut to install all optional features
     * XRegExp.install('all');
     */
    self.install = function (options) {
        options = prepareOptions(options);
        if (!features.natives && options.natives) {
            setNatives(true);
        }
        if (!features.extensibility && options.extensibility) {
            setExtensibility(true);
        }
    };

    /**
     * Checks whether an individual optional feature is installed.
     * @memberOf XRegExp
     * @param {String} feature Name of the feature to check. One of:
     *   <li>`natives`
     *   <li>`extensibility`
     * @returns {Boolean} Whether the feature is installed.
     * @example
     *
     * XRegExp.isInstalled('natives');
     */
    self.isInstalled = function (feature) {
        return !!features[feature];
    };

    /**
     * Returns `true` if an object is a regex; `false` if it isn't. This works correctly for regexes
     * created in another frame, when `instanceof` and `constructor` checks would fail.
     * @memberOf XRegExp
     * @param {*} value Object to check.
     * @returns {Boolean} Whether the object is a `RegExp` object.
     * @example
     *
     * XRegExp.isRegExp('string'); // -> false
     * XRegExp.isRegExp(/regex/i); // -> true
     * XRegExp.isRegExp(RegExp('^', 'm')); // -> true
     * XRegExp.isRegExp(XRegExp('(?s).')); // -> true
     */
    self.isRegExp = function (value) {
        return isType(value, "regexp");
    };

    /**
     * Retrieves the matches from searching a string using a chain of regexes that successively search
     * within previous matches. The provided `chain` array can contain regexes and objects with `regex`
     * and `backref` properties. When a backreference is specified, the named or numbered backreference
     * is passed forward to the next regex or returned.
     * @memberOf XRegExp
     * @param {String} str String to search.
     * @param {Array} chain Regexes that each search for matches within preceding results.
     * @returns {Array} Matches by the last regex in the chain, or an empty array.
     * @example
     *
     * // Basic usage; matches numbers within <b> tags
     * XRegExp.matchChain('1 <b>2</b> 3 <b>4 a 56</b>', [
     *   XRegExp('(?is)<b>.*?</b>'),
     *   /\d+/
     * ]);
     * // -> ['2', '4', '56']
     *
     * // Passing forward and returning specific backreferences
     * html = '<a href="http://xregexp.com/api/">XRegExp</a>\
     *         <a href="http://www.google.com/">Google</a>';
     * XRegExp.matchChain(html, [
     *   {regex: /<a href="([^"]+)">/i, backref: 1},
     *   {regex: XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
     * ]);
     * // -> ['xregexp.com', 'www.google.com']
     */
    self.matchChain = function (str, chain) {
        return (function recurseChain(_x, _x2) {
            var _again = true;

            _function: while (_again) {
                var values = _x,
                    level = _x2;
                item = matches = addMatch = i = undefined;
                _again = false;

                var item = chain[level].regex ? chain[level] : { regex: chain[level] },
                    matches = [],
                    addMatch = function addMatch(match) {
                    matches.push(item.backref ? match[item.backref] || "" : match[0]);
                },
                    i;
                for (i = 0; i < values.length; ++i) {
                    self.forEach(values[i], item.regex, addMatch);
                }
                if (level === chain.length - 1 || !matches.length) {
                    return matches;
                } else {
                    _x = matches;
                    _x2 = level + 1;
                    _again = true;
                    continue _function;
                }
            }
        })([str], 0);
    };

    /**
     * Returns a new string with one or all matches of a pattern replaced. The pattern can be a string
     * or regex, and the replacement can be a string or a function to be called for each match. To
     * perform a global search and replace, use the optional `scope` argument or include flag `g` if
     * using a regex. Replacement strings can use `${n}` for named and numbered backreferences.
     * Replacement functions can use named backreferences via `arguments[0].name`. Also fixes browser
     * bugs compared to the native `String.prototype.replace` and can be used reliably cross-browser.
     * @memberOf XRegExp
     * @param {String} str String to search.
     * @param {RegExp|String} search Search pattern to be replaced.
     * @param {String|Function} replacement Replacement string or a function invoked to create it.
     *   Replacement strings can include special replacement syntax:
     *     <li>$$ - Inserts a literal '$'.
     *     <li>$&, $0 - Inserts the matched substring.
     *     <li>$` - Inserts the string that precedes the matched substring (left context).
     *     <li>$' - Inserts the string that follows the matched substring (right context).
     *     <li>$n, $nn - Where n/nn are digits referencing an existent capturing group, inserts
     *       backreference n/nn.
     *     <li>${n} - Where n is a name or any number of digits that reference an existent capturing
     *       group, inserts backreference n.
     *   Replacement functions are invoked with three or more arguments:
     *     <li>The matched substring (corresponds to $& above). Named backreferences are accessible as
     *       properties of this first argument.
     *     <li>0..n arguments, one for each backreference (corresponding to $1, $2, etc. above).
     *     <li>The zero-based index of the match within the total search string.
     *     <li>The total string being searched.
     * @param {String} [scope='one'] Use 'one' to replace the first match only, or 'all'. If not
     *   explicitly specified and using a regex with flag `g`, `scope` is 'all'.
     * @returns {String} New string with one or all matches replaced.
     * @example
     *
     * // Regex search, using named backreferences in replacement string
     * var name = XRegExp('(?<first>\\w+) (?<last>\\w+)');
     * XRegExp.replace('John Smith', name, '${last}, ${first}');
     * // -> 'Smith, John'
     *
     * // Regex search, using named backreferences in replacement function
     * XRegExp.replace('John Smith', name, function (match) {
     *   return match.last + ', ' + match.first;
     * });
     * // -> 'Smith, John'
     *
     * // Global string search/replacement
     * XRegExp.replace('RegExp builds RegExps', 'RegExp', 'XRegExp', 'all');
     * // -> 'XRegExp builds XRegExps'
     */
    self.replace = function (str, search, replacement, scope) {
        var isRegex = self.isRegExp(search),
            search2 = search,
            result;
        if (isRegex) {
            if (scope === undef && search.global) {
                scope = "all"; // Follow flag g when `scope` isn't explicit
            }
            // Note that since a copy is used, `search`'s `lastIndex` isn't updated *during* replacement iterations
            search2 = copy(search, scope === "all" ? "g" : "", scope === "all" ? "" : "g");
        } else if (scope === "all") {
            search2 = new RegExp(self.escape(String(search)), "g");
        }
        result = fixed.replace.call(String(str), search2, replacement); // Fixed `replace` required for named backreferences, etc.
        if (isRegex && search.global) {
            search.lastIndex = 0; // Fixes IE, Safari bug (last tested IE 9, Safari 5.1)
        }
        return result;
    };

    /**
     * Splits a string into an array of strings using a regex or string separator. Matches of the
     * separator are not included in the result array. However, if `separator` is a regex that contains
     * capturing groups, backreferences are spliced into the result each time `separator` is matched.
     * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
     * cross-browser.
     * @memberOf XRegExp
     * @param {String} str String to split.
     * @param {RegExp|String} separator Regex or string to use for separating the string.
     * @param {Number} [limit] Maximum number of items to include in the result array.
     * @returns {Array} Array of substrings.
     * @example
     *
     * // Basic use
     * XRegExp.split('a b c', ' ');
     * // -> ['a', 'b', 'c']
     *
     * // With limit
     * XRegExp.split('a b c', ' ', 2);
     * // -> ['a', 'b']
     *
     * // Backreferences in result array
     * XRegExp.split('..word1..', /([a-z]+)(\d+)/i);
     * // -> ['..', 'word', '1', '..']
     */
    self.split = function (str, separator, limit) {
        return fixed.split.call(str, separator, limit);
    };

    /**
     * Executes a regex search in a specified string. Returns `true` or `false`. Optional `pos` and
     * `sticky` arguments specify the search start position, and whether the match must start at the
     * specified position only. The `lastIndex` property of the provided regex is not used, but is
     * updated for compatibility. Also fixes browser bugs compared to the native
     * `RegExp.prototype.test` and can be used reliably cross-browser.
     * @memberOf XRegExp
     * @param {String} str String to search.
     * @param {RegExp} regex Regex to search with.
     * @param {Number} [pos=0] Zero-based index at which to start the search.
     * @param {Boolean|String} [sticky=false] Whether the match must start at the specified position
     *   only. The string `'sticky'` is accepted as an alternative to `true`.
     * @returns {Boolean} Whether the regex matched the provided value.
     * @example
     *
     * // Basic use
     * XRegExp.test('abc', /c/); // -> true
     *
     * // With pos and sticky
     * XRegExp.test('abc', /c/, 0, 'sticky'); // -> false
     */
    self.test = function (str, regex, pos, sticky) {
        // Do this the easy way :-)
        return !!self.exec(str, regex, pos, sticky);
    };

    /**
     * Uninstalls optional features according to the specified options.
     * @memberOf XRegExp
     * @param {Object|String} options Options object or string.
     * @example
     *
     * // With an options object
     * XRegExp.uninstall({
     *   // Restores native regex methods
     *   natives: true,
     *
     *   // Disables additional syntax and flag extensions
     *   extensibility: true
     * });
     *
     * // With an options string
     * XRegExp.uninstall('natives extensibility');
     *
     * // Using a shortcut to uninstall all optional features
     * XRegExp.uninstall('all');
     */
    self.uninstall = function (options) {
        options = prepareOptions(options);
        if (features.natives && options.natives) {
            setNatives(false);
        }
        if (features.extensibility && options.extensibility) {
            setExtensibility(false);
        }
    };

    /**
     * Returns an XRegExp object that is the union of the given patterns. Patterns can be provided as
     * regex objects or strings. Metacharacters are escaped in patterns provided as strings.
     * Backreferences in provided regex objects are automatically renumbered to work correctly. Native
     * flags used by provided regexes are ignored in favor of the `flags` argument.
     * @memberOf XRegExp
     * @param {Array} patterns Regexes and strings to combine.
     * @param {String} [flags] Any combination of XRegExp flags.
     * @returns {RegExp} Union of the provided regexes and strings.
     * @example
     *
     * XRegExp.union(['a+b*c', /(dogs)\1/, /(cats)\1/], 'i');
     * // -> /a\+b\*c|(dogs)\1|(cats)\2/i
     *
     * XRegExp.union([XRegExp('(?<pet>dogs)\\k<pet>'), XRegExp('(?<pet>cats)\\k<pet>')]);
     * // -> XRegExp('(?<pet>dogs)\\k<pet>|(?<pet>cats)\\k<pet>')
     */
    self.union = function (patterns, flags) {
        var parts = /(\()(?!\?)|\\([1-9]\d*)|\\[\s\S]|\[(?:[^\\\]]|\\[\s\S])*]/g,
            numCaptures = 0,
            numPriorCaptures,
            captureNames,
            rewrite = function rewrite(match, paren, backref) {
            var name = captureNames[numCaptures - numPriorCaptures];
            if (paren) {
                // Capturing group
                ++numCaptures;
                if (name) {
                    // If the current capture has a name
                    return "(?<" + name + ">";
                }
            } else if (backref) {
                // Backreference
                return "\\" + (+backref + numPriorCaptures);
            }
            return match;
        },
            output = [],
            pattern,
            i;
        if (!(isType(patterns, "array") && patterns.length)) {
            throw new TypeError("patterns must be a nonempty array");
        }
        for (i = 0; i < patterns.length; ++i) {
            pattern = patterns[i];
            if (self.isRegExp(pattern)) {
                numPriorCaptures = numCaptures;
                captureNames = pattern.xregexp && pattern.xregexp.captureNames || [];
                // Rewrite backreferences. Passing to XRegExp dies on octals and ensures patterns
                // are independently valid; helps keep this simple. Named captures are put back
                output.push(self(pattern.source).source.replace(parts, rewrite));
            } else {
                output.push(self.escape(pattern));
            }
        }
        return self(output.join("|"), flags);
    };

    /**
     * The XRegExp version number.
     * @static
     * @memberOf XRegExp
     * @type String
     */
    self.version = "2.0.0";

    /*--------------------------------------
     *  Fixed/extended native methods
     *------------------------------------*/

    /**
     * Adds named capture support (with backreferences returned as `result.name`), and fixes browser
     * bugs in the native `RegExp.prototype.exec`. Calling `XRegExp.install('natives')` uses this to
     * override the native method. Use via `XRegExp.exec` without overriding natives.
     * @private
     * @param {String} str String to search.
     * @returns {Array} Match array with named backreference properties, or null.
     */
    fixed.exec = function (str) {
        var match, name, r2, origLastIndex, i;
        if (!this.global) {
            origLastIndex = this.lastIndex;
        }
        match = nativ.exec.apply(this, arguments);
        if (match) {
            // Fix browsers whose `exec` methods don't consistently return `undefined` for
            // nonparticipating capturing groups
            if (!compliantExecNpcg && match.length > 1 && lastIndexOf(match, "") > -1) {
                r2 = new RegExp(this.source, nativ.replace.call(getNativeFlags(this), "g", ""));
                // Using `str.slice(match.index)` rather than `match[0]` in case lookahead allowed
                // matching due to characters outside the match
                nativ.replace.call(String(str).slice(match.index), r2, function () {
                    var i;
                    for (i = 1; i < arguments.length - 2; ++i) {
                        if (arguments[i] === undef) {
                            match[i] = undef;
                        }
                    }
                });
            }
            // Attach named capture properties
            if (this.xregexp && this.xregexp.captureNames) {
                for (i = 1; i < match.length; ++i) {
                    name = this.xregexp.captureNames[i - 1];
                    if (name) {
                        match[name] = match[i];
                    }
                }
            }
            // Fix browsers that increment `lastIndex` after zero-length matches
            if (this.global && !match[0].length && this.lastIndex > match.index) {
                this.lastIndex = match.index;
            }
        }
        if (!this.global) {
            this.lastIndex = origLastIndex; // Fixes IE, Opera bug (last tested IE 9, Opera 11.6)
        }
        return match;
    };

    /**
     * Fixes browser bugs in the native `RegExp.prototype.test`. Calling `XRegExp.install('natives')`
     * uses this to override the native method.
     * @private
     * @param {String} str String to search.
     * @returns {Boolean} Whether the regex matched the provided value.
     */
    fixed.test = function (str) {
        // Do this the easy way :-)
        return !!fixed.exec.call(this, str);
    };

    /**
     * Adds named capture support (with backreferences returned as `result.name`), and fixes browser
     * bugs in the native `String.prototype.match`. Calling `XRegExp.install('natives')` uses this to
     * override the native method.
     * @private
     * @param {RegExp} regex Regex to search with.
     * @returns {Array} If `regex` uses flag g, an array of match strings or null. Without flag g, the
     *   result of calling `regex.exec(this)`.
     */
    fixed.match = function (regex) {
        if (!self.isRegExp(regex)) {
            regex = new RegExp(regex); // Use native `RegExp`
        } else if (regex.global) {
            var result = nativ.match.apply(this, arguments);
            regex.lastIndex = 0; // Fixes IE bug
            return result;
        }
        return fixed.exec.call(regex, this);
    };

    /**
     * Adds support for `${n}` tokens for named and numbered backreferences in replacement text, and
     * provides named backreferences to replacement functions as `arguments[0].name`. Also fixes
     * browser bugs in replacement text syntax when performing a replacement using a nonregex search
     * value, and the value of a replacement regex's `lastIndex` property during replacement iterations
     * and upon completion. Note that this doesn't support SpiderMonkey's proprietary third (`flags`)
     * argument. Calling `XRegExp.install('natives')` uses this to override the native method. Use via
     * `XRegExp.replace` without overriding natives.
     * @private
     * @param {RegExp|String} search Search pattern to be replaced.
     * @param {String|Function} replacement Replacement string or a function invoked to create it.
     * @returns {String} New string with one or all matches replaced.
     */
    fixed.replace = function (search, replacement) {
        var isRegex = self.isRegExp(search),
            captureNames,
            result,
            str,
            origLastIndex;
        if (isRegex) {
            if (search.xregexp) {
                captureNames = search.xregexp.captureNames;
            }
            if (!search.global) {
                origLastIndex = search.lastIndex;
            }
        } else {
            search += "";
        }
        if (isType(replacement, "function")) {
            result = nativ.replace.call(String(this), search, function () {
                var args = arguments,
                    i;
                if (captureNames) {
                    // Change the `arguments[0]` string primitive to a `String` object that can store properties
                    args[0] = new String(args[0]);
                    // Store named backreferences on the first argument
                    for (i = 0; i < captureNames.length; ++i) {
                        if (captureNames[i]) {
                            args[0][captureNames[i]] = args[i + 1];
                        }
                    }
                }
                // Update `lastIndex` before calling `replacement`.
                // Fixes IE, Chrome, Firefox, Safari bug (last tested IE 9, Chrome 17, Firefox 11, Safari 5.1)
                if (isRegex && search.global) {
                    search.lastIndex = args[args.length - 2] + args[0].length;
                }
                return replacement.apply(null, args);
            });
        } else {
            str = String(this); // Ensure `args[args.length - 1]` will be a string when given nonstring `this`
            result = nativ.replace.call(str, search, function () {
                var args = arguments; // Keep this function's `arguments` available through closure
                return nativ.replace.call(String(replacement), replacementToken, function ($0, $1, $2) {
                    var n;
                    // Named or numbered backreference with curly brackets
                    if ($1) {
                        /* XRegExp behavior for `${n}`:
                         * 1. Backreference to numbered capture, where `n` is 1+ digits. `0`, `00`, etc. is the entire match.
                         * 2. Backreference to named capture `n`, if it exists and is not a number overridden by numbered capture.
                         * 3. Otherwise, it's an error.
                         */
                        n = +$1; // Type-convert; drop leading zeros
                        if (n <= args.length - 3) {
                            return args[n] || "";
                        }
                        n = captureNames ? lastIndexOf(captureNames, $1) : -1;
                        if (n < 0) {
                            throw new SyntaxError("backreference to undefined group " + $0);
                        }
                        return args[n + 1] || "";
                    }
                    // Else, special variable or numbered backreference (without curly brackets)
                    if ($2 === "$") return "$";
                    if ($2 === "&" || +$2 === 0) return args[0]; // $&, $0 (not followed by 1-9), $00
                    if ($2 === "`") return args[args.length - 1].slice(0, args[args.length - 2]);
                    if ($2 === "'") return args[args.length - 1].slice(args[args.length - 2] + args[0].length);
                    // Else, numbered backreference (without curly brackets)
                    $2 = +$2; // Type-convert; drop leading zero
                    /* XRegExp behavior:
                     * - Backreferences without curly brackets end after 1 or 2 digits. Use `${..}` for more digits.
                     * - `$1` is an error if there are no capturing groups.
                     * - `$10` is an error if there are less than 10 capturing groups. Use `${1}0` instead.
                     * - `$01` is equivalent to `$1` if a capturing group exists, otherwise it's an error.
                     * - `$0` (not followed by 1-9), `$00`, and `$&` are the entire match.
                     * Native behavior, for comparison:
                     * - Backreferences end after 1 or 2 digits. Cannot use backreference to capturing group 100+.
                     * - `$1` is a literal `$1` if there are no capturing groups.
                     * - `$10` is `$1` followed by a literal `0` if there are less than 10 capturing groups.
                     * - `$01` is equivalent to `$1` if a capturing group exists, otherwise it's a literal `$01`.
                     * - `$0` is a literal `$0`. `$&` is the entire match.
                     */
                    if (!isNaN($2)) {
                        if ($2 > args.length - 3) {
                            throw new SyntaxError("backreference to undefined group " + $0);
                        }
                        return args[$2] || "";
                    }
                    throw new SyntaxError("invalid token " + $0);
                });
            });
        }
        if (isRegex) {
            if (search.global) {
                search.lastIndex = 0; // Fixes IE, Safari bug (last tested IE 9, Safari 5.1)
            } else {
                search.lastIndex = origLastIndex; // Fixes IE, Opera bug (last tested IE 9, Opera 11.6)
            }
        }
        return result;
    };

    /**
     * Fixes browser bugs in the native `String.prototype.split`. Calling `XRegExp.install('natives')`
     * uses this to override the native method. Use via `XRegExp.split` without overriding natives.
     * @private
     * @param {RegExp|String} separator Regex or string to use for separating the string.
     * @param {Number} [limit] Maximum number of items to include in the result array.
     * @returns {Array} Array of substrings.
     */
    fixed.split = function (separator, limit) {
        if (!self.isRegExp(separator)) {
            return nativ.split.apply(this, arguments); // use faster native method
        }
        var str = String(this),
            origLastIndex = separator.lastIndex,
            output = [],
            lastLastIndex = 0,
            lastLength;
        /* Values for `limit`, per the spec:
         * If undefined: pow(2,32) - 1
         * If 0, Infinity, or NaN: 0
         * If positive number: limit = floor(limit); if (limit >= pow(2,32)) limit -= pow(2,32);
         * If negative number: pow(2,32) - floor(abs(limit))
         * If other: Type-convert, then use the above rules
         */
        limit = (limit === undef ? -1 : limit) >>> 0;
        self.forEach(str, separator, function (match) {
            if (match.index + match[0].length > lastLastIndex) {
                // != `if (match[0].length)`
                output.push(str.slice(lastLastIndex, match.index));
                if (match.length > 1 && match.index < str.length) {
                    Array.prototype.push.apply(output, match.slice(1));
                }
                lastLength = match[0].length;
                lastLastIndex = match.index + lastLength;
            }
        });
        if (lastLastIndex === str.length) {
            if (!nativ.test.call(separator, "") || lastLength) {
                output.push("");
            }
        } else {
            output.push(str.slice(lastLastIndex));
        }
        separator.lastIndex = origLastIndex;
        return output.length > limit ? output.slice(0, limit) : output;
    };

    /*--------------------------------------
     *  Built-in tokens
     *------------------------------------*/

    // Shortcut
    add = addToken.on;

    /* Named capturing group; match the opening delimiter only: (?<name>
     * Capture names can use the characters A-Z, a-z, 0-9, _, and $ only. Names can't be integers.
     * Supports Python-style (?P<name> as an alternate syntax to avoid issues in recent Opera (which
     * natively supports the Python-style syntax). Otherwise, XRegExp might treat numbered
     * backreferences to Python-style named capture as octals.
     */
    add(/\(\?P?<([\w$]+)>/, function (match) {
        if (!isNaN(match[1])) {
            // Avoid incorrect lookups, since named backreferences are added to match arrays
            throw new SyntaxError("can't use integer as capture name " + match[0]);
        }
        this.captureNames.push(match[1]);
        this.hasNamedCapture = true;
        return "(";
    });

    /* Capturing group; match the opening parenthesis only.
     * Required for support of named capturing groups. Also adds explicit capture mode (flag n).
     */
    add(/\((?!\?)/, function () {
        if (this.hasFlag("n")) {
            return "(?:";
        }
        this.captureNames.push(null);
        return "(";
    }, { customFlags: "n" });

    /*--------------------------------------
     *  Expose XRegExp
     *------------------------------------*/

    // For CommonJS enviroments
    if (typeof exports !== "undefined") {
        exports.XRegExp = self;
    }

    return self;
})();
// Proposed for ES6, included in AS3
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvZG9jYmxvY2tyL2xpYi94cmVnZXhwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQSxJQUFJLE9BQU8sQ0FBQzs7O0FBR1osT0FBTyxHQUFHLE9BQU8sSUFBSyxDQUFBLFVBQVUsS0FBSyxFQUFFO0FBQ25DLGdCQUFZLENBQUM7Ozs7OztBQU1iLFFBQUksSUFBSTtRQUNKLFFBQVE7UUFDUixHQUFHOzs7QUFHSCxZQUFRLEdBQUc7QUFDUCxlQUFPLEVBQUUsS0FBSztBQUNkLHFCQUFhLEVBQUUsS0FBSztLQUN2Qjs7O0FBR0QsU0FBSyxHQUFHO0FBQ0osWUFBSSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUMzQixZQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJO0FBQzNCLGFBQUssRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUs7QUFDN0IsZUFBTyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTztBQUNqQyxhQUFLLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLO0tBQ2hDOzs7QUFHRCxTQUFLLEdBQUcsRUFBRTs7O0FBR1YsU0FBSyxHQUFHLEVBQUU7OztBQUdWLFVBQU0sR0FBRyxFQUFFOzs7QUFHWCxnQkFBWSxHQUFHLFNBQVM7UUFDeEIsVUFBVSxHQUFHLE9BQU87OztBQUdwQixnQkFBWSxHQUFHOztBQUVYLGlCQUFTLEVBQUUsMElBQTBJOztBQUVySixlQUFPLEVBQUUsdUZBQXVGO0tBQ25HOzs7QUFHRCxvQkFBZ0IsR0FBRyxrQ0FBa0M7OztBQUdyRCxrQkFBYyxHQUFHLHdCQUF3Qjs7O0FBR3pDLGNBQVUsR0FBRyw4QkFBOEI7OztBQUczQyxxQkFBaUIsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSzs7O0FBRzVELGNB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LEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQztLQUNsRSxDQUFDOzs7Ozs7O0FBT0YsT0FBRyxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUM7Ozs7Ozs7O0FBUWxCLE9BQUcsQ0FBQyxrQkFBa0IsRUFDbEIsVUFBVSxLQUFLLEVBQUU7QUFDYixZQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFOztBQUVsQixrQkFBTSxJQUFJLFdBQVcsQ0FBQyxvQ0FBb0MsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMxRTtBQUNELFlBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLFlBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBQzVCLGVBQU8sR0FBRyxDQUFDO0tBQ2QsQ0FBQyxDQUFDOzs7OztBQUtQLE9BQUcsQ0FBQyxVQUFVLEVBQ1YsWUFBWTtBQUNSLFlBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNuQixtQkFBTyxLQUFLLENBQUM7U0FDaEI7QUFDRCxZQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QixlQUFPLEdBQUcsQ0FBQztLQUNkLEVBQ0QsRUFBQyxXQUFXLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQzs7Ozs7OztBQU94QixRQUFJLE9BQU8sT0FBTyxLQUFLLFdBQVcsRUFBRTtBQUNoQyxlQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztLQUMxQjs7QUFFRCxXQUFPLElBQUksQ0FBQztDQUVmLENBQUEsRUFBRSxBQUFDLENBQUMiLCJmaWxlIjoiL1VzZXJzL21rMi8uYXRvbS9wYWNrYWdlcy9kb2NibG9ja3IvbGliL3hyZWdleHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuLyoqKioqIHhyZWdleHAuanMgKioqKiovXHJcblxyXG4vKiFcclxuICogWFJlZ0V4cCB2Mi4wLjBcclxuICogKGMpIDIwMDctMjAxMiBTdGV2ZW4gTGV2aXRoYW4gPGh0dHA6Ly94cmVnZXhwLmNvbS8+XHJcbiAqIE1JVCBMaWNlbnNlXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFhSZWdFeHAgcHJvdmlkZXMgYXVnbWVudGVkLCBleHRlbnNpYmxlIEphdmFTY3JpcHQgcmVndWxhciBleHByZXNzaW9ucy4gWW91IGdldCBuZXcgc3ludGF4LFxyXG4gKiBmbGFncywgYW5kIG1ldGhvZHMgYmV5b25kIHdoYXQgYnJvd3NlcnMgc3VwcG9ydCBuYXRpdmVseS4gWFJlZ0V4cCBpcyBhbHNvIGEgcmVnZXggdXRpbGl0eSBiZWx0XHJcbiAqIHdpdGggdG9vbHMgdG8gbWFrZSB5b3VyIGNsaWVudC1zaWRlIGdyZXBwaW5nIHNpbXBsZXIgYW5kIG1vcmUgcG93ZXJmdWwsIHdoaWxlIGZyZWVpbmcgeW91IGZyb21cclxuICogd29ycnlpbmcgYWJvdXQgcGVza3kgY3Jvc3MtYnJvd3NlciBpbmNvbnNpc3RlbmNpZXMgYW5kIHRoZSBkdWJpb3VzIGBsYXN0SW5kZXhgIHByb3BlcnR5LiBTZWVcclxuICogWFJlZ0V4cCdzIGRvY3VtZW50YXRpb24gKGh0dHA6Ly94cmVnZXhwLmNvbS8pIGZvciBtb3JlIGRldGFpbHMuXHJcbiAqIEBtb2R1bGUgeHJlZ2V4cFxyXG4gKiBAcmVxdWlyZXMgTi9BXHJcbiAqL1xyXG52YXIgWFJlZ0V4cDtcclxuXHJcbi8vIEF2b2lkIHJ1bm5pbmcgdHdpY2U7IHRoYXQgd291bGQgcmVzZXQgdG9rZW5zIGFuZCBjb3VsZCBicmVhayByZWZlcmVuY2VzIHRvIG5hdGl2ZSBnbG9iYWxzXHJcblhSZWdFeHAgPSBYUmVnRXhwIHx8IChmdW5jdGlvbiAodW5kZWYpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiAgUHJpdmF0ZSB2YXJpYWJsZXNcclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAgIHZhciBzZWxmLFxyXG4gICAgICAgIGFkZFRva2VuLFxyXG4gICAgICAgIGFkZCxcclxuXHJcbi8vIE9wdGlvbmFsIGZlYXR1cmVzOyBjYW4gYmUgaW5zdGFsbGVkIGFuZCB1bmluc3RhbGxlZFxyXG4gICAgICAgIGZlYXR1cmVzID0ge1xyXG4gICAgICAgICAgICBuYXRpdmVzOiBmYWxzZSxcclxuICAgICAgICAgICAgZXh0ZW5zaWJpbGl0eTogZmFsc2VcclxuICAgICAgICB9LFxyXG5cclxuLy8gU3RvcmUgbmF0aXZlIG1ldGhvZHMgdG8gdXNlIGFuZCByZXN0b3JlIChcIm5hdGl2ZVwiIGlzIGFuIEVTMyByZXNlcnZlZCBrZXl3b3JkKVxyXG4gICAgICAgIG5hdGl2ID0ge1xyXG4gICAgICAgICAgICBleGVjOiBSZWdFeHAucHJvdG90eXBlLmV4ZWMsXHJcbiAgICAgICAgICAgIHRlc3Q6IFJlZ0V4cC5wcm90b3R5cGUudGVzdCxcclxuICAgICAgICAgICAgbWF0Y2g6IFN0cmluZy5wcm90b3R5cGUubWF0Y2gsXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IFN0cmluZy5wcm90b3R5cGUucmVwbGFjZSxcclxuICAgICAgICAgICAgc3BsaXQ6IFN0cmluZy5wcm90b3R5cGUuc3BsaXRcclxuICAgICAgICB9LFxyXG5cclxuLy8gU3RvcmFnZSBmb3IgZml4ZWQvZXh0ZW5kZWQgbmF0aXZlIG1ldGhvZHNcclxuICAgICAgICBmaXhlZCA9IHt9LFxyXG5cclxuLy8gU3RvcmFnZSBmb3IgY2FjaGVkIHJlZ2V4ZXNcclxuICAgICAgICBjYWNoZSA9IHt9LFxyXG5cclxuLy8gU3RvcmFnZSBmb3IgYWRkb24gdG9rZW5zXHJcbiAgICAgICAgdG9rZW5zID0gW10sXHJcblxyXG4vLyBUb2tlbiBzY29wZXNcclxuICAgICAgICBkZWZhdWx0U2NvcGUgPSBcImRlZmF1bHRcIixcclxuICAgICAgICBjbGFzc1Njb3BlID0gXCJjbGFzc1wiLFxyXG5cclxuLy8gUmVnZXhlcyB0aGF0IG1hdGNoIG5hdGl2ZSByZWdleCBzeW50YXhcclxuICAgICAgICBuYXRpdmVUb2tlbnMgPSB7XHJcbiAgICAgICAgICAgIC8vIEFueSBuYXRpdmUgbXVsdGljaGFyYWN0ZXIgdG9rZW4gaW4gZGVmYXVsdCBzY29wZSAoaW5jbHVkZXMgb2N0YWxzLCBleGNsdWRlcyBjaGFyYWN0ZXIgY2xhc3NlcylcclxuICAgICAgICAgICAgXCJkZWZhdWx0XCI6IC9eKD86XFxcXCg/OjAoPzpbMC0zXVswLTddezAsMn18WzQtN11bMC03XT8pP3xbMS05XVxcZCp8eFtcXGRBLUZhLWZdezJ9fHVbXFxkQS1GYS1mXXs0fXxjW0EtWmEtel18W1xcc1xcU10pfFxcKFxcP1s6PSFdfFs/KitdXFw/fHtcXGQrKD86LFxcZCopP31cXD8/KS8sXHJcbiAgICAgICAgICAgIC8vIEFueSBuYXRpdmUgbXVsdGljaGFyYWN0ZXIgdG9rZW4gaW4gY2hhcmFjdGVyIGNsYXNzIHNjb3BlIChpbmNsdWRlcyBvY3RhbHMpXHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogL14oPzpcXFxcKD86WzAtM11bMC03XXswLDJ9fFs0LTddWzAtN10/fHhbXFxkQS1GYS1mXXsyfXx1W1xcZEEtRmEtZl17NH18Y1tBLVphLXpdfFtcXHNcXFNdKSkvXHJcbiAgICAgICAgfSxcclxuXHJcbi8vIEFueSBiYWNrcmVmZXJlbmNlIGluIHJlcGxhY2VtZW50IHN0cmluZ3NcclxuICAgICAgICByZXBsYWNlbWVudFRva2VuID0gL1xcJCg/OnsoW1xcdyRdKyl9fChcXGRcXGQ/fFtcXHNcXFNdKSkvZyxcclxuXHJcbi8vIEFueSBjaGFyYWN0ZXIgd2l0aCBhIGxhdGVyIGluc3RhbmNlIGluIHRoZSBzdHJpbmdcclxuICAgICAgICBkdXBsaWNhdGVGbGFncyA9IC8oW1xcc1xcU10pKD89W1xcc1xcU10qXFwxKS9nLFxyXG5cclxuLy8gQW55IGdyZWVkeS9sYXp5IHF1YW50aWZpZXJcclxuICAgICAgICBxdWFudGlmaWVyID0gL14oPzpbPyorXXx7XFxkKyg/OixcXGQqKT99KVxcPz8vLFxyXG5cclxuLy8gQ2hlY2sgZm9yIGNvcnJlY3QgYGV4ZWNgIGhhbmRsaW5nIG9mIG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3Vwc1xyXG4gICAgICAgIGNvbXBsaWFudEV4ZWNOcGNnID0gbmF0aXYuZXhlYy5jYWxsKC8oKT8/LywgXCJcIilbMV0gPT09IHVuZGVmLFxyXG5cclxuLy8gQ2hlY2sgZm9yIGZsYWcgeSBzdXBwb3J0IChGaXJlZm94IDMrKVxyXG4gICAgICAgIGhhc05hdGl2ZVkgPSBSZWdFeHAucHJvdG90eXBlLnN0aWNreSAhPT0gdW5kZWYsXHJcblxyXG4vLyBVc2VkIHRvIGtpbGwgaW5maW5pdGUgcmVjdXJzaW9uIGR1cmluZyBYUmVnRXhwIGNvbnN0cnVjdGlvblxyXG4gICAgICAgIGlzSW5zaWRlQ29uc3RydWN0b3IgPSBmYWxzZSxcclxuXHJcbi8vIFN0b3JhZ2UgZm9yIGtub3duIGZsYWdzLCBpbmNsdWRpbmcgYWRkb24gZmxhZ3NcclxuICAgICAgICByZWdpc3RlcmVkRmxhZ3MgPSBcImdpbVwiICsgKGhhc05hdGl2ZVkgPyBcInlcIiA6IFwiXCIpO1xyXG5cclxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiAgUHJpdmF0ZSBoZWxwZXIgZnVuY3Rpb25zXHJcbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbi8qKlxyXG4gKiBBdHRhY2hlcyBYUmVnRXhwLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGFuZCBuYW1lZCBjYXB0dXJlIHN1cHBvcnRpbmcgZGF0YSB0byBhIHJlZ2V4IG9iamVjdC5cclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtSZWdFeHB9IHJlZ2V4IFJlZ2V4IHRvIGF1Z21lbnQuXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGNhcHR1cmVOYW1lcyBBcnJheSB3aXRoIGNhcHR1cmUgbmFtZXMsIG9yIG51bGwuXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2lzTmF0aXZlXSBXaGV0aGVyIHRoZSByZWdleCB3YXMgY3JlYXRlZCBieSBgUmVnRXhwYCByYXRoZXIgdGhhbiBgWFJlZ0V4cGAuXHJcbiAqIEByZXR1cm5zIHtSZWdFeHB9IEF1Z21lbnRlZCByZWdleC5cclxuICovXHJcbiAgICBmdW5jdGlvbiBhdWdtZW50KHJlZ2V4LCBjYXB0dXJlTmFtZXMsIGlzTmF0aXZlKSB7XHJcbiAgICAgICAgdmFyIHA7XHJcbiAgICAgICAgLy8gQ2FuJ3QgYXV0by1pbmhlcml0IHRoZXNlIHNpbmNlIHRoZSBYUmVnRXhwIGNvbnN0cnVjdG9yIHJldHVybnMgYSBub25wcmltaXRpdmUgdmFsdWVcclxuICAgICAgICBmb3IgKHAgaW4gc2VsZi5wcm90b3R5cGUpIHtcclxuICAgICAgICAgICAgaWYgKHNlbGYucHJvdG90eXBlLmhhc093blByb3BlcnR5KHApKSB7XHJcbiAgICAgICAgICAgICAgICByZWdleFtwXSA9IHNlbGYucHJvdG90eXBlW3BdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlZ2V4LnhyZWdleHAgPSB7Y2FwdHVyZU5hbWVzOiBjYXB0dXJlTmFtZXMsIGlzTmF0aXZlOiAhIWlzTmF0aXZlfTtcclxuICAgICAgICByZXR1cm4gcmVnZXg7XHJcbiAgICB9XHJcblxyXG4vKipcclxuICogUmV0dXJucyBuYXRpdmUgYFJlZ0V4cGAgZmxhZ3MgdXNlZCBieSBhIHJlZ2V4IG9iamVjdC5cclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtSZWdFeHB9IHJlZ2V4IFJlZ2V4IHRvIGNoZWNrLlxyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBOYXRpdmUgZmxhZ3MgaW4gdXNlLlxyXG4gKi9cclxuICAgIGZ1bmN0aW9uIGdldE5hdGl2ZUZsYWdzKHJlZ2V4KSB7XHJcbiAgICAgICAgLy9yZXR1cm4gbmF0aXYuZXhlYy5jYWxsKC9cXC8oW2Etel0qKSQvaSwgU3RyaW5nKHJlZ2V4KSlbMV07XHJcbiAgICAgICAgcmV0dXJuIChyZWdleC5nbG9iYWwgICAgID8gXCJnXCIgOiBcIlwiKSArXHJcbiAgICAgICAgICAgICAgIChyZWdleC5pZ25vcmVDYXNlID8gXCJpXCIgOiBcIlwiKSArXHJcbiAgICAgICAgICAgICAgIChyZWdleC5tdWx0aWxpbmUgID8gXCJtXCIgOiBcIlwiKSArXHJcbiAgICAgICAgICAgICAgIChyZWdleC5leHRlbmRlZCAgID8gXCJ4XCIgOiBcIlwiKSArIC8vIFByb3Bvc2VkIGZvciBFUzYsIGluY2x1ZGVkIGluIEFTM1xyXG4gICAgICAgICAgICAgICAocmVnZXguc3RpY2t5ICAgICA/IFwieVwiIDogXCJcIik7IC8vIFByb3Bvc2VkIGZvciBFUzYsIGluY2x1ZGVkIGluIEZpcmVmb3ggMytcclxuICAgIH1cclxuXHJcbi8qKlxyXG4gKiBDb3BpZXMgYSByZWdleCBvYmplY3Qgd2hpbGUgcHJlc2VydmluZyBzcGVjaWFsIHByb3BlcnRpZXMgZm9yIG5hbWVkIGNhcHR1cmUgYW5kIGF1Z21lbnRpbmcgd2l0aFxyXG4gKiBgWFJlZ0V4cC5wcm90b3R5cGVgIG1ldGhvZHMuIFRoZSBjb3B5IGhhcyBhIGZyZXNoIGBsYXN0SW5kZXhgIHByb3BlcnR5IChzZXQgdG8gemVybykuIEFsbG93c1xyXG4gKiBhZGRpbmcgYW5kIHJlbW92aW5nIGZsYWdzIHdoaWxlIGNvcHlpbmcgdGhlIHJlZ2V4LlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVnZXggUmVnZXggdG8gY29weS5cclxuICogQHBhcmFtIHtTdHJpbmd9IFthZGRGbGFnc10gRmxhZ3MgdG8gYmUgYWRkZWQgd2hpbGUgY29weWluZyB0aGUgcmVnZXguXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBbcmVtb3ZlRmxhZ3NdIEZsYWdzIHRvIGJlIHJlbW92ZWQgd2hpbGUgY29weWluZyB0aGUgcmVnZXguXHJcbiAqIEByZXR1cm5zIHtSZWdFeHB9IENvcHkgb2YgdGhlIHByb3ZpZGVkIHJlZ2V4LCBwb3NzaWJseSB3aXRoIG1vZGlmaWVkIGZsYWdzLlxyXG4gKi9cclxuICAgIGZ1bmN0aW9uIGNvcHkocmVnZXgsIGFkZEZsYWdzLCByZW1vdmVGbGFncykge1xyXG4gICAgICAgIGlmICghc2VsZi5pc1JlZ0V4cChyZWdleCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcInR5cGUgUmVnRXhwIGV4cGVjdGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZmxhZ3MgPSBuYXRpdi5yZXBsYWNlLmNhbGwoZ2V0TmF0aXZlRmxhZ3MocmVnZXgpICsgKGFkZEZsYWdzIHx8IFwiXCIpLCBkdXBsaWNhdGVGbGFncywgXCJcIik7XHJcbiAgICAgICAgaWYgKHJlbW92ZUZsYWdzKSB7XHJcbiAgICAgICAgICAgIC8vIFdvdWxkIG5lZWQgdG8gZXNjYXBlIGByZW1vdmVGbGFnc2AgaWYgdGhpcyB3YXMgcHVibGljXHJcbiAgICAgICAgICAgIGZsYWdzID0gbmF0aXYucmVwbGFjZS5jYWxsKGZsYWdzLCBuZXcgUmVnRXhwKFwiW1wiICsgcmVtb3ZlRmxhZ3MgKyBcIl0rXCIsIFwiZ1wiKSwgXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWdleC54cmVnZXhwICYmICFyZWdleC54cmVnZXhwLmlzTmF0aXZlKSB7XHJcbiAgICAgICAgICAgIC8vIENvbXBpbGluZyB0aGUgY3VycmVudCAocmF0aGVyIHRoYW4gcHJlY29tcGlsYXRpb24pIHNvdXJjZSBwcmVzZXJ2ZXMgdGhlIGVmZmVjdHMgb2Ygbm9ubmF0aXZlIHNvdXJjZSBmbGFnc1xyXG4gICAgICAgICAgICByZWdleCA9IGF1Z21lbnQoc2VsZihyZWdleC5zb3VyY2UsIGZsYWdzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2V4LnhyZWdleHAuY2FwdHVyZU5hbWVzID8gcmVnZXgueHJlZ2V4cC5jYXB0dXJlTmFtZXMuc2xpY2UoMCkgOiBudWxsKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBBdWdtZW50IHdpdGggYFhSZWdFeHAucHJvdG90eXBlYCBtZXRob2RzLCBidXQgdXNlIG5hdGl2ZSBgUmVnRXhwYCAoYXZvaWQgc2VhcmNoaW5nIGZvciBzcGVjaWFsIHRva2VucylcclxuICAgICAgICAgICAgcmVnZXggPSBhdWdtZW50KG5ldyBSZWdFeHAocmVnZXguc291cmNlLCBmbGFncyksIG51bGwsIHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVnZXg7XHJcbiAgICB9XHJcblxyXG4vKlxyXG4gKiBSZXR1cm5zIHRoZSBsYXN0IGluZGV4IGF0IHdoaWNoIGEgZ2l2ZW4gdmFsdWUgY2FuIGJlIGZvdW5kIGluIGFuIGFycmF5LCBvciBgLTFgIGlmIGl0J3Mgbm90XHJcbiAqIHByZXNlbnQuIFRoZSBhcnJheSBpcyBzZWFyY2hlZCBiYWNrd2FyZHMuXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IEFycmF5IHRvIHNlYXJjaC5cclxuICogQHBhcmFtIHsqfSB2YWx1ZSBWYWx1ZSB0byBsb2NhdGUgaW4gdGhlIGFycmF5LlxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBMYXN0IHplcm8tYmFzZWQgaW5kZXggYXQgd2hpY2ggdGhlIGl0ZW0gaXMgZm91bmQsIG9yIC0xLlxyXG4gKi9cclxuICAgIGZ1bmN0aW9uIGxhc3RJbmRleE9mKGFycmF5LCB2YWx1ZSkge1xyXG4gICAgICAgIHZhciBpID0gYXJyYXkubGVuZ3RoO1xyXG4gICAgICAgIGlmIChBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2YpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5Lmxhc3RJbmRleE9mKHZhbHVlKTsgLy8gVXNlIHRoZSBuYXRpdmUgbWV0aG9kIGlmIGF2YWlsYWJsZVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgIGlmIChhcnJheVtpXSA9PT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuXHJcbi8qKlxyXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gb2JqZWN0IGlzIG9mIHRoZSBzcGVjaWZpZWQgdHlwZS5cclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHsqfSB2YWx1ZSBPYmplY3QgdG8gY2hlY2suXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFR5cGUgdG8gY2hlY2sgZm9yLCBpbiBsb3dlcmNhc2UuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBXaGV0aGVyIHRoZSBvYmplY3QgbWF0Y2hlcyB0aGUgdHlwZS5cclxuICovXHJcbiAgICBmdW5jdGlvbiBpc1R5cGUodmFsdWUsIHR5cGUpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKS50b0xvd2VyQ2FzZSgpID09PSBcIltvYmplY3QgXCIgKyB0eXBlICsgXCJdXCI7XHJcbiAgICB9XHJcblxyXG4vKipcclxuICogUHJlcGFyZXMgYW4gb3B0aW9ucyBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gdmFsdWUuXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gdmFsdWUgVmFsdWUgdG8gY29udmVydCB0byBhbiBvcHRpb25zIG9iamVjdC5cclxuICogQHJldHVybnMge09iamVjdH0gT3B0aW9ucyBvYmplY3QuXHJcbiAqL1xyXG4gICAgZnVuY3Rpb24gcHJlcGFyZU9wdGlvbnModmFsdWUpIHtcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlIHx8IHt9O1xyXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gXCJhbGxcIiB8fCB2YWx1ZS5hbGwpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSB7bmF0aXZlczogdHJ1ZSwgZXh0ZW5zaWJpbGl0eTogdHJ1ZX07XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc1R5cGUodmFsdWUsIFwic3RyaW5nXCIpKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gc2VsZi5mb3JFYWNoKHZhbHVlLCAvW15cXHMsXSsvLCBmdW5jdGlvbiAobSkge1xyXG4gICAgICAgICAgICAgICAgdGhpc1ttXSA9IHRydWU7XHJcbiAgICAgICAgICAgIH0sIHt9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG5cclxuLyoqXHJcbiAqIFJ1bnMgYnVpbHQtaW4vY3VzdG9tIHRva2VucyBpbiByZXZlcnNlIGluc2VydGlvbiBvcmRlciwgdW50aWwgYSBtYXRjaCBpcyBmb3VuZC5cclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtTdHJpbmd9IHBhdHRlcm4gT3JpZ2luYWwgcGF0dGVybiBmcm9tIHdoaWNoIGFuIFhSZWdFeHAgb2JqZWN0IGlzIGJlaW5nIGJ1aWx0LlxyXG4gKiBAcGFyYW0ge051bWJlcn0gcG9zIFBvc2l0aW9uIHRvIHNlYXJjaCBmb3IgdG9rZW5zIHdpdGhpbiBgcGF0dGVybmAuXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY29wZSBDdXJyZW50IHJlZ2V4IHNjb3BlLlxyXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCBDb250ZXh0IG9iamVjdCBhc3NpZ25lZCB0byB0b2tlbiBoYW5kbGVyIGZ1bmN0aW9ucy5cclxuICogQHJldHVybnMge09iamVjdH0gT2JqZWN0IHdpdGggcHJvcGVydGllcyBgb3V0cHV0YCAodGhlIHN1YnN0aXR1dGlvbiBzdHJpbmcgcmV0dXJuZWQgYnkgdGhlXHJcbiAqICAgc3VjY2Vzc2Z1bCB0b2tlbiBoYW5kbGVyKSBhbmQgYG1hdGNoYCAodGhlIHRva2VuJ3MgbWF0Y2ggYXJyYXkpLCBvciBudWxsLlxyXG4gKi9cclxuICAgIGZ1bmN0aW9uIHJ1blRva2VucyhwYXR0ZXJuLCBwb3MsIHNjb3BlLCBjb250ZXh0KSB7XHJcbiAgICAgICAgdmFyIGkgPSB0b2tlbnMubGVuZ3RoLFxyXG4gICAgICAgICAgICByZXN1bHQgPSBudWxsLFxyXG4gICAgICAgICAgICBtYXRjaCxcclxuICAgICAgICAgICAgdDtcclxuICAgICAgICAvLyBQcm90ZWN0IGFnYWluc3QgY29uc3RydWN0aW5nIFhSZWdFeHBzIHdpdGhpbiB0b2tlbiBoYW5kbGVyIGFuZCB0cmlnZ2VyIGZ1bmN0aW9uc1xyXG4gICAgICAgIGlzSW5zaWRlQ29uc3RydWN0b3IgPSB0cnVlO1xyXG4gICAgICAgIC8vIE11c3QgcmVzZXQgYGlzSW5zaWRlQ29uc3RydWN0b3JgLCBldmVuIGlmIGEgYHRyaWdnZXJgIG9yIGBoYW5kbGVyYCB0aHJvd3NcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7IC8vIFJ1biBpbiByZXZlcnNlIG9yZGVyXHJcbiAgICAgICAgICAgICAgICB0ID0gdG9rZW5zW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKCh0LnNjb3BlID09PSBcImFsbFwiIHx8IHQuc2NvcGUgPT09IHNjb3BlKSAmJiAoIXQudHJpZ2dlciB8fCB0LnRyaWdnZXIuY2FsbChjb250ZXh0KSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0LnBhdHRlcm4ubGFzdEluZGV4ID0gcG9zO1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gZml4ZWQuZXhlYy5jYWxsKHQucGF0dGVybiwgcGF0dGVybik7IC8vIEZpeGVkIGBleGVjYCBoZXJlIGFsbG93cyB1c2Ugb2YgbmFtZWQgYmFja3JlZmVyZW5jZXMsIGV0Yy5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2ggJiYgbWF0Y2guaW5kZXggPT09IHBvcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQ6IHQuaGFuZGxlci5jYWxsKGNvbnRleHQsIG1hdGNoLCBzY29wZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaDogbWF0Y2hcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICBpc0luc2lkZUNvbnN0cnVjdG9yID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4vKipcclxuICogRW5hYmxlcyBvciBkaXNhYmxlcyBYUmVnRXhwIHN5bnRheCBhbmQgZmxhZyBleHRlbnNpYmlsaXR5LlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uIGB0cnVlYCB0byBlbmFibGU7IGBmYWxzZWAgdG8gZGlzYWJsZS5cclxuICovXHJcbiAgICBmdW5jdGlvbiBzZXRFeHRlbnNpYmlsaXR5KG9uKSB7XHJcbiAgICAgICAgc2VsZi5hZGRUb2tlbiA9IGFkZFRva2VuW29uID8gXCJvblwiIDogXCJvZmZcIl07XHJcbiAgICAgICAgZmVhdHVyZXMuZXh0ZW5zaWJpbGl0eSA9IG9uO1xyXG4gICAgfVxyXG5cclxuLyoqXHJcbiAqIEVuYWJsZXMgb3IgZGlzYWJsZXMgbmF0aXZlIG1ldGhvZCBvdmVycmlkZXMuXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb24gYHRydWVgIHRvIGVuYWJsZTsgYGZhbHNlYCB0byBkaXNhYmxlLlxyXG4gKi9cclxuICAgIGZ1bmN0aW9uIHNldE5hdGl2ZXMob24pIHtcclxuICAgICAgICBSZWdFeHAucHJvdG90eXBlLmV4ZWMgPSAob24gPyBmaXhlZCA6IG5hdGl2KS5leGVjO1xyXG4gICAgICAgIFJlZ0V4cC5wcm90b3R5cGUudGVzdCA9IChvbiA/IGZpeGVkIDogbmF0aXYpLnRlc3Q7XHJcbiAgICAgICAgU3RyaW5nLnByb3RvdHlwZS5tYXRjaCA9IChvbiA/IGZpeGVkIDogbmF0aXYpLm1hdGNoO1xyXG4gICAgICAgIFN0cmluZy5wcm90b3R5cGUucmVwbGFjZSA9IChvbiA/IGZpeGVkIDogbmF0aXYpLnJlcGxhY2U7XHJcbiAgICAgICAgU3RyaW5nLnByb3RvdHlwZS5zcGxpdCA9IChvbiA/IGZpeGVkIDogbmF0aXYpLnNwbGl0O1xyXG4gICAgICAgIGZlYXR1cmVzLm5hdGl2ZXMgPSBvbjtcclxuICAgIH1cclxuXHJcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvbnN0cnVjdG9yXHJcbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGFuIGV4dGVuZGVkIHJlZ3VsYXIgZXhwcmVzc2lvbiBvYmplY3QgZm9yIG1hdGNoaW5nIHRleHQgd2l0aCBhIHBhdHRlcm4uIERpZmZlcnMgZnJvbSBhXHJcbiAqIG5hdGl2ZSByZWd1bGFyIGV4cHJlc3Npb24gaW4gdGhhdCBhZGRpdGlvbmFsIHN5bnRheCBhbmQgZmxhZ3MgYXJlIHN1cHBvcnRlZC4gVGhlIHJldHVybmVkIG9iamVjdFxyXG4gKiBpcyBpbiBmYWN0IGEgbmF0aXZlIGBSZWdFeHBgIGFuZCB3b3JrcyB3aXRoIGFsbCBuYXRpdmUgbWV0aG9kcy5cclxuICogQGNsYXNzIFhSZWdFeHBcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfFJlZ0V4cH0gcGF0dGVybiBSZWdleCBwYXR0ZXJuIHN0cmluZywgb3IgYW4gZXhpc3RpbmcgYFJlZ0V4cGAgb2JqZWN0IHRvIGNvcHkuXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBbZmxhZ3NdIEFueSBjb21iaW5hdGlvbiBvZiBmbGFnczpcclxuICogICA8bGk+YGdgIC0gZ2xvYmFsXHJcbiAqICAgPGxpPmBpYCAtIGlnbm9yZSBjYXNlXHJcbiAqICAgPGxpPmBtYCAtIG11bHRpbGluZSBhbmNob3JzXHJcbiAqICAgPGxpPmBuYCAtIGV4cGxpY2l0IGNhcHR1cmVcclxuICogICA8bGk+YHNgIC0gZG90IG1hdGNoZXMgYWxsIChha2Egc2luZ2xlbGluZSlcclxuICogICA8bGk+YHhgIC0gZnJlZS1zcGFjaW5nIGFuZCBsaW5lIGNvbW1lbnRzIChha2EgZXh0ZW5kZWQpXHJcbiAqICAgPGxpPmB5YCAtIHN0aWNreSAoRmlyZWZveCAzKyBvbmx5KVxyXG4gKiAgIEZsYWdzIGNhbm5vdCBiZSBwcm92aWRlZCB3aGVuIGNvbnN0cnVjdGluZyBvbmUgYFJlZ0V4cGAgZnJvbSBhbm90aGVyLlxyXG4gKiBAcmV0dXJucyB7UmVnRXhwfSBFeHRlbmRlZCByZWd1bGFyIGV4cHJlc3Npb24gb2JqZWN0LlxyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiAvLyBXaXRoIG5hbWVkIGNhcHR1cmUgYW5kIGZsYWcgeFxyXG4gKiBkYXRlID0gWFJlZ0V4cCgnKD88eWVhcj4gIFswLTldezR9KSAtPyAgIyB5ZWFyICBcXG5cXFxyXG4gKiAgICAgICAgICAgICAgICAgKD88bW9udGg+IFswLTldezJ9KSAtPyAgIyBtb250aCBcXG5cXFxyXG4gKiAgICAgICAgICAgICAgICAgKD88ZGF5PiAgIFswLTldezJ9KSAgICAgIyBkYXkgICAnLCAneCcpO1xyXG4gKlxyXG4gKiAvLyBQYXNzaW5nIGEgcmVnZXggb2JqZWN0IHRvIGNvcHkgaXQuIFRoZSBjb3B5IG1haW50YWlucyBzcGVjaWFsIHByb3BlcnRpZXMgZm9yIG5hbWVkIGNhcHR1cmUsXHJcbiAqIC8vIGlzIGF1Z21lbnRlZCB3aXRoIGBYUmVnRXhwLnByb3RvdHlwZWAgbWV0aG9kcywgYW5kIGhhcyBhIGZyZXNoIGBsYXN0SW5kZXhgIHByb3BlcnR5IChzZXQgdG9cclxuICogLy8gemVybykuIE5hdGl2ZSByZWdleGVzIGFyZSBub3QgcmVjb21waWxlZCB1c2luZyBYUmVnRXhwIHN5bnRheC5cclxuICogWFJlZ0V4cCgvcmVnZXgvKTtcclxuICovXHJcbiAgICBzZWxmID0gZnVuY3Rpb24gKHBhdHRlcm4sIGZsYWdzKSB7XHJcbiAgICAgICAgaWYgKHNlbGYuaXNSZWdFeHAocGF0dGVybikpIHtcclxuICAgICAgICAgICAgaWYgKGZsYWdzICE9PSB1bmRlZikge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImNhbid0IHN1cHBseSBmbGFncyB3aGVuIGNvbnN0cnVjdGluZyBvbmUgUmVnRXhwIGZyb20gYW5vdGhlclwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gY29weShwYXR0ZXJuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVG9rZW5zIGJlY29tZSBwYXJ0IG9mIHRoZSByZWdleCBjb25zdHJ1Y3Rpb24gcHJvY2Vzcywgc28gcHJvdGVjdCBhZ2FpbnN0IGluZmluaXRlIHJlY3Vyc2lvblxyXG4gICAgICAgIC8vIHdoZW4gYW4gWFJlZ0V4cCBpcyBjb25zdHJ1Y3RlZCB3aXRoaW4gYSB0b2tlbiBoYW5kbGVyIGZ1bmN0aW9uXHJcbiAgICAgICAgaWYgKGlzSW5zaWRlQ29uc3RydWN0b3IpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2FuJ3QgY2FsbCB0aGUgWFJlZ0V4cCBjb25zdHJ1Y3RvciB3aXRoaW4gdG9rZW4gZGVmaW5pdGlvbiBmdW5jdGlvbnNcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgb3V0cHV0ID0gW10sXHJcbiAgICAgICAgICAgIHNjb3BlID0gZGVmYXVsdFNjb3BlLFxyXG4gICAgICAgICAgICB0b2tlbkNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBoYXNOYW1lZENhcHR1cmU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY2FwdHVyZU5hbWVzOiBbXSxcclxuICAgICAgICAgICAgICAgIGhhc0ZsYWc6IGZ1bmN0aW9uIChmbGFnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZsYWdzLmluZGV4T2YoZmxhZykgPiAtMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcG9zID0gMCxcclxuICAgICAgICAgICAgdG9rZW5SZXN1bHQsXHJcbiAgICAgICAgICAgIG1hdGNoLFxyXG4gICAgICAgICAgICBjaHI7XHJcbiAgICAgICAgcGF0dGVybiA9IHBhdHRlcm4gPT09IHVuZGVmID8gXCJcIiA6IFN0cmluZyhwYXR0ZXJuKTtcclxuICAgICAgICBmbGFncyA9IGZsYWdzID09PSB1bmRlZiA/IFwiXCIgOiBTdHJpbmcoZmxhZ3MpO1xyXG5cclxuICAgICAgICBpZiAobmF0aXYubWF0Y2guY2FsbChmbGFncywgZHVwbGljYXRlRmxhZ3MpKSB7IC8vIERvbid0IHVzZSB0ZXN0L2V4ZWMgYmVjYXVzZSB0aGV5IHdvdWxkIHVwZGF0ZSBsYXN0SW5kZXhcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiaW52YWxpZCBkdXBsaWNhdGUgcmVndWxhciBleHByZXNzaW9uIGZsYWdcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFN0cmlwL2FwcGx5IGxlYWRpbmcgbW9kZSBtb2RpZmllciB3aXRoIGFueSBjb21iaW5hdGlvbiBvZiBmbGFncyBleGNlcHQgZyBvciB5OiAoP2ltbnN4KVxyXG4gICAgICAgIHBhdHRlcm4gPSBuYXRpdi5yZXBsYWNlLmNhbGwocGF0dGVybiwgL15cXChcXD8oW1xcdyRdKylcXCkvLCBmdW5jdGlvbiAoJDAsICQxKSB7XHJcbiAgICAgICAgICAgIGlmIChuYXRpdi50ZXN0LmNhbGwoL1tneV0vLCAkMSkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcImNhbid0IHVzZSBmbGFnIGcgb3IgeSBpbiBtb2RlIG1vZGlmaWVyXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZsYWdzID0gbmF0aXYucmVwbGFjZS5jYWxsKGZsYWdzICsgJDEsIGR1cGxpY2F0ZUZsYWdzLCBcIlwiKTtcclxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VsZi5mb3JFYWNoKGZsYWdzLCAvW1xcc1xcU10vLCBmdW5jdGlvbiAobSkge1xyXG4gICAgICAgICAgICBpZiAocmVnaXN0ZXJlZEZsYWdzLmluZGV4T2YobVswXSkgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJpbnZhbGlkIHJlZ3VsYXIgZXhwcmVzc2lvbiBmbGFnIFwiICsgbVswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgd2hpbGUgKHBvcyA8IHBhdHRlcm4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBjdXN0b20gdG9rZW5zIGF0IHRoZSBjdXJyZW50IHBvc2l0aW9uXHJcbiAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gcnVuVG9rZW5zKHBhdHRlcm4sIHBvcywgc2NvcGUsIHRva2VuQ29udGV4dCk7XHJcbiAgICAgICAgICAgIGlmICh0b2tlblJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2godG9rZW5SZXN1bHQub3V0cHV0KTtcclxuICAgICAgICAgICAgICAgIHBvcyArPSAodG9rZW5SZXN1bHQubWF0Y2hbMF0ubGVuZ3RoIHx8IDEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIG5hdGl2ZSB0b2tlbnMgKGV4Y2VwdCBjaGFyYWN0ZXIgY2xhc3NlcykgYXQgdGhlIGN1cnJlbnQgcG9zaXRpb25cclxuICAgICAgICAgICAgICAgIG1hdGNoID0gbmF0aXYuZXhlYy5jYWxsKG5hdGl2ZVRva2Vuc1tzY29wZV0sIHBhdHRlcm4uc2xpY2UocG9zKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChtYXRjaFswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zICs9IG1hdGNoWzBdLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hyID0gcGF0dGVybi5jaGFyQXQocG9zKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hyID09PSBcIltcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZSA9IGNsYXNzU2NvcGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaHIgPT09IFwiXVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlID0gZGVmYXVsdFNjb3BlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBBZHZhbmNlIHBvc2l0aW9uIGJ5IG9uZSBjaGFyYWN0ZXJcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChjaHIpO1xyXG4gICAgICAgICAgICAgICAgICAgICsrcG9zO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYXVnbWVudChuZXcgUmVnRXhwKG91dHB1dC5qb2luKFwiXCIpLCBuYXRpdi5yZXBsYWNlLmNhbGwoZmxhZ3MsIC9bXmdpbXldKy9nLCBcIlwiKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdG9rZW5Db250ZXh0Lmhhc05hbWVkQ2FwdHVyZSA/IHRva2VuQ29udGV4dC5jYXB0dXJlTmFtZXMgOiBudWxsKTtcclxuICAgIH07XHJcblxyXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqICBQdWJsaWMgbWV0aG9kcy9wcm9wZXJ0aWVzXHJcbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbi8vIEluc3RhbGxlZCBhbmQgdW5pbnN0YWxsZWQgc3RhdGVzIGZvciBgWFJlZ0V4cC5hZGRUb2tlbmBcclxuICAgIGFkZFRva2VuID0ge1xyXG4gICAgICAgIG9uOiBmdW5jdGlvbiAocmVnZXgsIGhhbmRsZXIsIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICAgICAgICAgIGlmIChyZWdleCkge1xyXG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm46IGNvcHkocmVnZXgsIFwiZ1wiICsgKGhhc05hdGl2ZVkgPyBcInlcIiA6IFwiXCIpKSxcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyOiBoYW5kbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlOiBvcHRpb25zLnNjb3BlIHx8IGRlZmF1bHRTY29wZSxcclxuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyOiBvcHRpb25zLnRyaWdnZXIgfHwgbnVsbFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUHJvdmlkaW5nIGBjdXN0b21GbGFnc2Agd2l0aCBudWxsIGByZWdleGAgYW5kIGBoYW5kbGVyYCBhbGxvd3MgYWRkaW5nIGZsYWdzIHRoYXQgZG9cclxuICAgICAgICAgICAgLy8gbm90aGluZywgYnV0IGRvbid0IHRocm93IGFuIGVycm9yXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmN1c3RvbUZsYWdzKSB7XHJcbiAgICAgICAgICAgICAgICByZWdpc3RlcmVkRmxhZ3MgPSBuYXRpdi5yZXBsYWNlLmNhbGwocmVnaXN0ZXJlZEZsYWdzICsgb3B0aW9ucy5jdXN0b21GbGFncywgZHVwbGljYXRlRmxhZ3MsIFwiXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvZmY6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZXh0ZW5zaWJpbGl0eSBtdXN0IGJlIGluc3RhbGxlZCBiZWZvcmUgdXNpbmcgYWRkVG9rZW5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbi8qKlxyXG4gKiBFeHRlbmRzIG9yIGNoYW5nZXMgWFJlZ0V4cCBzeW50YXggYW5kIGFsbG93cyBjdXN0b20gZmxhZ3MuIFRoaXMgaXMgdXNlZCBpbnRlcm5hbGx5IGFuZCBjYW4gYmVcclxuICogdXNlZCB0byBjcmVhdGUgWFJlZ0V4cCBhZGRvbnMuIGBYUmVnRXhwLmluc3RhbGwoJ2V4dGVuc2liaWxpdHknKWAgbXVzdCBiZSBydW4gYmVmb3JlIGNhbGxpbmdcclxuICogdGhpcyBmdW5jdGlvbiwgb3IgYW4gZXJyb3IgaXMgdGhyb3duLiBJZiBtb3JlIHRoYW4gb25lIHRva2VuIGNhbiBtYXRjaCB0aGUgc2FtZSBzdHJpbmcsIHRoZSBsYXN0XHJcbiAqIGFkZGVkIHdpbnMuXHJcbiAqIEBtZW1iZXJPZiBYUmVnRXhwXHJcbiAqIEBwYXJhbSB7UmVnRXhwfSByZWdleCBSZWdleCBvYmplY3QgdGhhdCBtYXRjaGVzIHRoZSBuZXcgdG9rZW4uXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXIgRnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgbmV3IHBhdHRlcm4gc3RyaW5nICh1c2luZyBuYXRpdmUgcmVnZXggc3ludGF4KVxyXG4gKiAgIHRvIHJlcGxhY2UgdGhlIG1hdGNoZWQgdG9rZW4gd2l0aGluIGFsbCBmdXR1cmUgWFJlZ0V4cCByZWdleGVzLiBIYXMgYWNjZXNzIHRvIHBlcnNpc3RlbnRcclxuICogICBwcm9wZXJ0aWVzIG9mIHRoZSByZWdleCBiZWluZyBidWlsdCwgdGhyb3VnaCBgdGhpc2AuIEludm9rZWQgd2l0aCB0d28gYXJndW1lbnRzOlxyXG4gKiAgIDxsaT5UaGUgbWF0Y2ggYXJyYXksIHdpdGggbmFtZWQgYmFja3JlZmVyZW5jZSBwcm9wZXJ0aWVzLlxyXG4gKiAgIDxsaT5UaGUgcmVnZXggc2NvcGUgd2hlcmUgdGhlIG1hdGNoIHdhcyBmb3VuZC5cclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBPcHRpb25zIG9iamVjdCB3aXRoIG9wdGlvbmFsIHByb3BlcnRpZXM6XHJcbiAqICAgPGxpPmBzY29wZWAge1N0cmluZ30gU2NvcGVzIHdoZXJlIHRoZSB0b2tlbiBhcHBsaWVzOiAnZGVmYXVsdCcsICdjbGFzcycsIG9yICdhbGwnLlxyXG4gKiAgIDxsaT5gdHJpZ2dlcmAge0Z1bmN0aW9ufSBGdW5jdGlvbiB0aGF0IHJldHVybnMgYHRydWVgIHdoZW4gdGhlIHRva2VuIHNob3VsZCBiZSBhcHBsaWVkOyBlLmcuLFxyXG4gKiAgICAgaWYgYSBmbGFnIGlzIHNldC4gSWYgYGZhbHNlYCBpcyByZXR1cm5lZCwgdGhlIG1hdGNoZWQgc3RyaW5nIGNhbiBiZSBtYXRjaGVkIGJ5IG90aGVyIHRva2Vucy5cclxuICogICAgIEhhcyBhY2Nlc3MgdG8gcGVyc2lzdGVudCBwcm9wZXJ0aWVzIG9mIHRoZSByZWdleCBiZWluZyBidWlsdCwgdGhyb3VnaCBgdGhpc2AgKGluY2x1ZGluZ1xyXG4gKiAgICAgZnVuY3Rpb24gYHRoaXMuaGFzRmxhZ2ApLlxyXG4gKiAgIDxsaT5gY3VzdG9tRmxhZ3NgIHtTdHJpbmd9IE5vbm5hdGl2ZSBmbGFncyB1c2VkIGJ5IHRoZSB0b2tlbidzIGhhbmRsZXIgb3IgdHJpZ2dlciBmdW5jdGlvbnMuXHJcbiAqICAgICBQcmV2ZW50cyBYUmVnRXhwIGZyb20gdGhyb3dpbmcgYW4gaW52YWxpZCBmbGFnIGVycm9yIHdoZW4gdGhlIHNwZWNpZmllZCBmbGFncyBhcmUgdXNlZC5cclxuICogQGV4YW1wbGVcclxuICpcclxuICogLy8gQmFzaWMgdXNhZ2U6IEFkZHMgXFxhIGZvciBBTEVSVCBjaGFyYWN0ZXJcclxuICogWFJlZ0V4cC5hZGRUb2tlbihcclxuICogICAvXFxcXGEvLFxyXG4gKiAgIGZ1bmN0aW9uICgpIHtyZXR1cm4gJ1xcXFx4MDcnO30sXHJcbiAqICAge3Njb3BlOiAnYWxsJ31cclxuICogKTtcclxuICogWFJlZ0V4cCgnXFxcXGFbXFxcXGEtXFxcXG5dKycpLnRlc3QoJ1xceDA3XFxuXFx4MDcnKTsgLy8gLT4gdHJ1ZVxyXG4gKi9cclxuICAgIHNlbGYuYWRkVG9rZW4gPSBhZGRUb2tlbi5vZmY7XHJcblxyXG4vKipcclxuICogQ2FjaGVzIGFuZCByZXR1cm5zIHRoZSByZXN1bHQgb2YgY2FsbGluZyBgWFJlZ0V4cChwYXR0ZXJuLCBmbGFncylgLiBPbiBhbnkgc3Vic2VxdWVudCBjYWxsIHdpdGhcclxuICogdGhlIHNhbWUgcGF0dGVybiBhbmQgZmxhZyBjb21iaW5hdGlvbiwgdGhlIGNhY2hlZCBjb3B5IGlzIHJldHVybmVkLlxyXG4gKiBAbWVtYmVyT2YgWFJlZ0V4cFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0dGVybiBSZWdleCBwYXR0ZXJuIHN0cmluZy5cclxuICogQHBhcmFtIHtTdHJpbmd9IFtmbGFnc10gQW55IGNvbWJpbmF0aW9uIG9mIFhSZWdFeHAgZmxhZ3MuXHJcbiAqIEByZXR1cm5zIHtSZWdFeHB9IENhY2hlZCBYUmVnRXhwIG9iamVjdC5cclxuICogQGV4YW1wbGVcclxuICpcclxuICogd2hpbGUgKG1hdGNoID0gWFJlZ0V4cC5jYWNoZSgnLicsICdncycpLmV4ZWMoc3RyKSkge1xyXG4gKiAgIC8vIFRoZSByZWdleCBpcyBjb21waWxlZCBvbmNlIG9ubHlcclxuICogfVxyXG4gKi9cclxuICAgIHNlbGYuY2FjaGUgPSBmdW5jdGlvbiAocGF0dGVybiwgZmxhZ3MpIHtcclxuICAgICAgICB2YXIga2V5ID0gcGF0dGVybiArIFwiL1wiICsgKGZsYWdzIHx8IFwiXCIpO1xyXG4gICAgICAgIHJldHVybiBjYWNoZVtrZXldIHx8IChjYWNoZVtrZXldID0gc2VsZihwYXR0ZXJuLCBmbGFncykpO1xyXG4gICAgfTtcclxuXHJcbi8qKlxyXG4gKiBFc2NhcGVzIGFueSByZWd1bGFyIGV4cHJlc3Npb24gbWV0YWNoYXJhY3RlcnMsIGZvciB1c2Ugd2hlbiBtYXRjaGluZyBsaXRlcmFsIHN0cmluZ3MuIFRoZSByZXN1bHRcclxuICogY2FuIHNhZmVseSBiZSB1c2VkIGF0IGFueSBwb2ludCB3aXRoaW4gYSByZWdleCB0aGF0IHVzZXMgYW55IGZsYWdzLlxyXG4gKiBAbWVtYmVyT2YgWFJlZ0V4cFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFN0cmluZyB0byBlc2NhcGUuXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IFN0cmluZyB3aXRoIHJlZ2V4IG1ldGFjaGFyYWN0ZXJzIGVzY2FwZWQuXHJcbiAqIEBleGFtcGxlXHJcbiAqXHJcbiAqIFhSZWdFeHAuZXNjYXBlKCdFc2NhcGVkPyA8Lj4nKTtcclxuICogLy8gLT4gJ0VzY2FwZWRcXD9cXCA8XFwuPidcclxuICovXHJcbiAgICBzZWxmLmVzY2FwZSA9IGZ1bmN0aW9uIChzdHIpIHtcclxuICAgICAgICByZXR1cm4gbmF0aXYucmVwbGFjZS5jYWxsKHN0ciwgL1stW1xcXXt9KCkqKz8uLFxcXFxeJHwjXFxzXS9nLCBcIlxcXFwkJlwiKTtcclxuICAgIH07XHJcblxyXG4vKipcclxuICogRXhlY3V0ZXMgYSByZWdleCBzZWFyY2ggaW4gYSBzcGVjaWZpZWQgc3RyaW5nLiBSZXR1cm5zIGEgbWF0Y2ggYXJyYXkgb3IgYG51bGxgLiBJZiB0aGUgcHJvdmlkZWRcclxuICogcmVnZXggdXNlcyBuYW1lZCBjYXB0dXJlLCBuYW1lZCBiYWNrcmVmZXJlbmNlIHByb3BlcnRpZXMgYXJlIGluY2x1ZGVkIG9uIHRoZSBtYXRjaCBhcnJheS5cclxuICogT3B0aW9uYWwgYHBvc2AgYW5kIGBzdGlja3lgIGFyZ3VtZW50cyBzcGVjaWZ5IHRoZSBzZWFyY2ggc3RhcnQgcG9zaXRpb24sIGFuZCB3aGV0aGVyIHRoZSBtYXRjaFxyXG4gKiBtdXN0IHN0YXJ0IGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gb25seS4gVGhlIGBsYXN0SW5kZXhgIHByb3BlcnR5IG9mIHRoZSBwcm92aWRlZCByZWdleCBpcyBub3RcclxuICogdXNlZCwgYnV0IGlzIHVwZGF0ZWQgZm9yIGNvbXBhdGliaWxpdHkuIEFsc28gZml4ZXMgYnJvd3NlciBidWdzIGNvbXBhcmVkIHRvIHRoZSBuYXRpdmVcclxuICogYFJlZ0V4cC5wcm90b3R5cGUuZXhlY2AgYW5kIGNhbiBiZSB1c2VkIHJlbGlhYmx5IGNyb3NzLWJyb3dzZXIuXHJcbiAqIEBtZW1iZXJPZiBYUmVnRXhwXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgU3RyaW5nIHRvIHNlYXJjaC5cclxuICogQHBhcmFtIHtSZWdFeHB9IHJlZ2V4IFJlZ2V4IHRvIHNlYXJjaCB3aXRoLlxyXG4gKiBAcGFyYW0ge051bWJlcn0gW3Bvcz0wXSBaZXJvLWJhc2VkIGluZGV4IGF0IHdoaWNoIHRvIHN0YXJ0IHRoZSBzZWFyY2guXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbnxTdHJpbmd9IFtzdGlja3k9ZmFsc2VdIFdoZXRoZXIgdGhlIG1hdGNoIG11c3Qgc3RhcnQgYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvblxyXG4gKiAgIG9ubHkuIFRoZSBzdHJpbmcgYCdzdGlja3knYCBpcyBhY2NlcHRlZCBhcyBhbiBhbHRlcm5hdGl2ZSB0byBgdHJ1ZWAuXHJcbiAqIEByZXR1cm5zIHtBcnJheX0gTWF0Y2ggYXJyYXkgd2l0aCBuYW1lZCBiYWNrcmVmZXJlbmNlIHByb3BlcnRpZXMsIG9yIG51bGwuXHJcbiAqIEBleGFtcGxlXHJcbiAqXHJcbiAqIC8vIEJhc2ljIHVzZSwgd2l0aCBuYW1lZCBiYWNrcmVmZXJlbmNlXHJcbiAqIHZhciBtYXRjaCA9IFhSZWdFeHAuZXhlYygnVSsyNjIwJywgWFJlZ0V4cCgnVVxcXFwrKD88aGV4PlswLTlBLUZdezR9KScpKTtcclxuICogbWF0Y2guaGV4OyAvLyAtPiAnMjYyMCdcclxuICpcclxuICogLy8gV2l0aCBwb3MgYW5kIHN0aWNreSwgaW4gYSBsb29wXHJcbiAqIHZhciBwb3MgPSAyLCByZXN1bHQgPSBbXSwgbWF0Y2g7XHJcbiAqIHdoaWxlIChtYXRjaCA9IFhSZWdFeHAuZXhlYygnPDE+PDI+PDM+PDQ+NTw2PicsIC88KFxcZCk+LywgcG9zLCAnc3RpY2t5JykpIHtcclxuICogICByZXN1bHQucHVzaChtYXRjaFsxXSk7XHJcbiAqICAgcG9zID0gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGg7XHJcbiAqIH1cclxuICogLy8gcmVzdWx0IC0+IFsnMicsICczJywgJzQnXVxyXG4gKi9cclxuICAgIHNlbGYuZXhlYyA9IGZ1bmN0aW9uIChzdHIsIHJlZ2V4LCBwb3MsIHN0aWNreSkge1xyXG4gICAgICAgIHZhciByMiA9IGNvcHkocmVnZXgsIFwiZ1wiICsgKHN0aWNreSAmJiBoYXNOYXRpdmVZID8gXCJ5XCIgOiBcIlwiKSwgKHN0aWNreSA9PT0gZmFsc2UgPyBcInlcIiA6IFwiXCIpKSxcclxuICAgICAgICAgICAgbWF0Y2g7XHJcbiAgICAgICAgcjIubGFzdEluZGV4ID0gcG9zID0gcG9zIHx8IDA7XHJcbiAgICAgICAgbWF0Y2ggPSBmaXhlZC5leGVjLmNhbGwocjIsIHN0cik7IC8vIEZpeGVkIGBleGVjYCByZXF1aXJlZCBmb3IgYGxhc3RJbmRleGAgZml4LCBldGMuXHJcbiAgICAgICAgaWYgKHN0aWNreSAmJiBtYXRjaCAmJiBtYXRjaC5pbmRleCAhPT0gcG9zKSB7XHJcbiAgICAgICAgICAgIG1hdGNoID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZ2V4Lmdsb2JhbCkge1xyXG4gICAgICAgICAgICByZWdleC5sYXN0SW5kZXggPSBtYXRjaCA/IHIyLmxhc3RJbmRleCA6IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXRjaDtcclxuICAgIH07XHJcblxyXG4vKipcclxuICogRXhlY3V0ZXMgYSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIHBlciByZWdleCBtYXRjaC5cclxuICogQG1lbWJlck9mIFhSZWdFeHBcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBTdHJpbmcgdG8gc2VhcmNoLlxyXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVnZXggUmVnZXggdG8gc2VhcmNoIHdpdGguXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgZm9yIGVhY2ggbWF0Y2guIEludm9rZWQgd2l0aCBmb3VyIGFyZ3VtZW50czpcclxuICogICA8bGk+VGhlIG1hdGNoIGFycmF5LCB3aXRoIG5hbWVkIGJhY2tyZWZlcmVuY2UgcHJvcGVydGllcy5cclxuICogICA8bGk+VGhlIHplcm8tYmFzZWQgbWF0Y2ggaW5kZXguXHJcbiAqICAgPGxpPlRoZSBzdHJpbmcgYmVpbmcgdHJhdmVyc2VkLlxyXG4gKiAgIDxsaT5UaGUgcmVnZXggb2JqZWN0IGJlaW5nIHVzZWQgdG8gdHJhdmVyc2UgdGhlIHN0cmluZy5cclxuICogQHBhcmFtIHsqfSBbY29udGV4dF0gT2JqZWN0IHRvIHVzZSBhcyBgdGhpc2Agd2hlbiBleGVjdXRpbmcgYGNhbGxiYWNrYC5cclxuICogQHJldHVybnMgeyp9IFByb3ZpZGVkIGBjb250ZXh0YCBvYmplY3QuXHJcbiAqIEBleGFtcGxlXHJcbiAqXHJcbiAqIC8vIEV4dHJhY3RzIGV2ZXJ5IG90aGVyIGRpZ2l0IGZyb20gYSBzdHJpbmdcclxuICogWFJlZ0V4cC5mb3JFYWNoKCcxYTIzNDUnLCAvXFxkLywgZnVuY3Rpb24gKG1hdGNoLCBpKSB7XHJcbiAqICAgaWYgKGkgJSAyKSB0aGlzLnB1c2goK21hdGNoWzBdKTtcclxuICogfSwgW10pO1xyXG4gKiAvLyAtPiBbMiwgNF1cclxuICovXHJcbiAgICBzZWxmLmZvckVhY2ggPSBmdW5jdGlvbiAoc3RyLCByZWdleCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcclxuICAgICAgICB2YXIgcG9zID0gMCxcclxuICAgICAgICAgICAgaSA9IC0xLFxyXG4gICAgICAgICAgICBtYXRjaDtcclxuICAgICAgICB3aGlsZSAoKG1hdGNoID0gc2VsZi5leGVjKHN0ciwgcmVnZXgsIHBvcykpKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgbWF0Y2gsICsraSwgc3RyLCByZWdleCk7XHJcbiAgICAgICAgICAgIHBvcyA9IG1hdGNoLmluZGV4ICsgKG1hdGNoWzBdLmxlbmd0aCB8fCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbnRleHQ7XHJcbiAgICB9O1xyXG5cclxuLyoqXHJcbiAqIENvcGllcyBhIHJlZ2V4IG9iamVjdCBhbmQgYWRkcyBmbGFnIGBnYC4gVGhlIGNvcHkgbWFpbnRhaW5zIHNwZWNpYWwgcHJvcGVydGllcyBmb3IgbmFtZWRcclxuICogY2FwdHVyZSwgaXMgYXVnbWVudGVkIHdpdGggYFhSZWdFeHAucHJvdG90eXBlYCBtZXRob2RzLCBhbmQgaGFzIGEgZnJlc2ggYGxhc3RJbmRleGAgcHJvcGVydHlcclxuICogKHNldCB0byB6ZXJvKS4gTmF0aXZlIHJlZ2V4ZXMgYXJlIG5vdCByZWNvbXBpbGVkIHVzaW5nIFhSZWdFeHAgc3ludGF4LlxyXG4gKiBAbWVtYmVyT2YgWFJlZ0V4cFxyXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVnZXggUmVnZXggdG8gZ2xvYmFsaXplLlxyXG4gKiBAcmV0dXJucyB7UmVnRXhwfSBDb3B5IG9mIHRoZSBwcm92aWRlZCByZWdleCB3aXRoIGZsYWcgYGdgIGFkZGVkLlxyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiB2YXIgZ2xvYmFsQ29weSA9IFhSZWdFeHAuZ2xvYmFsaXplKC9yZWdleC8pO1xyXG4gKiBnbG9iYWxDb3B5Lmdsb2JhbDsgLy8gLT4gdHJ1ZVxyXG4gKi9cclxuICAgIHNlbGYuZ2xvYmFsaXplID0gZnVuY3Rpb24gKHJlZ2V4KSB7XHJcbiAgICAgICAgcmV0dXJuIGNvcHkocmVnZXgsIFwiZ1wiKTtcclxuICAgIH07XHJcblxyXG4vKipcclxuICogSW5zdGFsbHMgb3B0aW9uYWwgZmVhdHVyZXMgYWNjb3JkaW5nIHRvIHRoZSBzcGVjaWZpZWQgb3B0aW9ucy5cclxuICogQG1lbWJlck9mIFhSZWdFeHBcclxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0IG9yIHN0cmluZy5cclxuICogQGV4YW1wbGVcclxuICpcclxuICogLy8gV2l0aCBhbiBvcHRpb25zIG9iamVjdFxyXG4gKiBYUmVnRXhwLmluc3RhbGwoe1xyXG4gKiAgIC8vIE92ZXJyaWRlcyBuYXRpdmUgcmVnZXggbWV0aG9kcyB3aXRoIGZpeGVkL2V4dGVuZGVkIHZlcnNpb25zIHRoYXQgc3VwcG9ydCBuYW1lZFxyXG4gKiAgIC8vIGJhY2tyZWZlcmVuY2VzIGFuZCBmaXggbnVtZXJvdXMgY3Jvc3MtYnJvd3NlciBidWdzXHJcbiAqICAgbmF0aXZlczogdHJ1ZSxcclxuICpcclxuICogICAvLyBFbmFibGVzIGV4dGVuc2liaWxpdHkgb2YgWFJlZ0V4cCBzeW50YXggYW5kIGZsYWdzXHJcbiAqICAgZXh0ZW5zaWJpbGl0eTogdHJ1ZVxyXG4gKiB9KTtcclxuICpcclxuICogLy8gV2l0aCBhbiBvcHRpb25zIHN0cmluZ1xyXG4gKiBYUmVnRXhwLmluc3RhbGwoJ25hdGl2ZXMgZXh0ZW5zaWJpbGl0eScpO1xyXG4gKlxyXG4gKiAvLyBVc2luZyBhIHNob3J0Y3V0IHRvIGluc3RhbGwgYWxsIG9wdGlvbmFsIGZlYXR1cmVzXHJcbiAqIFhSZWdFeHAuaW5zdGFsbCgnYWxsJyk7XHJcbiAqL1xyXG4gICAgc2VsZi5pbnN0YWxsID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICBvcHRpb25zID0gcHJlcGFyZU9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICAgICAgaWYgKCFmZWF0dXJlcy5uYXRpdmVzICYmIG9wdGlvbnMubmF0aXZlcykge1xyXG4gICAgICAgICAgICBzZXROYXRpdmVzKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWZlYXR1cmVzLmV4dGVuc2liaWxpdHkgJiYgb3B0aW9ucy5leHRlbnNpYmlsaXR5KSB7XHJcbiAgICAgICAgICAgIHNldEV4dGVuc2liaWxpdHkodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBhbiBpbmRpdmlkdWFsIG9wdGlvbmFsIGZlYXR1cmUgaXMgaW5zdGFsbGVkLlxyXG4gKiBAbWVtYmVyT2YgWFJlZ0V4cFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmVhdHVyZSBOYW1lIG9mIHRoZSBmZWF0dXJlIHRvIGNoZWNrLiBPbmUgb2Y6XHJcbiAqICAgPGxpPmBuYXRpdmVzYFxyXG4gKiAgIDxsaT5gZXh0ZW5zaWJpbGl0eWBcclxuICogQHJldHVybnMge0Jvb2xlYW59IFdoZXRoZXIgdGhlIGZlYXR1cmUgaXMgaW5zdGFsbGVkLlxyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiBYUmVnRXhwLmlzSW5zdGFsbGVkKCduYXRpdmVzJyk7XHJcbiAqL1xyXG4gICAgc2VsZi5pc0luc3RhbGxlZCA9IGZ1bmN0aW9uIChmZWF0dXJlKSB7XHJcbiAgICAgICAgcmV0dXJuICEhKGZlYXR1cmVzW2ZlYXR1cmVdKTtcclxuICAgIH07XHJcblxyXG4vKipcclxuICogUmV0dXJucyBgdHJ1ZWAgaWYgYW4gb2JqZWN0IGlzIGEgcmVnZXg7IGBmYWxzZWAgaWYgaXQgaXNuJ3QuIFRoaXMgd29ya3MgY29ycmVjdGx5IGZvciByZWdleGVzXHJcbiAqIGNyZWF0ZWQgaW4gYW5vdGhlciBmcmFtZSwgd2hlbiBgaW5zdGFuY2VvZmAgYW5kIGBjb25zdHJ1Y3RvcmAgY2hlY2tzIHdvdWxkIGZhaWwuXHJcbiAqIEBtZW1iZXJPZiBYUmVnRXhwXHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgT2JqZWN0IHRvIGNoZWNrLlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gV2hldGhlciB0aGUgb2JqZWN0IGlzIGEgYFJlZ0V4cGAgb2JqZWN0LlxyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiBYUmVnRXhwLmlzUmVnRXhwKCdzdHJpbmcnKTsgLy8gLT4gZmFsc2VcclxuICogWFJlZ0V4cC5pc1JlZ0V4cCgvcmVnZXgvaSk7IC8vIC0+IHRydWVcclxuICogWFJlZ0V4cC5pc1JlZ0V4cChSZWdFeHAoJ14nLCAnbScpKTsgLy8gLT4gdHJ1ZVxyXG4gKiBYUmVnRXhwLmlzUmVnRXhwKFhSZWdFeHAoJyg/cykuJykpOyAvLyAtPiB0cnVlXHJcbiAqL1xyXG4gICAgc2VsZi5pc1JlZ0V4cCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBpc1R5cGUodmFsdWUsIFwicmVnZXhwXCIpO1xyXG4gICAgfTtcclxuXHJcbi8qKlxyXG4gKiBSZXRyaWV2ZXMgdGhlIG1hdGNoZXMgZnJvbSBzZWFyY2hpbmcgYSBzdHJpbmcgdXNpbmcgYSBjaGFpbiBvZiByZWdleGVzIHRoYXQgc3VjY2Vzc2l2ZWx5IHNlYXJjaFxyXG4gKiB3aXRoaW4gcHJldmlvdXMgbWF0Y2hlcy4gVGhlIHByb3ZpZGVkIGBjaGFpbmAgYXJyYXkgY2FuIGNvbnRhaW4gcmVnZXhlcyBhbmQgb2JqZWN0cyB3aXRoIGByZWdleGBcclxuICogYW5kIGBiYWNrcmVmYCBwcm9wZXJ0aWVzLiBXaGVuIGEgYmFja3JlZmVyZW5jZSBpcyBzcGVjaWZpZWQsIHRoZSBuYW1lZCBvciBudW1iZXJlZCBiYWNrcmVmZXJlbmNlXHJcbiAqIGlzIHBhc3NlZCBmb3J3YXJkIHRvIHRoZSBuZXh0IHJlZ2V4IG9yIHJldHVybmVkLlxyXG4gKiBAbWVtYmVyT2YgWFJlZ0V4cFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFN0cmluZyB0byBzZWFyY2guXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGNoYWluIFJlZ2V4ZXMgdGhhdCBlYWNoIHNlYXJjaCBmb3IgbWF0Y2hlcyB3aXRoaW4gcHJlY2VkaW5nIHJlc3VsdHMuXHJcbiAqIEByZXR1cm5zIHtBcnJheX0gTWF0Y2hlcyBieSB0aGUgbGFzdCByZWdleCBpbiB0aGUgY2hhaW4sIG9yIGFuIGVtcHR5IGFycmF5LlxyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiAvLyBCYXNpYyB1c2FnZTsgbWF0Y2hlcyBudW1iZXJzIHdpdGhpbiA8Yj4gdGFnc1xyXG4gKiBYUmVnRXhwLm1hdGNoQ2hhaW4oJzEgPGI+MjwvYj4gMyA8Yj40IGEgNTY8L2I+JywgW1xyXG4gKiAgIFhSZWdFeHAoJyg/aXMpPGI+Lio/PC9iPicpLFxyXG4gKiAgIC9cXGQrL1xyXG4gKiBdKTtcclxuICogLy8gLT4gWycyJywgJzQnLCAnNTYnXVxyXG4gKlxyXG4gKiAvLyBQYXNzaW5nIGZvcndhcmQgYW5kIHJldHVybmluZyBzcGVjaWZpYyBiYWNrcmVmZXJlbmNlc1xyXG4gKiBodG1sID0gJzxhIGhyZWY9XCJodHRwOi8veHJlZ2V4cC5jb20vYXBpL1wiPlhSZWdFeHA8L2E+XFxcclxuICogICAgICAgICA8YSBocmVmPVwiaHR0cDovL3d3dy5nb29nbGUuY29tL1wiPkdvb2dsZTwvYT4nO1xyXG4gKiBYUmVnRXhwLm1hdGNoQ2hhaW4oaHRtbCwgW1xyXG4gKiAgIHtyZWdleDogLzxhIGhyZWY9XCIoW15cIl0rKVwiPi9pLCBiYWNrcmVmOiAxfSxcclxuICogICB7cmVnZXg6IFhSZWdFeHAoJyg/aSleaHR0cHM/Oi8vKD88ZG9tYWluPlteLz8jXSspJyksIGJhY2tyZWY6ICdkb21haW4nfVxyXG4gKiBdKTtcclxuICogLy8gLT4gWyd4cmVnZXhwLmNvbScsICd3d3cuZ29vZ2xlLmNvbSddXHJcbiAqL1xyXG4gICAgc2VsZi5tYXRjaENoYWluID0gZnVuY3Rpb24gKHN0ciwgY2hhaW4pIHtcclxuICAgICAgICByZXR1cm4gKGZ1bmN0aW9uIHJlY3Vyc2VDaGFpbih2YWx1ZXMsIGxldmVsKSB7XHJcbiAgICAgICAgICAgIHZhciBpdGVtID0gY2hhaW5bbGV2ZWxdLnJlZ2V4ID8gY2hhaW5bbGV2ZWxdIDoge3JlZ2V4OiBjaGFpbltsZXZlbF19LFxyXG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgYWRkTWF0Y2ggPSBmdW5jdGlvbiAobWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzLnB1c2goaXRlbS5iYWNrcmVmID8gKG1hdGNoW2l0ZW0uYmFja3JlZl0gfHwgXCJcIikgOiBtYXRjaFswXSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaTtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5mb3JFYWNoKHZhbHVlc1tpXSwgaXRlbS5yZWdleCwgYWRkTWF0Y2gpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAoKGxldmVsID09PSBjaGFpbi5sZW5ndGggLSAxKSB8fCAhbWF0Y2hlcy5sZW5ndGgpID9cclxuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzIDpcclxuICAgICAgICAgICAgICAgICAgICByZWN1cnNlQ2hhaW4obWF0Y2hlcywgbGV2ZWwgKyAxKTtcclxuICAgICAgICB9KFtzdHJdLCAwKSk7XHJcbiAgICB9O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBuZXcgc3RyaW5nIHdpdGggb25lIG9yIGFsbCBtYXRjaGVzIG9mIGEgcGF0dGVybiByZXBsYWNlZC4gVGhlIHBhdHRlcm4gY2FuIGJlIGEgc3RyaW5nXHJcbiAqIG9yIHJlZ2V4LCBhbmQgdGhlIHJlcGxhY2VtZW50IGNhbiBiZSBhIHN0cmluZyBvciBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBmb3IgZWFjaCBtYXRjaC4gVG9cclxuICogcGVyZm9ybSBhIGdsb2JhbCBzZWFyY2ggYW5kIHJlcGxhY2UsIHVzZSB0aGUgb3B0aW9uYWwgYHNjb3BlYCBhcmd1bWVudCBvciBpbmNsdWRlIGZsYWcgYGdgIGlmXHJcbiAqIHVzaW5nIGEgcmVnZXguIFJlcGxhY2VtZW50IHN0cmluZ3MgY2FuIHVzZSBgJHtufWAgZm9yIG5hbWVkIGFuZCBudW1iZXJlZCBiYWNrcmVmZXJlbmNlcy5cclxuICogUmVwbGFjZW1lbnQgZnVuY3Rpb25zIGNhbiB1c2UgbmFtZWQgYmFja3JlZmVyZW5jZXMgdmlhIGBhcmd1bWVudHNbMF0ubmFtZWAuIEFsc28gZml4ZXMgYnJvd3NlclxyXG4gKiBidWdzIGNvbXBhcmVkIHRvIHRoZSBuYXRpdmUgYFN0cmluZy5wcm90b3R5cGUucmVwbGFjZWAgYW5kIGNhbiBiZSB1c2VkIHJlbGlhYmx5IGNyb3NzLWJyb3dzZXIuXHJcbiAqIEBtZW1iZXJPZiBYUmVnRXhwXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgU3RyaW5nIHRvIHNlYXJjaC5cclxuICogQHBhcmFtIHtSZWdFeHB8U3RyaW5nfSBzZWFyY2ggU2VhcmNoIHBhdHRlcm4gdG8gYmUgcmVwbGFjZWQuXHJcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSByZXBsYWNlbWVudCBSZXBsYWNlbWVudCBzdHJpbmcgb3IgYSBmdW5jdGlvbiBpbnZva2VkIHRvIGNyZWF0ZSBpdC5cclxuICogICBSZXBsYWNlbWVudCBzdHJpbmdzIGNhbiBpbmNsdWRlIHNwZWNpYWwgcmVwbGFjZW1lbnQgc3ludGF4OlxyXG4gKiAgICAgPGxpPiQkIC0gSW5zZXJ0cyBhIGxpdGVyYWwgJyQnLlxyXG4gKiAgICAgPGxpPiQmLCAkMCAtIEluc2VydHMgdGhlIG1hdGNoZWQgc3Vic3RyaW5nLlxyXG4gKiAgICAgPGxpPiRgIC0gSW5zZXJ0cyB0aGUgc3RyaW5nIHRoYXQgcHJlY2VkZXMgdGhlIG1hdGNoZWQgc3Vic3RyaW5nIChsZWZ0IGNvbnRleHQpLlxyXG4gKiAgICAgPGxpPiQnIC0gSW5zZXJ0cyB0aGUgc3RyaW5nIHRoYXQgZm9sbG93cyB0aGUgbWF0Y2hlZCBzdWJzdHJpbmcgKHJpZ2h0IGNvbnRleHQpLlxyXG4gKiAgICAgPGxpPiRuLCAkbm4gLSBXaGVyZSBuL25uIGFyZSBkaWdpdHMgcmVmZXJlbmNpbmcgYW4gZXhpc3RlbnQgY2FwdHVyaW5nIGdyb3VwLCBpbnNlcnRzXHJcbiAqICAgICAgIGJhY2tyZWZlcmVuY2Ugbi9ubi5cclxuICogICAgIDxsaT4ke259IC0gV2hlcmUgbiBpcyBhIG5hbWUgb3IgYW55IG51bWJlciBvZiBkaWdpdHMgdGhhdCByZWZlcmVuY2UgYW4gZXhpc3RlbnQgY2FwdHVyaW5nXHJcbiAqICAgICAgIGdyb3VwLCBpbnNlcnRzIGJhY2tyZWZlcmVuY2Ugbi5cclxuICogICBSZXBsYWNlbWVudCBmdW5jdGlvbnMgYXJlIGludm9rZWQgd2l0aCB0aHJlZSBvciBtb3JlIGFyZ3VtZW50czpcclxuICogICAgIDxsaT5UaGUgbWF0Y2hlZCBzdWJzdHJpbmcgKGNvcnJlc3BvbmRzIHRvICQmIGFib3ZlKS4gTmFtZWQgYmFja3JlZmVyZW5jZXMgYXJlIGFjY2Vzc2libGUgYXNcclxuICogICAgICAgcHJvcGVydGllcyBvZiB0aGlzIGZpcnN0IGFyZ3VtZW50LlxyXG4gKiAgICAgPGxpPjAuLm4gYXJndW1lbnRzLCBvbmUgZm9yIGVhY2ggYmFja3JlZmVyZW5jZSAoY29ycmVzcG9uZGluZyB0byAkMSwgJDIsIGV0Yy4gYWJvdmUpLlxyXG4gKiAgICAgPGxpPlRoZSB6ZXJvLWJhc2VkIGluZGV4IG9mIHRoZSBtYXRjaCB3aXRoaW4gdGhlIHRvdGFsIHNlYXJjaCBzdHJpbmcuXHJcbiAqICAgICA8bGk+VGhlIHRvdGFsIHN0cmluZyBiZWluZyBzZWFyY2hlZC5cclxuICogQHBhcmFtIHtTdHJpbmd9IFtzY29wZT0nb25lJ10gVXNlICdvbmUnIHRvIHJlcGxhY2UgdGhlIGZpcnN0IG1hdGNoIG9ubHksIG9yICdhbGwnLiBJZiBub3RcclxuICogICBleHBsaWNpdGx5IHNwZWNpZmllZCBhbmQgdXNpbmcgYSByZWdleCB3aXRoIGZsYWcgYGdgLCBgc2NvcGVgIGlzICdhbGwnLlxyXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBOZXcgc3RyaW5nIHdpdGggb25lIG9yIGFsbCBtYXRjaGVzIHJlcGxhY2VkLlxyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiAvLyBSZWdleCBzZWFyY2gsIHVzaW5nIG5hbWVkIGJhY2tyZWZlcmVuY2VzIGluIHJlcGxhY2VtZW50IHN0cmluZ1xyXG4gKiB2YXIgbmFtZSA9IFhSZWdFeHAoJyg/PGZpcnN0PlxcXFx3KykgKD88bGFzdD5cXFxcdyspJyk7XHJcbiAqIFhSZWdFeHAucmVwbGFjZSgnSm9obiBTbWl0aCcsIG5hbWUsICcke2xhc3R9LCAke2ZpcnN0fScpO1xyXG4gKiAvLyAtPiAnU21pdGgsIEpvaG4nXHJcbiAqXHJcbiAqIC8vIFJlZ2V4IHNlYXJjaCwgdXNpbmcgbmFtZWQgYmFja3JlZmVyZW5jZXMgaW4gcmVwbGFjZW1lbnQgZnVuY3Rpb25cclxuICogWFJlZ0V4cC5yZXBsYWNlKCdKb2huIFNtaXRoJywgbmFtZSwgZnVuY3Rpb24gKG1hdGNoKSB7XHJcbiAqICAgcmV0dXJuIG1hdGNoLmxhc3QgKyAnLCAnICsgbWF0Y2guZmlyc3Q7XHJcbiAqIH0pO1xyXG4gKiAvLyAtPiAnU21pdGgsIEpvaG4nXHJcbiAqXHJcbiAqIC8vIEdsb2JhbCBzdHJpbmcgc2VhcmNoL3JlcGxhY2VtZW50XHJcbiAqIFhSZWdFeHAucmVwbGFjZSgnUmVnRXhwIGJ1aWxkcyBSZWdFeHBzJywgJ1JlZ0V4cCcsICdYUmVnRXhwJywgJ2FsbCcpO1xyXG4gKiAvLyAtPiAnWFJlZ0V4cCBidWlsZHMgWFJlZ0V4cHMnXHJcbiAqL1xyXG4gICAgc2VsZi5yZXBsYWNlID0gZnVuY3Rpb24gKHN0ciwgc2VhcmNoLCByZXBsYWNlbWVudCwgc2NvcGUpIHtcclxuICAgICAgICB2YXIgaXNSZWdleCA9IHNlbGYuaXNSZWdFeHAoc2VhcmNoKSxcclxuICAgICAgICAgICAgc2VhcmNoMiA9IHNlYXJjaCxcclxuICAgICAgICAgICAgcmVzdWx0O1xyXG4gICAgICAgIGlmIChpc1JlZ2V4KSB7XHJcbiAgICAgICAgICAgIGlmIChzY29wZSA9PT0gdW5kZWYgJiYgc2VhcmNoLmdsb2JhbCkge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUgPSBcImFsbFwiOyAvLyBGb2xsb3cgZmxhZyBnIHdoZW4gYHNjb3BlYCBpc24ndCBleHBsaWNpdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIE5vdGUgdGhhdCBzaW5jZSBhIGNvcHkgaXMgdXNlZCwgYHNlYXJjaGAncyBgbGFzdEluZGV4YCBpc24ndCB1cGRhdGVkICpkdXJpbmcqIHJlcGxhY2VtZW50IGl0ZXJhdGlvbnNcclxuICAgICAgICAgICAgc2VhcmNoMiA9IGNvcHkoc2VhcmNoLCBzY29wZSA9PT0gXCJhbGxcIiA/IFwiZ1wiIDogXCJcIiwgc2NvcGUgPT09IFwiYWxsXCIgPyBcIlwiIDogXCJnXCIpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2NvcGUgPT09IFwiYWxsXCIpIHtcclxuICAgICAgICAgICAgc2VhcmNoMiA9IG5ldyBSZWdFeHAoc2VsZi5lc2NhcGUoU3RyaW5nKHNlYXJjaCkpLCBcImdcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdCA9IGZpeGVkLnJlcGxhY2UuY2FsbChTdHJpbmcoc3RyKSwgc2VhcmNoMiwgcmVwbGFjZW1lbnQpOyAvLyBGaXhlZCBgcmVwbGFjZWAgcmVxdWlyZWQgZm9yIG5hbWVkIGJhY2tyZWZlcmVuY2VzLCBldGMuXHJcbiAgICAgICAgaWYgKGlzUmVnZXggJiYgc2VhcmNoLmdsb2JhbCkge1xyXG4gICAgICAgICAgICBzZWFyY2gubGFzdEluZGV4ID0gMDsgLy8gRml4ZXMgSUUsIFNhZmFyaSBidWcgKGxhc3QgdGVzdGVkIElFIDksIFNhZmFyaSA1LjEpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG5cclxuLyoqXHJcbiAqIFNwbGl0cyBhIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIHN0cmluZ3MgdXNpbmcgYSByZWdleCBvciBzdHJpbmcgc2VwYXJhdG9yLiBNYXRjaGVzIG9mIHRoZVxyXG4gKiBzZXBhcmF0b3IgYXJlIG5vdCBpbmNsdWRlZCBpbiB0aGUgcmVzdWx0IGFycmF5LiBIb3dldmVyLCBpZiBgc2VwYXJhdG9yYCBpcyBhIHJlZ2V4IHRoYXQgY29udGFpbnNcclxuICogY2FwdHVyaW5nIGdyb3VwcywgYmFja3JlZmVyZW5jZXMgYXJlIHNwbGljZWQgaW50byB0aGUgcmVzdWx0IGVhY2ggdGltZSBgc2VwYXJhdG9yYCBpcyBtYXRjaGVkLlxyXG4gKiBGaXhlcyBicm93c2VyIGJ1Z3MgY29tcGFyZWQgdG8gdGhlIG5hdGl2ZSBgU3RyaW5nLnByb3RvdHlwZS5zcGxpdGAgYW5kIGNhbiBiZSB1c2VkIHJlbGlhYmx5XHJcbiAqIGNyb3NzLWJyb3dzZXIuXHJcbiAqIEBtZW1iZXJPZiBYUmVnRXhwXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgU3RyaW5nIHRvIHNwbGl0LlxyXG4gKiBAcGFyYW0ge1JlZ0V4cHxTdHJpbmd9IHNlcGFyYXRvciBSZWdleCBvciBzdHJpbmcgdG8gdXNlIGZvciBzZXBhcmF0aW5nIHRoZSBzdHJpbmcuXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBbbGltaXRdIE1heGltdW0gbnVtYmVyIG9mIGl0ZW1zIHRvIGluY2x1ZGUgaW4gdGhlIHJlc3VsdCBhcnJheS5cclxuICogQHJldHVybnMge0FycmF5fSBBcnJheSBvZiBzdWJzdHJpbmdzLlxyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiAvLyBCYXNpYyB1c2VcclxuICogWFJlZ0V4cC5zcGxpdCgnYSBiIGMnLCAnICcpO1xyXG4gKiAvLyAtPiBbJ2EnLCAnYicsICdjJ11cclxuICpcclxuICogLy8gV2l0aCBsaW1pdFxyXG4gKiBYUmVnRXhwLnNwbGl0KCdhIGIgYycsICcgJywgMik7XHJcbiAqIC8vIC0+IFsnYScsICdiJ11cclxuICpcclxuICogLy8gQmFja3JlZmVyZW5jZXMgaW4gcmVzdWx0IGFycmF5XHJcbiAqIFhSZWdFeHAuc3BsaXQoJy4ud29yZDEuLicsIC8oW2Etel0rKShcXGQrKS9pKTtcclxuICogLy8gLT4gWycuLicsICd3b3JkJywgJzEnLCAnLi4nXVxyXG4gKi9cclxuICAgIHNlbGYuc3BsaXQgPSBmdW5jdGlvbiAoc3RyLCBzZXBhcmF0b3IsIGxpbWl0KSB7XHJcbiAgICAgICAgcmV0dXJuIGZpeGVkLnNwbGl0LmNhbGwoc3RyLCBzZXBhcmF0b3IsIGxpbWl0KTtcclxuICAgIH07XHJcblxyXG4vKipcclxuICogRXhlY3V0ZXMgYSByZWdleCBzZWFyY2ggaW4gYSBzcGVjaWZpZWQgc3RyaW5nLiBSZXR1cm5zIGB0cnVlYCBvciBgZmFsc2VgLiBPcHRpb25hbCBgcG9zYCBhbmRcclxuICogYHN0aWNreWAgYXJndW1lbnRzIHNwZWNpZnkgdGhlIHNlYXJjaCBzdGFydCBwb3NpdGlvbiwgYW5kIHdoZXRoZXIgdGhlIG1hdGNoIG11c3Qgc3RhcnQgYXQgdGhlXHJcbiAqIHNwZWNpZmllZCBwb3NpdGlvbiBvbmx5LiBUaGUgYGxhc3RJbmRleGAgcHJvcGVydHkgb2YgdGhlIHByb3ZpZGVkIHJlZ2V4IGlzIG5vdCB1c2VkLCBidXQgaXNcclxuICogdXBkYXRlZCBmb3IgY29tcGF0aWJpbGl0eS4gQWxzbyBmaXhlcyBicm93c2VyIGJ1Z3MgY29tcGFyZWQgdG8gdGhlIG5hdGl2ZVxyXG4gKiBgUmVnRXhwLnByb3RvdHlwZS50ZXN0YCBhbmQgY2FuIGJlIHVzZWQgcmVsaWFibHkgY3Jvc3MtYnJvd3Nlci5cclxuICogQG1lbWJlck9mIFhSZWdFeHBcclxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBTdHJpbmcgdG8gc2VhcmNoLlxyXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVnZXggUmVnZXggdG8gc2VhcmNoIHdpdGguXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBbcG9zPTBdIFplcm8tYmFzZWQgaW5kZXggYXQgd2hpY2ggdG8gc3RhcnQgdGhlIHNlYXJjaC5cclxuICogQHBhcmFtIHtCb29sZWFufFN0cmluZ30gW3N0aWNreT1mYWxzZV0gV2hldGhlciB0aGUgbWF0Y2ggbXVzdCBzdGFydCBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uXHJcbiAqICAgb25seS4gVGhlIHN0cmluZyBgJ3N0aWNreSdgIGlzIGFjY2VwdGVkIGFzIGFuIGFsdGVybmF0aXZlIHRvIGB0cnVlYC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFdoZXRoZXIgdGhlIHJlZ2V4IG1hdGNoZWQgdGhlIHByb3ZpZGVkIHZhbHVlLlxyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiAvLyBCYXNpYyB1c2VcclxuICogWFJlZ0V4cC50ZXN0KCdhYmMnLCAvYy8pOyAvLyAtPiB0cnVlXHJcbiAqXHJcbiAqIC8vIFdpdGggcG9zIGFuZCBzdGlja3lcclxuICogWFJlZ0V4cC50ZXN0KCdhYmMnLCAvYy8sIDAsICdzdGlja3knKTsgLy8gLT4gZmFsc2VcclxuICovXHJcbiAgICBzZWxmLnRlc3QgPSBmdW5jdGlvbiAoc3RyLCByZWdleCwgcG9zLCBzdGlja3kpIHtcclxuICAgICAgICAvLyBEbyB0aGlzIHRoZSBlYXN5IHdheSA6LSlcclxuICAgICAgICByZXR1cm4gISFzZWxmLmV4ZWMoc3RyLCByZWdleCwgcG9zLCBzdGlja3kpO1xyXG4gICAgfTtcclxuXHJcbi8qKlxyXG4gKiBVbmluc3RhbGxzIG9wdGlvbmFsIGZlYXR1cmVzIGFjY29yZGluZyB0byB0aGUgc3BlY2lmaWVkIG9wdGlvbnMuXHJcbiAqIEBtZW1iZXJPZiBYUmVnRXhwXHJcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gb3B0aW9ucyBPcHRpb25zIG9iamVjdCBvciBzdHJpbmcuXHJcbiAqIEBleGFtcGxlXHJcbiAqXHJcbiAqIC8vIFdpdGggYW4gb3B0aW9ucyBvYmplY3RcclxuICogWFJlZ0V4cC51bmluc3RhbGwoe1xyXG4gKiAgIC8vIFJlc3RvcmVzIG5hdGl2ZSByZWdleCBtZXRob2RzXHJcbiAqICAgbmF0aXZlczogdHJ1ZSxcclxuICpcclxuICogICAvLyBEaXNhYmxlcyBhZGRpdGlvbmFsIHN5bnRheCBhbmQgZmxhZyBleHRlbnNpb25zXHJcbiAqICAgZXh0ZW5zaWJpbGl0eTogdHJ1ZVxyXG4gKiB9KTtcclxuICpcclxuICogLy8gV2l0aCBhbiBvcHRpb25zIHN0cmluZ1xyXG4gKiBYUmVnRXhwLnVuaW5zdGFsbCgnbmF0aXZlcyBleHRlbnNpYmlsaXR5Jyk7XHJcbiAqXHJcbiAqIC8vIFVzaW5nIGEgc2hvcnRjdXQgdG8gdW5pbnN0YWxsIGFsbCBvcHRpb25hbCBmZWF0dXJlc1xyXG4gKiBYUmVnRXhwLnVuaW5zdGFsbCgnYWxsJyk7XHJcbiAqL1xyXG4gICAgc2VsZi51bmluc3RhbGwgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIG9wdGlvbnMgPSBwcmVwYXJlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgICAgICBpZiAoZmVhdHVyZXMubmF0aXZlcyAmJiBvcHRpb25zLm5hdGl2ZXMpIHtcclxuICAgICAgICAgICAgc2V0TmF0aXZlcyhmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmZWF0dXJlcy5leHRlbnNpYmlsaXR5ICYmIG9wdGlvbnMuZXh0ZW5zaWJpbGl0eSkge1xyXG4gICAgICAgICAgICBzZXRFeHRlbnNpYmlsaXR5KGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYW4gWFJlZ0V4cCBvYmplY3QgdGhhdCBpcyB0aGUgdW5pb24gb2YgdGhlIGdpdmVuIHBhdHRlcm5zLiBQYXR0ZXJucyBjYW4gYmUgcHJvdmlkZWQgYXNcclxuICogcmVnZXggb2JqZWN0cyBvciBzdHJpbmdzLiBNZXRhY2hhcmFjdGVycyBhcmUgZXNjYXBlZCBpbiBwYXR0ZXJucyBwcm92aWRlZCBhcyBzdHJpbmdzLlxyXG4gKiBCYWNrcmVmZXJlbmNlcyBpbiBwcm92aWRlZCByZWdleCBvYmplY3RzIGFyZSBhdXRvbWF0aWNhbGx5IHJlbnVtYmVyZWQgdG8gd29yayBjb3JyZWN0bHkuIE5hdGl2ZVxyXG4gKiBmbGFncyB1c2VkIGJ5IHByb3ZpZGVkIHJlZ2V4ZXMgYXJlIGlnbm9yZWQgaW4gZmF2b3Igb2YgdGhlIGBmbGFnc2AgYXJndW1lbnQuXHJcbiAqIEBtZW1iZXJPZiBYUmVnRXhwXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBhdHRlcm5zIFJlZ2V4ZXMgYW5kIHN0cmluZ3MgdG8gY29tYmluZS5cclxuICogQHBhcmFtIHtTdHJpbmd9IFtmbGFnc10gQW55IGNvbWJpbmF0aW9uIG9mIFhSZWdFeHAgZmxhZ3MuXHJcbiAqIEByZXR1cm5zIHtSZWdFeHB9IFVuaW9uIG9mIHRoZSBwcm92aWRlZCByZWdleGVzIGFuZCBzdHJpbmdzLlxyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiBYUmVnRXhwLnVuaW9uKFsnYStiKmMnLCAvKGRvZ3MpXFwxLywgLyhjYXRzKVxcMS9dLCAnaScpO1xyXG4gKiAvLyAtPiAvYVxcK2JcXCpjfChkb2dzKVxcMXwoY2F0cylcXDIvaVxyXG4gKlxyXG4gKiBYUmVnRXhwLnVuaW9uKFtYUmVnRXhwKCcoPzxwZXQ+ZG9ncylcXFxcazxwZXQ+JyksIFhSZWdFeHAoJyg/PHBldD5jYXRzKVxcXFxrPHBldD4nKV0pO1xyXG4gKiAvLyAtPiBYUmVnRXhwKCcoPzxwZXQ+ZG9ncylcXFxcazxwZXQ+fCg/PHBldD5jYXRzKVxcXFxrPHBldD4nKVxyXG4gKi9cclxuICAgIHNlbGYudW5pb24gPSBmdW5jdGlvbiAocGF0dGVybnMsIGZsYWdzKSB7XHJcbiAgICAgICAgdmFyIHBhcnRzID0gLyhcXCgpKD8hXFw/KXxcXFxcKFsxLTldXFxkKil8XFxcXFtcXHNcXFNdfFxcWyg/OlteXFxcXFxcXV18XFxcXFtcXHNcXFNdKSpdL2csXHJcbiAgICAgICAgICAgIG51bUNhcHR1cmVzID0gMCxcclxuICAgICAgICAgICAgbnVtUHJpb3JDYXB0dXJlcyxcclxuICAgICAgICAgICAgY2FwdHVyZU5hbWVzLFxyXG4gICAgICAgICAgICByZXdyaXRlID0gZnVuY3Rpb24gKG1hdGNoLCBwYXJlbiwgYmFja3JlZikge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBjYXB0dXJlTmFtZXNbbnVtQ2FwdHVyZXMgLSBudW1QcmlvckNhcHR1cmVzXTtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbikgeyAvLyBDYXB0dXJpbmcgZ3JvdXBcclxuICAgICAgICAgICAgICAgICAgICArK251bUNhcHR1cmVzO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuYW1lKSB7IC8vIElmIHRoZSBjdXJyZW50IGNhcHR1cmUgaGFzIGEgbmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIoPzxcIiArIG5hbWUgKyBcIj5cIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJhY2tyZWYpIHsgLy8gQmFja3JlZmVyZW5jZVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIlxcXFxcIiArICgrYmFja3JlZiArIG51bVByaW9yQ2FwdHVyZXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvdXRwdXQgPSBbXSxcclxuICAgICAgICAgICAgcGF0dGVybixcclxuICAgICAgICAgICAgaTtcclxuICAgICAgICBpZiAoIShpc1R5cGUocGF0dGVybnMsIFwiYXJyYXlcIikgJiYgcGF0dGVybnMubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwicGF0dGVybnMgbXVzdCBiZSBhIG5vbmVtcHR5IGFycmF5XCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcGF0dGVybnMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgcGF0dGVybiA9IHBhdHRlcm5zW2ldO1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5pc1JlZ0V4cChwYXR0ZXJuKSkge1xyXG4gICAgICAgICAgICAgICAgbnVtUHJpb3JDYXB0dXJlcyA9IG51bUNhcHR1cmVzO1xyXG4gICAgICAgICAgICAgICAgY2FwdHVyZU5hbWVzID0gKHBhdHRlcm4ueHJlZ2V4cCAmJiBwYXR0ZXJuLnhyZWdleHAuY2FwdHVyZU5hbWVzKSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIC8vIFJld3JpdGUgYmFja3JlZmVyZW5jZXMuIFBhc3NpbmcgdG8gWFJlZ0V4cCBkaWVzIG9uIG9jdGFscyBhbmQgZW5zdXJlcyBwYXR0ZXJuc1xyXG4gICAgICAgICAgICAgICAgLy8gYXJlIGluZGVwZW5kZW50bHkgdmFsaWQ7IGhlbHBzIGtlZXAgdGhpcyBzaW1wbGUuIE5hbWVkIGNhcHR1cmVzIGFyZSBwdXQgYmFja1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goc2VsZihwYXR0ZXJuLnNvdXJjZSkuc291cmNlLnJlcGxhY2UocGFydHMsIHJld3JpdGUpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHNlbGYuZXNjYXBlKHBhdHRlcm4pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2VsZihvdXRwdXQuam9pbihcInxcIiksIGZsYWdzKTtcclxuICAgIH07XHJcblxyXG4vKipcclxuICogVGhlIFhSZWdFeHAgdmVyc2lvbiBudW1iZXIuXHJcbiAqIEBzdGF0aWNcclxuICogQG1lbWJlck9mIFhSZWdFeHBcclxuICogQHR5cGUgU3RyaW5nXHJcbiAqL1xyXG4gICAgc2VsZi52ZXJzaW9uID0gXCIyLjAuMFwiO1xyXG5cclxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiAgRml4ZWQvZXh0ZW5kZWQgbmF0aXZlIG1ldGhvZHNcclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuLyoqXHJcbiAqIEFkZHMgbmFtZWQgY2FwdHVyZSBzdXBwb3J0ICh3aXRoIGJhY2tyZWZlcmVuY2VzIHJldHVybmVkIGFzIGByZXN1bHQubmFtZWApLCBhbmQgZml4ZXMgYnJvd3NlclxyXG4gKiBidWdzIGluIHRoZSBuYXRpdmUgYFJlZ0V4cC5wcm90b3R5cGUuZXhlY2AuIENhbGxpbmcgYFhSZWdFeHAuaW5zdGFsbCgnbmF0aXZlcycpYCB1c2VzIHRoaXMgdG9cclxuICogb3ZlcnJpZGUgdGhlIG5hdGl2ZSBtZXRob2QuIFVzZSB2aWEgYFhSZWdFeHAuZXhlY2Agd2l0aG91dCBvdmVycmlkaW5nIG5hdGl2ZXMuXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgU3RyaW5nIHRvIHNlYXJjaC5cclxuICogQHJldHVybnMge0FycmF5fSBNYXRjaCBhcnJheSB3aXRoIG5hbWVkIGJhY2tyZWZlcmVuY2UgcHJvcGVydGllcywgb3IgbnVsbC5cclxuICovXHJcbiAgICBmaXhlZC5leGVjID0gZnVuY3Rpb24gKHN0cikge1xyXG4gICAgICAgIHZhciBtYXRjaCwgbmFtZSwgcjIsIG9yaWdMYXN0SW5kZXgsIGk7XHJcbiAgICAgICAgaWYgKCF0aGlzLmdsb2JhbCkge1xyXG4gICAgICAgICAgICBvcmlnTGFzdEluZGV4ID0gdGhpcy5sYXN0SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hdGNoID0gbmF0aXYuZXhlYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICAvLyBGaXggYnJvd3NlcnMgd2hvc2UgYGV4ZWNgIG1ldGhvZHMgZG9uJ3QgY29uc2lzdGVudGx5IHJldHVybiBgdW5kZWZpbmVkYCBmb3JcclxuICAgICAgICAgICAgLy8gbm9ucGFydGljaXBhdGluZyBjYXB0dXJpbmcgZ3JvdXBzXHJcbiAgICAgICAgICAgIGlmICghY29tcGxpYW50RXhlY05wY2cgJiYgbWF0Y2gubGVuZ3RoID4gMSAmJiBsYXN0SW5kZXhPZihtYXRjaCwgXCJcIikgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgcjIgPSBuZXcgUmVnRXhwKHRoaXMuc291cmNlLCBuYXRpdi5yZXBsYWNlLmNhbGwoZ2V0TmF0aXZlRmxhZ3ModGhpcyksIFwiZ1wiLCBcIlwiKSk7XHJcbiAgICAgICAgICAgICAgICAvLyBVc2luZyBgc3RyLnNsaWNlKG1hdGNoLmluZGV4KWAgcmF0aGVyIHRoYW4gYG1hdGNoWzBdYCBpbiBjYXNlIGxvb2thaGVhZCBhbGxvd2VkXHJcbiAgICAgICAgICAgICAgICAvLyBtYXRjaGluZyBkdWUgdG8gY2hhcmFjdGVycyBvdXRzaWRlIHRoZSBtYXRjaFxyXG4gICAgICAgICAgICAgICAgbmF0aXYucmVwbGFjZS5jYWxsKFN0cmluZyhzdHIpLnNsaWNlKG1hdGNoLmluZGV4KSwgcjIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aCAtIDI7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJndW1lbnRzW2ldID09PSB1bmRlZikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hbaV0gPSB1bmRlZjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEF0dGFjaCBuYW1lZCBjYXB0dXJlIHByb3BlcnRpZXNcclxuICAgICAgICAgICAgaWYgKHRoaXMueHJlZ2V4cCAmJiB0aGlzLnhyZWdleHAuY2FwdHVyZU5hbWVzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbWF0Y2gubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gdGhpcy54cmVnZXhwLmNhcHR1cmVOYW1lc1tpIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hbbmFtZV0gPSBtYXRjaFtpXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gRml4IGJyb3dzZXJzIHRoYXQgaW5jcmVtZW50IGBsYXN0SW5kZXhgIGFmdGVyIHplcm8tbGVuZ3RoIG1hdGNoZXNcclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2xvYmFsICYmICFtYXRjaFswXS5sZW5ndGggJiYgKHRoaXMubGFzdEluZGV4ID4gbWF0Y2guaW5kZXgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RJbmRleCA9IG1hdGNoLmluZGV4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5nbG9iYWwpIHtcclxuICAgICAgICAgICAgdGhpcy5sYXN0SW5kZXggPSBvcmlnTGFzdEluZGV4OyAvLyBGaXhlcyBJRSwgT3BlcmEgYnVnIChsYXN0IHRlc3RlZCBJRSA5LCBPcGVyYSAxMS42KVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWF0Y2g7XHJcbiAgICB9O1xyXG5cclxuLyoqXHJcbiAqIEZpeGVzIGJyb3dzZXIgYnVncyBpbiB0aGUgbmF0aXZlIGBSZWdFeHAucHJvdG90eXBlLnRlc3RgLiBDYWxsaW5nIGBYUmVnRXhwLmluc3RhbGwoJ25hdGl2ZXMnKWBcclxuICogdXNlcyB0aGlzIHRvIG92ZXJyaWRlIHRoZSBuYXRpdmUgbWV0aG9kLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFN0cmluZyB0byBzZWFyY2guXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBXaGV0aGVyIHRoZSByZWdleCBtYXRjaGVkIHRoZSBwcm92aWRlZCB2YWx1ZS5cclxuICovXHJcbiAgICBmaXhlZC50ZXN0ID0gZnVuY3Rpb24gKHN0cikge1xyXG4gICAgICAgIC8vIERvIHRoaXMgdGhlIGVhc3kgd2F5IDotKVxyXG4gICAgICAgIHJldHVybiAhIWZpeGVkLmV4ZWMuY2FsbCh0aGlzLCBzdHIpO1xyXG4gICAgfTtcclxuXHJcbi8qKlxyXG4gKiBBZGRzIG5hbWVkIGNhcHR1cmUgc3VwcG9ydCAod2l0aCBiYWNrcmVmZXJlbmNlcyByZXR1cm5lZCBhcyBgcmVzdWx0Lm5hbWVgKSwgYW5kIGZpeGVzIGJyb3dzZXJcclxuICogYnVncyBpbiB0aGUgbmF0aXZlIGBTdHJpbmcucHJvdG90eXBlLm1hdGNoYC4gQ2FsbGluZyBgWFJlZ0V4cC5pbnN0YWxsKCduYXRpdmVzJylgIHVzZXMgdGhpcyB0b1xyXG4gKiBvdmVycmlkZSB0aGUgbmF0aXZlIG1ldGhvZC5cclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtSZWdFeHB9IHJlZ2V4IFJlZ2V4IHRvIHNlYXJjaCB3aXRoLlxyXG4gKiBAcmV0dXJucyB7QXJyYXl9IElmIGByZWdleGAgdXNlcyBmbGFnIGcsIGFuIGFycmF5IG9mIG1hdGNoIHN0cmluZ3Mgb3IgbnVsbC4gV2l0aG91dCBmbGFnIGcsIHRoZVxyXG4gKiAgIHJlc3VsdCBvZiBjYWxsaW5nIGByZWdleC5leGVjKHRoaXMpYC5cclxuICovXHJcbiAgICBmaXhlZC5tYXRjaCA9IGZ1bmN0aW9uIChyZWdleCkge1xyXG4gICAgICAgIGlmICghc2VsZi5pc1JlZ0V4cChyZWdleCkpIHtcclxuICAgICAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKHJlZ2V4KTsgLy8gVXNlIG5hdGl2ZSBgUmVnRXhwYFxyXG4gICAgICAgIH0gZWxzZSBpZiAocmVnZXguZ2xvYmFsKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBuYXRpdi5tYXRjaC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICByZWdleC5sYXN0SW5kZXggPSAwOyAvLyBGaXhlcyBJRSBidWdcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZpeGVkLmV4ZWMuY2FsbChyZWdleCwgdGhpcyk7XHJcbiAgICB9O1xyXG5cclxuLyoqXHJcbiAqIEFkZHMgc3VwcG9ydCBmb3IgYCR7bn1gIHRva2VucyBmb3IgbmFtZWQgYW5kIG51bWJlcmVkIGJhY2tyZWZlcmVuY2VzIGluIHJlcGxhY2VtZW50IHRleHQsIGFuZFxyXG4gKiBwcm92aWRlcyBuYW1lZCBiYWNrcmVmZXJlbmNlcyB0byByZXBsYWNlbWVudCBmdW5jdGlvbnMgYXMgYGFyZ3VtZW50c1swXS5uYW1lYC4gQWxzbyBmaXhlc1xyXG4gKiBicm93c2VyIGJ1Z3MgaW4gcmVwbGFjZW1lbnQgdGV4dCBzeW50YXggd2hlbiBwZXJmb3JtaW5nIGEgcmVwbGFjZW1lbnQgdXNpbmcgYSBub25yZWdleCBzZWFyY2hcclxuICogdmFsdWUsIGFuZCB0aGUgdmFsdWUgb2YgYSByZXBsYWNlbWVudCByZWdleCdzIGBsYXN0SW5kZXhgIHByb3BlcnR5IGR1cmluZyByZXBsYWNlbWVudCBpdGVyYXRpb25zXHJcbiAqIGFuZCB1cG9uIGNvbXBsZXRpb24uIE5vdGUgdGhhdCB0aGlzIGRvZXNuJ3Qgc3VwcG9ydCBTcGlkZXJNb25rZXkncyBwcm9wcmlldGFyeSB0aGlyZCAoYGZsYWdzYClcclxuICogYXJndW1lbnQuIENhbGxpbmcgYFhSZWdFeHAuaW5zdGFsbCgnbmF0aXZlcycpYCB1c2VzIHRoaXMgdG8gb3ZlcnJpZGUgdGhlIG5hdGl2ZSBtZXRob2QuIFVzZSB2aWFcclxuICogYFhSZWdFeHAucmVwbGFjZWAgd2l0aG91dCBvdmVycmlkaW5nIG5hdGl2ZXMuXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7UmVnRXhwfFN0cmluZ30gc2VhcmNoIFNlYXJjaCBwYXR0ZXJuIHRvIGJlIHJlcGxhY2VkLlxyXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gcmVwbGFjZW1lbnQgUmVwbGFjZW1lbnQgc3RyaW5nIG9yIGEgZnVuY3Rpb24gaW52b2tlZCB0byBjcmVhdGUgaXQuXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IE5ldyBzdHJpbmcgd2l0aCBvbmUgb3IgYWxsIG1hdGNoZXMgcmVwbGFjZWQuXHJcbiAqL1xyXG4gICAgZml4ZWQucmVwbGFjZSA9IGZ1bmN0aW9uIChzZWFyY2gsIHJlcGxhY2VtZW50KSB7XHJcbiAgICAgICAgdmFyIGlzUmVnZXggPSBzZWxmLmlzUmVnRXhwKHNlYXJjaCksIGNhcHR1cmVOYW1lcywgcmVzdWx0LCBzdHIsIG9yaWdMYXN0SW5kZXg7XHJcbiAgICAgICAgaWYgKGlzUmVnZXgpIHtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaC54cmVnZXhwKSB7XHJcbiAgICAgICAgICAgICAgICBjYXB0dXJlTmFtZXMgPSBzZWFyY2gueHJlZ2V4cC5jYXB0dXJlTmFtZXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFzZWFyY2guZ2xvYmFsKSB7XHJcbiAgICAgICAgICAgICAgICBvcmlnTGFzdEluZGV4ID0gc2VhcmNoLmxhc3RJbmRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlYXJjaCArPSBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNUeXBlKHJlcGxhY2VtZW50LCBcImZ1bmN0aW9uXCIpKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IG5hdGl2LnJlcGxhY2UuY2FsbChTdHJpbmcodGhpcyksIHNlYXJjaCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsIGk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FwdHVyZU5hbWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hhbmdlIHRoZSBgYXJndW1lbnRzWzBdYCBzdHJpbmcgcHJpbWl0aXZlIHRvIGEgYFN0cmluZ2Agb2JqZWN0IHRoYXQgY2FuIHN0b3JlIHByb3BlcnRpZXNcclxuICAgICAgICAgICAgICAgICAgICBhcmdzWzBdID0gbmV3IFN0cmluZyhhcmdzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTdG9yZSBuYW1lZCBiYWNrcmVmZXJlbmNlcyBvbiB0aGUgZmlyc3QgYXJndW1lbnRcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2FwdHVyZU5hbWVzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXB0dXJlTmFtZXNbaV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3NbMF1bY2FwdHVyZU5hbWVzW2ldXSA9IGFyZ3NbaSArIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGBsYXN0SW5kZXhgIGJlZm9yZSBjYWxsaW5nIGByZXBsYWNlbWVudGAuXHJcbiAgICAgICAgICAgICAgICAvLyBGaXhlcyBJRSwgQ2hyb21lLCBGaXJlZm94LCBTYWZhcmkgYnVnIChsYXN0IHRlc3RlZCBJRSA5LCBDaHJvbWUgMTcsIEZpcmVmb3ggMTEsIFNhZmFyaSA1LjEpXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNSZWdleCAmJiBzZWFyY2guZ2xvYmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLmxhc3RJbmRleCA9IGFyZ3NbYXJncy5sZW5ndGggLSAyXSArIGFyZ3NbMF0ubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VtZW50LmFwcGx5KG51bGwsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdHIgPSBTdHJpbmcodGhpcyk7IC8vIEVuc3VyZSBgYXJnc1thcmdzLmxlbmd0aCAtIDFdYCB3aWxsIGJlIGEgc3RyaW5nIHdoZW4gZ2l2ZW4gbm9uc3RyaW5nIGB0aGlzYFxyXG4gICAgICAgICAgICByZXN1bHQgPSBuYXRpdi5yZXBsYWNlLmNhbGwoc3RyLCBzZWFyY2gsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzOyAvLyBLZWVwIHRoaXMgZnVuY3Rpb24ncyBgYXJndW1lbnRzYCBhdmFpbGFibGUgdGhyb3VnaCBjbG9zdXJlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmF0aXYucmVwbGFjZS5jYWxsKFN0cmluZyhyZXBsYWNlbWVudCksIHJlcGxhY2VtZW50VG9rZW4sIGZ1bmN0aW9uICgkMCwgJDEsICQyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG47XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTmFtZWQgb3IgbnVtYmVyZWQgYmFja3JlZmVyZW5jZSB3aXRoIGN1cmx5IGJyYWNrZXRzXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCQxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIFhSZWdFeHAgYmVoYXZpb3IgZm9yIGAke259YDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICogMS4gQmFja3JlZmVyZW5jZSB0byBudW1iZXJlZCBjYXB0dXJlLCB3aGVyZSBgbmAgaXMgMSsgZGlnaXRzLiBgMGAsIGAwMGAsIGV0Yy4gaXMgdGhlIGVudGlyZSBtYXRjaC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICogMi4gQmFja3JlZmVyZW5jZSB0byBuYW1lZCBjYXB0dXJlIGBuYCwgaWYgaXQgZXhpc3RzIGFuZCBpcyBub3QgYSBudW1iZXIgb3ZlcnJpZGRlbiBieSBudW1iZXJlZCBjYXB0dXJlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiAzLiBPdGhlcndpc2UsIGl0J3MgYW4gZXJyb3IuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuID0gKyQxOyAvLyBUeXBlLWNvbnZlcnQ7IGRyb3AgbGVhZGluZyB6ZXJvc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobiA8PSBhcmdzLmxlbmd0aCAtIDMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhcmdzW25dIHx8IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbiA9IGNhcHR1cmVOYW1lcyA/IGxhc3RJbmRleE9mKGNhcHR1cmVOYW1lcywgJDEpIDogLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiYmFja3JlZmVyZW5jZSB0byB1bmRlZmluZWQgZ3JvdXAgXCIgKyAkMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyZ3NbbiArIDFdIHx8IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEVsc2UsIHNwZWNpYWwgdmFyaWFibGUgb3IgbnVtYmVyZWQgYmFja3JlZmVyZW5jZSAod2l0aG91dCBjdXJseSBicmFja2V0cylcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJDIgPT09IFwiJFwiKSByZXR1cm4gXCIkXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCQyID09PSBcIiZcIiB8fCArJDIgPT09IDApIHJldHVybiBhcmdzWzBdOyAvLyAkJiwgJDAgKG5vdCBmb2xsb3dlZCBieSAxLTkpLCAkMDBcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJDIgPT09IFwiYFwiKSByZXR1cm4gYXJnc1thcmdzLmxlbmd0aCAtIDFdLnNsaWNlKDAsIGFyZ3NbYXJncy5sZW5ndGggLSAyXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCQyID09PSBcIidcIikgcmV0dXJuIGFyZ3NbYXJncy5sZW5ndGggLSAxXS5zbGljZShhcmdzW2FyZ3MubGVuZ3RoIC0gMl0gKyBhcmdzWzBdLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRWxzZSwgbnVtYmVyZWQgYmFja3JlZmVyZW5jZSAod2l0aG91dCBjdXJseSBicmFja2V0cylcclxuICAgICAgICAgICAgICAgICAgICAkMiA9ICskMjsgLy8gVHlwZS1jb252ZXJ0OyBkcm9wIGxlYWRpbmcgemVyb1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIFhSZWdFeHAgYmVoYXZpb3I6XHJcbiAgICAgICAgICAgICAgICAgICAgICogLSBCYWNrcmVmZXJlbmNlcyB3aXRob3V0IGN1cmx5IGJyYWNrZXRzIGVuZCBhZnRlciAxIG9yIDIgZGlnaXRzLiBVc2UgYCR7Li59YCBmb3IgbW9yZSBkaWdpdHMuXHJcbiAgICAgICAgICAgICAgICAgICAgICogLSBgJDFgIGlzIGFuIGVycm9yIGlmIHRoZXJlIGFyZSBubyBjYXB0dXJpbmcgZ3JvdXBzLlxyXG4gICAgICAgICAgICAgICAgICAgICAqIC0gYCQxMGAgaXMgYW4gZXJyb3IgaWYgdGhlcmUgYXJlIGxlc3MgdGhhbiAxMCBjYXB0dXJpbmcgZ3JvdXBzLiBVc2UgYCR7MX0wYCBpbnN0ZWFkLlxyXG4gICAgICAgICAgICAgICAgICAgICAqIC0gYCQwMWAgaXMgZXF1aXZhbGVudCB0byBgJDFgIGlmIGEgY2FwdHVyaW5nIGdyb3VwIGV4aXN0cywgb3RoZXJ3aXNlIGl0J3MgYW4gZXJyb3IuXHJcbiAgICAgICAgICAgICAgICAgICAgICogLSBgJDBgIChub3QgZm9sbG93ZWQgYnkgMS05KSwgYCQwMGAsIGFuZCBgJCZgIGFyZSB0aGUgZW50aXJlIG1hdGNoLlxyXG4gICAgICAgICAgICAgICAgICAgICAqIE5hdGl2ZSBiZWhhdmlvciwgZm9yIGNvbXBhcmlzb246XHJcbiAgICAgICAgICAgICAgICAgICAgICogLSBCYWNrcmVmZXJlbmNlcyBlbmQgYWZ0ZXIgMSBvciAyIGRpZ2l0cy4gQ2Fubm90IHVzZSBiYWNrcmVmZXJlbmNlIHRvIGNhcHR1cmluZyBncm91cCAxMDArLlxyXG4gICAgICAgICAgICAgICAgICAgICAqIC0gYCQxYCBpcyBhIGxpdGVyYWwgYCQxYCBpZiB0aGVyZSBhcmUgbm8gY2FwdHVyaW5nIGdyb3Vwcy5cclxuICAgICAgICAgICAgICAgICAgICAgKiAtIGAkMTBgIGlzIGAkMWAgZm9sbG93ZWQgYnkgYSBsaXRlcmFsIGAwYCBpZiB0aGVyZSBhcmUgbGVzcyB0aGFuIDEwIGNhcHR1cmluZyBncm91cHMuXHJcbiAgICAgICAgICAgICAgICAgICAgICogLSBgJDAxYCBpcyBlcXVpdmFsZW50IHRvIGAkMWAgaWYgYSBjYXB0dXJpbmcgZ3JvdXAgZXhpc3RzLCBvdGhlcndpc2UgaXQncyBhIGxpdGVyYWwgYCQwMWAuXHJcbiAgICAgICAgICAgICAgICAgICAgICogLSBgJDBgIGlzIGEgbGl0ZXJhbCBgJDBgLiBgJCZgIGlzIHRoZSBlbnRpcmUgbWF0Y2guXHJcbiAgICAgICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTigkMikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCQyID4gYXJncy5sZW5ndGggLSAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJiYWNrcmVmZXJlbmNlIHRvIHVuZGVmaW5lZCBncm91cCBcIiArICQwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJnc1skMl0gfHwgXCJcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiaW52YWxpZCB0b2tlbiBcIiArICQwKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzUmVnZXgpIHtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaC5nbG9iYWwpIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5sYXN0SW5kZXggPSAwOyAvLyBGaXhlcyBJRSwgU2FmYXJpIGJ1ZyAobGFzdCB0ZXN0ZWQgSUUgOSwgU2FmYXJpIDUuMSlcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5sYXN0SW5kZXggPSBvcmlnTGFzdEluZGV4OyAvLyBGaXhlcyBJRSwgT3BlcmEgYnVnIChsYXN0IHRlc3RlZCBJRSA5LCBPcGVyYSAxMS42KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG5cclxuLyoqXHJcbiAqIEZpeGVzIGJyb3dzZXIgYnVncyBpbiB0aGUgbmF0aXZlIGBTdHJpbmcucHJvdG90eXBlLnNwbGl0YC4gQ2FsbGluZyBgWFJlZ0V4cC5pbnN0YWxsKCduYXRpdmVzJylgXHJcbiAqIHVzZXMgdGhpcyB0byBvdmVycmlkZSB0aGUgbmF0aXZlIG1ldGhvZC4gVXNlIHZpYSBgWFJlZ0V4cC5zcGxpdGAgd2l0aG91dCBvdmVycmlkaW5nIG5hdGl2ZXMuXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7UmVnRXhwfFN0cmluZ30gc2VwYXJhdG9yIFJlZ2V4IG9yIHN0cmluZyB0byB1c2UgZm9yIHNlcGFyYXRpbmcgdGhlIHN0cmluZy5cclxuICogQHBhcmFtIHtOdW1iZXJ9IFtsaW1pdF0gTWF4aW11bSBudW1iZXIgb2YgaXRlbXMgdG8gaW5jbHVkZSBpbiB0aGUgcmVzdWx0IGFycmF5LlxyXG4gKiBAcmV0dXJucyB7QXJyYXl9IEFycmF5IG9mIHN1YnN0cmluZ3MuXHJcbiAqL1xyXG4gICAgZml4ZWQuc3BsaXQgPSBmdW5jdGlvbiAoc2VwYXJhdG9yLCBsaW1pdCkge1xyXG4gICAgICAgIGlmICghc2VsZi5pc1JlZ0V4cChzZXBhcmF0b3IpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuYXRpdi5zcGxpdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyAvLyB1c2UgZmFzdGVyIG5hdGl2ZSBtZXRob2RcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0ciA9IFN0cmluZyh0aGlzKSxcclxuICAgICAgICAgICAgb3JpZ0xhc3RJbmRleCA9IHNlcGFyYXRvci5sYXN0SW5kZXgsXHJcbiAgICAgICAgICAgIG91dHB1dCA9IFtdLFxyXG4gICAgICAgICAgICBsYXN0TGFzdEluZGV4ID0gMCxcclxuICAgICAgICAgICAgbGFzdExlbmd0aDtcclxuICAgICAgICAvKiBWYWx1ZXMgZm9yIGBsaW1pdGAsIHBlciB0aGUgc3BlYzpcclxuICAgICAgICAgKiBJZiB1bmRlZmluZWQ6IHBvdygyLDMyKSAtIDFcclxuICAgICAgICAgKiBJZiAwLCBJbmZpbml0eSwgb3IgTmFOOiAwXHJcbiAgICAgICAgICogSWYgcG9zaXRpdmUgbnVtYmVyOiBsaW1pdCA9IGZsb29yKGxpbWl0KTsgaWYgKGxpbWl0ID49IHBvdygyLDMyKSkgbGltaXQgLT0gcG93KDIsMzIpO1xyXG4gICAgICAgICAqIElmIG5lZ2F0aXZlIG51bWJlcjogcG93KDIsMzIpIC0gZmxvb3IoYWJzKGxpbWl0KSlcclxuICAgICAgICAgKiBJZiBvdGhlcjogVHlwZS1jb252ZXJ0LCB0aGVuIHVzZSB0aGUgYWJvdmUgcnVsZXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBsaW1pdCA9IChsaW1pdCA9PT0gdW5kZWYgPyAtMSA6IGxpbWl0KSA+Pj4gMDtcclxuICAgICAgICBzZWxmLmZvckVhY2goc3RyLCBzZXBhcmF0b3IsIGZ1bmN0aW9uIChtYXRjaCkge1xyXG4gICAgICAgICAgICBpZiAoKG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKSA+IGxhc3RMYXN0SW5kZXgpIHsgLy8gIT0gYGlmIChtYXRjaFswXS5sZW5ndGgpYFxyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goc3RyLnNsaWNlKGxhc3RMYXN0SW5kZXgsIG1hdGNoLmluZGV4KSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMSAmJiBtYXRjaC5pbmRleCA8IHN0ci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShvdXRwdXQsIG1hdGNoLnNsaWNlKDEpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxhc3RMZW5ndGggPSBtYXRjaFswXS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBsYXN0TGFzdEluZGV4ID0gbWF0Y2guaW5kZXggKyBsYXN0TGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGxhc3RMYXN0SW5kZXggPT09IHN0ci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKCFuYXRpdi50ZXN0LmNhbGwoc2VwYXJhdG9yLCBcIlwiKSB8fCBsYXN0TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKHN0ci5zbGljZShsYXN0TGFzdEluZGV4KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlcGFyYXRvci5sYXN0SW5kZXggPSBvcmlnTGFzdEluZGV4O1xyXG4gICAgICAgIHJldHVybiBvdXRwdXQubGVuZ3RoID4gbGltaXQgPyBvdXRwdXQuc2xpY2UoMCwgbGltaXQpIDogb3V0cHV0O1xyXG4gICAgfTtcclxuXHJcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIEJ1aWx0LWluIHRva2Vuc1xyXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4vLyBTaG9ydGN1dFxyXG4gICAgYWRkID0gYWRkVG9rZW4ub247XHJcblxyXG4vKiBOYW1lZCBjYXB0dXJpbmcgZ3JvdXA7IG1hdGNoIHRoZSBvcGVuaW5nIGRlbGltaXRlciBvbmx5OiAoPzxuYW1lPlxyXG4gKiBDYXB0dXJlIG5hbWVzIGNhbiB1c2UgdGhlIGNoYXJhY3RlcnMgQS1aLCBhLXosIDAtOSwgXywgYW5kICQgb25seS4gTmFtZXMgY2FuJ3QgYmUgaW50ZWdlcnMuXHJcbiAqIFN1cHBvcnRzIFB5dGhvbi1zdHlsZSAoP1A8bmFtZT4gYXMgYW4gYWx0ZXJuYXRlIHN5bnRheCB0byBhdm9pZCBpc3N1ZXMgaW4gcmVjZW50IE9wZXJhICh3aGljaFxyXG4gKiBuYXRpdmVseSBzdXBwb3J0cyB0aGUgUHl0aG9uLXN0eWxlIHN5bnRheCkuIE90aGVyd2lzZSwgWFJlZ0V4cCBtaWdodCB0cmVhdCBudW1iZXJlZFxyXG4gKiBiYWNrcmVmZXJlbmNlcyB0byBQeXRob24tc3R5bGUgbmFtZWQgY2FwdHVyZSBhcyBvY3RhbHMuXHJcbiAqL1xyXG4gICAgYWRkKC9cXChcXD9QPzwoW1xcdyRdKyk+LyxcclxuICAgICAgICBmdW5jdGlvbiAobWF0Y2gpIHtcclxuICAgICAgICAgICAgaWYgKCFpc05hTihtYXRjaFsxXSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIEF2b2lkIGluY29ycmVjdCBsb29rdXBzLCBzaW5jZSBuYW1lZCBiYWNrcmVmZXJlbmNlcyBhcmUgYWRkZWQgdG8gbWF0Y2ggYXJyYXlzXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJjYW4ndCB1c2UgaW50ZWdlciBhcyBjYXB0dXJlIG5hbWUgXCIgKyBtYXRjaFswXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYXB0dXJlTmFtZXMucHVzaChtYXRjaFsxXSk7XHJcbiAgICAgICAgICAgIHRoaXMuaGFzTmFtZWRDYXB0dXJlID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmV0dXJuIFwiKFwiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuLyogQ2FwdHVyaW5nIGdyb3VwOyBtYXRjaCB0aGUgb3BlbmluZyBwYXJlbnRoZXNpcyBvbmx5LlxyXG4gKiBSZXF1aXJlZCBmb3Igc3VwcG9ydCBvZiBuYW1lZCBjYXB0dXJpbmcgZ3JvdXBzLiBBbHNvIGFkZHMgZXhwbGljaXQgY2FwdHVyZSBtb2RlIChmbGFnIG4pLlxyXG4gKi9cclxuICAgIGFkZCgvXFwoKD8hXFw/KS8sXHJcbiAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5oYXNGbGFnKFwiblwiKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiKD86XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYXB0dXJlTmFtZXMucHVzaChudWxsKTtcclxuICAgICAgICAgICAgcmV0dXJuIFwiKFwiO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge2N1c3RvbUZsYWdzOiBcIm5cIn0pO1xyXG5cclxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiAgRXhwb3NlIFhSZWdFeHBcclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuLy8gRm9yIENvbW1vbkpTIGVudmlyb21lbnRzXHJcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICBleHBvcnRzLlhSZWdFeHAgPSBzZWxmO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzZWxmO1xyXG5cclxufSgpKTtcclxuXHJcbiJdfQ==