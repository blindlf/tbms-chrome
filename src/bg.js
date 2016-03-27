chrome.webRequest.onCompleted.addListener(function(a) {
	console.log(a);
//}, 'http://m.ajax.taobao.com/qst.htm*');
}, {urls: ['*://miaosha.taobao.com/*', '*://miao.item.taobao.com/*']});
