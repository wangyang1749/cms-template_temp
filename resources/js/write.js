
function cmsWriteInit() {
    loadCategory()
    loadTags()
}


var cmsWrite = {
    defaultCategoryId: null,
    articleId: null,
    selectTags: []

}

function setSelectTags(sel) {
    if (sel) {
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
                        // console.log(data.data.id)
                        cmsWrite.selectTags.push(data.data.id)
                        selectTagsMap[data.data.name] = data.data.id
                        // console.log(cmsWrite.selectTags)
                        // console.log(selectTagsMap)
                        // articleId = data.data.id
                        // Toast("更新文章" + data.data.title + "成功！", 'success')
                    }
                });
            },
            afterDeletingTag: function (tag) {
                cmsWrite.selectTags.remove(selectTagsMap[tag])
                // console.log(cmsWrite.selectTags)
                // console.log(selectTagsMap)
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

/***基于markdownit */
var md = window.markdownit({
    html: true,
});
// function formatHtml() {

//     var result = md.render($("#textInput").val());
//     $("#preview").html(result);
// }
// $(function () {

//     $("#textInput").bind('input propertychange', function () {
//         this.style.height = this.scrollHeight + 'px';
//         // console.log(this.style.height)
//         // console.log(this.scrollHeight)

//         var result = md.render($(this).val());
//         $("#preview").html(result);
//     });
// })





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


/**
 * 保存文章
 */
function save() {
    if (createArticle()) {
        
        let jsonData = JSON.stringify(createArticle())
        // console.log(jsonData)
        if (cmsWrite.articleId) {
            $.ajax({
                url: protocol + "//" + url + ":8080/api/article/save/" + cmsWrite.articleId,
                headers: {
                    'Content-Type': 'application/json;charset=utf8',
                    'Authorization': 'Bearer ' + token
                },
                type: 'POST',
                data:jsonData ,
                success: function (data) {
                    // console.log(data.data.id)
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
                // dataType: "json",
                type: 'POST',
                data: jsonData,
                success: function (data) {
                    // console.log(data.data.id)
                    cmsWrite.articleId = data.data.id
                    Toast("添加文章" + data.data.title + "成功！", 'success')
                    history.pushState("state", "", "/user/edit/" + cmsWrite.articleId)
                    $("#submitCreate").css("display", "none")
                    $("#submitUpdate").css("display", "inline-block")

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
document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.keyCode === 81) {
        event.preventDefault();
        $("#uploadPanel").slideToggle("fast");
    }
})




$("#save").click(function () {
    save()
})

/**
 * 更新文章
 */
$("#submitUpdate").click(function () {

    if (createArticle()) {

        var params = createArticle()
        // console.log(params.categoryId)
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
                console.log(data.data)
                cmsWrite.articleId = data.data.id
                Toast("添加文章" + data.data.title + "成功！", 'success')
                // window.open("/user/articleList");

                window.location.href="/"+data.data.path+"/"+data.data.viewName+".html"
            }
        });
    }

})


/**
 * 提交文章
 */
$("#submitCreate").click(function () {

    if (createArticle()) {

        var params = createArticle()
        // console.log(params.categoryId)
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
                // console.log(data.data.id)
                cmsWrite.articleId = data.data.id
                Toast("添加文章" + data.data.title + "成功！", 'success')
                window.open("/user/articleList");
            }
        });
    }

})





// 复制的方法
function copyText(text, callback) { // text: 要复制的内容， callback: 回调
    var tag = document.createElement('input');
    tag.setAttribute('id', 'cp_hgz_input');
    tag.value = text;
    document.getElementsByTagName('body')[0].appendChild(tag);
    document.getElementById('cp_hgz_input').select();
    document.execCommand('copy');
    document.getElementById('cp_hgz_input').remove();
    if (callback) { callback(text) }
}





// let imgList = {}
// document.getElementById('textInput').addEventListener('paste', function (e) {

//     if (!(e.clipboardData && e.clipboardData.items)) {
//         return;
//     }
//     for (var i = 0, len = e.clipboardData.items.length; i < len; i++) {
//         var item = e.clipboardData.items[i];
//         // console.log(item);
//         // if (item.kind === "string") {
//         //     item.getAsString(function (str) {
//         //         console.log(str);
//         //     })
//         // } else 
//         if (item.kind === "file") {
//             e.preventDefault()
//             console.log("--" + item)
//             var blob = item.getAsFile();
//             // console.log(blob);


//             var data = new FormData();
//             data.append("file", blob);
//             // data.append('id', 45);
//             $.ajax({
//                 url: protocol + "//" + url + ":8080/api/attachment/upload",
//                 headers: {
//                     'Authorization': 'Bearer ' + token
//                 },
//                 type: 'POST',
//                 data: data,
//                 dataType: 'json',
//                 // contentType: "application/x-www-form-urlencoded; charset=utf-8",
//                 processData: false,
//                 contentType: false,
//                 success: function (data) {
                    
//                     console.log(data.data.thumbPath)
//                     $("#textInput").insertAtCaret("![](" + data.data.thumbPath + ")")
//                     formatHtml()
//                 }
//             });

//             if (blob.size === 0) {
//                 return;
//             }

//             let reader = new FileReader();

//             reader.readAsDataURL(blob);

//             reader.onload = function (e) {
//                 let img = document.createElement('img');
//                 img.src = e.target.result;
//                 // console.log(img)
//                 // document.body.appendChild(img);
//                 imgList["1"] = e.target.result
//                 // $("#textInput").insertAtCaret("<img src='data:image'>")
//             };
//         }
//     }
// });



$("#uploadFile").click(function (event) {
    event.stopPropagation();
    $("#uploadPanel").slideToggle("fast");

})

$("#uploadPanel").click(function (event) {
    event.stopPropagation();
})

$(document).click(function (event) {
    var uploadPanel = $("#uploadPanel")
    // 如果点击目标不是input，弹框消失
    if (!uploadPanel.is(event.target)) {

        uploadPanel.slideUp("fast");
    }
});

function handleType(attachment) {
    var mediaType = attachment.mediaType;
    // 判断文件类型
    let result = ""

    if (mediaType) {
        var prefix = mediaType.split("/")[0];
        if (prefix === "image") {
            result = "<img src='" + attachment.path + "'>"
            console.log("image")
        } else if (prefix === "audio") {
            result = "<audio controls src='" + attachment.path + "'></audio>"
            console.log("audio")
        } else if (prefix === "video") {
            result = "<video style='width:100%' controls src='" + attachment.path + "'></video>"
            console.log("video")
        } else {
            result = "<a href='" + attachment.path + "' >点击下载</a>"
            console.log("附件")
        }
        
        // $("#textInput").insertAtCaret(result)
        testEditor.insertValue(result);
    }
    // 没有获取到文件返回false
    return false;
}


$("#file").change(function () {
    var fd = new FormData();
    // 如果有多张图片一块上传，下面直接使用fd.append()继续追加即可
    if (document.getElementById("file").files[0]) {
        fd.append("file", document.getElementById("file").files[0]);
        $.ajax({
            url: protocol + "//" + url + ":8080/api/attachment/upload",
            headers: {

                'Authorization': 'Bearer ' + token
            },
            type: 'post',
            data: fd,
            dataType: 'json',
            contentType: "application/json;charset=UTF-8",
            processData: false,
            contentType: false,
            xhr: function () {
                var xhr = new XMLHttpRequest();
                //使用XMLHttpRequest.upload监听上传过程，注册progress事件，打印回调函数中的event事件
                xhr.upload.addEventListener('progress', function (e) {
                    console.log(e);
                    //loaded代表上传了多少
                    //total代表总数为多少
                    var progressRate = (e.loaded / e.total) * 100;
                    console.log(progressRate)

                    //通过设置进度条的宽度达到效果
                    $('.progress > div').css('width', progressRate + '%');
                    $('.progress > div').html(progressRate + '%')
                    if (progressRate == 100) {
                        $('.progress > div').html("上传服务器完成，请等待！")
                    }
                })

                return xhr;
            },
            success: function (data) {
                // console.log(data.data)
                
                handleType(data.data)
                $('.progress > div').html("上传完成！")
                $("#uploadPanel").slideUp("fast");
                // formatHtml()
                // cmsWrite.selectTags.push(data.data.id)
                // selectTagsMap[data.data.name] = data.data.id
                // console.log(cmsWrite.selectTags)
                // console.log(selectTagsMap)
                // articleId = data.data.id
                // Toast("更新文章" + data.data.title + "成功！", 'success')
            }
        });
    }

})


//分页加载附件数据
function loadAttachment() {
    $.ajax({
        url: protocol + "//" + url + ":8080/api/attachment/",
        headers: {
            'Authorization': 'Bearer ' + token
        },
        type: 'get',
        dataType: 'json',
        contentType: "application/json;charset=UTF-8",
        success: function (data) {
            // debugger
            // console.log(data)
            var content = ""
            for (var i = 0; i < data.data.content.length; i++) {
                content += " <li   class=\"list-group-item d-flex justify-content-between\"><img onclick=\"copyImgPath('" + data.data.content[i].path + "'," + data.data.content[i].id + ")\"  src=\"" + data.data.content[i].path + "\"><a href='javascript:;' onclick=\"updateAttachmentInput(" + data.data.content[i].id + ")\">修改</a></li>"
            }
            $("#attachment-list").html(content)


            $('.attachment').pagination({
                pageCount: data.data.totalPages,
                jump: true,
                callback: function (api) {
                    var data = {
                        page: api.getCurrent(),
                        name: 'mss',
                        say: 'oh'
                    };
                    $.ajax({
                        url: protocol + "//" + url + ":8080/api/attachment?page=" + (data.page - 1),
                        headers: {
                            'Authorization': 'Bearer ' + token
                        },
                        type: 'get',
                        dataType: 'json',
                        contentType: "application/json;charset=UTF-8",
                        success: function (data) {
                            // console.log(data.data)
                            var content = ""
                            for (var i = 0; i < data.data.content.length; i++) {
                                content += " <li   class=\"list-group-item d-flex justify-content-between\"><img onclick=\"copyImgPath('" + data.data.content[i].path + "'," + data.data.content[i].id + ")\"  src=\"" + data.data.content[i].path + "\"><a href='javascript:;' onclick=\"updateAttachmentInput(" + data.data.content[i].id + ")\">修改</a></li>"
                            }
                            $("#attachment-list").html(content)
                        }
                    });
                }
            });
        }
    });
}

// 打开附件快捷键
document.addEventListener("keydown", function (event) {
    if (event.altKey  && event.keyCode === 67) {
        // console.log("kkkkk")
        $(".drawer-attachment").css({ display: 'block' });
        $(".drawer-attachment").animate({ width: '30rem' });
        loadAttachment()
    }
})



function drawer(drawerBtn, drawerPanel) {
    // 打开关闭附件面板
    $(drawerBtn).click(function (e) {
        e.stopPropagation();

        if ($(drawerPanel).css("display") == "block") {
            $(drawerPanel).animate({ width: '0px' }, function () {
                $(drawerPanel).css({ display: 'none' });
            });
        } else {
            $(drawerPanel).css({ display: 'block' });
            $(drawerPanel).animate({ width: '30rem' });
            loadAttachment()
        }
    })
    $(document).click(function (e) {
        // console.log(!$(drawerPanel).is(e.target))
        // console.log($(drawerPanel).has(e.target).length === 0)
        if ($(drawerPanel).css("display") == "block" && $(drawerPanel).has(e.target).length === 0) {
            $(drawerPanel).animate({ width: '0px' }, function () {
                $(drawerPanel).css({ display: 'none' });
            });
        }
    })
}
drawer("#attachment", ".drawer-attachment")



// 拷贝附件路径到剪切板
function copyImgPath(path, id) {
    console.log(path + "-" + id)
    path = "![" + id + "](" + path + ")"
    copyText(path, function () {
        Toast("成功复制到剪切板！", 'success')
    })
}



/*Svg字符串上传*/
function uploadStrContentChange(originalData, svgInput, isUpdate, callback, attachmentId) {
    // let svgInput = $("#svgInput").val()
    // console.log(svgInput)
    // console.log(originalData)
    let dataRender = $("#componentInput").attr("data-render")
    let uploadUrl = protocol + "//" + url + ":8080/api/attachment/uploadStrContent"
    if (isUpdate) {
        uploadUrl += "/" + attachmentId
    }
    $.ajax({
        url: uploadUrl,
        headers: {
            'Authorization': 'Bearer ' + token
        },
        type: 'post',
        data: JSON.stringify({ "formatContent": svgInput, "originContent": originalData, renderType: dataRender }),
        dataType: 'json',
        contentType: "application/json;charset=UTF-8",
        success: function (data) {
            if (callback) {
                callback(data)
            }
            // console.log(data.data)

            $("#componentInput").val("")
        }
    });
}
mermaid.mermaidAPI.initialize({
    startOnLoad: false
});

// mermaid 图渲染
function renderMermaid(componentInput, componentPreview) {
    var needsUniqueId = "render" + (Math.floor(Math.random() * 10000)).toString(); //should be 10K attempts before repeat user finger stops working before then hopefully
    function mermaidApiRenderCallback(graph) {
        // $('#mermaidPreview').html(graph);
        componentPreview.html(graph)
    }
    try {
        mermaid.mermaidAPI.render(needsUniqueId, componentInput, mermaidApiRenderCallback);
    } catch (e) {
        componentPreview.html(componentPreview.html() + e)
    }
}

// latex 服务器渲染
function renderLatex(componentInput, componentPreview) {
    $.ajax({
        url: protocol + "//" + url + ":8080/api/latex/svg",
        headers: {
            'Authorization': 'Bearer ' + token
        },
        type: 'post',
        // dataType: 'xml',
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify({ "latex": componentInput }),
        success: function (data) {
            componentPreview.html(data)
        }
    });
}


// 原始svg监听
$("#componentInput").bind('input propertychange', function () {
    let componentPreview = $("#componentPreview")
    let componentInput = $("#componentInput").val()
    let dataRender = $("#componentInput").attr("data-render")

    if (dataRender == "mermaid") {
        renderMermaid(componentInput, componentPreview)
    } else if (dataRender == "latex") {
        renderLatex(componentInput, componentPreview)
    } else if (dataRender == "svg") {
        componentPreview.html(componentInput)
    }
});


// 上传svg字符串
let svgAttachmentId = null
function saveSvg() {
    if ($("#componentInput").val() != "") {
        uploadStrContentChange($("#componentInput").val(), $("#componentPreview").html(), false, function (data) {
            loadAttachment()
            $("#fixed-card").css("display", "none")
        })
    } else {
        Toast("内容不能为空！", 'error')
    }
}

function updateSvg() {
    if (svgAttachmentId) {
        if ($("#componentInput").val() != "") {
            uploadStrContentChange($("#componentInput").val(), $("#componentPreview").html(), true, function () {
                loadAttachment()
                $("#fixed-card").css("display", "none")
            }, svgAttachmentId)
        } else {
            Toast("内容不能为空！", 'error')
        }

    }

}

function updateAttachmentInput(id) {
    svgAttachmentId = id;
    let componentPreview = $("#componentPreview")
    $("#fixed-card").css("display", "block")
    $.ajax({
        url: protocol + "//" + url + ":8080/api/attachment/find/" + id,
        headers: {
            'Authorization': 'Bearer ' + token
        },
        type: 'get',
        dataType: 'json',
        contentType: "application/json;charset=UTF-8",
        success: function (data) {
            $("#componentInput").val(data.data.originContent)
            if (data.data.renderType == "mermaid") {
                renderMermaid(data.data.originContent, componentPreview)
                $("#componentInput").attr("data-render", "mermaid")
                $("#svg-header").html("修改mermaid")
            } else if (data.data.renderType == "latex") {

                $("#componentInput").attr("data-render", "latex")
                $("#svg-header").html("修改Latex")

                renderLatex(data.data.originContent, componentPreview)
            } else {
                $("#componentInput").attr("data-render", "svg")
                $("#svg-header").html("修改Svg")
                componentPreview.html(data.data.originContent)
            }
        }
    });
    // uploadStrContentChange($("#componentInput").val(), $("#componentPreview").html(),true,id)
    // $("#fixed-card").css("display", "none")
    // console.log(id)
}

// // 修改Svg
// $(document).on('click', '.svg-components', function () {
//     let componentPreview = $("#componentPreview")
//     var val = $(this).attr("data-attachment");
//     let dataRender = $("#componentInput").attr("data-render")
//     svgAttachmentId = val
//     $("#fixed-card").css("display", "block")
//     $.ajax({
//         url: protocol + "//" + url + ":8080/api/attachment/find/" + val,
//         headers: {
//             'Authorization': 'Bearer ' + token
//         },
//         type: 'get',
//         dataType: 'json',
//         contentType: "application/json;charset=UTF-8",
//         success: function (data) {
//             $("#componentInput").val(data.data.originContent)
//             if (dataRender == "mermaid") {
//                 renderMermaid(data.data.originContent, componentPreview)
//                 $("#componentInput").attr("data-render", "mermaid")
//                 $("#svg-header").html("修改mermaid")
//             } else if (dataRender == "latex") {

//                 $("#componentInput").attr("data-render", "latex")
//                 $("#svg-header").html("修改Latex")

//                 renderLatex(data.data.originContent, componentPreview)
//             }
//         }
//     });
// });

// 添加svg
$(".openSvgPanel").click(function () {
    let dataRender = $(this).attr("data-render")
    if (dataRender == "mermaid") {
        $("#componentInput").attr("data-render", "mermaid")
        $("#svg-header").html("插入Mermaid")
        $("#fixed-card").css("display", "block")
    } else if (dataRender == "latex") {

        $("#componentInput").attr("data-render", "latex")
        $("#svg-header").html("插入Latex")
        $("#fixed-card").css("display", "block")
    } else if (dataRender == "svg") {

        $("#componentInput").attr("data-render", "svg")
        $("#svg-header").html("插入SVG")
        $("#fixed-card").css("display", "block")
    }
})


$("#closeBtn").click(function () {
    $("#fixed-card").css("display", "none")
})