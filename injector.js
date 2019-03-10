setInterval(function() {
	document.dispatchEvent(new CustomEvent('DZZ_HACK', {
		detail: { 
			courses: AppData.courses,
			currentCourses: AppData.currentCourses
		}
	}));
}, 1000);