<%@ page language="java" import="java.util.*" pageEncoding="utf-8" trimDirectiveWhitespaces="true" %>
<%@ include file="/libs/foundation/global.jsp" %>
<%@ page import="com.day.cq.tagging.Tag, com.day.cq.tagging.TagManager, com.day.cq.wcm.api.PageFilter" %>
<%@ page import="com.aem.amway.contenthub.services.service.ConfigService, org.json.JSONObject, org.json.JSONArray" %>

<%
    String pageTitle = properties.get("pageTitle", "Content Hub Article Statistics");
    String[] columnFields = properties.get("columnFields", String[].class);
    List<String> columnLabelList = new ArrayList<String>();
    List<String> columnKeyList = new ArrayList<String>();
    JSONArray dataJSONArray = new JSONArray();

    if (null != columnFields) {
        for (String columnField: columnFields) {
            JSONObject columnFieldItem = new JSONObject(columnField);
            String columnLabel = columnFieldItem.getString("columnLabel");
            String columnKey = columnFieldItem.getString("columnKey");
            columnLabelList.add(columnLabel);
            columnKeyList.add(columnKey);
        }

        TagManager tagManager = resource.getResourceResolver().adaptTo(TagManager.class);
        ConfigService configService = sling.getService(ConfigService.class);
        String contentHubPath = configService.getContenthubPath();
        Resource rootRes = resource.getResourceResolver().resolve(contentHubPath);
        Page rootPage = rootRes.adaptTo(Page.class);

        Map<String, JSONObject> dataMap = new HashMap();
        Iterator<Page> rootPageIterator = rootPage.listChildren(new PageFilter(false, false), true);
        while (rootPageIterator.hasNext()) {
            Page childPage = rootPageIterator.next();
            ValueMap childPageProperties = childPage.adaptTo(ValueMap.class);
            JSONObject dataJSON = new JSONObject();

            for (String columnKey: columnKeyList) {
                String dataValue = "";
                if ("title".equals(columnKey)) {
                    dataValue = childPage.getTitle();
                } else if ("path".equals(columnKey)) {
                    dataValue = childPage.getPath();
                } else if ("tags".equals(columnKey)) {
                    int i = 0;
                    for (Tag tag: childPage.getTags()) {
                        dataValue += tag.getTitle();
                        if (i < childPage.getTags().length - 1) {
                            dataValue += ", ";
                        }
                        i++;
                    }
                } else {
                    dataValue = childPageProperties.get(columnKey, "");
                    if (!"".equals(dataValue) && "jcr:content/maintitle/source".equals(columnKey)) {
                        Tag tag = tagManager.resolve(dataValue);
                        if (null != tag) {
                            dataValue = tag.getTitle();
                        }
                    }
                }
                dataJSON.put(columnKey, dataValue);
            }

            dataMap.put(childPage.getPath(), dataJSON);
        }

        Object[] dataMapKeyArray = dataMap.keySet().toArray();
        Arrays.sort(dataMapKeyArray);
        for (Object dataMapKey: dataMapKeyArray) {
            dataJSONArray.put(dataMap.get(dataMapKey));
        }
    }
%>

<style type="text/css">
    .page-title {
        text-align: -webkit-center;
        line-height: 35px;
        font-weight: 700;
        margin-bottom: 10px;
        width: 100%;
        color: #fff;
        background-color: rgba(0, 73, 138, 0.7);
    }

    .article-div {
        font-size: 14px;
        margin: 0 15px;
        text-align: -webkit-center;
    }

    .article-table {
        border: 1px solid #999;
        width: 100%;
        vertical-align: middle;
    }

    .article-table th {
        border: 1px solid #999;
        padding: 5px;
        background-color: rgba(0, 73, 138, 0.7);
        color: #fff;
    }

    .article-table td {
        border: 1px solid #999;
        padding: 5px;
    }

    .float-button-div {
        position: fixed;
        z-index: 999;
        right: 5px;
        top: 25%;
    }

    .float-button-div a {
        position: relative;
        display: block;
        margin-bottom: 5px;
        width: 40px;
    }

    .float-button-div a img {
        width: 100%;
        display: inline-block;
    }
</style>

<div class="page-title"><span><%=pageTitle %></span></div>
<div class="article-div">
    <%
        if (null != columnFields) {
    %>
    <div class="float-button-div">
        <a class="btnTop" href="javascript:$('body').scrollTop(0);" title="Scroll Top">
            <img alt="icon to top" src="/etc/designs/china/accl/amwaychina/clientlibs-cn-solrSearch/images/icon_top.png">
        </a>
        <a class="btnExport" href="javascript:;" title="Export to Excel (xls file)">
            <img alt="icon to download excel" src="/etc/designs/china/accl/amwaychina/clientlibs-cn-solrSearch/images/icon_xls.png">
        </a>
        <a class="btnBottom" href="javascript:$('body').scrollTop(document.body.clientHeight);" title="Scroll Bottom">
            <img alt="icon to bottom" src="/etc/designs/china/accl/amwaychina/clientlibs-cn-solrSearch/images/icon_bottom.png">
        </a>
    </div>
    <table class="article-table">
        <tr>
            <%
                for (String columnLabel: columnLabelList) {
            %>
            <th><%=columnLabel %></th>
            <%
                }
            %>
        </tr>
        <%
            for (int i = 0; i < dataJSONArray.length(); i++) {
                JSONObject dataJSON = dataJSONArray.getJSONObject(i);
        %>
        <tr>
            <%
                for (String columnKey: columnKeyList) {
            %>
            <td><%=dataJSON.getString(columnKey) %></td>
            <%
                }
            %>
        </tr>
        <%
            }
        %>
    </table>
    <%
        } else {
    %>
    <span class="p10 bgblue wh f26 b">Please set up the page first!</span>
    <%
        }
    %>
</div>

<script type="text/javascript">
    var tableToExcel = (function() {
        var uri = 'data:application/vnd.ms-excel;base64,',
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
            + '<head><meta http-equiv="Content-type" content="text/html;charset=UTF-8" /><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/>'
            + '</x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
            base64 = function(s) {
                return window.btoa(unescape(encodeURIComponent(s)))
            },
            format = function(s, c) {
                return s.replace(/{(\w+)}/g, function(m, p) {
                    return c[p];
                })
            };

        return function(table, name) {
            var ctx = {
                worksheet: name || 'Worksheet',
                table: table
            }
            return uri + base64(format(template, ctx));
        }
    })();

    $(function() {
        $('.btnExport').on('click', function() {
            var $this = $(this);
            //设定下载的文件名及后缀
            $this.attr('download', 'Content-Hub文章统计-' + new Date().getTime() + '.xls');
            //设定下载内容
            $this.attr('href', tableToExcel($('.article-table').html(), 'Content-Hub文章统计'));
        });
    });

    $(document).ready(function() {
        $('title').text('<%=pageTitle %>');
    });
</script>
