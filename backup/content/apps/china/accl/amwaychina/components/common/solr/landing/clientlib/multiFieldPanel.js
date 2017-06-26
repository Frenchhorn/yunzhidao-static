var MyClientLib = MyClientLib || {};

MyClientLib.MultiFieldPanel = CQ.Ext.extend(CQ.Ext.Panel, {
    panelValue: '',

    constructor: function(config) {
        config = config || {};
        MyClientLib.MultiFieldPanel.superclass.constructor.call(this, config);
    },

    initComponent: function() {
        MyClientLib.MultiFieldPanel.superclass.initComponent.call(this);

        this.panelValue = new CQ.Ext.form.Hidden({
            name: this.name
        });

        this.add(this.panelValue);

        var dialog = this.findParentByType('dialog');

        dialog.on('beforesubmit', function() {
            var value = this.getValue();

            if (value) {
                this.panelValue.setValue(value);
            }
        }, this);
    },

    afterRender: function() {
        MyClientLib.MultiFieldPanel.superclass.afterRender.call(this);

        this.items.each(function() {
            if (!this.contentBasedOptionsURL || this.contentBasedOptionsURL.indexOf(CQ.form.Selection.PATH_PLACEHOLDER) < 0) {
                return;
            }

            this.processPath(this.findParentByType('dialog').path);
        });
    },

    getValue: function() {
        var pData = {};

        this.items.each(function(i) {
            if (i.xtype === "label" || i.xtype === "hidden" || !i.hasOwnProperty("dName")) {
                return;
            }

            pData[i.dName] = i.getValue();
        });

        return $.isEmptyObject(pData) ? "" : JSON.stringify(pData);
    },

    setValue: function(value) {
        this.panelValue.setValue(value);

        var pData = JSON.parse(value);

        this.items.each(function(i) {
            if (i.xtype === "label" || i.xtype === "hidden" || !i.hasOwnProperty("dName")) {
                return;
            }

            if (!pData[i.dName]) {
                if (pData[i.dName] === '') {
                    i.setValue('');
                }
                return;
            }

            if ((null != pData[i.dName]) && (pData[i.dName] != "")) {
                i.setValue(pData[i.dName]);
            } else {
                i.setValue("");
            }
        });
    },

    validate: function() {
        return true;
    },

    getName: function() {
        return this.name;
    }
});

CQ.Ext.reg("multiFieldPanel", MyClientLib.MultiFieldPanel);
