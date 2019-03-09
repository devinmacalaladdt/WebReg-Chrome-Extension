//If we selected semesters already, hijack the courses information from browsing page

setInterval(events_handler, 500);

var hijacked_ = false;
var courses = [];
var registeredHTML = '';

function hijack_courses() {
	document.addEventListener("DZZ_HACK", function(e) {
		courses = e.detail;
	});
	var s = document.createElement("script");
	s.src = chrome.extension.getURL("injector.js");
	(document.head||document.documentElement).appendChild(s);
	s.onload = function() {
		s.remove();
	}
	console.log("Hijacked courses");
}

function events_handler() {
	if($("#termlocationlevelform").is(":hidden") && !$("#searchfilterscontent").is(":hidden")) {
		//Selected terms already
		if(!hijacked_) {
			hijack_courses();	//Hijack courses
			//Access registered course information
			chrome.runtime.sendMessage({query: 'getRegisteredHTML'}, function(response) {
				registeredHTML = response;
				console.log("Hijacked registeredHTML");
			});
			hijacked_ = true;
		}

		//Make sure that we have search results


	} else {
		if(!$("#termlocationlevelform").is(":hidden")) {
			//On the selecting terms directory
			//Click on the button
			$("#campus_NB").click();
			$("#level_U").click();
			$("#continueButton").click();
		}
	}
}