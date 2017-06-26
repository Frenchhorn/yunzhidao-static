<%--

  h5ContentPage component.

  H5 Content Page

--%>
<%@ page language="java" import="java.util.*" pageEncoding="utf-8" trimDirectiveWhitespaces="true"%>
<%@ include file="/libs/foundation/global.jsp"%>
<%@ page import="org.apache.commons.lang3.StringEscapeUtils"%>
<%
    String h5Description = properties.get("h5Description", "");
    String h5Url = properties.get("h5Url", "");
%>

<section class="h5-content">
    <h1 class="h5-content-h1"><%= currentPage.getTitle() == null ? StringEscapeUtils.escapeHtml4(currentPage.getName()) : StringEscapeUtils.escapeHtml4(currentPage.getTitle()) %></h1>
    <p><%=h5Description %></p>
    <a href="<%=h5Url %>" class="h5-content-url"><%=h5Url %></a>
</section>
