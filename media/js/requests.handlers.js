(async () => {
    let isAuth = await Api.isAuthorized()
    if(!isAuth)
        window.location.href = '/'

    await Api.requestInfo()
    document.querySelector('.logins-el > i:nth-child(1) > i:nth-child(2)').innerText = Api.me.email
    document.querySelector('.g_user_balance').innerText = Number(Api.me.balance).toFixed(2) + ' ₽'

    let searchParams = new URL(window.location.href).searchParams
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

})()
/**
 * @type {HTMLElement[]}
 */
let groupElements = []
const groupSearchOpen = document.querySelector('#searchGroups')
const groupSearchInput = document.querySelector('#groupSearchInput')
const querySearchOpen = document.querySelector('#searchQueries')
const querySearchInput = document.querySelector('#querySearchInput')
const queriesPopup = document.querySelector('#addQueriesListPopup')
const queriesText = document.querySelector('#addQueriesListText')

const dialog = document.querySelector('#win_auth')

const closeButtons = dialog.querySelectorAll('[data-popup-action="close"]')
const closePopUp = () => {
    html.setAttribute("data-popup-open", "false")
    dialog.setAttribute("tabindex", "-1")
    dialog.setAttribute("data-select-open", "false")
}
closeButtons.forEach((button) => button.addEventListener('click', () => closePopUp()))

document.getElementById('importQueriesHelp').onclick = () => {
    if (html.getAttribute("data-popup-open") === "true") {

    } else {
        html.setAttribute("data-popup-open", "true")
        dialog.setAttribute("tabindex", "0")
    }
}

const closeQueriesPopup = () => queriesPopup.hidden = true
const openQueriesPopup = () => queriesPopup.hidden = false
const addQueriesPopup = async (e) => {
    let v = queriesText.value

    await importQueries(v)

    queriesText.value = ''

    closeQueriesPopup()
}
querySearchInput.oninput
    = async (e) => await selectQuerySearch(e.target.value)

querySearchInput.onblur
    = (e) => querySearchOpen.hidden = true

groupSearchInput.oninput
    = async (e) => await selectGroupSearch(e.target.value)

groupSearchInput.onblur
    = (e) => groupSearchOpen.hidden = true

document.querySelector('#querySearch').onclick
    = (e) => {
    querySearchOpen.hidden = false
    querySearchInput.focus()
}

document.querySelector('#importQueriesXLSX').onclick = () => {
    const input = document.createElement('input')

    input.type = 'file'
    input.accept = '.xlsx'
    input.onchange = onFileLoad

    input.click()

}

document.querySelector('#groupSearch').onclick
    = (e) => {
    groupSearchOpen.hidden = false
    groupSearchInput.focus()
}

document.querySelector('i.to_add:nth-child(4)').onclick = addGroup

document.querySelector('i.to_add:nth-child(3)').onclick = addQuery

async function importQueries(raw){
    let queries = raw.split(/\r?\n/).filter((t) => t.trim() != '')
    let project = Api.selectedProject
    let group = Api.selectedGroup
    let subgroup = Api.selectedSubgroup

    if(!project) return

    let queriesList = document.querySelector("#phrases_keywords > div:nth-child(1) > longlist:nth-child(1)")

    let elems = ''
    let responses = await Api.addQueries(project.id, group.id, queries, subgroup?.id || 0)

    for(let i = 0; i < responses.length; i++){

        let res = responses[i]
        let query = queries[i]

        elems += `
    <longlist_row id="query${res.id}" class="id-20051234 row">
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
                                        <i onclick='deleteQuery(${JSON.stringify(res)}, ${group.id}, ${project.id});this.target.onclick = null' class="del icon-trash" title="Удалить"></i>
    </longlist_row>
`
    }
    queriesList.innerHTML += elems

    document.getElementById(`queriesCountGroup${group.id}`).innerText = `${group.queriesCount += responses.length}`

    if(subgroup)
        document.getElementById(`queriesCountSubgroup${subgroup.id}`).innerText = `${subgroup.queriesCount += responses.length}`
}

async function selectGroupSearch(search){
    let groups = groupElements

    const has = (t, s) => {
        let h = false
        s = s.toUpperCase()
        t.split(' ').map((v) => {
            if(s.indexOf(v.toUpperCase()) !== -1)
                h = true
        })
        return h
    }
    Api.selectedGroup = null
    let id = 0;
    for(let i = 0; i < groups.length; i++){
        let group = groups[i]
        group.classList.remove('active')
        let h = has(search, group.querySelector('i.name.renamer > i.v').innerText)
        if(h && id == 0)
            id =  Number(group.getAttribute('data-id'))
        if(!h)
            group.style.display = 'none'
        else
            group.style.removeProperty('display')
        group.hidden = !h


    }

    document.querySelector("#phrases_keywords > div:nth-child(1) > longlist:nth-child(1)").innerHTML = ''

}

async function selectQuerySearch(search){
    let queries = document.querySelector('#phrases_keywords > div.body.top-scroll.top-longlist > longlist').children

    const has = (t, s) => {
        let h = false
        s = s.toUpperCase()
        t.split(' ').map((v) => {
            if(s.indexOf(v.toUpperCase()) !== -1)
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

async function addGroup() {
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
                        <i class="on on-1"></i>
                        <input class="v" placeholder="Введите имя группы"/>
                    </i>
                <i  id="queriesCountGroup" class="count_keywords">0</i>
                
                <i id="addSubgroup" style="display: none" class="add_after">+</i>
                
                <i class="del icon-trash" title="Удалить"></i>
        `



    groupsList.appendChild(row)

    let subs = document.createElement("list")

    groupsList.appendChild(subs)

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
            let addSub = row.querySelector('#addSubgroup')

            addSub.style.removeProperty('display')
            addSub.onclick = () => addSubgroup(group)

            let listener = async (e) => {
                await selectGroup(group)
            }

            let n = row.querySelector('.name')
                n.onclick =
                row.querySelector('.count_keywords').onclick = listener
            name.remove()

            let v = e.target.value
            n.innerHTML += `<i class="v">${v}</i>`

            subs.id = `subgroups${group.id}`

            await selectGroup(group)
        }
        else row.remove()
        name.onblur = undefined
    }

    row.querySelector('.del').onclick = (e) => row.remove()

}

async function addSubgroup(group) {
    let project = Api.selectedProject

    if(!project) return

    let groupsList = document.querySelector(`#subgroups${group.id}`)

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
                        <i class="on on-1 subgroup_on"></i>
                        <input class="v" placeholder="Введите имя подгруппы"/>
                    </i>
                <i  id="queriesCountSubgroup" class="count_keywords">0</i>
                <i class="del icon-trash" title="Удалить"></i>
        `



    groupsList.appendChild(row)
    row.classList.add('row', 'id-23265330')

    let name = row.querySelector('.v')
    name.setAttribute("contenteditable", true)
    name.classList.add('state-rename')
    name.addEventListener('keydown', inputListener)
    name.focus()

    name.onblur = async (e) => {
        if(!!e.target.value){
            name.title = e.target.value
            let subgroup = await Api.addSubgroup(group.id, e.target.value)

            if(group instanceof Error)
                return name.focus()

            row.id = `subgroup${subgroup.id}`
            row.setAttribute("data-id", subgroup.id)
            row.querySelector('#queriesCountSubgroup').id = `queriesCountSubgroup${subgroup.id}`
            row.querySelector('.del').onclick = async (e) => await deleteSubgroup(subgroup.id, group.id)

            let listener = async (e) => {
                await selectSubgroup(subgroup, group)
            }

            let n = row.querySelector('.name')

            n.onclick =
                row.querySelector('.count_keywords').onclick = listener

            name.remove()

            let v = e.target.value
            n.innerHTML += `<i class="v">${v}</i>`
            await selectSubgroup(subgroup, group)
        }
        else row.remove()
        name.onblur = undefined
    }

    row.querySelector('.del').onclick = (e) => row.remove()

}

async function addQuery(){
    let project = Api.selectedProject
    let group = Api.selectedGroup
    let subgroup = Api.selectedSubgroup

    if(!project) return

    if(subgroup)
        document.getElementById(`queriesCountSubgroup${subgroup.id}`).innerText = `${++subgroup.queriesCount}`
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
            let query = await Api.addQuery(project.id, group.id, e.target.value, subgroup?.id ?? 0)

            if(group instanceof Error)
                return name.focus()

            row.id = `query${query.id}`
            row.setAttribute("data-id", query.id)
            row.querySelector('.del').onclick = async (e) => await deleteQuery(query,group.id, project.id)
            let n = row.querySelector('.name')
            name.remove()
            let v = e.target.value
            n.innerHTML += `<i class="v">${v}</i>`
        }
        else {
            document.getElementById(`queriesCountGroup${group.id}`).innerText = `${--group.queriesCount}`
            if(subgroup)
                document.getElementById(`queriesCountSubgroup${subgroup.id}`).innerText = `${--subgroup.queriesCount}`
            row.remove()
        }
        name.onblur = undefined
    }

    row.querySelector('.del').onclick = (e) => row.remove()
}

async function selectProject(project){

    document.querySelector(".g_ellipsis").innerText = project.siteAddress
    document.querySelector('#settingsLink').href = `/edit-project.html?id=${project.id}`
    document.querySelector('#searchLink').href = `/requests-new.html?id=${project.id}`
    document.querySelector('#positionsLink').href = `/positions.html?id=${project.id}`

    let l = document.querySelector('.external > a:nth-child(1)')
    l.href = 'https://' + project.siteAddress
    l.innerHTML = `<i>${project.siteAddress}</i>`
    Api.selectedProject = project
    Api.selectedGroup = Api.selectedSubgroup = null
    /**
     * @type {Group[]}
     */

    let groups = await Api.getGroups(project.id)

    let groupsList = document.querySelector("#phrases_groups > div:nth-child(1) > longlist:nth-child(1)")
    groupsList.innerHTML = ''
    document.querySelector("#phrases_keywords > div:nth-child(1) > longlist:nth-child(1)").innerHTML = ''

    groupElements = []
    // добавить колличество запросов для группы, удаление и добавление групп / запросов
    let groupsHtml = ''
    for(let group of groups){
        let row = document.createElement("longlist_row")
        row.id = `group${group.id}`
        row.classList.add("row", "id-23265330")
        row.setAttribute("data-id", group.id)
        row.setAttribute('data-n', '0')

        let count = group.queriesCount

            row.innerHTML = `
                    <i class="name renamer" title="${group.groupName}">
                    <i class="on on-1"></i>
                    <i class="v">${group.groupName}</i>
                </i>
                
                <i id="queriesCountGroup${group.id}" class="count_keywords">${count}</i>
                
                <i onclick='addSubgroup(${JSON.stringify(group)})' id="addSubgroup${group.id}" title="Создать подгруппу" class="add_after">+</i>
                
                <i  onclick="deleteGroup(${group.id}, ${project.id})" class="del icon-trash" title="Удалить"></i>
        `


        groupsHtml += row.outerHTML
        groupsHtml += `<list id="subgroups${group.id}">`

        let subgroups = await Api.getSubgroups(group.id)

        for(let subgroup of subgroups){
            let row = document.createElement("longlist_row")
            row.id = `subgroup${subgroup.id}`
            row.classList.add("row", "id-23265330")
            row.setAttribute("data-id", subgroup.id)
            row.setAttribute('data-n', '0')
            row.setAttribute('data-json', JSON.stringify(subgroup))
            let count = subgroup.queriesCount

            row.innerHTML = `
                    <i class="name renamer" title="${subgroup.subgroupName}">
                    <i class="on on-1 subgroup_on"></i>
                    <i class="v">${subgroup.subgroupName}</i>
                </i>
                
                <i id="queriesCountSubgroup${subgroup.id}" class="count_keywords">${count}</i>
                                
                <i  onclick="deleteSubgroup(${subgroup.id}, ${group.id})" class="del icon-trash" title="Удалить"></i>
        `


            groupsHtml += row.outerHTML
        }

        groupsHtml += `</list>`

    }


    groupsList.innerHTML = groupsHtml
    let i = 0
    for(let row of groupsList.children) {

        if(row.tagName !== "LONGLIST_ROW")
        {
            let group = groups[i-1]
            for(let r of row.children){
                let listener = async (e) => {
                    await selectSubgroup(JSON.parse(r.getAttribute('data-json')),group)
                }

                r.querySelector('.name').onclick =
                    r.querySelector('.count_keywords').onclick = listener
            }
            continue
        }

        let group = groups[i]
        let listener = async (e) => {
            await selectGroup(group)
        }

        row.querySelector('.name').onclick =
            row.querySelector('.count_keywords').onclick = listener

        groupElements.push(row)
        i++
    }
    if(groups.length)
        await selectGroup(groups[0])
}

async function deleteGroup(groupId, projectId){
    await Api.deleteGroup(groupId, projectId)
    groupElements = groupElements.filter((e) => e.getAttribute('data-id') != groupId)

    document.querySelector("#phrases_keywords > div:nth-child(1) > longlist:nth-child(1)").innerHTML = ''
    document.getElementById(`subgroups${groupId}`).remove()
    document.getElementById(`group${groupId}`).remove()

    if(Api.selectedGroup && Api.selectedGroup.id === groupId){
        if(groupElements.length){
            await selectGroup(Api.groups.find(g => g.id == groupElements[groupElements.length - 1].getAttribute('data-id')))
        }
    }
}

async function deleteQuery(query, groupId, projectId){
    await Api.deleteQuery(groupId, projectId, query.id)

    document.getElementById(`queriesCountGroup${Api.selectedGroup.id}`).innerText--

    if(query.subgroupId)
        document.getElementById(`queriesCountSubgroup${query.subgroupId}`).innerText--

    document.getElementById(`query${query.id}`).remove()
}

async function selectGroup(group){
    if(!Api.selectedSubgroup
        && Api.selectedGroup
        && Api.selectedGroup.id === group.id) return

    Api.selectedGroup = group
    Api.selectedSubgroup = null
    let project = Api.selectedProject

    document.querySelectorAll('longlist_row.active')
        .forEach(elem => elem.classList.remove('active'))

    document.getElementById(`group${group.id}`)
        .classList.add('active')

    let queriesList = document.querySelector("#phrases_keywords > div:nth-child(1) > longlist:nth-child(1)")

    queriesList.innerHTML = ''
    let elems = ''

    for(let i = 0; i < group.queriesCount; i += 25) {
        /**
         * @type {SearchingQuery[]}
         */
        let queries = await Api.getQueries(group.id, project.id, 0,i / 25)

        for(let query of queries) {

                elems +=
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
                                        <i onclick='deleteQuery(${JSON.stringify(query)}, ${group.id}, ${project.id})' class="del icon-trash" title="Удалить"></i>
                </longlist_row>
                `
        }
        queriesList.innerHTML += elems
    }

}

async function deleteSubgroup(id, groupId){
    await Api.deleteSubgroup(id)

    document.getElementById(`queriesCountGroup${groupId}`).innerText =
        (await Api.getQueriesCountForGroup(Api.selectedProject.id, groupId)).toString()

    document.querySelector("#phrases_keywords > div:nth-child(1) > longlist:nth-child(1)").innerHTML = ''

    document.getElementById(`subgroup${id}`).remove()

    if(Api.selectedSubgroup.id === id){
        Api.selectedGroup = null
        Api.selectedSubgroup = null
        let gr = Api.groups.find(g => g.id == groupId)
        console.log(gr)
        await selectGroup(gr)
    }

}

async function selectSubgroup(subgroup, group){
    if(Api.selectedSubgroup
        && Api.selectedSubgroup === subgroup.id
        && Api.selectedGroup
        && Api.selectedGroup.id === group.id) return

    Api.selectedGroup = group
    Api.selectedSubgroup = subgroup

    let project = Api.selectedProject

    document.querySelectorAll('longlist_row.active')
        .forEach(elem => elem.classList.remove('active'))


    document.getElementById(`subgroup${subgroup.id}`)
        .classList.add('active')

    let queriesList = document.querySelector("#phrases_keywords > div:nth-child(1) > longlist:nth-child(1)")

    queriesList.innerHTML = ''
    let elems = ''

    for(let i = 0; i < group.queriesCount; i += 25) {
        /**
         * @type {SearchingQuery[]}
         */
        let queries = await Api.getQueries(group.id, project.id, subgroup.id,i / 25)

        for(let query of queries) {

            elems +=
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
                                        <i onclick='deleteQuery(${JSON.stringify(query)}, ${group.id}, ${project.id})' class="del icon-trash" title="Удалить"></i>
                </longlist_row>
                `
        }
        queriesList.innerHTML += elems
    }
}

async function importQueriesFromXLSX(pretty){
    if(!Api.selectedProject) return

    const project = Api.selectedProject

    await Api.addQueriesXLSX(project.id, pretty)

    await selectProject(project)
}

async function onFileLoad(e){
    if(this.files.length) {
        await parseXLSX(this.files[0])
        e.target.value = null
    }
}

async function parseXLSX(file){
    if(!file) return

    const reader = new FileReader()

    reader.onload = e => {
        const data = e.target.result
        const workbook = XLSX.read(data, {
            type: 'binary'
        })

        workbook.SheetNames.forEach(sheetName => {
            const XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName])

            const first = Object.keys(XL_row_object[0])

            let valid = true
            const pretty = XL_row_object.map(row => {
                const values = Object.values(row)

                if(values.length < 2) {
                    valid = false
                    alert(`Некорректные данные: отсутвует обязательный столбец на строке ${row.__rowNum__+1}`)
                }

                return values
            })

            pretty.splice(0, 0, first)


            if(first[0] === 'undefined' || first[1] === 'undefined') {
                valid = false
                alert(`Некорректные данные: отсутвует обязательный столбец на строке 1`)
            }
            if(first[2] === 'undefined')
                first.length = 2

            if(valid)
                importQueriesFromXLSX(pretty)
        })
    }

    reader.onerror = e => console.error(e)


    reader.readAsBinaryString(file)
}

