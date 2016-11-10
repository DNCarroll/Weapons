enum EventType {
    Completed,
    Error,
    Aborted,
    Message
}
interface ICustomEventArg<T> {
    Sender: T;
    EventType: EventType;
    Message: string;
    Cancel: boolean;
}
class CustomEventArg<T> implements ICustomEventArg<T> {
    Sender: T;
    EventType: EventType;
    Cancel: boolean = false;
    Message: string;
    constructor(sender: any, eventType: EventType) {
        this.Sender = sender;
        this.EventType = eventType;
    }
}
interface IEventDispatcher<T> {
    AddListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<T>) => void);
    RemoveListener(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<T>) => void);
    RemoveListeners(eventType: EventType);
    Dispatch(eventType: EventType);
}
class Listener<T> {
    EventType: EventType;
    EventHandler: (eventArg: ICustomEventArg<T>) => void;
    constructor(eventType: EventType, eventHandler: (eventArg: ICustomEventArg<T>) => void) {
        this.EventType = eventType;
        this.EventHandler = eventHandler;
    }
}