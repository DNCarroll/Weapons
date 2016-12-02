//TODO
//Selected item changed - this can just be handled by binding and some property
//binder is meant to be for form only

//disable the active context or readonly it while the new stuff is coming in?

abstract class Binder implements IBinder {
    PrimaryKeys: Array<string> = new Array<string>();
    WebApi: string;
    //can be virtual
    //should we return the url by default?
    //it would be one less thing we would normally have to supply
    WebApiGetParameters(): any {
        var ret = HistoryManager.CurrentRoute().Parameters;
        //just the url
        //but it may need a cleanse here
        return ret && ret.length == 1 ? ret[0] : ret;
    }
    Element: HTMLElement;
    private eventHandlers = new Array<Listener<IBinder>>();
    DataObject: IObjectState;
    AssociatedElementIDs: Array<string> = new Array<string>();    
    AutomaticallyUpdatesToWebApi: boolean = false;
    AutomaticallySelectsFromWebApi: boolean = false;
    abstract NewObject(rawObj: any): IObjectState;    
    Dispose() {        
        this.PrimaryKeys = null;
        this.WebApi = null;
        this.AssociatedElementIDs = null;
        
        this.DataObject.RemoveObjectStateListener();
        this.DataObject.RemovePropertyListeners();
        
        this.RemoveListeners();        
    }
    Execute() {
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
    }
    
    OnAjaxComplete(arg: CustomEventArg<Ajax>) {  
        if (arg.EventType === EventType.Completed) {
            var data = arg.Sender.GetRequestData();
            if (data) {
                var newDataObject = this.NewObject(data);
                this.BindToDataObject(newDataObject);
            }
        }
    }
    private onObjectStateChanged(obj: IObjectState) {
        if (this.AutomaticallyUpdatesToWebApi && this.WebApi) {
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.OnUpdateComplete.bind(this));
            ajax.Put(this.WebApi, obj.ServerObject);
            obj.ObjectState = ObjectState.Clean;
        }
    }
    OnUpdateComplete(arg: CustomEventArg<Ajax>) {
        //reverse stuff here?

    }
    BindToDataObject(dataObject: IObjectState) {        
        this.DataObject = dataObject;
        this.DataObject.AddObjectStateListener(this.onObjectStateChanged.bind(this));
        var boundElements = this.Element.Get(e => e.HasDataSet());
        boundElements.Add(this.Element);
        boundElements.forEach(e => {
            let element = e;
            this.setListeners(element, dataObject);
        });        
        this.DataObject.AllPropertiesChanged();
        this.Dispatch(EventType.Completed);
    }
    private setListeners(element: HTMLElement, dataObject: IObjectState) {
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
        //previously we used the PreLoad method to set stuff up and had array set up,  we didnt try to handle anything we just put that off
        //on the user also consider that "selects" might come from a list so each one of them will be pointed at same datasource
        //which means anything in a preload should be totally done before calling the load

        //each element has binding attached to it?
        //HTMLElement prototype has it as base 
        //then each element can figure its own?
        //does that even need to happen?
        if (element.tagName === "SELECT") {
            //displaymember valuemember datasource
            var datasource = boundAttributes.First(f => f.Attribute == "datasource");
            var displayMember = boundAttributes.First(f => f.Attribute == "displaymember");
            var valueMember = boundAttributes.First(f => f.Attribute == "valuemember");
            if (datasource) {
                var fun = new Function("return " + datasource.Property);
                var data = fun();
                (<HTMLSelectElement>element).AddOptions(data, valueMember ? valueMember.Property : null, displayMember ? displayMember.Property : null);
            }
        }
        var nonbindingAttributes = ["binder", "datasource", "displaymember", "valuemember"];
        boundAttributes.forEach(b => {
            if (nonbindingAttributes.First(v => v === b.Attribute) == null) {
                var attribute = this.getAttribute(b.Attribute);
                this.setObjectPropertyListener(b.Property, attribute, element, dataObject);
                var elementAttribute = b.Attribute === "checked" && element["type"] === "checkbox" ? "checked" : b.Attribute === "value" ? "value" : null;
                if (elementAttribute) {
                    var fun = (evt) => {
                        dataObject.OnElementChanged.bind(dataObject)(element[elementAttribute], b.Property)
                    };
                    element.addEventListener("change", fun);
                }
            }
        });
    }
    //this isnt good, but for now it demonstrates that it works
    //the problem is html will automatically lower case those data-... attributes
    //other attributes will be an issue
    getAttribute(attribute: string) {
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
    }
    private setObjectPropertyListener(property: string, attribute: string, element: HTMLElement, dataObject: IObjectState) {
        var objectPropertyChangedForElement = (attribute: string, value: any) => {
            if (Is.Property(attribute, element)) {
                if (element.tagName == "INPUT" && element["type"] === "radio") {
                    var radios = element.parentElement.Get(e2 => e2["name"] === element["name"] && e2["type"] === "radio");
                    radios.forEach(r => r["checked"] = false);
                    var first = radios.First(r => r["value"] === value.toString());
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
                var style = this.getStyle(attribute);
                if (style) {
                    element["style"][style] = value;
                }
                else {
                    element[attribute] = value;
                }
            }
        };
        dataObject.AddPropertyListener(property, attribute, objectPropertyChangedForElement);
    }

    getStyle(value: string):string {
        for (var prop in document.body.style) {
            if (prop.toLowerCase() === value.toLowerCase()) {
                return prop;
            }
        }
        return null;
    }

    //virtual method?
    private selectedObject: IObjectState;
    get SelectedObject() {
        return this.selectedObject;
    }
    set SelectedObject(value) {
        //remove any Binders that were associated with previous element from the bindingManager and associated elements
        this.selectedObject = value;
        //AssociatedElements should be bound to this object
        //add the binders to the bindingmanager

        //look for any elementbindings associated with selected item changes and rebind them 'cause' row color change
        //if a list changes length need to cause ^ too
    }    

    AddListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<IBinder>) => void) {
        var found = this.eventHandlers.First(h => h.EventType === eventType && h.EventHandler === eventHandler);
        if (!found) {
            this.eventHandlers.Add(new Listener(eventType, eventHandler));
        }
    }
    RemoveListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<IBinder>) => void) {
        this.eventHandlers.Remove(l => l.EventType === eventType && eventHandler === eventHandler);
    }
    RemoveListeners(eventType: EventType = EventType.Any) {        
        this.eventHandlers.Remove(l => eventType === EventType.Any || l.EventType === eventType);
    }
    Dispatch(eventType: EventType) {
        var listeners = this.eventHandlers.Where(e => e.EventType === eventType);
        listeners.forEach(l => l.EventHandler(new CustomEventArg<IBinder>(this, eventType)));
    }

}