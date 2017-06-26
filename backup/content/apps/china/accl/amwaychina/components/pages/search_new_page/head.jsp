<%@ page language="java" import="java.util.*" pageEncoding="utf-8" trimDirectiveWhitespaces="true" %>
<%@ include file="/libs/foundation/global.jsp" %>
<%@page import ="com.aem.amway.search.util.AmwaySearchUtil,
                 com.aem.amway.search.services.service.ConfigService" %>

<%
    boolean isWeixin = AmwaySearchUtil.isUAofWechat(request);

    ConfigService configService = sling.getService(ConfigService.class);
    String oldDomain = configService.getMobileDomain();
    String newDomain = configService.getContenthubDomain();
%>
<head>
    <meta charset="utf-8">
    <meta name="description" content="">
    <meta name="keywords" content="">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta http-equiv="Cache-Control" content="max-age=2592000">
    <meta name="renderer" content="webkit">
    <meta name="format-detection" content="telephone=no">
    <meta http-equiv="Content-Language" content="zh-cn">
    <!-- Add to homescreen for Chrome on Android -->
    <meta name="mobile-web-app-capable" content="yes">
    <!-- Add to homescreen for Safari on iOS -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="Amaze UI">
    <meta name="msapplication-TileColor" content="#0e90d2">

    <title>安利云知道</title>

    <!-- redirect: oldDomain redirect to newDomain -->
    <script type="text/javascript">
        var url = window.location.href;
        if (url.indexOf('<%=oldDomain %>') === 0 && url.indexOf('<%=newDomain %>') !== 0) {
            url = url.replace('<%=oldDomain %>', '<%=newDomain %>');
            window.location.replace(url);
        }
    </script>

    <% if (!!isWeixin) { %>
    <script id="WeixinJSSDKUrl" src="https://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
    <% } %>
    <cq:include script="/libs/wcm/core/components/init/init.jsp"/>
    <cq:includeClientLib categories="jquery" />
    <cq:includeClientLib categories="jquery-ui" />
    <cq:includeClientLib categories="etcdesigns.amway-core.cn.solrSearch" />
    <% if (!!isWeixin) { %>
    <cq:includeClientLib categories="etcdesigns.amway-core.cn.wechat" />
    <% } %>
</head>
