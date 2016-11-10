//TODO
//Selected item changed
//if this is an array each object change event should cause the 
//change event
//if its not an array then it should cause change event


//Ajax should be objectified
//so can customize the header
//for instance

abstract class Binder {
    PrimaryKeys: Array<string> = new Array<string>();
    WebApi: string;
    //can be virtual
    WebApiGetParameters(): any {
        //should the user need to hijack this
        //return BindingManager.CurrentParameters();
    }
    //just Array<IDataObject>? where dataobejct has change event that can be gotten?
    //is the DataObject a generic?
    //with conditions?

    //Generic here?
    DataObjects: Array<IDataObject> = new Array<IDataObject>();
    AssociatedElementIDs: Array<string> = new Array<string>();
    ElementBinders: Array<ElementBinder> = new Array<ElementBinder>();
    AutomaticallyPostUpdatesToWebApi: boolean = true;
    abstract NewObject(rawObj: any): IDataObject;
    Dispose() {
        this.ElementBinders.forEach(e => e.Dispose());
        this.PrimaryKeys = null;
        this.WebApi = null;        
        this.AssociatedElementIDs = null;
        this.ElementBinders = null;
    }

    //need to have callback or promise on the WebApi Get

    //this wont work because we are cant call it
    //have a function that is abstract?
    Execute(element: HTMLElement) {
        if (!Is.NullOrEmpty(this.WebApi)) {
            //hook up the element to bindings
            //use DataObject
            //this has the WebApi
            //It should go off and get whatever parameters it needs
            //then do WebApi call
            //the WebApiCall might simply be passing the part of the url to the Get webapi action   
            //var parameters = this.WebApiGetParameters();
            //this.WebApi.Get(parameters, r => {
            //    if (r) {
            //        if (Is.Array(r)) {

            //        }
            //    }
            //});
            //now do web api

        }
    }
    //virtual method?
    private selectedObject: IDataObject;
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
}