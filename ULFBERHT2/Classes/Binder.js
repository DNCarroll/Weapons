//TODO
//Selected item changed
//if this is an array each object change event should cause the 
//change event
//if its not an array then it should cause change event
var Binder = (function () {
    function Binder(element) {
        this.PrimaryKeys = new Array();
        this.eventHandlers = new Array();
        this.AssociatedElementIDs = new Array();
        this.AutomaticallyUpdatesToWebApi = false;
        this.Element = element;
    }
    //can be virtual
    //should we return the url by default?
    //it would be one less thing we would normally have to supply
    Binder.prototype.WebApiGetParameters = function () {
        var ret = HistoryManager.CurrentRoute().Parameters;
        //just the url
        //but it may need a cleanse here
        return ret.length == 1 ? ret[0] : ret;
    };
    Binder.prototype.Dispose = function () {
        this.PrimaryKeys = null;
        this.WebApi = null;
        this.AssociatedElementIDs = null;
        this.DataObject.RemoveObjectStateListener();
        this.DataObject.RemovePropertyListeners();
        this.RemoveListeners();
    };
    //this wont work because we are cant call it
    //have a function that is abstract?
    Binder.prototype.Execute = function (element) {
        this.Element = element;
        if (!Is.NullOrEmpty(this.WebApi)) {
            var parameters = this.WebApiGetParameters();
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.OnAjaxComplete.bind(this));
            ajax.Submit(this.WebApi, parameters);
        }
    };
    Binder.prototype.OnAjaxComplete = function (arg) {
        if (arg.EventType === EventType.Completed) {
            var data = arg.Sender.GetRequestData();
            if (data) {
                this.DataObject = this.NewObject(data);
                this.DataObject.AddObjectStateListener(this.onObjectStateChanged.bind(this));
                this.bindElementAndDataObject(this.Element, this.DataObject);
            }
        }
    };
    Binder.prototype.onObjectStateChanged = function (obj) {
        if (this.AutomaticallyUpdatesToWebApi) {
        }
    };
    Binder.prototype.bindElementAndDataObject = function (elementWithBindings, dataObject) {
        var boundElements = elementWithBindings.Get(function (e) { return e.HasDataSet(); });
        boundElements.forEach(function (e) {
            //select and radio buttons will be a bit different
            var boundAttributes = e.GetDataSetAttributes();
            boundAttributes.forEach(function (b) {
                dataObject.AddPropertyListener(b.value, b.name, e.OnDataPropertyChanged.bind(e));
                //other way around
                //select, 
                //radio,
                //check,
                //input
                //do we need to detect the HTMLElement type?
                //does this one work for select element?
                if (b.name === "value") {
                    var inputHTML = e;
                    inputHTML.addEventListener("change", function (e) {
                        dataObject.OnElementChanged(inputHTML.value, b.value);
                    });
                }
                //checked?
            });
        });
    };
    Object.defineProperty(Binder.prototype, "SelectedObject", {
        get: function () {
            return this.selectedObject;
        },
        set: function (value) {
            //remove any Binders that were associated with previous element from the bindingManager and associated elements
            this.selectedObject = value;
            //AssociatedElements should be bound to this object
            //add the binders to the bindingmanager
            //look for any elementbindings associated with selected item changes and rebind them 'cause' row color change
            //if a list changes length need to cause ^ too
        },
        enumerable: true,
        configurable: true
    });
    Binder.prototype.AddListener = function (eventType, eventHandler) {
        var found = this.eventHandlers.First(function (h) { return h.EventType === eventType && h.EventHandler === eventHandler; });
        if (!found) {
            this.eventHandlers.Add(new Listener(eventType, eventHandler));
        }
    };
    Binder.prototype.RemoveListener = function (eventType, eventHandler) {
        this.eventHandlers.Remove(function (l) { return l.EventType === eventType && eventHandler === eventHandler; });
    };
    Binder.prototype.RemoveListeners = function (eventType) {
        if (eventType === void 0) { eventType = EventType.Any; }
        this.eventHandlers.Remove(function (l) { return eventType === EventType.Any || l.EventType === eventType; });
    };
    Binder.prototype.Dispatch = function (eventType) {
        var _this = this;
        var listeners = this.eventHandlers.Where(function (e) { return e.EventType === eventType; });
        listeners.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this, eventType)); });
    };
    return Binder;
}());
//# sourceMappingURL=Binder.js.map