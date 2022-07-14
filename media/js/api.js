class Api {
    /**
     * @type Project[]
     */
    static projects
    /**
     * @type User
     */
    static me
    static domain = 'https://pozishen.ru/api'//"https://pozishen.ru/api"
    static secret = null
    /**
     * @type {Project}
     */
    static selectedProject
    /**
     * @type {Group}
     */
    static selectedGroup
    /**
     * @type {Group[]}
     */
    static groups = []
    static async requestInfo(){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        Api.me = await Api.getMe()
        Api.projects = await Api.getProjects()
    }
    static async isAuthorized() {
        await Api.loadSecret()
        if(Api.secret) {
            let me = await Api.getMe()
            if(me instanceof Error && me.message === "Сессии не существует")
            {
                deleteCookie('c')
                return false
            }
        }
        return !!Api.secret
    }
    static async saveSecret(){
        if(Api.secret)
            setCookie("c", Api.secret, {maximumAge: 31104000})
    }
    static async loadSecret(){
        Api.secret = getCookie("c")
    }

    /**
     * @param email {String}
     * @param password {String}
     * @returns {Promise<Error|null>}
     */
    static async login(email, password){
        let res = await fetch(Api.domain + `/login?email=${email}&password=${password}`)
        let json = await res.json()
        if(json['successful'])
        {
            Api.secret = json['data']['c']
            await Api.saveSecret()
        }
        else
            return new Error(json['message'])
    }

    /**
     * @param email {String}
     * @param password {String}
     * @returns {Promise<Error|null>}
     */
    static async signup(email, password){
        let res = await fetch(Api.domain + `/signup?email=${email}&password=${password}`)
        let json = await res.json()

        if(json['successful'])
        {
            Api.secret = json['data']['c']

            await Api.saveSecret()
        }
        else
            return new Error(json['message'])
    }

    /**
     * @param email {String}
     * @returns {Promise<Error|null>}
     */
    static async restorePassword(email){
        let res = await fetch(Api.domain + `/restore?email=${email}`)
        let json = await res.json()

        if(!json['successful'])
            return new Error(json['message'])
    }

    /**
     * @returns {Promise<Error|User>}
     */
    static async getMe(){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/getMe?c=${Api.secret}`)
        let json = await res.json()

        if(json['successful'])
            return Api.me = json['data']
        else
            return new Error(json['message'])
    }

    /**
     * @returns {Promise<Error|Project[]>}
     */
    static async getProjects(){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/getProjects?c=${Api.secret}`)
        let json = await res.json()

        if(json['successful'])
            return Api.projects = json['data']
        else
            return new Error(json['message'])
    }

    /**
     * @param projectId {Number}
     * @returns {Promise<Error|Group[]>}
     */
    static async getGroups(projectId){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/getGroups?projectId=${projectId}&c=${Api.secret}`)
        let json = await res.json()

        if(json['successful'])
            return Api.groups = json['data']
        else
            return new Error(json['message'])
    }

    /**
     * @param projectId {Number}
     * @param groupId {Number}
     * @returns {Promise<Error|Number>}
     */
    static async getQueriesCountForGroup(projectId, groupId){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/getQueriesCount?projectId=${projectId}&groupId=${groupId}&c=${Api.secret}`)
        let json = await res.json()

        if(json['successful'])
            return json['data']
        else
            return new Error(json['message'])
    }
    /**
     * @param groupId {Number}
     * @param projectId {Number}
     * @param page {Number}
     * @returns {Promise<Error|SearchingQuery[]>}
     */
    static async getQueries(groupId, projectId, page = 0){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/getQueries?projectId=${projectId}&groupId=${groupId}&p=${page}&c=${Api.secret}`)
        let json = await res.json()

        if(json['successful'])
            return json['data']
        else
            return new Error(json['message'])
    }
    /**
     * @param groupId {Number}
     * @param projectId {Number}
     * @returns {Promise<Error|null>}
     */
    static async deleteGroup(groupId, projectId){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/deleteGroup?projectId=${projectId}&groupId=${groupId}&c=${Api.secret}`)
        let json = await res.json()

        if(!json['successful'])
            return new Error(json['message'])
        else
            Api.groups = Api.groups.filter((g) => g.id != groupId)
    }
    /**
     * @param groupId {Number}
     * @param projectId {Number}
     * @param queryId {Number}
     * @returns {Promise<Error|null>}
     */
    static async deleteQuery(groupId, projectId, queryId){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/deleteQuery?queryId=${queryId}&projectId=${projectId}&groupId=${groupId}&c=${Api.secret}`)
        let json = await res.json()

        if(!json['successful'])
            return new Error(json['message'])
    }
    /**
     * @param projectId {Number}
     * @param name {String}
     * @returns {Promise<Error|Group>}
     */
    static async addGroup(projectId, name){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/addGroup?projectId=${projectId}&name=${name}&c=${Api.secret}`)
        let json = await res.json()

        if(json['successful']) {
            Api.groups.push(json['data'])
            return json['data']
        }
        else
            return new Error(json['message'])
    }
    /**
     * @param projectId {Number}
     * @param groupId {Number}
     * @param text {String}
     * @returns {Promise<Error|SearchingQuery>}
     */
    static async addQuery(projectId, groupId, text){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/addQuery?projectId=${projectId}&groupId=${groupId}&text=${text}&c=${Api.secret}`)
        let json = await res.json()

        if(json['successful'])
            return json['data']
        else
            return new Error(json['message'])
    }

    /**
     * @returns {Promise<Error|null>}
     */
    static async logout(){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/logout?c=${Api.secret}`)
        let json = await res.json()
        if(json['successful'])
        {
            Api.secret = null

            deleteCookie('c')
            document.location.href = '/'
        }
        else
            return new Error(json['message'])
    }

    /**
     * @param currentPassword {String}
     * @param newPassword {String}
     * @returns {Promise<Error|null>}
     */
    static async changePassword(currentPassword, newPassword){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/changePassword?c=${Api.secret}&currentPassword=${currentPassword}&newPassword=${newPassword}`)
        let json = await res.json()

        if(!json['successful'])
            return new Error(json['message'])
    }

    /**
     * @param projectId {Number}
     * @returns {Promise<Error|null>}
     */
    static async deleteProject(projectId){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/deleteProject?c=${Api.secret}&projectId=${projectId}`)
        let json = await res.json()

        if(!json['successful'])
            return new Error(json['message'])
        else
            Api.projects = Api.projects.filter((g) => g.id != projectId)
    }

    /**
     * @param siteAddress {String}
     * @param searchEngine {Set<'yandex'|'google'>}
     * @param searchingRange {'100'|'200'}
     * @param parsingTime {String}
     * @param parsingDays {Set<'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday'>}
     * @param cities {Set<String>}
     * @returns {Promise<Error|Project>}
     */
    static async addProject(siteAddress, searchEngine, searchingRange, parsingTime, parsingDays, cities)
    {
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/addProject`, {
            method: 'post',
            body: JSON.stringify({
                c: Api.secret,
                project: {
                    siteAddress: siteAddress,
                    searchEngine: Array.from(searchEngine),
                    searchingRange: searchingRange,
                    parsingTime: parsingTime,
                    parsingDays: Array.from(parsingDays),
                    cities: Array.from(cities)
                },

            }),
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        })
        let json = await res.json()

        if(json['successful']) {
            Api.projects.push(json['data'])
            return json['data']
        }
        else
            return new Error(json['message'])
    }

    /**
     * @param projectId {Number}
     * @param siteAddress {String}
     * @param searchEngine {Set<'yandex'|'google'>}
     * @param searchingRange {'yandex'|'google'}
     * @param parsingTime {String}
     * @param parsingDays {Set<'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday'>}
     * @param cities {Set<String>}
     * @returns {Promise<Error|null>}
     */
    static async updateProject(projectId, siteAddress, searchEngine, searchingRange, parsingTime, parsingDays, cities)
    {
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/updateProject`, {
            method: 'post',
            body: JSON.stringify({
                c: Api.secret,
                projectId: projectId,
                project: {
                    siteAddress: siteAddress,
                    searchEngine: Array.from(searchEngine),
                    searchingRange: searchingRange,
                    parsingTime: parsingTime,
                    parsingDays: Array.from(parsingDays),
                    cities: Array.from(cities)
                },

            }),
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        })
        let json = await res.json()

        if(!json['successful'])
            return new Error(json['message'])
    }

    /**
     * @param projectId {Number}
     * @returns {Promise<Error|Project>}
     */
    static async getProject(projectId){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/getProject?c=${Api.secret}&projectId=${projectId}`)
        let json = await res.json()

        if(json['successful'])
            return json['data']
        else
            return new Error(json['message'])
    }
    /**
     * @param projectId {Number}
     * @param city {String}
     * @param engine {'yandex'|'google'}
     * @param to {Date}
     * @param from {Date}
     * @param groupId {Number}
     * @param page {Number}
     * @returns {Promise<Error|Position[]>}
     */
    static async getPositions(projectId, city, engine, to, from, groupId = 0, page = 0){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/getPositions?c=${Api.secret}&projectId=${projectId}&city=${city}&engine=${engine}&groupId=${groupId}&p=${page}&to=${to.toISOString()}&from=${from.toISOString()}`)
        let json = await res.json()

        if(json['successful'])
            return json['data']
        else
            return new Error(json['message'])
    }

    /**
     * @param projectId {Number}
     * @returns {Promise<Error|City[]>}
     */
    static async getCities(projectId){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/getCities?c=${Api.secret}&projectId=${projectId}`)
        let json = await res.json()

        if(json['successful'])
            return json['data']
        else
            return new Error(json['message'])
    }

    /**
     * @param loadLimit {Number}
     * @param maxResourceLimit {Number}
     * @returns {Promise<Error|null>}
     */
    static async updateSettings(loadLimit, maxResourceLimit){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/updateSettings?c=${Api.secret}&loadLimit=${loadLimit}&maxResourceLimit=${maxResourceLimit}`)

        let json = await res.json()

        if(!json['successful'])
            return new Error(json['message'])
    }

    /**
     * @param projectId {Number}
     * @param city {String}
     * @param engine {'yandex'|'google'}
     * @param to {Date}
     * @param from {Date}
     * @param groupId {Number}
     * @returns {Promise<Error|Number>}
     */
    static async getPositionsCount(projectId, city, engine, to, from,groupId = 0){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/getPositionsCount?c=${Api.secret}&projectId=${projectId}&city=${city}&engine=${engine}&groupId=${groupId}&to=${to.toISOString()}&from=${from.toISOString()}`)
        let json = await res.json()

        if(json['successful'])
            return json['data']
        else
            return new Error(json['message'])
    }
    /**
     * @param projectId {Number}
     * @param city {String}
     * @param engine {'yandex'|'google'}
     * @param to {Date}
     * @param from {Date}
     * @param queryId {Number}
     * @returns {Promise<Error|Position[]>}
     */
    static async getPositionsQuery(projectId, city, engine, to, from, queryId){
        if(!Api.secret)
            return new Error("Вы не авторизованы")
        let sTo = to.toISOString().split('T')[0]
        let sFrom = from.toISOString().split('T')[0]
        let res = await fetch(Api.domain + `/getPositionsQuery?c=${Api.secret}&projectId=${projectId}&city=${city}&engine=${engine}&queryId=${queryId}&to=${sTo}&from=${sFrom}`)
        let json = await res.json()

        if(json['successful'])
            return json['data']
        else
            return new Error(json['message'])
    }
    /**
     * @param projectId {Number}
     * @param to {Date}
     * @param from {Date}
     * @returns {Promise<Error|Number>}
     */
    static async getExpensesCount(projectId, to, from){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/getExpensesCount?c=${Api.secret}&projectId=${projectId}&to=${to.toISOString()}&from=${from.toISOString()}`)
        let json = await res.json()

        if(json['successful'])
            return json['data']
        else
            return new Error(json['message'])
    }
    /**
     * @param projectId {Number}
     * @param to {Date}
     * @param from {Date}
     * @param page {Number}
     * @returns {Promise<Error|Expense[]>}
     */
    static async getExpenses(projectId, to, from, page = 0){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/getExpenses?c=${Api.secret}&projectId=${projectId}&to=${to.toISOString()}&from=${from.toISOString()}&p=${page}`)
        let json = await res.json()

        if(json['successful'])
            return json['data']
        else
            return new Error(json['message'])
    }

    /**
     * @param search {String}
     * @param count {Number}
     * @returns {Promise<Error|String[]>}
     */
    static async searchCities(search, count = 5){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/searchCities?c=${Api.secret}&search=${search}&count=${count}`)
        let json = await res.json()

        if(json['successful'])
            return json['data']
        else
            return new Error(json['message'])
    }

    /**
     *
     * @param hash {String}
     * @param password {String}
     * @returns {Promise<void|Error>}
     */
    static async restoreChange(hash, password){
        let res = await fetch(Api.domain + `/restoreChange?s=${hash}&password=${password}`)
        let json = await res.json()
        if(json['successful'])
        {
            Api.secret = json['data']['c']
            await Api.saveSecret()
        }
        else
            return new Error(json['message'])
    }

    static async collect(projectId){
        if(!Api.secret)
            return new Error("Вы не авторизованы")

        let res = await fetch(Api.domain + `/collect?c=${Api.secret}&projectId=${projectId}`)
        let json = await res.json()

        if(!json['successful'])
            return new Error(json['message'])
    }
}