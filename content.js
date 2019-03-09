chrome.runtime.sendMessage({todo: "showPageAction"});
var interval = setInterval(generate_links,500);

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
