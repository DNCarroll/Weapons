//object state can be used to indicated changes are needing update
//for binding
var DataObject = (function () {
    function DataObject(raw) {
        this.changeCount = 0;
        this.changeQueued = false;
        this.eventListeners = new Array();
        this.objectListener = new Array();
        this.objectState = ObjectState.Clean;
        for (var prop in raw) {
            this[prop] = raw[prop];
        }
        this.objectState = ObjectState.Clean;
    }
    Object.defineProperty(DataObject.prototype, "ObjectState", {
        get: function () {
            return this.objectState;
        },
        set: function (value) {
            var causeChangedEvent = value != this.objectState;
            this.objectState = value;
            if (causeChangedEvent) {
                this.OnObjectStateChanged();
            }
        },
        enumerable: true,
        configurable: true
    });
    DataObject.prototype.AddPropertyListener = function (propertyName, attribute, handler) {
        this.eventListeners.Add(new PropertyListener(propertyName, attribute, handler));
    };
    DataObject.prototype.RemovePropertyListeners = function () {
        this.eventListeners.Remove(function (o) { return true; });
    };
    DataObject.prototype.OnPropertyChanged = function (propertyName) {
        var _this = this;
        var listeners = this.eventListeners.Where(function (l) { return l.PropertyName === propertyName; });
        listeners.forEach(function (l) { return l.Handler(l.Attribute, _this[propertyName]); });
    };
    DataObject.prototype.onPropertyChanged = function (propertyName, canCauseDirty) {
        if (canCauseDirty === void 0) { canCauseDirty = true; }
        this.OnPropertyChanged(propertyName);
        if (canCauseDirty && this.ObjectState != ObjectState.Cleaning) {
            this.ObjectState = ObjectState.Dirty;
        }
    };
    DataObject.prototype.AddObjectStateListener = function (handler) {
        this.objectListener.Add(handler);
    };
    DataObject.prototype.RemoveObjectStateListener = function () {
        this.objectListener.Remove(function (o) { return true; });
    };
    DataObject.prototype.OnObjectStateChanged = function () {
        var _this = this;
        this.objectListener.forEach(function (o) { return o(_this); });
    };
    DataObject.prototype.OnElementChanged = function (value, propertyName) {
        this[propertyName] = value;
        //can we know what the target is here?
        //just by the event?
        //what field are they wanting to update?
    };
    return DataObject;
}());
//# sourceMappingURL=DataObject.js.map