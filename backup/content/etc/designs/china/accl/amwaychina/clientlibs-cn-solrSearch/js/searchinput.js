var amwaysearch = amwaysearch || {};
amwaysearch.components = amwaysearch.components || {};

amwaysearch.components.searchinput = (function($, window) {
    var yunzhidao;
    var params;
    var defaultParams = {keyword:'',searchType:'all',category:'',categoryType:'',categoryTitle:''};
    var cookieName = 'search_history';
    var cookieOptions = {expires: 30, path: '/'};

    var getHistory = function() {
        var decodeHistory = [];
        var searchHistory = $.cookie(cookieName);
        if (!!searchHistory) {
            searchHistory = searchHistory.split(',');
            for (var i = 0; i < searchHistory.length; i++) {
                decodeHistory.push(decodeURIComponent(searchHistory[i]));
            }
        }
        return decodeHistory;
    };

    var setHistory = function(keyword) {
        if (!keyword) {return false;}
        var encodeKeyword = encodeURIComponent(keyword);
        var searchHistory = $.cookie(cookieName) ? $.cookie(cookieName).split(',') : [];

        var index = searchHistory.indexOf(encodeKeyword);
        if (index > -1) {
            searchHistory.splice(index, 1);
        }
        searchHistory.unshift(encodeKeyword);
        if (searchHistory.length > 10) {
            searchHistory.pop();
        }
        $.cookie(cookieName, searchHistory, cookieOptions);
    };

    var clearHistory = function() {
        $.cookie(cookieName, '', cookieOptions);
    };

    var addHistoryHtml = function() {
        var history = getHistory();
        if (history.length > 0) {
            var html = '';
            for (var i=0; i<history.length; i++) {
                history[i] = history[i].replace(/>/g, '&gt;');
                history[i] = history[i].replace(/</g, '&lt;');
                html += '<a onclick="amwaysearch.components.searchinput.onSearchClick(this.text)">'+
                            history[i] + '</a>';
            }
            $('#searchHistory .history-keys').append(html);
            $('#searchHistory').show();
        }
    };

    var onSearchClick = function(keyword) {
        /* global s */
        if (!keyword) {
            keyword = params.keyword;
        }
        if (!keyword) {return false;}
        s.linkTrackVars = 'prop9';
        s.prop9 = keyword;
        s.useForcedLinkTracking = false;
        s.tl(true, 'o', keyword + ' （搜索框）');

        var url = 'searchResults.html?keyword=' + encodeURIComponent(keyword);
        if (!!params.categoryTitle) {
            url += '&category=' + encodeURIComponent(params.category) +
                   '&categoryType=' + params.categoryType;
        } else {
            url += '&searchType=' + params.searchType;
        }

        window.location.href = url;
    };

    var displaySuggestion = function() {
        $('.associate-keys').empty();
        var keyword = params.keyword;
        if (!keyword) {return false;}
        var encodeKeyword = encodeURIComponent(amwaysearch.components.search.escapeChar(keyword));
        var keyWordUrl = yunzhidao.searchInfo.urls.solrServerPath + '_keywords/select' +
                        '?wt=json&indent=true&q=';
        var suggestionUrl = yunzhidao.searchInfo.urls.solrServerPath + '_fulltext/suggest' +
                        '?wt=json&indent=true&spellcheck=true&spellcheck.build=true&spellcheck.q=';
        $.when(
            $.ajax({
                dataType: 'jsonp',
                jsonp: 'json.wrf',
                url: suggestionUrl + encodeKeyword
            }),
            $.ajax({
                dataType: 'jsonp',
                jsonp: 'json.wrf',
                url: keyWordUrl + '(title:'+encodeKeyword+' AND category:'+params.searchType+')'
            })
        ).done(function(a1, a2) {
            var suggestList = [],
                keyList = [],
                list = [];

            if (a1[0].spellcheck && a1[0].spellcheck.suggestions.length > 0) {
                $.each(a1[0].spellcheck.suggestions[1].suggestion,
                    function(idx, suggestion) {
                        var suggestionArr = suggestion.split('|');
                        if (keyword === suggestionArr[0]) {
                            if (suggestList.length < 3) {
                                suggestList.push(suggestionArr[1]);
                                list.push(suggestionArr[1]);
                            }
                        }
                    });
            }

            $.each(a2[0].response.docs, function(idx, doc) {
                if (list.indexOf(doc.title) < 0) {
                    keyList.push(doc.title);
                }
            });

            list = list.concat(keyList);
            list = list.filter(function(n) {
                return n !== undefined;
            });

            //Using a custom source callback to match only the beginning of terms
            var regExpression = '^' + RegExp.escapeRegExp(keyword) + '.';
            var matcher = new RegExp(regExpression, 'i');
            var keyCount = suggestList.length;
            list = $.grep(list, function(item, idx) {
                if (idx >= suggestList.length && idx < (suggestList.length + keyList.length)) {
                    if (matcher.test(item) && keyCount < 3) {
                        keyCount++;
                        return matcher.test(item);
                    }
                } else {
                    return item;
                }
            });

            if (list.length === 0) {return false;}
            var html = '';
            for (var i=0; i<list.length; i++) {
                html += '<a onclick=amwaysearch.components.searchinput.onSearchClick("' +
                    list[i] + '")>' + list[i] + '</a>';
            }
            if (keyword === params.keyword) {
                $('.associate-keys').empty();
                $('.associate-keys').append(html);
                $('#associateWords').show();
            }
        }).fail(function(e) {});
    };

    var getParamsAndValue = function() {
        return JSON.parse($.cookie('params')) || defaultParams;
    };

    var setParamsAndValue = function(keyword) {
        var params = defaultParams;
        if ($('#searchResultPage').length > 0 ) {
            params.keyword = keyword ? encodeURIComponent(keyword) : '';
            params.searchType = window.yunzhidao.searchResultInfo.searchType;
            params.category = window.yunzhidao.searchResultInfo.category;
            params.categoryType = window.yunzhidao.searchResultInfo.categoryType;
            params.categoryTitle = window.yunzhidao.searchResultInfo.categoryTitle;
        } else if ($('#landingPage').length > 0) {
            params.searchType = $('input[name="searchType"]:checked').val() || 'all';
        }
        $.cookie('params', JSON.stringify(params));
    };

    function start() {
        yunzhidao = window.yunzhidao || {};
        if (document.referrer.indexOf('solr') < 0) {
            params = defaultParams;
        } else {
            params = getParamsAndValue();
            params.keyword = decodeURIComponent(params.keyword);
        }

        if (!!params.categoryTitle) {
            $('header span.title').text(params.categoryTitle);
            $('header .option-group').remove();
            $('#hotword').remove();
            $('#searchHistory').remove();
        } else {
            $('header span.title').remove();
            $('input[value="' + params.searchType + '"]').click();
            $('#hotword').show();
            addHistoryHtml();
        }

        if (!!params.keyword) {
            $('#searchWord').val(params.keyword);
            $('.btn-clear').show();
            $('#hotword').hide();
            $('#searchHistory').hide();
            displaySuggestion();
        }
        $('#searchWord').focus();
        window.resizeMainCon();
    }

    function bindEvents() {
        $('#searchWord').on('input', function() {
            params.keyword = $('#searchWord').val().trim();
            if (!!params.keyword) {
                $('.btn-clear').show();
                $('#hotword').hide();
                $('#searchHistory').hide();
            } else {
                $('.btn-clear').hide();
                $('#hotword').show();
                if (getHistory().length > 0) {
                    $('#searchHistory').show();
                }
            }
            displaySuggestion();
        });

        $('#searchWord').on('keydown', function() {
            if (event.which === 13) {
                onSearchClick();
            }
        });

        $('input[name="searchType"]').on('click', function() {
            params.searchType = $('input[name="searchType"]:checked').val();
            displaySuggestion();
        });

        $('#searchHistory button').on('click', function() {
            window.layer.open({
                content: '是否确认清空搜索历史？',
                btn: ['确定', '取消'],
                yes: function(index){
                    clearHistory();
                    $('#searchHistory').remove();
                    window.layer.close(index);
                }
            });
        });

        $('.btn-clear').on('click', function() {
            $('#searchWord').val('');
            $('#searchWord').triggerHandler('input');
        });
    }

    return {
        init: function() {
            if ($('#searchInputPage').length > 0) {
                start();
                bindEvents();
            }
        },
        onSearchClick: onSearchClick,
        setParamsAndValue: setParamsAndValue,
        setHistory: setHistory
    };
})($, window);

$(function() {
    amwaysearch.components.searchinput.init();
});
