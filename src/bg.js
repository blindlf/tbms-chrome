chrome.webRequest.onCompleted.addListener(
	function(details) {
		chrome.tabs.sendMessage(details.tabId, {qstLoaded: true});
	}, {urls: ['*://miaosha.taobao.com/*', '*://miao.item.taobao.com/*',
	'*://m.ajax.taobao.com/qst.htm*', '*://gm.mmstat.com/tbrate*']}
);

// TODO
