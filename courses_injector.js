setTimeout(function() {
	document.dispatchEvent(new CustomEvent('DZZ_HACK_COURSES', {
		detail: AppData.courses
	}))
})