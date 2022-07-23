let data = {}

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


const searchOpen = document.querySelector('.search_phrase_open')
const searchInput = document.querySelector('.g_input-search_phrase_string > input:nth-child(1)')

document.querySelector('.search_phrase').onclick
    = (e) => {
    searchOpen.style.removeProperty('display')
    searchInput.focus()
}

searchInput.oninput
    = async (e) => await selectSearch(e.target.value)

searchInput.onblur
    = (e) => {
    searchOpen.style.display = 'none'
}

window.onload = async () => {
    let isAuth = await Api.isAuthorized()
    if(!isAuth)
        window.location.href = '/'

    await Api.requestInfo()
    document.querySelector('.g_user_balance').innerText = Number(Api.me.balance).toFixed(2) + ' ₽'
    document.querySelector('.logins-el > i:nth-child(1) > i:nth-child(2)').innerText = Api.me.email
    let projectsPopup = document.querySelector("#popup_select_project .g_popup .content")
    let searchParams = new URL(window.location.href).searchParams

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
        li.onclick = async (e) => await selectProject(project) || togglePopUp()

        projectsPopup.appendChild(li)
    })
    let fromInput = document.querySelector('#dp1657176628063')
    fromInput.valueAsDate = data.from
    let toInput = document.querySelector('#dp1657176628064')
    toInput.valueAsDate = data.to

    fromInput.onchange = async (e) => {
        await selectFrom(e.target.valueAsDate)
    }
    toInput.onchange = async (e) => {
        await selectTo(e.target.valueAsDate)
    }

    if(Api.projects.length) {
        let id
        if((id = Number(searchParams.get('id')))){
            await selectProject(Api.projects.find((p) => p.id === id))
        }
        else
            await selectProject(Api.projects[0])
    }
    else
        document.querySelector(".g_ellipsis").innerText = 'Нет проектов'




}

async function showDates(){

    let fromInput = document.querySelector('#dp1657176628063')
    fromInput.valueAsDate = data.from;
    let toInput = document.querySelector('#dp1657176628064')
    toInput.valueAsDate = data.to;
}
async function selectProject(project){
    document.querySelector(".g_ellipsis").innerText = project.siteAddress
    document.querySelector('#settingsLink').href = `/edit-project.html?id=${project.id}`
    document.querySelector('#searchLink').href = `/requests-new.html?id=${project.id}`
    document.querySelector('#positionsLink').href = `/positions.html?id=${project.id}`
    document.querySelector('.project_update_go').onclick = async (e) => {
        let el = e.target

        if(el.disabled) return
        el.disabled = true


        el.classList.add('btn-disabled')
        el.classList.remove('btn')
        el.title = 'Идет сбор'

        await Api.collect(project.id)

        await showData()

        setTimeout(() => {
            el.classList.add('btn')
            el.classList.remove('btn-disabled')

            el.title = 'Запустить проверку'
            el.disabled = false
        }, 20000)
    }
    let l = document.querySelector('.external > a:nth-child(1)')
    l.href = 'https://' + project.siteAddress
    l.innerHTML = `<i>${project.siteAddress}</i>`
    Api.selectedProject = project

    data.searcher = project.searchEngine.split(',')[0]
    data.groupId = 0
    data.from = new Date(new Date(Date.now()).toISOString().split('T')[0])
    data.to = new Date(data.from)
    data.from.setDate(data.to.getDate() - 7)
    data.projectId = project.id
    data.city = (await Api.getCities(data.projectId))[0].cityName
    data.search = ''
    data.maxPage = 0
    document.querySelector('#bar > div.need_config_wrapper > i.no_common_view.btn.icon-cog')
        .onclick = async (e) => window.location.href = `/edit-project.html?id=${project.id}`

    await showDates()
    await showSearchers()
    await showCities()
    await showGroups()

    await showData()

}

async function showSearchers(){
    let select = document.querySelector('.g_selector_region > label:nth-child(1) > select:nth-child(1)')

    select.innerHTML = ''

    let searchers = Api.selectedProject.searchEngine.split(',')

    select.onchange = async function (e){
        let selected = this.selectedIndex
        if(selected !== -1)
            await selectSearcher(this[selected].label)

    }

    for(let i = 0; i < searchers.length; i++){
        let option = document.createElement("option")

        option.value = i.toString()
        option.index = i
        option.text = option.label = searchers[i]

        select.appendChild(option)
    }
}

async function showCities(){
    let select = document.querySelector('label.g:nth-child(2) > select:nth-child(1)')

    select.innerHTML = ''

    let cities = await Api.getCities(Api.selectedProject.id)

    select.onchange = async function (e){
        let selected = this.selectedIndex
        if(selected !== -1)
            await selectCity(this[selected].label)

    }

    for(let i = 0; i < cities.length; i++){
        let option = document.createElement("option")
        let city = cities[i]

        option.value = i.toString()
        option.index = i

        option.text = option.label = city.cityName

        select.appendChild(option)
    }
}

async function showGroups(){
    let select = document.querySelector('.g_selector_group > label:nth-child(1) > select:nth-child(1)')

    select.innerHTML = ''

    let groups = await Api.getGroups(Api.selectedProject.id)

    select.onchange = async function (e){
        let selected = this.selectedIndex
        if(selected !== -1)
            await selectGroup(e.target.value)

    }

    let option = document.createElement("option")
    option.value = '0'
    option.index = 0
    option.text = "Все группы"

    select.appendChild(option)

    for(let i = 0; i < groups.length; i++){
        let option = document.createElement("option")
        let group = groups[i]

        option.value = group.id
        option.index = group.id
        option.text = group.groupName

        select.appendChild(option)
    }
}

async function selectSearcher(searcher){
    data.searcher = searcher

    await showData()
}

async function selectCity(city){
    data.city = city

    await showData()
}

async function selectGroup(id){
    data.groupId = Number(id)

    await showData()
}

async function selectFrom(from){
    data.from = from

    await showData()
}

async function selectTo(to){
    data.to = to

    await showData()
}
async function selectSearch(s){
    data.search = s
    await showSearch()
}
function getDaysArray(start, end) {
    start = new Date(start)
    end = new Date(end)
    let today = new Date(Date.now())
    let arr = []
    let days = Api.selectedProject.parsingDays.split(',')
    for(let dt=start; dt<=end; dt.setDate(dt.getDate()+1)){
        let d = new Date(dt)
        if(days.includes(d.toLocaleDateString('en-US', {weekday: 'long'})))
        {
            arr.push(d)
        }

    }
    return arr.reverse()
}

async function showSearch(){
    let queries = document.querySelector('div.hcol:nth-child(1) > table:nth-child(1) tbody').children
    let results = document.querySelector('div.cols:nth-child(2) > table:nth-child(1) tbody')

    const has = (t, s) => {
        let h = false
        s = s.toUpperCase()
        t.split(' ').map((v) => {
            if(s.indexOf(v.toUpperCase()) !== -1)
                h = true
        })
        return h
    }

    let count = 0
    for(let i = 0; i < queries.length; i++){
        let query = queries[i]

        let h = !has(data.search, query.querySelector('.middle').innerText)
        results.querySelector(`.${query.id}`).hidden = query.hidden = h
        if(!h)
            count++
    }
    document.querySelector('.total').innerText = `(${count})`
}
function formatDate(date, v = '.') {

    let dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    let mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    let yyyy = date.getFullYear()

    return dd + v + mm + v + yyyy;
}
let posCount = 0
let p1_3 = 0, p1_10 = 0, p11_30 = 0, p31_50 = 0, p51_100 = 0, p100plus = 0
let percentDates = [], dates = []
let queriesCount = 0;
let loaded = true
async function showData() {
    posCount = 0
    p1_3 = 0
    p1_10 = 0
    p11_30 = 0
    p31_50 = 0
    p51_100 = 0
    p100plus = 0
    percentDates = []
    dates = []
    queriesCount = 0
    loaded = true

    let queriesTable = document.querySelector('div.hcol:nth-child(1) > table:nth-child(1) tbody')
    queriesTable.innerHTML = ''
    let resultsTable = document.querySelector('div.cols:nth-child(2) > table:nth-child(1) tbody')
    resultsTable.innerHTML = ''
    let dateTable = document.querySelector('div.cols:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1)')
    dateTable.innerHTML = ''
    queriesCount = data.groupId === 0
        ? Api.selectedProject.queriesCount
        : await Api.getQueriesCountForGroup(Api.selectedProject.id, data.groupId)
    document.querySelector('.total').innerText = `(${queriesCount})`
    dates = getDaysArray(data.from, data.to)

    let lf = await Api.getLastAndFirstPosition(Api.selectedProject.id, data.city, data.searcher,  data.groupId)

    if(lf.first && lf.last) {
        /**
         * @type {String}
         */
        let first = new Date(lf.first.lastCollection.split('T')[0]).toISOString()
        let last = new Date(lf.last.lastCollection.split('T')[0]).toISOString()

        let first_index = dates.findIndex((e) => e.toISOString() == first)
        let last_index = dates.findIndex((e) => e.toISOString() == last) + 1
        if(last_index === 0)
            last_index = dates.length
        if(!Api.selectedProject.collected && first == new Date(new Date(Date.now()).toISOString().split('T')[0]).toISOString())
            first_index++
        dates = dates.slice(first_index, last_index)
    }
    else
        dates.length = 0


    for (let i = 0; i < dates.length; i++) {
        let date = dates[i].toISOString()
        let fdate = formatDate(dates[i])
        let asid = formatDate(dates[i], '-')
        percentDates.push([0, 0])
        dateTable.innerHTML += `
            <td class="date" colspan="1" data-qualifiers-string="${date}"><i title="${fdate}">
                                                <i class="value" title="Отсортировать по позициям">${fdate}</i><i
                                                    class="stat"><i data-top-popup="#popup_change_top"
                                                                    data-top-popup-pos-by="fixed"
                                                                    data-top-popup-p="3" data-top-popup-notch="1"
                                                                    title="Процент запросов в топ10 (для выбранной группы)"><span
                                                    class="percent"><i class="icon-percent"></i><sup id="percentDate${asid}">0</sup><span
                                                    class="top"></span></span></i></i></i></td>
        `

    }


        let queries = await Api.getQueries(data.groupId, Api.selectedProject.id, 0)

        for (let j = 0; j < queries.length; j++) {
            let query = queries[j]

            queriesTable.innerHTML += `
                 <tr id="query${query.id}" class="phrase_tr phrase_id20051234 hover n0" data-n="0" data-keyword_id="20051234">
                                            <td class="cb"><i id="indicateQuery${query.id}"
                                                    class="target_status" data-status="1"
                                                    data-top-popup="#popup_keywords_target"
                                                    data-aftershow="load_target_data" data-top-popup-p="2"
                                                    data-top-popup-notch="1" data-top-popup-pos-by="fixed"></i></td>
                                            <td class="phrase" title="${query.queryText}">
                                                <div class="div"><i class="tags top-tag-setter"
                                                                    data-top-popup-pos-by="fixed"><i
                                                        class="g-active" data-tag_id="1" data-tag_color_id="1" 
                                                        title="Тег по умолчанию"></i></i>
                                                    <div class="middle">${query.queryText}</div>
                                                </div>
                                            </td>
                                            <td class="visitors_for_phrase">0</td>
                                        </tr>
            `



            let html = `<tr class="query${query.id} phrase_id${query.id} n${j}" data-n="${j}" data-keyword_id="${query.id}">`


            for (let k = 0; k < dates.length; k++) {
                html += `
                <td id="result${k}-${query.id}">
                    <div class="cell">
                        --
                    </div>
                </td>
                `
            }
            resultsTable.innerHTML += html + `</tr>`

            if(dates.length) {
                let positions = await Api.getPositionsQuery(Api.selectedProject.id, data.city, data.searcher, data.to, data.from, query.id)

                let last = null
                for (let k = dates.length - 1; k >= 0; k--) {

                    let dateS = dates[k].toISOString().split('T')[0]

                    let _positions = positions.filter((p) => p.lastCollection.split('T')[0] == dateS)

                    if (_positions.length) {
                        (posCount++)
                        percentDates[k][1]++
                        let position = _positions[0]
                        let cell = resultsTable.querySelector(`#result${k}-${position.queryId}`)


                        let el = cell.querySelector('div')


                        if (position.place) {
                            el.innerText = ''

                            let place = document.createElement('a')

                            place.href = position.foundAddress
                            place.innerText = position.place

                            el.appendChild(place)

                            if (position.place <= 3)
                                p1_3++
                            if (position.place <= 10) {
                                percentDates[k][0]++
                                p1_10++
                            } else if (position.place <= 30)
                                p11_30++
                            else if (position.place <= 50)
                                p31_50++
                            else if (position.place <= 100)
                                p51_100++
                            else
                                p100plus++

                        } else {
                            p100plus++
                        }

                        if (last) {

                            let n = last.place - position.place
                            if(!last.place) n = position.place
                            else if(!position.place) n = -10

                            el.classList.add(`move${Math.min(Math.max(n, -10), 10)}`)
                            if (n !== 0 && position.place) {
                                let diff = document.createElement('i')
                                diff.innerHTML = `
                        <i class="d ${n > 0 ? 'green' : 'red'}"><span class="icon-caret-${n > 0 ? 'up' : 'down'}"></span>${Math.abs(n)}</i>
                    `
                                el.appendChild(diff)
                            }
                            else if(last.place && !position.place){
                                let diff = document.createElement('i')
                                diff.innerHTML = `
                        <i class="d red">X</i>
                    `
                                el.appendChild(diff)
                            }
                        }
                    }
                    function trim (s, c) {
                        if (c === "]") c = "\\]";
                        if (c === "^") c = "\\^";
                        if (c === "\\") c = "\\\\";
                        return s.replace(new RegExp(
                            "^[" + c + "]+|[" + c + "]+$", "g"
                        ), "");
                    }

                    if (k === 0) {
                        let indicate = queriesTable.querySelector(`#indicateQuery${query.id}`)
                        if (last && _positions.length && _positions[0].place) {
                            const f = trim(last.foundAddress, '/'),
                                s = trim(_positions[0].foundAddress,'/')
                            if (last && last.place &&  f !== s) {

                                indicate.title = `Было: ${f}\nСтало: ${s}`

                                indicate.classList.add('icon2-cross-indicate-16')
                                indicate.setAttribute('data-status', '0')
                            } else
                                indicate.classList.add('icon2-checked-indicate-16')
                        }

                    }

                    last = _positions[0]
                }
            }
        }

    if(posCount) {
        let el1_3 = document.querySelector('div.el:nth-child(1)')
        el1_3.querySelector('.percent').innerText = `(${(p1_3 / posCount * 100).toFixed(0)}%)`
        el1_3.querySelector('.\\31 _3').innerText = p1_3

        let el1_10 = document.querySelector('div.el:nth-child(2)')
        el1_10.querySelector('.percent').innerText = `(${(p1_10 / posCount * 100).toFixed(0)}%)`
        el1_10.querySelector('.\\31 _10').innerText = p1_10

        let el11_30 = document.querySelector('div.el:nth-child(3)')
        el11_30.querySelector('.percent').innerText = `(${(p11_30 / posCount * 100).toFixed(0)}%)`
        el11_30.querySelector('.\\31 1_30').innerText = p11_30

        let el31_50 = document.querySelector('div.el:nth-child(4)')
        el31_50.querySelector('.percent').innerText = `(${(p31_50 / posCount * 100).toFixed(0)}%)`
        el31_50.querySelector('.\\33 1_50').innerText = p31_50

        let el51_100 = document.querySelector('div.el:nth-child(5)')
        el51_100.querySelector('.percent').innerText = `(${(p51_100 / posCount * 100).toFixed(0)}%)`
        el51_100.querySelector('.\\35 1_100').innerText = p51_100

        let el100plus = document.querySelector('div.el:nth-child(6)')
        el100plus.querySelector('.percent').innerText = `(${(p100plus / posCount * 100).toFixed(0)}%)`
        el100plus.querySelector('.\\31 01_10000').innerText = p100plus
    }
    else {
        let el1_3 = document.querySelector('div.el:nth-child(1)')
        el1_3.querySelector('.percent').innerText = `(0%)`
        el1_3.querySelector('.\\31 _3').innerText = 0

        let el1_10 = document.querySelector('div.el:nth-child(2)')
        el1_10.querySelector('.percent').innerText = `(0%)`
        el1_10.querySelector('.\\31 _10').innerText = 0

        let el11_30 = document.querySelector('div.el:nth-child(3)')
        el11_30.querySelector('.percent').innerText = `(0%)`
        el11_30.querySelector('.\\31 1_30').innerText = 0

        let el31_50 = document.querySelector('div.el:nth-child(4)')
        el31_50.querySelector('.percent').innerText = `(0%)`
        el31_50.querySelector('.\\33 1_50').innerText = 0

        let el51_100 = document.querySelector('div.el:nth-child(5)')
        el51_100.querySelector('.percent').innerText = `(0%)`
        el51_100.querySelector('.\\35 1_100').innerText = 0

        let el100plus = document.querySelector('div.el:nth-child(6)')
        el100plus.querySelector('.percent').innerText = `(0%)`
        el100plus.querySelector('.\\31 01_10000').innerText = 0
    }
    for(let i = 0; i < percentDates.length; i++){
        let percent = percentDates[i]
        let date = dates[i]

        if(percent[1] !== 0)
        dateTable.querySelector(`#percentDate${formatDate(date, '-')}`).innerText = (percent[0] / percent[1] * 100).toFixed(0)
    }
}

async function loadMore(){
    loaded = false
    let queriesTable = document.querySelector('div.hcol:nth-child(1) > table:nth-child(1) tbody')

    let resultsTable = document.querySelector('div.cols:nth-child(2) > table:nth-child(1) tbody')

    let dateTable = document.querySelector('div.cols:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1)')


    if (Math.ceil(queriesCount / 25) < data.maxPage) return;

        let queries = await Api.getQueries(data.groupId, Api.selectedProject.id, data.maxPage)

        for (let j = 0; j < queries.length; j++) {
            let query = queries[j]

            queriesTable.innerHTML += `
                 <tr id="query${query.id}" class="phrase_tr phrase_id20051234 hover n0" data-n="0" data-keyword_id="20051234">
                                            <td class="cb"><i id="indicateQuery${query.id}"
                                                    class="target_status" data-status="1"
                                                    data-top-popup="#popup_keywords_target"
                                                    data-aftershow="load_target_data" data-top-popup-p="2"
                                                    data-top-popup-notch="1" data-top-popup-pos-by="fixed"></i></td>
                                            <td class="phrase" title="${query.queryText}">
                                                <div class="div"><i class="tags top-tag-setter"
                                                                    data-top-popup-pos-by="fixed"><i
                                                        class="g-active" data-tag_id="1" data-tag_color_id="1" 
                                                        title="Тег по умолчанию"></i></i>
                                                    <div class="middle">${query.queryText}</div>
                                                </div>
                                            </td>
                                            <td class="visitors_for_phrase">0</td>
                                        </tr>
            `



            let html = `<tr class="query${query.id} phrase_id${query.id} n${j}" data-n="${j}" data-keyword_id="${query.id}">`


            for (let k = 0; k < dates.length; k++) {
                html += `
                <td id="result${k}-${query.id}">
                    <div class="cell">
                        --
                    </div>
                </td>
                `
            }
            resultsTable.innerHTML += html + `</tr>`

            if(dates.length) {
                let positions = await Api.getPositionsQuery(Api.selectedProject.id, data.city, data.searcher, data.to, data.from, query.id)

                let last = null
                for (let k = dates.length - 1; k >= 0; k--) {

                    let dateS = dates[k].toISOString().split('T')[0]

                    let _positions = positions.filter((p) => p.lastCollection.split('T')[0] == dateS)

                    if (_positions.length) {
                        (posCount++)
                        percentDates[k][1]++
                        let position = _positions[0]
                        let cell = resultsTable.querySelector(`#result${k}-${position.queryId}`)


                        let el = cell.querySelector('div')


                        if (position.place) {
                            el.innerText = ''

                            let place = document.createElement('a')

                            place.href = position.foundAddress
                            place.innerText = position.place

                            el.appendChild(place)

                            if (position.place <= 3)
                                p1_3++
                            if (position.place <= 10) {
                                percentDates[k][0]++
                                p1_10++
                            } else if (position.place <= 30)
                                p11_30++
                            else if (position.place <= 50)
                                p31_50++
                            else if (position.place <= 100)
                                p51_100++
                            else
                                p100plus++

                        } else {
                            p100plus++
                        }

                        if (last) {

                            let n = last.place - position.place
                            if(!last.place) n = position.place
                            else if(!position.place) n = -10

                            el.classList.add(`move${Math.min(Math.max(n, -10), 10)}`)
                            if (n !== 0 && position.place) {
                                let diff = document.createElement('i')
                                diff.innerHTML = `
                        <i class="d ${n > 0 ? 'green' : 'red'}"><span class="icon-caret-${n > 0 ? 'up' : 'down'}"></span>${Math.abs(n)}</i>
                    `
                                el.appendChild(diff)
                            }
                            else if(last.place && !position.place){
                                let diff = document.createElement('i')
                                diff.innerHTML = `
                        <i class="d red">X</i>
                    `
                                el.appendChild(diff)
                            }
                        }
                    }
                    function trim (s, c) {
                        if (c === "]") c = "\\]";
                        if (c === "^") c = "\\^";
                        if (c === "\\") c = "\\\\";
                        return s.replace(new RegExp(
                            "^[" + c + "]+|[" + c + "]+$", "g"
                        ), "");
                    }

                    if (k === 0) {
                        let indicate = queriesTable.querySelector(`#indicateQuery${query.id}`)
                        if (last && _positions.length && _positions[0].place) {
                            const f = trim(last.foundAddress, '/'),
                                s = trim(_positions[0].foundAddress,'/')
                            if (last && last.place &&  f !== s) {

                                indicate.title = `Было: ${f}\nСтало: ${s}`

                                indicate.classList.add('icon2-cross-indicate-16')
                                indicate.setAttribute('data-status', '0')
                            } else
                                indicate.classList.add('icon2-checked-indicate-16')
                        }

                    }

                    last = _positions[0]
                }
            }
        }

    if(posCount) {
        let el1_3 = document.querySelector('div.el:nth-child(1)')
        el1_3.querySelector('.percent').innerText = `(${(p1_3 / posCount * 100).toFixed(0)}%)`
        el1_3.querySelector('.\\31 _3').innerText = p1_3

        let el1_10 = document.querySelector('div.el:nth-child(2)')
        el1_10.querySelector('.percent').innerText = `(${(p1_10 / posCount * 100).toFixed(0)}%)`
        el1_10.querySelector('.\\31 _10').innerText = p1_10

        let el11_30 = document.querySelector('div.el:nth-child(3)')
        el11_30.querySelector('.percent').innerText = `(${(p11_30 / posCount * 100).toFixed(0)}%)`
        el11_30.querySelector('.\\31 1_30').innerText = p11_30

        let el31_50 = document.querySelector('div.el:nth-child(4)')
        el31_50.querySelector('.percent').innerText = `(${(p31_50 / posCount * 100).toFixed(0)}%)`
        el31_50.querySelector('.\\33 1_50').innerText = p31_50

        let el51_100 = document.querySelector('div.el:nth-child(5)')
        el51_100.querySelector('.percent').innerText = `(${(p51_100 / posCount * 100).toFixed(0)}%)`
        el51_100.querySelector('.\\35 1_100').innerText = p51_100

        let el100plus = document.querySelector('div.el:nth-child(6)')
        el100plus.querySelector('.percent').innerText = `(${(p100plus / posCount * 100).toFixed(0)}%)`
        el100plus.querySelector('.\\31 01_10000').innerText = p100plus
    }
    else {
        let el1_3 = document.querySelector('div.el:nth-child(1)')
        el1_3.querySelector('.percent').innerText = `(0%)`
        el1_3.querySelector('.\\31 _3').innerText = 0

        let el1_10 = document.querySelector('div.el:nth-child(2)')
        el1_10.querySelector('.percent').innerText = `(0%)`
        el1_10.querySelector('.\\31 _10').innerText = 0

        let el11_30 = document.querySelector('div.el:nth-child(3)')
        el11_30.querySelector('.percent').innerText = `(0%)`
        el11_30.querySelector('.\\31 1_30').innerText = 0

        let el31_50 = document.querySelector('div.el:nth-child(4)')
        el31_50.querySelector('.percent').innerText = `(0%)`
        el31_50.querySelector('.\\33 1_50').innerText = 0

        let el51_100 = document.querySelector('div.el:nth-child(5)')
        el51_100.querySelector('.percent').innerText = `(0%)`
        el51_100.querySelector('.\\35 1_100').innerText = 0

        let el100plus = document.querySelector('div.el:nth-child(6)')
        el100plus.querySelector('.percent').innerText = `(0%)`
        el100plus.querySelector('.\\31 01_10000').innerText = 0
    }
    for(let i = 0; i < percentDates.length; i++){
        let percent = percentDates[i]
        let date = dates[i]

        if(percent[1] !== 0)
            dateTable.querySelector(`#percentDate${formatDate(date, '-')}`).innerText = (percent[0] / percent[1] * 100).toFixed(0)
    }
    loaded = true
}
let content = document.querySelector('#content-positions')
document.querySelector('#content-positions').onscroll = async (e) => {
    const height = content.scrollHeight
    const screenHeight = window.innerHeight

    const scrolled = content.scrollTop

    const threshold = height - (height / 2) //* (data.maxPage+1)

    const position = scrolled + screenHeight

   // console.log({scrolled: scrolled, height: height, screenHeight: screenHeight, threshold: threshold, position: position})
    if (position >= threshold && loaded) {
        //console.log("scrolled!")
        data.maxPage++
        loadMore()
    }
}