$(function () {
    if (document.body.clientWidth < 992) {
        // console.log("aa")
        var navBar = $("#mobile-nav1");
        var navBar2 = $("#mobile-nav2");
        var titleTop = navBar.offset().top;

        $(window).scroll(function () {
            var btop = $(window).scrollTop();



            if (btop > titleTop) {
                navBar.addClass('mobile-fix');
                // console.log(navBar.outerHeight()+16)
                let navBarOuterHeight = navBar.outerHeight() + 16
                navBar2.css("margin-top", navBarOuterHeight + "px");
            } else {
                navBar.removeClass('mobile-fix');
                navBar2.css("margin-top", 0);
            }
        })
    }

});

//手机搜索

$(function () {
    $("#mobile-search").click(function () {
        $("#search-panel").slideToggle("fast"); 
    });
});

// 百度自动推送
(function () {
    var bp = document.createElement('script');
    var curProtocol = window.location.protocol.split(':')[0];
    if (curProtocol === 'https') {
        bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
    }
    else {
        bp.src = 'http://push.zhanzhang.baidu.com/push.js';
    }
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(bp, s);
})();