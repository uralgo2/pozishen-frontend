(async () => {
    let isAuth = await Api.isAuthorized()

    if(isAuth) {
        document.querySelectorAll('.loggedButtons').forEach((e) => e.style = '')
        document.querySelector('.ui-dialog').remove()
        document.querySelector('.ui-widget-overlay').remove()
        document.querySelector('#popup_usermenu').setAttribute('style', 'bottom: -200px;')

        document.querySelector('.g_user_balance').innerText = `${Number(Api.me.balance).toFixed(2)} ₽`

        document.querySelector('.logins-el > i:nth-child(1) > i:nth-child(2)').innerText = Api.me.email
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