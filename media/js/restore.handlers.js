let hash = ''
init();
(async () => {
    let isAuth = await Api.isAuthorized()

    let searchParams = new URL(window.location.href).searchParams
    hash = searchParams.get('hash')

    if(isAuth || !hash)
        return window.location.href = '/'

})()

document.querySelector('#changePassword').onsubmit = async (e) => {
    e.preventDefault()

    let password = document.querySelector('input[name="change_pass"]').value
    let passwordConfirm = document.querySelector('input[name="change_pass_confirm"]').value

    if(!password || !passwordConfirm)
        return document.querySelector('#changeError').innerText = 'Поле пароля не может быть пустым'

    if(password !== passwordConfirm)
        return document.querySelector('#changeError').innerText = 'Пароли не совпадают'

    let res = await Api.restoreChange(hash, password)

    if(res instanceof Error)
        return (document.querySelector('#changeError').innerText = res.message)
    else
        window.location = '/projects.html'
}

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