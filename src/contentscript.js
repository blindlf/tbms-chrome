chrome.runtime.onMessage.addListener(
	function(request, sender) {
		if (request.qstLoaded) {
			// TODO
		}
	}
);

function ready(fn) {
	if (document.readyState != 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

var dateStart;

function monitor() {
	var secs = date - new Date() / 1000;
	// Expired
	if (secs < 0) {
		return;
	}
	chrome.runtime.sendMessage({'newIconPath' : 'icon-19.png'});
	// Not ready
}

// Get the start of time
ready(function() {
	var container = document.querySelector('#J_SecKill');
	if (!container) {
		return;
	}
	container.addEventListener('DOMSubtreeModified', function () {
		// Already monitor
		if (dateStart) {
			return;
		}
		// Require login
		if (null != this.querySelector('.need-login')) {
			return;
		}
		// Parse start time
		if (null != this.querySelector('.not-ready')) {
			var eDate = this.querySelector('span.date');
			var eTime = this.querySelector('span.time');
			// Something wrong
			if (null == eDate || null == eTime) {
				return;
			}
			// prase
			var sTime = eDate.textContent + ' ' + eTime.textContent;
			sTime = sTime.replace('年', '-').replace('月', '-').replace('日', '');
			dateStart = new Date(sTime);
			
			monitor();
		}
	}, false);
});
