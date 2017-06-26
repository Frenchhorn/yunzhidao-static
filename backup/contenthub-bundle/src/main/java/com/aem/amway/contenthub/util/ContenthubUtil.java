package com.aem.amway.contenthub.util;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.aem.amway.contenthub.constants.ContenthubConstants;

public class ContenthubUtil {
    private final static Logger logger = LoggerFactory.getLogger(ContenthubUtil.class);

    public static boolean isUAofWechat(HttpServletRequest request) {
        return request.getHeader(ContenthubConstants.USER_AGENT).toLowerCase()
                .indexOf(ContenthubConstants.UA_MICRO_MESSENGER) > 0;
    }

    public static String getAdaFromCookie(HttpServletRequest request) {
        String adaInfo = getCookieValueByName(request, ContenthubConstants.PARAM_CH_NAMEADA);
        return StringUtils.isNotBlank(adaInfo) ? adaInfo.substring(adaInfo.lastIndexOf("|") + 1) : StringUtils.EMPTY;
    }

    public static String getCookieValueByName(HttpServletRequest request, String cookieName) {
        String cookieValue = null;
        Cookie cookie = getCookieByName(request, cookieName);
        if (null != cookie) {
            try {
                cookieValue = URLDecoder.decode(cookie.getValue(), ContenthubConstants.CHARSET_UTF8);
                logger.info("Cookie: {} = {}", cookieName, cookieValue);
            } catch (UnsupportedEncodingException e) {
                logger.error("Error occurs when decode cookie value", e);
            }
        } else {
            logger.info("Cookie: {} = null", cookieName);
        }
        return cookieValue;
    }

    public static Cookie getCookieByName(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (null != cookies) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(cookieName)) {
                    return cookie;
                }
            }
        }
        return null;
    }
}
