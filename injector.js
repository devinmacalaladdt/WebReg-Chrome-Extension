original_filterservice_enablefilters = FilterService.enableFilters;
FilterService.enableFilters = function() {
    original_filterservice_enablefilters();
    document.dispatchEvent(new CustomEvent('DZZ_HACK', {
		detail: {
			currentCourses: AppData.currentCourses
		}
	}));
}

original_formservice_initPage = FormService.initPage;
FormService.initPage = function() {
	original_formservice_initPage();
	document.dispatchEvent(new CustomEvent('DZZ_HACK_INIT', {
	}));
}

CourseDownloadService = (function() {
	var _handleCallbacks = function() {
		dojo.forEach(AppData.callbacks, function(item) {
			item();
		});
	};
	var _postProcessOpenSections = function() {
		// merge open sections
		var openSections = [];
		dojo.forEach(AppData._openSections, function(item) {
			Array.prototype.push.apply(openSections, item);
		});
		// set AppData.openSections
		AppData.openSections = openSections;
		// reset AppData._openSections
		AppData._openSections = [];
	};
	var _postProcessCourseData = function() {
		// post process open sections
		_postProcessOpenSections();
		// merge courses
		var courses = [];
		dojo.forEach(AppData._courses, function(item) {
			Array.prototype.push.apply(courses, item);
		});
		// filter courses based on search type
		var coursesFiltered;
		// school search
		if (AppData.searchType == AppConstants.SEARCH_SCHOOL) {
			// no filtering
			coursesFiltered = courses;
		}
		// course section search
		else if (AppData.searchType == AppConstants.SEARCH_COURSE_SECTION) {
			// no filtering
			coursesFiltered = courses;
		}
		else if (AppData.searchType == AppConstants.SEARCH_UNIT_SUBJECT_COURSE) {
			// no filtering
			coursesFiltered = courses;
		}
		// location search
		else {
			// filter courses by level
			coursesFiltered = CourseFilterUtils.filterCoursesByLevel(courses, AppData.selectedLevel);
		}
		// set AppData.courses
		AppData.courses = coursesFiltered;
		// reset AppData._courses
		AppData._courses = [];
		// get current school codes
		var currentSchoolCodes = SchoolUtils.getSchoolCodesFromCourses(AppData.courses);
		AppData.currentSchoolCodes = currentSchoolCodes;

		document.dispatchEvent(new CustomEvent('DZZ_HACK_COURSES', {
			detail: AppData.courses
		}));
	};
	var _buildAjaxSettingsForLocationSearch = function(year, term, campus) {
		// split campuses
		var campuses = campus.split(",");
		// build ajax data objects
		var ajaxDataItems = [];
		// foreach campus
		dojo.forEach(campuses, function(item) {
			// build data
			var data = { year:year, term:term, campus:item };
			// add to array
			ajaxDataItems.push(data);
		});
		// build ajax settings
		var ajaxSettings = _buildAjaxSettings(ajaxDataItems, AppConstants.URL_COURSES_GZ, AppConstants.URL_OPEN_SECTIONS_GZ);
		return ajaxSettings;
	};
	var _buildAjaxSettingsForSchoolSearch = function(year, term, school) {
		// build ajax data objects
		var ajaxDataItems = [];
		// build data
		var data = { year:year, term:term, school:school };
		// add to array
		ajaxDataItems.push(data);
		// build ajax settings
		var ajaxSettings = _buildAjaxSettings(ajaxDataItems, AppConstants.URL_COURSES_FOR_SCHOOL_GZ, AppConstants.URL_OPEN_SECTIONS_FOR_SCHOOL_GZ);
		return ajaxSettings;
	};
	var _buildAjaxSettingsForCourseSectionSearch = function(year, term, index) {
		// build ajax data objects
		var ajaxDataItems = [];
		// split campuses
		var campuses = AppData.selectedCampus.split(",");
		// foreach campus
		dojo.forEach(campuses, function(item) {
			// build data
			var data = { year:year, term:term, campus:item };
			// add to array
			ajaxDataItems.push(data);
		});
		// build ajax settings
		var ajaxSettings = _buildAjaxSettings(ajaxDataItems, AppConstants.URL_COURSES_GZ, AppConstants.URL_OPEN_SECTIONS_GZ);
		return ajaxSettings;
	};
	var _buildAjaxSettingsForUnitSubjectCourseSearch = function(year, term, campus, unit, subject, courseNumber) {
		// build ajax data objects
		var ajaxDataItems = [];
		// build data
		var data = { year:year, term:term, campus:campus };
		// add to array
		ajaxDataItems.push(data);
		// build ajax settings
		var ajaxSettings = _buildAjaxSettings(ajaxDataItems, AppConstants.URL_COURSES_GZ, AppConstants.URL_OPEN_SECTIONS_GZ);
		return ajaxSettings;
	};
	var _buildAjaxSettings = function(ajaxDataItems, coursesUrl, openSectionsUrl) {
		// build ajax settings
		var ajaxSettings = [];
		// foreach ajaxDataItems
		dojo.forEach(ajaxDataItems, function(item) {
			// build ajax settings for course
			var courseSettings = { type:"GET", url:coursesUrl, data:item, dataType:"text", success:_ajaxSuccessFunctionForCourses };
			ajaxSettings.push(courseSettings);
			// build ajax settings for open sections
			var openSectionsSettings = { type:"GET", url:openSectionsUrl, data:item, dataType:"text", success:_ajaxSuccessFunctionForOpenSections, error:_ajaxErrorFunctionForOpenSections };
			ajaxSettings.push(openSectionsSettings);	
			// add openSections ajax settings to 2nd array
			AppData.ajaxSettingsForOpenSectionsRefresh.push(openSectionsSettings);
		});
		return ajaxSettings;
	};
	var _ajaxSuccessFunctionForCourses = function(text) {
		// parse json
		var courses = JSON.parse(text);
		// add to AppData
		AppData._courses.push(courses);
	};
	var _ajaxSuccessFunctionForOpenSections= function(text) {
		// parse json
		var openSections = JSON.parse(text);
		// add to AppData
		AppData._openSections.push(openSections);
	};
	var _ajaxErrorFunctionForOpenSections = function(e) {
		// only handle once
		if (AppData.errorHandled == true) return;
		AppData.errorHandled = true;
		// log error
		console.error(e);
		// clear download progress interval
		clearInterval(AppData.interval2);
		// show existing courses
		CourseService.initCoursesFinish();
	};
	return {
		// downloadCourses
		downloadCourses: function(callbacks) {
			AppData.callbacks = callbacks;
			// check if courses exist
			if (AppData.courses && AppData.courses.length > 0) {
				// skip if search by location
				if (AppData.searchType == AppConstants.SEARCH_LOCATION) {
					_handleCallbacks();
					return;
				}
			}
			// reset AppData.ajaxSettingsForOpenSectionsRefresh
			AppData.ajaxSettingsForOpenSectionsRefresh = [];
			// get parameters
			var year = AppData.selectedSemesterYear;
			var term = AppData.selectedSemesterTerm;
			var campus = AppData.selectedCampus;
			var school = AppData.selectedSchool;
			var index = AppData.selectedIndex;
			var unit = AppData.selectedUnit;
			var subject = AppData.selectedSubject;
			var courseNumber = AppData.selectedCourseNumber;
			// get ajax settings
			var ajaxSettings = [];
			// school search
			if (AppData.searchType == AppConstants.SEARCH_SCHOOL) {
				ajaxSettings = _buildAjaxSettingsForSchoolSearch(year, term, school);
			}
			// course section
			else if (AppData.searchType == AppConstants.SEARCH_COURSE_SECTION) {
				ajaxSettings = _buildAjaxSettingsForCourseSectionSearch(year, term, index);
			}
			// unit subject course
			else if (AppData.searchType == AppConstants.SEARCH_UNIT_SUBJECT_COURSE) {
				ajaxSettings = _buildAjaxSettingsForUnitSubjectCourseSearch(year, term, campus, unit, subject, courseNumber);
			}
			// location search
			else {
				ajaxSettings = _buildAjaxSettingsForLocationSearch(year, term, campus);
			}
			// set AppData.ajaxSettings
			AppData.ajaxSettings = ajaxSettings;
			// make ajax calls
			dojo.forEach(ajaxSettings, function(item) {
				$.ajax(item);
			});
			// create thread to check download progress
			var interval = setInterval(CourseDownloadService.verifyDownloadProgress, 250);
			AppData.interval = interval;
		},
		// verifyDownloadProgress
		verifyDownloadProgress: function() {
			var settingsLength = AppData.ajaxSettings.length;
			var downloadedLength = AppData._courses.length + AppData._openSections.length;
			if (settingsLength == downloadedLength) {
				clearInterval(AppData.interval);
				// downloads finished, post process course data and handle callbacks
				_postProcessCourseData();
				_handleCallbacks();
			}
		},
		// refreshOpenSections
		refreshOpenSections: function() {
			// init error status
			AppData.errorHandled = false;
			// make ajax calls
			dojo.forEach(AppData.ajaxSettingsForOpenSectionsRefresh, function(item) {
				$.ajax(item);
			});
			// create thread to check download progress
			var interval = setInterval(CourseDownloadService.verifyDownloadProgressForOpenSectionsRefresh, 250);
			AppData.interval2 = interval;
		},
		// verifyDownloadProgressForOpenSectionsRefresh
		verifyDownloadProgressForOpenSectionsRefresh: function() {
			var settingsLength = AppData.ajaxSettingsForOpenSectionsRefresh.length;
			var downloadedLength = AppData._openSections.length;
			if (settingsLength == downloadedLength) {
				clearInterval(AppData.interval2);
				// downloads finished, post process open sections data
				_postProcessOpenSections();
				// finish initializing courses
				CourseService.initCoursesFinish();
			}
		}
	};
})();