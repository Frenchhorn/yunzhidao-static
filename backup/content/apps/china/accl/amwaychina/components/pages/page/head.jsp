<%--
  Copyright 1997-2010 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  Default head script.

  Draws the HTML head with some default content:
  - includes the WCML init script
  - includes the head libs script
  - includes the favicons
  - sets the HTML title
  - sets some meta data

  ==============================================================================

--%>
<%@ include file="/libs/foundation/global.jsp" %>
<%@ page import="com.day.cq.commons.Doctype,
                   org.apache.commons.lang3.StringEscapeUtils,
                   com.day.cq.wcm.foundation.Image,
                   java.text.ParseException,
                   java.text.SimpleDateFormat,
                   java.util.Date,
                   org.apache.commons.lang3.StringUtils" %>
<%
    String xs = Doctype.isXHTML(request) ? "/" : "";
    String favIcon = "/content/dam/china/accl/amwaychina/system-support-tools/icons--buttons/favicon.ico";
    if (resourceResolver.getResource(favIcon) == null) {
        favIcon = currentDesign.getPath() + "/favicon.ico";
    }
    if (resourceResolver.getResource(favIcon) == null) {
        favIcon = null;
    }

    String imageUrl = "";
    Resource imgRes = currentPage.getContentResource("image");
    if (imgRes != null) {
        Image image = new Image(imgRes);
        imageUrl = image.getFileReference();
    }

    Date formattedDate = null;
    String formattedDateStr = "";

    SimpleDateFormat displayDateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd");
    SimpleDateFormat sdf2 = new SimpleDateFormat("yyyy.MM.dd");
    SimpleDateFormat sdf3 = new SimpleDateFormat("MM/dd/yyyy");

    Resource pageNode = resourceResolver.getResource(currentPage.getPath());
    ValueMap jcrvalueMap = pageNode.adaptTo(ValueMap.class);

    String publishDate = properties.get("publishDate", String.class);
    String dateField = properties.get("datefield", String.class);
    if (dateField == null) {
        dateField = jcrvalueMap.get("jcr:content/content/text/datefield", String.class);
    }
    Date lastModified = properties.get("cq:lastModified", Date.class);
    if (lastModified == null) {
        lastModified = jcrvalueMap.get("jcr:content/content/text/jcr:lastModified", Date.class);
    }
    Date created = properties.get("jcr:created", Date.class);

    if (publishDate != null) {
        try {
            formattedDate = sdf1.parse(publishDate);
        } catch (ParseException e1) {
            try {
                formattedDate = sdf2.parse(publishDate);
            } catch (ParseException e2) {
                try {
                    formattedDate = sdf3.parse(publishDate);
                } catch (ParseException e3) {}
            }
        }
    } else if (dateField != null) {
        try {
            formattedDate = sdf1.parse(dateField);
        } catch (ParseException e1) {
            try {
                formattedDate = sdf2.parse(dateField);
            } catch (ParseException e2) {
                try {
                    formattedDate = sdf3.parse(dateField);
                } catch (ParseException e3) {}
            }
        }
    } else if (lastModified != null) {
        formattedDate = lastModified;
    } else {
        formattedDate = created;
    }
    if (formattedDate != null) {
        formattedDateStr = displayDateFormat.format(formattedDate);
    }
%>

<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta charset="utf-8"/>
    <meta name="keywords" content="<%= StringEscapeUtils.escapeHtml4(WCMUtils.getKeywords(currentPage, false)) %>"<%=xs%>>
    <meta name="description" content="<%= StringEscapeUtils.escapeHtml4(properties.get("jcr:description", "")) %>"<%=xs%>>
    <meta name="viewport" content="user-scalable=no,width=device-width,initial-scale=1, minimum-scale=1.0, maximum-scale=2.0"<%=xs%>>
    <% if (StringUtils.isNotEmpty(properties.get("videoLength", ""))) { %>
    <meta name="videolength" content="<%= StringEscapeUtils.escapeHtml4(properties.get("videoLength", "")) %>"<%=xs%>>
    <% } %>
    <% if (StringUtils.isNotEmpty(formattedDateStr)) { %>
    <meta name="publishdate" content="<%= StringEscapeUtils.escapeHtml4(formattedDateStr) %>"<%=xs%>>
    <% } %>
    <meta name="thumbnail" content="<%= StringEscapeUtils.escapeHtml4(imageUrl) %>"<%=xs%>>
    <cq:include script="/libs/wcm/core/components/init/init.jsp"/>
    <cq:include script="mainheadlibs.jsp"/>
    <cq:include script="headlibs.jsp"/>
    <% if (favIcon != null) { %>
    <link rel="icon" type="image/vnd.microsoft.icon" href="<%= favIcon %>"<%=xs%>>
    <link rel="shortcut icon" type="image/vnd.microsoft.icon" href="<%= favIcon %>"<%=xs%>>
    <% } %>
    <title><%= currentPage.getTitle() == null ? StringEscapeUtils.escapeHtml4(currentPage.getName()) : StringEscapeUtils.escapeHtml4(currentPage.getTitle()) %></title>
    <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->

    <!--ADMaster-->
    <script type="text/javascript">
        var _smq = _smq || [];

        _smq.push(['_setAccount', '41d8f5a', new Date()]);
        _smq.push(['_setDomainName', 'http://www.amway.com.cn/']);
        _smq.push(['pageview']);

        (function() {
            var sm = document.createElement('script'); sm.type = 'text/javascript'; sm.async = true;
            sm.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'cdnmaster.com/sitemaster/collect.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(sm, s);
        })();
    </script>
</head>
