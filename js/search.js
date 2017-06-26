var amwaysearch = amwaysearch || {};
amwaysearch.components = amwaysearch.components || {};

amwaysearch.components.search = (function($, window) {
    var yunzhidao;

    var escapeChar = function(keyword) {
        /* jshint ignore:start */
        return keyword.replace(/(\~|\`|\!|\@|\\#|\\$|\\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?|[\u00b7|\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5|\u00ae])/g, '\\\$1');
        /* jshint ignore:end */
    };

    var deleteSpecialChar = function(keyword) {
        /* jshint ignore:start */
        return keyword.replace(/(\ |\~|\`|\!|\@|\\#|\\$|\\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?|[\u00b7|\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5|\u00ae])+/g, ' ').trim();
        /* jshint ignore:end */
    };

    var getValueFromParameterName = function(name) {
        var requestParams = location.search.split('?')[1];
        if (requestParams !== undefined) {
            for (var i = 0; i < requestParams.split('&').length; i++) {
                var params = requestParams.split('&')[i];
                var paramName = params.split('=')[0];
                if (paramName === name) {
                    return params.split('=')[1];
                }
            }
        }
        return null;
    };

    var getArticleName = function(doc) {
        var articleName = '';
        if (doc && doc.host && doc.host !== '') {
            var startIndex = doc.url.indexOf('/', doc.url.indexOf(doc.host));
            var endIndex = doc.url.indexOf('.html');
            articleName = doc.url.substring(startIndex, endIndex).replace(/\//g, ':');
        }
        return articleName;
    };

    var getPromotionArticleDetailUrl = function(doc, aboId) {
        var url = '';
        var aaWorkShopDomain = yunzhidao.domainInfo.aaWorkShopDomain;
        if (aaWorkShopDomain) {
            url = aaWorkShopDomain + '/content/china/accl/aaworkshop/assistant/article.' +
                getArticleName(doc) + '.aas' + aboId + '.html';
        }
        return url;
    };

    var getArticleDetailUrl = function(doc, isABO, promotion, isWeixin) {
        var url = '';
        if (doc && doc.url) {
            url = doc.h5Url ? doc.h5Url : doc.url;

            var aboId = yunzhidao.aboInfo.aboId;
            if (isABO && aboId && promotion === 1 && !yunzhidao.aboInfo.errorCode && isWeixin) {
                url = getPromotionArticleDetailUrl(doc, aboId);
            }
        }
        return url;
    };

    var getPromotionCardUrl = function(isABO, promotion, doc) {
        var url = '';
        var aaWorkShopDomain = yunzhidao.domainInfo.aaWorkShopDomain;
        if (isABO && promotion === 1 && aaWorkShopDomain) {
            var aboId = yunzhidao.aboInfo.aboId;
            if (yunzhidao.aboInfo.errorCode || !aboId) {
                url = '/content/china/accl/ch_msg/unbound_error.html';
            } else {
                url = aaWorkShopDomain + '/content/china/accl/aaworkshop/assistant/promotionMng';
                if (aboId) {
                    url += '.aas' + aboId;
                }
                url += '.html?articleName=' + getArticleName(doc);
            }
        }
        return url;
    };

    var updateFlow = function(url) {
        // var loadAjax = $.ajax({
        //     dataType: 'json',
        //     url: 'https://ch.amwaynet.com.cn/bin/search/solr_update?action=updateFlow&content=' + encodeURIComponent(url)
        // });

        // loadAjax.done(function(data) {});

        // loadAjax.fail(function(data) {});
    };

    var showResultPage = function(url) {
        updateFlow(url);
        window.location.href = url;
    };

    var redirectUrl = function(url, contentTagSource, sourceTag) {
        window.location.href = url;
    };
    var searchByHotword = function(hotWord, source, hasTags, redirectLink, searchWord){
        /* jshint maxlen: 125 */
        if (redirectLink !== '') {
            window.location.href = redirectLink;
        } else if (hasTags === true) {
            window.location.href = 'searchResults.html?category=' + encodeURIComponent(hotWord) + '&categoryType=hotWord';
        } else if(searchWord !== ''){
            window.location.href = 'searchResults.html?keyword=' + encodeURIComponent(searchWord) + '&searchType=all';
        }else{
            window.location.href = 'searchResults.html?keyword=' + encodeURIComponent(hotWord) + '&searchType=all';
        }
    };
    /* jshint maxlen: 120 */
     var searchByCategory = function(categoryType, category, hasChild, redirectLink) {
        if (redirectLink !== '') {
            window.location.href = redirectLink;
            return false;
        }
        if (hasChild === true) {
           window.location.href = 'category.' + categoryType + '.' + category + '.html';
        } else {
            window.location.href = 'searchResults.html?category=' + category + '&categoryType=' + categoryType;
        }
    };
    var getQrCodeHtml = function() {
        /* jshint maxlen: 160 */
        return '<div class="qr_code_pc_outer"><div class="qr_code_pc_inner"><div class="qr_code_pc">' +
               '<img id="js_pc_qr_code_img" class="qr_code_pc_img" src="/etc/designs/china/accl/amwaychina/clientlibs-cn-solrSearch/images/qrcode.jpg">' +
               '<p>关注安利云服务<br>产品服务全知道</p></div></div></div>';
    };

    var addQrCodeSection = function() {
        $('footer').before(getQrCodeHtml());
    };

    function bindEvents() {
    }

    function start() {
        yunzhidao = window.yunzhidao || {};
    }

    return {
        init: function() {
            start();
            bindEvents();
        },
        escapeChar: escapeChar,
        deleteSpecialChar: deleteSpecialChar,
        getValueFromParameterName: getValueFromParameterName,
        getArticleDetailUrl: getArticleDetailUrl,
        getPromotionCardUrl: getPromotionCardUrl,
        showResultPage: showResultPage,
        redirectUrl: redirectUrl,
        searchByHotword: searchByHotword,
        searchByCategory: searchByCategory,
        addQrCodeSection: addQrCodeSection
    };
})($, window);

$(function() {
    amwaysearch.components.search.init();
});
