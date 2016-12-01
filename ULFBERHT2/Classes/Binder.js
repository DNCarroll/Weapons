//TODO
//Selected item changed - this can just be handled by binding and some property
//binder is meant to be for form only
//disable the active context or readonly it while the new stuff is coming in?
var Binder = (function () {
    function Binder() {
        this.PrimaryKeys = new Array();
        this.eventHandlers = new Array();
        this.AssociatedElementIDs = new Array();
        this.AutomaticallyUpdatesToWebApi = false;
        this.AutomaticallySelectsFromWebApi = false;
    }
    //can be virtual
    //should we return the url by default?
    //it would be one less thing we would normally have to supply
    Binder.prototype.WebApiGetParameters = function () {
        var ret = HistoryManager.CurrentRoute().Parameters;
        //just the url
        //but it may need a cleanse here
        return ret && ret.length == 1 ? ret[0] : ret;
    };
    Binder.prototype.Dispose = function () {
        this.PrimaryKeys = null;
        this.WebApi = null;
        this.AssociatedElementIDs = null;
        this.DataObject.RemoveObjectStateListener();
        this.DataObject.RemovePropertyListeners();
        this.RemoveListeners();
    };
    Binder.prototype.Execute = function () {
        if (this.AutomaticallySelectsFromWebApi && !Is.NullOrEmpty(this.WebApi)) {
            var parameters = this.WebApiGetParameters();
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.OnAjaxComplete.bind(this));
            var url = this.WebApi;
            url += (url.lastIndexOf("/") + 1 == url.length ? "" : "/") + (Is.Array(parameters) ? parameters.join("/") : parameters);
            ajax.Get(url);
        }
        else {
            this.Dispatch(EventType.Completed);
        }
    };
    Binder.prototype.OnAjaxComplete = function (arg) {
        if (arg.EventType === EventType.Completed) {
            var data = arg.Sender.GetRequestData();
            if (data) {
                var newDataObject = this.NewObject(data);
                this.BindToDataObject(newDataObject);
            }
        }
    };
    Binder.prototype.onObjectStateChanged = function (obj) {
        if (this.AutomaticallyUpdatesToWebApi && this.WebApi) {
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.OnUpdateComplete.bind(this));
            ajax.Put(this.WebApi, obj.ServerObject);
            obj.ObjectState = ObjectState.Clean;
        }
    };
    Binder.prototype.OnUpdateComplete = function (arg) {
        //reverse stuff here?
    };
    Binder.prototype.BindToDataObject = function (dataObject) {
        var _this = this;
        this.DataObject = dataObject;
        this.DataObject.AddObjectStateListener(this.onObjectStateChanged.bind(this));
        var boundElements = this.Element.Get(function (e) { return e.HasDataSet(); });
        boundElements.Add(this.Element);
        boundElements.forEach(function (e) {
            var element = e;
            _this.setListeners(element, dataObject);
        });
        this.DataObject.AllPropertiesChanged();
        this.Dispatch(EventType.Completed);
    };
    Binder.prototype.setListeners = function (element, dataObject) {
        var _this = this;
        var boundAttributes = element.GetDataSetAttributes();
        //the select element operates on it own?
        //it has to get its innards set up first?
        //what did we do before on binding with select?
        //do we make the page have select data already set up?
        //or do we have this point figure it out?
        //be better if we had this point figure it out
        //how might we get the data
        //a javascript method, an array
        //detect if its a method?
        //then call the method, the method should not return (if server call until the call is complete is this possible?)
        //previously we used the PreLoad method to set stuff up
        boundAttributes.forEach(function (b) {
            if (b.Attribute != "binder") {
                var attribute = _this.getAttribute(b.Attribute);
                _this.setObjectPropertyListener(b.Property, attribute, element, dataObject);
                var elementAttribute = b.Attribute === "checked" && element["type"] === "checkbox" ? "checked" : b.Attribute === "value" ? "value" : null;
                if (elementAttribute) {
                    var fun = function (evt) {
                        dataObject.OnElementChanged.bind(dataObject)(element[elementAttribute], b.Property);
                    };
                    element.addEventListener("change", fun);
                }
            }
        });
    };
    //this isnt good, but for now it demonstrates that it works
    //the problem is html will automatically lower case those data-... attributes
    //other attributes will be an issue
    Binder.prototype.getAttribute = function (attribute) {
        attribute = attribute.toLowerCase();
        switch (attribute) {
            case "class":
            case "classname":
                return "className";
            case "innerhtml":
                return "innerHTML";
            case "readonly":
                return "readOnly";
            default:
                return attribute;
        }
    };
    Binder.prototype.setObjectPropertyListener = function (property, attribute, element, dataObject) {
        var _this = this;
        var objectPropertyChangedForElement = function (attribute, value) {
            if (Is.Property(attribute, element)) {
                if (element.tagName == "INPUT" && element["type"] === "radio") {
                    var radios = element.parentElement.Get(function (e2) { return e2["name"] === element["name"] && e2["type"] === "radio"; });
                    radios.forEach(function (r) { return r["checked"] = false; });
                    var first = radios.First(function (r) { return r["value"] === value.toString(); });
                    first["checked"] = true;
                }
                else if (attribute === "className") {
                    element.className = null;
                    element.className = value;
                }
                else {
                    element[attribute] = value;
                }
            }
            else {
                var style = _this.getStyle(attribute);
                if (style) {
                    element["style"][style] = value;
                }
                else {
                    element[attribute] = value;
                }
            }
        };
        dataObject.AddPropertyListener(property, attribute, objectPropertyChangedForElement);
    };
    Binder.prototype.getStyle = function (value) {
        for (var prop in document.body.style) {
            if (prop.toLowerCase() === value.toLowerCase()) {
                return prop;
            }
        }
        return null;
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