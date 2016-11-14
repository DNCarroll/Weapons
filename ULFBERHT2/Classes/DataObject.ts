//object state can be used to indicated changes are needing update
//for binding
class DataObject implements IObjectState {
    constructor(raw: any) {        
        for (var prop in raw) {
            this[prop] = raw[prop];            
        }        
        this.objectState = ObjectState.Clean;
    }
    private changeCount: number = 0;
    private changeQueued: boolean = false;
    private eventListeners = new Array<PropertyListener>();   
    private objectListener = new Array<(obj: IObjectState) => void>();
    private objectState: ObjectState = ObjectState.Clean;
    get ObjectState(): ObjectState {
        return this.objectState;
    }
    set ObjectState(value: ObjectState) {
        var causeChangedEvent = value != this.objectState;
        this.objectState = value;
        if (causeChangedEvent) {
            this.OnObjectStateChanged();
        }
    }
    AddPropertyListener(propertyName: string, attribute: string, handler: (attribute: string, value: any) => void) {
        this.eventListeners.Add(new PropertyListener(propertyName, attribute, handler));
    }
    RemovePropertyListeners() {
        this.eventListeners.Remove(o => true);
    }
    OnPropertyChanged(propertyName: string) {
        var listeners = this.eventListeners.Where(l => l.PropertyName === propertyName);
        listeners.forEach(l => l.Handler(l.Attribute, this[propertyName]));        
    }
    private onPropertyChanged(propertyName: string, canCauseDirty: boolean = true) {
        this.OnPropertyChanged(propertyName);        
        if (canCauseDirty && this.ObjectState != ObjectState.Cleaning) {
            this.ObjectState = ObjectState.Dirty;
        }
    }
    AddObjectStateListener(handler: (obj: IObjectState) => void) {
        this.objectListener.Add(handler);
    }
    RemoveObjectStateListener() {
        this.objectListener.Remove(o => true);
    }
    OnObjectStateChanged() {
        this.objectListener.forEach(o => o(this));
    }
    OnElementChanged(value: any, propertyName: string) {
        this[propertyName] = value;
        //can we know what the target is here?
        //just by the event?
        //what field are they wanting to update?
    }
}