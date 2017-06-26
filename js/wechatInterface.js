var amwaysearch = amwaysearch || {};
amwaysearch.components = amwaysearch.components || {};

amwaysearch.components.wechatInterface = (function($, window) {
    var yunzhidao;

    var getUserInfo = function(callback) {
        // 10.4.1 URL（支持GET、POST方法）
        var loadJsonp = $.jsonp({
            async: false,
            type: 'get',
            callbackParameter: 'callback',
            url: yunzhidao.authenticationInfo.urlForWxUserinfo +
                '?userType=' + yunzhidao.authenticationInfo.wxUserType + '&t=' + Math.random() +
                '&token=' + sessionStorage.getItem('token')
        });

        loadJsonp.done(function(data) {
            if (data) {
                if (!!data.ada && data.ada !== '') {
                    yunzhidao.authenticationInfo.adaNum = data.ada;
                    yunzhidao.authenticationInfo.isAboUser = true;
                }
            }

            if (callback !== null && callback !== undefined) {
                callback();
            }
        });

        loadJsonp.fail(function() {
            if (callback !== null && callback !== undefined) {
                callback();
            }
            sessionStorage.removeItem('token');
        });
    };

    var initToken = function(callback) {
        yunzhidao = window.yunzhidao || {};
        var tokenFromRequest = amwaysearch.components.search.getValueFromParameterName('token');

        if (sessionStorage.getItem('token') !== null) {
            getUserInfo(callback);
        } else if (tokenFromRequest !== null) {
            sessionStorage.setItem('token', tokenFromRequest);
            getUserInfo(callback);
        } else {
            if (tokenFromRequest === null) {
                // 10.3.1URL（只支持POST方法）
                sessionStorage.removeItem('token');
                window.location.href = yunzhidao.authenticationInfo.urlForWxToken;
            }
        }
    };

    return {
        initToken: initToken
    };
})($, window);
