var yunzhidao = yunzhidao || {};

var removeOneParamFromUrl = function(requestParams, delParmName) {
    var urlParams = '';
    if (!!delParmName && requestParams.indexOf(delParmName) > -1) {
        requestParams = requestParams.substr(1);
        var paramArray = requestParams.split('&');
        for (var i = 0; i < paramArray.length; i++) {
            var paramName = paramArray[i].split('=')[0];
            if (paramName === delParmName) {
                paramArray.splice(i, 1);
                break;
            }
        }
        if (paramArray.length > 0) {
            urlParams = '?' + paramArray.join('&');
        }
    } else {
        urlParams = requestParams;
    }
    return urlParams;
};

var updateUrlParameters = function(requestParams) {
    var urlParams = requestParams;
    var delParams = ['userType', 'token'];
    for (var i = 0; i < delParams.length; i++) {
        urlParams = removeOneParamFromUrl(urlParams, delParams[i]);
    }
    return urlParams;
};

var updateWeiXinMenu = function(wx) {
    if (typeof(wx) !== 'undefined') {
        var currentPagePath = window.location.origin + $('#current_page_base_path').val() + '.html';

        var parameters = window.location.search;
        if (!!parameters) {
            currentPagePath += updateUrlParameters(parameters);
        }
        var description = $('#weChatDescription').val();
        var smallImage = $('#wechatImage').val();
        var newsTitle = $('#wechatTitle').val();
        var allowShare = $('#wechatShare').val();

        wx.onMenuShareAppMessage({
            title: newsTitle, // 分享标题
            desc: description, // 分享描述
            imgUrl: smallImage, // 分享图标
            link: currentPagePath, // 分享链接
            success: function() {},
            cancel: function() {}
        });
        wx.onMenuShareTimeline({
            title: newsTitle, // 分享标题
            imgUrl: smallImage, // 分享图标
            link: currentPagePath, // 分享链接
            success: function() {},
            cancel: function() {}
        });

        wx.hideOptionMenu();

        if (!!allowShare && allowShare === 'true') {
            wx.showAllNonBaseMenuItem();
            wx.hideMenuItems({
                menuList: [
                    'menuItem:share:qq',
                    'menuItem:openWithQQBrowser',
                    'menuItem:openWithSafari',
                    'menuItem:share:email',
                    'menuItem:share:brand',
                    'menuItem:copyUrl',
                    'menuItem:editTag',
                    'menuItem:delete',
                    'menuItem:share:QZone'
                ]
            });
        }
    }
};

/*global wx */
var obj = {};
var callback = function(json) {
    obj = $.parseJSON(json.replace(/\'/g, '\"'));
    wx.config({
        debug: false,
        appId: obj.appid,
        timestamp: obj.timestamp,
        nonceStr: obj.nonceStr,
        signature: obj.signature,
        jsApiList: [
            'checkJsApi',
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'hideMenuItems',
            'showMenuItems',
            'hideAllNonBaseMenuItem',
            'showAllNonBaseMenuItem',
            'translateVoice',
            'startRecord',
            'stopRecord',
            'onRecordEnd',
            'playVoice',
            'pauseVoice',
            'stopVoice',
            'uploadVoice',
            'downloadVoice',
            'chooseImage',
            'previewImage',
            'uploadImage',
            'downloadImage',
            'getNetworkType',
            'openLocation',
            'getLocation',
            'hideOptionMenu',
            'showOptionMenu',
            'closeWindow',
            'scanQRCode',
            'chooseWXPay',
            'openProductSpecificView',
            'addCard',
            'chooseCard',
            'openCard'
        ]
    });

    wx.ready(function() {
        updateWeiXinMenu(wx);
    });
};

$(function() {
    var localUrl = window.location.href;
    /* 动态加载javascript */
    var javascriptUrl = $('#wechatFrameworkUrl').val() +
        '&url=' + encodeURIComponent(localUrl) +
        '&timestamp=' + new Date().getTime();
    jQuery.getScript(javascriptUrl);
});
