interface IView {
    Key: any;
    Url: (route: Route) => string;
    UrlTitle: (route: Route) => string;
    DocumentTitle: (route: Route) => string;
    Preload: (route: Route) => void;
    Loaded: (route: Route) => void;
    ViewUrl: string;
    Container: HTMLElement;
}
