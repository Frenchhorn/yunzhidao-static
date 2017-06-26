<%@ page language="java" import="java.util.*" pageEncoding="utf-8" trimDirectiveWhitespaces="true" %>
<%@ include file="/libs/foundation/global.jsp" %>
<%@ page import="com.aem.amway.search.services.service.ConfigService" %>

<%
    String[] paramSlingSelectors = slingRequest.getRequestPathInfo().getSelectors();
    int selectorLength = paramSlingSelectors.length;
    boolean hasChild = false;

    String categoryType = "", categoryWithStructure = "", parentCatagoryTitle="", categoryTitle = "", categoryPath = "", parentCategoryPath = "", configcategoryPath = "";
    ArrayList<String> parentCatagoryStructure = new ArrayList<String>();

    Page categoryPage = null;
    Page parentCategoryPage = null;
    ConfigService configService = sling.getService(ConfigService.class);;

    if (selectorLength >= 2) {
        categoryType = paramSlingSelectors[0];
        if (categoryType.equals("news")) {
            configcategoryPath =configService.getNewsCategoryPath();
        } else if (categoryType.equals("training")) {
            configcategoryPath = configService.getTrainingCategoryPath();
        }
        for (int i = 1; i < selectorLength; i++) {
            categoryWithStructure += paramSlingSelectors[i] + "/";
            if (i < selectorLength-1) {
                parentCatagoryStructure.add(paramSlingSelectors[i]);
            }
        }

        if(null != parentCatagoryStructure && parentCatagoryStructure.size() > 0){
            for(int i = 0; i < parentCatagoryStructure.size(); i++){
                parentCategoryPath = configcategoryPath + "/" + parentCatagoryStructure.get(i);
                Resource categoryResource = resource.getResourceResolver().resolve(parentCategoryPath);
                parentCategoryPage = categoryResource.adaptTo(Page.class);
                if (null != parentCategoryPage) {
                    parentCatagoryTitle += "-" + parentCategoryPage.getTitle();
                }
            }

        }

        categoryPath = configcategoryPath + "/" + categoryWithStructure;
        Resource categoryResource = resource.getResourceResolver().resolve(categoryPath);
        categoryPage = categoryResource.adaptTo(Page.class);
        if (null != categoryPage) {
            categoryTitle = categoryPage.getTitle();
        }
        parentCatagoryTitle += "-" +categoryTitle;
    }
%>

<script type="text/javascript">
    // redirect to homepage if no category is chosen
    var categoryWithStructure = '<%=categoryWithStructure %>';
    if (!categoryWithStructure) {
        window.location.href = 'index.html';
    }

    $(document).ready(function() {
        if (yunzhidao.config.isRunMode && yunzhidao.config.isWeixin) {
            amwaysearch.components.wechatInterface.initToken();
        }
        var pageTitle = '"' + $('header span').text() + '"相关资讯';
        $('title').text(pageTitle);
        $('#wechatTitle').val(pageTitle);
    });
</script>

<div class="main-con" id="categoryPage">
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
            <a class="btn-home" href="index.html">
                <i class="svg-icon icon-16"></i>
            </a>
            <div class="text-con am-text-center">
                <span class="title am-text-truncate"><%=categoryTitle %></span>
            </div>
        </div>
    </header>
    <div class="content-body common">
        <div class="content-group am-margin-top-sm">
            <ul class="category-list am-avg-sm-3 am-avg-md-5">
            <%
                if (null != categoryPage) {
                    Iterator<Page> categoryIter = categoryPage.listChildren();
                    if (null != categoryIter) {
                        while (categoryIter.hasNext()) {
                            Page category = categoryIter.next();
                            ValueMap categoryProperties = category.getProperties();
                            String redirectLink = categoryProperties.get("redirectLink", "");
                            String categoryName = categoryWithStructure.replace("/", ".") + category.getName();
                            Iterator<Page> items = category.listChildren();
                            hasChild = (null != items && items.hasNext()) ? true : false;
            %>
                <li>
                    <a class="am-text-middle" href="javascript:void(0)" onclick="amwaysearch.components.search.searchByCategory('<%=categoryType %>', '<%=categoryName %>', '<%=parentCatagoryTitle + "-" + category.getTitle() %>', <%=hasChild %>, '<%=redirectLink %>')">
                        <span class="text"><%=category.getTitle() %></span>
                    </a>
                </li>
            <%
                        }
                    }
                }
            %>
            </ul>
        </div>
    </div>
</div>
