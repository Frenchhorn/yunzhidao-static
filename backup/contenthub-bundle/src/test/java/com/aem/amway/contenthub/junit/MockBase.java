package com.aem.amway.contenthub.junit;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;

import com.github.tomakehurst.wiremock.core.Options;
import com.github.tomakehurst.wiremock.junit.WireMockRule;

public abstract class MockBase {

    @Rule
    public WireMockRule wireMockRule;

    @Before
    public void init() {
        wireMockRule = new WireMockRule(wireMockConfig());
        wireMockRule.start();
        setupStub();
    }

    @After
    public void tearDown() {
        wireMockRule.stop();
        wireMockRule.shutdown();
    }

    public abstract Options wireMockConfig();

    public abstract void setupStub();
}
