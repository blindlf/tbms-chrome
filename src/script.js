function ready(fn) {
	if (document.readyState != 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

// Get the start of time
ready(function() {
	var eDate = document.querySelector('#J_SecKill span.date');
	var eTime = document.querySelector('#J_SecKill span.time');
	console.log(eDate, eTime);
	if (!eDate || !eTime) {
		return;
	}

	var sTime = eDate.textContent + ' ' + eTime.textContent;
	sTime = sTime.replace('年', '-').replace('月', '-').replace('日', '');
	var date = new Date(sTime);
	console.log(date);
});

function refreshed() {
	// TODO
	console.log('qst loaded');
}
