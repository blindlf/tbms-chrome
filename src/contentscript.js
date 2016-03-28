function ready(fn) {
	if (document.readyState != 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

// Change icon and text
function setIcon(path) {
	chrome.runtime.sendMessage({'iconPath' : path});
}
function setBadgeText(text) {
	chrome.runtime.sendMessage({'badgeText' : text});
}

// Status enum
var STATUS = {
	NotAvailable: 0, // 仅限其他客户端
	RequireLogin: 1, // 未登录
	NotReady: 2, // 未开始
	Ready: 3, // 刷新抢宝
	Question: 4, // 回答问题
	Expired: 5 // 已结束
};

function getStatus() {
	if (null != document.querySelector('#J_SecKill .upper-begun')) {
		// class .not-ready also presence
		return STATUS.NotAvailable;
	}
	if (null != document.querySelector('#J_SecKill .need-login')) {
		return STATUS.RequireLogin;
	}
	if (null != document.querySelector('#J_SecKill .not-ready')) {
		return STATUS.NotReady;
	}
	if (null != document.querySelector('#J_SecKill .J_RefreshStatus')) {
		return STATUS.Ready;
	}
	if (null != document.querySelector('#J_SecKill img.question-img')) {
		return STATUS.Question;
	}
	if (null != document.querySelector('#J_SecKill .no-stock')) {
		return STATUS.Expired;
	}
}

function getStartDate() {
	var edate = document.querySelector('#J_SecKill span.date');
	var etime = document.querySelector('#J_SecKill span.time');
	if (!edate || !etime) {
		return;
	}
	var time = edate.textContent
		.replace('年', '-').replace('月', '-').replace('日', '');
	var time = time + ' ' + etime.textContent;
	return new Date(time);
}

function getEtaSecs() {
	var date = getStartDate();
	if (!date) {
		return;
	}
	return (date - new Date()) / 1000;
}

// Wait to start before 5 minutes
function reloadPage() {
	setTimeout(function() {
		console.log("eta", getEtaSecs());
		if (getEtaSecs() < 300) {
			window.location.reload();
		} else {
			reloadPage();
		}
	}, 5000);
	setIcon('icon-19.png');
	setBadgeText('W');
}

// 刷新抢宝
function refresh() {
	console.log('refresh', getEtaSecs());
	setIcon('icon-19.png');
	if (getEtaSecs() <= 3.0) {
		refreshStick();
	} else {
		setBadgeText('R');
		setTimeout(function() {
			refresh();
		}, 2500);
	}
}

function refreshStick() {
	var btn = document.querySelector('#J_SecKill .J_RefreshStatus');
	if (!btn) {
		return;
	}
	var event = document.createEvent('HTMLEvents');
	event.initEvent('click', true, false);
	// *://img1.tbcdn.cn/tfscom/TB1* should be requested
	btn.dispatchEvent(event);
	setBadgeText('H');
	console.log('refreshStick', getEtaSecs());
}

chrome.runtime.onMessage.addListener(
	function(request, sender) {
		// Refresh after 0.2 second
		if (request.qst && STATUS.Ready === getStatus()) {
			setTimeout(refreshStick, 200);
		}
		// Captcha loaded
		if (request.captcha) {
			processCaptcha();
		}
	}
);

function processCaptcha() {
	// Process captcha
	var eimg = document.querySelector('#J_SecKill img.question-img');
	if (!eimg) {
		return;
	}
	// Already processed
	if (document.querySelector('#J_SecKill canvas')) {
		return;
	}
	setBadgeText('A');

	// Draw
	var img = new Image();
	img.crossOrigin = '';
	img.onload = function() {
		var canvas = document.createElement('canvas');
		canvas.setAttribute('width', eimg.clientWidth);
		canvas.setAttribute('height', eimg.clientHeight);
		eimg.parentNode.appendChild(canvas);
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);

		Caman(canvas, function () {
			this.threshold(90).render();
		});
	};
	img.src = eimg.src + '?rep=1';

	var inp = document.querySelector('#J_SecKill input.answer-input');
	if (inp) {
		inp.focus();
	}
}

// Get the start of time
ready(function() {
	var container = document.querySelector('#J_SecKill');
	if (!container) {
		return;
	}
	container.addEventListener('DOMSubtreeModified', function () {
		var status = getStatus();
		console.log("status", status);
		if (STATUS.NotReady === status) {
			reloadPage();
		} else if (STATUS.Ready === status) {
			refresh();
		} else if (STATUS.Question === status) {
			//processCaptcha();
		}
	}, false);
});
