<%@ page language="java" import="java.util.*" pageEncoding="utf-8" trimDirectiveWhitespaces="true" %>
<%@ include file="/libs/foundation/global.jsp" %>
<%@ page import="org.apache.sling.api.request.RequestParameter, com.aem.amway.search.services.service.ConfigService" %>
<%@ page import="com.day.cq.tagging.Tag, com.day.cq.tagging.TagManager, java.net.URLEncoder, java.net.URLDecoder, com.day.cq.wcm.api.Page" %>
<%@ page import="org.apache.commons.lang.StringUtils, org.json.JSONObject, org.json.JSONArray" %>

<%
    TagManager tagManager = resource.getResourceResolver().adaptTo(TagManager.class);
    ConfigService configService = sling.getService(ConfigService.class);
    String newsPath = configService.getNewsCategoryPath();
    String videoPath = configService.getVideoCategoryPath();
    String imagesPath = configService.getImagesCategoryPath();
    String trainingPath = configService.getTrainingCategoryPath();
    String videoTagName = configService.getVideoCategoryTagTitle();
    String trainingTagName = configService.getTrainingCategoryTagTitle();

    RequestParameter param = null;

    String searchType = "all";
    param = slingRequest.getRequestParameter("searchType");
    if (null != param) {
        searchType = param.getString("UTF-8");
    }

    String categoryType = "";
    param = slingRequest.getRequestParameter("categoryType");
    if (null != param) {
        categoryType = param.getString("UTF-8");
    }

    if ("video".equals(categoryType) || "image".equals(categoryType)) {
        searchType = categoryType;
    }

    String category = "", categoryTitle = "", newVideoPath = "", searchPath = "";
    List<String> categoryTagList = new ArrayList<String>();
    param = slingRequest.getRequestParameter("category");
    if (null != param) {
        category = URLEncoder.encode(param.getString("UTF-8"), "UTF-8");
        if (!"".equals(category)) {
            if ("news".equals(categoryType) || "video".equals(categoryType) || "image".equals(categoryType) || "training".equals(categoryType)) {
                String categoryPath = "";
                if ("news".equals(categoryType)) {
                    categoryPath = newsPath + "/" + category.replace('.', '/') + "/";
                } else if ("video".equals(categoryType)) {
                    categoryPath = videoPath + "/" + category.replace('.', '/') + "/";
                } else if ("image".equals(categoryType)) {
                    categoryPath = imagesPath + "/" + category.replace('.', '/') + "/";
                } else if ("training".equals(categoryType)) {
                    categoryPath = trainingPath + "/" + category.replace('.', '/') + "/";
                }

                Resource categoryRes = resource.getResourceResolver().resolve(categoryPath);
                Page categoryPage = categoryRes.adaptTo(Page.class);
                if (null != categoryPage) {
                    ValueMap categoryPageProperties = categoryPage.getProperties();
                    searchPath = categoryPageProperties.get("searchPath", "");
                    categoryTitle = categoryPage.getTitle();

                    for (Tag tag : categoryPage.getTags()) {
                        categoryTagList.add("\"" + tag.getTitle() + "\"");
                    }
                }
            } else if ("hotWord".equals(categoryType)) {
                categoryTitle = URLDecoder.decode(category, "UTF-8");
            } else if ("tag".equals(categoryType) || "sourceTag".equals(categoryType)) {
                categoryTitle = URLDecoder.decode(category, "UTF-8");
                categoryTagList.add("\"" + categoryTitle + "\"");
            }
        }
    }

    String indexPath = properties.get("indexpath", "/content/china/accl/solr/index");
    Resource landingContentRes = resource.getResourceResolver().resolve(indexPath + "/jcr:content/par/content");
    ValueMap valueMap = landingContentRes.adaptTo(ValueMap.class);
    String[] hotWords = valueMap.get("hotWords", String[].class);
    for (int i = 0; i < hotWords.length; i++) {
        JSONObject hotWordItem = new JSONObject(hotWords[i]);
        if (!"".equals(category) && "hotWord".equals(categoryType)
                && (URLDecoder.decode(category, "UTF-8").equals(hotWordItem.getString("hotWord"))
                        || URLDecoder.decode(category, "UTF-8").equals(hotWordItem.getString("searchWord")))) {
            JSONArray tags = hotWordItem.getJSONArray("tags");
            for (int j = 0; j < tags.length(); j++) {
                Tag hotWordTag = tagManager.resolve(tags.getString(j));
                if (null != hotWordTag && !StringUtils.isEmpty(hotWordTag.getTitle())) {
                    categoryTagList.add("\"" + hotWordTag.getTitle() + "\"");
                }
            }
            break;
        }
    }
    List hotWordList = new ArrayList();
    for (String hotWord: hotWords) {
        hotWordList.add(hotWord);
    }
%>

<!--[if IE 9]>
    <script>
        window.history.pushState = function(state, title, url) {
            window.location.href = url;
        };
    </script>
<![endif]-->

<div id='searchResultPage' class="main-con">
    <header class="common search">
        <div class="bar-b" id="doc-dropdown-justify">
            <div class="filter cell-box am-dropdown" data-am-dropdown="{justify: '#doc-dropdown-justify'}">
                <button class="am-btn am-dropdown-toggle">
                    <span class="type">综合排序</span>
                    <span class="am-icon-caret-down"></span>
                </button>
                <ul class="am-dropdown-content">
                    <li id="default" class="am-active"><a href="javascript:void(0);" onclick="amwaysearch.components.searchresult.sortSearchResult(this);" data-type="综合排序">综合排序</a></li>
                    <li id="flowDesc"><a href="javascript:void(0);" onclick="amwaysearch.components.searchresult.sortSearchResult(this);" data-type="热度排序">热度排序（从高到低）</a></li>
                    <li id="flowAsc"><a href="javascript:void(0);" onclick="amwaysearch.components.searchresult.sortSearchResult(this);" data-type="热度排序">热度排序（从低到高）</a></li>
                    <li id="dateDesc"><a href="javascript:void(0);" onclick="amwaysearch.components.searchresult.sortSearchResult(this);" data-type="时间排序">时间排序（从高到低）</a></li>
                    <li id="dateAsc"><a href="javascript:void(0);" onclick="amwaysearch.components.searchresult.sortSearchResult(this);" data-type="时间排序">时间排序（从低到高）</a></li>
                </ul>
            </div>
            <div class="cell-box">
                <label class="am-checkbox-inline">
                    <input type="checkbox" name= "trainingFilter" onclick="amwaysearch.components.searchresult.filterSearchResult();">
                    <i class="icon am-icon-check"></i>
                    <span class="text">培训</span>
                </label>
            </div>
        </div>
    </header>

    <div class="content-body common">
    </div>

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

<script type="text/javascript">
    var updateSearchResultInfo = function() {
        yunzhidao.searchResultInfo.searchType = '<%=searchType %>';
        yunzhidao.searchResultInfo.category = decodeURIComponent('<%=category %>');
        yunzhidao.searchResultInfo.categoryType = '<%=categoryType %>';
        yunzhidao.searchResultInfo.categoryTitle = '<%=categoryTitle %>';
        yunzhidao.searchResultInfo.videoTagName = '<%=videoTagName %>';
        yunzhidao.searchResultInfo.trainingTagName = '<%=trainingTagName %>';
        yunzhidao.searchResultInfo.searchPath = '<%=searchPath %>';
        yunzhidao.searchResultInfo.categoryTags = JSON.parse('<%=categoryTagList %>');
        yunzhidao.searchResultInfo.hotWordList = JSON.parse('<%=hotWordList %>');
    };
</script>
