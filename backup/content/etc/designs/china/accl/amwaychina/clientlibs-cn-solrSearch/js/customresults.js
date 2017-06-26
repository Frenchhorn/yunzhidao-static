var amwaysearch = amwaysearch || {};
amwaysearch.components = amwaysearch.components || {};

amwaysearch.components.customresults = (function($, window) {
    var yunzhidao;
    var isABO = false;
    var maxArticleNumPerPage = 6;
    var pageCount = 0;
    var currentPageNo = 0;
    var articleCount = 0;

    var getSearchUrl = function(keyword, searchType) {
        return '/content/china/accl/solr/searchResults.html?keyword=' +
               encodeURIComponent(keyword) + '&searchType=' + searchType;
    };
    var searchByKeyword = function(keyword, searchType) {
        if (keyword && searchType) {
            window.location.href = getSearchUrl(keyword, searchType);
        }
    };

    var showImageDetail = function(url, title) {
        window.location.href = '/content/china/accl/solr/imageDetail.html?src=' +
                               encodeURIComponent(url) + '&title=' + encodeURIComponent(title);
    };

    var onSearchClick = function() {
        searchByKeyword($('#autocomplete').val().trim(), 'all');
    };

    var doImageSearch = function(keyword) {
        searchByKeyword(keyword.trim(), 'image');
    };

    var getImageQueryString = function(keyword) {
        var queryStr = '((title:' + keyword + '^1000.0) OR (description:' + keyword + ') OR ' +
                       '(strippedContent:' + keyword + ') OR (metatag.keywords:' + keyword + '))';
        return yunzhidao.searchInfo.urls.solrServerPath + '_image/select?q=' +
               encodeURIComponent(queryStr) + '&wt=json&indent=true&rows=4';
    };

    var showOneImageAreaBySearch = function(keyword, expectedIndex) {
        var loadAjax = $.ajax({
            dataType: 'jsonp',
            jsonp: 'json.wrf',
            url: getImageQueryString(keyword)
        });

        loadAjax.done(function(data) {
            if (data && data.response) {
                if (data.response.numFound > 0) {
                    /* jshint maxlen: 140 */
                    var html = '<li><a href="javascript:void(0);" class="title am-text-truncate"'+
                               ' onclick="amwaysearch.components.customresults.doImageSearch(\'' + keyword + '\')">' +
                               '<em>' + keyword + '</em>图片搜索</a><ul class="search-imgs am-avg-sm-4">';
                    data.response.docs.forEach(function(doc) {
                        var title = doc.title ? doc.title : '无标题';
                        var url = doc.url ? doc.url : '';
                        if ('https:' === document.location.protocol) {
                            url = url.replace('http:', 'https:');
                        }
                        var resizeImgUrl = url.substring(0, url.lastIndexOf('.')) + '.resize.268' +
                            url.substring(url.lastIndexOf('.'));
                        var srcUrl = url.lastIndexOf('.') > -1 ? resizeImgUrl : url;
                        html += '<li><a class="thumbnail img_contain" href="javascript:void(0);"' +
                                ' onclick="amwaysearch.components.customresults.showImageDetail(\'' + url + '\',\'' + title + '\')"' +
                                ' style="background-image:url(\'' + srcUrl + '\')">' + '</a></li>';
                    });
                    html += '</ul></li>';

                    $('#imgArea' + expectedIndex).replaceWith(html);
                } else {
                    $('#imgArea' + expectedIndex).replaceWith('');
                }
            }
        });

        loadAjax.fail(function() {});
    };

    // This function should be called after init articleCount.
    var isImageIndexForCurrentPage = function(expectedIndex, startIndex) {
        var isValidIndex = false;

        var endIndex = startIndex + maxArticleNumPerPage - 1;
        if (startIndex === 1) {
            startIndex = 0;
            endIndex = maxArticleNumPerPage;
        }

        if (endIndex < articleCount) {
            if (expectedIndex >= startIndex && expectedIndex <= endIndex) {
                isValidIndex = true;
            }
        } else {
            if (expectedIndex >= startIndex) {
                isValidIndex = true;
            }
        }
        return isValidIndex;
    };

    // This function should be called after initPagination.
    var showAllImageArea = function() {
        var displayStartIdx = 1;
        var pageNo = amwaysearch.components.search.getValueFromParameterName('page');
        pageNo = pageNo ? pageNo : 1;
        if (pageNo > 1) {
            displayStartIdx = (pageNo - 1) * maxArticleNumPerPage + 1;
        }

        $.each(yunzhidao.customInfo.imageInfo, function(index, imageArea) {
            if (isImageIndexForCurrentPage(imageArea.position, displayStartIdx)) {
                showOneImageAreaBySearch(imageArea.keyword, imageArea.position);
            }
        });
    };
    var getImageIndexArrayForCurrentPage = function(startIndex) {
        var array = [];
        $.each(yunzhidao.customInfo.imageInfo, function(index, imageArea) {
            if (isImageIndexForCurrentPage(imageArea.position, startIndex)) {
                array.push(parseInt(imageArea.position));
            }
        });
        return array;
    };
    var getAllImageIndex = function() {
        var array = [];
        $.each(yunzhidao.customInfo.imageInfo, function(index, imageArea) {
            array.push(parseInt(imageArea.position));
        });
        return array;
    };

    var getPageCount = function() {
        return articleCount === 0 ? 1 : Math.ceil(articleCount / maxArticleNumPerPage);
    };
    var getCurrentPageNo = function(startIndex) {
        return startIndex ? (startIndex / maxArticleNumPerPage + 1) : 1;
    };
    var initPagination = function(data, startIndex) {
        pageCount = getPageCount();
        currentPageNo = getCurrentPageNo(startIndex);

        $('#currentPage').text(currentPageNo + ' / ' + pageCount);
        $('.pagination .btn').attr('disabled',true);
        if (currentPageNo >= 2) {
            $('#first-page').attr('disabled',false);
            $('#prev-page').attr('disabled',false);
        }
        if (currentPageNo < pageCount) {
            $('#next-page').attr('disabled',false);
            $('#last-page').attr('disabled',false);
        }
    };
    var changePage = function(pageNo) {
        handleHistory(pageNo);
        if (pageNo > 1) {
            var startIndex = (pageNo - 1) * maxArticleNumPerPage;
            showPageContentBySearch(startIndex);
        } else {
            showPageContentBySearch(0);
        }
    };
    var firstPage = function() {
        changePage(1);
    };
    var prevPage = function() {
        changePage(currentPageNo - 1);
    };
    var nextPage = function() {
        changePage(currentPageNo + 1);
    };
    var lastPage = function() {
        changePage(pageCount);
    };

    var updateViewMoreButtonStyle = function() {
        if (currentPageNo < pageCount) {
            $('#view-more-btn').addClass('dn');
        } else {
            $('#view-more-btn').removeClass('dn');
        }
    };

    var addOuterContentDivHtml = function(doc, promotion, innerHtml) {
        /* jshint maxlen: 150 */
        var divUrl = amwaysearch.components.search.getArticleDetailUrl(doc, isABO, promotion, yunzhidao.config.isWeixin);
        return '<li onclick="amwaysearch.components.search.showResultPage(\'' + divUrl + '\');">' + innerHtml + '</li>';
    };
    var getDisplayTitleHtml = function(data, doc) {
        /* jshint maxlen: 150 */
        var maxTitle = yunzhidao.searchInfo.pageSetting.maxTitle;
        var title = data.highlighting[doc.id].title ? data.highlighting[doc.id].title[0] : doc.title ? doc.title.substring(0, maxTitle) : '无标题';
        return '<a href="javascript:void (0);" class="title am-text-truncate">' + title + '</a>';
    };
    var addMainDivHtml = function(innerHtml) {
        return '<div class="search-content rel">' + innerHtml + '</div>';
    };
    var getThumbnailDivHtml = function(doc, showVideoBtn, showVideoLen) {
        var html = '';
        var thumbnail = amwaysearch.components.searchresult.getThumbnail(doc);
        if (thumbnail) {
            var bgImgUrl = amwaysearch.components.searchresult.getThumbnailDomain(doc) + thumbnail;
            html = '<a href="javascript:void (0);" class="thumbnail"' +
                   ' style="background-image: url(' + bgImgUrl + ')">';
            if (showVideoBtn) {
                html += '<div class="video-flag"></div>';
            }
            if (showVideoLen) {
                html += getVideoLengthHtml(doc);
            }
            html += '</a>';
        }
        return html;
    };
    var getPreviewContentDivHtml = function(text, doc, video, promotion) {
        var html = '<div class="text-con">';
        if (text) {
            html += getPreviewTextDivHtml(text);
        }
        html += getPreviewOthersDivHtml(doc, video, promotion) + '</div>';
        return html;
    };
    var getPreviewTextDivHtml = function(text) {
        if (text.trim()) {
            text = text.trim() + '...';
        }
        return '<a href="javascript:void (0);" class="desc dot-ellipsis dot-resize-update" ' +
               'style="word-wrap: break-word;">' + text + '</a>';
    };
    var getArticlePreviewText = function(data, doc) {
        /* jshint maxlen: 195 */
        /* jshint maxcomplexity: 6 */
        var maxDescription = yunzhidao.searchInfo.pageSetting.maxDescription;
        var maxStrippedContent = yunzhidao.searchInfo.pageSetting.maxStrippedContent;
        var description = data.highlighting[doc.id].description ? data.highlighting[doc.id].description[0] : doc.description ? doc.description.substring(0, maxDescription) : '';
        var content = data.highlighting[doc.id].strippedContent ? data.highlighting[doc.id].strippedContent[0] : doc.strippedContent ? doc.strippedContent.substring(0, maxStrippedContent) : '';
        return description.trim() !== '' ? description : content;
    };
    var getPreviewOthersDivHtml = function(doc, video, promotion) {
        /* jshint maxlen: 120 */
        var innerHtml = getAttachmentsHtml(doc);
        if (video) {
            innerHtml += getDataAndTagHtml(getDisplayTagHtml(doc) + getPublishdateHtml(getVideoPublishdate(doc)));
        } else {
            innerHtml += getDataAndTagHtml(getDisplayTagHtml(doc) + getPublishdateHtml(getArticlePublishdate(doc)));
        }

        if (isABO && promotion === 1 && yunzhidao.config.isWeixin) {
            var promotionCardUrl = amwaysearch.components.search.getPromotionCardUrl(isABO, promotion, doc);
            innerHtml += getPromotionIconDivHtml(promotionCardUrl, yunzhidao.searchInfo.labels.promotionAssistant);
        } else {
            innerHtml += '<div class="item"></div>';
        }
        return innerHtml ? ('<div class="bar-b">' + innerHtml + '</div>') : '';
    };

    var getAttachmentsHtml = function(doc) {
        /* jshint maxlen: 110 */
        var html = '';
        var attachments = (doc.attachments && doc.attachments.join('') !== '') ? doc.attachments : '';
        if (attachments) {
            $.each(attachments, function(index, attachment) {
                if (index < 2) {
                    var iconType = amwaysearch.components.searchresult.getIconType(attachment);
                    html += '<span class="frame-radius red">' + iconType + '</span>';
                } else {
                    return false;
                }
            });
        }
        return '<div class="item">' + html + '</div>';
    };
    var getVideoLengthHtml = function(doc) {
        var videoLength = getVideoLength(doc);
        return videoLength ? ('<div class="duration">' + videoLength + '</div>') : '';
    };
    var getVideoLength = function(doc) {
        var videoLength = '';
        if (doc.videoLen && doc.videoLen !== '') {
            videoLength = (doc.videoLen + '').toHHMMSS();
        } else if (doc['metatag.videolength'] && doc['metatag.videolength'] !== '') {
            videoLength = (doc['metatag.videolength'] + '').toHHMMSS();
        }
        return videoLength;
    };
    var getPromotionIconDivHtml = function(promotionCardUrl, buttonLabel) {
        /* jshint maxlen: 110 */
        return '<div class="item"><a href="' + promotionCardUrl + '" class="btn-generalize">' +
               '<i class="svg-icon icon-18"></i><span class="text">' + buttonLabel + '</span></a></div>';
    };
    var getDataAndTagHtml = function(innerHtml) {
        return '<div class="item origin"><div class="abs-con">' + innerHtml + '</div></div>';
    };
    var getDisplayTagHtml = function(doc) {
        /* jshint maxlen: 160 */
        var contentTags = yunzhidao.searchInfo.list.contentTags;
        var displayTag = amwaysearch.components.searchresult.getDisplayTag(doc, contentTags);

        return displayTag ? ('<a class="text with-date am-text-truncate" href="javascript:void(0)" onclick="amwaysearch.components.search.redirectUrl(\'' +
               yunzhidao.searchInfo.urls.searchResultPath + '?categoryType=tag&category=' + encodeURIComponent(displayTag) + '\',\'' +
               window.yunzhidao.analytics.contentTagSource['customResultPage'] + '\',\'' + displayTag + '\');">' + displayTag + '</a>') : '';
    };
    var getPublishdateHtml = function(publishdate) {
        return publishdate ? ('<span class="date">' + publishdate + '</span>') : '';
    };
    var getVideoPublishdate = function(doc) {
        var publishdate = '';
        if (doc.videoPublishDate && doc.videoPublishDate !== '') {
            publishdate = (doc.videoPublishDate + '').substring(0, 10);
        } else {
            publishdate = getArticlePublishdate(doc);
        }
        return publishdate;
    };
    var getArticlePublishdate = function(doc) {
        var publishdate = '';
        if (doc['metatag.publishdate'] && doc['metatag.publishdate'] !== '') {
            publishdate = (doc['metatag.publishdate'] + '').substring(0, 10);
        }
        return publishdate;
    };
    var addOneVideoContentSection = function(data, doc, promotion) {
        /* jshint maxlen: 130 */
        var text = getArticlePreviewText(data, doc);

        var titleHtml = getDisplayTitleHtml(data, doc);
        var thumbnailHtml = getThumbnailDivHtml(doc, true, true);
        var previewContentHtml = getPreviewContentDivHtml(text, doc, true, promotion);
        var innerHtml = titleHtml + thumbnailHtml + previewContentHtml;
        var contentHtml = addOuterContentDivHtml(doc, promotion, innerHtml);

        $('.content-group .info-list').append(contentHtml);
    };
    var addOneArticleContentSection = function(data, doc, promotion) {
        /* jshint maxlen: 130 */
        var text = getArticlePreviewText(data, doc);

        var titleHtml = getDisplayTitleHtml(data, doc);
        var thumbnailHtml = getThumbnailDivHtml(doc, false, false);
        var previewContentHtml = getPreviewContentDivHtml(text, doc, false, promotion);
        var innerHtml = titleHtml + thumbnailHtml + previewContentHtml;
        var contentHtml = addOuterContentDivHtml(doc, promotion, innerHtml);

        $('.content-group .info-list').append(contentHtml);
    };
    var addOneEmptyImageAreaDiv = function(expectedIndex) {
        var contentHtml = '<div id="imgArea' + expectedIndex + '"></div>';

        if (expectedIndex === 0) {
            $('.content-group .info-list').prepend(contentHtml);
        } else {
            $('.content-group .info-list').append(contentHtml);
        }
    };
    var addOneEmptyImageArea = function(imgIdxArray, expectIndex) {
        var arrayIdx = imgIdxArray.indexOf(expectIndex);
        if (arrayIdx > -1) {
            addOneEmptyImageAreaDiv(expectIndex);
            imgIdxArray.splice(arrayIdx, 1);
        }
    };
    var addEmptyImageSectionForValidImgIdx = function(imgIdxArray, currentIndex) {
        var arrayIdx = -1;
        if (currentIndex === 0) {
            addOneEmptyImageArea(imgIdxArray, 0);
            addOneEmptyImageArea(imgIdxArray, 1);
        } else {
            addOneEmptyImageArea(imgIdxArray, currentIndex + 1);
        }
    };
    var addEmptyImageSectionForInvalidImgIdx = function(imgIdxArray) {
        $.each(imgIdxArray, function(index, imageIndex) {
            addOneEmptyImageAreaDiv(imageIndex);
        });
    };

    var getArticleQueryString = function(startIndex) {
        /* jshint maxlen: 165 */
        var keyword = $('#customTitle').text().trim();
        var pageId = yunzhidao.searchInfo.pageId;
        var queryStr = '((title:' + keyword + '^1000.0) OR (description:' + keyword + ') OR (strippedContent:' + keyword + ') OR (customCategory:' + pageId + '))';
        var filterStr = 'customCategory:' + pageId;
        if (!isABO) {
            filterStr += ' AND -aboReadOnly:1';
        }
        if (!yunzhidao.config.isWeixin) {
            filterStr += ' AND -allowShare:0';
            filterStr += ' AND -id:*/content/china/accl/aaworkshop/mobile/clientpages/productdetail*';
        }
        var sortStr = pageId + '_customOrder asc';

        return yunzhidao.searchInfo.urls.solrServerPath + '_fulltext/select?q=' + encodeURIComponent(queryStr) +
            '&fq=' + encodeURIComponent(filterStr) + '&sort=' + encodeURIComponent(sortStr) +
            '&start=' + startIndex + '&rows=' + maxArticleNumPerPage + '&wt=json&indent=true';
    };

    var showPageContentBySearch = function(startIndex) {
        /* jshint maxlen: 135 */
        if (startIndex === undefined) {
            var pageNo = amwaysearch.components.search.getValueFromParameterName('page');
            pageNo = pageNo ? pageNo : 1;
            startIndex = (pageNo - 1) * maxArticleNumPerPage;
        }

        $('.content-group .info-list').empty();

        var loadAjax = $.ajax({
            dataType: 'jsonp',
            jsonp: 'json.wrf',
            url: getArticleQueryString(startIndex)
        });

        loadAjax.done(function(data) {
            if (data && data.response) {
                var imgIdxArray;
                if (data.response.numFound > 0) {
                    articleCount = data.response.numFound;
                    imgIdxArray = getImageIndexArrayForCurrentPage(startIndex + 1);

                    data.response.docs.forEach(function(doc, idx) {
                        var promotion = doc.promotion ? doc.promotion : '';
                        if (doc.videoPath && doc.videoPath.join('') !== '') {
                            addOneVideoContentSection(data, doc, promotion);
                        } else {
                            addOneArticleContentSection(data, doc, promotion);
                        }

                        if (imgIdxArray.length > 0) {
                            addEmptyImageSectionForValidImgIdx(imgIdxArray, (startIndex + idx));
                        }
                    });
                } else {
                    imgIdxArray = getAllImageIndex();
                }

                if (imgIdxArray.length > 0) {
                    addEmptyImageSectionForInvalidImgIdx(imgIdxArray);
                }

                initPagination(data, startIndex);
                if($('#view-more-btn').length > 0) {
                    updateViewMoreButtonStyle();
                }
            }
            amwaysearch.components.searchresult.runCallbackFunction(showAllImageArea);
            $('.bar-b a').click(function(e) {
                e.stopPropagation();
            });
        });

        loadAjax.fail(function(data) {
            amwaysearch.components.searchresult.runCallbackFunction(showAllImageArea);
        });
    };

    var getUpdateSolrString = function(action, content) {
        return '/bin/search/solr_update?action=' + action + '&content=' + content;
    };
    var saveArticleUrlsToSolr = function(content) {
        var loadAjax = $.ajax({
            dataType: 'json',
            url: getUpdateSolrString('updateCustomCategory', content)
        });

        loadAjax.done(function(data) {});

        loadAjax.fail(function(XHR, textStatus, errorThrown) {
        });
    };

    var updateParameters = function() {
        /*globals updateCustomInfo: false */
        updateCustomInfo();

        isABO = yunzhidao.authenticationInfo.isAboUser;
        maxArticleNumPerPage = yunzhidao.customInfo.maxArticleNumPerPage;
    };

    var initCustomPage = function() {
        updateParameters();
        amwaysearch.components.searchresult.getAboInfoAndCallback(showPageContentBySearch);
    };
    var handleHistory = function(page) {
        var appendParam = (!!page && page > 1) ? 'page=' + page : '';
        var url = window.location.href.split('?')[0] + (appendParam ? ('?' + appendParam) : '');
        if (url !== window.location.href) {
            history.pushState({}, window.title, url);
            /*global wx */
            if (!!yunzhidao.config.isWeixin && !!wx) {
                /*globals updateWeiXinMenu: false */
                updateWeiXinMenu(wx);
            }
        }
    };
    var showHistoryPage = function() {
        var pageNo = 1;
        var query = decodeURIComponent(window.location.href.split('?')[1]);

        $.each(query.split('&'), function(index, queryItem) {
            var queryKey = queryItem.split('=')[0];
            var queryValue = queryItem.split('=')[1];
            if (queryKey === 'page') {
                pageNo = queryValue;
            }
        });

        if (pageNo > 1) {
            var startIndex = (pageNo - 1) * maxArticleNumPerPage;
            showPageContentBySearch(startIndex);
        } else {
            showPageContentBySearch(0);
        }
    };

    function start() {
        yunzhidao = window.yunzhidao || {};

        if (yunzhidao.config.isRunMode && yunzhidao.config.isWeixin) {
            amwaysearch.components.wechatInterface.initToken(initCustomPage);
        } else {
            initCustomPage();
        }

        //set page title
        var pageTitle = '"' + $('#customTitle').text() + '"相关资讯';
        $('title').text(pageTitle);
        $('#wechatTitle').val(pageTitle);

        if (history.pushState) {
            window.addEventListener('popstate', showHistoryPage);
        }
    }

    function bindEvents() {
    }

    return {
        init: function() {
            if ($('#customResultPage').length > 0) {
                start();
                bindEvents();
            }
        },
        onSearchClick: onSearchClick,
        doImageSearch: doImageSearch,
        showImageDetail: showImageDetail,
        firstPage: firstPage,
        prevPage: prevPage,
        nextPage: nextPage,
        lastPage: lastPage,
        saveArticleUrlsToSolr: saveArticleUrlsToSolr
    };
})($, window);

$(function() {
    amwaysearch.components.customresults.init();
});
