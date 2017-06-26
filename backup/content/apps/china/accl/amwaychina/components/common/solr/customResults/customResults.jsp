<%@ page language="java" import="java.util.*" pageEncoding="utf-8" trimDirectiveWhitespaces="true" %>
<%@ include file="/libs/foundation/global.jsp" %>
<%@ page import="java.net.URLEncoder,
                com.aem.amway.search.services.service.ConfigService,
                com.day.cq.i18n.I18n,
                org.apache.commons.lang.StringUtils,
                org.apache.sling.api.request.RequestParameter,
                org.json.JSONObject" %>

<%
    ConfigService configService = sling.getService(ConfigService.class);
    String indexPath = configService.getYunZhiDaoIndexUrl();
    String searchResultPath = configService.getYunZhiDaoSearchResultUrl();
    String searchInputPath = configService.getYunZhiDaoSearchInputUrl();

    String title = properties.get("title", "");
    String urlForViewMore = "";
    if (!StringUtils.isEmpty(title)) {
        urlForViewMore = searchResultPath + "?keyword=" + URLEncoder.encode(title, "UTF-8") + "&searchType=all";
    }

    int maxArticleNumPerPage = properties.get("maxArticleNumPerPage", 6);
    boolean addsearchbar = properties.get("addsearchbar", false);
    boolean addviewmorebutton = properties.get("addviewmorebutton", false);

    List<String> imageAreaList = new ArrayList<String>();
    String[] imageFields = properties.get("imageFields", String[].class);
    if (null != imageFields && imageFields.length > 0) {
        Map<String, String> map = new TreeMap<String, String>(
                new Comparator<String>() {
                    public int compare(String obj1, String obj2) {
                        return Integer.valueOf(obj1).compareTo(Integer.valueOf(obj2));
                    }
                });
        for (String imageField : imageFields) {
            JSONObject imageAreaObj = new JSONObject(imageField);
            map.put((String) imageAreaObj.get("position"), imageField);
        }
        for (Map.Entry<String, String> imageArea : map.entrySet()) {
            imageAreaList.add(imageArea.getValue());
        }
    }

    Locale locale = new Locale("zh-cn");
    ResourceBundle resourceBundle = slingRequest.getResourceBundle(locale);
    I18n i18n = new I18n(resourceBundle);
    String ViewMoreLabel = i18n.get("View more");
%>

<!--[if IE 9]>
    <script>
        window.history.pushState = function(state, title, url) {
            window.location.href = url;
        };
    </script>
<![endif]-->

<div class="main-con" id='customResultPage'>
    <header class="common search">
        <div class="bar-t">
            <a class="btn-home" x-cq-linkchecker="skip" href="<%= indexPath %>">
                <i class="svg-icon icon-16"></i>
            </a>
            <%
                if (addsearchbar) {
            %>
                <a class="btn-search" x-cq-linkchecker="skip" href="<%= searchInputPath %>">
                    <i class="svg-icon icon-17"></i>
                </a>
            <%
                }
            %>
            <div class="text-con am-text-center">
                <span class="title am-text-truncate" id="customTitle"><%= title %></span>
            </div>
        </div>
    </header>

    <div class="content-body common">
        <div class="content-group am-margin-top-sm">
            <ul class="info-list"></ul>
        </div>

        <%
            if (addviewmorebutton) {
        %>
                <button type="button" class="btn-more am-margin-top-xs" id="view-more-btn" onclick="amwaysearch.components.search.redirectUrl('<%= urlForViewMore %>');">
                    <span><%= ViewMoreLabel %></span>
                </button>
        <%
            }
        %>

        <ul class="pagination" id="pagination">
            <li>
                <button type="button" class="btn" id="first-page" onclick="amwaysearch.components.customresults.firstPage();">首页</button>
            </li>
            <li>
                <button type="button" class="btn"  id="prev-page" onclick="amwaysearch.components.customresults.prevPage();">&lt;</button>
            </li>
            <li>
                <span id="currentPage">1/1</span>
            </li>
            <li>
                <button type="button" class="btn" id="next-page" onclick="amwaysearch.components.customresults.nextPage();">&gt;</button>
            </li>
            <li>
                <button type="button" class="btn" id="last-page" onclick="amwaysearch.components.customresults.lastPage();">尾页</button>
            </li>
        </ul>

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
    </div>
</div>

<script type="text/javascript">
    var updateCustomInfo = function() {
        yunzhidao.customInfo.maxArticleNumPerPage = <%= maxArticleNumPerPage %>;
        yunzhidao.customInfo.imageInfo = <%= imageAreaList %>;
        yunzhidao.searchInfo.urls.searchResultPath = '<%= searchResultPath %>';
    };
</script>
