//preload with complete event?


//figure out how to chain the data loads?
//otherwise going to have them happening at odds
class ViewPreload {
    _executeMethod: () => void;
    _oncomplete: (arg: CustomEventArg<any>) => void;
    _callback: () => any;
    _executor: IEventDispatcher<any>;
    constructor(executor: IEventDispatcher<any>,         
        executeMethod: () => void, oncomplete: (arg: CustomEventArg<any>) => void) {
        this._executor = executor;
        this._executeMethod = executeMethod;
        this._oncomplete = oncomplete;
        executor.AddListener(EventType.Completed, this.OnComplete.bind(this)); 
    }
    Dispose() {
        this._executeMethod = null;
        this._oncomplete = null;
        this._callback = null;
        this._executor.RemoveListeners(EventType.Completed);
        this._executor = null;
    }
    OnComplete(arg: CustomEventArg<any>) {             
        this._callback();
        this._oncomplete(arg);   
    }
    Then(callback: () => void) {
        this._callback = callback;
        this._executeMethod();
    }
}

abstract class View implements IView {
    abstract ViewUrl(): string;
    abstract ContainerID(): string;
    private countBinders: number;
    private countBindersReported: number;
    private cachedElement: HTMLElement    
    private eventHandlers = new Array<Listener<IView>>();
    ViewInstance: ViewInstance;   
    private preload: ViewPreload = null;
    get Preload() {
        return this.preload;
    }
    set Preload(value: ViewPreload) {
        this.preload = value;
    }

    Show(viewInstance: ViewInstance) {                        
        if (this.Preload) {
            this.Preload.Then(this.postPreloaded.bind(this));
        }
        else {
            this.postPreloaded();
        }
    }
    private postPreloaded() {
        var found = sessionStorage.getItem(this.ViewUrl());
        if (!found || window["IsDebug"]) {
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.RequestCompleted.bind(this));
            ajax.Get(this.ViewUrl());
        }
        else {
            this.SetHTML(found);
        }
    }
    RequestCompleted(arg: CustomEventArg<Ajax>) {        
        if (arg.Sender.ResponseText) {
            sessionStorage.setItem(this.ViewUrl(), arg.Sender.ResponseText);
            this.SetHTML(arg.Sender.ResponseText);
        }        
        arg.Sender = null;
    }    
    SetHTML(html: string) {
        var containter = this.ContainerID().Element();        
        if (!Is.NullOrEmpty(containter)) {
            this.cachedElement = "div".CreateElement({ "innerHTML": html });
            var elements = this.cachedElement.Get(ele => !Is.NullOrEmpty(ele.getAttribute("data-binder")));
            this.countBindersReported = 0;
            this.countBinders = 0;
            if (elements.length > 0) {
                elements.forEach(e => {
                    try {
                        var attribute = e.getAttribute("data-binder");
                        if (attribute) {
                            var fun = new Function("return new " + attribute + "()");
                            e.Binder = <IBinder>fun();
                            e.Binder.AddListener(EventType.Completed, this.OnBinderComplete.bind(this));
                            e.Binder.Element = e;
                            this.countBinders = this.countBinders + 1;
                        }
                    }
                    catch (e) {
                    }
                });
                elements.forEach(e => {
                    if (e.Binder) {
                        try {
                            e.Binder.Execute();
                        }
                        catch (ex) {
                            var exmessage = ex;
                        }
                    }
                });
            } else {
                this.MoveStuffFromCacheToReal();
            }
        }
        else {
            this.Dispatch(EventType.Completed);
        }
    }    
    OnBinderComplete(arg: ICustomEventArg<IBinder>) {
        if (arg.EventType === EventType.Completed) {
            this.countBindersReported = this.countBindersReported + 1;
            if (this.countBinders === this.countBindersReported) {
                this.MoveStuffFromCacheToReal();
            }
        }
    }
    MoveStuffFromCacheToReal() {
        var containter = this.ContainerID().Element();
        var boundElements = containter.Get(e => e.Binder != null);
        boundElements.forEach(e => e.Binder.Dispose());
        containter.Clear();
        while (this.cachedElement.childNodes.length > 0) {
            var node = this.cachedElement.childNodes[0];
            this.cachedElement.removeChild(node);
            containter.appendChild(node);
        }
        this.Dispatch(EventType.Completed);
    }
    AddListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<IView>) => void) {
        var found = this.eventHandlers.First(h => h.EventType === eventType && h.EventHandler === eventHandler);
        if (!found) {
            this.eventHandlers.Add(new Listener(eventType, eventHandler));
        }
    }
    RemoveListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<IView>) => void) {
        this.eventHandlers.Remove(l => l.EventType === eventType && eventHandler === eventHandler);
    }
    RemoveListeners(eventType: EventType) {
        this.eventHandlers.Remove(l => l.EventType === eventType);
    }
    Dispatch(eventType: EventType) {
        var listeners = this.eventHandlers.Where(e => e.EventType === eventType);
        listeners.forEach(l => l.EventHandler(new CustomEventArg<IView>(this, eventType)));
    }
}