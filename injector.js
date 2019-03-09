setTimeout(function() {
	document.dispatchEvent(new CustomEvent('DZZ_HACK', {
		detail: AppData.courses
	}))
})