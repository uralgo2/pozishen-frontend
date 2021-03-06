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

let data = {}

openPopUpButton.forEach((e) => e.addEventListener('click', () => togglePopUp()));
(async () => {
    let isAuth = await Api.isAuthorized()

    if(isAuth) {
        document.querySelector('#popup_usermenu').setAttribute('style', 'bottom: -200px;')

        document.querySelector('.details').innerText =
        document.querySelector('.balance').innerText =
        document.querySelector('.g_user_balance').innerText = `${Number(Api.me.balance).toFixed(2)} ₽`

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

        data.from = new Date(new Date(Date.now()).toISOString().split('T')[0])
        data.to = new Date(data.from)
        data.from.setDate(data.to.getDate() - 7)

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
        await showData()
    }
    else window.location.href = '/'

})()
function formatDate(date, v = '.') {

    let dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    let mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    let yyyy = date.getFullYear()

    return dd + v + mm + v + yyyy;
}
async function selectFrom(from){
    data.from = from

    await showData()
}

async function selectTo(to){
    data.to = to

    await showData()
}

async function showData() {
    let expensesCount = await Api.getExpensesCount(data.to, data.from)

    let list = document.querySelector('.body > longlist:nth-child(1)')

    let total = 0

    list.innerHTML = ''

    for(let i = 0; i < expensesCount; i+= 25){
        let expenses = await Api.getExpenses(data.to, data.from, i / 25)

        for(let j = 0; j < expenses.length; j++){
            let expense = expenses[j]
            let date = new Date(expense.date)
            total += Number(expense.expense)

            let row = document.createElement('longlist_row')
            row.classList.add('id-undefined')

            row.innerHTML = `
                <longlist_cell data-name="date">${formatDate(date)} ${date.toLocaleTimeString([], {
                    timeZone: 'Europe/Moscow',
                    hour: '2-digit',
                    minute: '2-digit'
            })}</longlist_cell>
                            <longlist_cell data-name="sum" class="red">
                                –${expense.expense}
                            </longlist_cell>
            `
            list.appendChild(row)

        }
    }

    document.querySelector('.footer > i:nth-child(2)').innerHTML = total === 0 ? `&nbsp;0` : `&nbsp;-${total.toFixed(2)}`
}