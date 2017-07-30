var resources = {
	"AJAX_ERROR": "AJAX request failed: {0}",
	"MODULE_UNAVAILABLE": "No module called {0}",
};
var timer = {
	running: false,
	frequency: 17,
	start: function(total, callback) {
		var end_time = new Date().getTime() + (total * 1000);
		jQuery.cookie('timer_end', end_time, {expires: Math.ceil(end_time / 86400000)});
		jQuery.cookie('timer_name', $("#title input").val(), {expires: Math.ceil(end_time / 86400000)});
		
		timer.running = true;
		modules.showIfContent();
		modules.showFromSeconds(seconds);
		var seconds = 0;
		var start = new Date().getTime();
		utils.timer(timer.frequency, function(d) {
			var seconds_since_start = (new Date().getTime() - start) / 1000;
			seconds = total - seconds_since_start;
			if (Math.floor((seconds % 1) * 10000) < 0 || !timer.running) seconds = 0;
			modules.showFromSeconds(seconds);
			if (seconds !== 0) modules.showIfContent();
			$("#milliseconds label").text(utils.pad(Math.floor((seconds % 1) * 10000), 4));
			if (seconds == 0 && callback && timer.running) {
				callback.call();
			}
			return seconds != 0;
		});
	},
	stop: function() {
		timer.running = false;
	}
};
var modules = {};
(function() {
	var m = {};
	modules.add = function() {
		jQuery.each(m, function(i, v) {
			var p = i.replace(" ", "_").toLowerCase();
			$("<div style='display:none;' class='entry'><label></label><input type='number' maxlength='5' value='00' /><span class='out'></span><span class='colon'> : </span></div>").insertBefore("#milliseconds").attr("id", "m_" + p);
			$("#m_" + p + " label").attr("for", "i_" + p).text(i + ":");
			$("#m_" + p + " input").attr("id", "i_" + p).attr("name", p);
			$("<option></option>").appendTo("#types").attr("value", i).text(i);
		});
		var last_entry = $("#content .entry:nth-last-child(4)");
		last_entry.children(".colon").remove();
		//last_entry.width(50).children("input").width(40);
	};
	modules.load = function(p, c) {
		jQuery.ajax({
			url: p,
			type: "GET",
			data: {},
			success: function(data) {
				m = data;
				modules.add();
				if (c) c.call(data, data);
			},
			error: function(xhr, status, error) {
				throw utils.brackets(resources["AJAX_ERROR"], error.toString());
			}
		});
	};
	modules.show = function(n) {
		if (typeof n !== "object") n = [n];
		jQuery.each(n, function(i, v) {
			if (!m[v]) throw utils.brackets(resources["MODULE_UNAVAILABLE"], v);
			var p = v.replace(" ", "_").toLowerCase();
			$("#m_" + p).css("display", "");
			$("#types option").filter(function(index) {
				return $(this).text() === v;
			}).remove();
		});
	};
	modules.getValueOf = function(n) {
		if (!m[n]) throw utils.brackets(resources["MODULE_UNAVAILABLE"], n);
		var p = n.replace(" ", "_").toLowerCase();
		var r = parseInt($("#m_" + p + " input").val());
		return isNaN(r) ? 0 : r;
	};
	modules.getTotalValue = function() {
		var total = 0;
		jQuery.each(m, function(i, v) {
			var val = modules.getValueOf(i);
			total += val * v["seconds"];
		});
		return total;
	};
	modules.convertFromSeconds = function(n, s) {
		var v = s;
		var id_of_current = null;
		var values = [];
		jQuery.each(m, function(i, t) {
			var id = values.push(jQuery.extend(true, {}, {"name": i}, t));
			if (i == n) id_of_current = id - 1;
		});
		if (id_of_current == null) throw utils.brackets(resources["MODULE_UNAVAILABLE"], n);
		
		var previous = values.splice(0, id_of_current);
		jQuery.each(previous, function(i, t) {
			v %= t["seconds"];
		});
		return Math.floor(v / m[n]["seconds"]);
	};
	modules.showFromSeconds = function(s) {
		jQuery.each(m, function(i, v) {
			var value = modules.convertFromSeconds(i, s);
			var p = i.replace(" ", "_").toLowerCase();
			if ($("#i_" + p).val() !== utils.pad(value)) $("#i_" + p).val(utils.pad(value));
			if ($("#m_" + p + " .out").text() !== utils.pad(value)) $("#m_" + p + " .out").text(utils.pad(value));
		});
	};
	modules.showIfContent = function() {
		$(".entry").not("#milliseconds").css("display", "");
		jQuery.each(m, function(i, v) {
			var p = i.replace(" ", "_").toLowerCase();
			var text = $("#m_" + p + " .out").text();
			var id = "#m_" + p;
			if (text == "00" && "#" + $("#content .entry:nth-last-child(4)").attr("id") !== id) {
				$("#m_" + p).css("display", "none");
				return;
			}
			$("#m_" + p).css("display", "");
			return false;
		});
	};
}());
var utils = {
	brackets: function(s, v) {
		if (arguments.length > 2 || typeof v !== "object") v = Array.prototype.splice.call(arguments, 1);
		
		jQuery.each(v, function(i, val) {
			s = s.replace("{" + i + "}", val);
		});
		return s;
	},
	pad: function(n, width, z) {
		z = z || '0';
		width = width || 2;
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	},
	timer: function(delay, oninstance) {
		var start = new Date().getTime(), time = 0;
		function instance() {
			time += delay;
			
			var d = oninstance(delay);
			
			if (d) {
				var diff = (new Date().getTime() - start) - time;
				window.setTimeout(instance, (delay - diff));
			}
		}
		window.setTimeout(instance, delay);
	},
	showAlert: (function() {
		var old_title = document.title;
		var timeout, msg;
		var blink = function() { document.title = document.title == msg ? ' ' : msg; };
		var clear = function() {
			clearInterval(timeout);
			document.title = old_title;
			window.onmousemove = null;
			timeout = null;
		}
		return function(m, d) {
			if (!timeout && !window.Notification) {
				msg = m;
				timeout = setInterval(blink, 500);
				window.onmousemove = clear;
			} else if (window.Notification) {
				if (window.Notification.permission == "granted" || window.Notification.checkPermission() == 0) {
					if (window.Notification.createNotification) window.Notification.createNotification('notification.png', m, d).show();
					else {
						var notif = new window.Notification(m, {
							body: d,
							icon: "notification.png"
						});
					}
				}
			}
		}
	}()),
	getFriendlyDate: function(millis) {
		var date = new Date(millis);
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		
		var hour = date.getHours();
		var ap = "";
		
		if (hour < 12) ap = "AM";
		else ap = "PM";
		
		if (hour == 0) hour = 12;
		else if (hour > 12) hour -= 12;
		
		var r = "{day}, {month} {date} {year}, {hour}:{minute}:{second} {am}";
				
		return utils.brackets(r, {
			"day": days[date.getDay()],
			"month": months[date.getMonth()],
			"date": date.getDate(),
			"year": date.getFullYear(),
			"hour": hour,
			"minute": date.getMinutes(),
			"second": date.getSeconds(),
			"am": ap
		});
	}
};