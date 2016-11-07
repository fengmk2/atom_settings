'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var toggleQuotes = function toggleQuotes(editor) {
  editor.transact(function () {
    for (var cursor of editor.getCursors()) {
      var position = cursor.getBufferPosition();
      toggleQuoteAtPosition(editor, position);
      cursor.setBufferPosition(position);
    }
  });
};

exports.toggleQuotes = toggleQuotes;
var getNextQuoteCharacter = function getNextQuoteCharacter(quoteCharacter, allQuoteCharacters) {
  var index = allQuoteCharacters.indexOf(quoteCharacter);
  if (index === -1) {
    return null;
  } else {
    return allQuoteCharacters[(index + 1) % allQuoteCharacters.length];
  }
};

var toggleQuoteAtPosition = function toggleQuoteAtPosition(editor, position) {
  var quoteChars = atom.config.get('toggle-quotes.quoteCharacters');
  var range = editor.displayBuffer.bufferRangeForScopeAtPosition('.string.quoted', position);

  if (range == null) {
    // Attempt to match the current invalid region if it is wrapped in quotes
    // This is useful for languages where changing the quotes makes the range
    // invalid and so toggling again should properly restore the valid quotes

    range = editor.displayBuffer.bufferRangeForScopeAtPosition('.invalid.illegal', position);
    if (range) {
      var inner = quoteChars.split('').map(function (character) {
        return character + '.*' + character;
      }).join('|');

      if (!RegExp('^(' + inner + ')$', 'g').test(editor.getTextInBufferRange(range))) {
        return;
      }
    }
  }

  if (range == null) {
    return;
  }

  var text = editor.getTextInBufferRange(range);

  var _text = _slicedToArray(text, 1);

  var quoteCharacter = _text[0];

  // In Python a string can have a prefix specifying its format. The Python
  // grammar includes this prefix in the string, and thus we need to exclude
  // it when toggling quotes
  var prefix = '';
  if (/[uUr]/.test(quoteCharacter)) {
    var _text2 = _slicedToArray(text, 2);

    prefix = _text2[0];
    quoteCharacter = _text2[1];
  }

  var nextQuoteCharacter = getNextQuoteCharacter(quoteCharacter, quoteChars);

  if (!nextQuoteCharacter) {
    return;
  }

  // let quoteRegex = new RegExp(quoteCharacter, 'g')
  var escapedQuoteRegex = new RegExp('\\\\' + quoteCharacter, 'g');
  var nextQuoteRegex = new RegExp(nextQuoteCharacter, 'g');

  var newText = text.replace(nextQuoteRegex, '\\' + nextQuoteCharacter).replace(escapedQuoteRegex, quoteCharacter);

  newText = prefix + nextQuoteCharacter + newText.slice(1 + prefix.length, -1) + nextQuoteCharacter;

  editor.setTextInBufferRange(range, newText);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvdG9nZ2xlLXF1b3Rlcy9saWIvdG9nZ2xlLXF1b3Rlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7O0FBRUosSUFBTSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQUksTUFBTSxFQUFLO0FBQ3RDLFFBQU0sQ0FBQyxRQUFRLENBQUMsWUFBTTtBQUNwQixTQUFLLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUN0QyxVQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtBQUN6QywyQkFBcUIsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDdkMsWUFBTSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ25DO0dBQ0YsQ0FBQyxDQUFBO0NBQ0gsQ0FBQTs7O0FBRUQsSUFBTSxxQkFBcUIsR0FBRyxTQUF4QixxQkFBcUIsQ0FBSSxjQUFjLEVBQUUsa0JBQWtCLEVBQUs7QUFDcEUsTUFBSSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ3RELE1BQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ2hCLFdBQU8sSUFBSSxDQUFBO0dBQ1osTUFBTTtBQUNMLFdBQU8sa0JBQWtCLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEdBQUksa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUE7R0FDbkU7Q0FDRixDQUFBOztBQUVELElBQU0scUJBQXFCLEdBQUcsU0FBeEIscUJBQXFCLENBQUksTUFBTSxFQUFFLFFBQVEsRUFBSztBQUNsRCxNQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO0FBQ2pFLE1BQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsNkJBQTZCLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUE7O0FBRTFGLE1BQUksS0FBSyxJQUFJLElBQUksRUFBRTs7Ozs7QUFLakIsU0FBSyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsNkJBQTZCLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDeEYsUUFBSSxLQUFLLEVBQUU7QUFDVCxVQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFNBQVM7ZUFBTyxTQUFTLFVBQUssU0FBUztPQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7O0FBRXpGLFVBQUksQ0FBQyxNQUFNLFFBQU0sS0FBSyxTQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUN6RSxlQUFNO09BQ1A7S0FDRjtHQUNGOztBQUVELE1BQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixXQUFNO0dBQ1A7O0FBRUQsTUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFBOzs2QkFDdEIsSUFBSTs7TUFBdEIsY0FBYzs7Ozs7QUFLbkIsTUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFBO0FBQ2YsTUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFO2dDQUNMLElBQUk7O0FBQTlCLFVBQU07QUFBRSxrQkFBYztHQUN4Qjs7QUFFRCxNQUFJLGtCQUFrQixHQUFHLHFCQUFxQixDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQTs7QUFFMUUsTUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQ3ZCLFdBQU07R0FDUDs7O0FBR0QsTUFBSSxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sVUFBUSxjQUFjLEVBQUksR0FBRyxDQUFDLENBQUE7QUFDaEUsTUFBSSxjQUFjLEdBQUcsSUFBSSxNQUFNLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLENBQUE7O0FBRXhELE1BQUksT0FBTyxHQUFHLElBQUksQ0FDZixPQUFPLENBQUMsY0FBYyxTQUFPLGtCQUFrQixDQUFHLENBQ2xELE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxjQUFjLENBQUMsQ0FBQTs7QUFFN0MsU0FBTyxHQUFHLE1BQU0sR0FBRyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsa0JBQWtCLENBQUE7O0FBRWpHLFFBQU0sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUE7Q0FDNUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvbWsyLy5hdG9tL3BhY2thZ2VzL3RvZ2dsZS1xdW90ZXMvbGliL3RvZ2dsZS1xdW90ZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5leHBvcnQgY29uc3QgdG9nZ2xlUXVvdGVzID0gKGVkaXRvcikgPT4ge1xuICBlZGl0b3IudHJhbnNhY3QoKCkgPT4ge1xuICAgIGZvciAobGV0IGN1cnNvciBvZiBlZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICBsZXQgcG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgdG9nZ2xlUXVvdGVBdFBvc2l0aW9uKGVkaXRvciwgcG9zaXRpb24pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9zaXRpb24pXG4gICAgfVxuICB9KVxufVxuXG5jb25zdCBnZXROZXh0UXVvdGVDaGFyYWN0ZXIgPSAocXVvdGVDaGFyYWN0ZXIsIGFsbFF1b3RlQ2hhcmFjdGVycykgPT4ge1xuICBsZXQgaW5kZXggPSBhbGxRdW90ZUNoYXJhY3RlcnMuaW5kZXhPZihxdW90ZUNoYXJhY3RlcilcbiAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgIHJldHVybiBudWxsXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGFsbFF1b3RlQ2hhcmFjdGVyc1soaW5kZXggKyAxKSAlIGFsbFF1b3RlQ2hhcmFjdGVycy5sZW5ndGhdXG4gIH1cbn1cblxuY29uc3QgdG9nZ2xlUXVvdGVBdFBvc2l0aW9uID0gKGVkaXRvciwgcG9zaXRpb24pID0+IHtcbiAgbGV0IHF1b3RlQ2hhcnMgPSBhdG9tLmNvbmZpZy5nZXQoJ3RvZ2dsZS1xdW90ZXMucXVvdGVDaGFyYWN0ZXJzJylcbiAgbGV0IHJhbmdlID0gZWRpdG9yLmRpc3BsYXlCdWZmZXIuYnVmZmVyUmFuZ2VGb3JTY29wZUF0UG9zaXRpb24oJy5zdHJpbmcucXVvdGVkJywgcG9zaXRpb24pXG5cbiAgaWYgKHJhbmdlID09IG51bGwpIHtcbiAgICAvLyBBdHRlbXB0IHRvIG1hdGNoIHRoZSBjdXJyZW50IGludmFsaWQgcmVnaW9uIGlmIGl0IGlzIHdyYXBwZWQgaW4gcXVvdGVzXG4gICAgLy8gVGhpcyBpcyB1c2VmdWwgZm9yIGxhbmd1YWdlcyB3aGVyZSBjaGFuZ2luZyB0aGUgcXVvdGVzIG1ha2VzIHRoZSByYW5nZVxuICAgIC8vIGludmFsaWQgYW5kIHNvIHRvZ2dsaW5nIGFnYWluIHNob3VsZCBwcm9wZXJseSByZXN0b3JlIHRoZSB2YWxpZCBxdW90ZXNcblxuICAgIHJhbmdlID0gZWRpdG9yLmRpc3BsYXlCdWZmZXIuYnVmZmVyUmFuZ2VGb3JTY29wZUF0UG9zaXRpb24oJy5pbnZhbGlkLmlsbGVnYWwnLCBwb3NpdGlvbilcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIGxldCBpbm5lciA9IHF1b3RlQ2hhcnMuc3BsaXQoJycpLm1hcChjaGFyYWN0ZXIgPT4gYCR7Y2hhcmFjdGVyfS4qJHtjaGFyYWN0ZXJ9YCkuam9pbignfCcpXG5cbiAgICAgIGlmICghUmVnRXhwKGBeKCR7aW5uZXJ9KSRgLCAnZycpLnRlc3QoZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKHJhbmdlID09IG51bGwpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGxldCB0ZXh0ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICBsZXQgW3F1b3RlQ2hhcmFjdGVyXSA9IHRleHRcblxuICAvLyBJbiBQeXRob24gYSBzdHJpbmcgY2FuIGhhdmUgYSBwcmVmaXggc3BlY2lmeWluZyBpdHMgZm9ybWF0LiBUaGUgUHl0aG9uXG4gIC8vIGdyYW1tYXIgaW5jbHVkZXMgdGhpcyBwcmVmaXggaW4gdGhlIHN0cmluZywgYW5kIHRodXMgd2UgbmVlZCB0byBleGNsdWRlXG4gIC8vIGl0IHdoZW4gdG9nZ2xpbmcgcXVvdGVzXG4gIGxldCBwcmVmaXggPSAnJ1xuICBpZiAoL1t1VXJdLy50ZXN0KHF1b3RlQ2hhcmFjdGVyKSkge1xuICAgIFtwcmVmaXgsIHF1b3RlQ2hhcmFjdGVyXSA9IHRleHRcbiAgfVxuXG4gIGxldCBuZXh0UXVvdGVDaGFyYWN0ZXIgPSBnZXROZXh0UXVvdGVDaGFyYWN0ZXIocXVvdGVDaGFyYWN0ZXIsIHF1b3RlQ2hhcnMpXG5cbiAgaWYgKCFuZXh0UXVvdGVDaGFyYWN0ZXIpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8vIGxldCBxdW90ZVJlZ2V4ID0gbmV3IFJlZ0V4cChxdW90ZUNoYXJhY3RlciwgJ2cnKVxuICBsZXQgZXNjYXBlZFF1b3RlUmVnZXggPSBuZXcgUmVnRXhwKGBcXFxcXFxcXCR7cXVvdGVDaGFyYWN0ZXJ9YCwgJ2cnKVxuICBsZXQgbmV4dFF1b3RlUmVnZXggPSBuZXcgUmVnRXhwKG5leHRRdW90ZUNoYXJhY3RlciwgJ2cnKVxuXG4gIGxldCBuZXdUZXh0ID0gdGV4dFxuICAgIC5yZXBsYWNlKG5leHRRdW90ZVJlZ2V4LCBgXFxcXCR7bmV4dFF1b3RlQ2hhcmFjdGVyfWApXG4gICAgLnJlcGxhY2UoZXNjYXBlZFF1b3RlUmVnZXgsIHF1b3RlQ2hhcmFjdGVyKVxuXG4gIG5ld1RleHQgPSBwcmVmaXggKyBuZXh0UXVvdGVDaGFyYWN0ZXIgKyBuZXdUZXh0LnNsaWNlKDEgKyBwcmVmaXgubGVuZ3RoLCAtMSkgKyBuZXh0UXVvdGVDaGFyYWN0ZXJcblxuICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UsIG5ld1RleHQpXG59XG4iXX0=
//# sourceURL=/Users/mk2/.atom/packages/toggle-quotes/lib/toggle-quotes.js
