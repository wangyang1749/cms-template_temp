// var bolb = new Blob([ss],{type:"audio/mpeg"});
// var url = window.URL.createObjectURL(bolb);
/******************************单词点击发音***************************** */
var sound = $(".sound")
if (sound.length != 0) {
    // console.log("exist sound"+sound.length)
    var audio = document.createElement("audio");


    // console.log($(".sound").length)
    sound.each(function (i) {
        // console.log(  $(sound[i]).attr('naudio'))
        $(sound[i]).click(function () {
            // console.log($(sound[i]).attr('naudio'))
            audio.src = $(sound[i]).attr('naudio');
            // audio.controls = "controls";
            document.body.appendChild(audio);
            audio.play();
        })
    })
}





// sound.click(function(){
//   var a=$(this).index;
//   console.log(a)
// })
/***************************分享代码****************************** */
function shareTo(stype) {
    var ftit = '';
    var flink = '';
    var lk = '';
    var summary = '生命科学知识分享';
    //获取文章标题
    ftit = $('title').text();
    console.log(ftit)
    //获取网页中内容的第一张图片
    flink = $('.markdown').find('img').eq(0).attr('src');
    if (typeof flink == 'undefined') {
        flink = '';
    }
    // console.log(flink)
    //当内容中没有图片时，设置分享图片为网站logo
    // if (flink == '') {
    //   lk = 'http://' + window.location.host + '/static/images/logo.png';
    // }
    //如果是上传的图片则进行绝对路径拼接
    if (flink.indexOf('/uploads/') != -1) {
        lk = 'http://' + window.location.host + flink;
    }
    if (document.querySelector('meta[name="description"]')) {
        summary = document.querySelector('meta[name="description"]').getAttribute('content')
    }


    //qq空间接口的传参
    if (stype == 'qzone') {
        // console.log('https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + document.location.href + '&sharesource=qzone&title=' + ftit + '&pics=' + flink + '&summary=' + "122")
        window.open('https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + document.location.href + '&sharesource=qzone&title=' + ftit + '&pics=' + flink + '&summary=' + summary);
    }


    // //新浪微博接口的传参
    // if (stype == 'sina') {
    //     window.open('http://service.weibo.com/share/share.php?url=' + document.location.href + '?sharesource=weibo&title=' + ftit + '&pic=' + lk + '&appkey=2706825840');
    // }
    // //qq好友接口的传参
    // if (stype == 'qq') {
    //     window.open('http://connect.qq.com/widget/shareqq/index.html?url=' + document.location.href + '?sharesource=qzone&title=' + ftit + '&pics=' + lk + '&summary=' + document.querySelector('meta[name="description"]').getAttribute('content') + '&desc=php自学网，一个web开发交流的网站');
    // }
    // //生成二维码给微信扫描分享
    // if (stype == 'wechat') {
    //     window.open('inc/qrcode_img.php?url=http://zixuephp.net/article-1.html');
    // }
}

// 图片居中
$('.markdown p').find('> img').parent().css({"display":'flex',"justify-content":"center"});


// 图片点击放大
$(".markdown img").click(function () {
    var imgsrc = $(this).attr("src");
    var opacityBottom = '<div id="opacityBottom" style="display: none"><img class="bigImg" src="' + imgsrc + '" ></div>';
    $(document.body).append(opacityBottom);
    toBigImg();//变大函数
});

function toBigImg() {

    $("#opacityBottom").addClass("opacityBottom");
    $("#opacityBottom").show();
    $("html,body").addClass("none-scroll");//下层不可滑动
    $(".bigImg").addClass("bigImg");
    /*隐藏*/
    $("#opacityBottom").bind("click", clickToSmallImg);
    $(".bigImg").bind("click", clickToSmallImg);
    var imgHeight = $(".bigImg").prop("height");
    // if (imgHeight < h) {
    //     $(".bigImg").css({ "top": (h - imgHeight) / 2 + 'px' });

    // } else {
    //     $(".bigImg").css({ "top": '0px' });
    // }
    function clickToSmallImg() {
        $("html,body").removeClass("none-scroll");
        $("#opacityBottom").remove();
    }
};
