function init() {
    let authButtons = document.querySelectorAll('[data-button-type="auth"]')
    let regButtons = document.querySelectorAll('[data-button-type="reg"]')

    const html = document.querySelector('html')
    const dialog = document.querySelector('#win_auth')

    const closeButtons = dialog.querySelectorAll('[data-popup-action="close"]')
    const closePopUp = () => {
        html.setAttribute("data-popup-open", "false")
        dialog.setAttribute("tabindex", "-1")
        dialog.setAttribute("data-select-open", "false")
    }
    closeButtons.forEach((button) => button.addEventListener('click', () => closePopUp()))

    const toggleSelectButtons = dialog.querySelectorAll('[data-popup-action="select-toggle"]')
    const toggleSelect = () => {
        if (dialog.getAttribute("data-select-open") === "true") dialog.setAttribute("data-select-open", "false")
        else dialog.setAttribute("data-select-open", "true")
    }
    toggleSelectButtons.forEach((button) => button.addEventListener('click', () => toggleSelect()))

    const changePopUpContent = document.querySelectorAll('[data-to-view]')
    changePopUpContent.forEach((e) => {
        e.addEventListener('click', () => {
            switch (e.getAttribute("data-to-view")) {
                case "win_auth-auth": {
                    dialog.setAttribute("tabindex", "0")
                    break
                }
                case "win_auth-reg": {
                    dialog.setAttribute("tabindex", "1")
                    break
                }
                case "win_auth-forget": {
                    dialog.setAttribute("tabindex", "3")
                    break
                }
            }
            dialog.setAttribute("data-select-open", "false")
        })
    })

    authButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (html.getAttribute("data-popup-open") === "true") {

            } else {
                html.setAttribute("data-popup-open", "true")
                dialog.setAttribute("tabindex", "0")
            }
        })
    })

    regButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (html.getAttribute("data-popup-open") === "true") {

            } else {
                html.setAttribute("data-popup-open", "true")
                dialog.setAttribute("tabindex", "1")
            }
        })
    })
}

