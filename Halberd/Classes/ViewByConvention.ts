class ViewByConvention implements IView {
    Key: any;
    ViewUrl: string;
    Container: HTMLElement;
    constructor(
        key: any) {
        this.Key = key;
        this.ViewUrl = "/Views/" + key.toString() + ".html";
    }
    Url(route: Route): string {
        return this.Key.toString();
    }
    UrlTitle(route: Route): string {
        return this.Key.toString();
    }
    Loaded(route: Route) {

    }
    Preload() { }
}; 