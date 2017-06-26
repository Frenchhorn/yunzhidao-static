package com.aem.amway.contenthub.services.stub.servlet;

import java.io.IOException;
import java.util.Arrays;
import java.util.Dictionary;

import javax.servlet.Servlet;
import javax.servlet.ServletException;

import org.apache.commons.lang.StringUtils;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Properties;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.apache.sling.commons.json.JSONException;
import org.apache.sling.commons.json.JSONObject;
import org.apache.sling.commons.osgi.OsgiUtil;
import org.osgi.framework.Constants;
import org.osgi.service.component.ComponentContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.aem.amway.contenthub.constants.ContenthubConstants;

/**
 * WeiXin stub for development environment only
 */

@Component(name = "com.aem.amway.contenthub.services.stub.servlet.WeixinStub", label = "Content Hub - WeChat Stub", description = "WeChat Stub for Dev", immediate = true, metatype = true)
@Service(Servlet.class)
@Properties({ @Property(name = Constants.SERVICE_VENDOR, value = "Accenture Company Ltd."),
        @Property(name = Constants.SERVICE_DESCRIPTION, value = "Content Hub - WeChat Stub"),
        @Property(name = "sling.servlet.methods", value = { "GET", "POST" }),
        @Property(name = "sling.servlet.paths", value = { "/bin/contenthub/weixinstub/authentication",
                "/bin/contenthub/weixinstub/token", "/bin/contenthub/weixinstub/userinfo" }) })
public class WeixinStub extends SlingAllMethodsServlet {

    /**
     * 
     */
    private static final long serialVersionUID = -5841111772699920700L;

    private static final Logger LOG = LoggerFactory.getLogger(WeixinStub.class);

    private static final String WECHAT_USERTYPE_BASEUSER = "BASEUSER";

    private static final String WECHAT_USERTYPE_WECHATUSER = "WECHATUSER";

    private static final String WECHAT_TOKEN = "WECHAT_FRAMWORK_AUTHORISE:9435a070-729d-4f1b-84b7-e3ce389c2532";

    /** The Constant ADA_NUM. */
    @Property(value = "", label = "ADA Number", description = "user's ada number")
    private static final String ADA_NUM = "amway.contenthub.services.stub.adanum";

    /**
     * The ada number. Sample list:
     * PC  优惠顾客    3313459
     * SR  营销人员    364365
     * SA  经销商      45296761 (未开通)
     * SA  经销商      414033 (已开通)
     */
    private String adaNum;

    /**
     * Activate.
     *
     * @param componentContext
     *            the component context
     */
    @SuppressWarnings("deprecation")
    protected void activate(ComponentContext componentContext) {
        @SuppressWarnings("unchecked")
        Dictionary<String, Object> properties = (Dictionary<String, Object>) componentContext.getProperties();
        adaNum = OsgiUtil.toString(properties.get(ADA_NUM), "");
    }

    @Override
    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response)
            throws ServletException, IOException {
        String path = request.getPathInfo();
        if (path.contains("/bin/contenthub/weixinstub/authentication")) {
            // Step 1: execute Wechat authentication
            executeWechatAuthentication(request, response);
        } else if (path.contains("/bin/contenthub/weixinstub/token")) {
            // Step 2: get Wechat token and redirect
            redirectToURLWithWechatToken(request, response);
        } else if (path.contains("/bin/contenthub/weixinstub/userinfo")) {
            // Step 3: return user info
            getUserInfo(request, response);
        }
    }

    @Override
    protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response);
    }

    /**
     * Execute Wechat authentication(skip) and redirect to URL("redirect_uri")
     *
     * @throws IOException
     */
    private void executeWechatAuthentication(SlingHttpServletRequest request, SlingHttpServletResponse response)
            throws IOException {
        String redirectURI = request.getParameter("redirect_uri");
        response.sendRedirect(redirectURI);
    }

    /**
     * Update URL("redirectUrl") by attaching "userType" and "token", and
     * redirect to this new URL <br>
     * Requirement: 10.3 公众号统一新的内网授权
     *
     * @param request
     * @param response
     * @throws IOException
     */
    private void redirectToURLWithWechatToken(SlingHttpServletRequest request, SlingHttpServletResponse response)
            throws IOException {
        String redirectUrl = request.getParameter("redirectUrl");
        String userType = request.getParameter("userType");

        if (StringUtils.isNotBlank(redirectUrl)) {
            redirectUrl += ((redirectUrl.indexOf("?") == -1) ? "?" : "&")
                    + "userType=" + (StringUtils.isNotBlank(userType) ? userType : WECHAT_USERTYPE_WECHATUSER)
                    + "&token=" + WECHAT_TOKEN;
            response.sendRedirect(redirectUrl);
        } else {
            LOG.error("Blank redirectUrl");
        }
    }

    /**
     * Return JSON string of user_info <br>
     * Requirement: 10.4 根据token获取用户信息
     *
     * @param request
     * @param response
     * @throws IOException
     */
    private void getUserInfo(SlingHttpServletRequest request, SlingHttpServletResponse response) throws IOException {
        JSONObject userInfoObject = new JSONObject();
        String token = request.getParameter("token");
        String userType = request.getParameter("userType");
        String callback = request.getParameter("callback");

        if (StringUtils.isNotBlank(token) && StringUtils.isNotBlank(userType)) {
            try {
                if (WECHAT_USERTYPE_BASEUSER.equals(userType)) {
                    userInfoObject.put("ada", adaNum);
                    userInfoObject.put("dst_type", "SA");
                    userInfoObject.put("pin_level", "N");
                    userInfoObject.put("openid", "oIy_tjqPioir4Zk6mgEyQ6-Ot46U");
                    userInfoObject.put("name1", "Amy Liang");
                    userInfoObject.put("name2", "梁艾米");
                } else if (WECHAT_USERTYPE_WECHATUSER.equals(userType)) {
                    userInfoObject.put("subscribe", 1);
                    userInfoObject.put("openid", "oIy_tjqPioir4Zk6mgEyQ6-Ot46U");
                    userInfoObject.put("nickname", "wen");
                    userInfoObject.put("sex", 1);
                    userInfoObject.put("language", "zh_CN");
                    userInfoObject.put("city", "广州");
                    userInfoObject.put("province", "广东");
                    userInfoObject.put("country", "中国");
                    userInfoObject.put("headimgurl", "http://wx.qlogo.cn/mmopen/ksTBgUqVoNb2iaq2o5Y2aiaevaA1MUT9h1vaIIQjHIhhhhia6aTYhs7mk0XtYZKgz62hrcacNOokhNOHzuO4uFr0COku9ABcBIc/0");
                    userInfoObject.put("subscribe_time", 1437545725);
                    userInfoObject.put("remark", "");
                    userInfoObject.put("groupid", 0);
                    userInfoObject.put("tagid_list", Arrays.toString(new String[] {}));
                    userInfoObject.put("status", "1");
                    userInfoObject.put("code", "1");
                    userInfoObject.put("ada", adaNum);
                } else {
                    LOG.error("Invalid userType: " + userType);
                }
            } catch (JSONException e) {
                LOG.error("JSONException Error: ", e);
            }
        }

        response.setHeader(ContenthubConstants.CONTENT_TYPE, ContenthubConstants.CONTENT_TYPE_JS);
        response.setCharacterEncoding(ContenthubConstants.CHARSET_UTF8);
        response.getWriter().print(callback + "(" + userInfoObject.toString() + ");");
    }
}
