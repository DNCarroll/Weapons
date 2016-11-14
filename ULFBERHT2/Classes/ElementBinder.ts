//binding type needs help
//on DataObject set cause a bind
//not actually doing the bind method call?

//instead of recreating the binding for every row
//have the index transfer binding info over to 
//its sibling

class ElementBinder {
    //should this be something that inherits from an interface?

    private dataObject: IObjectState;
    get DataObject() {
        return this.dataObject;
    }
    set DataObject(value: IObjectState) {
        this.dataObject = value;
        //do binding
        //everything else should be set up already
    }
    Target: string;
    BindingType: string;
    Element: HTMLElement;
    ElementIndex: number;
    Fields: Array<string> = new Array<string>();
    constructor(target: string, element: HTMLElement, elementIndex: number) {
        //figure out the fields we dont know about the Fields yet
        this.Target = target;
        this.Element = element;
        this.ElementIndex = elementIndex;
        //determine fields from target
        //let the DataObject set take care of binding        
    }
    Dispose() {
        this.DataObject = null;
        this.Target = null;
        this.BindingType = null;
        this.Element = null;
        this.Fields = null;
        this.ElementIndex = null;
    }
}


//different ElementBinders based on type?
//each one having its own specific brand of binding?
//CHeckbox, radio, input, select,
//span, div etc
//catch all generic binder like above?