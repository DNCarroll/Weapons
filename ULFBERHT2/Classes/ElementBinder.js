//binding type needs help
//on DataObject set cause a bind
//not actually doing the bind method call?
//instead of recreating the binding for every row
//have the index transfer binding info over to 
//its sibling
var ElementBinder = (function () {
    function ElementBinder(target, element, elementIndex) {
        this.Fields = new Array();
        //figure out the fields we dont know about the Fields yet
        this.Target = target;
        this.Element = element;
        this.ElementIndex = elementIndex;
        //determine fields from target
        //let the DataObject set take care of binding        
    }
    Object.defineProperty(ElementBinder.prototype, "DataObject", {
        get: function () {
            return this.dataObject;
        },
        set: function (value) {
            this.dataObject = value;
            //do binding
            //everything else should be set up already
        },
        enumerable: true,
        configurable: true
    });
    ElementBinder.prototype.Dispose = function () {
        this.DataObject = null;
        this.Target = null;
        this.BindingType = null;
        this.Element = null;
        this.Fields = null;
        this.ElementIndex = null;
    };
    return ElementBinder;
}());
//different ElementBinders based on type?
//each one having its own specific brand of binding?
//CHeckbox, radio, input, select,
//span, div etc
//catch all generic binder like above? 
//# sourceMappingURL=ElementBinder.js.map