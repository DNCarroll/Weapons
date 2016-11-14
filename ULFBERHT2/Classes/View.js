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
        var _this = this;
        var containter = this.ContainerID().Element();
        if (!Is.NullOrEmpty(containter)) {
            this.cachedElement = "div".CreateElement({ "innerHTML": html });
            var elements = this.cachedElement.Get(function (ele) { return !Is.NullOrEmpty(ele.getAttribute("data-binder")); });
            if (elements.length > 0) {
                elements.forEach(function (e) {
                    try {
                        var attribute = e.getAttribute("data-binder");
                        if (attribute) {
                            var fun = new Function("return new " + attribute + "()");
                            e.Binder = fun();
                            e.Binder.AddListener(EventType.Completed, _this.OnBinderComplete.bind(_this));
                            _this.countBinders = _this.countBinders + 1;
                        }
                    }
                    catch (e) {
                    }
                });
                elements.forEach(function (e) {
                    if (e.Binder) {
                        try {
                            e.Binder.Execute(e);
                        }
                        catch (e) {
                        }
                    }
                });
            }
        }
        else {
            this.Dispatch(EventType.Completed);
        }
    };
    View.prototype.OnBinderComplete = function (arg) {
        if (arg.EventType === EventType.Completed) {
            this.countBindersReported = this.countBindersReported++;
            if (this.countBinders === this.countBindersReported) {
                this.MoveStuffFromCacheToReal();
            }
        }
    };
    View.prototype.MoveStuffFromCacheToReal = function () {
        var containter = this.ContainerID().Element();
        var boundElements = containter.Get(function (e) { return e.Binder != null; });
        boundElements.forEach(function (e) { return e.Binder.Dispose(); });
        containter.Clear();
        while (this.cachedElement.childNodes.length > 0) {
            var node = this.cachedElement.childNodes[0];
            this.cachedElement.removeChild(node);
            containter.appendChild(node);
        }
        this.Dispatch(EventType.Completed);
    };
    View.prototype.AddListener = function (eventType, eventHandler) {
        var found = this.eventHandlers.First(function (h) { return h.EventType === eventType && h.EventHandler === eventHandler; });
        if (!found) {
            this.eventHandlers.Add(new Listener(eventType, eventHandler));
        }
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