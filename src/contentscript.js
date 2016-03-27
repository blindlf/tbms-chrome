var script = document.createElement('script');
script.src = chrome.extension.getURL('script.js');
script.onload = function() {
	this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(script);

function execCode(injectedCode) {
	var script = document.createElement('script');
	script.onload = function() {
		this.parentNode.removeChild(this);
	};
	script.appendChild(document.createTextNode(injectedCode));
	(document.body || document.head || document.documentElement)
		.appendChild(script);
}

chrome.runtime.onMessage.addListener(
	function(request, sender) {
		console.log("message received", request, typeof refreshed);
		if (request.qstLoaded) {
			execCode("if (typeof refreshed == 'function') refreshed();");
		}
	}
);
