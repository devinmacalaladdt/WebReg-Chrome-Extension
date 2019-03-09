chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){

	if(request.todo=="showPageAction"){

		chrome.tabs.query({active:true,currentWindow:true},function(tabs){
		
			chrome.pageAction.show(tabs[0].id);

		});

		$("iframe-wrapper iframe").contents().find(".instructors").css("color","blue");

	}

});

