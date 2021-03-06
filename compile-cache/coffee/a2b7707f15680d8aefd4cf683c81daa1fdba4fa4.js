(function() {
  String.prototype.pluralize = function(number) {
    return this + (number !== 1 ? 's' : '');
  };

  String.prototype.formattedDuration = function() {
    var duration, hours, mins, seconds, secs;
    seconds = parseInt(this, 10);
    hours = Math.floor(seconds / 3600);
    mins = Math.floor((seconds - (hours * 3600)) / 60);
    secs = seconds - (hours * 3600) - (mins * 60);
    duration = '';
    if (hours > 0) {
      duration += "" + hours + " " + ("hour".pluralize(hours)) + " ";
    }
    if (mins > 0) {
      duration += "" + mins + " " + ("min".pluralize(mins)) + " ";
    }
    if (secs > 0) {
      duration += "" + secs + " " + ("sec".pluralize(secs));
    }
    return duration;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBU0E7QUFBQSxFQUFBLE1BQU0sQ0FBQSxTQUFFLENBQUEsU0FBUixHQUFvQixTQUFDLE1BQUQsR0FBQTtXQUNsQixJQUFBLEdBQU8sQ0FBSSxNQUFBLEtBQVksQ0FBZixHQUFzQixHQUF0QixHQUErQixFQUFoQyxFQURXO0VBQUEsQ0FBcEIsQ0FBQTs7QUFBQSxFQVdBLE1BQU0sQ0FBQSxTQUFFLENBQUEsaUJBQVIsR0FBNEIsU0FBQSxHQUFBO0FBQzFCLFFBQUEsb0NBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxRQUFBLENBQVMsSUFBVCxFQUFlLEVBQWYsQ0FBVixDQUFBO0FBQUEsSUFFQSxLQUFBLEdBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxPQUFBLEdBQVUsSUFBckIsQ0FGUixDQUFBO0FBQUEsSUFHQSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLE9BQUEsR0FBVSxDQUFDLEtBQUEsR0FBUSxJQUFULENBQVgsQ0FBQSxHQUE2QixFQUF4QyxDQUhQLENBQUE7QUFBQSxJQUlBLElBQUEsR0FBTyxPQUFBLEdBQVUsQ0FBQyxLQUFBLEdBQVEsSUFBVCxDQUFWLEdBQTJCLENBQUMsSUFBQSxHQUFPLEVBQVIsQ0FKbEMsQ0FBQTtBQUFBLElBTUEsUUFBQSxHQUFXLEVBTlgsQ0FBQTtBQU9BLElBQUEsSUFBc0QsS0FBQSxHQUFRLENBQTlEO0FBQUEsTUFBQSxRQUFBLElBQVksRUFBQSxHQUFFLEtBQUYsR0FBUyxHQUFULEdBQVcsQ0FBQSxNQUFNLENBQUMsU0FBUCxDQUFpQixLQUFqQixDQUFBLENBQVgsR0FBb0MsR0FBaEQsQ0FBQTtLQVBBO0FBUUEsSUFBQSxJQUFtRCxJQUFBLEdBQU8sQ0FBMUQ7QUFBQSxNQUFBLFFBQUEsSUFBWSxFQUFBLEdBQUUsSUFBRixHQUFRLEdBQVIsR0FBVSxDQUFBLEtBQUssQ0FBQyxTQUFOLENBQWdCLElBQWhCLENBQUEsQ0FBVixHQUFpQyxHQUE3QyxDQUFBO0tBUkE7QUFTQSxJQUFBLElBQWtELElBQUEsR0FBTyxDQUF6RDtBQUFBLE1BQUEsUUFBQSxJQUFZLEVBQUEsR0FBRSxJQUFGLEdBQVEsR0FBUixHQUFVLENBQUEsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsSUFBaEIsQ0FBQSxDQUF0QixDQUFBO0tBVEE7V0FVQSxTQVgwQjtFQUFBLENBWDVCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/mk2/.atom/packages/travis-ci-status/lib/extensions.coffee