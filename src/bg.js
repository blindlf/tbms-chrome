chrome.webRequest.onCompleted.addListener(
	function(details) {
		chrome.tabs.sendMessage(details.tabId, {qst: details.url});
	}, {urls: ['*://m.ajax.taobao.com/qst.htm*']}
);

chrome.webRequest.onCompleted.addListener(
	function(details) {
		if (details.url.indexOf('rep=1')>=0) {
			return;
		}
		chrome.tabs.sendMessage(details.tabId, {captcha: details.url});
	}, {urls: ['*://img1.tbcdn.cn/tfscom/TB1*']}
);

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		// read `newIconPath` from request and read `tab.id` from sender
		if (request.iconPath) {
			chrome.browserAction.setIcon({
				path: request.iconPath,
				tabId: sender.tab.id
			});
		} else if (request.badgeText) {
			chrome.browserAction.setBadgeText({
				text: request.badgeText,
				tabId: sender.tab.id
			});
		}
	}
);
