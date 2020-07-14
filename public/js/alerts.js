export const hideAlert = () => {
	const el = document.querySelector('.alert')
	if (el) el.parentElement.removeChild(el)
}

export const displayAlert = (successOrError, msg, time = 7) => {
    hideAlert()
	const markup = `<div class="alert alert--${successOrError}">${msg}</div>`
	document
		.querySelector('body')
        .insertAdjacentHTML('afterbegin', markup)
    window.setTimeout(hideAlert, time * 1000)
}
