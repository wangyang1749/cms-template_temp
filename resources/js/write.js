
function cmsWriteInit(){
    loadCategory()
    loadTags()
}


var cmsWrite = {
    defaultCategoryId :null,
    articleId:null,
    selectTags:[]
    
}

function setSelectTags(sel){
    if(sel){
        cmsWrite.selectTags = sel;
    }
}
var beforeTagData = []
var url = location.hostname;
var protocol = window.location.protocol;
var token = $.cookie('Authorization')

let selectTagsMap = {}
let suggestionsTags = []



function loadCategory() {
    $.ajax({
        url: protocol + "//" + url + ":8080/api/category",
        headers: {
            'Content-Type': 'application/json;charset=utf8',
            'Authorization': 'Bearer ' + token
        },
        type: "get",
        success: function (data) {
            // console.log(data.data)
            var datas = data.data
            for (var i = 0; i < datas.length; i++) {
                // console.log(datas[i].name)
                $("#categories").append("<option value='" + datas[i].id + "' >" + datas[i].name + "</option>");
            }
            if (cmsWrite.defaultCategoryId) {
                $("#categories").val(cmsWrite.defaultCategoryId)
            }
        }
    });
}


function showTags() {
    $(function () {
        var tags = $('#my-tag-list').tags({
            tagData: beforeTagData,
            suggestions: suggestionsTags,
            excludeList: ["not", "these", "words"],
            beforeAddingTag: function (tag) {
                $.ajax({
                    url: protocol + "//" + url + ":8080/api/tags",
                    headers: {
                        'Content-Type': 'application/json;charset=utf8',
                        'Authorization': 'Bearer ' + token
                    },
                    dataType: "json",
                    type: 'POST',
                    data: JSON.stringify({ "name": tag, "slugName": tag }),
                    success: function (data) {
                        console.log(data.data.id)
                        cmsWrite.selectTags.push(data.data.id)
                        selectTagsMap[data.data.name] = data.data.id
                        console.log(cmsWrite.selectTags)
                        console.log(selectTagsMap)
                        // articleId = data.data.id
                        // Toast("更新文章" + data.data.title + "成功！", 'success')
                    }
                });
            },
            afterDeletingTag: function (tag) {
                cmsWrite.selectTags.remove(selectTagsMap[tag])
                console.log(cmsWrite.selectTags)
                console.log(selectTagsMap)
            }
        });
    })
}



function loadTags() {
    $.ajax({
        url: protocol + "//" + url + ":8080/api/tags",
        headers: {
            'Content-Type': 'application/json;charset=utf8',
            'Authorization': 'Bearer ' + token
        },
        type: "get",
        success: function (data) {
            // console.log(data.data)
            data.data.forEach(item => {
                if (cmsWrite.selectTags.includes(item.id)) {
                    beforeTagData.push(item.name)
                    // console.log(item.name)
                }
                suggestionsTags.push(item.name)
                selectTagsMap[item.name] = item.id
                showTags()
            });
        }
    });
}


Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

$(function () {
    var md = window.markdownit();
    $("#textInput").bind('input propertychange', function () {
        console.log()
        var result = md.render($(this).val());
        $("#preview").html(result);
    });
})





function createArticle() {
    let textInput = $("#textInput").val()
    let categories = $("#categories").val()
    let title = $("#title").val()
    if (title == "") {
        // alert("文章标题不能为空")
        Toast("文章标题不能为空", 'error')
        return
    }
    // if (categories == "" || categories == 0) {
    //     // alert("文章分类不能为空")
    //     Toast("文章分类不能为空", 'error')
    //     return
    // }
    if (textInput == "") {
        // alert("文章内容不能为空")
        Toast("文章内容不能为空", 'error')
        return
    }
    let summary = $("#summary").val()
    return {
        originalContent: textInput, // 输入的markdown
        tagIds: cmsWrite.selectTags,
        categoryId: categories,
        title: title,
        summary: summary,
        pathPic: "",
    };
}

$("#previewNet").click(function () {
    if (cmsWrite.articleId) {
        window.open("/preview/article/" + cmsWrite.articleId, "_blank");
    } else {
        Toast("没有任何文章不能预览！", 'error')
    }
})
$("#closeToast").click(function () {
    $("#toast").animate({ opacity: '0' });
})


function save() {
    if (createArticle()) {
        if (cmsWrite.articleId) {
            $.ajax({
                url: protocol + "//" + url + ":8080/api/article/save/" + cmsWrite.articleId,
                headers: {
                    'Content-Type': 'application/json;charset=utf8',
                    'Authorization': 'Bearer ' + token
                },
                dataType: "json",
                type: 'POST',
                data: JSON.stringify(createArticle()),
                success: function (data) {
                    console.log(data.data.id)
                    cmsWrite.articleId = data.data.id
                    Toast("更新文章" + data.data.title + "成功！", 'success')

                }
            });
        } else {
            $.ajax({
                url: protocol + "//" + url + ":8080/api/article/save",
                headers: {
                    'Content-Type': 'application/json;charset=utf8',
                    'Authorization': 'Bearer ' + token
                },
                dataType: "json",
                type: 'POST',
                data: JSON.stringify(createArticle()),
                success: function (data) {
                    console.log(data.data.id)
                    cmsWrite.articleId = data.data.id
                    Toast("添加文章" + data.data.title + "成功！", 'success')
                    history.pushState("state", "", "/user/edit/" + cmsWrite.articleId)
                    $("#submitCreate").css("display","none")
                    $("#submitUpdate").css("display","inline-block")
                    
                }
            });
        }
    }

}


document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.keyCode === 83) {
        event.preventDefault();
        save()
    }
})
$("#save").click(function () {
    save()
})


$("#submitUpdate").click(function () {

    if (createArticle()) {

        var params = createArticle()
        console.log(params.categoryId)
        if (params.categoryId == "" || params.categoryId == null) {
            // alert("文章分类不能为空")
            Toast("发布文章时，文章分类不能为空", 'error')
            return
        }
        $.ajax({
            url: protocol + "//" + url + ":8080/api/article/update/" + cmsWrite.articleId,
            headers: {
                'Content-Type': 'application/json;charset=utf8',
                'Authorization': 'Bearer ' + token
            },
            dataType: "json",
            type: 'POST',
            data: JSON.stringify(params),
            success: function (data) {
                console.log(data.data.id)
                cmsWrite.articleId = data.data.id
                Toast("添加文章" + data.data.title + "成功！", 'success')
                window.open("/user/articleList");
            }
        });
    }

})

$("#submitCreate").click(function () {

    if (createArticle()) {

        var params = createArticle()
        console.log(params.categoryId)
        if (params.categoryId == "" || params.categoryId == null) {
            // alert("文章分类不能为空")
            Toast("发布文章时，文章分类不能为空", 'error')
            return
        }
        $.ajax({
            url: protocol + "//" + url + ":8080/api/article",
            headers: {
                'Content-Type': 'application/json;charset=utf8',
                'Authorization': 'Bearer ' + token
            },
            dataType: "json",
            type: 'POST',
            data: JSON.stringify(params),
            success: function (data) {
                console.log(data.data.id)
                cmsWrite.articleId = data.data.id
                Toast("添加文章" + data.data.title + "成功！", 'success')
                window.open("/user/articleList");
            }
        });
    }

})