function ready(fn) {
	if (document.readyState != 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

// Change icon and text
function enableMe() {
	chrome.runtime.sendMessage({'enableMe': true});
}
function setBadgeText(text) {
	chrome.runtime.sendMessage({'badgeText': text});
}
function log() {
	var text = '';
	for (i=0; i<arguments.length; i++) {
		text += arguments[i] + ' ';
	}
	text = text.trim();

	var container = document.querySelector('#J_SecKill');
	if (!container) {
		console.log(text);
		return;
	}

	var id = 'tbms-msg';
	var logger = document.querySelector('#'+id);
	if (!logger) {
		// logger and aspect
		logger = document.createElement('div');
		container.parentNode.insertBefore(logger, container);
		logger.setAttribute('id', id);
		logger.style.fontSize = '12px';
		logger.style.color = 'black';
		logger.style.paddingLeft = '12px';
		logger.style.position = "relative";
		logger.style.top = "8px";
	}
	logger.textContent = text;
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
	if (null != document.querySelector(
				'#J_SecKill .upper-begun, #J_SecKill .upper-scan')) {
		// class .not-ready also presence
		return STATUS.NotAvailable;
	}
	if (null != document.querySelector('#J_SecKill .need-login')) {
		return STATUS.RequireLogin;
	}
	if (null != document.querySelector('#J_SecKill .not-ready')) {
		return STATUS.NotReady;
	}
	if (null != document.querySelector(
				'#J_SecKill .sk-button:not(.J_RefreshStatus)')) {
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
		log('距秒杀还有', getEtaSecs(), '秒');
		if (getEtaSecs() < 300) {
			window.location.reload();
		} else {
			reloadPage();
		}
	}, 5000);
	enableMe();
	setBadgeText('W');
	log('等待秒杀开始', parseInt(getEtaSecs()/60), '分钟');
}

// 刷新抢宝
function refresh() {
	log('距秒杀还有', getEtaSecs(), '秒');
	enableMe();
	if (getEtaSecs() <= 5.0) {
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
	event.initEvent('click', true, true);
	// *://img1.tbcdn.cn/tfscom/TB1* should be requested
	btn.dispatchEvent(event);
	setBadgeText('H');
	log('距秒杀还有', getEtaSecs(), '秒');
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
	if (document.querySelector('#J_SecKill svg')) {
		return;
	}
	setBadgeText('A');

	// Draw
	var src = eimg.src + '?rep=1';
	var html = '';
	html += '<svg width="320" height="70"\n';
	html += '		xmlns="http://www.w3.org/2000/svg"\n';
	html += '		xmlns:xlink="http://www.w3.org/1999/xlink">\n';
	html += '	<defs>\n';
	html += '		<filter id="clearCaptcha" color-interpolation-filters="sRGB">\n';
	html += '			<feComponentTransfer in="SourceGraphic" result="invert">\n';
	html += '				<feFuncA type="identity" />\n';
	html += '				<feFuncR type="linear" slope="-1" intercept="1" />\n';
	html += '				<feFuncG type="linear" slope="-1" intercept="1" />\n';
	html += '				<feFuncB type="linear" slope="-1" intercept="1" />\n';
	html += '			</feComponentTransfer>\n';
	html += '			<feGaussianBlur in="invert" stdDeviation="4"/>\n';
	html += '		</filter>\n';
	html += '	</defs>\n';
	html += '	<g>\n';
	html += '		<image id="captcha" width="320" height="70"\n';
	html += '				xlink:href="'+src+'"></image>\n';
	html += '		<use xlink:href="#captcha" style="mix-blend-mode: color-dodge" filter="url(#clearCaptcha)"/>\n';
	html += '	</g>\n';
	html += '</svg>\n';

	var container = document.createElement('div');
	container.innerHTML = html;
	if (container.firstChild) {
		eimg.parentNode.appendChild(container.firstChild);
	}

	var inp = document.querySelector('#J_SecKill input.answer-input');
	if (inp) {
		// input box aspect
		inp.style.fontSize = '18px';
		inp.style.height = '30px';
		inp.style.color = 'black';
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
		if (STATUS.NotReady === status) {
			reloadPage();
		} else if (STATUS.Ready === status) {
			refresh();
		} else if (STATUS.Expired === status) {
			log('秒杀已结束，当前时间', (new Date()).toLocaleTimeString());
		}
	}, false);
});
