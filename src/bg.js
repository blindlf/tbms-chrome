chrome.webRequest.onCompleted.addListener(
	function(details) {
		chrome.tabs.sendMessage(details.tabId, {qstLoaded: true});
	}, {urls: ['*://m.ajax.taobao.com/qst.htm*', '*://gm.mmstat.com/tbrate*']}
);

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		// read `newIconPath` from request and read `tab.id` from sender
		chrome.browserAction.setIcon({
			path: request.newIconPath,
			tabId: sender.tab.id
		});
	}
);