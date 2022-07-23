const profile = document.querySelector(".profile")
const toolbar = document.querySelector("#toolbar")
const profileBlock = document.querySelector("#popup_usermenu")
const closeBlock = profileBlock.querySelector(".full-page__close")
const popUpOpenBlocks = document.querySelectorAll("[data-top-popup='#popup_usermenu']")
const mainHTML = document.querySelector("html")
let width = window.innerWidth

popUpOpenBlocks.forEach((block) => {
    block.addEventListener('click', () => {
        if (profileBlock.classList.contains("show")) {
            profileBlock.classList.remove("show")
            mainHTML.setAttribute("data-popup-open", "false")
        }
        else {
            profileBlock.classList.add("show")


            mainHTML.setAttribute("data-popup-open", "true")
            if (width > 900) {
                profileBlock.style.left = `${profile.getBoundingClientRect().x - 180}px`
            }else {
                if (!toolbar) {
                    profileBlock.style.left = "0px"
                    profileBlock.style.top = "45px"
                }
            }

            setTimeout(() => document.onclick = listenerDocument, 200)
        }
    })
})


function listenerDocument(e) {
    /**
     * @type {HTMLElement}
     */
    let el = e.target

    if(!hasInChildren(el, profileBlock)) {
        profileBlock.classList.remove("show")
        mainHTML.setAttribute("data-popup-open", "false")
        document.onclick = null
    }
}

function hasInChildren(el, e){
    if(el == e) return true
    let t = false
    for(let child of e.children){
        if(child == el) return true
        else if((t = hasInChildren(el, child))) return t
    }
    return false
}

closeBlock.addEventListener('click', () => profileBlock.classList.remove("show"))


window.addEventListener('resize', (event)  => width = event.target.innerWidth, true);
