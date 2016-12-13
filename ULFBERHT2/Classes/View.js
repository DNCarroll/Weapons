//preload with complete event?
//figure out how to chain the data loads?
//otherwise going to have them happening at odds
var ViewPreload = (function () {
    function ViewPreload(executor, executeMethod, oncomplete) {
        this._executor = executor;
        this._executeMethod = executeMethod;
        this._oncomplete = oncomplete;
        executor.AddListener(EventType.Completed, this.OnComplete.bind(this));
    }
    ViewPreload.prototype.Dispose = function () {
        this._executeMethod = null;
        this._oncomplete = null;
        this._callback = null;
        this._executor.RemoveListeners(EventType.Completed);
        this._executor = null;
    };
    ViewPreload.prototype.OnComplete = function (arg) {
        this._callback();
        this._oncomplete(arg);
    };
    ViewPreload.prototype.Then = function (callback) {
        this._callback = callback;
        this._executeMethod();
    };
    return ViewPreload;
}());
var View = (function () {
    function View() {
        this.eventHandlers = new Array();
        this.preload = null;
    }
    Object.defineProperty(View.prototype, "Preload", {
        get: function () {
            return this.preload;
        },
        set: function (value) {
            this.preload = value;
        },
        enumerable: true,
        configurable: true
    });
    View.prototype.Show = function (viewInstance) {
        if (this.Preload) {
            this.Preload.Then(this.postPreloaded.bind(this));
        }
        else {
            this.postPreloaded();
        }
    };
    View.prototype.postPreloaded = function () {
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
            this.countBindersReported = 0;
            this.countBinders = 0;
            if (elements.length > 0) {
                elements.forEach(function (e) {
                    try {
                        var attribute = e.getAttribute("data-binder");
                        if (attribute) {
                            var fun = new Function("return new " + attribute + "()");
                            e.Binder = fun();
                            e.Binder.AddListener(EventType.Completed, _this.OnBinderComplete.bind(_this));
                            e.Binder.Element = e;
                            _this.countBinders = _this.countBinders + 1;
                        }
                    }
                    catch (e) {
                    }
                });
                elements.forEach(function (e) {
                    if (e.Binder) {
                        try {
                            e.Binder.Execute();
                        }
                        catch (ex) {
                            var exmessage = ex;
                        }
                    }
                });
            }
            else {
                this.MoveStuffFromCacheToReal();
            }
        }
        else {
            this.Dispatch(EventType.Completed);
        }
    };
    View.prototype.OnBinderComplete = function (arg) {
        if (arg.EventType === EventType.Completed) {
            this.countBindersReported = this.countBindersReported + 1;
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