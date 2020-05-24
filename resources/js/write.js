
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
var md = window.markdownit({
    html: true,
});
function formatHtml() {

    var result = md.render($("#textInput").val());
    $("#preview").html(result);
}




$(function () {

    $("#textInput").bind('input propertychange', function () {
        this.style.height = this.scrollHeight + 'px';
        // console.log(this.style.height)
        // console.log(this.scrollHeight)

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


/**
 * 保存文章
 */
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
                dataType: "json",
                type: 'POST',
                data: JSON.stringify(createArticle()),
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
                // console.log(data.data.id)
                cmsWrite.articleId = data.data.id
                Toast("添加文章" + data.data.title + "成功！", 'success')
                window.open("/user/articleList");
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

/**
 * 全屏显示
 */
let fullEditFlag = true;
function fullEdit() {
    if (fullEditFlag) {
        $("#preview").css("display", "none")
        fullEditFlag = false
    } else {
        $("#preview").css("display", "block")
        fullEditFlag = true
    }

}

let fullPreviewFlag = true;
function fullPreview() {
    if (fullPreviewFlag) {
        $("#textInput").css("display", "none")
        fullPreviewFlag = false
    } else {
        $("#textInput").css("display", "block")
        fullPreviewFlag = true
    }

}

/**
 * 插入内容到光标处
 */
(function ($) {
    "use strict";
    $.fn.extend({
        insertAtCaret: function (myValue) {
            var $t = $(this)[0];
            if (document.selection) {
                this.focus();
                var sel = document.selection.createRange();
                sel.text = myValue;
                this.focus();
            } else
                if ($t.selectionStart || $t.selectionStart == '0') {
                    var startPos = $t.selectionStart;
                    var endPos = $t.selectionEnd;
                    var scrollTop = $t.scrollTop;
                    $t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
                    this.focus();
                    $t.selectionStart = startPos + myValue.length;
                    $t.selectionEnd = startPos + myValue.length;
                    $t.scrollTop = scrollTop;
                } else {
                    this.value += myValue;
                    this.focus();
                }
        }
    });
})(jQuery);
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





let imgList = {}
document.getElementById('textInput').addEventListener('paste', function (e) {

    if (!(e.clipboardData && e.clipboardData.items)) {
        return;
    }
    for (var i = 0, len = e.clipboardData.items.length; i < len; i++) {
        var item = e.clipboardData.items[i];
        // console.log(item);
        if (item.kind === "string") {
            item.getAsString(function (str) {
                console.log(str);
            })
        } else if (item.kind === "file") {
            e.preventDefault()
            console.log("--" + item)
            var blob = item.getAsFile();
            // console.log(blob);


            var data = new FormData();
            data.append("file", blob);
            // data.append('id', 45);
            $.ajax({
                url: protocol + "//" + url + ":8080/api/attachment/upload",
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                type: 'POST',
                data: data,
                dataType: 'json',
                // contentType: "application/x-www-form-urlencoded; charset=utf-8",
                processData: false,
                contentType: false,
                success: function (data) {
                    console.log(data.data.thumbPath)
                    $("#textInput").insertAtCaret("![](" + data.data.thumbPath + ")")
                    formatHtml()
                }
            });

            if (blob.size === 0) {
                return;
            }

            let reader = new FileReader();

            reader.readAsDataURL(blob);

            reader.onload = function (e) {
                let img = document.createElement('img');
                img.src = e.target.result;
                // console.log(img)
                // document.body.appendChild(img);
                imgList["1"] = e.target.result
                // $("#textInput").insertAtCaret("<img src='data:image'>")
            };
            // var reader = new FileReader();
            // reader.readAsDataURL(blob)

            // reader.οnlοad = function (event) {
            //     alert("ss")
            //     //获取base64流
            //     let img = document.createElement("img");
            //     img.src = e.target.result;
            //     document.body.appendChild(img);
            //     console.log(reader.result)
            //     var base64_str = event.target.result;
            //     console.log(base64_str)
            //     //div中的img标签src属性赋值，可以直接展示图片
            //     // $("#jietuImg").attr("src", base64_str);
            //     // //显示div
            //     // $("#jietuWrap").css("display", "block");
            //     // //隐藏输入文字的div
            //     // $("#jietuWrap").next().css("display", "none");
            // }




        }
    }
});



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
        $("#textInput").insertAtCaret(result)
    }
    // 没有获取到文件返回false
    return false;
}

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
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
                console.log(data.data)
                handleType(data.data)
                $('.progress > div').html("上传完成！")
                $("#uploadPanel").slideUp("fast");
                formatHtml()
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
