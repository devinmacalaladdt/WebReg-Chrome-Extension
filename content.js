//If we selected semesters already, hijack the courses information from browsing page

chrome.runtime.sendMessage({todo: "showPageAction"});
var interval = setInterval(events_handler, 700);

var hijacked_ = false;
var hijacked_course_ = false;
var courses = [];
var currentCourses = [];
var registeredHTML = '';
var injector = chrome.extension.getURL("injector.js");

function isSameCourses(a, b) {
    if(a == null && b == null) {
        return true;
    }
    if((a != null && b == null) || (a == null && b != null))
        return false;
    if(a.length != b.length)
        return false;
    for(i=0;i<a.length;i++) {
        if(a[i]["courseString"] != b[i]["courseString"])
            return false;
    }
    return true;
}

document.addEventListener("DZZ_HACK", function(e) {
                    if(!hijacked_course_) {
                        courses = e.detail["courses"];  //Hijack courses once only
                        hijacked_course_ = true;
                    }
                    if(!isSameCourses(currentCourses, e.detail["currentCourses"])) {
                        console.log("Change detected");
                        currentCourses = e.detail["currentCourses"];    //Keep hijacking current Courses
                        generate_links();
                    }
                });

function hijack_courses() {
    var s = document.createElement("script");
    s.src = injector;
    (document.head||document.documentElement).appendChild(s);
    s.onload = function() {
        s.remove();
    }
}

function events_handler() {
    if($("#termlocationlevelform").is(":hidden") && !$("#searchfilterscontent").is(":hidden")) {
        //Selected terms already
        if(!hijacked_) {
            hijack_courses();   //Hijack courses
            //Access registered course information
            chrome.runtime.sendMessage({query: 'getRegisteredHTML'}, function(response) {
                registeredHTML = response;
                console.log("Hijacked registeredHTML");
                console.log("User registered for following courses: ");
                $("[title='Course Index Number']", registeredHTML).each(function() {
                    console.log($(this).text().slice(1, -1));
                });
            });
            hijacked_ = true;
            clearInterval(interval);    //Mission finished
        }
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
