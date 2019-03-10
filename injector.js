original_filterservice_enablefilters = FilterService.enableFilters;
FilterService.enableFilters = function() {
    original_filterservice_enablefilters();
    document.dispatchEvent(new CustomEvent('DZZ_HACK', {
		detail: {
			currentCourses: AppData.currentCourses
		}
	}));
}
