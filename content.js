//If we selected semesters already, hijack the courses information from browsing page

chrome.runtime.sendMessage({todo: "showPageAction"});
setInterval(events_handler, 500);
setInterval(generate_links, 500);   //This repeatly checks if the links added yet

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

function generate_links(){

	if($("a").hasClass("instructor_link")){
		return;
	}

	$(".instructors").each(function(){
		var name = $(this).text();
		$(this).text("");
		name = name.toLowerCase();

		var names = name.split(";");

		var count = 0;
		for(count = 0;count<names.length;count++){
			$(this).append("<a class=\"instructor_link\" href=\"http://www.google.com/search?q="+names[count]+"+rutgers+rate+my+professors"+"\" target=\"_blank\">"+names[count]+"</a>");
		}
	});


}
