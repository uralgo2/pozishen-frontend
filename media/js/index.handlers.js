const openPopUpButton = document.querySelectorAll('button[data-action="select-project"]')

const popUp = document.querySelector("#popup_select_project")
const html = document.querySelector('html')

const togglePopUp = () => {
    if (html.getAttribute("data-popup-open") == "true") {
        popUp.classList.remove("show")
        html.setAttribute("data-popup-open", "false")
    } else {
        popUp.classList.add("show")
        html.setAttribute("data-popup-open", "true")
    }
}

openPopUpButton.forEach((e) => e.addEventListener('click', () => togglePopUp()));
(async () => {
    let isAuth = await Api.isAuthorized()

    if(isAuth) {
        document.querySelectorAll('.loggedButtons').forEach((e) => e.style = '')
        document.querySelector('.ui-dialog').remove()
        document.querySelector('.ui-widget-overlay').remove()
        document.querySelector('#popup_usermenu').setAttribute('style', 'bottom: -200px;')

        document.querySelector('.g_user_balance').innerText = `${Number(Api.me.balance).toFixed(2)} ₽`

        document.querySelector('.logins-el > i:nth-child(1) > i:nth-child(2)').innerText = Api.me.email

        let projectsPopup = document.querySelector("#popup_select_project .g_popup .content")

        await Api.requestInfo()

        if(!Api.projects.length)
            document.querySelector(".g_ellipsis").innerText = 'Нет проектов'
        Api.projects.map(project => {
            let li = document.createElement('li')

            li.innerHTML += `
                    <a href="/positions.html?id=${project.id}" data-id="${project.id}" data-user_id="${Api.me.id}" data-url="${project.siteAddress}"
                       data-right="11111111111111111111" data-on="1" title="${project.siteAddress}" class="g-active">
                        <i class="g_column">
                            <i class="name"> ${project.siteAddress}</i>
                            <i class="id g_comment">id ${project.id}</i>
                        </i>
                        <i class="more icon-any" data-top-popup="#popup_select_project_module" data-top-popup-use-original="1"
                           data-top-popup-p="2" data-top-popup-pos-by="fixed"></i>
                    </a>
                    <a href="https://${project.siteAddress}" class="icon-external_link url" target="_blank"></a>
        `
            projectsPopup.appendChild(li)
        })

    }
    else {
        document.querySelectorAll('.unloggedButtons').forEach((e) => e.style = '')
        init()
    }

})()

document.querySelector('form[name="auth"]').onsubmit = async (e) => {
    e.preventDefault()

    let email = document.querySelector('input[name="authorisation_login"]').value
    let password = document.querySelector('input[name="authorisation_pass"]').value

    let res = await Api.login(email, password)

    if(res instanceof Error)
        document.querySelector('#authError').innerText = res.message

    else
        window.location.href = '/projects.html'
}

document.querySelector('form[name="reg"]').onsubmit = async (e) => {
    e.preventDefault()

    let email = document.querySelector('form[name=\'reg\'] input[name=\'email\']').value
    let password = document.querySelector('input[name="registration_pass"]').value
    if(password === '')
        return document.querySelector('#regError').innerText = 'Пустое поле пароля'
    if(password !== document.querySelector('input[name="registration_pass_confirm"]').value)
        return document.querySelector('#regError').innerText = "Пароли не совпадают"

    let res = await Api.signup(email, password)

    if(res instanceof Error)
        document.querySelector('#regError').innerText = res.message

    else
        window.location.href = '/projects.html'
}

document.querySelector('form[name="forget"]').onsubmit = async (e) => {
    e.preventDefault()

    let email = document.querySelector('form[name=\'forget\'] input[name=\'email\']').value

    let res = await Api.restorePassword(email)

    if(res instanceof Error)
        document.querySelector('#restoreError').innerText = res.message

    else
        document.querySelector('#win_auth').setAttribute("tabindex", "2")
}