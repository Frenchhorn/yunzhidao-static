<%@ page language="java" import="java.util.*" pageEncoding="utf-8" trimDirectiveWhitespaces="true" %>
<%@ include file="/libs/foundation/global.jsp" %>
<%@ page import="com.day.cq.wcm.api.Page, com.day.cq.tagging.Tag, com.day.cq.tagging.TagManager, com.day.cq.wcm.foundation.Image,
                 com.aem.amway.search.services.service.ConfigService, org.json.JSONObject, org.json.JSONArray,
                 org.apache.commons.lang3.StringUtils" %>

<%
    ConfigService configService = sling.getService(ConfigService.class);
    String newsPath = configService.getNewsCategoryPath();
    String videoPath = configService.getVideoCategoryPath();
    String imagesPath = configService.getImagesCategoryPath();
    String trainingPath = configService.getTrainingCategoryPath();
    String contenthubDomain = configService.getContenthubDomain();

    String componentTitle = properties.get("componentTitle", "今日更新").trim();
    String moreButtonTitle = properties.get("moreButtonTitle", "换一批").trim();
    String[] articles = properties.get("articles", String[].class);

    boolean hasChild = false;

    if ("".equals(componentTitle)) {
        componentTitle = "今日更新";
    }

    if ("".equals(moreButtonTitle)) {
        moreButtonTitle = "换一批";
    }

    TagManager tagManager = resource.getResourceResolver().adaptTo(TagManager.class);
    List<String> contentTagList = new ArrayList<String>();
    Tag rootContentTag = tagManager.resolve("Content-Hub:G-1/G-I");
    if (null != rootContentTag) {
        Iterator<Tag> tagIter = rootContentTag.listChildren();
        if (null != tagIter) {
            while (tagIter.hasNext()) {
                Tag tag = tagIter.next();
                if (StringUtils.isNotBlank(tag.getTagID())) {
                    contentTagList.add(tag.getTagID());
                }
            }
        }
    }

    JSONArray articlesArray = new JSONArray();
    List<String> articleTagList = new ArrayList<String>();
    if (null != articles && articles.length > 0) {
        for (int index = 0; index < articles.length; index++) {
            JSONObject obj = new JSONObject(articles[index]);
            JSONObject articleObject = new JSONObject();
            Resource articleResource = null;
            Page articlePage = null;
            String articlePath = obj.getString("articlePath");
            if(StringUtils.isNotBlank(articlePath)){
                articleResource = resource.getResourceResolver().resolve(articlePath);
            }
            if (null != articleResource) {
                articlePage = articleResource.adaptTo(Page.class);
            }
            if (null != articlePage) {
                String url = contenthubDomain + articlePath + ".html";
                articleObject.put("url", url);
                String host = contenthubDomain.indexOf("//") > -1 ? contenthubDomain.substring(contenthubDomain.indexOf("//") + 2) : contenthubDomain;
                articleObject.put("host", host);
                String title = articlePage.getTitle();
                if (null != title) {
                    articleObject.put("title", title);
                }

                String articleTagTitle = "";
                if (null != contentTagList && contentTagList.size() > 0) {
                    for (Tag articleTag : articlePage.getTags()) {
                        String tagId = articleTag.getTagID();
                        if (contentTagList.indexOf(tagId) > -1) {
                            articleTagTitle = articleTag.getTitle();
                            break;
                        }
                    }
                }
                articleObject.put("articleTagTitle", articleTagTitle);

                String thubnailTitle = obj.getString("thubnailTitle");
                if (null != thubnailTitle) {
                    articleObject.put("thubnailTitle", thubnailTitle);
                }
                String titleBackGround = obj.getString("titleBackGround");
                if (null != titleBackGround) {
                    articleObject.put("titleBackGround", titleBackGround);
                }
                String thubnailUrl = "";
                Resource imgRes = articlePage.getContentResource("image");
                if (null != imgRes) {
                    Image image = new Image(imgRes);
                    thubnailUrl = image.getFileReference();
                    if (StringUtils.isEmpty(thubnailUrl)) {
                        if (null != imgRes.getChild("file")) {
                            Resource fileResource = imgRes.getChild("file").getChild("jcr:content");
                            if (null != fileResource) {
                                ValueMap fileProperties = fileResource.adaptTo(ValueMap.class);
                                String mimeType = fileProperties.get("jcr:mimeType", "jpg");
                                String extension = mimeType.substring(mimeType.lastIndexOf("/") + 1);
                                thubnailUrl = imgRes.getChild("file").getPath() + ".img." + extension;
                            }
                        }
                    }
                }
                articleObject.put("thubnailUrl", thubnailUrl);
                Resource mainTitleRes = articlePage.getContentResource("maintitle");
                if (null != mainTitleRes) {
                    ValueMap mainTitleProperties = mainTitleRes.adaptTo(ValueMap.class);
                    String promotion = mainTitleProperties.get("addpromotion", "");
                    String aboReadOnly = mainTitleProperties.get("read", "");
                    String shareForbidden = mainTitleProperties.get("share", "");
                    String h5Url = mainTitleProperties.get("h5Url", "");
                    articleObject.put("promotion", promotion);
                    articleObject.put("aboReadOnly", aboReadOnly);
                    articleObject.put("shareForbidden", shareForbidden);
                    articleObject.put("h5Url",h5Url);
                }
                articlesArray.put(articleObject);
            }
        }
    }
%>

<div class="main-con" id='landingPage'>
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
    <header class="index" style="background-image: url('/content/dam/china/accl/alyzd/bg_index.jpg')">
        <div class="bg-b"></div>
        <div class="bar-t">
            <button type="button" class="btn-user" style="display:none"></button>
        </div>
        <div class="search-bar am-text-center">
            <div class="option-group">
                <label class="radio-label">
                    <input class="radio" type="radio" name="searchType" value="all" id="option1" checked="checked"><span class="text">全部</span>
                </label>
                <label class="radio-label">
                    <input class="radio" type="radio" name="searchType" value="video" id="option2"><span class="text">视频</span>
                </label>
                <label class="radio-label">
                    <input class="radio" type="radio" name="searchType" value="image" id="option3"><span class="text">图片</span>
                </label>
            </div>
            <div id="searchBar" class="am-input-group am-padding-left am-padding-right">
                <span class="am-input-group-btn">
                    <button class="search-btn am-btn am-btn-default" type="button">
                        <i class="svg-icon icon-17"></i>
                    </button>
                </span>
                <div class="search-input am-form-field">请输入搜索名称</div>
            </div>
        </div>
    </header>

    <div class="content-body index">
        <div class="content-group">
            <h3 class="title-left am-margin-top">热门分类</h3>
            <div class="content-box">
                <div class="am-tabs" data-am-tabs>
                    <ul id="categoryType" class="am-tabs-nav am-nav am-nav-tabs am-nav-justify">
                        <li categoryType="news" class="am-active"><a href="#news">资讯</a></li>
                        <li categoryType="video"><a href="#video">视频</a></li>
                        <li categoryType="image"><a href="#image">图片</a></li>
                        <li categoryType="training" style="display:none"><a href="#training">培训</a></li>
                    </ul>

                    <div class="am-tabs-bd">
                        <div class="am-tab-panel am-fade am-in am-active" id="news">
                            <ul class="btn-list am-avg-sm-4">
                            <%
                                Resource newsResource = resource.getResourceResolver().resolve(newsPath);
                                Page newsPage = newsResource.adaptTo(Page.class);
                                if (null != newsPage) {
                                    Iterator<Page> newsIter = newsPage.listChildren();
                                    if (null != newsIter) {
                                        while (newsIter.hasNext()) {
                                            Page news = newsIter.next();
                                            ValueMap newsProperties = news.getProperties();
                                            String redirectLink = newsProperties.get("redirectLink", "");
                                            Iterator<Page> items = news.listChildren();
                                            hasChild = (null != items && items.hasNext()) ? true : false;
                            %>
                                <li>
                                    <a href="javascript:void(0);" onclick="amwaysearch.components.search.searchByCategory($('#categoryType .am-active').attr('categoryType'), '<%=news.getName() %>', '<%="-" + news.getTitle() %>', <%=hasChild %>, '<%=redirectLink %>')">
                                        <i class="svg-icon" style="background-image: url('/content/dam/china/accl/alyzd/category/<%=news.getName()%>.png');background-repeat: no-repeat;background-size: 100% 100%;background-position: center center;"></i>
                                        <span class="text am-text-truncate"><%=news.getTitle()%></span>
                                    </a>
                                </li>
                            <%
                                        }
                                    }
                                }
                            %>
                            </ul>
                        </div>

                        <div class="am-tab-panel am-fade" id="video">
                            <ul class="btn-list am-avg-sm-4">
                            <%
                                Resource videoResource = resource.getResourceResolver().resolve(videoPath);
                                Page videoPage = videoResource.adaptTo(Page.class);
                                if (null != videoPage) {
                                    Iterator<Page> videoIter = videoPage.listChildren();
                                    if (null != videoIter) {
                                        while (videoIter.hasNext()) {
                                            Page video = videoIter.next();
                                            ValueMap videoproperties = video.getProperties();
                                            String redirectLink = videoproperties.get("redirectLink", "");
                            %>
                                <li>
                                    <a href="javascript:void(0);" onclick="amwaysearch.components.search.searchByCategory($('#categoryType .am-active').attr('categoryType'), '<%=video.getName() %>', '<%="-" + video.getTitle() %>', false, '<%=redirectLink %>')">
                                        <i class="svg-icon" style="background-image: url('/content/dam/china/accl/alyzd/videocategory/<%=video.getName()%>.png');background-repeat: no-repeat;background-size: 100% 100%;background-position: center center;"></i>
                                        <span class="text am-text-truncate"><%=video.getTitle()%></span>
                                    </a>
                                </li>
                            <%
                                        }
                                    }
                                }
                            %>
                            </ul>
                        </div>

                        <div class="am-tab-panel am-fade" id="image">
                            <ul class="btn-list-img am-avg-sm-3">
                            <%
                                Resource imagesResource = resource.getResourceResolver().resolve(imagesPath);
                                Page imagesPage = imagesResource.adaptTo(Page.class);
                                if (null != imagesPage) {
                                    Iterator<Page> imagesIter = imagesPage.listChildren();
                                    if (null != imagesIter) {
                                        while (imagesIter.hasNext()) {
                                            Page image = imagesIter.next();
                                            ValueMap imageProperties = image.getProperties();
                                            String redirectLink = imageProperties.get("redirectLink", "");
                                            String imageColor = image.getDescription();
                                            if (null == imageColor || "".equals(imageColor)) {
                                                imageColor = "dark-blue";
                                            }
                            %>
                                <li>
                                    <a href="javascript:void(0);" class="thumbnail" style="background-image: url('/content/dam/china/accl/alyzd/photocategory/<%=image.getName()%>.png')"  onclick="amwaysearch.components.search.searchByCategory($('#categoryType .am-active').attr('categoryType'), '<%=image.getName() %>', '<%="-" + image.getTitle() %>',  false, '<%=redirectLink %>')">
                                        <span class="text am-text-truncate bgc <%=imageColor %>"><%=image.getTitle()%></span>
                                    </a>
                                </li>
                            <%
                                        }
                                    }
                                }
                            %>
                            </ul>
                        </div>

                        <div class="am-tab-panel am-fade" id="training">
                            <ul class="btn-list am-avg-sm-4">
                            <%
                                Resource trainingResource = resource.getResourceResolver().resolve(trainingPath);
                                Page trainingPage = trainingResource.adaptTo(Page.class);
                                if (null != trainingPage) {
                                    Iterator<Page> trainingIter = trainingPage.listChildren();
                                    if (null != trainingIter) {
                                        while (trainingIter.hasNext()) {
                                            Page training = trainingIter.next();
                                            ValueMap trainingProperties = training.getProperties();
                                            String redirectLink = trainingProperties.get("redirectLink", "");
                                            Iterator<Page> items = training.listChildren();
                                            hasChild = (null != items && items.hasNext()) ? true : false;
                            %>
                                <li>
                                    <a href="javascript:void(0);" onclick="amwaysearch.components.search.searchByCategory($('#categoryType .am-active').attr('categoryType'), '<%=training.getName() %>', '<%="-" + training.getTitle() %>', <%=hasChild %>, '<%=redirectLink %>')">
                                        <i class="svg-icon" style="background-image: url('/content/dam/china/accl/alyzd/trainingcategory/<%=training.getName()%>.png');background-repeat: no-repeat;background-size: 100% 100%;background-position: center center;"></i>
                                        <span class="text am-text-truncate"><%=training.getTitle()%></span>
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
            </div>
            <button id="chButton" type="button" class="btn-w am-margin-top-xs" style="display:none">
                <i class="svg-icon icon-13"></i>
                <span>推广助手</span>
            </button>
        </div>

        <div id="dailyUpdate" class="content-group">
            <h3 class="title-left am-margin-top"><%=componentTitle %></h3>
            <div class="content-box">
                <ul class="info-list">
                </ul>
                <button id="changeDailyUpdate" type="button" class="btn-w">
                    <i class="svg-icon icon-14"></i>
                    <span><%=moreButtonTitle %></span>
                </button>
            </div>
        </div>

        <div class="content-group">
            <h3 class="title-left am-margin-top">热词</h3>
            <div class="content-box">
                <div class="hot-keys_index am-text-center">
                <%
                    String[] hotWords = properties.get("hotWords", String[].class);
                    if (null != hotWords && hotWords.length > 0) {
                        for (int i = 0; i < hotWords.length; i++) {
                            JSONObject hotWordItem = new JSONObject(hotWords[i]);
                            String hotWord = hotWordItem.getString("hotWord");
                            String searchWord = hotWordItem.getString("searchWord");
                            String redirectLink = hotWordItem.getString("redirectLink");
                            JSONArray tags = hotWordItem.getJSONArray("tags");
                %>
                <a href="javascript:void(0)" onclick="amwaysearch.components.search.searchByHotword('<%=hotWord %>', window.yunzhidao.analytics.hotWordSource['indexPage'], <%=tags.length()>0 %>, '<%=redirectLink %>', '<%=searchWord %>');"><%=hotWord %></a>
                <%
                        }
                    }
                %>
                </div>
            </div>
        </div>
    </section>
</div>

<script type="text/javascript">
    var articlesArray = <%=articlesArray %>;
    $(document).ready(function() {
        if (yunzhidao.config.isRunMode && yunzhidao.config.isWeixin) {
            amwaysearch.components.wechatInterface.initToken(getAboInfo);
        } else {
            initModule();
        }
    });

    var initModule = function() {
        amwaysearch.components.landing.initDailyUpdate(articlesArray);
        amwaysearch.components.landing.displayButtonAndTrain();
    };

    var getAboInfo = function() {
        amwaysearch.components.searchresult.getAboInfoAndCallback(initModule);
    };
</script>
