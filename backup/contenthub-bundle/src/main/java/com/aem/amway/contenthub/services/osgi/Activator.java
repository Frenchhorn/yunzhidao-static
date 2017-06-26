package com.aem.amway.contenthub.services.osgi;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Activator
 */
public class Activator implements BundleActivator {

    /**
     * default logger.
     */
    private static final Logger LOG = LoggerFactory.getLogger(Activator.class);

    /*
     * (non-Javadoc)
     *
     * @see
     * org.osgi.framework.BundleActivator#start(org.osgi.framework.BundleContext
     * )
     */
    @Override
    public void start(final BundleContext context) throws Exception {
        LOG.debug(context.getBundle().getSymbolicName() + " started");
    }

    /*
     * (non-Javadoc)
     *
     * @see
     * org.osgi.framework.BundleActivator#stop(org.osgi.framework.BundleContext)
     */
    @Override
    public void stop(final BundleContext context) throws Exception {
        LOG.debug(context.getBundle().getSymbolicName() + " stopped");
    }
}
