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
        document.querySelector('#downloadClientBtn').href = 'https://pozishen.ru/api/getClient?c=' + Api.secret
        document.querySelector('#popup_usermenu').setAttribute('style', 'bottom: -200px;')

        document.querySelector('.g_user_balance').innerText = `${Number(Api.me.balance).toFixed(2)} ₽`

        document.querySelector('.logins-el > i:nth-child(1) > i:nth-child(2)').innerText = Api.me.email

        await Api.requestInfo()
        let projectsList = document.querySelector('.top_longlist_fixed_column')

        let projectsPopup = document.querySelector("#popup_select_project .g_popup .content")

        if(!Api.projects.length)
            document.querySelector(".g_ellipsis").innerText = 'Нет проектов'
        let projectsHtml = ''
        let projectHtml = ''
        for(let project of Api.projects){
            let row = document.createElement('longlist_row')

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

            row.innerHTML =
                `            <longlist_cell data-name="cb" class="top_longlist_fixed_column_cell">
                                <i class="main">
                                    <i class="name">
                                        <i class="name_val">
                                            <a href="/positions.html?id=${project.id}">${project.siteAddress}</a>
                                        </i>
                                    </i>
                                    <input class="name_edit" type="text">
                                </i>
                            </longlist_cell>
                            <longlist_cell data-name="positions_time">
                                <i class="date">
                                    ${project.lastCollection == '-' ? 'По таймеру' : formatDate(new Date(project.lastCollection))}
                                </i>
                            </longlist_cell>
                            <longlist_cell data-name="positions_time">
                                <i id="projectUpdate${project.id}" onclick="collect(${project.id})" class="icon-refresh update" data-top-popup="#popup_project_update" data-top-popup-p="2" title="Запустить проверку"></i>
                            </longlist_cell>
                            <longlist_cell data-name="count_keywords">
                                <a href="/requests-new.html?id=${project.id}">${project.queriesCount}</a>
                            </longlist_cell>
                `
            projectsHtml += row.outerHTML
            projectHtml += li.outerHTML
        }
        projectsList.innerHTML = projectsHtml
        projectsPopup.innerHTML = projectHtml
    }
    else window.location.href = '/'

})()
function formatDate(date) {

    let dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    let mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    let yy = date.getFullYear() % 100;
    if (yy < 10) yy = '0' + yy;

    return dd + '.' + mm + '.' + yy;
}

async function collect(id){
    let el = document.getElementById(`projectUpdate${id}`)

    if(el.disabled)
        return

    el.setAttribute('data-disabled', '1')
    el.setAttribute('disabled', 'true')
    el.title = 'Идет сбор'

    await Api.collect(id)

    setTimeout( () => {
        el.removeAttribute('data-disabled')
        el.removeAttribute('disabled')
        el.title = 'Запустить проверку'
    }, 20000)
}
