package com.aem.amway.contenthub.services.listener;

import java.util.ArrayList;
import java.util.Arrays;

import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.Value;
import javax.jcr.observation.Event;
import javax.jcr.observation.EventIterator;
import javax.jcr.observation.EventListener;

import org.apache.felix.scr.annotations.Activate;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Deactivate;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.jcr.api.SlingRepository;
import org.apache.sling.runmode.RunMode;
import org.osgi.service.component.ComponentContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.aem.amway.contenthub.services.service.ConfigService;

/**
 * Just a simple DS Component
 */
@Component(immediate = true)
@Service
public class AutoAddTag implements EventListener {

    private static final Logger LOG = LoggerFactory.getLogger(AutoAddTag.class);

    private static final String CQ_TAGS = "cq:tags";

    private Session usersession = null;

    @Reference
    private RunMode runMode;

    @Reference
    transient ConfigService configService;

    @Reference
    private SlingRepository repository;

    public SlingRepository getSlingRepository() {
        return repository;
    }

    public void setSlingRepository(SlingRepository repository) {
        this.repository = repository;
    }

    public void setUsersession(Session usersession) {
        this.usersession = usersession;
    }

    public void setRunMode(RunMode runMode) {
        this.runMode = runMode;
    }

    @Activate
    protected void activate(ComponentContext ctx) {
        if (Arrays.asList(runMode.getCurrentRunModes()).contains("author")) {
            try {
                final String[] types = { "cq:Page" };
                final String path = configService.getContenthubPath();
                usersession = repository.loginAdministrative(null);
                usersession.getWorkspace().getObservationManager().addEventListener(this,
                        Event.NODE_ADDED | Event.NODE_MOVED, path, true, null, types, false);
                LOG.info("Observing property changes to {} nodes under {}", Arrays.asList(types), path);
            } catch (Exception e) {
                LOG.error("unable to register session", e);
            }
        }
    }

    @Deactivate
    protected void deactivate(ComponentContext componentContext) throws RepositoryException {
        if (null != usersession) {
            usersession.logout();
            usersession = null;
        }
    }

    @Override
    public void onEvent(EventIterator it) {
        try {
            while (null != usersession && it.hasNext()) {
                Event event = it.nextEvent();
                Node pageContentNode = usersession.getNode(event.getPath());
                if (event.getType() == Event.NODE_MOVED) {
                    pageContentNode = pageContentNode.getNode("jcr:content");
                }
                if (null != pageContentNode && pageContentNode.getPrimaryNodeType().isNodeType("cq:PageContent")) {
                    setPageTags(pageContentNode);
                }
            }
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
        }
    }

    protected void setPageTags(Node pageContentNode) throws Exception {
        Node parentPageContentNode = pageContentNode.getParent().getParent().getNode("jcr:content");
        if (null != parentPageContentNode && parentPageContentNode.hasProperty("autotags")) {
            Value[] autoTags = parentPageContentNode.getProperty("autotags").getValues();

            if (pageContentNode.hasProperty(CQ_TAGS)) {
                Value[] pageTags = pageContentNode.getProperty(CQ_TAGS).getValues();

                ArrayList<Value> autoTagsList = new ArrayList<>(Arrays.asList(autoTags));
                ArrayList<Value> pageTagsList = new ArrayList<>(Arrays.asList(pageTags));
                pageTagsList.addAll(0, autoTagsList);
                pageTags = pageTagsList.toArray(new Value[pageTagsList.size()]);

                pageContentNode.setProperty(CQ_TAGS, pageTags);
            } else {
                pageContentNode.setProperty(CQ_TAGS, autoTags);
            }
            usersession.refresh(true);
            usersession.save();
        }
    }
}
