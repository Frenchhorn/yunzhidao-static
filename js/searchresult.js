var amwaysearch = amwaysearch || {};
amwaysearch.components = amwaysearch.components || {};

amwaysearch.components.searchresult = (function($, window) {
    var yunzhidao;
    var searchKeyword;
    var isPromotionChecked = false;
    var isTrainingChecked = false;
    var sortType = 'default';
    var pageCount = 0;
    var resultsCount = 0;
    var maxItemNumPerPage = 10;
    var currentPageNo = 0;

    var clickSearchButton = function() {
        amwaysearch.components.searchinput.setParamsAndValue(searchKeyword);
        location.href = 'searchInput.html';
    };

    var setPageTitle = function(relatedWord) {
        var pageTitle;
        if (relatedWord) {
            pageTitle = '"' + relatedWord + '"相关资讯';
        } else if (!!yunzhidao.searchResultInfo.categoryTitle) {
            pageTitle = '"' + yunzhidao.searchResultInfo.categoryTitle + '"相关资讯';
        } else if (!!searchKeyword) {
            pageTitle = '"' + searchKeyword + '"相关资讯';
        }
        if (pageTitle) {
            $('title').text(pageTitle);
            $('#wechatTitle').val(pageTitle);
        }
    };

    var getDisplayTag = function(doc, contentTags) {
        var tag = '';
        var keywords = doc['metatag.keywords'] ? doc['metatag.keywords'].join(',').split(',') : [];

        $.each(keywords, function(index, keyword) {
            keyword = keyword.trim();
            if (contentTags.indexOf(keyword) > -1) {
                tag = keyword;
                return false;
            }
        });
        return tag;
    };

    var setSearchType = function(obj) {
        $('input[name="search-options"]').removeAttr('checked');
        if (obj !== null && typeof obj === 'object') {
            yunzhidao.searchResultInfo.searchType = obj.id.substring(obj.id.indexOf('-') + 1);
            $('#' + obj.id).prop('checked', true);
        } else if (typeof obj === 'string') {
            yunzhidao.searchResultInfo.searchType = obj;
            $('#searchtype-' + obj).prop('checked', true);
        }
    };

    var getProductDataInfo = function() {
        var loadAjax = $.ajax({
            type: 'GET',
            dataType: 'xml',
            async: false,
            url: 'productDetail.xml'
        });

        loadAjax.done(function(data, textStatus, jqXHR) {
            window.yunzhidao.productInfo.dataXML = data;
        });

        loadAjax.fail(function(jqXHR, textStatus, errorThrown) {});
    };

    var findProductKeysFromDataXML = function(dataXML, keyword) {
        var productKeys = [];
        $.each($(dataXML).find('PRODUCT'), function(index, ele) {
            var keywords = $(ele).find('KEYWORDS').text();
            keywords = keywords.toSBC().toUpperCase().split(',').uniqueTrim();
            if ($.inArray(keyword.toSBC().toUpperCase().trim(), keywords) > -1) {
                productKeys.push($(ele).find('ID').text());
            }
        });
        return productKeys;
    };

    /* jshint maxcomplexity: 9 */
    var getIconType = function(attachment) {
        var iconType = '';
        if (!!attachment && attachment.lastIndexOf('.') > 0) {
            var suffix = attachment.substring(attachment.lastIndexOf('.') + 1);
            if (suffix === 'pdf') {
                iconType = 'PDF';
            } else if (suffix === 'pptx' || suffix === 'ppt') {
                iconType = 'PPT';
            } else if (suffix === 'docx' || suffix === 'doc') {
                iconType = 'Word';
            } else if (suffix === 'xlsx' || suffix === 'xls') {
                iconType = 'Excel';
            }
        }
        return iconType;
    };

    var getThumbnail = function(doc) {
        if (doc['metatag.thumbnail'] && doc['metatag.thumbnail'] !== '') {
            return doc['metatag.thumbnail'];
        }
        if (doc.videoPath && doc.videoPath.join('') !== '') {
            return doc.videoPoster ? doc.videoPoster[0] : '';
        } else {
            return doc.productImageUrl;
        }
    };

    var getThumbnailDomain = function(doc) {
        /* jshint maxlen: 200 */
        if ('https:' === document.location.protocol) {
            if (doc.id.indexOf(yunzhidao.domainInfo.aaWorkShopDomain) === 0) {
                return yunzhidao.domainInfo.aaWorkShopDomain;
            } else if (doc.id.indexOf(yunzhidao.domainInfo.contenthubDomain) === 0) {
                return yunzhidao.domainInfo.contenthubDomain;
            } else if (doc.id.indexOf(yunzhidao.domainInfo.informationDomain) === 0) {
                return yunzhidao.domainInfo.informationDomain;
            } else if (doc.id.indexOf(yunzhidao.domainInfo.acfDomain) === 0 || doc.id.indexOf(yunzhidao.domainInfo.mobileDomain) === 0 || doc.id.indexOf(yunzhidao.domainInfo.officialDomain) === 0) {
                return yunzhidao.domainInfo.mobileDomain.replace('http:', 'https:');
            }
        } else {
            return doc.id.substring(0, doc.id.indexOf('/', doc.id.indexOf(doc.host)));
        }
    };

    var runCallbackFunction = function(callbackFunc) {
        if (callbackFunc) {
            callbackFunc();
        }
    };

    var getAboInfoAndCallback = function(callback) {
        yunzhidao = window.yunzhidao || {};
        var adaNum = yunzhidao.authenticationInfo.adaNum;
        var aaWorkShopDomain = yunzhidao.domainInfo.aaWorkShopDomain;

        if (adaNum) {
            var loadJsonp = $.jsonp({
                callbackParameter: 'callbackparam',
                url: aaWorkShopDomain + '/restful/api/aboInfo/getShopLinkForExternal/' + adaNum
            });

            loadJsonp.done(function(data) {
                if (data && data.isSuccess) {
                    if (data.responseData && !!data.responseData.aboId) {
                        yunzhidao.aboInfo.aboId = data.responseData.aboId;
                    }
                } else {
                    if (data.errors && !!data.errors[0].errorCode) {
                        yunzhidao.aboInfo.errorCode = data.errors[0].errorCode;
                    }
                }
                runCallbackFunction(callback);
            });

            loadJsonp.fail(function() {
                runCallbackFunction(callback);
            });
        } else {
            runCallbackFunction(callback);
        }
    };

    var getTagsAndPathStr = function(tags, paths) {
        var filterStr = '', tagsQureyStr = '', pathsQureyStr = '';
        //has tags
        if (tags.length !== 0){
            $.each(tags, function(index, tag) {
                tagsQureyStr += 'metatag.keywords:' + tag;
                if (index < tags.length - 1) {
                    tagsQureyStr += ' OR ';
                }
            });
        }
        //has paths
        if (!!paths && paths.length !== 0) {
            if (typeof paths === 'object') {
                $.each(paths, function(index, hotWordTopUrl) {
                    hotWordTopUrl = hotWordTopUrl.replace(/\:/g, '?');
                    pathsQureyStr += 'id:*' + hotWordTopUrl + '*';
                    if (index < paths.length - 1) {
                        pathsQureyStr += ' OR ';
                    }
                });
            } else {
                pathsQureyStr += 'id:*' + paths + '*';
            }
            //tagsQureyStr is not blank
            if (!!tagsQureyStr){
                pathsQureyStr = ' OR (' + pathsQureyStr + ')';
            }
        }

        if (!!tagsQureyStr || !!pathsQureyStr) {
            if (yunzhidao.searchResultInfo.categoryType !== 'image') {
                filterStr = ' AND ';
            }
            filterStr += '(' + tagsQureyStr + pathsQureyStr + ')';
        }
        return filterStr;
    };

    var getTopTagsStr = function(tags) {
        var topTagsStr = '';
        if (tags.length !== 0) {
            $.each(tags, function(index, tag) {
                topTagsStr += 'metatag.keywords:' + tag + '-置顶文章';
                if (index < tags.length - 1) {
                    topTagsStr += ' OR ';
                }
            });
        } else {
            topTagsStr += 'metatag.keywords:' + yunzhidao.searchResultInfo.categoryTitle + '-置顶文章';
        }
        return topTagsStr;
    };

    var getImageUrl = function(doc) {
        var url = doc.url ? doc.url : '';
        if ('https:' === document.location.protocol) {
            url = url.replace('http:', 'https:');
        }
        return url;
    };

    var getResizeImageUrl = function(url) {
        return url.substring(0, url.lastIndexOf('.')) + '.resize.268' +
               url.substring(url.lastIndexOf('.'));
    };

    var getImageSrcUrl = function(url) {
        return url ? (url.lastIndexOf('.') > -1 ? getResizeImageUrl(url) : url) : '';
    };

    var getImageDetailUrl = function(src, title) {
        return 'imageDetail.html?src=' + encodeURIComponent(src) +
               '&title=' + encodeURIComponent(title);
    };

    var getOneImageHtml = function(doc, showImgTitle) {
        /* jshint maxlen: 165 */
        var title = doc.title ? doc.title : '无标题';
        var imgUrl = getImageUrl(doc);

        var html = '<li><a class="thumbnail img_contain" href="' + getImageDetailUrl(imgUrl, title) +
                   '" style="background-image:url(\'' + getImageSrcUrl(imgUrl) + '\')">';
        if (showImgTitle) {
            html += '<span class="text am-text-truncate bgc transparency-black">' + title + '</span>';
        }
        html += '</a></li>';
        return html;
    };

    var getImageListHtml = function(data) {
        var html = '';
        if (data.response.docs) {
            html = '<ul class="img-list am-avg-sm-2">';
            data.response.docs.forEach(function(doc, idx) {
                html += getOneImageHtml(doc, true);
            });
            html += '</ul>';
        }
        return html;
    };

    var getImageSearchResultHtml = function(data) {
        var text = getSearchCountText(data);
        var innerHtml = getSearchCountDivHtml(text) + getImageListHtml(data);
        return addContentGroupOuterDivHtml(innerHtml);
    };

    var showImageSearchResultSection = function(startIndex, data) {
        $('.bar-b').hide();
        $('.content-body').empty();
        showPaginationSection(startIndex);
        $('.content-body').prepend(getImageSearchResultHtml(data));
        $('.content-body').removeClass('search').addClass('common');
    };

    var getDisplayTitleHtml = function(data, doc) {
        /* jshint maxlen: 150 */
        var maxTitle = yunzhidao.searchInfo.pageSetting.maxTitle;
        var title = data.highlighting[doc.id].title ? data.highlighting[doc.id].title[0] : doc.title ? doc.title.substring(0, maxTitle) : '无标题';
        return '<a href="javascript:void(0);" class="title am-text-truncate">' + title + '</a>';
    };

    var getVideoDurationHtml = function(doc, promotion) {
        var html = '';
        var videoDuration = getVideoDuration(doc);
        if (videoDuration) {
            if (yunzhidao.searchResultInfo.searchType === 'video' ||
                    (yunzhidao.searchResultInfo.searchType === 'all' && promotion !== 1)) {
                html = '<div class="duration">' + videoDuration + '</div>';
            }
        }
        return html;
    };

    var getVideoDuration = function(doc) {
        var videoDuration = '';
        if (doc.videoLen && doc.videoLen !== '') {
            videoDuration = (doc.videoLen + '').toHHMMSS();
        } else if (doc['metatag.videolength'] && doc['metatag.videolength'] !== '') {
            videoDuration = (doc['metatag.videolength'] + '').toHHMMSS();
        }
        return videoDuration;
    };

    var getThumbnailDivHtml = function(doc, showVideoBtn) {
        /* jshint maxlen: 120 */
        var html = '';
        var thumbnail = getThumbnail(doc);
        if (thumbnail) {
            var bgImgUrl = getThumbnailDomain(doc) + thumbnail;
            html = '<a href="javascript:void(0);" class="thumbnail" style="background-image: url(' + bgImgUrl + ')">' +
                   '<img src="' + bgImgUrl + '">';
            if (showVideoBtn) {
                html += '<div class="video-flag"></div>';
                html += getVideoDurationHtml(doc);
            }
            html += '</a>';
        }
        return html;
    };

    var getAttachmentDivHtml = function(doc) {
        /* jshint maxlen: 110 */
        var html = '<div class="item">';
        var attachments = (doc.attachments && doc.attachments.join('') !== '') ? doc.attachments : '';
        if (attachments) {
            $.each(attachments, function(index, attachment) {
                if (index < 2) {
                    html += '<span class="frame-radius red">' + getIconType(attachment) +
                            '</span>';
                } else {
                    return false;
                }
            });
        }
        html += '</div>';
        return html;
    };

    var getContentTagHtml = function(doc) {
        /* jshint maxlen: 150 */
        var displayTag = getDisplayTag(doc, yunzhidao.searchInfo.list.contentTags);
        var url = 'searchResults.html?categoryType=tag&category=' + encodeURIComponent(displayTag);
        var action = 'amwaysearch.components.search.redirectUrl(\'' + url + '\', \'' +
                     yunzhidao.analytics.contentTagSource['searchResultPage'] + '\', \'' +
                     displayTag + '\');';
        return displayTag ? '<a href="javascript:void(0);" onclick="' + action +
               '" class="text with-date am-text-truncate">' + displayTag + '</a>' : '';
    };

    var getPublishDateHtml = function(publishdate) {
        return publishdate ? '<span class="date">' + publishdate + '</span>' : '';
    };

    var getAdditionalInfoDivHtml = function(doc, publishdate) {
        var html = '<div class="item origin">';
        var innerHtml = getContentTagHtml(doc) + getPublishDateHtml(publishdate);
        if (innerHtml) {
            html += '<div class="abs-con">' + innerHtml + '</div>';
        }
        html += '</div>';
        return html;
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

    var getPromotionDivHtml = function(doc, promotion) {
        /* jshint maxlen: 180 */
        var html = '<div class="item">';
        if (yunzhidao.config.isWeixin && yunzhidao.authenticationInfo.isAboUser && promotion === 1) {
            html += '<a href="' + amwaysearch.components.search.getPromotionCardUrl(yunzhidao.authenticationInfo.isAboUser, promotion, doc) + '" class="btn-generalize">' +
                    '<i class="svg-icon icon-18"></i><span class="text">' + yunzhidao.searchInfo.labels.promotionAssistant + '</span></a>';
        }
        html += '</div>';
        return html;
    };

    var getPreviewOthersDivHtml = function(doc, publishdate, promotion) {
        var innerHtml = getAttachmentDivHtml(doc) + getAdditionalInfoDivHtml(doc, publishdate) +
                        getPromotionDivHtml(doc, promotion);
        return '<div class="bar-b">' + innerHtml + '</div>';
    };

    var getPreviewText = function(data, doc) {
        /* jshint maxlen: 200 */
        var maxDescription = yunzhidao.searchInfo.pageSetting.maxDescription;
        var maxStrippedContent = yunzhidao.searchInfo.pageSetting.maxStrippedContent;
        var description = data.highlighting[doc.id].description ? data.highlighting[doc.id].description[0] : doc.description ? doc.description.substring(0, maxDescription) : '';
        var content = data.highlighting[doc.id].strippedContent ? data.highlighting[doc.id].strippedContent[0] : doc.strippedContent ? doc.strippedContent.substring(0, maxStrippedContent) : '';
        var previewText = description.trim() !== '' ? description : content;
        if (previewText.trim() !== '') {
            previewText = previewText.trim() + '...';
        }
        return previewText;
    };

    var getPreviewTextDivHtml = function(text) {
        /* jshint maxlen: 130 */
        return text ? '<a href="javascript:void(0);" class="desc dot-ellipsis dot-resize-update">' + text + '</a>' : '';
    };

    var getPreviewContentDivHtml = function(data, doc, publishdate, promotion) {
        var text = getPreviewText(data, doc);
        var innerHtml = getPreviewTextDivHtml(text) +
                        getPreviewOthersDivHtml(doc, publishdate, promotion);
        return innerHtml ? '<div class="text-con">' + innerHtml + '' : '</div>';
    };

    var getOneVideoContentHtml = function(url, data, doc, promotion, publishdate) {
        /* jshint maxlen: 120 */
        var innerHtml = getDisplayTitleHtml(data, doc) + getThumbnailDivHtml(doc, true) +
                        getPreviewContentDivHtml(data, doc, publishdate, promotion);
        return '<li onclick="amwaysearch.components.search.showResultPage(\'' + url + '\')">' + innerHtml + '</li>';
    };

    var getOneArticleContentHtml = function(url, data, doc, promotion, publishdate) {
        /* jshint maxlen: 120 */
        var innerHtml = getDisplayTitleHtml(data, doc) + getThumbnailDivHtml(doc, false) +
                        getPreviewContentDivHtml(data, doc, publishdate, promotion);
        return '<li onclick="amwaysearch.components.search.showResultPage(\'' + url + '\')">' + innerHtml + '</li>';
    };

    var getContentListHtml = function(data) {
        /* jshint maxlen: 160 */
        var innerHtml = '';
        data.response.docs.forEach(function(doc, idx) {
            var publishdate;
            var promotion = doc.promotion ? doc.promotion : '';
            var url = amwaysearch.components.search.getArticleDetailUrl(doc, yunzhidao.authenticationInfo.isAboUser, promotion, yunzhidao.config.isWeixin);
            if (doc.videoPath && doc.videoPath.join('') !== '') {
                publishdate = getVideoPublishdate(doc);
                innerHtml += getOneVideoContentHtml(url, data, doc, promotion, publishdate);
            } else {
                publishdate = getArticlePublishdate(doc);
                innerHtml += getOneArticleContentHtml(url, data, doc, promotion, publishdate);
            }
        });
        return innerHtml ? '<ul class="info-list">' + innerHtml + '</ul>' : '';
    };

    var getContentSearchResultHtml = function(data) {
        var text = getSearchCountText(data);
        var innerHtml = getSearchCountDivHtml(text) + getContentListHtml(data);
        return addContentGroupOuterDivHtml(innerHtml);
    };

    var addContentGroupOuterDivHtml = function(innerHtml) {
        /* jshint maxlen: 110 */
        return innerHtml ? '<div class="content-group am-margin-top-sm">' + innerHtml + '</div>' : '';
    };

    var showContentSearchResultSection = function(startIndex, data) {
        $('.bar-b').show();
        $('.content-body').empty();
        showPaginationSection(startIndex);
        $('.content-body').prepend(getContentSearchResultHtml(data));
        $('.content-body').removeClass('search').addClass('common');
    };

    var getSearchCountText = function(data) {
        var text = '';
        if (yunzhidao.searchResultInfo.categoryTitle) {
            text = '为你在' + yunzhidao.searchResultInfo.categoryTitle + '下，找到了' +
                   data.response.numFound + '个搜索结果';
        } else {
            text = '为你找到了' + data.response.numFound + '个搜索结果';
        }
        return text;
    };

    var getSearchCountDivHtml = function(text) {
        return '<div class="search-count">' + text + '</div>';
    };

    var getRelatedSearchQueryString = function(keyWord) {
        /* jshint maxlen: 120 */
        var maxRelatedWordsNum = 8;
        var queryStr = '(title:' + amwaysearch.components.search.escapeChar(keyWord) + ')';
        var filterStr = '(id:' + amwaysearch.components.search.escapeChar(keyWord) + ')' +
                        ' AND (category:' + yunzhidao.searchResultInfo.searchType + ')';
        return yunzhidao.searchInfo.urls.solrServerPath + '_keywords/select?q=' + encodeURIComponent(queryStr) +
               '&fq=-' + encodeURIComponent(filterStr) + '&rows=' + maxRelatedWordsNum + '&wt=json&indent=true';
    };

    var searchByRelatedWord = function(relatedWord) {
        /*global s*/
        s.linkTrackVars = 'prop9';
        s.prop9 = relatedWord;
        s.useForcedLinkTracking = false;
        s.tl(true, 'o', relatedWord + ' （相关搜索）');

        //set searchHistory cookie
        amwaysearch.components.searchinput.setHistory(relatedWord);

        setPageTitle(relatedWord);

        $('input.search-input').val(relatedWord);
        resetSortAndFilterSearch();
    };

    var getOneRelatedSearchItemHtml = function(doc) {
        /* jshint maxlen: 170 */
        return '<li><a class="am-text-truncate" href="javascript:void(0);" onclick="amwaysearch.components.searchresult.searchByRelatedWord(\'' + doc.title + '\')">' +
               doc.title + '</a></li>';
    };

    var getAllRelatedSearchItemsHtml = function(data) {
        var html = '';
        data.response.docs.forEach(function(doc, idx) {
            html += getOneRelatedSearchItemHtml(doc);
        });
        return html;
    };

    var getRelatedSearchItemsDivHtml = function(data) {
        return '<div class="content-box"><ul class="hot-keys am-avg-sm-2 am-avg-md-4">' +
               getAllRelatedSearchItemsHtml(data) + '</ul></div>';
    };

    var getRelatedSearchTitleHtml = function(searchWord) {
        return '<div class="title-left"><em>' + searchWord + '</em>的相关搜索</div>';
    };

    var getRelatedSearchHtml = function(searchWord, data) {
        return addContentGroupOuterDivHtml(getRelatedSearchTitleHtml(searchWord) +
                getRelatedSearchItemsDivHtml(data));
    };

    var addRelatedSearchSection = function(searchWord, data) {
        $('.pagination').before(getRelatedSearchHtml(searchWord, data));
    };

    var showRelatedSearchResultSection = function(keyWord) {
        var loadAjax = $.ajax({
            dataType: 'jsonp',
            jsonp: 'json.wrf',
            url: getRelatedSearchQueryString(keyWord)
        });

        loadAjax.done(function(data) {
            if (data !== null && data !== '') {
                addRelatedSearchSection(keyWord, data);
            }
        });

        loadAjax.fail(function(data) {});
    };

    var getNoSearchResultHtml = function(keyword) {
        var html = '<div class="search_txt">' +
                   '<p>为您找到了0个搜索结果</p>' +
                   '<p>很抱歉，没有找到与“<em>'+ keyword + '</em>”相关的内容。</p>' +
                   '<p>温馨提示：<br>' +
                   '<span>1.请检查您的输入是否正确。</span><br>' +
                   '<span>2.换另外一个相似的词或常见的词试一试。</span><br>' +
                   '<span>3.如有任何意见或建议请及时反馈给我们。</span></p></div>';
        return addContentGroupOuterDivHtml(html);
    };

    var showNoSearchResultSection = function(keyword) {
        $('#doc-dropdown-justify').hide();
        $('.content-body').empty();
        $('.content-body').append(getNoSearchResultHtml(keyword));
        $('.content-body').removeClass('common').addClass('search');
    };

    var showSearchingSection = function() {
        var html = addContentGroupOuterDivHtml('<div class="search_txt"><p>搜索中</p></div>');
        $('.content-body').empty();
        $('.content-body').removeClass('common').addClass('search');
        $('.content-body').append(html);

        disableOnclickEvents();
    };

    var disableOnclickEvents = function() {
        // Search type
        $('input[name="search-options"]').attr('disabled', 'disabled');
        // Search bar
        $('.am-input-group').attr('onclick', '');
        $('input.search-input').attr('disabled', 'disabled');
        // Filters
        $('button.am-dropdown-toggle').attr('disabled', 'disabled');
        $('input[name="promotionFilter"]').attr('disabled', 'disabled');
        $('input[name="trainingFilter"]').attr('disabled', 'disabled');
    };

    var enableOnclickEvents = function() {
        /* jshint maxlen: 110 */
        // Search type
        $('input[name="search-options"]').removeAttr('disabled');
        // Search bar
        $('.am-input-group').attr('onclick', 'amwaysearch.components.searchresult.clickSearchButton();');
        $('input.search-input').removeAttr('disabled');
        // Filters
        $('button.am-dropdown-toggle').removeAttr('disabled');
        $('input[name="promotionFilter"]').removeAttr('disabled');
        $('input[name="trainingFilter"]').removeAttr('disabled');
    };

    var sortSearchResult = function(obj) {
        sortType = obj.parentElement.id;
        handleHistory();
        doSearch();
    };

    var filterSearchResult = function() {
        isPromotionChecked = $('input[name="promotionFilter"]').prop('checked');
        isTrainingChecked = $('input[name="trainingFilter"]').prop('checked');
        handleHistory();
        doSearch();
    };

    var reDoSearch = function(obj) {
        setSearchType(obj);
        resetSortAndFilterSearch();
    };

    var resetSortAndFilterSearch = function() {
        setSortType('default');
        setAllFilters(false);

        handleHistory();
        doSearch();
    };

    var getProductQureyString = function(queryKeyword) {
        /* jshint maxlen: 110 */
        var productQureyStr = '';
        var productKeys = findProductKeysFromDataXML(yunzhidao.productInfo.dataXML, queryKeyword);
        $.each(productKeys, function(index, productKey) {
            productQureyStr += (isNaN(productKey) ? 'id:*h5/' : 'id:*productdetail.') + productKey + '.*';
            if (index < productKeys.length - 1) {
                productQureyStr += ' OR ';
            }
        });
        return productQureyStr;
    };

    var getHotWordQureyString = function(keyword) {
        var hotWordQureyStr = '';
        var hotWordTopUrls = getHotWordTopUrls(keyword);
        $.each(hotWordTopUrls, function(index, hotWordTopUrl) {
            hotWordTopUrl = hotWordTopUrl.replace(/\:/g, '?');
            hotWordQureyStr += 'id:*' + hotWordTopUrl + '*';
            if (index < hotWordTopUrls.length - 1) {
                hotWordQureyStr += ' OR ';
            }
        });
        return hotWordQureyStr;
    };

    var getHotWordTopUrls = function(keyword) {
        var hotWordTopUrls = [];
        $.each(yunzhidao.searchResultInfo.hotWordList, function(index, hotWordItem) {
            if (hotWordItem.hotWord === keyword || hotWordItem.searchWord === keyword) {
                hotWordTopUrls = hotWordItem.topUrls;
                if (typeof hotWordTopUrls !== 'undefined' && hotWordTopUrls.length !== 0){
                    hotWordTopUrls = hotWordTopUrls.uniqueTrim();
                }
                return false;
            }
        });
        return hotWordTopUrls;
    };

    var getQueryString = function(keyword, productQureyStr, hotWordQureyStr) {
        /* jshint maxlen: 110 */
        var queryStr = '*:*';
        if (!!keyword) {
            var titleStr = '', descriptionStr = '', strippedContentStr = '', metaKeywordStr = '';
            var queryKeywordArr = keyword.replace(/(\ )+/g, ' ').split(' ');
            $.each(queryKeywordArr, function(index, value) {
                value = amwaysearch.components.search.escapeChar(value);
                titleStr += 'title:' + value + '^1000.0';
                descriptionStr += 'description:' + value;
                strippedContentStr += 'strippedContent:' + value;
                metaKeywordStr += 'metatag.keywords:' + value;
                if (index < queryKeywordArr.length - 1) {
                    titleStr += ' AND ';
                    descriptionStr += ' AND ';
                    strippedContentStr += ' AND ';
                    metaKeywordStr += ' AND ';
                }
            });

            queryStr = '((' + titleStr + ') OR (' + descriptionStr + ') OR (' + strippedContentStr + ')';
            if (!yunzhidao.searchResultInfo.category) {
                queryStr += ' OR (' + metaKeywordStr + ')';
                if (!!productQureyStr) {
                    queryStr += ' OR (' + productQureyStr + ')';
                }
                if (!!hotWordQureyStr) {
                    queryStr += ' OR (' + hotWordQureyStr + ')';
                }
            }
            queryStr += ')';
        }
        return queryStr;
    };

    var getFilterString = function() {
        /* jshint maxlen: 150 */
        /* jshint maxcomplexity: 16 */
        var filterStr = '';
        // filter the content: pdf, doc
        filterStr += '-id:*.pdf AND -id:*.doc AND -id:*.docx -id:*.ppt AND -id:*.pptx AND -id:*.mp3 AND -id:*.mp4';

        // filter the product detail pages under path /content/china/accl/amwaychina/zh_cn/product/
        filterStr += ' AND -(id:*/product/* AND productImageUrl:*)';

        // filters for video
        if (yunzhidao.searchResultInfo.searchType === 'video') {
            filterStr += ' AND (videoPath:*';
            if (!!yunzhidao.searchResultInfo.videoTagName) {
                filterStr += ' OR metatag.keywords:' + yunzhidao.searchResultInfo.videoTagName;
            }
            filterStr += ')';
        }

        if (!!yunzhidao.searchResultInfo.category) {
            var categoryTags = yunzhidao.searchResultInfo.categoryTags;
            var searchPath = yunzhidao.searchResultInfo.searchPath;
            switch (yunzhidao.searchResultInfo.categoryType) {
                case 'sourceTag':
                    filterStr += ' AND (metatag.keywords:' + categoryTags[0] + ')';
                    break;
                case 'tag':
                    filterStr += ' AND (metatag.keywords:' + categoryTags[0] + ')';
                    break;
                case 'news':
                    filterStr += getTagsAndPathStr(categoryTags, searchPath);
                    break;
                case 'video':
                    filterStr += getTagsAndPathStr(categoryTags, searchPath);
                    break;
                case 'image':
                    filterStr = getTagsAndPathStr(categoryTags, searchPath);
                    break;
                case 'training':
                    filterStr += getTagsAndPathStr(categoryTags, searchPath);
                    break;
                case 'hotWord':
                    searchPath = getHotWordTopUrls(yunzhidao.searchResultInfo.categoryTitle);
                    filterStr += getTagsAndPathStr(categoryTags, searchPath);
                    break;
            }
        } else {
            filterStr += ' AND -(id:*/content/china/accl/aaworkshop/* AND -id:*/productdetail.*)';
        }

        if (!yunzhidao.authenticationInfo.isAboUser) {
            filterStr += ' AND -aboReadOnly:1';
        } else if (isPromotionChecked) {
            filterStr += ' AND promotion:1';
        }
        if (isTrainingChecked) {
            filterStr += ' AND metatag.keywords:' + yunzhidao.searchResultInfo.trainingTagName;
        }

        if (!yunzhidao.config.isWeixin) {
            filterStr += ' AND -allowShare:0';
            filterStr += ' AND -id:*/content/china/accl/aaworkshop/mobile/clientpages/productdetail*';
        }

        if (filterStr !== '') {
            filterStr = '&fq=' + encodeURIComponent(filterStr);
        }
        return filterStr;
    };

    var getStartString = function(startNo) {
        // page
        return startNo ? ('&start=' + startNo) : '';
    };

    var getSortString = function(queryKeyword, productQureyStr, hotWordQureyStr) {
        /* jshint maxlen: 200 */
        /* jshint maxcomplexity: 10 */
        var sortStr;
        // sort
        switch (sortType) {
            case 'flowDesc':
                sortStr = '&sort=' + encodeURIComponent('flow desc');
                break;
            case 'flowAsc':
                sortStr = '&sort=' + encodeURIComponent('flow asc');
                break;
            case 'dateDesc':
                sortStr = '&sort=' + encodeURIComponent('def(videoPublishDate,metatag.publishdate) desc');
                break;
            case 'dateAsc':
                sortStr = '&sort=' + encodeURIComponent('def(videoPublishDate,metatag.publishdate) asc');
                break;
            default:
                var productSortOrder = '';
                var hotWordSortOrder = '';
                if (!!queryKeyword) {
                    if (!!productQureyStr) {
                        productSortOrder = 'if(exists(query({!v=\'' + productQureyStr + '\'})),0,1) asc,';
                    }
                    if (!!hotWordQureyStr) {
                        hotWordSortOrder = 'if(exists(query({!v=\'' + hotWordQureyStr + '\'})),0,1) asc,';
                    }
                }

                var defaultSortOrder = 'if(exists(query({!v=\'id:' + yunzhidao.domainInfo.acfDomain.replace(/\:/g, '?') + '*\'})),0,1) desc,' +
                                       'score desc,def(videoPublishDate,metatag.publishdate) desc';
                if (!!yunzhidao.searchResultInfo.category) {
                    var categoryTopSortOrder = '';
                    if (!searchKeyword) {
                        var categoryTags = yunzhidao.searchResultInfo.categoryTags;
                        categoryTopSortOrder = 'if(exists(query({!v=\'id:*/productdetail.*\'})),0,1) asc,' + hotWordSortOrder +
                                               'if(exists(query({!v=\'' + getTopTagsStr(categoryTags) + '\'})),0,1) asc,';
                    }
                    sortStr = '&sort=' + encodeURIComponent(categoryTopSortOrder + defaultSortOrder);
                } else {
                    sortStr = '&sort=' + encodeURIComponent(productSortOrder + hotWordSortOrder + defaultSortOrder);
                }
        }
        return sortStr;
    };

    var getSolrQueryString = function(queryStr, filterStr, startStr, sortStr) {
        var querySolrStr = '';
        if (!!yunzhidao.searchResultInfo.category) {
            if (yunzhidao.searchResultInfo.categoryType === 'image') {
                querySolrStr = yunzhidao.searchInfo.urls.solrServerPath + '_image/select?q=' +
                               encodeURIComponent(queryStr) + filterStr + startStr +
                               '&wt=json&indent=true';
            } else {
                querySolrStr = yunzhidao.searchInfo.urls.solrServerPath + '_category/select?q=' +
                               encodeURIComponent(queryStr) + filterStr + startStr + sortStr +
                               '&wt=json&indent=true';
            }
        } else {
            if (yunzhidao.searchResultInfo.searchType === 'image') {
                querySolrStr = yunzhidao.searchInfo.urls.solrServerPath + '_image/select?q=' +
                               encodeURIComponent(queryStr) + startStr + '&wt=json&indent=true';
            } else {
                querySolrStr = yunzhidao.searchInfo.urls.solrServerPath + '_fulltext/select?q=' +
                               encodeURIComponent(queryStr) + filterStr + startStr + sortStr +
                               '&wt=json&indent=true';
            }
        }
        return querySolrStr;
    };

    var doSearch = function(startIndex) {
        /* jshint maxlen: 120 */
        var productQureyStr = '';
        var hotWordQureyStr = '';

        var inputKeyword = ($('input.search-input').length > 0) ? $('input.search-input').val().trim() : searchKeyword;
        var searchWord = !inputKeyword ? yunzhidao.searchResultInfo.categoryTitle : inputKeyword;


        if (!inputKeyword && !yunzhidao.searchResultInfo.category) {
            return 0;
        }
        if (!!inputKeyword) {
            var replacedKeyword = amwaysearch.components.search.deleteSpecialChar(inputKeyword);
            if (replacedKeyword === '') {
                showNoSearchResultSection(inputKeyword);
                return 0;
            }
        }

        showSearchingSection();

        if(searchWord) {
            productQureyStr = getProductQureyString(searchWord);
            hotWordQureyStr = getHotWordQureyString(searchWord);
        }

        var queryStr = getQueryString(inputKeyword, productQureyStr, hotWordQureyStr);
        var filterStr = getFilterString();
        var startStr = getStartString(startIndex);
        var sortStr = getSortString(searchWord, productQureyStr, hotWordQureyStr);

        var loadAjax = $.ajax({
            dataType: 'jsonp',
            jsonp: 'json.wrf',
            url: getSolrQueryString(queryStr, filterStr, startStr, sortStr)
        });

        loadAjax.done(function(data) {
            if (data && data.response) {
                var isFilterChecked = $('#doc-dropdown-justify input[type="checkbox"]:checked').length > 0;

                if (data.response.numFound === 0 && !isFilterChecked) {
                    showNoSearchResultSection(searchWord);
                } else {
                    resultsCount = data.response.numFound;
                    if (yunzhidao.searchResultInfo.searchType === 'image') {
                        showImageSearchResultSection(startIndex, data);
                    } else {
                        showContentSearchResultSection(startIndex, data);
                    }

                    // related words search
                    if (!yunzhidao.searchResultInfo.category) {
                        showRelatedSearchResultSection(searchWord);
                    }

                    // update keyword
                    updateKeyword(searchWord);

                    // add image section on all search
                    if (!yunzhidao.searchResultInfo.category &&
                            yunzhidao.searchResultInfo.searchType === 'all' &&
                            !startIndex && !isFilterChecked) {
                        addImageSearchResultArea(queryStr, searchWord);
                    }
                }
            }

            enableOnclickEvents();

            $('.abs-con a').on('click', function(e) {
                console.log('add');
                e.stopPropagation();
            });
        });

        loadAjax.fail(function(data) {
            enableOnclickEvents();
        });
    };

    var updateKeyword = function(searchWord) {
        /* jshint maxlen: 110 */
        var encodeKeyword = encodeURIComponent(amwaysearch.components.search.escapeChar(searchWord));
        // var loadAjax = $.ajax({
        //     dataType: 'json',
        //     url: 'https://ch.amwaynet.com.cn/bin/search/update?keyword=' + encodeKeyword + '&searchType=' +
        //          yunzhidao.searchResultInfo.searchType
        // });

        // loadAjax.done(function(data) {});

        // loadAjax.fail(function(data) {});
    };

    var doImageSearch = function() {
        setSearchType('image');
        handleHistory();
        doSearch();
    };

    var addImageSearchResultArea = function(queryStr, keyword) {
        /* jshint maxlen: 165 */
        var loadAjax = $.ajax({
            dataType: 'jsonp',
            jsonp: 'json.wrf',
            url: yunzhidao.searchInfo.urls.solrServerPath + '_image/select?q=' + encodeURIComponent(queryStr) + '&wt=json&indent=true&rows=4'
        });

        loadAjax.done(function(data) {
            if (data && data.response) {
                if (data.response.numFound !== 0) {
                    var html = '<li><a href="javascript:void(0);" onclick="amwaysearch.components.searchresult.doImageSearch();" class="title am-text-truncate">' +
                               '<em>' + keyword + '</em>图片搜索</a>' + '<ul class="search-imgs am-avg-sm-4">';
                    data.response.docs.forEach(function(doc) {
                        html += getOneImageHtml(doc, false);
                    });
                    html += '</ul></li>';

                    $('.content-group .info-list li').eq(0).after(html);
                }
            }
        });

        loadAjax.fail(function(data) {});
    };

    var addPaginationSection = function() {
        /* jshint maxlen: 160 */
        var html = '<ul class="pagination">' +
                   '<li><button type="button" class="btn" id="first-page" onclick="amwaysearch.components.searchresult.firstPage();">首页</button></li>' +
                   '<li><button type="button" class="btn" id="prev-page" onclick="amwaysearch.components.searchresult.prevPage();">&lt;</button></li>' +
                   '<li><span id="currentPage">1/1</span></li>' +
                   '<li><button type="button" class="btn" id="next-page" onclick="amwaysearch.components.searchresult.nextPage();">&gt;</button></li>' +
                   '<li><button type="button" class="btn" id="last-page" onclick="amwaysearch.components.searchresult.lastPage();">尾页</button></li>' +
                   '</ul>';
        $('.content-body').append(html);
    };

    var showPaginationSection = function(startIndex) {
        addPaginationSection();
        initPagination(startIndex);
    };

    var getPageCount = function() {
        return resultsCount === 0 ? 1 : Math.ceil(resultsCount / maxItemNumPerPage);
    };
    var getCurrentPageNo = function(startIndex) {
        return startIndex ? (startIndex / maxItemNumPerPage + 1) : 1;
    };
    var initPagination = function(startIndex) {
        currentPageNo = getCurrentPageNo(startIndex);
        pageCount = getPageCount();

        $('#currentPage').text(currentPageNo + ' / ' + pageCount);

        $('.pagination li .btn').attr('disabled', 'disabled');
        if (currentPageNo > 1) {
            $('#first-page').removeAttr('disabled');
            $('#prev-page').removeAttr('disabled');
        }
        if (currentPageNo < pageCount) {
            $('#next-page').removeAttr('disabled');
            $('#last-page').removeAttr('disabled');
        }
    };
    var changePage = function(pageNo) {
        handleHistory(pageNo);
        loadPageBySearch(pageNo);
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

    var getPromotionFilterDivHtml = function() {
        /* jshint maxlen: 140 */
        return '<div class="cell-box">' +
               '<label class="am-checkbox-inline">' +
               '<input type="checkbox" name="promotionFilter" onclick="amwaysearch.components.searchresult.filterSearchResult();">' +
               '<i class="icon am-icon-check"></i> ' +
               '<span class="text">推广助手</span>' +
               '</label></div>';
    };

    var addPromotionFilter = function() {
        var html = getPromotionFilterDivHtml();
        $('div.am-dropdown').after(html);
    };

    var getFilterTypesString = function() {
        var str = '';
        var filters = $('#doc-dropdown-justify input[type="checkbox"]:checked');
        $.each(filters, function(index, checkbox) {
            if(checkbox.name === 'promotionFilter') {
                str += 'P';
            }
            if(checkbox.name === 'trainingFilter') {
                str += 'T';
            }
            if (index < filters.length - 1) {
                str += '_';
            }
        });
        return str;
    };
    var setFiltersAccordingToFilterTypes = function(filterTypes) {
        $.each(filterTypes.split('_'), function(index, type) {
            if(type === 'P') {
                setPromotionFilter(true);
            }
            if(type === 'T') {
                setTrainingFilter(true);
            }
        });
    };
    var setAllFilters = function(value) {
        isPromotionChecked = value;
        isTrainingChecked = value;
        $('#doc-dropdown-justify input[type="checkbox"]').prop('checked', value);
    };
    var setPromotionFilter = function(value) {
        $('input[name="promotionFilter"]').prop('checked', value);
        isPromotionChecked = value;
    };
    var setTrainingFilter = function(value) {
        $('input[name="trainingFilter"]').prop('checked', value);
        isTrainingChecked = value;
    };
    var setSortType = function(sortTypeStr) {
        sortType = sortTypeStr;
        $('#' + sortTypeStr).trigger('click');
    };

    /* jshint maxcomplexity: 10 */
    var handleHistory = function(page) {
        /* jshint maxlen: 140 */
        var isFilterChecked = $('#doc-dropdown-justify input[type="checkbox"]:checked').length > 0;
        searchKeyword = ($('input.search-input').length > 0) ? $('input.search-input').val().trim() : searchKeyword;

        var query = 'searchType=' + yunzhidao.searchResultInfo.searchType +
                    (!searchKeyword ? '' : '&keyword=' + encodeURIComponent(searchKeyword)) +
                    (!yunzhidao.searchResultInfo.category ? '' : '&category=' + encodeURIComponent(yunzhidao.searchResultInfo.category)) +
                    (!yunzhidao.searchResultInfo.categoryType ? '' : '&categoryType=' + yunzhidao.searchResultInfo.categoryType) +
                    ((sortType === 'default') ? '' : '&sortType=' + sortType) +
                    (!isFilterChecked ? '' : '&filterTypes=' + getFilterTypesString()) +
                    (!!page && page > 1 ? '&page=' + page : '');

        var url = window.location.href.split('?')[0] + '?' + query;
        if (url !== window.location.href) {
            history.pushState({}, window.title, url);
            /*global wx*/
            if (!!yunzhidao.config.isWeixin && !!wx) {
                /*globals updateWeiXinMenu: false */
                updateWeiXinMenu(wx);
            }
        }
    };

    var getSearchTypeDivHtml = function() {
        /* jshint maxlen: 190 */
        return '<div class="bar-t">' +
               '<a class="btn-home" href="index.html"><i class="svg-icon icon-16"></i></a>' +
               '<div class="text-con am-text-center">' +
               '<div class="option-group">' +
               '<label class="radio-label">' +
               '<input class="radio" type="radio" name="search-options" value="all" id="searchtype-all" onclick="amwaysearch.components.searchresult.reDoSearch(this);" checked="checked">' +
               '<span class="text">全部</span></label>' +
               '<label class="radio-label">' +
               '<input class="radio" type="radio" name="search-options" value="video" id="searchtype-video" onclick="amwaysearch.components.searchresult.reDoSearch(this);">' +
               '<span class="text">视频</span></label>' +
               '<label class="radio-label">' +
               '<input class="radio" type="radio" name="search-options" value="image" id="searchtype-image" onclick="amwaysearch.components.searchresult.reDoSearch(this);">' +
               '<span class="text">图片</span></label>' + '</div></div></div>';
    };

    var getSearchBarHtml = function() {
        /* jshint maxlen: 180 */
        return '<div class="search-bar">' +
               '<div class="am-input-group am-padding-left am-padding-right am-padding-bottom-sm" onclick="amwaysearch.components.searchresult.clickSearchButton();">' +
               '<input type="text" class="search-input am-form-field" placeholder="请输入搜索名称" value="' + searchKeyword + '">' +
               '<div class="clear-con"><a href="javascript:void(0);" class="btn-clear am-icon-btn am-icon-close" onclick="$(this).parent().prev().val(\'\')"></a></div>' +
               '<span class="am-input-group-btn"><button class="search-btn am-btn am-btn-default" type="button"><i class="svg-icon icon-32"></i></button></span>' +
               '</div></div>';
    };

    var getSearchTypeNavigationHtml = function() {
        return getSearchTypeDivHtml() + getSearchBarHtml();
    };

    var getCategoryNavigationHtml = function(categoryTitle) {
        /* jshint maxlen: 180 */
        return '<div class="bar-t">' +
               '<a class="btn-home" href="index.html"><i class="svg-icon icon-16"></i></a>' +
               '<a class="btn-search" href="javascript:void(0);" onclick="amwaysearch.components.searchresult.clickSearchButton()"><i class="svg-icon icon-17"></i></a>' +
               '<div class="text-con am-text-center">' +
               '<span class="title am-text-truncate">' + categoryTitle + '</span>' +
               '</div></div>';
    };

    var showNavigationBar = function() {
        var html = '';
        if (yunzhidao.searchResultInfo.categoryTitle) {
            html = getCategoryNavigationHtml(yunzhidao.searchResultInfo.categoryTitle);
        } else {
            html = getSearchTypeNavigationHtml();
            $('div.search-bar').remove();
        }
        $('div.bar-t').remove();
        $('header.common').prepend(html);
        setSearchType(yunzhidao.searchResultInfo.searchType);
    };

    var updateParameters = function() {
        /*globals updateSearchResultInfo: false */
        updateSearchResultInfo();

        searchKeyword = amwaysearch.components.search.getValueFromParameterName('keyword');
        searchKeyword = searchKeyword ? decodeURIComponent(searchKeyword.replace(/\+/g, ' ')) : '';
    };

    var loadPageBySearch = function(pageNo) {
        if (pageNo > 1) {
            var startIndex = (pageNo - 1) * maxItemNumPerPage;
            doSearch(startIndex);
        } else {
            doSearch();
        }
    };

    var loadSearch = function() {
        if (searchKeyword || yunzhidao.searchResultInfo.category) {
            $('input.search-input').val(searchKeyword);

            var pageNo = amwaysearch.components.search.getValueFromParameterName('page');
            pageNo = pageNo ? pageNo : 1;
            loadPageBySearch(pageNo);
        }
    };

    var initSortType = function() {
        var sortTypeFromUrl = amwaysearch.components.search.getValueFromParameterName('sortType');
        if (sortTypeFromUrl) {
            setSortType(sortTypeFromUrl);
        } else if ((yunzhidao.searchResultInfo.categoryType === 'tag' ||
                yunzhidao.searchResultInfo.categoryType === 'sourceTag') && searchKeyword === '') {
            setSortType('dateDesc');
        }
    };

    var initFilters = function() {
        /* jshint maxlen: 110 */
        var filterTypesFromUrl = amwaysearch.components.search.getValueFromParameterName('filterTypes');
        if (filterTypesFromUrl) {
            setFiltersAccordingToFilterTypes(filterTypesFromUrl);
        }
    };

    var initPageHeader = function() {
        showNavigationBar();

        if (yunzhidao.authenticationInfo.isAboUser && yunzhidao.config.isWeixin) {
            addPromotionFilter();
        }

        initSortType();
        initFilters();
    };

    var initSearchResultsPage = function() {
        initPageHeader();
        getAboInfoAndCallback(loadSearch);
    };

    var showHistoryPage = function() {
        var pageNo = 1;
        var query = decodeURIComponent(window.location.href.split('?')[1]);

        if (query.indexOf('keyword') < 0) {
            searchKeyword = '';
            $('input.search-input').val('');
        }
        if (query.indexOf('category') < 0) {
            yunzhidao.searchResultInfo.category = '';
        }
        if (query.indexOf('categoryType') < 0) {
            yunzhidao.searchResultInfo.categoryType = '';
        }
        if (query.indexOf('sortType') < 0) {
            setSortType('default');
        }

        setAllFilters(false);

        $.each(query.split('&'), function(index, queryItem) {
            var queryKey = queryItem.split('=')[0];
            var queryValue = queryItem.split('=')[1];
            if (queryKey === 'keyword') {
                searchKeyword = queryValue;
                $('input.search-input').val(searchKeyword);
            }
            if (queryKey === 'searchType') {
                setSearchType(queryValue);
            }
            if (queryKey === 'category') {
                yunzhidao.searchResultInfo.category = queryValue;
            }
            if (queryKey === 'categoryType') {
                yunzhidao.searchResultInfo.categoryType = queryValue;
            }
            if (queryKey === 'sortType') {
                setSortType(queryValue);
            }
            if (queryKey === 'filterTypes') {
                setFiltersAccordingToFilterTypes(queryValue);
            }
            if (queryKey === 'page') {
                pageNo = queryValue;
            }
        });

        showNavigationBar();

        loadPageBySearch(pageNo);
    };

    function start() {
        yunzhidao = window.yunzhidao || {};
        updateParameters();

        if (!searchKeyword && !yunzhidao.searchResultInfo.category && yunzhidao.config.isRunMode) {
            window.location.href = 'index.html';
        }

        //set searchHistory cookie
        amwaysearch.components.searchinput.setHistory(searchKeyword);

        setPageTitle();

        getProductDataInfo();

        // if (yunzhidao.config.isRunMode) {
        //     if (yunzhidao.config.isWeixin) {
        //         amwaysearch.components.wechatInterface.initToken(initSearchResultsPage);
        //     } else {
                initSearchResultsPage();
            // }
        // }

        if (history.pushState) {
            window.addEventListener('popstate', showHistoryPage);
        }
    }

    function bindEvents() {}

    return {
        init: function() {
            if ($('#searchResultPage').length > 0) {
                start();
                bindEvents();
            }
        },
        getDisplayTag: getDisplayTag,
        getIconType: getIconType,
        getThumbnail: getThumbnail,
        getThumbnailDomain: getThumbnailDomain,
        getAboInfoAndCallback: getAboInfoAndCallback,
        runCallbackFunction: runCallbackFunction,
        firstPage: firstPage,
        prevPage: prevPage,
        nextPage: nextPage,
        lastPage: lastPage,
        sortSearchResult: sortSearchResult,
        filterSearchResult: filterSearchResult,
        reDoSearch: reDoSearch,
        searchByRelatedWord: searchByRelatedWord,
        doImageSearch: doImageSearch,
        clickSearchButton: clickSearchButton
    };
})($, window);

$(function() {
    amwaysearch.components.searchresult.init();
});
