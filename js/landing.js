var amwaysearch = amwaysearch || {};
amwaysearch.components = amwaysearch.components || {};

amwaysearch.components.landing = (function(window, $) {
    var yunzhidao;
    var isABO = false;
    var displayCount = 0;

    //Daily Update
    var getArticleSourceHtml = function(articleProperty) {
        /* jshint maxlen: 180 */
        var articleTagTitle = articleProperty.articleTagTitle ? articleProperty.articleTagTitle : '';
        var html = '<div class="item origin">';
        if (articleTagTitle) {
            html += '<div class="abs-con"><a href="javascript:void (0);" class="text am-text-truncate articlelable" onclick="amwaysearch.components.search.redirectUrl(\'' +
                    'searchResults.html?categoryType=tag&category=' + encodeURIComponent(articleTagTitle) +
                    '\',\''+ window.yunzhidao.analytics.contentTagSource['dailyUpdate'] +
                    '\',\''+ articleTagTitle +'\');">'+ articleTagTitle + '</a></div>';
        }
        html += '</div>';
        return html;
    };
    var getPromotionHtml = function(articleProperty, isABO, promotionValue) {
        /* jshint maxlen: 150 */
        var html = '<div class="item">';
        if (promotionValue === 1 && !!yunzhidao.config.isWeixin && isABO) {
            html += '<a href="javascript:void (0);" class="btn-generalize articlelable" onclick="amwaysearch.components.search.redirectUrl(\'' +
                    amwaysearch.components.search.getPromotionCardUrl(isABO, promotionValue, articleProperty) +
                    '\');"><i class="svg-icon icon-18"></i><span>' + yunzhidao.searchInfo.labels.promotionAssistant + '</span></a>';
        }
        html += '</div>';
        return html;
    };
    var getArticleLableHtml = function(articleProperty, isABO, promotionValue) {
        var articleSourceHtml = getArticleSourceHtml(articleProperty);
        var promotionHtml = getPromotionHtml(articleProperty, isABO, promotionValue);
        var html = '<div class="bar-b">' + articleSourceHtml + promotionHtml + '</div>';
        return html;
    };
    var getThubnialHtml = function(articleProperty) {
        /* jshint maxcomplexity: 6 */
        /* jshint maxlen: 130 */
        var thubnailUrl =  articleProperty.thubnailUrl ? articleProperty.thubnailUrl : '';
        var thubnailTitle = articleProperty.thubnailTitle ? articleProperty.thubnailTitle : '';
        var titleBackGround = articleProperty.titleBackGround ? articleProperty.titleBackGround : '';
        if (thubnailUrl !== '') {
            var html = '<a href="javascript:void (0);" class="thumbnail" style="background-image: url(\''+ thubnailUrl +'\')">';
            if (thubnailTitle !== '') {
                html += '<div class="tag '+ titleBackGround +' am-text-truncate">'+ thubnailTitle +'</div>';
            }
            html += '</a>';
            return html;
        } else {
            return '';
        }
    };
    var getMainDivHtml = function(articleProperty, isABO, promotionValue) {
        /* jshint maxlen: 160 */
        var articleTitle = articleProperty.title ? articleProperty.title : '无标题';
        var articleTitleHtml = '<a href="javascript:void (0);" class="desc title dot-ellipsis dot-resize-update is-truncated">'+ articleTitle +'</a>';
        var articleLableHtml = getArticleLableHtml(articleProperty, isABO, promotionValue);
        var html = '<div class="text-con">' + articleTitleHtml + articleLableHtml + '</div>';
        return html;
    };
    var contentDisplay = function(articlesDisplay, startIndex) {
        /* jshint maxlen: 150 */
        var endIndex = startIndex + 3;
        for (startIndex; startIndex < endIndex; startIndex++) {
            if (startIndex > articlesDisplay.length-1) {
                break;
            }
            var articleProperty = articlesDisplay[startIndex];
            var promotionValue = (articleProperty.promotion && articleProperty.promotion === 'true')? 1 : 0;
            var thubnialHtml = getThubnialHtml(articleProperty);
            var mainHtml = getMainDivHtml(articleProperty, isABO ,promotionValue);
            var html = '<li onclick="amwaysearch.components.search.showResultPage(\'' +
                       amwaysearch.components.search.getArticleDetailUrl(articleProperty, isABO, promotionValue, yunzhidao.config.isWeixin) +
                       '\');">' + thubnialHtml + mainHtml + '</li>';
            $('.info-list').append(html);
        }
        $('.text-con .articlelable').click(function(e) {
            e.stopPropagation();
        });
    };
    var initDailyUpdate = function(articlesData) {
        /* jshint maxcomplexity: 9 */
        isABO = yunzhidao.authenticationInfo.isAboUser;
        if (articlesData && articlesData.length > 0) {
            var articlesDisplay = [];
            var articleNum = 0;
            for (var index =0; index < articlesData.length; index++) {
                var article = articlesData[index];
                var aboReadOnly = article.aboReadOnly ? article.aboReadOnly : '';
                var shareForbidden = article.shareForbidden ? article.shareForbidden : '';
                if ((aboReadOnly && !isABO) || (shareForbidden && !yunzhidao.config.isWeixin)) {
                    continue;
                }
                articlesDisplay[articleNum] = article;
                articleNum++;
            }

            if (articlesDisplay && articlesDisplay.length > 0) {
                if (articlesDisplay.length <= 3) {
                    $('#dailyUpdate .btn-w').hide();
                }
                contentDisplay(articlesDisplay, 0);
                displayCount ++;
            } else {
                $('#dailyUpdate').hide();
            }

            $('#dailyUpdate .btn-w').on('click', function() {
                $('#dailyUpdate .info-list').empty();
                var startIndex = displayCount * 3;
                contentDisplay(articlesDisplay, startIndex);
                displayCount ++;
                var pageNum = Math.ceil(articlesDisplay.length / 3);
                if (displayCount >= pageNum) {
                    displayCount = 0;
                }
            });
        } else {
            $('#dailyUpdate').hide();
        }
    };

    var displayButtonAndTrain = function() {
        if (window.isAbo) {
            $('#categoryType [categorytype="training"]').show();
        } else {
            $('#categoryType [categorytype="training"]').remove();
            $('.am-tabs').tabs('refresh');
        }
    };

    var addLiElement = function() {
        //add <li></li> for category btn-list
        for (var i=0; i<$('.btn-list').length; i++) {
            var item = $($('.btn-list')[i]);
            var l = ($('li', item).length)%4;
            if (l > 0) {
                for (var j=4; j>l; j--) {
                    item.append('<li></li>');
                }
            }
        }
    };

    function start() {
        yunzhidao = window.yunzhidao || {};
        addLiElement();
    }

    function bindEvents() {
        $('#searchBar').on('click', function() {
            amwaysearch.components.searchinput.setParamsAndValue();
            window.location.href = 'searchInput.html';
        });
    }

    return {
        init: function() {
            if ($('#landingPage').length > 0) {
                start();
                bindEvents();
            }
        },
        initDailyUpdate: initDailyUpdate,
        displayButtonAndTrain: displayButtonAndTrain
    };
})(window, $);

$(function() {
    amwaysearch.components.landing.init();
});
