var quicksort = function () {
  var sort = function (items) {
    if (items.length <= 1) return items;
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

  return sort(Array.apply(this, arguments));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBsdXMvc3BlYy9maXh0dXJlcy9zYW1wbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxZQUFZLFlBQVk7QUFDMUIsTUFBSSxPQUFPLFVBQVMsT0FBTztBQUN6QixRQUFJLE1BQU0sVUFBVSxHQUFHLE9BQU87QUFDOUIsUUFBSSxRQUFRLE1BQU07UUFBUztRQUFTLE9BQU87UUFBSSxRQUFRO0FBQ3ZELFdBQU0sTUFBTSxTQUFTLEdBQUc7QUFDdEIsZ0JBQVUsTUFBTTtBQUNoQixnQkFBVSxRQUFRLEtBQUssS0FBSyxXQUFXLE1BQU0sS0FBSzs7QUFFcEQsV0FBTyxLQUFLLE1BQU0sT0FBTyxPQUFPLE9BQU8sS0FBSzs7O0FBRzlDLFNBQU8sS0FBSyxNQUFNLE1BQU0sTUFBTSIsImZpbGUiOiIvVXNlcnMvbWsyLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wbHVzL3NwZWMvZml4dHVyZXMvc2FtcGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIHF1aWNrc29ydCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNvcnQgPSBmdW5jdGlvbihpdGVtcykge1xuICAgIGlmIChpdGVtcy5sZW5ndGggPD0gMSkgcmV0dXJuIGl0ZW1zO1xuICAgIHZhciBwaXZvdCA9IGl0ZW1zLnNoaWZ0KCksIGN1cnJlbnQsIGxlZnQgPSBbXSwgcmlnaHQgPSBbXTtcbiAgICB3aGlsZShpdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICBjdXJyZW50ID0gaXRlbXMuc2hpZnQoKTtcbiAgICAgIGN1cnJlbnQgPCBwaXZvdCA/IGxlZnQucHVzaChjdXJyZW50KSA6IHJpZ2h0LnB1c2goY3VycmVudCk7XG4gICAgfVxuICAgIHJldHVybiBzb3J0KGxlZnQpLmNvbmNhdChwaXZvdCkuY29uY2F0KHNvcnQocmlnaHQpKTtcbiAgfTtcblxuICByZXR1cm4gc29ydChBcnJheS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbn07XG4iXX0=