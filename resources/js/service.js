const service = axios.create({
    baseURL: 'http://47.93.201.74:8080/',
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


const commentApi={}
commentApi.add=(data_)=>{
    return service({
        url:'/api/comment',
        method:'post',
        data:data_
    })
}