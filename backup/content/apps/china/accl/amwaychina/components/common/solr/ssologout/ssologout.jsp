<%@ page language="java" import="java.util.*" pageEncoding="utf-8" trimDirectiveWhitespaces="true" %>
<%@ include file="/libs/foundation/global.jsp" %>
<%@ page import="com.aem.amway.webAuthentication.sso.sdk.model.SsoConfiguration" %>

<%
    SsoConfiguration ssoConfig = sling.getService(SsoConfiguration.class);
    String indexPath = ssoConfig.getIndexUrl();
    String logoutPath = ssoConfig.getLogoutRedirectUri();
%>
<script>
    $("<link>").attr({rel:"stylesheet", type:"text/css", href:"/etc/designs/china/accl/amwaychina/clientlibs-cn-contenthub-kit/css/prompt.min.css"}).appendTo("head");
</script>

<div class="main-con prompt-con logout">
    <div class="logo"></div>
    <div class="text-con">
        <div class="title">您当前已登录！</div>
        <div>点击下方“返回首页”按钮开始业务查询之旅。</div>
    </div>
    <div class="btn-con">
        <div class="btn red">返回首页</div>
        <div class="btn blue">退出登录</div>
    </div>
    <div class="copyright">版权为安利（中国）日用品有限公司所有，未经许可不得转载或链接，2006年粵ICP备05013154 </div>
</div>

<script>
    $('.btn.red').on('click', function(){
        window.location.href = '<%=indexPath %>';
    });
    $('.btn.blue').on('click', function(){
        window.location.href = '<%=logoutPath %>';
    });
</script>
