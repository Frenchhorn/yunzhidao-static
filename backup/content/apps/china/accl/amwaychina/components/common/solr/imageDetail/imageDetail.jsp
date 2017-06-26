<%@ page language="java" import="java.util.*" pageEncoding="utf-8" trimDirectiveWhitespaces="true" %>
<%@ include file="/libs/foundation/global.jsp" %>
<%@ page import="org.apache.sling.api.request.RequestParameter" %>

<%
    RequestParameter param = slingRequest.getRequestParameter("src");
    String src = "";
    if (null != param) {
        src = param.getString("UTF-8");
    }

    param = slingRequest.getRequestParameter("title");
    String title = "";
    if (null != param) {
        title = param.getString("UTF-8");
    }
%>

<div class="main-con">
    <header class="common search">
        <div class="bar-t">
            <a class="btn-home">
                <i class="svg-icon icon-37"></i>
            </a>
            <div class="text-con am-text-center">
                <span class="title am-text-truncate"><%=title %></span>
            </div>
        </div>
    </header>
    <div class="content-body product">
        <div class="content-group">
            <div class="content-box">
                <div class="product-img" style="background-image:url('<%=src %>')">
                    <img src="<%=src %>" alt="<%=title %>"/>
                </div>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    $('.btn-home').mousedown(function(){
        history.back();
    })

    $(document).ready(function () {
        resizeMainCon();
    });
</script>
