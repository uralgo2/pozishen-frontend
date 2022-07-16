(async () => {
    let isAuth = await Api.isAuthorized()
    if(!isAuth)
        window.location.href = '/'

    await Api.requestInfo()
    document.querySelector('.logins-el > i:nth-child(1) > i:nth-child(2)').innerText = Api.me.email
    document.querySelector('.g_user_balance').innerText = Number(Api.me.balance).toFixed(2) + ' ₽'

    let searchParams = new URL(window.location.href).searchParams
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
    let projectsPopup = document.querySelector("#popup_select_project .g_popup .content")
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
})()
const groupSearchOpen = document.querySelector('#searchGroups')
const groupSearchInput = document.querySelector('#groupSearchInput')

document.querySelector('#groupSearch').onclick
    = (e) => {
    groupSearchOpen.hidden = false
    groupSearchInput.focus()
}

groupSearchInput.oninput
    = async (e) => await selectGroupSearch(e.target.value)

groupSearchInput.onblur
    = (e) => groupSearchOpen.hidden = true

const querySearchOpen = document.querySelector('#searchQueries')
const querySearchInput = document.querySelector('#querySearchInput')

document.querySelector('#querySearch').onclick
    = (e) => {
    querySearchOpen.hidden = false
    querySearchInput.focus()
}

querySearchInput.oninput
    = async (e) => await selectQuerySearch(e.target.value)

querySearchInput.onblur
    = (e) => querySearchOpen.hidden = true


/**
 * @type {HTMLElement[]}
 */
let groupElements = []

const queriesPopup = document.querySelector('#addQueriesListPopup')
const queriesText = document.querySelector('#addQueriesListText')

const closeQueriesPopup = () => queriesPopup.hidden = true
const openQueriesPopup = () => queriesPopup.hidden = false
const addQueriesPopup = async (e) => {
    let v = queriesText.value

    await importQueries(v)

    closeQueriesPopup()
}
async function importQueries(raw){
    let queries = raw.split(/\r?\n/)
    let project = Api.selectedProject
    let group = Api.selectedGroup
    if(!project) return

    let queriesList = document.querySelector("#phrases_keywords > div:nth-child(1) > longlist:nth-child(1)")

    let count = 0
    for(let query of queries){
        if(query === '') continue

        let res = await Api.addQuery(project.id, group.id,query)
        let row = document.createElement('longlist_row')
        row.classList.add('id-20051234', 'row')
        row.innerHTML = `
    <i class="tags top-tag-setter fixed_cell" style="transform: translateX(0px);">
                                            <i class="g-active" data-tag_id="1" data-tag_color_id="1"
                                               title="Тег по умолчанию"></i>
                                        </i>
                                        <i class="name renamer fixed_cell" title=""
                                           style="transform: translateX(0px);">
                                            <i class="v">${query}</i>
                                        </i>
                                        <i class="path fixed_cell" style="transform: translateX(0px);">
                                            <i>--</i>
                                        </i>
                                        <i class="del icon-trash" title="Удалить"></i>
    `
        queriesList.appendChild(row)
        row.id = `query${res.id}`
        row.querySelector('.del').onclick = async (e) => await deleteQuery(res.id,group.id, project.id)
        ++count
    }
    document.getElementById(`queriesCountGroup${group.id}`).innerText = `${group.queriesCount + count}`
}
async function selectGroupSearch(search){
    let groups = groupElements

    const has = (t, s) => {
        let h = false
        t.split(' ').map((v) => {
            if(s.indexOf(v) !== -1)
                h = true
        })
        return h
    }

    let id = 0;
    for(let i = 0; i < groups.length; i++){
        let group = groups[i]

        let h = has(search, group.querySelector('i.name.renamer > i.v').innerText)
        if(h && id == 0)
            id =  Number(group.getAttribute('data-id'))
        if(!h)
            group.style.display = 'none'
        else
            group.style.removeProperty('display')
        group.hidden = !h


    }

    let s = groupElements.find((v) => v.id.replace('group', '') == Api.selectedGroup.id)

    if(s && s.hidden){

        if(id){
            Api.selectedGroup = undefined
            await selectGroup(Api.groups.find((v) => v.id == id))
        }

        else
            document.querySelector("#phrases_keywords > div:nth-child(1) > longlist:nth-child(1)").innerHTML = ''
    }
}

async function selectQuerySearch(search){
    let queries = document.querySelector('#phrases_keywords > div.body.top-scroll.top-longlist > longlist').children

    const has = (t, s) => {
        let h = false
        t.split(' ').map((v) => {
            if(s.indexOf(v) !== -1)
                h = true
        })
        return h
    }

    let count = 0;
    for(let i = 0; i < queries.length; i++){
        let query = queries[i]

        let h = has(search, query.querySelector('i.name.renamer > i.v').innerText)

        if(!h)
            query.style.display = 'none'
        else
            query.style.removeProperty('display')

        query.hidden = !h
        if(h)
            ++count
    }

    document.getElementById(`queriesCountGroup${Api.selectedGroup.id}`).innerText = `${count}`
}
document.querySelector('i.to_add:nth-child(4)').onclick = async () => {
    let project = Api.selectedProject

    if(!project) return
    let groupsList = document.querySelector("#phrases_groups > div:nth-child(1) > longlist:nth-child(1)")
    let inputListener = async (e) => {
        if(e.keyCode === 13) {
            e.target.blur()
            e.target.removeEventListener("keydown", inputListener)
        }
    }
    let row = document.createElement("longlist_row")
    row.setAttribute("data-id", '-1')
    row.setAttribute('data-n', '0')
    row.innerHTML = `
                    <i class="name renamer" title="Новая группа">
                        <i class="on on-1" title="Включить / Выключить группу"></i>
                        <input class="v" placeholder="Введите имя группы"/>
                    </i>
                <i  id="queriesCountGroup" class="count_keywords">0</i>
                <i class="del icon-trash" title="Удалить"></i>
        `



    groupsList.appendChild(row)
    groupElements.push(row)
    row.classList.add('row', 'id-23265330')

    let name = row.querySelector('.v')
    name.setAttribute("contenteditable", true)
    name.classList.add('state-rename')
    name.addEventListener('keydown', inputListener)
    name.focus()

    name.onblur = async (e) => {
        if(!!e.target.value){
            name.title = e.target.value
            let group = await Api.addGroup(project.id, e.target.value)

            if(group instanceof Error)
                return name.focus()

            row.id = `group${group.id}`
            row.setAttribute("data-id", group.id)
            row.querySelector('#queriesCountGroup').id = `queriesCountGroup${group.id}`
            row.querySelector('.del').onclick = async (e) => await deleteGroup(group.id, project.id)
            let listener = async (e) => {
                await selectGroup(group)
            }
            let n = row.querySelector('.name')
                n.onclick =
                row.querySelector('.count_keywords').onclick = listener
            name.remove()
            let v = e.target.value
            n.innerHTML += `<i class="v">${v}</i>`
            await selectGroup(group)
        }
        else row.remove()
        name.onblur = undefined
    }

    row.querySelector('.del').onclick = (e) => row.remove()

}
document.querySelector('i.to_add:nth-child(3)').onclick = async () => {
    let project = Api.selectedProject
    let group = Api.selectedGroup
    if(!project) return
    document.getElementById(`queriesCountGroup${group.id}`).innerText = `${++group.queriesCount}`
    let queriesList = document.querySelector("#phrases_keywords > div:nth-child(1) > longlist:nth-child(1)")
    let row = document.createElement('longlist_row')
    row.classList.add('id-20051234', 'row')

    let inputListener = async (e) => {
        if(e.keyCode === 13) {
            e.target.blur()
            e.target.removeEventListener("keydown", inputListener)
        }
    }
    row.innerHTML = `
    <i class="tags top-tag-setter fixed_cell" style="transform: translateX(0px);">
                                            <i class="g-active" data-tag_id="1" data-tag_color_id="1"
                                               title="Тег по умолчанию"></i>
                                        </i>
                                        <i class="name renamer fixed_cell" title=""
                                           style="transform: translateX(0px);">
                                            <input class="v" placeholder="Введите текст запроса"/>
                                        </i>
                                        <i class="path fixed_cell" style="transform: translateX(0px);">
                                            <i>--</i>
                                        </i>
                                        <i class="del icon-trash" title="Удалить"></i>
    `
    queriesList.appendChild(row)

    let name = row.querySelector('.v')
    name.classList.add('state-rename')
    name.setAttribute("contenteditable", true)

    name.addEventListener('keydown', inputListener)

    name.focus()

    name.onblur = async (e) => {
        if(!!e.target.value){
            name.title = e.target.value
            let query = await Api.addQuery(project.id, group.id, e.target.value)

            if(group instanceof Error)
                return name.focus()

            row.id = `query${query.id}`
            row.setAttribute("data-id", query.id)
            row.querySelector('.del').onclick = async (e) => await deleteQuery(query.id,group.id, project.id)
            let n = row.querySelector('.name')
            name.remove()
            let v = e.target.value
            n.innerHTML += `<i class="v">${v}</i>`
        }
        else {
            document.getElementById(`queriesCountGroup${group.id}`).innerText = `${--group.queriesCount}`
            row.remove()
        }
        name.onblur = undefined
    }

    row.querySelector('.del').onclick = (e) => row.remove()
}
/**
 *
 * @param project {Project}
 * @returns {Promise<void>}
 */
async function selectProject(project){

    document.querySelector(".g_ellipsis").innerText = project.siteAddress
    document.title = `${project.siteAddress} (Семантическое ядро) #${project.id}`
    document.querySelector('#settingsLink').href = `/edit-project.html?id=${project.id}`
    document.querySelector('#searchLink').href = `/requests-new.html?id=${project.id}`
    document.querySelector('#positionsLink').href = `/positions.html?id=${project.id}`
    let l = document.querySelector('.external > a:nth-child(1)')
    l.href = 'https://' + project.siteAddress
    l.innerHTML = `<i>${project.siteAddress}</i>`
    Api.selectedProject = project
    /**
     * @type {Group[]}
     */

    let groups = await Api.getGroups(project.id)

    let groupsList = document.querySelector("#phrases_groups > div:nth-child(1) > longlist:nth-child(1)")
    groupsList.innerHTML = ''
    document.querySelector("#phrases_keywords > div:nth-child(1) > longlist:nth-child(1)").innerHTML = ''

    groupElements = []
    // добавить колличество запросов для группы, удаление и добавление групп / запросов
    groups.map(group => {
        let row = document.createElement("longlist_row")
        row.id = `group${group.id}`
        row.className = "row id-23265330"
        row.setAttribute("data-id", group.id.toString())
        row.setAttribute('data-n', '0')

        Api.getQueriesCountForGroup(project.id, group.id).then(count => {
            row.innerHTML = `
                    <i class="name renamer" title="${group.groupName}">
                    <i class="on on-1" title="Включить / Выключить группу"></i>
                    <i class="v">${group.groupName}</i>
                </i>
                
                <i id="queriesCountGroup${group.id}" class="count_keywords">${count}</i>
                <i  onclick="deleteGroup(${group.id}, ${project.id})" class="del icon-trash" title="Удалить"></i>
        `
            let listener = async (e) => {
                await selectGroup(group)
            }
            row.querySelector('.name').onclick =
                row.querySelector('.count_keywords').onclick = listener
        })

        groupElements.push(row)

        groupsList.appendChild(row)


    })
    if(groups.length)
        await selectGroup(groups[0])
}
async function deleteGroup(groupId, projectId){
    await Api.deleteGroup(groupId, projectId)
    groupElements = groupElements.filter((e) => e.getAttribute('data-id') != groupId)

    if(Api.selectedGroup.id === groupId){
        if(groupElements.length){
            await selectGroup(Api.groups.find(g => g.id == groupElements[groupElements.length - 1].getAttribute('data-id')))
        }
    }
    document.getElementById(`group${groupId}`).remove()
}
async function deleteQuery(queryId, groupId, projectId){
    await Api.deleteQuery(groupId, projectId, queryId)
    document.getElementById(`queriesCountGroup${Api.selectedGroup.id}`).innerText = `${--Api.selectedGroup.queriesCount}`
    document.getElementById(`query${queryId}`).remove()
}
async function selectGroup(group){

    if(Api.selectedGroup && Api.selectedGroup.id === group.id) return
    Api.selectedGroup = group
    let project = Api.selectedProject

    groupElements.map(e =>
        e.getAttribute('data-id') == group.id
            ? e.classList.add("active")
            : e.classList.remove('active')
    )

    let queriesList = document.querySelector("#phrases_keywords > div:nth-child(1) > longlist:nth-child(1)")
    queriesList.innerHTML = ''

    for(let i = 0; i < group.queriesCount; i += 25) {
        /**
         * @type {SearchingQuery[]}
         */
        let queries = await Api.getQueries(group.id, project.id, i / 25)

        queries.map(query => {

                queriesList.innerHTML +=
                    `
                <longlist_row id="query${query.id}" class="row id-20051234" data-id="20051234" data-n="0">
                                        <i class="tags top-tag-setter fixed_cell" style="transform: translateX(0px);">
                                            <i class="g-active" data-tag_id="1" data-tag_color_id="1"
                                               title="Тег по умолчанию"></i>
                                        </i>
                                        <i class="name renamer fixed_cell" title="${query.queryText}"
                                           style="transform: translateX(0px);">
                                            <i class="v">${query.queryText}</i>
                                        </i>
                                        <i class="path fixed_cell" style="transform: translateX(0px);">
                                            <i>--</i>
                                        </i>
                                        <i onclick="deleteQuery(${query.id}, ${group.id}, ${project.id})" class="del icon-trash" title="Удалить"></i>
                </longlist_row>
                `
            })
    }

}

