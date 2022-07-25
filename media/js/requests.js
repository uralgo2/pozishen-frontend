const openPopUpButton = document.querySelectorAll('[data-action="select-project"]')
const popUp = document.querySelector("#popup_select_project")
const html = document.querySelector('html')

const togglePopUp = () => {
    if (html.getAttribute("data-popup-open-project-select") == "true") {
        popUp.classList.remove("show")
        html.setAttribute("data-popup-open-project-select", "false")
    } else {
        popUp.classList.add("show")
        html.setAttribute("data-popup-open-project-select", "true")
    }
}

openPopUpButton.forEach((e) => e.addEventListener('click', () => togglePopUp()))
/*
if (document.querySelectorAll("[data-list-type]").length > 0) {
    const dynamicListBlocks = document.querySelectorAll("[data-list-type]")
    const addButtons = document.querySelectorAll(".icon-plus-full")

    const addLogicToGroupRow = (rows, row, destroyOnBlur) => {
        const name = row.querySelector(".v")
        row.addEventListener("click", () => {
            rows.forEach((e) => e.classList.remove("active"))
            row.classList.contains("active")
                ? row.classList.remove("active")
                : !row.classList.contains("state-rename") && row.classList.add("active")

        })
        name.addEventListener("dblclick", () => {
            name.setAttribute("contenteditable", true)
            name.focus()
            row.classList.add("state-rename")
            !row.classList.contains("active") && row.classList.remove("active")
        })
        name.onblur = () => {
            name.setAttribute("contenteditable", false)
            row.classList.remove("state-rename")
        }

        const addAfter = row.querySelector(".add_after")
        addAfter.addEventListener('click', () => createRow(destroyOnBlur))
    }

    const createRow = (isGroup) => {
        const row = document.createElement("longlist_row")
        isGroup
            ? row.append(group_row.content.cloneNode(true))
            : row.append(item_row.content.cloneNode(true))

        row.classList.add("row")
        row.setAttribute("data-id", "")
        row.setAttribute("data-n", "")

        let tag = "items"
        if(isGroup) tag = "groups"

        const groupTable = document.querySelector(`[data-list-type="${tag}"]`)
        const longlist = groupTable.querySelector("longlist")
        const rows = longlist.querySelectorAll("longlist_row")

        rows.forEach((e) => {
            e.classList.contains("active") && e.classList.remove("active")
        })

        addLogicToGroupRow(rows, row, isGroup)
        longlist.insertBefore(row, rows[0])

        row.classList.add("state-rename")
        const name = row.querySelector(".v")
        name.focus()
    }

    dynamicListBlocks.forEach((block) => {
        const list = block.querySelector("longlist")
        const rows = list.querySelectorAll("longlist_row")

        switch (block.getAttribute("data-list-type")) {
            case "items": {
                break
            }

            case "groups": {
                rows.forEach((row) => addLogicToGroupRow(rows, row, false))
                break
            }
        }
    })
    addButtons.forEach((button) => {
        button.addEventListener('click', () => {
            createRow(button.getAttribute("data-table-type") === "groups")
        })
    })
}
*/