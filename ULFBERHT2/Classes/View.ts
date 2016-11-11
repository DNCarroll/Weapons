//jobs of this code  
//1. get the view.html for this view via the ViewUrl
//2. bind the view once it has returned
//      the incoming view may have either auto binding
//      or the view itself will have insight into binding
abstract class View implements IView {
    abstract ViewUrl(): string;
    abstract ContainerID(): string;
    CachedElement:HTMLElement
    eventHandlers = new Array<Listener<IView>>();
    Preload(view: IView, viewInstance: ViewInstance) { }
    Show(viewInstance: ViewInstance) {                
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
            this.CachedElement = "div".CreateElement({ "innerHTML": html });
            //look for bindings
            //are there any?


            //here is your autobinding  
            //var elements = view.Container.Get(ele => {
            //    return !Is.NullOrEmpty(ele.getAttribute(Binding.Attributes.Auto));
            //});
            //for (var i = 0; i < elements.length; i++) {
            //    Binding.DataContainer.Auto(elements[i]);
            //}
            //if (view.Loaded) {
            //    view.Loaded(route);
            //}

            //this will be in an event eventually when the binding comes into play
            this.MoveStuffFromCacheToReal();
        }
        else {
            this.Dispatch(EventType.Completed);
        }
    }    
    MoveStuffFromCacheToReal() {
        var containter = this.ContainerID().Element();
        containter.Clear();
        while (this.CachedElement.childNodes.length > 0) {
            var node = this.CachedElement.childNodes[0];
            this.CachedElement.removeChild(node);
            containter.appendChild(node);
        }
        this.Dispatch(EventType.Completed);
    }
    AddListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<IView>) => void) {
        this.eventHandlers.Add(new Listener(eventType, eventHandler));
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