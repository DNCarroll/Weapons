interface IView {
    ViewUrl: () => string;
    Show: (route: ViewInstance) => void;
    ContainerID: () => string;
    Preload: (view: IView, viewInstance: ViewInstance) => void;
}
