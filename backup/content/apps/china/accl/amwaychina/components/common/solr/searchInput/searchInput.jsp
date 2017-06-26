<%@ page language="java" import="java.util.*" pageEncoding="utf-8" trimDirectiveWhitespaces="true" %>
<%@ include file="/libs/foundation/global.jsp" %>
<%@ page import="com.day.cq.wcm.api.Page, com.aem.amway.search.services.service.ConfigService, org.json.JSONObject, org.json.JSONArray,
                 org.apache.commons.lang3.StringUtils" %>

<div class="main-con" id="searchInputPage">
    <div class="go-top">
        <div class="inner-con">
            <div data-am-widget="gotop" class="am-gotop am-gotop-fixed">
                <a href="#top" title="回到顶部">
                    <span class="am-gotop-title">回到顶部</span>
                    <i class="am-gotop-icon am-icon-chevron-up"></i>
                </a>
            </div>
        </div>
    </div>
    <header class="common search">
        <div class="bar-t">
            <button type="button" class="btn-home" onclick="history.back()">
                <i class="svg-icon icon-37"></i>
            </button>
            <div class="text-con am-text-center">
                <span class="title am-text-truncate"></span>
                <div class="option-group">
                    <label class="radio-label">
                        <input class="radio" type="radio" name="searchType" value="all" id="option1"><span class="text">全部</span>
                    </label>
                    <label class="radio-label">
                        <input class="radio" type="radio" name="searchType" value="video" id="option2"><span class="text">视频</span>
                    </label>
                    <label class="radio-label">
                        <input class="radio" type="radio" name="searchType" value="image" id="option3"><span class="text">图片</span>
                    </label>
                </div>
            </div>
        </div>
        <div class="search-bar">
            <div class="am-input-group am-padding-left am-padding-right am-padding-bottom-sm">
                <input id="searchWord" type="text" class="search-input am-form-field" placeholder="请输入搜索名称">
                <div class="clear-con">
                    <a href="javascript:void (0);" class="btn-clear am-icon-btn am-icon-close"></a>
                </div>
                <span class="am-input-group-btn">
                    <button class="search-btn am-btn am-btn-default" type="button" onclick="amwaysearch.components.searchinput.onSearchClick()">
                        <i class="svg-icon icon-32"></i>
                    </button>
                </span>
            </div>
        </div>
    </header>
    <div class="content-body search">
        <div id="hotword" class="content-group am-margin-top-sm" style="display:none">
            <h3 class="title-left">热词</h3>
            <div class="content-box">
                <div class="hot-keys_search">
                <%
                    String indexPath = properties.get("indexpath", "/content/china/accl/solr/index");
                    Resource landingContentRes = resource.getResourceResolver().resolve(indexPath + "/jcr:content/par/content");
                    ValueMap valueMap = landingContentRes.adaptTo(ValueMap.class);
                    String[] hotWords = valueMap.get("hotWords", String[].class);
                    if (null != hotWords && hotWords.length > 0) {
                        for (int i = 0; i < hotWords.length; i++) {
                            JSONObject hotWordItem = new JSONObject(hotWords[i]);
                            String hotWord = hotWordItem.getString("hotWord");
                            String searchWord = hotWordItem.getString("searchWord");
                            String redirectLink = hotWordItem.getString("redirectLink");
                            JSONArray tags = hotWordItem.getJSONArray("tags");
                %>
                    <a href="javascript:void(0)" onclick="amwaysearch.components.search.searchByHotword('<%=hotWord %>', yunzhidao.analytics.hotWordSource.searchInputPage, <%=tags.length()>0 %>, '<%=redirectLink %>', '<%=searchWord %>');"><%=hotWord %></a>
                <%
                        }
                    }
                %>
                </div>
            </div>
        </div>
        <div id="searchHistory" class="content-group am-margin-top-sm" style="display: none">
            <h3 class="title-left">历史</h3>
            <div class="content-box">
                <div class="history-keys">
                </div>
                <button type="button" class="btn-w">
                    <i class="am-icon am-icon-trash-o am-icon-sm"></i>
                    <span>清除历史记录</span>
                </button>
            </div>
        </div>
        <div id="associateWords" class="content-group associate am-margin-top-sm">
            <div class="content-box">
                <div class="associate-keys">
                </div>
            </div>
        </div>
    </div>
</div>
