chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.query == 'getRegisteredHTML') {
			var url = 'https://sims.rutgers.edu/webreg/editSchedule.htm';
			fetch(url).then(response => response.text()).then(text => sendResponse(text));
			return true;
		}
	});