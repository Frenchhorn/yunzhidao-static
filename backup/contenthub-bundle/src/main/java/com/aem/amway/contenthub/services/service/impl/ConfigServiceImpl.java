package com.aem.amway.contenthub.services.service.impl;

import java.util.Dictionary;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.commons.osgi.OsgiUtil;
import org.osgi.service.component.ComponentContext;

import com.aem.amway.contenthub.services.service.ConfigService;

/**
 * ConfigServiceImpl
 *
 *
 */
@SuppressWarnings("deprecation")
@Component(immediate = true, metatype = true, label = "Content Hub Service")
@Service(value = ConfigService.class)
public class ConfigServiceImpl implements ConfigService {

    @Property(label = "Mobile website - server domain", description = "Input mobile website domain")
    public static final String MOBILE_DOMAIN = "amway.search.config.mobile.domain";

    @Property(label = "Contenthub website - server domain", description = "Input Contenthub website domain")
    public static final String CONTENTHUB_DOMAIN = "amway.search.config.contenthub.domain";

    @Property(label = "ContentHub content path", description = "Input contentHub content path")
    public static final String CONTENTHUB_PATH = "amway.search.config.contenthub.path";

    @Property(label = "ContentHub content related hierarchy", description = "Input contentHub related content hierarchy")
    public static final String CONTENTHUB_RELEATED_HIERARCHY = "amway.search.config.contenthub.related.hierarchy";

    @Property(label = "YunZhiDao searchresult page url", description = "Input YunZhiDao searchresult page url")
    public static final String YUNZHIDAO_SEARCHRESULT_URL = "amway.search.config.contenthub.search.searchresult.url";

    @Property(label = "Wechat - app id", description = "Input wechat app id")
    public static final String WECHAT_APP_ID = "amway.search.config.wechat.appid";

    @Property(label = "Wechat url - authorization", description = "Input url for wechat authorization")
    public static final String WECHAT_AUTHORIZE_URL = "amway.search.config.wechat.authorize.url";

    @Property(label = "Wechat framework - app id", description = "Input wechat framework app id")
    public static final String WECHAT_FRAMEWORK_APP_ID = "amway.search.config.wechat.framework.appid";

    @Property(label = "WeChat Framework URL", description = "WeChat Framework URL")
    public static final String WECHAT_FRAMEWORK_URL = "amway.search.config.wechat.framework.url";

    @Property(label = "Wechat url - get token", description = "Input url to get wechat token")
    public static final String WECHAT_FRAMEWORK_GET_TOKEN_URL = "amway.search.config.wechat.framework.gettoken.url";

    @Property(label = "Wechat url - get userinfo", description = "Input url to get wechat userinfo by token and userType")
    public static final String WECHAT_FRAMEWORK_GET_USERINFO_URL = "amway.search.config.wechat.framework.getuserinfo.url";

    private String mobileDomain;

    private String contenthubDomain;

    private String contenthubPath;

    private int contenthubRelatedHierarchy;

    private String yunZhiDaoSearchResultUrl;

    private String wechatAppId;

    private String wechatAuthorizeUrl;

    private String wechatFrameworkAppId;

    private String wechatFrameworkUrl;

    private String wechatFrameworkGetTokenUrl;

    private String wechatFrameworkGetUserInfoUrl;

    @SuppressWarnings("unchecked")
    protected void activate(ComponentContext componentContext) {
        configure(componentContext.getProperties());
    }

    protected void configure(Dictionary<String, String> properties) {
        this.mobileDomain = OsgiUtil.toString(properties.get(MOBILE_DOMAIN), "");
        this.contenthubDomain = OsgiUtil.toString(properties.get(CONTENTHUB_DOMAIN), "");
        this.contenthubPath = OsgiUtil.toString(properties.get(CONTENTHUB_PATH), "");
        this.contenthubRelatedHierarchy = OsgiUtil.toInteger(properties.get(CONTENTHUB_RELEATED_HIERARCHY), 2);
        this.yunZhiDaoSearchResultUrl = OsgiUtil.toString(properties.get(YUNZHIDAO_SEARCHRESULT_URL), "");
        this.wechatAppId = OsgiUtil.toString(properties.get(WECHAT_APP_ID), "");
        this.wechatAuthorizeUrl = OsgiUtil.toString(properties.get(WECHAT_AUTHORIZE_URL), "");
        this.wechatFrameworkAppId = OsgiUtil.toString(properties.get(WECHAT_FRAMEWORK_APP_ID), "");
        this.wechatFrameworkUrl = OsgiUtil.toString(properties.get(WECHAT_FRAMEWORK_URL), "");
        this.wechatFrameworkGetTokenUrl = OsgiUtil.toString(properties.get(WECHAT_FRAMEWORK_GET_TOKEN_URL), "");
        this.wechatFrameworkGetUserInfoUrl = OsgiUtil.toString(properties.get(WECHAT_FRAMEWORK_GET_USERINFO_URL), "");
    }

    @Override
    public String getMobileDomain() {
        return mobileDomain;
    }

    public void setMobileDomain(String mobileDomain) {
        this.mobileDomain = mobileDomain;
    }

    @Override
    public String getContenthubDomain() {
        return contenthubDomain;
    }

    public void setContenthubDomain(String contenthubDomain) {
        this.contenthubDomain = contenthubDomain;
    }

    @Override
    public String getContenthubPath() {
        return contenthubPath;
    }

    public void setContenthubPath(String contenthubPath) {
        this.contenthubPath = contenthubPath;
    }

    @Override
    public int getContenthubRelatedHierarchy() {
        return contenthubRelatedHierarchy;
    }

    public void setContentHubPathHierarchy(int contentHubPathHierarchy) {
        this.contenthubRelatedHierarchy = contentHubPathHierarchy;
    }

    @Override
    public String getYunZhiDaoSearchResultUrl() {
        return yunZhiDaoSearchResultUrl;
    }

    public void setYunZhiDaoSearchResultUrl(String yunZhiDaoSearchResultUrl) {
        this.yunZhiDaoSearchResultUrl = yunZhiDaoSearchResultUrl;
    }

    @Override
    public String getWechatAppId() {
        return wechatAppId;
    }

    public void setWechatAppId(String wechatAppId) {
        this.wechatAppId = wechatAppId;
    }

    @Override
    public String getWechatAuthorizeUrl() {
        return wechatAuthorizeUrl;
    }

    public void setWechatAuthorizeUrl(String wechatAuthorizeUrl) {
        this.wechatAuthorizeUrl = wechatAuthorizeUrl;
    }

    @Override
    public String getWechatFrameworkAppId() {
        return wechatFrameworkAppId;
    }

    public void setWechatFrameworkAppId(String wechatFrameworkAppId) {
        this.wechatFrameworkAppId = wechatFrameworkAppId;
    }

    @Override
    public String getWechatFrameworkUrl() {
        return wechatFrameworkUrl;
    }

    public void setWechatFrameworkUrl(String wechatFrameworkUrl) {
        this.wechatFrameworkUrl = wechatFrameworkUrl;
    }

    @Override
    public String getWechatFrameworkGetTokenUrl() {
        return wechatFrameworkGetTokenUrl;
    }

    public void setWechatFrameworkGetTokenUrl(String wechatFrameworkGetTokenUrl) {
        this.wechatFrameworkGetTokenUrl = wechatFrameworkGetTokenUrl;
    }

    @Override
    public String getWechatFrameworkGetUserinfoUrl() {
        return wechatFrameworkGetUserInfoUrl;
    }

    public void setWechatFrameworkGetUserinfoUrl(String wechatFrameworkGetUserinfoUrl) {
        this.wechatFrameworkGetUserInfoUrl = wechatFrameworkGetUserinfoUrl;
    }
}
