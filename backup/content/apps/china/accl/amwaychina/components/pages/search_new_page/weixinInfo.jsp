<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8" %>
<%@ include file="/libs/foundation/global.jsp" %>
<%@ page import="java.util.*, javax.jcr.Session,com.day.cq.wcm.api.WCMMode, com.aem.amway.search.services.service.ConfigService" %>
<%
    ConfigService configUtil = sling.getService(ConfigService.class);
    String currentPagePathWithSelectors = currentPage.getPath();
    String[] selector = slingRequest.getRequestPathInfo().getSelectors();
    if (null != selector && selector.length > 0) {
        for (int i = 0; i < selector.length; i++) {
            currentPagePathWithSelectors += "." + selector[i];
        }
    }
%>

<input type="hidden" id="current_page_base_path" value="<%=currentPagePathWithSelectors %>" />
<input type="hidden" id="weChatDescription" value="安利官方文章、视频、图片...海量资讯一站式提供" />
<input type="hidden" id="wechatImage" value="http://www.amway.com.cn/content/dam/china/accl/alyzd/logo.jpg" />
<input type="hidden" id="wechatTitle" value="安利云知道" />
<input type="hidden" id="wechatFrameworkUrl" value="<%=configUtil.getWechatFrameworkUrl() %>" />
<input type="hidden" id="wechatShare" value="true" />
