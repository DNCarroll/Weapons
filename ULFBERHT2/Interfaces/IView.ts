interface IView extends IEventDispatcher<IView> {
    ViewUrl: () => string;
    Show: (route: ViewInstance) => void;
    ContainerID: () => string;
    Preload: (view: IView, viewInstance: ViewInstance) => void;
}
interface IBinder extends IEventDispatcher<IBinder> {
    Execute: (element: HTMLElement) => void;
    Dispose: () => void;
}