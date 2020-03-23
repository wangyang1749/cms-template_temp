const service = axios.create({
    baseURL: 'http://localhost:8080/',
    timeout: 10000,
    withCredentials: true,
})
const articleApi = {}
articleApi.list = (categortId, page) => {
    return service({
        url: `articleList/categoryAjax/${categortId}`,
        params: { page: page },
        method: 'get'
    })
}
articleApi.getVisit=(id)=>{
    return service({
        url: `/articleList/visit/${id}`,
        method: 'get'
    })
}