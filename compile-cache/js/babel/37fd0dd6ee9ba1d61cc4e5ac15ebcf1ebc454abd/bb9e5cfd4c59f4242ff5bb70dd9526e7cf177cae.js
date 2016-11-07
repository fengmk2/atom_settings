module.exports = function (app) {

	return {

		// ALLOW TESLA LOGGING TO BE TURNED OFF IN CONFIG
		log: function log(what) {
			if (app.config.logging.console === true) console.log(what);
		},

		emptyObject: function emptyObject(obj) {
			return !Object.keys(obj).length;
		},

		countObject: function countObject(obj) {
			var count = 0;
			for (var key in obj) {
				if (obj(key)) {
					count++;
				}
			}

			return count;
		},

		'throw': function _throw(num) {

			var code = {
				400: '400 Bad Request',
				401: '401 Unauthorized',
				403: '403 Forbidden',
				404: '404 Not Found',
				405: '405 Method Not Allowed',
				500: '500 Internal Server Error'
			};

			var err = new Error(code[num]);
			err.code = num;
			err.message = code[num];
			err.status = num;

			return err;
		}

	};
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvc2V0aS11aS9maWxlLXR5cGVzL0phdmFTY3JpcHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLEdBQUcsRUFBRTs7QUFFL0IsUUFBTzs7O0FBR04sS0FBRyxFQUFFLGFBQVMsSUFBSSxFQUFFO0FBQ25CLE9BQUssR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxLQUFLLElBQUksRUFBRyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzdEOztBQUVELGFBQVcsRUFBRSxxQkFBUyxHQUFHLEVBQUU7QUFDekIsVUFBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0dBQ2pDOztBQUVELGFBQVcsRUFBRSxxQkFBUyxHQUFHLEVBQUU7QUFDMUIsT0FBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsUUFBSyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUc7QUFDcEIsUUFBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDWCxVQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Y7O0FBRUQsVUFBTyxLQUFLLENBQUM7R0FDYjs7QUFFRCxXQUFPLGdCQUFTLEdBQUcsRUFBRTs7QUFFcEIsT0FBSSxJQUFJLEdBQUc7QUFDVixPQUFHLEVBQUcsaUJBQWlCO0FBQ3ZCLE9BQUcsRUFBRyxrQkFBa0I7QUFDeEIsT0FBRyxFQUFHLGVBQWU7QUFDckIsT0FBRyxFQUFHLGVBQWU7QUFDckIsT0FBRyxFQUFHLHdCQUF3QjtBQUM5QixPQUFHLEVBQUcsMkJBQTJCO0lBQ2pDLENBQUM7O0FBRUYsT0FBSSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFFLENBQUM7QUFDN0IsTUFBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7QUFDZixNQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QixNQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQzs7QUFFckIsVUFBTyxHQUFHLENBQUM7R0FFWDs7RUFFRCxDQUFDO0NBRUYsQ0FBQyIsImZpbGUiOiIvVXNlcnMvbWsyLy5hdG9tL3BhY2thZ2VzL3NldGktdWkvZmlsZS10eXBlcy9KYXZhU2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXBwKSB7XG5cblx0cmV0dXJuIHtcblxuXHRcdC8vIEFMTE9XIFRFU0xBIExPR0dJTkcgVE8gQkUgVFVSTkVEIE9GRiBJTiBDT05GSUdcblx0XHRsb2c6IGZ1bmN0aW9uKHdoYXQpIHtcblx0XHRcdGlmICggYXBwLmNvbmZpZy5sb2dnaW5nLmNvbnNvbGUgPT09IHRydWUgKSBjb25zb2xlLmxvZyh3aGF0KTtcblx0XHR9LFxuXG5cdFx0ZW1wdHlPYmplY3Q6IGZ1bmN0aW9uKG9iaikge1xuXHRcdCAgcmV0dXJuICFPYmplY3Qua2V5cyhvYmopLmxlbmd0aDtcblx0XHR9LFxuXG5cdFx0Y291bnRPYmplY3Q6IGZ1bmN0aW9uKG9iaikge1xuXHRcdFx0dmFyIGNvdW50ID0gMDtcblx0XHRcdGZvciggdmFyIGtleSBpbiBvYmogKSB7XG5cdFx0XHQgIGlmKG9iaihrZXkpKSB7XG5cdFx0XHQgICAgY291bnQrKztcblx0XHRcdCAgfVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gY291bnQ7XG5cdFx0fSxcblxuXHRcdHRocm93OiBmdW5jdGlvbihudW0pIHtcblxuXHRcdFx0dmFyIGNvZGUgPSB7XG5cdFx0XHRcdDQwMCA6ICc0MDAgQmFkIFJlcXVlc3QnLFxuXHRcdFx0XHQ0MDEgOiAnNDAxIFVuYXV0aG9yaXplZCcsXG5cdFx0XHRcdDQwMyA6ICc0MDMgRm9yYmlkZGVuJyxcblx0XHRcdFx0NDA0IDogJzQwNCBOb3QgRm91bmQnLFxuXHRcdFx0XHQ0MDUgOiAnNDA1IE1ldGhvZCBOb3QgQWxsb3dlZCcsXG5cdFx0XHRcdDUwMCA6ICc1MDAgSW50ZXJuYWwgU2VydmVyIEVycm9yJyxcblx0XHRcdH07XG5cblx0XHRcdHZhciBlcnIgPSBuZXcgRXJyb3IoIGNvZGVbbnVtXSApO1xuXHRcdFx0ICAgIGVyci5jb2RlID0gbnVtO1xuXHRcdFx0ICAgIGVyci5tZXNzYWdlID0gY29kZVtudW1dO1xuXHRcdFx0ICAgIGVyci5zdGF0dXMgPSBudW07XG5cblx0XHRcdHJldHVybiBlcnI7XG5cblx0XHR9XG5cblx0fTtcblxufTtcbiJdfQ==