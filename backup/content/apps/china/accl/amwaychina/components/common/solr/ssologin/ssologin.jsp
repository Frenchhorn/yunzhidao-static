<%@include file="/libs/foundation/global.jsp"%>

<%@page import ="org.json.JSONObject,
    com.aem.amway.webAuthentication.constants.SsoConstants,
    com.aem.amway.webAuthentication.sso.sdk.model.*,
    com.aem.amway.webAuthentication.sso.sdk.SSOCentre,
    com.aem.amway.search.util.AmwaySearchUtil" %>

<%
    String fromUrl = request.getParameter(SsoConstants.PARAM_RESOURCE);
    request.getSession().setAttribute(SsoConstants.PARAM_CH_RESOURCEPATH, fromUrl);

    if (null == request.getSession().getAttribute(SsoConstants.PARAM_CH_SSO_USER)
            && null == AmwaySearchUtil.getCookieValueByName(request, SsoConstants.PARAM_CH_SSO_USER)){
        SsoConfiguration ssoConfig = sling.getService(SsoConfiguration.class);
        SSOCentre ssoCentre= new SSOCentre(ssoConfig);
        String state= String.valueOf(System.currentTimeMillis());
        JSONObject paramObj = new JSONObject();

        out.println("<h3 align=center>Redirecting to SSO Center...</h3>");
        out.println(ssoCentre.authorize(state, null, null, paramObj.toString(), Display.MOBILE));
    }
%>
