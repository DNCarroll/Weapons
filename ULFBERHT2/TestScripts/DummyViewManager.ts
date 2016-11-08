class DummyViewManager extends ViewContainer {
    constructor() {
        super();
        this.ViewSegments.push(new DummyContent());
        this.ViewSegments.push(new ViewHeader());
        this.ViewSegments.push(new ViewFooter());
        this.IsDefault = true;
    }
    DocumentTitle(route: ViewInstance) { return "Dummy Content"; }
    Url(route: ViewInstance) { return "DummyView"; }
    UrlPattern() { return "dummypattern|dummy"; }
    UrlTitle(route: ViewInstance) { return "Dummy Page"; }
}
ViewContainers.push(new DummyViewManager());