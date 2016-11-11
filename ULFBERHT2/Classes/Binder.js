//TODO
//Selected item changed
//if this is an array each object change event should cause the 
//change event
//if its not an array then it should cause change event
//Ajax should be objectified
//so can customize the header
//for instance
var Binder = (function () {
    function Binder() {
        this.PrimaryKeys = new Array();
        //just Array<IDataObject>? where dataobejct has change event that can be gotten?
        //is the DataObject a generic?
        //with conditions?
        //Generic here?
        this.DataObjects = new Array();
        this.AssociatedElementIDs = new Array();
        this.ElementBinders = new Array();
        this.AutomaticallyPostUpdatesToWebApi = true;
    }
    Binder.prototype.Dispose = function () {
        this.ElementBinders.forEach(function (e) { return e.Dispose(); });
        this.PrimaryKeys = null;
        this.WebApi = null;
        this.AssociatedElementIDs = null;
        this.ElementBinders = null;
    };
    //need to have callback or promise on the WebApi Get
    //this wont work because we are cant call it
    //have a function that is abstract?
    Binder.prototype.Execute = function (element) {
        if (!Is.NullOrEmpty(this.WebApi)) {
        }
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
    return Binder;
}());
//# sourceMappingURL=Binder.js.map