<%@ page language="java" import="java.util.*" pageEncoding="utf-8" trimDirectiveWhitespaces="true" %>
<%@ include file="/libs/foundation/global.jsp" %>
<body ontouchstart="">
    <cq:include path="clientcontext" resourceType="cq/personalization/components/clientcontext"/>
    <%@ include file="weixinInfo.jsp" %>
    <cq:include path="par" resourceType="/libs/foundation/components/parsys"/>
    <%@ include file="footer.jsp" %>
    <cq:include path="cloudservices" resourceType="cq/cloudserviceconfigs/components/servicecomponents"/>
</body>
