//jobs of this code  
//1. get the view.html for this view via the ViewUrl
//2. bind the view once it has returned
//      the incoming view may have either auto binding
//      or the view itself will have insight into binding
var View = (function () {
    function View() {
        this.eventHandlers = new Array();
    }
    View.prototype.Preload = function (view, viewInstance) { };
    View.prototype.Show = function (viewInstance) {
        var found = sessionStorage.getItem(this.ViewUrl());
        if (!found || window["IsDebug"]) {
            var ajax = new Ajax();
            ajax.AddListener(EventType.Completed, this.RequestCompleted.bind(this));
            ajax.Get(this.ViewUrl());
        }
        else {
            this.SetHTML(found);
        }
    };
    View.prototype.RequestCompleted = function (arg) {
        if (arg.Sender.ResponseText) {
            sessionStorage.setItem(this.ViewUrl(), arg.Sender.ResponseText);
            this.SetHTML(arg.Sender.ResponseText);
        }
        arg.Sender = null;
    };
    View.prototype.SetHTML = function (html) {
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
    };
    View.prototype.MoveStuffFromCacheToReal = function () {
        var containter = this.ContainerID().Element();
        containter.Clear();
        while (this.CachedElement.childNodes.length > 0) {
            var node = this.CachedElement.childNodes[0];
            this.CachedElement.removeChild(node);
            containter.appendChild(node);
        }
        this.Dispatch(EventType.Completed);
    };
    View.prototype.AddListener = function (eventType, eventHandler) {
        this.eventHandlers.Add(new Listener(eventType, eventHandler));
    };
    View.prototype.RemoveListener = function (eventType, eventHandler) {
        this.eventHandlers.Remove(function (l) { return l.EventType === eventType && eventHandler === eventHandler; });
    };
    View.prototype.RemoveListeners = function (eventType) {
        this.eventHandlers.Remove(function (l) { return l.EventType === eventType; });
    };
    View.prototype.Dispatch = function (eventType) {
        var _this = this;
        var listeners = this.eventHandlers.Where(function (e) { return e.EventType === eventType; });
        listeners.forEach(function (l) { return l.EventHandler(new CustomEventArg(_this, eventType)); });
    };
    return View;
}());
//# sourceMappingURL=View.js.map