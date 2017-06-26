package com.aem.amway.contenthub.services.service.impl;

import java.util.Dictionary;
import java.util.Hashtable;

import org.easymock.EasyMock;
import org.junit.Before;
import org.junit.Test;
import org.osgi.service.component.ComponentContext;

import junit.framework.Assert;

public class ConfigServiceImplTest {

    private ConfigServiceImpl configService;
    private ComponentContext context;

    @Before
    public void setUp() throws Exception {
        Dictionary props = new Hashtable();
        props.put(ConfigServiceImpl.WECHAT_FRAMEWORK_URL, "http://weixin-qa.amwaynet.com.cn/swechatframework/binder/admin/js/jssdk.jhtml?sid=gh_819dc520def4");
        props.put(ConfigServiceImpl.MOBILE_DOMAIN, "http://mobile.com");
        props.put(ConfigServiceImpl.YUNZHIDAO_SEARCHRESULT_URL, "http://m.amwaynet.com.cn/content/china/accl/solr/searchResults.html");

        configService = new ConfigServiceImpl();
        context = EasyMock.createMock(ComponentContext.class);
        EasyMock.expect(context.getProperties()).andReturn(props).times(1);
        EasyMock.replay(context);
    }

    @Test
    public void testActivate() {
        configService.activate(context);
        Assert.assertEquals("http://weixin-qa.amwaynet.com.cn/swechatframework/binder/admin/js/jssdk.jhtml?sid=gh_819dc520def4", configService.getWechatFrameworkUrl());
        Assert.assertEquals("http://mobile.com", configService.getMobileDomain());
        Assert.assertEquals("http://m.amwaynet.com.cn/content/china/accl/solr/searchResults.html", configService.getYunZhiDaoSearchResultUrl());
    }

    @Test
    public void testConfigure() {
        Dictionary newProps = new Hashtable();
        newProps.put(ConfigServiceImpl.WECHAT_FRAMEWORK_URL, "http://weixin-qa.amwaynet.com.cn/swechatframework/binder/admin/js/jssdk.jhtml?sid=gh_819dc520def4");
        newProps.put(ConfigServiceImpl.MOBILE_DOMAIN, "http://mobile.com.cn/");
        newProps.put(ConfigServiceImpl.YUNZHIDAO_SEARCHRESULT_URL, "http://m.amwaynet.com.cn/content/china/accl/solr/searchResults.html");

        configService.configure(newProps);
        Assert.assertEquals("http://weixin-qa.amwaynet.com.cn/swechatframework/binder/admin/js/jssdk.jhtml?sid=gh_819dc520def4", configService.getWechatFrameworkUrl());
        Assert.assertEquals("http://mobile.com.cn/", configService.getMobileDomain());
        Assert.assertEquals("http://m.amwaynet.com.cn/content/china/accl/solr/searchResults.html", configService.getYunZhiDaoSearchResultUrl());
    }
}
