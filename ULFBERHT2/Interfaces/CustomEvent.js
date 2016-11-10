var EventType;
(function (EventType) {
    EventType[EventType["Completed"] = 0] = "Completed";
    EventType[EventType["Error"] = 1] = "Error";
    EventType[EventType["Aborted"] = 2] = "Aborted";
    EventType[EventType["Message"] = 3] = "Message";
})(EventType || (EventType = {}));
var CustomEventArg = (function () {
    function CustomEventArg(sender, eventType) {
        this.Cancel = false;
        this.Sender = sender;
        this.EventType = eventType;
    }
    return CustomEventArg;
}());
var Listener = (function () {
    function Listener(eventType, eventHandler) {
        this.EventType = eventType;
        this.EventHandler = eventHandler;
    }
    return Listener;
}());
//# sourceMappingURL=CustomEvent.js.map