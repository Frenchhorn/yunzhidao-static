package com.aem.amway.contenthub.services.service;

/**
 * ConfigService
 */
public interface ConfigService {

    /**
     * @return
     */
    public String getMobileDomain();

    /**
     * @return
     */
    public String getContenthubDomain();

    /**
     * @return
     */
    public String getContenthubPath();

    /**
     * @return
     */
    public int getContenthubRelatedHierarchy();

    /**
     * @return
     */
    public String getYunZhiDaoSearchResultUrl();

    /**
     * @return
     */
    public String getWechatAppId();

    /**
     * @return
     */
    public String getWechatAuthorizeUrl();

    /**
     * @return
     */
    public String getWechatFrameworkAppId();

    /**
     * @return
     */
    public String getWechatFrameworkUrl();

    /**
     * @return
     */
    public String getWechatFrameworkGetTokenUrl();

    /**
     * @return
     */
    public String getWechatFrameworkGetUserinfoUrl();
}
