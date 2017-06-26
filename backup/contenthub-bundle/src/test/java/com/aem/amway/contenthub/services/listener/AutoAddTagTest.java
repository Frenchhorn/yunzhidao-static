package com.aem.amway.contenthub.services.listener;

import java.util.ArrayList;
import java.util.Arrays;

import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.Value;
import javax.jcr.Workspace;
import javax.jcr.nodetype.NodeType;
import javax.jcr.observation.Event;
import javax.jcr.observation.EventIterator;
import javax.jcr.observation.EventListener;
import javax.jcr.observation.ObservationManager;

import org.apache.sling.jcr.api.SlingRepository;
import org.apache.sling.runmode.RunMode;
import org.easymock.EasyMock;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.osgi.service.component.ComponentContext;
import org.powermock.modules.junit4.PowerMockRunner;

import com.aem.amway.contenthub.services.service.ConfigService;

@RunWith(PowerMockRunner.class)
public class AutoAddTagTest {

    private RunMode runMode;
    private SlingRepository repository;
    private AutoAddTag autoAddTag;
    private ComponentContext component;
    private Event event;
    private EventIterator it;
    private EventIterator it2;
    private Property autoTagProperty;
    private Node PageNode;
    private Node pageContentNode1;
    private Node pageContentNode2;
    private Node pageContentNode3;
    private Node pageContentNode4;
    private Node pageContentNodeParent1;
    private Node pageContentNodeParent2;
    private Session usersession;
    private ObservationManager observationManager;
    private EventListener eventListener;
    private ArrayList<Value> autoTagList;
    private ArrayList<Value> pageTagList;

    @Before
    public void setUp() throws Exception {
        autoAddTag = new AutoAddTag();

        autoAddTag.configService = EasyMock.createMock(ConfigService.class);
        EasyMock.expect(autoAddTag.configService.getContenthubPath()).andReturn("/content/china/accl/ch");
        EasyMock.replay(autoAddTag.configService);

        component = EasyMock.createMock(ComponentContext.class);
        EasyMock.replay(component);

        event = EasyMock.createMock(Event.class);
        EasyMock.expect(event.getPath()).andReturn("/content/china/accl/ch/nutrilite").times(1);
        EasyMock.expect(event.getPath()).andReturn("/content/china/accl/ch/nutrilite/jcr:content").times(1);
        EasyMock.expect(event.getPath()).andReturn("/content/china/accl/ch/nutrilite/jcr:content").times(1);
        EasyMock.expect(event.getType()).andReturn(Event.NODE_MOVED).times(1).andReturn(Event.NODE_ADDED).times(2);
        EasyMock.replay(event);

        it = EasyMock.createMock(EventIterator.class);
        EasyMock.expect(it.hasNext()).andReturn(true).times(3).andReturn(false);
        EasyMock.expect(it.nextEvent()).andReturn(event).times(3);
        EasyMock.replay(it);

        it2 = EasyMock.createMock(EventIterator.class);
        EasyMock.replay(it2);

        Value val1 = EasyMock.createMock(Value.class);
        EasyMock.replay(val1);

        Value val2 = EasyMock.createMock(Value.class);
        EasyMock.replay(val2);

        Value val3 = EasyMock.createMock(Value.class);
        EasyMock.replay(val3);

        Value val4 = EasyMock.createMock(Value.class);
        EasyMock.replay(val4);

        Value[] autoTag = new Value[2];
        autoTag[0] = val1;
        autoTag[1] = val2;

        Value[] pageTagValue = new Value[2];
        pageTagValue[0] = val3;
        pageTagValue[1] = val4;

        Value[] pageTagValue1 = new Value[] {};

        autoTagProperty = EasyMock.createMock(Property.class);
        EasyMock.expect(autoTagProperty.getValues()).andReturn(autoTag).times(2);
        EasyMock.replay(autoTagProperty);

        Property pageTag = EasyMock.createMock(Property.class);
        EasyMock.expect(pageTag.getValues()).andReturn(pageTagValue);
        EasyMock.replay(pageTag);

        autoTagList = new ArrayList<Value>(Arrays.asList(autoTag));
        pageTagList = new ArrayList<Value>(Arrays.asList(pageTagValue));
        pageTagList.addAll(autoTagList);
        pageTagValue1 = pageTagList.toArray(new Value[pageTagList.size()]);

        Property allTagProperty = EasyMock.createMock(Property.class);
        EasyMock.expect(allTagProperty.getValues()).andReturn(pageTagValue1);
        EasyMock.replay(allTagProperty);

        PageNode = EasyMock.createMock(Node.class);
        EasyMock.expect(PageNode.hasProperty("autotags")).andReturn(true).anyTimes();
        EasyMock.expect(PageNode.getProperty("autotags")).andReturn(autoTagProperty).anyTimes();
        EasyMock.replay(PageNode);

        pageContentNodeParent2 = EasyMock.createMock(Node.class);
        EasyMock.expect(pageContentNodeParent2.getNode("jcr:content")).andReturn(PageNode).times(3);
        EasyMock.replay(pageContentNodeParent2);

        pageContentNodeParent1 = EasyMock.createMock(Node.class);
        EasyMock.expect(pageContentNodeParent1.getParent()).andReturn(pageContentNodeParent2).times(3);
        EasyMock.replay(pageContentNodeParent1);

        NodeType nodeType1 = EasyMock.createMock(NodeType.class);
        EasyMock.expect(nodeType1.isNodeType("cq:PageContent")).andReturn(true).anyTimes();
        EasyMock.replay(nodeType1);

        NodeType nodeType2 = EasyMock.createMock(NodeType.class);
        EasyMock.expect(nodeType2.isNodeType("cq:PageContent")).andReturn(false);
        EasyMock.replay(nodeType2);

        pageContentNode2 = EasyMock.createMock(Node.class);
        EasyMock.expect(pageContentNode2.getPrimaryNodeType()).andReturn(nodeType1);
        // 分支
        EasyMock.expect(pageContentNode2.hasProperty("cq:tags")).andReturn(true).times(2);
        EasyMock.expect(pageContentNode2.getProperty("cq:tags")).andReturn(pageTag);
        EasyMock.expect(pageContentNode2.getParent()).andReturn(pageContentNodeParent1);
        EasyMock.expect(pageContentNode2.setProperty(EasyMock.eq("cq:tags"), EasyMock.anyObject(Value[].class)))
                .andReturn(allTagProperty).times(1);
        EasyMock.replay(pageContentNode2);

        pageContentNode1 = EasyMock.createMock(Node.class);
        EasyMock.expect(pageContentNode1.getNode("jcr:content")).andReturn(pageContentNode2);
        EasyMock.replay(pageContentNode1);

        pageContentNode3 = EasyMock.createMock(Node.class);
        EasyMock.expect(pageContentNode3.getParent()).andReturn(pageContentNodeParent1);
        EasyMock.expect(pageContentNode3.getPrimaryNodeType()).andReturn(nodeType2);
        EasyMock.replay(pageContentNode3);

        pageContentNode4 = EasyMock.createMock(Node.class);
        EasyMock.expect(pageContentNode4.getPrimaryNodeType()).andReturn(nodeType1);
        EasyMock.expect(pageContentNode4.getParent()).andReturn(pageContentNodeParent1);
        EasyMock.expect(pageContentNode4.hasProperty("cq:tags")).andReturn(false).times(2);
        EasyMock.expect(pageContentNode4.setProperty("cq:tags", autoTag)).andReturn(autoTagProperty);
        EasyMock.replay(pageContentNode4);

        eventListener = EasyMock.createMock(EventListener.class);
        EasyMock.replay(eventListener);

        observationManager = EasyMock.createNiceMock(ObservationManager.class);
        EasyMock.replay(observationManager);

        Workspace workspace = EasyMock.createMock(Workspace.class);
        EasyMock.expect(workspace.getObservationManager()).andReturn(observationManager);
        EasyMock.replay(workspace);

        usersession = EasyMock.createMock(Session.class);
        EasyMock.expect(usersession.getWorkspace()).andReturn(workspace);
        EasyMock.expect(usersession.getNode("/content/china/accl/ch/nutrilite")).andReturn(pageContentNode1).times(1);
        EasyMock.expect(usersession.getNode("/content/china/accl/ch/nutrilite/jcr:content")).andReturn(pageContentNode3)
                .times(1);
        EasyMock.expect(usersession.getNode("/content/china/accl/ch/nutrilite/jcr:content")).andReturn(pageContentNode4)
                .times(1);
        usersession.save();
        usersession.save();
        usersession.refresh(true);
        usersession.refresh(true);
        EasyMock.replay(usersession);

        repository = EasyMock.createMock(SlingRepository.class);
        EasyMock.expect(repository.loginAdministrative(null)).andReturn(usersession);
        EasyMock.replay(repository);
        autoAddTag.setSlingRepository(repository);

        String[] runModeArray = { "author" };
        runMode = EasyMock.createMock(RunMode.class);
        EasyMock.expect(runMode.getCurrentRunModes()).andReturn(runModeArray);
        EasyMock.replay(runMode);
        autoAddTag.setRunMode(runMode);
    }

    @Test
    public void testOnEvent1() throws RepositoryException {
        autoAddTag.setUsersession(usersession);
        autoAddTag.onEvent(it);
        EasyMock.verify(it);
    }

    @Test
    public void testOnEvent2() {
        autoAddTag.onEvent(it2);
        EasyMock.verify(it2);
    }

    @Test
    public void testDeactivate1() throws RepositoryException {
        autoAddTag.deactivate(component);
        EasyMock.verify(component);
    }

    @Test
    public void testDeactivate2() throws RepositoryException {
        autoAddTag.setUsersession(EasyMock.createMock(Session.class));
        autoAddTag.deactivate(component);
        EasyMock.verify(component);
    }

    @Test
    public void testActivate() throws RepositoryException {
        autoAddTag.activate(component);
        EasyMock.verify(component);
    }
}
