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
        document.querySelector('#popup_usermenu').setAttribute('style', 'bottom: -200px;')

        document.querySelector('.g_user_balance').innerText = `${Number(Api.me.balance).toFixed(2)} ₽`
        document.querySelector('#email > i:nth-child(1)').innerText = Api.me.email

        document.querySelector('#createdAt > i:nth-child(1)').innerText = Api.me.accountCreatedAt.toLocaleString()
            .replace('T', ' ')
            .substring(0, 16)

        let cll = document.querySelector('input[name="change_load_limit"]')
            cll.placeholder = cll.value = Api.me.loadLimit
        let cmr = document.querySelector('input[name="change_max_resource_limit"]')
            cmr.placeholder = cmr.value = Api.me.maxResourceLimit

        document.querySelector('.logins-el > i:nth-child(1) > i:nth-child(2)').innerText = Api.me.email

        await Api.requestInfo()

        let projectsPopup = document.querySelector("#popup_select_project .g_popup .content")
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
    else window.location.href = '/'

})()

document.querySelector('#changePassword').onsubmit = async (e) => {
    e.preventDefault()

    let current_pas = document.querySelector('input[name="change_current_pass"]').value
    let password = document.querySelector('input[name="change_pass"]').value
    let passwordConfirm = document.querySelector('input[name="change_pass_confirm"]').value

    if(!password || !passwordConfirm || !current_pas)
        return document.querySelector('#changeError').innerText = 'Поле пароля не может быть пустым'

    if(password !== passwordConfirm)
        return document.querySelector('#changeError').innerText = 'Пароли не совпадают'

    let res = await Api.changePassword(current_pas, password)

    if(res instanceof Error)
        return (document.querySelector('#changeError').innerText = res.message)
        || (document.querySelector('#changeSuccessful').innerText = '')

    else
    {
        document.querySelector('#changeError').innerText = ''
        document.querySelector('#changeSuccessful').innerText = 'Пароль успешно изменен'
    }
}

document.querySelector('#updateSettings').onsubmit = async (e) => {
    e.preventDefault()

    let loadLimit = document.querySelector('input[name="change_load_limit"]').value
    let maxResource = document.querySelector('input[name="change_max_resource_limit"]').value


    let res = await Api.updateSettings(loadLimit, maxResource)

    if(res instanceof Error)
        return (document.querySelector('#updateError').innerText = res.message)
            || (document.querySelector('#updateSuccessful').innerText = '')

    else
    {
        document.querySelector('#updateError').innerText = ''
        document.querySelector('#updateSuccessful').innerText = 'Настройки успешно обновлены'
    }
}