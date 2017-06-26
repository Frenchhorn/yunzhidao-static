<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8" %>
<%@ include file="/libs/foundation/global.jsp" %>
<%@ page import="javax.jcr.Session,com.day.cq.wcm.api.WCMMode,
                 com.aem.amway.search.services.service.ConfigService,
                 org.apache.sling.api.request.RequestParameter,
                 org.apache.commons.lang.StringUtils,
                 com.day.cq.i18n.I18n,
                 com.day.cq.tagging.Tag,
                 com.day.cq.tagging.TagManager,
                 com.day.cq.wcm.api.Page,
                 java.net.URLEncoder,
                 java.util.*,
                 com.aem.amway.search.util.AmwaySearchUtil" %>
<%
    String EXTENSION_HTML = ".html";
    String userType = "WECHATUSER";

    boolean isRunMode = true;
    if (WCMMode.fromRequest(request) == WCMMode.EDIT || WCMMode.fromRequest(request) == WCMMode.DESIGN || WCMMode.fromRequest(request) == WCMMode.PREVIEW) {
        //isRunMode = false;
    }

    ConfigService configService = sling.getService(ConfigService.class);
    String selectorString = slingRequest.getRequestPathInfo().getSelectorString();

    RequestParameter param = slingRequest.getRequestParameter("keyword");
    String keywordString = (null != param) ? param.getString("UTF-8") : "";

    param = slingRequest.getRequestParameter("searchType");
    String searchTypeString = (null != param) ? param.getString("UTF-8") : "";

    param = slingRequest.getRequestParameter("category");
    String categoryString = (null != param) ? param.getString("UTF-8") : "";

    param = slingRequest.getRequestParameter("page");
    String pageString = (null != param) ? param.getString("UTF-8") : "";

    param = slingRequest.getRequestParameter("categoryType");
    String categoryType = (null != param) ? param.getString("UTF-8") : "";

    String requestParamString = "";
    if (StringUtils.isNotBlank(keywordString) || StringUtils.isNotBlank(searchTypeString) || StringUtils.isNotBlank(categoryString) || StringUtils.isNotBlank(pageString)) {
        requestParamString = "?";
        if (StringUtils.isNotBlank(keywordString)) {
            requestParamString += "keyword=" + keywordString;
        }
        if (StringUtils.isNotBlank(searchTypeString)) {
            requestParamString += ((requestParamString.length() > 1) ? "&" : "") + "searchType=" + searchTypeString;;
        }
        if (StringUtils.isNotBlank(categoryString)) {
            requestParamString += ((requestParamString.length() > 1) ? "&" : "") + "category=" + categoryString;;
        }
        if (StringUtils.isNotBlank(pageString)) {
            requestParamString += ((requestParamString.length() > 1) ? "&" : "") + "page=" + pageString;;
        }
        if (StringUtils.isNotBlank(categoryType)) {
            requestParamString += ((requestParamString.length() > 1) ? "&" : "") + "categoryType=" + categoryType;;
        }
    }

    String targetUrl = configService.getContenthubDomain() + currentPage.getPath()
                        + ((null != selectorString) ? ("." + selectorString) : "") + EXTENSION_HTML
                        + ((requestParamString.length() > 1) ? requestParamString : "");

    String wechatFrameworkGetTokenUrl = configService.getWechatFrameworkGetTokenUrl() + URLEncoder.encode(("?userType=" + userType + "&redirectUrl=" + URLEncoder.encode(targetUrl, "UTF-8")), "UTF-8");
    String wechatAuthorizeUrl = configService.getWechatAuthorizeUrl() + "?appid=" + configService.getWechatAppId()
                                + "&redirect_uri=" + wechatFrameworkGetTokenUrl + "&response_type=code&scope=snsapi_base&state="
                                + configService.getWechatFrameworkAppId();

    TagManager tagManager = resource.getResourceResolver().adaptTo(TagManager.class);
    List < String > hotTagList = new ArrayList < String > ();
    Tag hotTag = tagManager.resolve("amway:hot-item");
    if (null != hotTag) {
        Iterator < Resource > resIter = hotTag.find();
        if (null != resIter) {
            while (resIter.hasNext()) {
                Resource res = resIter.next();
                Page hotPage = res.getParent().adaptTo(Page.class);
                if (!StringUtils.isEmpty(hotPage.getTitle())) {
                    hotTagList.add("\"" + hotPage.getTitle() + "\"");
                }
            }
        }
    }

    List<String> contentTagList = new ArrayList<String>();
    Tag rootContentTag = tagManager.resolve("Content-Hub:G-1/G-I");
    if (null != rootContentTag) {
        Iterator<Tag> tagIter = rootContentTag.listChildren();
        if (null != tagIter) {
            while (tagIter.hasNext()) {
                Tag tag = tagIter.next();
                if (!StringUtils.isEmpty(tag.getTitle())) {
                    contentTagList.add("\"" + tag.getTitle() + "\"");
                }
            }
        }
    }

    String searchResultPath = configService.getYunZhiDaoSearchResultUrl();
    searchResultPath = searchResultPath.substring(0, searchResultPath.indexOf(EXTENSION_HTML));
    Resource searchResultContent = resource.getResourceResolver().resolve(searchResultPath + "/jcr:content/par/content");
    ValueMap searchResultValueMap = searchResultContent.adaptTo(ValueMap.class);
    int maxTitle = searchResultValueMap.get("maxTitle", 18);
    int maxDescription = searchResultValueMap.get("maxDescription", 36);
    int maxStrippedContent = searchResultValueMap.get("maxStrippedContent", 36);

    String pageId = "";
    Session currentSession = resource.getResourceResolver().adaptTo(Session.class);
    if (!currentNode.isNodeType("mix:referenceable")) {
        currentNode.addMixin("mix:versionable");
        currentSession.save();
    }
    if (!isRunMode && currentNode.isNodeType("mix:referenceable") && (!currentNode.hasProperty("pageId") || !currentNode.getUUID().equals(currentNode.getProperty("pageId").getString()))) {
        currentNode.setProperty("pageId", currentNode.getUUID());
        currentSession.save();
    }
    if (currentNode.hasProperty("pageId")) {
        pageId = currentNode.getProperty("pageId").getString();
    }

    Locale locale = new Locale("zh-cn");
    ResourceBundle resourceBundle = slingRequest.getResourceBundle(locale);
    I18n i18n = new I18n(resourceBundle);
    String promotionAssistantLabel = i18n.get("Promotion assistant", "Button label for promotion assistant");

    String adaNum = AmwaySearchUtil.getAdaFromCookie(request);
%>

<script type="text/javascript">
    var yunzhidao = {
        config: {
            isRunMode: <%=isRunMode %>,
            isWeixin: /MicroMessenger/i.test(window.navigator.userAgent)
        },
        authenticationInfo: {
            urlForWxToken: '<%=wechatAuthorizeUrl %>',
            urlForWxUserinfo: '<%=configService.getWechatFrameworkGetUserinfoUrl() %>',
            wxUserType: '<%=userType%>',
            adaNum: '',
            isAboUser: false
        },
        aboInfo: {
            aboId: '',
            errorCode: ''
        },
        searchInfo: {
            pageId: '<%=pageId %>',
            urls: {
                solrServerPath: '<%=configService.getSolrUrl() %>',
                searchResultPath: ''
            },
            list: {
                hotList: <%=hotTagList %>,
                contentTags: <%=contentTagList %>
            },
            pageSetting: {
                maxTitle: <%=maxTitle %>,
                maxDescription: <%=maxDescription %>,
                maxStrippedContent: <%=maxStrippedContent %>
            },
            labels: {
                promotionAssistant: '<%= promotionAssistantLabel %>'
            }
        },
        domainInfo: {
            aaWorkShopDomain: '<%=configService.getAAworkshopDomain() %>',
            acfDomain: '<%=configService.getAcfDomain() %>',
            contenthubDomain: '<%=configService.getContenthubDomain() %>',
            informationDomain: '<%=configService.getInformationDomain() %>',
            mobileDomain: '<%=configService.getMobileDomain() %>',
            officialDomain: '<%=configService.getOfficialDomain() %>'
        },
        searchResultInfo: {
            searchType: '',
            category: '',
            categoryType: '',
            categoryTitle: '',
            videoTagName: '',
            trainingTagName: '',
            searchPath: '',
            categoryTags: [],
            hotWordList: []
        },
        customInfo: {
            maxArticleNumPerPage: 6,
            imageInfo: []
        },
        productInfo: {
            dataXML: {}
        },
        analytics: {
            category: {news:'资讯', image:'图片', video:'视频', training:'培训'},
            hotWordSource: {indexPage:'首页', searchInputPage:'搜索页'},
            contentTagSource: {dailyUpdate:'今日更新', searchResultPage:'搜索结果及自选内容页', customResultPage:'搜索结果及自选内容页', contentPage:'文章详情页'}
        }
    };

    if (yunzhidao.config.isRunMode && !yunzhidao.config.isWeixin) {
        var adaNum = '<%=adaNum %>';
        if (adaNum) {
            yunzhidao.authenticationInfo.adaNum = adaNum;
            yunzhidao.authenticationInfo.isAboUser = true;
            amwaysearch.components.searchresult.getAboInfoAndCallback();
        }
    }
    window.yunzhidao = yunzhidao;

    $(document).ready(function() {
        if (!yunzhidao.config.isWeixin) {
            amwaysearch.components.search.addQrCodeSection();
        }
    });
</script>

<footer>
    版权为安利(中国)日用品有限公司所有 <br> 未经许可不得转载或链接  粤ICP备05013154号
</footer>
