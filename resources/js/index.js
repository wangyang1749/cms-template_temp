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


function move() {
    var divMove = document.getElementById("content-table");
    if (divMove == null) return;
    divMove.onmousedown = function (e) {
        var ev = e || window.event;  //兼容ie浏览器
        //鼠标点击物体那一刻相对于物体左侧边框的距离=点击时的位置相对于浏览器最左边的距离-物体左边框相对于浏览器最左边的距离  
        var distanceX = ev.clientX - divMove.offsetLeft;
        var distanceY = ev.clientY - divMove.offsetTop;
        document.onmousemove = function (e) {
            var ev = e || window.event;  //兼容ie浏览器  
            divMove.style.left = ev.clientX - distanceX + 'px';
            divMove.style.top = ev.clientY - distanceY + 'px';
        };
        document.onmouseup = function () {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
}
// move();

function move(header,panel,closeBtn) {
    var _move = false;//移动标记  
    var _x, _y;//鼠标离控件左上角的相对位置  
    $("#"+header).click(function () {
        //alert("click");//点击（松开后触发）  
    }).mousedown(function (e) {
        _move = true;
   
        if ($("#"+panel).css("position") != "fixed") {
            $("#"+panel).css("position", "fixed");
            $("#"+panel).css("z-index", "9999");
            $("#"+panel).css("left", e.clientX);
            $("#"+panel).css("top", e.clientY);
            $("#"+closeBtn).css("display", "block");
          
        }
        _x = e.pageX - parseInt($("#"+panel).css("left"));
        _y = e.pageY - parseInt($("#"+panel).css("top"));

        $("#"+panel).fadeTo(20, 0.5);//点击后开始拖动并透明显示  
    });
    $(document).mousemove(function (e) {
        if (_move) {
            var x = e.pageX - _x;//移动时根据鼠标位置计算控件左上角的绝对位置  
            var y = e.pageY - _y;
            $("#"+panel).css({ top: y, left: x });//控件新位置  
        }
    }).mouseup(function () {
        _move = false;
        $("#"+panel).fadeTo("fast", 1);//松开鼠标后停止移动并恢复成不透明  "fast":规定褪色效果的速度。
    });
    $("#"+closeBtn).click(function () {
        $("#"+panel).css("position", "");
        $("#"+closeBtn).css("display", "none");
    })
}


