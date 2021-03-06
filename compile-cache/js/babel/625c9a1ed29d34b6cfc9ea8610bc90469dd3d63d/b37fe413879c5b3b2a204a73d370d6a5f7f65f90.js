/**
 * Sample quicksort code
 * TODO: This is the first todo
 *
 * LOONG: Lorem ipsum dolor sit amet, dapibus rhoncus. Scelerisque quam, id ante molestias, ipsum lorem magnis et. A eleifend ipsum. Pellentesque aliquam, proin mollis sed odio, at amet vestibulum velit. Dolor sed, urna integer suspendisse ut a. Pharetra amet dui accumsan elementum, vitae et ac ligula turpis semper donec.
 * LOONG_SpgLE84Ms1K4DSumtJDoNn8ZECZLL+VR0DoGydy54vUoSpgLE84Ms1K4DSumtJDoNn8ZECZLLVR0DoGydy54vUonRClXwLbFhX2gMwZgjx250ay+V0lF7sPZ8AiCVy22sE=SpgL_E84Ms1K4DSumtJDoNn8ZECZLLVR0DoGydy54vUoSpgLE84Ms1K4DSumtJ_DoNn8ZECZLLVR0DoGydy54vUo
 */

var quicksort = function quicksort() {
  var sort = function sort(items) {
    if (items.length <= 1) {
      return items;
    }
    var pivot = items.shift(),
        current,
        left = [],
        right = [];
    while (items.length > 0) {
      current = items.shift();
      current < pivot ? left.push(current) : right.push(current);
    }
    return sort(left).concat(pivot).concat(sort(right));
  };

  // TODO: This is the second todo

  return sort(Array.apply(this, arguments)); // DEBUG

  // FIXME: Add more annnotations :)

  // CHANGED one
  // CHANGED: two
  // @CHANGED three
  // @CHANGED: four
  // changed: non-matching tag

  // XXX one
  // XXX: two
  // @XXX three
  // @XXX: four
  //xxx: non-matching tag

  // IDEA one
  // IDEA: two
  // @IDEA three
  // @IDEA: four
  //idea: non-matching tag

  // HACK one
  // HACK: two
  // @HACK three
  // @HACK: four
  //hack: non-matching tag

  // NOTE one
  // NOTE: two
  // @NOTE three
  // @NOTE: four
  //note: non-matching tag

  // REVIEW one
  // REVIEW: two
  // @REVIEW three
  // @REVIEW: four
  //review: non-matching tag
};

// Don't match the following
define("_JS_TODO_ALERT_", "js:alert(&quot;TODO&quot;);");
// XXXe�d��RPPP0�
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvdG9kby1zaG93L3NwZWMvZml4dHVyZXMvc2FtcGxlMS9zYW1wbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFRQSxJQUFJLFNBQVMsR0FBRyxTQUFaLFNBQVMsR0FBZTtBQUMxQixNQUFJLElBQUksR0FBRyxTQUFQLElBQUksQ0FBWSxLQUFLLEVBQUU7QUFDekIsUUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtBQUFFLGFBQU8sS0FBSyxDQUFDO0tBQUU7QUFDeEMsUUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRTtRQUFFLE9BQU87UUFBRSxJQUFJLEdBQUcsRUFBRTtRQUFFLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDMUQsV0FBTSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN0QixhQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3hCLGFBQU8sR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzVEO0FBQ0QsV0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztHQUNyRCxDQUFDOzs7O0FBSUYsU0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0MzQyxDQUFDOzs7QUFHRixNQUFNLENBQUMsaUJBQWlCLEVBQUUsNkJBQTZCLENBQUMsQ0FBQyIsImZpbGUiOiIvVXNlcnMvbWsyLy5hdG9tL3BhY2thZ2VzL3RvZG8tc2hvdy9zcGVjL2ZpeHR1cmVzL3NhbXBsZTEvc2FtcGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBTYW1wbGUgcXVpY2tzb3J0IGNvZGVcbiAqIFRPRE86IFRoaXMgaXMgdGhlIGZpcnN0IHRvZG9cbiAqXG4gKiBMT09ORzogTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGRhcGlidXMgcmhvbmN1cy4gU2NlbGVyaXNxdWUgcXVhbSwgaWQgYW50ZSBtb2xlc3RpYXMsIGlwc3VtIGxvcmVtIG1hZ25pcyBldC4gQSBlbGVpZmVuZCBpcHN1bS4gUGVsbGVudGVzcXVlIGFsaXF1YW0sIHByb2luIG1vbGxpcyBzZWQgb2RpbywgYXQgYW1ldCB2ZXN0aWJ1bHVtIHZlbGl0LiBEb2xvciBzZWQsIHVybmEgaW50ZWdlciBzdXNwZW5kaXNzZSB1dCBhLiBQaGFyZXRyYSBhbWV0IGR1aSBhY2N1bXNhbiBlbGVtZW50dW0sIHZpdGFlIGV0IGFjIGxpZ3VsYSB0dXJwaXMgc2VtcGVyIGRvbmVjLlxuICogTE9PTkdfU3BnTEU4NE1zMUs0RFN1bXRKRG9ObjhaRUNaTEwrVlIwRG9HeWR5NTR2VW9TcGdMRTg0TXMxSzREU3VtdEpEb05uOFpFQ1pMTFZSMERvR3lkeTU0dlVvblJDbFh3TGJGaFgyZ013WmdqeDI1MGF5K1YwbEY3c1BaOEFpQ1Z5MjJzRT1TcGdMX0U4NE1zMUs0RFN1bXRKRG9ObjhaRUNaTExWUjBEb0d5ZHk1NHZVb1NwZ0xFODRNczFLNERTdW10Sl9Eb05uOFpFQ1pMTFZSMERvR3lkeTU0dlVvXG4gKi9cblxudmFyIHF1aWNrc29ydCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNvcnQgPSBmdW5jdGlvbihpdGVtcykge1xuICAgIGlmIChpdGVtcy5sZW5ndGggPD0gMSkgeyByZXR1cm4gaXRlbXM7IH1cbiAgICB2YXIgcGl2b3QgPSBpdGVtcy5zaGlmdCgpLCBjdXJyZW50LCBsZWZ0ID0gW10sIHJpZ2h0ID0gW107XG4gICAgd2hpbGUoaXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgY3VycmVudCA9IGl0ZW1zLnNoaWZ0KCk7XG4gICAgICBjdXJyZW50IDwgcGl2b3QgPyBsZWZ0LnB1c2goY3VycmVudCkgOiByaWdodC5wdXNoKGN1cnJlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gc29ydChsZWZ0KS5jb25jYXQocGl2b3QpLmNvbmNhdChzb3J0KHJpZ2h0KSk7XG4gIH07XG5cbiAgLy8gVE9ETzogVGhpcyBpcyB0aGUgc2Vjb25kIHRvZG9cblxuICByZXR1cm4gc29ydChBcnJheS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTsgIC8vIERFQlVHXG5cbiAgLy8gRklYTUU6IEFkZCBtb3JlIGFubm5vdGF0aW9ucyA6KVxuXG4gIC8vIENIQU5HRUQgb25lXG4gIC8vIENIQU5HRUQ6IHR3b1xuICAvLyBAQ0hBTkdFRCB0aHJlZVxuICAvLyBAQ0hBTkdFRDogZm91clxuICAvLyBjaGFuZ2VkOiBub24tbWF0Y2hpbmcgdGFnXG5cbiAgLy8gWFhYIG9uZVxuICAvLyBYWFg6IHR3b1xuICAvLyBAWFhYIHRocmVlXG4gIC8vIEBYWFg6IGZvdXJcbiAgLy94eHg6IG5vbi1tYXRjaGluZyB0YWdcblxuICAvLyBJREVBIG9uZVxuICAvLyBJREVBOiB0d29cbiAgLy8gQElERUEgdGhyZWVcbiAgLy8gQElERUE6IGZvdXJcbiAgLy9pZGVhOiBub24tbWF0Y2hpbmcgdGFnXG5cbiAgLy8gSEFDSyBvbmVcbiAgLy8gSEFDSzogdHdvXG4gIC8vIEBIQUNLIHRocmVlXG4gIC8vIEBIQUNLOiBmb3VyXG4gIC8vaGFjazogbm9uLW1hdGNoaW5nIHRhZ1xuXG4gIC8vIE5PVEUgb25lXG4gIC8vIE5PVEU6IHR3b1xuICAvLyBATk9URSB0aHJlZVxuICAvLyBATk9URTogZm91clxuICAvL25vdGU6IG5vbi1tYXRjaGluZyB0YWdcblxuICAvLyBSRVZJRVcgb25lXG4gIC8vIFJFVklFVzogdHdvXG4gIC8vIEBSRVZJRVcgdGhyZWVcbiAgLy8gQFJFVklFVzogZm91clxuICAvL3Jldmlldzogbm9uLW1hdGNoaW5nIHRhZ1xuXG59O1xuXG4vLyBEb24ndCBtYXRjaCB0aGUgZm9sbG93aW5nXG5kZWZpbmUoXCJfSlNfVE9ET19BTEVSVF9cIiwgXCJqczphbGVydCgmcXVvdDtUT0RPJnF1b3Q7KTtcIik7XG4vLyBYWFhl77+9ZO+/ve+/vVJQUFAwXHUwMDA277+9XHUwMDBmXG4iXX0=