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
const citiesList = document.querySelector('#citiesList')
const selectedCitiesList = document.querySelector('#selectedCities')

const closeCitiesList = () => citiesList.hidden = true
const openCitiesList = () => citiesList.hidden = false

let data = {
    cities: new Set(),
    days: new Set(),
    searchers: new Set(),
    siteAddress: '',
    parsingTime: '',
    range: '100',
    projectId: 0
}

const toggleDay = (day) => {
    let el = document.querySelector(`#${day}`)
    el.hidden = !el.hidden
    if(el.classList.contains('selected'))
    {
        data.days.delete(day)
        el.classList.remove('selected')
    }
    else {
        el.classList.add('selected')
        data.days.add(day)
    }
}
openPopUpButton.forEach((e) => e.addEventListener('click', () => togglePopUp()));

(async () => {
    let isAuth = await Api.isAuthorized()

    if(isAuth) {
        document.querySelector('#popup_usermenu').setAttribute('style', 'bottom: -200px;')

        document.querySelector('.g_user_balance').innerText = `${Number(Api.me.balance).toFixed(2)} ₽`

        document.querySelector('.logins-el > i:nth-child(1) > i:nth-child(2)').innerText = Api.me.email

        let cityInput = document.querySelector('#cityInput')
        cityInput.onblur = async(e) => setTimeout(closeCitiesList, 200)
        cityInput.onfocus = async (e) => {
            if(!!e.target.value)
                openCitiesList(e.target.value)
        }
        cityInput.oninput = async (e) => {
            await showCities(e.target.value)
        }

        await Api.requestInfo()

        let projectsPopup = document.querySelector("#popup_select_project .g_popup .content")

        let searchParams = new URL(window.location.href).searchParams
        if(Api.projects.length) {
            let id
            if((id = Number(searchParams.get('id')))){
                await selectProject(Api.projects.find((p) => p.id === id))
            }
            else
                await selectProject(Api.projects[0])
        }
        else {
            document.querySelector(".g_ellipsis").innerText = 'Нет проектов'
            document.querySelector('#createProject').hidden = true
        }
        Api.projects.map(project => {
            let li = document.createElement('li')

            li.innerHTML += `
                <a href="#" data-id="${project.id}" data-user_id="${Api.me.id}" data-url="${project.siteAddress}"
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
            li.onclick = async (e) => await selectProject(project)
            projectsPopup.appendChild(li)
        })
    }
    else window.location.href = '/'

})()

async function showCities (search)
{
    let list = document.querySelector('#citiesListContent')
    list.innerHTML = ''
    let cities = (await Api.searchCities(search)).filter((city) => !data.cities.has(city.name))
    if(cities.length) openCitiesList()
    let cityInput = document.querySelector('#cityInput')
    cityInput.onkeydown = async (e) => {
        if(e.keyCode === 13){
            if(cities.length){
                cityInput.value = ''
                await addCity(cities[0].name)
                await showCities()
            }
        }
    }
    for(let i = 0; i < cities.length; i++){
        let city = cities[i]
        let row = document.createElement('li')

        row.innerHTML = `
                                <a class="cityItem g-active">
                                    <i class="g_column">
                                        <i class="name">${city.name}</i>
                                    </i>
                                </a>
        `
        row.onclick = async (e) => {
            closeCitiesList()
            cityInput.value = ''
            await addCity(city.name)
        }

        list.append(row)
    }
}
async function addCity(city){

    selectedCitiesList.innerHTML +=
        `
            <div id="${city}" class="selected_city">${city}&nbsp;<i class="delete" onclick="removeCity('${city}')" title="Удалить">×</i></div>
        `
    data.cities.add(city)

}
async function removeCity(city){
    document.querySelector(`#${city}`).remove()
    data.cities.delete(city)
}

document.querySelector('#createProject').onsubmit = async (e) => {
    e.preventDefault()

    let error = document.querySelector('#addProjectError')
    let successful = document.querySelector('#updateProjectSuccessful')
    data.siteAddress = domainFromUrl(document.querySelector('#siteAddress').value)

    if(document.querySelector('#yandexSearcher').checked)
        data.searchers.add('yandex')
    if(document.querySelector('#googleSearcher').checked)
        data.searchers.add('google')

    data.parsingTime = document.querySelector('#timePicker').value

    if(!!!data.siteAddress)
        return error.innerText = 'Поле адреса сайта не может быть пустым'
    if(!data.siteAddress.includes('.'))
        return error.innerText = 'Некорректный адрес сайта'
    if(!data.searchers.size)
        return error.innerText = 'Выберите покрайней мере один поисковик'
    if(!data.cities.size)
        return error.innerText = 'Выберите хотя бы один город'
    if(!!!data.parsingTime)
        return error.innerText = 'Выберите время'
    if(!data.days.size)
        return error.innerText = 'Выберите хотя бы один день'

    let res = await Api.updateProject(data.projectId, data.siteAddress, data.searchers, data.range, data.parsingTime, data.days, data.cities)

    if(res instanceof Error) {
        successful.innerText = ''
        return error.innerText = res.message
    }
    else {
        successful.innerText = 'Проект успешно обновлен'
        error.innerText = ''
    }
}

/**
 * @param project {Project}
 * @returns {Promise<void>}
 */
async function selectProject(project){
    let cities = await Api.getCities(project.id)

    data.cities = new Set(cities.map(obj => obj.cityName))


    let days = document.getElementsByClassName('day')

    for(let day of days)
        day.classList.remove('selected')
    project.parsingDays.split(',').map((d) => toggleDay(d))

    data.searchers = new Set(project.searchEngine.split(','))
    data.range = project.searchingRange
    data.projectId = project.id
    data.parsingTime = project.parsingTime
    data.siteAddress = project.siteAddress

    document.querySelector('#siteAddress').value = data.siteAddress
    document.querySelector('#timePicker').value = data.parsingTime

    document.querySelector('#yandexSearcher').checked = data.searchers.has('yandex')
    document.querySelector('#googleSearcher').checked = data.searchers.has('google')

    document.querySelector('#depthSelect').selectedIndex = data.range === '100' ? 0 : 1

    selectedCitiesList.innerHTML = ''
    for(let i = 0; i < cities.length; i++){
        let city = cities[i].cityName
        selectedCitiesList.innerHTML +=
            `
            <div id="${city}" class="selected_city">${city}&nbsp;<i class="delete" onclick="removeCity('${city}')" title="Удалить">×</i></div>
        `
    }
}

function domainFromUrl(url) {
    let result
    let match
    if (match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im)) {
        result = match[1]
        if (match = result.match(/^[^\.]+\.(.+\..+)$/)) {
            result = match[1]
        }
    }
    return result
}