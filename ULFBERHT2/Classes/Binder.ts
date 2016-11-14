//TODO
//Selected item changed
//if this is an array each object change event should cause the 
//change event
//if its not an array then it should cause change event


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
        return ret.length == 1 ? ret[0] : ret;
    }
    Element: HTMLElement;
    private eventHandlers = new Array<Listener<IBinder>>();
    DataObject: IObjectState;
    AssociatedElementIDs: Array<string> = new Array<string>();    
    AutomaticallyUpdatesToWebApi: boolean = false;
    abstract NewObject(rawObj: any): IObjectState;
    constructor(element: HTMLElement) {
        this.Element = element;
    }
    Dispose() {        
        this.PrimaryKeys = null;
        this.WebApi = null;
        this.AssociatedElementIDs = null;
        
        this.DataObject.RemoveObjectStateListener();
        this.DataObject.RemovePropertyListeners();
        
        this.RemoveListeners();        
    }
    //this wont work because we are cant call it
    //have a function that is abstract?
    Execute(element: HTMLElement) {
        this.Element = element;        
        if (!Is.NullOrEmpty(this.WebApi)) {
            var parameters = this.WebApiGetParameters();
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.OnAjaxComplete.bind(this));
            ajax.Submit(this.WebApi, parameters);
        }
    }
    OnAjaxComplete(arg: CustomEventArg<Ajax>) {  
        if (arg.EventType === EventType.Completed) {
            var data = arg.Sender.GetRequestData();
            if (data) {
                this.DataObject = this.NewObject(data);
                this.DataObject.AddObjectStateListener(this.onObjectStateChanged.bind(this));
                this.bindElementAndDataObject(this.Element, this.DataObject);
            }
        }
    }
    private onObjectStateChanged(obj: IObjectState) {
        if (this.AutomaticallyUpdatesToWebApi) {
            //do the auto post
        }
    }
    private bindElementAndDataObject(elementWithBindings:HTMLElement, dataObject:IObjectState) {
        var boundElements = elementWithBindings.Get(e => e.HasDataSet());
        boundElements.forEach(e => {

            //select and radio buttons will be a bit different

            var boundAttributes = e.GetDataSetAttributes();
            boundAttributes.forEach(b => {                
                dataObject.AddPropertyListener(b.value, b.name, e.OnDataPropertyChanged.bind(e));
                //other way around
                //select, 
                //radio,
                //check,
                //input

                //do we need to detect the HTMLElement type?

                //does this one work for select element?

                if (b.name === "value") {
                    var inputHTML = <HTMLInputElement>e;                    
                    inputHTML.addEventListener("change", (e) => {
                        dataObject.OnElementChanged(inputHTML.value, b.value);
                    });
                }
                //checked?
            });
        });
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