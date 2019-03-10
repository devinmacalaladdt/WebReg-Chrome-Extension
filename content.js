//If we selected semesters already, hijack the courses information from browsing page

chrome.runtime.sendMessage({todo: "showPageAction"});

var hijacked_ = false;
var courses = [];
var registeredIndexes = [];
var currentCourses = [];
var registeredHTML = '';
var injector = chrome.extension.getURL("injector.js");

document.addEventListener("DZZ_HACK", function(e) {
                        console.log("Change detected");
                        currentCourses = e.detail["currentCourses"];    //Keep hijacking current Courses
                        overlapping();
                        generate_links();
                });

document.addEventListener("DZZ_HACK_COURSES", function(e) {
                    courses = e.detail;  //Hijack courses once only
                });

document.addEventListener("DZZ_HACK_INIT", function(e) {
                    //On the selecting terms directory
                    //Click on the button
                    chrome.storage.sync.get("checked_list",function(to_check_str){
                        if(jQuery.isEmptyObject(to_check_str)) {
                               window.open(chrome.extension.getURL('options.html'));
                            return;
                        }
                        var str = to_check_str['checked_list'];
                        str = str.split(";");
                        var count;
                        for(count = 0;count<str.length-1;count++){
                            if($("#"+str[count]).prop("checked")!=true){
                                $("#"+str[count]).click();
                            }
                        }
                        $("#continueButton").click();
                    });
                });

function hijack() {
    var s = document.createElement("script");
    s.src = injector;
    (document.head||document.documentElement).appendChild(s);
    s.onload = function() {
        s.remove();
    }
}

function sectionByIndex(idx) {
    for(i = 0;i < courses.length;i++) {
        for(j = 0;j< courses[i]['sections'].length;j++) {
            if(courses[i]['sections'][j]['index'] == idx)
                return courses[i]['sections'][j];
        }
    }
    return null;
}

function overlapping() {
    //$(".sectionData", $("#courseDataParent").children()[0])[0]
    //above is the CSS selector
    if(currentCourses == null)
        return;
    for(i = 0;i<registeredIndexes.length;i++) {
        section = sectionByIndex(registeredIndexes[i]);
        for(j = 0;j<currentCourses.length;j++) {
            nextSection: for(k = 0;k<currentCourses[j]['sections'].length;k++) {
                currentSection = currentCourses[j]['sections'][k];
                for(m = 0;m < currentSection['meetingTimes'].length;m++) {
                    for(n = 0;n < section['meetingTimes'].length;n++) {
                        if(currentSection['meetingTimes'][m]['meetingDay'] == section['meetingTimes'][n]['meetingDay']) {
                            //Meets at the same day
                            sectionStartTime = parseInt(section['meetingTimes'][n]['startTimeMilitary']);
                            sectionEndTime = parseInt(section['meetingTimes'][n]['endTimeMilitary']);
                            currentSectionStartTime = parseInt(currentSection['meetingTimes'][m]['startTimeMilitary']);
                            currentSectionEndTime = parseInt(currentSection['meetingTimes'][m]['startTimeMilitary']);
                            if(sectionStartTime > currentSectionStartTime) {
                                startTime = sectionStartTime;
                                endTime = currentSectionEndTime;
                            } else {
                                startTime = currentSectionStartTime;
                                endTime = sectionEndTime;
                            }
                            if(currentSection['meetingTimes'][m]['CampusAbbrev'] != section['meetingTimes'][n]['CampusAbbrev']) {
                                offset = 20;
                            } else {
                                offset = 0;
                            }
                            if(startTime < endTime + offset) {
                                //Conflict detected 
                                $($(".sectionData", $("#courseDataParent").children()[j])[k]).css('background-color', '#ffd3d3');
                                continue nextSection;
                            }
                        }
                    }
                    
                }

            }
        }
    }
}

function go() {
        hijack();   //Hijack courses
        //Access registered course information
        chrome.runtime.sendMessage({query: 'getRegisteredHTML'}, function(response) {
            registeredHTML = response;
            console.log("Hijacked registeredHTML");
            $("[title='Course Index Number']", registeredHTML).each(function() {
                registeredIndexes.push($(this).text().slice(1, -1));
            });
        });
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

go();
